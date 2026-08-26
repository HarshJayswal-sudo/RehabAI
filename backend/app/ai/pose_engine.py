"""
pose_engine.py
--------------
Modern MediaPipe Pose extraction using Google Tasks API with graceful fallbacks.
"""
import os
import base64
import cv2
import numpy as np
from typing import Dict, Any, Optional, Tuple, List

try:
    import mediapipe as mp
    from mediapipe.tasks.python.vision import PoseLandmarker, PoseLandmarkerOptions, RunningMode
    from mediapipe.tasks.python import BaseOptions
    HAS_MEDIAPIPE = True
except Exception:
    HAS_MEDIAPIPE = False

# Key landmark indices in MediaPipe Pose
LM = {
    "nose": 0,
    "l_shoulder": 11, "r_shoulder": 12,
    "l_elbow": 13, "r_elbow": 14,
    "l_wrist": 15, "r_wrist": 16,
    "l_hip": 23, "r_hip": 24,
    "l_knee": 25, "r_knee": 26,
    "l_ankle": 27, "r_ankle": 28,
}

VISIBILITY_THRESHOLD = 0.5


def decode_base64_frame(base64_str: str) -> Optional[np.ndarray]:
    """Decodes a base64 encoded image string (e.g. data:image/jpeg;base64,...) to an OpenCV BGR frame."""
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",", 1)[1]
        image_bytes = base64.b64decode(base64_str)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return frame
    except Exception:
        return None


def calculate_angle(a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float]) -> float:
    """Calculates angle at vertex b formed by points a-b-c in degrees [0, 180]."""
    a_arr, b_arr, c_arr = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c_arr[1] - b_arr[1], c_arr[0] - b_arr[0]) - np.arctan2(a_arr[1] - b_arr[1], a_arr[0] - b_arr[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360.0 - angle
    return round(float(angle), 1)


class PoseExtractor:
    def __init__(self, model_asset_path: Optional[str] = None):
        self.landmarker = None
        self.legacy_pose = None

        if not HAS_MEDIAPIPE:
            return

        # 1. Look for .task model file
        candidate_paths = [
            model_asset_path,
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models", "pose_landmarker_full.task")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "backend", "models", "pose_landmarker_full.task")),
            os.path.abspath("models/pose_landmarker_full.task"),
            os.path.abspath("backend/models/pose_landmarker_full.task"),
        ]

        found_task_path = None
        for p in candidate_paths:
            if p and os.path.exists(p):
                found_task_path = p
                break

        if found_task_path:
            try:
                options = PoseLandmarkerOptions(
                    base_options=BaseOptions(model_asset_path=found_task_path),
                    running_mode=RunningMode.IMAGE,
                    min_pose_detection_confidence=0.5,
                    min_pose_presence_confidence=0.5,
                    min_tracking_confidence=0.5,
                )
                self.landmarker = PoseLandmarker.create_from_options(options)
            except Exception:
                self.landmarker = None

        # 2. Fallback to classic solutions.pose if available
        if not self.landmarker and hasattr(mp, "solutions") and hasattr(mp.solutions, "pose"):
            try:
                self.legacy_pose = mp.solutions.pose.Pose(
                    static_image_mode=False,
                    model_complexity=1,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5,
                )
            except Exception:
                self.legacy_pose = None

    def process_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Processes a BGR image frame and extracts key joint angles and skeleton landmarks.
        """
        if frame is None:
            return {"pose_detected": False, "reason": "empty_frame"}

        # Process with Tasks Landmarker API
        if self.landmarker:
            try:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
                detection_result = self.landmarker.detect(mp_image)

                if not detection_result.pose_landmarks or len(detection_result.pose_landmarks) == 0:
                    return {"pose_detected": False, "reason": "no_person_detected"}

                lm = detection_result.pose_landmarks[0]
                return self._compute_metrics_from_landmarks(lm)
            except Exception as e:
                return {"pose_detected": False, "reason": str(e)}

        # Process with Legacy MediaPipe API
        if self.legacy_pose:
            try:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = self.legacy_pose.process(rgb_frame)
                if not results.pose_landmarks:
                    return {"pose_detected": False, "reason": "no_person_detected"}
                lm = results.pose_landmarks.landmark
                return self._compute_metrics_from_landmarks(lm)
            except Exception as e:
                return {"pose_detected": False, "reason": str(e)}

        return {"pose_detected": False, "reason": "mediapipe_not_initialized"}

    def _compute_metrics_from_landmarks(self, lm: Any) -> Dict[str, Any]:
        def pt(name: str) -> Tuple[float, float]:
            p = lm[LM[name]]
            return (p.x, p.y)

        # Joint angle calculations
        l_knee_angle = calculate_angle(pt("l_hip"), pt("l_knee"), pt("l_ankle"))
        r_knee_angle = calculate_angle(pt("r_hip"), pt("r_knee"), pt("r_ankle"))

        l_elbow_angle = calculate_angle(pt("l_shoulder"), pt("l_elbow"), pt("l_wrist"))
        r_elbow_angle = calculate_angle(pt("r_shoulder"), pt("r_elbow"), pt("r_wrist"))

        l_hip_angle = calculate_angle(pt("l_shoulder"), pt("l_hip"), pt("l_knee"))
        r_hip_angle = calculate_angle(pt("r_shoulder"), pt("r_hip"), pt("r_knee"))

        # Torso angle relative to vertical axis
        mid_shoulder = ((pt("l_shoulder")[0] + pt("r_shoulder")[0]) / 2, (pt("l_shoulder")[1] + pt("r_shoulder")[1]) / 2)
        mid_hip = ((pt("l_hip")[0] + pt("r_hip")[0]) / 2, (pt("l_hip")[1] + pt("r_hip")[1]) / 2)
        dy = mid_hip[1] - mid_shoulder[1]
        dx = mid_hip[0] - mid_shoulder[0]
        torso_angle = round(float(np.degrees(np.arctan2(abs(dx), max(0.0001, abs(dy))))), 1)

        # Symmetry comparison between left and right knee
        diff_knee = abs(l_knee_angle - r_knee_angle)
        knee_symmetry = max(0.0, min(100.0, round(100.0 - diff_knee, 1)))

        # Map snake_case landmark names to camelCase keys for the frontend canvas renderer.
        # Session.jsx accesses landmarks as: lm.leftShoulder, lm.leftKnee, lm.rightHip, etc.
        CAMEL_MAP = {
            "nose":       "nose",
            "l_shoulder": "leftShoulder",
            "r_shoulder": "rightShoulder",
            "l_elbow":    "leftElbow",
            "r_elbow":    "rightElbow",
            "l_wrist":    "leftWrist",
            "r_wrist":    "rightWrist",
            "l_hip":      "leftHip",
            "r_hip":      "rightHip",
            "l_knee":     "leftKnee",
            "r_knee":     "rightKnee",
            "l_ankle":    "leftAnkle",
            "r_ankle":    "rightAnkle",
        }

        landmarks_dict: Dict[str, Any] = {}
        for snake_name, idx in LM.items():
            p = lm[idx]
            vis = getattr(p, "visibility", 1.0)
            camel_name = CAMEL_MAP.get(snake_name, snake_name)
            landmarks_dict[camel_name] = {
                "x": round(float(p.x), 4),
                "y": round(float(p.y), 4),
                "visibility": round(float(vis if vis is not None else 1.0), 2),
            }

        return {
            "pose_detected": True,
            "left_knee_angle": l_knee_angle,
            "right_knee_angle": r_knee_angle,
            "left_elbow_angle": l_elbow_angle,
            "right_elbow_angle": r_elbow_angle,
            "left_hip_angle": l_hip_angle,
            "right_hip_angle": r_hip_angle,
            "torso_angle": torso_angle,
            "symmetry": knee_symmetry,
            "landmarks": landmarks_dict,
        }


    def close(self):
        if self.landmarker and hasattr(self.landmarker, "close"):
            try:
                self.landmarker.close()
            except Exception:
                pass
        if self.legacy_pose and hasattr(self.legacy_pose, "close"):
            try:
                self.legacy_pose.close()
            except Exception:
                pass

