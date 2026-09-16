import os
import json
from ai_engine import analyze_exercise_video

def main():
    # Find a sample video in the input_videos directory
    base_dir = os.path.dirname(os.path.dirname(__file__))
    videos_dir = os.path.join(base_dir, "input_videos")
    
    sample_video = None
    if os.path.exists(videos_dir):
        for exercise_folder in os.listdir(videos_dir):
            folder_path = os.path.join(videos_dir, exercise_folder)
            if os.path.isdir(folder_path):
                for file in os.listdir(folder_path):
                    if file.endswith(".mp4"):
                        sample_video = os.path.join(folder_path, file)
                        break
            if sample_video:
                break
                
    if not sample_video:
        print("No sample video found in input_videos/. Please add one to test.")
        return
        
    print(f"Testing analyze_exercise_video on: {sample_video}")
    result = analyze_exercise_video(sample_video)
    
    # We won't print all frames because it's too long, just a summary
    print("\n--- Result Summary ---")
    print(f"Detected Exercise: {result.get('exercise')}")
    print(f"Repetitions: {result.get('repetitions')}")
    print(f"Total Frames Processed: {result.get('total_frames')}")
    print(f"Frames with Pose Detected: {len(result.get('frames', []))}")
    
    if result.get("frames"):
        print("\nSample Frame Data (Frame 1):")
        print(json.dumps(result["frames"][0], indent=2))
        
if __name__ == "__main__":
    main()

