# Rehab AI – Backend

FastAPI backend for the Rehab AI rehabilitation platform with integrated AI Computer Vision evaluation models.

## Features

- **Authentication**: Separate patient & doctor registration/login with JWT
- **Role-based access**: Patient / Doctor
- **Doctor-Patient Authorization**: Explicit approval flow (pending → approved / rejected / revoked)
- **AI Computer Vision Integration**:
  - Direct ingestion of AI team results for **Wall Push Up** (`wall_pushup`), **Leg Extension** (`leg_extension`), **Squat** (`squat`), **Windwheel Toe Touch** (`windwheel_toe_touch`), and more.
  - Tracking of Range of Motion (ROM), rep count, rep-by-rep scores, highest/lowest joint angles, errors, and real-time form feedback.
  - Automatic source video tracking (`video_filename`).
- **Optimistic & Resilient Execution**:
  - **Auto-Provisioning**: Automatically provisions unseeded exercises on-the-fly without throwing 404 errors.
  - **Multi-Video Batch Ingestion**: Ingest multi-video analysis JSON files in one single request (`POST /sessions/batch-record`).
  - **Whitespace & Alias Tolerance**: Seamlessly normalizes filenames with leading/trailing spaces and various naming formats (`" wall push up 2.mp4"`, `"wall push up"` $\rightarrow$ `"wall_pushup"`).
- **Rehabilitation Sessions**:
  - Start by `exercise_id` or `exercise_code`.
  - Direct submission of raw AI team JSON output payloads (`POST /sessions/{id}/ai-result`).
  - One-step session recording & completion (`POST /sessions/quick-record`).
  - Batch ingestion for multi-video files (`POST /sessions/batch-record`).
- **Comprehensive Patient & Doctor Analytics**:
  - Per-exercise performance breakdown (average score, average ROM, total reps).
  - Historical progress trends over time.
- **Live Doctor Observation**: Short-lived permission token for real-time video layers (WebRTC).

## Quick Start

```bash
cd backend

# Create & activate virtualenv
py -m venv venv
venv\Scripts\activate          # Linux/macOS: source venv/bin/activate

# Install dependencies
py -m pip install -r requirements.txt

# Seed sample AI exercises
py seed_data.py

# Run the server
py -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open:
- API root: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

---

## AI Team Output Integration Formats

### 1. Single Exercise / Video Payload
```json
{
  "exercise": "wall_pushup",
  "repetitions": 3,
  "average_score": 100.0,
  "average_rom": 89.3,
  "repetitions_detail": [
    {
      "rep": 1,
      "score": 100,
      "lowest_angle": 93.4,
      "rom": 86.6,
      "errors": [],
      "feedback": "Great depth. Perfect push-up!"
    }
  ]
}
```

### 2. Multi-Video Batch Evaluation Payload
```json
{
  " wall push up 2.mp4": {
    "exercise": "wall_pushup",
    "repetitions": 3,
    "average_score": 100.0,
    "average_rom": 89.3,
    "repetitions_detail": [ ... ]
  },
  "wall push up 3.mp4": {
    "exercise": "wall_pushup",
    "repetitions": 1,
    "average_score": 100.0,
    "average_rom": 158.9,
    "repetitions_detail": [ ... ]
  }
}
```

---

## API Overview (prefix `/api/v1`)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/patient/register` | Register patient |
| POST | `/auth/doctor/register` | Register doctor |
| POST | `/auth/patient/login` | Patient login → JWT |
| POST | `/auth/doctor/login` | Doctor login → JWT |
| GET | `/auth/me` | Current authenticated user |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patients/me` | Patient profile |
| GET | `/patients/me/history` | Patient session history + AI metrics |
| GET | `/patients/me/progress` | Aggregated progress (exercise breakdown, average ROM, score trends) |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/doctors/me` | Doctor profile |
| GET | `/doctors/me/patients` | Authorized patients list |
| GET | `/doctors/me/patients/{id}/history` | Patient history & results |
| GET | `/doctors/me/patients/{id}/progress` | Patient progress & breakdown |

### Authorizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/authorizations` | Patient requests doctor authorization |
| GET | `/authorizations/me` | My authorizations |
| PATCH | `/authorizations/{id}/approve` | Patient approves authorization |
| PATCH | `/authorizations/{id}/reject` | Patient rejects authorization |
| PATCH | `/authorizations/{id}/revoke` | Revoke approved authorization |

### Exercises
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exercises` | List exercises (supports `body_part`, `code` query filters) |
| GET | `/exercises/code/{code}` | Get exercise details by code (e.g. `wall_pushup`, `squat`, `leg_extension`) |
| GET | `/exercises/{id}` | Get exercise by ID |
| POST | `/exercises` | Create exercise (doctor only) |
| PUT | `/exercises/{id}` | Update exercise (doctor only) |

### Sessions & AI Evaluation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sessions` | Start session (accepts `exercise_id` or `exercise_code`) |
| GET | `/sessions/{id}` | Get session details |
| PATCH | `/sessions/{id}/complete` | Complete session manually |
| POST | `/sessions/{id}/results` | Submit AI evaluation results |
| POST | `/sessions/{id}/ai-result` | Direct submit for AI/CV team JSON payloads |
| POST | `/sessions/quick-record` | One-step session creation & AI result recording |
| POST | `/sessions/batch-record` | Multi-video batch evaluation recording |
| POST | `/sessions/{id}/doctor-access` | Generate short-lived observation token for doctor |

---

## Running Automated Tests

```bash
py -m pytest
```
