import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.exercise import Exercise

# Use in-memory SQLite database for fast, isolated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    # Seed standard exercises for tests
    db = TestingSessionLocal()
    sample_exercises = [
        Exercise(code="leg_extension", name="Leg Extension", body_part="leg", difficulty="beginner", target_rom=90.0),
        Exercise(code="squat", name="Squat", body_part="leg", difficulty="beginner", target_rom=90.0),
        Exercise(code="windwheel_toe_touch", name="Windwheel Toe Touch", body_part="spine", difficulty="intermediate", target_rom=170.0),
        Exercise(code="wall_pushup", name="Wall Push Up", body_part="chest", difficulty="beginner", target_rom=90.0),
    ]
    db.add_all(sample_exercises)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


def test_auth_and_profile():
    # Register Patient
    p_res = client.post(
        "/api/v1/auth/patient/register",
        json={"email": "patient@test.com", "password": "password123", "name": "Test Patient"},
    )
    assert p_res.status_code == 201

    # Login Patient
    login_res = client.post(
        "/api/v1/auth/patient/login",
        json={"email": "patient@test.com", "password": "password123"},
    )
    assert login_res.status_code == 200
    patient_token = login_res.json()["access_token"]

    # Get Patient Profile
    me_res = client.get(
        "/api/v1/patients/me",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "patient@test.com"


def test_exercises_endpoint():
    res = client.get("/api/v1/exercises")
    assert res.status_code == 200
    exercises = res.json()
    assert len(exercises) == 4

    # Check lookup by code
    squat_res = client.get("/api/v1/exercises/code/squat")
    assert squat_res.status_code == 200
    assert squat_res.json()["name"] == "Squat"
    assert squat_res.json()["target_rom"] == 90.0


def test_session_ai_payload_submission():
    # 1. Register and Login Patient
    client.post(
        "/api/v1/auth/patient/register",
        json={"email": "p2@test.com", "password": "password123", "name": "Patient 2"},
    )
    login_res = client.post(
        "/api/v1/auth/patient/login",
        json={"email": "p2@test.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Start Session by exercise code
    start_res = client.post(
        "/api/v1/sessions",
        json={"exercise_code": "leg_extension"},
        headers=headers,
    )
    assert start_res.status_code == 201
    session_id = start_res.json()["id"]

    # 3. Submit AI Team's exact JSON format via /sessions/{id}/ai-result
    ai_team_payload = {
        "exercise": "leg_extension",
        "repetitions": 2,
        "average_score": 100.0,
        "average_rom": 88.5,
        "repetitions_detail": [
            {
                "rep": 1,
                "score": 100,
                "highest_angle": 179.2,
                "rom": 89.2,
                "errors": [],
                "feedback": "Great extension. Keep it up!",
            },
            {
                "rep": 2,
                "score": 100,
                "highest_angle": 177.8,
                "rom": 87.8,
                "errors": [],
                "feedback": "Great extension. Keep it up!",
            },
        ],
    }

    result_res = client.post(
        f"/api/v1/sessions/{session_id}/ai-result",
        json=ai_team_payload,
        headers=headers,
    )
    assert result_res.status_code == 201
    data = result_res.json()
    assert data["repetitions"] == 2
    assert data["correct_repetitions"] == 2
    assert data["score"] == 100.0
    assert data["average_rom"] == 88.5
    assert len(data["repetitions_detail"]) == 2

    # 4. Check that session is marked completed
    session_res = client.get(f"/api/v1/sessions/{session_id}", headers=headers)
    assert session_res.status_code == 200
    assert session_res.json()["status"] == "completed"
    assert session_res.json()["results"]["average_rom"] == 88.5


def test_quick_record_with_video_keyed_ai_payload():
    client.post(
        "/api/v1/auth/patient/register",
        json={"email": "p3@test.com", "password": "password123", "name": "Patient 3"},
    )
    login_res = client.post(
        "/api/v1/auth/patient/login",
        json={"email": "p3@test.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Video-keyed payload provided by AI team
    video_payload = {
        "wind will toe touch 3.mp4": {
            "exercise": "windwheel_toe_touch",
            "repetitions": 3,
            "average_score": 100.0,
            "average_rom": 175.0,
            "repetitions_detail": [
                {
                    "rep": 1,
                    "score": 100,
                    "lowest_angle": 11.0,
                    "rom": 169.0,
                    "errors": [],
                    "feedback": "Great hip hinge and flexibility!",
                },
                {
                    "rep": 2,
                    "score": 100,
                    "lowest_angle": 0.5,
                    "rom": 179.5,
                    "errors": [],
                    "feedback": "Great hip hinge and flexibility!",
                },
                {
                    "rep": 3,
                    "score": 100,
                    "lowest_angle": 3.5,
                    "rom": 176.6,
                    "errors": [],
                    "feedback": "Great hip hinge and flexibility!",
                },
            ],
        }
    }

    quick_res = client.post("/api/v1/sessions/quick-record", json=video_payload, headers=headers)
    assert quick_res.status_code == 201
    res_data = quick_res.json()
    assert res_data["status"] == "completed"
    assert res_data["exercise"]["code"] == "windwheel_toe_touch"
    assert res_data["results"]["score"] == 100.0
    assert res_data["results"]["average_rom"] == 175.0
    assert res_data["results"]["repetitions"] == 3
    assert res_data["results"]["video_filename"] == "wind will toe touch 3.mp4"


def test_batch_record_multi_video_ai_files():
    # Register Patient
    client.post(
        "/api/v1/auth/patient/register",
        json={"email": "batch@test.com", "password": "password123", "name": "Batch Patient"},
    )
    login_res = client.post(
        "/api/v1/auth/patient/login",
        json={"email": "batch@test.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Multi-video batch from AI team for Wall Push Up (including leading space in key)
    wall_pushup_batch = {
        " wall push up 2.mp4": {
            "exercise": "wall_pushup",
            "repetitions": 3,
            "average_score": 100.0,
            "average_rom": 89.3,
            "repetitions_detail": [
                {"rep": 1, "score": 100, "lowest_angle": 93.4, "rom": 86.6, "errors": [], "feedback": "Great depth. Perfect push-up!"},
                {"rep": 2, "score": 100, "lowest_angle": 89.7, "rom": 90.3, "errors": [], "feedback": "Great depth. Perfect push-up!"},
                {"rep": 3, "score": 100, "lowest_angle": 89.0, "rom": 91.0, "errors": [], "feedback": "Great depth. Perfect push-up!"},
            ],
        },
        "wall push up 3.mp4": {
            "exercise": "wall_pushup",
            "repetitions": 1,
            "average_score": 100.0,
            "average_rom": 158.9,
            "repetitions_detail": [
                {"rep": 1, "score": 100, "lowest_angle": 21.1, "rom": 158.9, "errors": [], "feedback": "Great depth. Perfect push-up!"}
            ],
        },
    }

    batch_res = client.post("/api/v1/sessions/batch-record", json=wall_pushup_batch, headers=headers)
    assert batch_res.status_code == 200
    b_data = batch_res.json()
    assert b_data["total_processed"] == 2
    assert b_data["batch_average_score"] == 100.0
    assert len(b_data["sessions"]) == 2
    assert b_data["sessions"][0]["exercise"]["code"] == "wall_pushup"


def test_optimistic_auto_provisioning():
    # If the AI team sends a brand-new unseeded exercise code (e.g. bicep_curl)
    client.post(
        "/api/v1/auth/patient/register",
        json={"email": "auto@test.com", "password": "password123", "name": "Auto Patient"},
    )
    login_res = client.post(
        "/api/v1/auth/patient/login",
        json={"email": "auto@test.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    new_exercise_payload = {
        "exercise": "bicep_curl",
        "repetitions": 5,
        "average_score": 98.0,
        "average_rom": 120.0,
        "repetitions_detail": [
            {"rep": 1, "score": 100, "rom": 120.0, "feedback": "Good curl!"}
        ]
    }

    res = client.post("/api/v1/sessions/quick-record", json=new_exercise_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["exercise"]["code"] == "bicep_curl"
    assert data["exercise"]["name"] == "Bicep Curl"
    assert data["results"]["score"] == 98.0


def test_patient_progress_analytics():
    client.post(
        "/api/v1/auth/patient/register",
        json={"email": "p4@test.com", "password": "password123", "name": "Patient 4"},
    )
    login_res = client.post(
        "/api/v1/auth/patient/login",
        json={"email": "p4@test.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Record 2 sessions
    client.post(
        "/api/v1/sessions/quick-record",
        json={"exercise": "squat", "average_score": 90.0, "average_rom": 85.0, "repetitions": 5},
        headers=headers,
    )
    client.post(
        "/api/v1/sessions/quick-record",
        json={"exercise": "leg_extension", "average_score": 100.0, "average_rom": 95.0, "repetitions": 4},
        headers=headers,
    )

    prog_res = client.get("/api/v1/patients/me/progress", headers=headers)
    assert prog_res.status_code == 200
    prog = prog_res.json()
    assert prog["completed_sessions"] == 2
    assert prog["average_score"] == 95.0
    assert prog["average_rom"] == 90.0
    assert prog["total_repetitions"] == 9
    assert len(prog["exercise_breakdown"]) == 2
    assert len(prog["history_trend"]) == 2


def test_doctor_authorization_and_observation():
    # Register Doctor and Patient
    d_res = client.post(
        "/api/v1/auth/doctor/register",
        json={"email": "dr@test.com", "password": "password123", "name": "Dr. Smith"},
    )
    dr_id = d_res.json()["id"]
    dr_login = client.post(
        "/api/v1/auth/doctor/login",
        json={"email": "dr@test.com", "password": "password123"},
    )
    dr_token = dr_login.json()["access_token"]

    p_res = client.post(
        "/api/v1/auth/patient/register",
        json={"email": "p5@test.com", "password": "password123", "name": "Patient 5"},
    )
    p_login = client.post(
        "/api/v1/auth/patient/login",
        json={"email": "p5@test.com", "password": "password123"},
    )
    p_token = p_login.json()["access_token"]

    p_headers = {"Authorization": f"Bearer {p_token}"}
    d_headers = {"Authorization": f"Bearer {dr_token}"}

    # Patient requests authorization with Doctor
    auth_res = client.post(
        "/api/v1/authorizations",
        json={"doctor_id": dr_id},
        headers=p_headers,
    )
    assert auth_res.status_code == 201
    auth_id = auth_res.json()["id"]

    # Patient approves authorization
    approve_res = client.patch(f"/api/v1/authorizations/{auth_id}/approve", headers=p_headers)
    assert approve_res.status_code == 200

    # Doctor views authorized patient list
    patients_list = client.get("/api/v1/doctors/me/patients", headers=d_headers)
    assert patients_list.status_code == 200
    assert len(patients_list.json()) == 1

    # Patient starts active session
    sess_res = client.post("/api/v1/sessions", json={"exercise_code": "squat"}, headers=p_headers)
    session_id = sess_res.json()["id"]

    # Doctor requests live access token
    live_res = client.post(f"/api/v1/sessions/{session_id}/doctor-access", headers=d_headers)
    assert live_res.status_code == 200
    assert "live_access_token" in live_res.json()
