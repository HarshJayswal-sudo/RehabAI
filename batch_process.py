import cv2
import mediapipe as mp
import numpy as np
import json
import os

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5)

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360.0 - angle
    return round(float(angle), 2)

base_input_folder = "input_videos"

if not os.path.exists(base_input_folder):
    print(f"Error: Base directory '{base_input_folder}' not found. Create it and add exercise folders.")
    exit()

# Loop through every exercise subfolder
for exercise_name in os.listdir(base_input_folder):
    exercise_dir = os.path.join(base_input_folder, exercise_name)
    
    
    if not os.path.isdir(exercise_dir):
        continue
        
    
    output_file = f"{exercise_name.replace(' ', '_')}_angles.json"
    results_summary = {}

    
    video_files = [f for f in os.listdir(exercise_dir) if f.lower().endswith(('.mp4', '.mov', '.avi'))]

    if not video_files:
        print(f"No videos found inside '{exercise_dir}'. Skipping.")
        continue

    print(f"Processing {len(video_files)} video(s) for '{exercise_name}'...")

    for video_name in video_files:
        video_path = os.path.join(exercise_dir, video_name)
        cap = cv2.VideoCapture(video_path)
        frame_data = []
        frame_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(rgb_frame)

            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                
                # WARNING: These are the landmarks for legs. 
                # This logic is useless for wall push-ups.
               

        l_hip = [landmarks[23].x, landmarks[23].y]
        l_knee = [landmarks[25].x, landmarks[25].y]
        l_ankle = [landmarks[27].x, landmarks[27].y]
        r_hip = [landmarks[24].x, landmarks[24].y]
        r_knee = [landmarks[26].x, landmarks[26].y]
        r_ankle = [landmarks[28].x, landmarks[28].y]

        # Define torso variables BEFORE the append block
        l_sh = [landmarks[11].x, landmarks[11].y]
        r_sh = [landmarks[12].x, landmarks[12].y]
        l_up = [l_hip[0], l_hip[1] - 1]
        r_up = [r_hip[0], r_hip[1] - 1]

        # Append all angles at once
        frame_data.append({
            "frame": frame_count,
            "left_knee_angle": calculate_angle(l_hip, l_knee, l_ankle),
            "right_knee_angle": calculate_angle(r_hip, r_knee, r_ankle),
            "torso_angle": round((calculate_angle(l_sh, l_hip, l_up) + calculate_angle(r_sh, r_hip, r_up)) / 2, 2)
        })
        cap.release()
        results_summary[video_name] = frame_data
        print(f"Finished {video_name} ({frame_count} frames).")

    # Save the JSON file for this specific exercise
    with open(output_file, "w") as f:
        json.dump(results_summary, f, indent=2)
    
    print(f"Saved all calculated angles for {exercise_name} to '{output_file}'.\n")