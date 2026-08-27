import base64
import json
import math
import numpy as np
import cv2
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn

from pose_engine import PoseEngine, calculate_angle
from squat import SquatAnalyzer
from leg_extension import LegExtensionAnalyzer
from wall_pushup import WallPushupAnalyzer
from bodyweight_lunge import BodyweightLungeAnalyzer
from windwheel_toe_touch import WindwheelToeTouchAnalyzer

# Map exercises to their analyzers
ANALYZERS = {
    'squat': SquatAnalyzer,
    'leg_extension': LegExtensionAnalyzer,
    'wall_push_up': WallPushupAnalyzer,
    'lunges': BodyweightLungeAnalyzer,
    'wind_will_toe_touch': WindwheelToeTouchAnalyzer,
}

app = FastAPI(title="PhysioAssist API Server")

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def compute_symmetry(left: float, right: float) -> float:
    # Compute symmetry = max(0, 100 - abs(left - right) * (100/20))
    if left is None or right is None:
        return 0.0
    return max(0.0, 100.0 - abs(left - right) * 5.0)

def extract_representative_angle(left: float, right: float, left_vis: float = 1.0, right_vis: float = 1.0, is_flexion: bool = True) -> float:
    if left is None and right is None:
        return 0.0
    if left is None:
        return right
    if right is None:
        return left
        
    # If one side is significantly more visible than the other (e.g. facing sideways), trust that side exclusively!
    if left_vis > right_vis + 0.3:
        return left
    if right_vis > left_vis + 0.3:
        return right
        
    if abs(left - right) <= 20:
        return (left + right) / 2.0
    
    if is_flexion:
        return min(left, right)
    else:
        return max(left, right)

@app.websocket("/ws/session")
async def websocket_session(websocket: WebSocket):
    await websocket.accept()
    
    engine = PoseEngine()
    analyzer = None
    exercise_type = None
    smoothed_target_angle = None
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
            except:
                continue
                
            if msg.get('type') == 'frame':
                ex = msg.get('exercise')
                if not analyzer or ex != exercise_type:
                    exercise_type = ex
                    if ex in ANALYZERS:
                        analyzer = ANALYZERS[ex]()
                        smoothed_target_angle = None # Reset EMA
                    else:
                        await websocket.send_json({"status": "warning", "feedback": f"Unknown exercise: {ex}"})
                        continue

                b64_img = msg.get('image', '')
                if b64_img.startswith('data:image'):
                    b64_img = b64_img.split(',')[1]
                    
                try:
                    img_bytes = base64.b64decode(b64_img)
                    nparr = np.frombuffer(img_bytes, np.uint8)
                    frame_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                except Exception as e:
                    await websocket.send_json({"status": "warning", "feedback": "Failed to decode image"})
                    continue
                
                angles = engine.process_frame(frame_bgr)
                
                if angles is None or not angles.get('confident', False):
                    await websocket.send_json({
                        "rep": analyzer.reps if analyzer else 0,
                        "formScore": 0,
                        "symmetry": 0,
                        "status": "warning",
                        "feedback": "NO PERSON DETECTED",
                        "kneeAngle": 0,
                        "hipAngle": 0,
                        "torsoAngle": 0
                    })
                    continue
                
                # Default angles
                kneeAngle = 0.0
                hipAngle = 0.0
                torsoAngle = angles.get('torso_angle', 0.0)
                symmetry = 100.0
                target_angle = 0.0
                
                l_vis = angles.get('left_visibility', 1.0)
                r_vis = angles.get('right_visibility', 1.0)
                
                if exercise_type == 'squat':
                    left = angles.get('left_knee_angle', 0)
                    right = angles.get('right_knee_angle', 0)
                    target_angle = extract_representative_angle(left, right, l_vis, r_vis, is_flexion=True)
                    symmetry = compute_symmetry(left, right)
                    kneeAngle = target_angle
                    
                elif exercise_type == 'leg_extension':
                    left = angles.get('left_knee_angle', 0)
                    right = angles.get('right_knee_angle', 0)
                    target_angle = extract_representative_angle(left, right, l_vis, r_vis, is_flexion=False)
                    symmetry = compute_symmetry(left, right)
                    kneeAngle = target_angle
                    
                elif exercise_type == 'lunges':
                    left = angles.get('left_knee_angle', 0)
                    right = angles.get('right_knee_angle', 0)
                    target_angle = extract_representative_angle(left, right, l_vis, r_vis, is_flexion=True)
                    symmetry = compute_symmetry(left, right)
                    kneeAngle = target_angle
                    
                elif exercise_type == 'wind_will_toe_touch':
                    left = angles.get('left_hip_angle', 0)
                    right = angles.get('right_hip_angle', 0)
                    target_angle = extract_representative_angle(left, right, l_vis, r_vis, is_flexion=True)
                    symmetry = compute_symmetry(left, right)
                    hipAngle = target_angle
                    
                elif exercise_type == 'wall_push_up':
                    left = angles.get('left_elbow_angle', 0)
                    right = angles.get('right_elbow_angle', 0)
                    target_angle = extract_representative_angle(left, right, l_vis, r_vis, is_flexion=True)
                    symmetry = compute_symmetry(left, right)
                    kneeAngle = target_angle  # Display elbow angle in the kneeAngle field
                    
                # Apply EMA smoothing to the primary tracking angle
                alpha = 0.4
                if 'smoothed_target_angle' not in locals() or smoothed_target_angle is None:
                    smoothed_target_angle = target_angle
                else:
                    smoothed_target_angle = (alpha * target_angle) + ((1 - alpha) * smoothed_target_angle)

                # Send smoothed angle to the analyzer state machine
                if exercise_type == 'squat':
                    analyzer.update(smoothed_target_angle, torsoAngle)
                else:
                    analyzer.update(smoothed_target_angle)
                
                # Compute live metrics from analyzer state
                results = analyzer.get_session_results()
                rep_count = results['repetitions']
                form_score = round(results['average_score']) if rep_count > 0 else 100
                
                # Generate live feedback based on analyzer state
                if rep_count > 0 and results['repetitions_detail']:
                    last_rep = results['repetitions_detail'][-1]
                    feedback = last_rep['feedback']
                else:
                    feedback = "Keep going!"
                
                status = 'good' if form_score >= 80 else 'warning'
                
                response = {
                    "rep": rep_count,
                    "formScore": form_score,
                    "symmetry": round(symmetry, 1),
                    "status": status,
                    "feedback": feedback,
                    "kneeAngle": round(kneeAngle, 1),
                    "hipAngle": round(hipAngle, 1),
                    "torsoAngle": round(torsoAngle, 1),
                    "landmarks": angles.get("landmarks")
                }
                
                await websocket.send_json(response)
                
    except WebSocketDisconnect:
        pass
    finally:
        engine.close()

# In-memory storage for hackathon dashboard updates
from datetime import datetime, timedelta

GLOBAL_SESSIONS = []

@app.get("/api/v1/dashboard/stats")
def get_dashboard_stats():
    return {"totalSessions": 42 + len(GLOBAL_SESSIONS), "totalReps": 850 + sum(s.get('repetitions', 0) for s in GLOBAL_SESSIONS), "avgAccuracy": 94}

@app.get("/api/v1/sessions/recent")
def get_recent_sessions():
    sessions = [
        {"id": 1, "date": "2026-08-20T10:00:00Z", "exercise": "squat", "reps": 15, "score": 95},
        {"id": 2, "date": "2026-08-21T11:30:00Z", "exercise": "leg_extension", "reps": 12, "score": 88}
    ]
    # Add new real sessions dynamically
    for idx, s in enumerate(GLOBAL_SESSIONS):
        sessions.insert(0, {
            "id": 999 + idx, 
            "date": s.get("date"), 
            "exercise": s.get("exercise"), 
            "reps": s.get("repetitions", 0), 
            "score": s.get("average_score", 0)
        })
    return sessions[:5] # Return top 5

@app.get("/api/v1/patients/me/progress")
def get_progress():
    now = datetime.now()
    trends = [
        {"date": (now - timedelta(days=6)).isoformat(), "score": 85},
        {"date": (now - timedelta(days=5)).isoformat(), "score": 88},
        {"date": (now - timedelta(days=4)).isoformat(), "score": 86},
        {"date": (now - timedelta(days=3)).isoformat(), "score": 92},
        {"date": (now - timedelta(days=2)).isoformat(), "score": 89},
        {"date": (now - timedelta(days=1)).isoformat(), "score": 94}
    ]
    
    total_sessions = 24 + len(GLOBAL_SESSIONS)
    current_avg = 95.0
    
    if GLOBAL_SESSIONS:
        for s in GLOBAL_SESSIONS:
            score = s.get("average_score", 0)
            trends.append({"date": s.get("date", now.isoformat()), "score": score})
            current_avg = score
            
    return {
        "patient_id": 1,
        "summary": { "total_sessions": total_sessions, "average_score": current_avg, "improvement": 6.3 },
        "trends": trends
    }

class SessionCreate(BaseModel):
    exercise_id: str

@app.post("/api/v1/sessions")
def create_session(session: SessionCreate):
    return {"id": 999 + len(GLOBAL_SESSIONS)}

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/v1/auth/patient/login")
def login(req: LoginRequest):
    return {
        "access_token": "mock_token_123", "token_type": "bearer",
        "user_id": 1, "role": "patient", "name": "Jane Doe"
    }

class RegisterRequest(BaseModel):
    email: str; password: str; name: str

@app.post("/api/v1/auth/patient/register")
def register(req: RegisterRequest):
    return {"success": True}

@app.get("/api/v1/auth/me")
def auth_me():
    return {"id": 1, "name": "Jane Doe", "role": "patient"}

@app.patch("/api/v1/sessions/{id}/complete")
def complete_session(id: int):
    return {"success": True}

class SessionResult(BaseModel):
    exercise: str
    repetitions: int
    average_score: float
    average_rom: float
    repetitions_detail: list

@app.post("/api/v1/sessions/{id}/results")
def session_results(id: int, result: SessionResult):
    data = result.dict()
    data['date'] = datetime.now().isoformat()
    GLOBAL_SESSIONS.append(data)
    return {"success": True}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
