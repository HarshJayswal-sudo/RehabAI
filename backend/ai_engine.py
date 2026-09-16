import cv2
import numpy as np
import torch
import os
from ultralytics import YOLO

# Try to use MPS (Apple Silicon GPU), fallback to CPU
device = "mps" if torch.backends.mps.is_available() else "cpu"

# Load the model globally so it's not re-loaded on every function call
# Assuming yolov8n-pose.pt is at the project root relative to backend
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "yolov8n-pose.pt")
# Fallback if not found at root
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "yolov8n-pose.pt"
    
try:
    model = YOLO(MODEL_PATH)
except Exception:
    # If the file doesn't exist, YOLO will auto-download it
    model = YOLO("yolov8n-pose.pt")

def calculate_angle(a, b, c):
    """Calculates 2D planar angle at vertex b formed by points a-b-c in degrees."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360.0 - angle
    return round(float(angle), 2)

def detect_exercise_type(video_path: str) -> str:
    """Infers the exercise type from the video path."""
    clean_path = video_path.lower()
    if "squat" in clean_path:
        return "squat"
    if "wall_push_up" in clean_path or "wall push up" in clean_path or "wall_pushup" in clean_path:
        return "wall_pushup"
    if "lunge" in clean_path:
        return "lunges"
    if "leg_extension" in clean_path or "leg extension" in clean_path:
        return "leg_extension"
    if "wind_will_toe_touch" in clean_path or "windwheel" in clean_path:
        return "windwheel_toe_touch"
    return "unknown"

def count_repetitions(angles: list, threshold: float = 120.0, direction: str = "down") -> int:
    """
    Basic peak counting algorithm.
    direction="down" means the angle must go below the threshold to count as a rep (e.g. squat).
    direction="up" means the angle must go above the threshold to count as a rep.
    """
    reps = 0
    in_rep = False
    
    for angle in angles:
        if direction == "down":
            if angle < threshold and not in_rep:
                in_rep = True
            elif angle > (threshold + 20) and in_rep:
                reps += 1
                in_rep = False
        else: # "up"
            if angle > threshold and not in_rep:
                in_rep = True
            elif angle < (threshold - 20) and in_rep:
                reps += 1
                in_rep = False
                
    return reps

def analyze_exercise_video(video_path: str) -> dict:
    """
    Processes an exercise video using YOLOv8-Pose and returns a structured dictionary
    containing the exercise type, repetition count, key joint coordinates, and calculated angles.
    """
    if not os.path.exists(video_path):
        return {"error": f"Video not found: {video_path}"}
        
    exercise_type = detect_exercise_type(video_path)
    cap = cv2.VideoCapture(video_path)
    
    frame_data = []
    frame_count = 0
    
    # Track the primary angle for repetition counting
    primary_angles = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        results = model(frame, device=device, verbose=False)
        
        if results and len(results[0].keypoints) > 0 and results[0].keypoints.xy.numel() > 0:
            kp = results[0].keypoints.xy[0].cpu().numpy()
            
            # YOLOv8-Pose COCO-17 Keypoints
            l_shoulder = [float(kp[5][0]), float(kp[5][1])]
            r_shoulder = [float(kp[6][0]), float(kp[6][1])]
            l_elbow    = [float(kp[7][0]), float(kp[7][1])]
            r_elbow    = [float(kp[8][0]), float(kp[8][1])]
            l_wrist    = [float(kp[9][0]), float(kp[9][1])]
            r_wrist    = [float(kp[10][0]), float(kp[10][1])]
            l_hip      = [float(kp[11][0]), float(kp[11][1])]
            r_hip      = [float(kp[12][0]), float(kp[12][1])]
            l_knee     = [float(kp[13][0]), float(kp[13][1])]
            r_knee     = [float(kp[14][0]), float(kp[14][1])]
            l_ankle    = [float(kp[15][0]), float(kp[15][1])]
            r_ankle    = [float(kp[16][0]), float(kp[16][1])]

            l_up = [l_hip[0], l_hip[1] - 100.0]
            r_up = [r_hip[0], r_hip[1] - 100.0]

            frame_dict = {
                "frame": frame_count,
                "keypoints": {
                    "left_shoulder": l_shoulder,
                    "right_shoulder": r_shoulder,
                    "left_elbow": l_elbow,
                    "right_elbow": r_elbow,
                    "left_wrist": l_wrist,
                    "right_wrist": r_wrist,
                    "left_hip": l_hip,
                    "right_hip": r_hip,
                    "left_knee": l_knee,
                    "right_knee": r_knee,
                    "left_ankle": l_ankle,
                    "right_ankle": r_ankle
                }
            }

            # Calculate angles based on the detected exercise type
            primary_angle = None
            if exercise_type == "wall_pushup":
                l_elbow_ang = calculate_angle(l_shoulder, l_elbow, l_wrist)
                r_elbow_ang = calculate_angle(r_shoulder, r_elbow, r_wrist)
                frame_dict["left_elbow_angle"] = l_elbow_ang
                frame_dict["right_elbow_angle"] = r_elbow_ang
                primary_angle = (l_elbow_ang + r_elbow_ang) / 2.0
                
            elif exercise_type == "windwheel_toe_touch":
                frame_dict["left_hip_angle"] = calculate_angle(l_shoulder, l_hip, l_knee)
                frame_dict["right_hip_angle"] = calculate_angle(r_shoulder, r_hip, r_knee)
                # Primary angle could be torso or hip bending
                primary_angle = frame_dict["left_hip_angle"]
                
            elif exercise_type == "squat":
                l_knee_ang = calculate_angle(l_hip, l_knee, l_ankle)
                r_knee_ang = calculate_angle(r_hip, r_knee, r_ankle)
                frame_dict["left_knee_angle"] = l_knee_ang
                frame_dict["right_knee_angle"] = r_knee_ang
                frame_dict["torso_angle"] = round((calculate_angle(l_shoulder, l_hip, l_up) + calculate_angle(r_shoulder, r_hip, r_up)) / 2, 2)
                primary_angle = (l_knee_ang + r_knee_ang) / 2.0
                
            elif exercise_type in ["lunges", "leg_extension"]:
                l_knee_ang = calculate_angle(l_hip, l_knee, l_ankle)
                r_knee_ang = calculate_angle(r_hip, r_knee, r_ankle)
                frame_dict["left_knee_angle"] = l_knee_ang
                frame_dict["right_knee_angle"] = r_knee_ang
                primary_angle = (l_knee_ang + r_knee_ang) / 2.0

            if primary_angle is not None:
                primary_angles.append(primary_angle)

            frame_data.append(frame_dict)
            
    cap.release()
    
    # Calculate repetitions
    repetitions = 0
    if exercise_type in ["squat", "lunges", "wall_pushup"]:
        repetitions = count_repetitions(primary_angles, threshold=120.0, direction="down")
    elif exercise_type == "leg_extension":
        repetitions = count_repetitions(primary_angles, threshold=150.0, direction="up")

    return {
        "exercise": exercise_type,
        "repetitions": repetitions,
        "total_frames": frame_count,
        "frames": frame_data
    }

