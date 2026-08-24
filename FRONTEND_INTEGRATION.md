# Frontend Integration Guide for the Backend Team 🚀

Welcome to the new **RehabAI Frontend**! We have completely decoupled the React UI into the `frontend/` directory to ensure that you can continue working on the core Python AI Engine (`main.py`, `pose_engine.py`) without any merge conflicts.

This document outlines exactly how the frontend expects to communicate with the backend so you can easily wire up your AI logic.

---

## 1. WebSocket Connection (Live AI Session)

The most critical integration point is the Live Session where the user performs the exercise in front of the camera.

- **Protocol:** WebSocket
- **URL:** `ws://localhost:8000/ws/session`
- **File to hook up:** Your AI engine (e.g., inside `main.py` using FastAPI/WebSockets)

### What the Frontend Expects to Receive
While the WebSocket is open, the backend should constantly stream JSON objects containing the real-time metrics of the patient's exercise.

**Expected JSON Payload Format:**
```json
{
  "exercise": "squat",
  "rep": 8,
  "formScore": 91,
  "symmetry": 94,
  "rangeOfMotion": 89,
  "status": "good",
  "feedback": "Keep your knees aligned"
}
```

### Status Codes
The frontend color-codes the UI and displays alerts based on the `status` field:
- `"good"` → Displays positive feedback (Green)
- `"warning"` → Displays corrective feedback like "bend deeper" (Yellow/Orange)
- `"bad"` → Displays critical warnings (Red)

*(Note: The frontend no longer requires base64 images from the backend since it accesses the webcam directly, saving massive bandwidth!)*

---

## 2. REST API (Database & Dashboard)

The application features a modern dashboard that displays user statistics and session history. Currently, the frontend gracefully falls back to **Mock Data** if it cannot reach the backend, so the app won't crash while you build the API!

When you are ready to wire up a real database (like SQLite/PostgreSQL), the frontend expects these endpoints:

- **Base URL:** `http://localhost:8000/api/v1`
- **Frontend Service File:** `/frontend/src/services/api.js`

### A. Dashboard Stats
**GET** `/dashboard/stats`
```json
{
  "totalSessions": 12,
  "totalReps": 345,
  "avgAccuracy": 88
}
```

### B. Recent Sessions
**GET** `/sessions/recent`
```json
[
  {
    "id": 1,
    "exercise_type": "squat",
    "reps": 15,
    "accuracy_score": 92,
    "date": "2026-08-25T10:00:00Z"
  }
]
```

### C. Saving a New Session
**POST** `/sessions`
The frontend will send this payload when the user clicks "End Session":
```json
{
  "exercise_type": "squat",
  "duration_seconds": 120,
  "reps_completed": 15,
  "avg_accuracy": 92,
  "metrics": {
    "symmetry": 94,
    "rangeOfMotion": 89
  }
}
```

---

## 3. Authentication (Optional for Hackathon)

We have built a **"Continue as Demo User"** button directly into the login screen! 
This bypasses authentication so judges and users can test the app instantly without needing a username/password or JWT token.

If you *do* want to enforce authentication later, the frontend expects a standard JWT token returned from:
**POST** `/auth/login`
```json
{
  "access_token": "eyJhb...",
  "token_type": "bearer",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## How to Test the Integration

1. Start your backend AI server on Port `8000`.
2. Open a new terminal and start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Navigate to `http://localhost:5173`.
4. Click **"Continue as Demo User"**.
5. Click **"Start Live Session"** and watch your AI engine metrics stream directly into the beautiful glassmorphic UI!

Happy coding! Let's win this hackathon! 🏆
