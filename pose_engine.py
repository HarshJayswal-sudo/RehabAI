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
    """Angle at vertex b, formed by points a-b-c, in degrees (0-180)."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360.0 - angle
    return round(float(angle), 2)


class PoseEngine:
    def __init__(self, static_image_mode=False, model_complexity=1,
                 min_detection_confidence=0.5, min_tracking_confidence=0.5):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        self.pose = self.mp_pose.Pose(
            static_image_mode=static_image_mode,
            model_complexity=model_complexity,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )

    def _angles_from_landmarks(self, lm):
        """All the angle math, in one place. lm = results.pose_landmarks.landmark"""

        def pt(name):
            p = lm[LM[name]]
            return [p.x, p.y], p.visibility

        (l_sh, v_l_sh), (r_sh, v_r_sh) = pt("l_shoulder"), pt("r_shoulder")
        (l_elbow, v_l_elbow), (r_elbow, v_r_elbow) = pt("l_elbow"), pt("r_elbow")
        (l_wrist, v_l_wrist), (r_wrist, v_r_wrist) = pt("l_wrist"), pt("r_wrist")
        (l_hip, v_l_hip), (r_hip, v_r_hip) = pt("l_hip"), pt("r_hip")
        (l_knee, v_l_knee), (r_knee, v_r_knee) = pt("l_knee"), pt("r_knee")
        (l_ankle, v_l_ankle), (r_ankle, v_r_ankle) = pt("l_ankle"), pt("r_ankle")

        # Virtual point directly above each hip, used only to measure
        # how far the torso leans away from vertical.
        l_up = [l_hip[0], l_hip[1] - 1]
        r_up = [r_hip[0], r_hip[1] - 1]

        angles = {
            "left_knee_angle": calculate_angle(l_hip, l_knee, l_ankle),
            "right_knee_angle": calculate_angle(r_hip, r_knee, r_ankle),
            "left_hip_angle": calculate_angle(l_sh, l_hip, l_knee),
            "right_hip_angle": calculate_angle(r_sh, r_hip, r_knee),
            "left_elbow_angle": calculate_angle(l_sh, l_elbow, l_wrist),
            "right_elbow_angle": calculate_angle(r_sh, r_elbow, r_wrist),
            "left_torso_lean_deg": calculate_angle(l_sh, l_hip, l_up),
            "right_torso_lean_deg": calculate_angle(r_sh, r_hip, r_up),
             "torso_angle": round((calculate_angle(l_sh, l_hip, l_up) + calculate_angle(r_sh, r_hip, r_up)) / 2, 2)
        }

        min_visibility = min(v_l_sh, v_r_sh, v_l_hip, v_r_hip,
                              v_l_knee, v_r_knee, v_l_ankle, v_r_ankle)
        angles["confident"] = bool(min_visibility >= VISIBILITY_THRESHOLD)
        angles["min_landmark_visibility"] = round(float(min_visibility), 3)
        return angles

    def process_frame(self, frame_bgr):
        """
        Run pose detection on one BGR frame (as read by cv2.VideoCapture).
        Returns None if no person was detected, otherwise a dict of joint
        angles plus a confidence flag. Use this for offline/batch work —
        it does no drawing, so it's the faster path.
        """
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb)
        if not results.pose_landmarks:
            return None
        return self._angles_from_landmarks(results.pose_landmarks.landmark)

    def process_frame_with_overlay(self, frame_bgr):
        """
        Same as process_frame, but also draws the skeleton + live knee
        angle labels directly onto frame_bgr (in place) — this is the
        "AR-style" overlay for the live webcam preview. Returns the same
        angles dict as process_frame (or None).
        """
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb)
        if not results.pose_landmarks:
            return None

        lm = results.pose_landmarks.landmark
        angles = self._angles_from_landmarks(lm)

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

    def close(self):
        self.pose.close()
