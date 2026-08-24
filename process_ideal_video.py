"""
process_ideal_video.py  (this is your upgraded batch_process.py)
------------------------------------------------------------------
Reads every "ideal case" video in input_videos/, runs it through
PoseEngine, and writes one JSON file with the per-frame joint angles
for each video. This is the reference data Member 2 will compare
patient sessions against.

Usage:
    1. Drop your ideal-case exercise videos into input_videos/
    2. python process_ideal_video.py
    3. squat_angles.json is created — send that to Member 2.
"""
import cv2
import json
import os
from pose_engine import PoseEngine

INPUT_FOLDER = "input_videos/squat"
OUTPUT_FILE = "squat_angles.json"
EXERCISE_NAME = "squat"  # change per video set if you add other exercises


def process_video(path, engine):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frames = []
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1
        timestamp = round(frame_count / fps, 3)
        angles = engine.process_frame(frame)

        if angles is None:
            frames.append({"frame": frame_count, "timestamp_sec": timestamp, "pose_detected": False})
        else:
            entry = {"frame": frame_count, "timestamp_sec": timestamp, "pose_detected": True}
            entry.update(angles)
            frames.append(entry)

    cap.release()
    return frames, fps


def main():
    if not os.path.exists(INPUT_FOLDER):
        os.makedirs(INPUT_FOLDER)
        print(f"Created folder '{INPUT_FOLDER}'. Drag your ideal-case videos into this folder and run again.")
        return

    video_files = [f for f in os.listdir(INPUT_FOLDER) if f.lower().endswith((".mp4", ".mov", ".avi"))]
    if not video_files:
        print(f"No videos found inside '{INPUT_FOLDER}'. Add your videos and run again.")
        return

    print(f"Processing {len(video_files)} video(s)...")
    engine = PoseEngine()
    results_summary = {}

    for video_name in video_files:
        frames, fps = process_video(os.path.join(INPUT_FOLDER, video_name), engine)
        detected = sum(1 for f in frames if f["pose_detected"])
        results_summary[video_name] = {
            "source_type": "ideal_reference",
            "exercise": EXERCISE_NAME,
            "fps": round(fps, 2),
            "frame_count": len(frames),
            "frames": frames,
        }
        print(f"  {video_name}: {detected}/{len(frames)} frames had a detected pose.")

    engine.close()

    with open(OUTPUT_FILE, "w") as f:
        json.dump(results_summary, f, indent=2)

    print(f"\nSaved all calculated angles to '{OUTPUT_FILE}'. Send this file to Member 2 (and Member 3 for storage).")


if __name__ == "__main__":
    main()
