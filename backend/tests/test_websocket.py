import base64
import json
import pytest
import numpy as np
import cv2
from fastapi.testclient import TestClient

from app.main import app
from app.ai.analyzers import (
    get_analyzer,
    LiveSquatAnalyzer,
    LiveLegExtensionAnalyzer,
    LiveWallPushupAnalyzer,
    LiveLungeAnalyzer,
    LiveWindwheelAnalyzer,
)
from app.ai.pose_engine import decode_base64_frame, calculate_angle


def create_dummy_base64_jpeg() -> str:
    """Generates a small valid JPEG image encoded in base64."""
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode(".jpg", img)
    b64_str = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_str}"


def test_angle_calculator():
    # 90 degree angle
    a = (0.0, 1.0)
    b = (0.0, 0.0)
    c = (1.0, 0.0)
    angle = calculate_angle(a, b, c)
    assert abs(angle - 90.0) < 1.0


def test_decode_base64_frame():
    b64 = create_dummy_base64_jpeg()
    frame = decode_base64_frame(b64)
    assert frame is not None
    assert frame.shape == (100, 100, 3)

    # Invalid frame returns None
    invalid = decode_base64_frame("invalid_base64_data")
    assert invalid is None


def test_analyzer_factory():
    assert isinstance(get_analyzer("squat"), LiveSquatAnalyzer)
    assert isinstance(get_analyzer("leg_extension"), LiveLegExtensionAnalyzer)
    assert isinstance(get_analyzer("wall_pushup"), LiveWallPushupAnalyzer)
    assert isinstance(get_analyzer("bodyweight_lunge"), LiveLungeAnalyzer)
    assert isinstance(get_analyzer("windwheel_toe_touch"), LiveWindwheelAnalyzer)


def test_squat_analyzer_state_machine():
    analyzer = LiveSquatAnalyzer()

    # Standing
    res1 = analyzer.update({"left_knee_angle": 175.0, "right_knee_angle": 175.0, "torso_angle": 10.0, "symmetry": 100.0})
    assert res1["phase"] == "standing"
    assert res1["rep"] == 0

    # Descending
    res2 = analyzer.update({"left_knee_angle": 140.0, "right_knee_angle": 140.0, "torso_angle": 15.0, "symmetry": 100.0})
    assert res2["phase"] == "descending"

    # Bottom
    res3 = analyzer.update({"left_knee_angle": 90.0, "right_knee_angle": 90.0, "torso_angle": 15.0, "symmetry": 100.0})
    assert res3["phase"] == "bottom"

    # Ascending
    res4 = analyzer.update({"left_knee_angle": 130.0, "right_knee_angle": 130.0, "torso_angle": 15.0, "symmetry": 100.0})
    assert res4["phase"] == "ascending"

    # Standing - rep completes
    res5 = analyzer.update({"left_knee_angle": 170.0, "right_knee_angle": 170.0, "torso_angle": 15.0, "symmetry": 100.0})
    assert res5["phase"] == "standing"
    assert res5["rep"] == 1
    assert res5["formScore"] == 100.0

    summary = analyzer.get_session_results()
    assert summary["repetitions"] == 1
    assert summary["average_score"] == 100.0


def test_leg_extension_analyzer_state_machine():
    analyzer = LiveLegExtensionAnalyzer()

    # Seated bent
    analyzer.update({"left_knee_angle": 90.0, "right_knee_angle": 90.0})
    # Extending
    analyzer.update({"left_knee_angle": 130.0, "right_knee_angle": 130.0})
    # Fully extended
    analyzer.update({"left_knee_angle": 170.0, "right_knee_angle": 170.0})
    # Bending
    analyzer.update({"left_knee_angle": 140.0, "right_knee_angle": 140.0})
    # Rep completed
    res = analyzer.update({"left_knee_angle": 95.0, "right_knee_angle": 95.0})
    assert res["rep"] == 1
    assert res["status"] == "good"


def test_websocket_session_lifecycle():
    client = TestClient(app)

    with client.websocket_connect("/ws/session?exercise_code=squat") as websocket:
        # 1. Send reset command
        websocket.send_text(json.dumps({"type": "reset"}))
        reset_res = websocket.receive_json()
        assert reset_res["status"] == "reset"
        assert reset_res["rep"] == 0

        # 2. Send dummy frame (black image without person)
        dummy_frame = create_dummy_base64_jpeg()
        websocket.send_text(json.dumps({"type": "frame", "image": dummy_frame, "exercise": "squat"}))
        frame_res = websocket.receive_json()
        assert "feedback" in frame_res
        assert "rep" in frame_res

        # 3. Send finish command to receive summary
        websocket.send_text(json.dumps({"type": "finish"}))
        finish_res = websocket.receive_json()
        assert finish_res["type"] == "summary"
        assert "results" in finish_res
        assert finish_res["results"]["exercise"] == "squat"

