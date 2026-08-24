import json
from squat import SquatAnalyzer
from leg_extension import LegExtensionAnalyzer
from wall_pushup import WallPushupAnalyzer
from bodyweight_lunge import BodyweightLungeAnalyzer
from windwheel_toe_touch import WindwheelToeTouchAnalyzer

def process_person_1_data(input_json_path, output_json_path, exercise_type):
    try:
        with open(input_json_path, 'r') as file:
            video_data = json.load(file)
    except FileNotFoundError:
        print(f"Error: Could not find '{input_json_path}'. Make sure it is in the same folder!")
        return

    final_database_payload = {}

    for video_filename, frames in video_data.items():
        
        # ROUTER LOGIC: Select the correct analyzer
        if exercise_type == "squat":
            analyzer = SquatAnalyzer()
        elif exercise_type == "leg_extension":
            analyzer = LegExtensionAnalyzer()
        elif exercise_type == "wall_pushup":
            analyzer = WallPushupAnalyzer()
        elif exercise_type == "bodyweight_lunge":
            analyzer = BodyweightLungeAnalyzer()
        elif exercise_type == "windwheel_toe_touch":
            analyzer = WindwheelToeTouchAnalyzer()
        else:
            print(f"Error: Unknown exercise type '{exercise_type}'")
            return
            
        for frame in frames:
            # Check for knees first, then elbows, then hips
            left_angle = frame.get("left_knee_angle", frame.get("left_elbow_angle", frame.get("left_hip_angle", 180.0)))
            right_angle = frame.get("right_knee_angle", frame.get("right_elbow_angle", frame.get("right_hip_angle", 180.0)))
            
            # Reliable angle selection logic
            if abs(left_angle - right_angle) <= 20:
                selected_angle = (left_angle + right_angle) / 2.0
            else:
                selected_angle = min(left_angle, right_angle)
                
            # Feed data into the appropriate analyzer
            if exercise_type == "squat":
                # Pulls the torso angle for the forward-lean form check
                torso_angle = frame.get("torso_angle", 0.0) 
                analyzer.update(selected_angle, torso_angle)
            else:
                analyzer.update(selected_angle) 
                
        video_result = analyzer.get_session_results()
        final_database_payload[video_filename] = video_result
        
        print(f"Processed {video_filename} ({exercise_type}): {video_result['repetitions']} reps found.")

    with open(output_json_path, 'w') as outfile:
        json.dump(final_database_payload, outfile, indent=4)
        
    print(f"Successfully generated payload at: {output_json_path}\n")

if __name__ == "__main__":
    
    # 1. Process Squats
    process_person_1_data(
        input_json_path="squat_angles.json", 
        output_json_path="person_3_squat_results.json", 
        exercise_type="squat"
    )
    
    # 2. Process Leg Extensions
    process_person_1_data(
        input_json_path="leg_extension_angles.json", 
        output_json_path="person_3_extension_results.json", 
        exercise_type="leg_extension"
    )
    
    # 3. Process Wall Push-ups
    process_person_1_data(
        input_json_path="wall_push_up_angles.json", 
        output_json_path="person_3_wall_pushup_results.json", 
        exercise_type="wall_pushup"
    )

    # 4. Process Bodyweight Lunges
    process_person_1_data(
        input_json_path="lunges_angles.json", 
        output_json_path="person_3_lunge_results.json", 
        exercise_type="bodyweight_lunge"
    )

    # 5. Process Windwheel Toe Touches
    process_person_1_data(
        input_json_path="wind_will_toe_touch_angles.json", 
        output_json_path="person_3_windwheel_results.json", 
        exercise_type="windwheel_toe_touch"
    )