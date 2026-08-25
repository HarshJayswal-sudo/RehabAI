"""
websocket.py
------------
FastAPI WebSocket endpoint for live camera frame ingestion and real-time AI exercise feedback.
"""
import json
import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.ai.pose_engine import PoseExtractor, decode_base64_frame
from app.ai.analyzers import get_analyzer, BaseLiveAnalyzer

logger = logging.getLogger("rehab_ai.websocket")
router = APIRouter(tags=["Live AI WebSocket"])


@router.websocket("/ws/session")
@router.websocket("/ws/session/{exercise_code}")
async def websocket_session_endpoint(websocket: WebSocket, exercise_code: Optional[str] = "squat"):
    """
    Real-time bidirectional WebSocket connection.
    Ingests video frames (base64) at ~15 FPS, processes via MediaPipe Pose & Analyzers,
    and returns live form evaluation metrics and voice cues.
    """
    await websocket.accept()
    pose_extractor = PoseExtractor()
    analyzer: BaseLiveAnalyzer = get_analyzer(exercise_code)
    current_exercise = exercise_code or "squat"

    try:
        while True:
            text_data = await websocket.receive_text()
            if not text_data:
                continue

            try:
                payload = json.loads(text_data)
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON format"})
                continue

            msg_type = payload.get("type", "frame")

            # 1. Handle exercise switch
            requested_exercise = payload.get("exercise")
            if requested_exercise and requested_exercise != current_exercise:
                current_exercise = requested_exercise
                analyzer = get_analyzer(current_exercise)

            # 2. Handle reset
            if msg_type == "reset":
                analyzer = get_analyzer(current_exercise)
                await websocket.send_json({
                    "status": "reset",
                    "feedback": "Session reset. Ready to begin.",
                    "rep": 0,
                    "formScore": 100,
                    "symmetry": 100,
                    "kneeAngle": 180,
                    "hipAngle": 180,
                })
                continue

            # 3. Handle session finish
            if msg_type == "finish":
                summary = analyzer.get_session_results()
                await websocket.send_json({
                    "type": "summary",
                    "results": summary,
                })
                continue

            # 4. Handle video frame
            if msg_type == "frame":
                image_data = payload.get("image")
                if not image_data:
                    await websocket.send_json({
                        "rep": analyzer.reps,
                        "formScore": 100,
                        "symmetry": 100,
                        "status": "warning",
                        "feedback": "No image data received",
                        "kneeAngle": 180,
                        "hipAngle": 180,
                    })
                    continue

                frame = decode_base64_frame(image_data)
                if frame is None:
                    await websocket.send_json({
                        "rep": analyzer.reps,
                        "formScore": 100,
                        "symmetry": 100,
                        "status": "warning",
                        "feedback": "Could not decode camera frame",
                        "kneeAngle": 180,
                        "hipAngle": 180,
                    })
                    continue

                # Run pose detection
                pose_data = pose_extractor.process_frame(frame)

                if not pose_data.get("pose_detected", False):
                    await websocket.send_json({
                        "rep": analyzer.reps,
                        "formScore": 100,
                        "symmetry": 100,
                        "status": "warning",
                        "feedback": "Stand in clear view of the camera",
                        "kneeAngle": 180,
                        "hipAngle": 180,
                        "landmarks": [],
                    })
                    continue

                # Update active analyzer
                metrics = analyzer.update(pose_data)
                metrics["landmarks"] = pose_data.get("landmarks", [])

                # Stream response back to client
                await websocket.send_json(metrics)

    except WebSocketDisconnect:
        logger.info(f"Live session WebSocket disconnected for exercise {current_exercise}")
    except Exception as e:
        logger.error(f"WebSocket session error: {e}", exc_info=True)
    finally:
        pose_extractor.close()

