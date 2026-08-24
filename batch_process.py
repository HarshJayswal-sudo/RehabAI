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
               
                # Extract all necessary landmarks
                l_shoulder = [landmarks[11].x, landmarks[11].y]
                r_shoulder = [landmarks[12].x, landmarks[12].y]
                l_elbow    = [landmarks[13].x, landmarks[13].y]
                r_elbow    = [landmarks[14].x, landmarks[14].y]
                l_wrist    = [landmarks[15].x, landmarks[15].y]
                r_wrist    = [landmarks[16].x, landmarks[16].y]
                l_hip      = [landmarks[23].x, landmarks[23].y]
                r_hip      = [landmarks[24].x, landmarks[24].y]
                l_knee     = [landmarks[25].x, landmarks[25].y]
                r_knee     = [landmarks[26].x, landmarks[26].y]
                l_ankle    = [landmarks[27].x, landmarks[27].y]
                r_ankle    = [landmarks[28].x, landmarks[28].y]

                l_up = [l_hip[0], l_hip[1] - 1]
                r_up = [r_hip[0], r_hip[1] - 1]

                frame_dict = {"frame": frame_count}

                # Format output keys based on exercise type
                clean_name = exercise_name.lower().replace(" ", "_")

                if clean_name == "wall_push_up":
                    frame_dict["left_elbow_angle"] = calculate_angle(l_shoulder, l_elbow, l_wrist)
                    frame_dict["right_elbow_angle"] = calculate_angle(r_shoulder, r_elbow, r_wrist)

                elif clean_name == "wind_will_toe_touch":
                    frame_dict["left_hip_angle"] = calculate_angle(l_shoulder, l_hip, l_knee)
                    frame_dict["right_hip_angle"] = calculate_angle(r_shoulder, r_hip, r_knee)

                elif clean_name == "squat":
                    frame_dict["left_knee_angle"] = calculate_angle(l_hip, l_knee, l_ankle)
                    frame_dict["right_knee_angle"] = calculate_angle(r_hip, r_knee, r_ankle)
                    frame_dict["torso_angle"] = round((calculate_angle(l_shoulder, l_hip, l_up) + calculate_angle(r_shoulder, r_hip, r_up)) / 2, 2)

                elif clean_name in ["lunges", "leg_extension"]:
                    frame_dict["left_knee_angle"] = calculate_angle(l_hip, l_knee, l_ankle)
                    frame_dict["right_knee_angle"] = calculate_angle(r_hip, r_knee, r_ankle)

                frame_data.append(frame_dict)
 
        
        cap.release()
        results_summary[video_name] = frame_data
        print(f"Finished {video_name} ({frame_count} frames).")

    # Save the JSON file for this specific exercise
    with open(output_file, "w") as f:
        json.dump(results_summary, f, indent=2)
    
    print(f"Saved all calculated angles for {exercise_name} to '{output_file}'.\n")