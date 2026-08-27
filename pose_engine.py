"""
pose_engine.py
--------------
Shared MediaPipe-based pose engine for the AI Rehab project.

Both process_ideal_video.py (offline "ideal case" videos) and
capture_patient_session.py (live webcam) import this file so the exact
same math produces both data sets. If you ever add, fix, or tweak an
angle, do it here ONCE — not separately in two scripts. That matters
because Member 2 is going to compare "ideal" vs "patient" numbers
directly; if the two sides were computed with slightly different code,
the comparison would be comparing apples to oranges.
"""
import cv2
import mediapipe as mp
import numpy as np
import os

# MediaPipe Pose landmark indices we use (both sides of the body)
LM = {
    "l_shoulder": 11, "r_shoulder": 12,
    "l_elbow": 13, "r_elbow": 14,
    "l_wrist": 15, "r_wrist": 16,
    "l_hip": 23, "r_hip": 24,
    "l_knee": 25, "r_knee": 26,
    "l_ankle": 27, "r_ankle": 28,
}

# Below this visibility score, MediaPipe itself is not confident the
# landmark is really there (occluded, out of frame, etc). We don't
# throw the frame away — we just flag it, so Member 2 can decide
# whether to trust it.
VISIBILITY_THRESHOLD = 0.5


def calculate_angle(a, b, c):
    """Angle at vertex b, formed by points a-b-c, using true 3D geometry."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    
    ba = a - b
    bc = c - b
    
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    angle = np.arccos(cosine_angle) * 180.0 / np.pi
    
    return round(float(angle), 2)


import time

class PoseEngine:
    def __init__(self, static_image_mode=False, model_complexity=1,
                 min_detection_confidence=0.5, min_tracking_confidence=0.5):

        self.mp = mp
        self.vision = mp.tasks.vision
        
        # We need the local model file
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'pose_landmarker_full.task')
        
        base_options = mp.tasks.BaseOptions(model_asset_path=model_path)
        # Use VIDEO mode for temporal smoothing and better accuracy
        options = self.vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=self.vision.RunningMode.VIDEO,
            num_poses=1,
            min_pose_detection_confidence=min_detection_confidence,
            min_pose_presence_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        
        self.landmarker = self.vision.PoseLandmarker.create_from_options(options)
        self.start_time = time.time()

    def close(self):
        self.landmarker.close()

    def _angles_from_landmarks(self, lm, world_lm):
        """All the angle math, in one place. lm = list of NormalizedLandmark, world_lm = list of Landmark (meters)"""

        # For 3D Angle Calculation (immune to perspective distortion)
        def pt3d(name):
            p = world_lm[LM[name]]
            return [p.x, p.y, p.z]

        # For 2D Visibility and UI drawing
        def vis(name):
            p = lm[LM[name]]
            return getattr(p, 'presence_confidence', getattr(p, 'visibility', 1.0))

        l_sh, r_sh = pt3d("l_shoulder"), pt3d("r_shoulder")
        l_elbow, r_elbow = pt3d("l_elbow"), pt3d("r_elbow")
        l_wrist, r_wrist = pt3d("l_wrist"), pt3d("r_wrist")
        l_hip, r_hip = pt3d("l_hip"), pt3d("r_hip")
        l_knee, r_knee = pt3d("l_knee"), pt3d("r_knee")
        l_ankle, r_ankle = pt3d("l_ankle"), pt3d("r_ankle")
        
        v_l_sh, v_r_sh = vis("l_shoulder"), vis("r_shoulder")
        v_l_hip, v_r_hip = vis("l_hip"), vis("r_hip")
        v_l_knee, v_r_knee = vis("l_knee"), vis("r_knee")

        # Virtual point directly above each hip, used only to measure
        # how far the torso leans away from vertical in 3D space.
        l_up = [l_hip[0], l_hip[1] - 1.0, l_hip[2]]
        r_up = [r_hip[0], r_hip[1] - 1.0, r_hip[2]]

        angles = {
            "left_knee_angle": calculate_angle(l_hip, l_knee, l_ankle),
            "right_knee_angle": calculate_angle(r_hip, r_knee, r_ankle),
            "left_hip_angle": calculate_angle(l_sh, l_hip, l_knee),
            "right_hip_angle": calculate_angle(r_sh, r_hip, r_knee),
            "left_elbow_angle": calculate_angle(l_sh, l_elbow, l_wrist),
            "right_elbow_angle": calculate_angle(r_sh, r_elbow, r_wrist),
            "left_torso_lean_deg": calculate_angle(l_sh, l_hip, l_up),
            "right_torso_lean_deg": calculate_angle(r_sh, r_hip, r_up),
             "torso_angle": round((calculate_angle(l_sh, l_hip, l_up) + calculate_angle(r_sh, r_hip, r_up)) / 2, 2),
             "left_visibility": min(v_l_sh, v_l_hip, v_l_knee),
             "right_visibility": min(v_r_sh, v_r_hip, v_r_knee)
        }

        # ONLY check core torso for visibility so 'NO PERSON DETECTED' isn't triggered if ankles are out of frame.
        # Also, use max(left_side, right_side) so that sideways-facing poses aren't dropped!
        vis_left = min(v_l_sh, v_l_hip)
        vis_right = min(v_r_sh, v_r_hip)
        best_side_visibility = max(vis_left, vis_right)
        
        angles["confident"] = bool(best_side_visibility >= 0.2)
        angles["min_landmark_visibility"] = round(float(best_side_visibility), 3)
        
        # Add frontend-compatible landmarks (x, y normalized 0.0 to 1.0)
        angles["landmarks"] = {
            "nose": {"x": lm[0].x, "y": lm[0].y},
            "leftShoulder": {"x": lm[11].x, "y": lm[11].y},
            "rightShoulder": {"x": lm[12].x, "y": lm[12].y},
            "leftElbow": {"x": lm[13].x, "y": lm[13].y},
            "rightElbow": {"x": lm[14].x, "y": lm[14].y},
            "leftWrist": {"x": lm[15].x, "y": lm[15].y},
            "rightWrist": {"x": lm[16].x, "y": lm[16].y},
            "leftHip": {"x": lm[23].x, "y": lm[23].y},
            "rightHip": {"x": lm[24].x, "y": lm[24].y},
            "leftKnee": {"x": lm[25].x, "y": lm[25].y},
            "rightKnee": {"x": lm[26].x, "y": lm[26].y},
            "leftAnkle": {"x": lm[27].x, "y": lm[27].y},
            "rightAnkle": {"x": lm[28].x, "y": lm[28].y}
        }
        
        return angles

    def process_frame(self, frame_bgr):
        """
        Run pose detection on one BGR frame.
        """
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        mp_image = self.mp.Image(image_format=self.mp.ImageFormat.SRGB, data=rgb)
        
        timestamp_ms = int((time.time() - self.start_time) * 1000)
        # Ensure timestamp always increases even if called really fast
        if not hasattr(self, 'last_timestamp'):
            self.last_timestamp = -1
        if timestamp_ms <= self.last_timestamp:
            timestamp_ms = self.last_timestamp + 1
        self.last_timestamp = timestamp_ms

        results = self.landmarker.detect_for_video(mp_image, timestamp_ms)
        if not results.pose_landmarks or not results.pose_world_landmarks:
            return None
        return self._angles_from_landmarks(results.pose_landmarks[0], results.pose_world_landmarks[0])

    def process_frame_with_overlay(self, frame_bgr):
        """
        Same as process_frame, but also draws the skeleton + live knee
        angle labels directly onto frame_bgr (in place) — this is the
        "AR-style" overlay for the live webcam preview. Returns the same
        angles dict as process_frame (or None).
        """
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb)
        if not results.pose_landmarks or not results.pose_world_landmarks:
            return None

        lm = results.pose_landmarks.landmark
        world_lm = results.pose_world_landmarks.landmark
        angles = self._angles_from_landmarks(lm, world_lm)

        self.mp_drawing.draw_landmarks(
            frame_bgr, results.pose_landmarks, self.mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style(),
        )

        h, w = frame_bgr.shape[:2]
        for name, key, color in [("l_knee", "left_knee_angle", (60, 220, 60)),
                                  ("r_knee", "right_knee_angle", (60, 160, 255))]:
            p = lm[LM[name]]
            x, y = int(p.x * w), int(p.y * h)
            cv2.putText(frame_bgr, f"{angles[key]:.0f}", (x + 10, y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2, cv2.LINE_AA)

        return angles


