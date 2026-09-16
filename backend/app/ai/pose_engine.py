"""
pose_engine.py
--------------
Modern YOLOv8-Pose extraction with graceful fallbacks.
"""
import os
import base64
import cv2
import numpy as np
import torch
from typing import Dict, Any, Optional, Tuple, List
from ultralytics import YOLO

# YOLOv8-Pose COCO-17 keypoints
LM = {
    "nose": 0,
    "l_shoulder": 5, "r_shoulder": 6,
    "l_elbow": 7, "r_elbow": 8,
    "l_wrist": 9, "r_wrist": 10,
    "l_hip": 11, "r_hip": 12,
    "l_knee": 13, "r_knee": 14,
    "l_ankle": 15, "r_ankle": 16,
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
        self.device = "cpu"
        self.model = YOLO("yolov8n-pose.pt")

    def process_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Processes a BGR image frame and extracts key joint angles and skeleton landmarks.
        """
        if frame is None:
            return {"pose_detected": False, "reason": "empty_frame"}

        try:
            results = self.model(frame, device=self.device, verbose=False)
            if not results or len(results[0].keypoints) == 0:
                return {"pose_detected": False, "reason": "no_person_detected"}
                
            keypoints = results[0].keypoints
            if keypoints.xy is None or len(keypoints.xy) == 0 or keypoints.xy.numel() == 0:
                return {"pose_detected": False, "reason": "no_person_detected"}
                
            kp = keypoints.xy[0].cpu().numpy()
            conf = keypoints.conf[0].cpu().numpy()
            h, w = frame.shape[:2]

            return self._compute_metrics_from_landmarks(kp, conf, h, w)
        except Exception as e:
            return {"pose_detected": False, "reason": str(e)}

    def _compute_metrics_from_landmarks(self, kp: np.ndarray, conf: np.ndarray, h: int, w: int) -> Dict[str, Any]:
        def pt(name: str) -> Tuple[float, float]:
            p = kp[LM[name]]
            return (float(p[0]), float(p[1]))

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
            p = kp[idx]
            vis = conf[idx]
            camel_name = CAMEL_MAP.get(snake_name, snake_name)
            landmarks_dict[camel_name] = {
                "x": round(float(p[0] / w), 4) if w > 0 else 0.0,
                "y": round(float(p[1] / h), 4) if h > 0 else 0.0,
                "visibility": round(float(vis), 2),
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
        pass

