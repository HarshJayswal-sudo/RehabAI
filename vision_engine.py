import cv2
import mediapipe as mp
import numpy as np

class PoseEngine:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    def calculate_angle(self, a, b, c):
        a, b, c = np.array(a), np.array(b), np.array(c)
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        return round(float(360.0 - angle if angle > 180.0 else angle), 2)

    def process_frame(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_frame)
        
        if not results.pose_landmarks:
            return None, frame

        lm = results.pose_landmarks.landmark
        
        # Extract Hip (23/24), Knee (25/26), Ankle (27/28)
        left_knee = self.calculate_angle([lm[23].x, lm[23].y], [lm[25].x, lm[25].y], [lm[27].x, lm[27].y])
        right_knee = self.calculate_angle([lm[24].x, lm[24].y], [lm[26].x, lm[26].y], [lm[28].x, lm[28].y])
        
        frame_data = {
            "left_knee_angle": left_knee,
            "right_knee_angle": right_knee
        }
        
        return frame_data, frame

# Live Testing Block
if __name__ == "__main__":
    engine = PoseEngine()
    cap = cv2.VideoCapture(0)
    
    print("Live processing active. Press 'q' to quit.")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        data, processed_frame = engine.process_frame(frame)
        
        if data:
            print(f"Live Angles -> L: {data['left_knee_angle']} | R: {data['right_knee_angle']}")
            
        cv2.imshow('Live Rehab Engine', processed_frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()