"""
capture_patient_session.py  (this is your upgraded vision_engine.py)
------------------------------------------------------------------
Opens your webcam, runs every frame through the same PoseEngine used
on the ideal videos, shows a live preview with the current knee
angles, and — this was the missing piece — SAVES the whole session to
a JSON file in patient_sessions/ when you press 'q'. That JSON is
what gets sent to Member 2 alongside squat_angles.json.

Run this on your own machine (needs a real webcam):
    python capture_patient_session.py
"""
import cv2
import json
import os
import time
from datetime import datetime, timezone
from pose_engine import PoseEngine

EXERCISE_NAME = "squat"
OUTPUT_FOLDER = "patient_sessions"


def run_session(camera_index=0):
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    engine = PoseEngine()
    cap = cv2.VideoCapture(camera_index)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    frames = []
    frame_count = 0
    start_time = time.time()

    print("Live processing active. Press 'q' to stop and save the session.")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1
        timestamp = round(time.time() - start_time, 3)
        angles = engine.process_frame_with_overlay(frame)  # draws skeleton + angle labels onto `frame`

        if angles:
            entry = {"frame": frame_count, "timestamp_sec": timestamp, "pose_detected": True}
            entry.update(angles)
            print(f"Live -> L knee: {angles['left_knee_angle']}  R knee: {angles['right_knee_angle']}")
        else:
            entry = {"frame": frame_count, "timestamp_sec": timestamp, "pose_detected": False}

        frames.append(entry)

        cv2.imshow("Live Rehab Engine", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    engine.close()

    session_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    output_path = os.path.join(OUTPUT_FOLDER, f"session_{session_id}.json")

    session_data = {
        "source_type": "patient_session",
        "exercise": EXERCISE_NAME,
        "recorded_at": session_id,
        "fps": round(fps, 2),
        "frame_count": len(frames),
        "frames": frames,
    }

    with open(output_path, "w") as f:
        json.dump(session_data, f, indent=2)

    print(f"\nSaved session to '{output_path}'. Send this file to Member 2 (and Member 3 for storage).")


if __name__ == "__main__":
    run_session()
