<div align="center">

# RehabAI 🏋️♀️🤖

### RECOVER. REBUILD. RISE.

```text
┌──────────────────────────────────────────┐
│                                          │
│          REHABAI LIVE SESSION            │
│                                          │
│       [camera + pose skeleton]           │
│                                          │
│       08 REPS     91% FORM               │
│                                          │
└──────────────────────────────────────────┘
```

> **Your webcam. Your movement. Your AI coach.**

<br/>

**AI-powered rehabilitation that turns a standard webcam into an intelligent movement coach.**

Analyze exercise form.  
Count valid repetitions.  
Detect asymmetry.  
Get real-time visual and voice feedback.

<br/>

<img src="https://img.shields.io/badge/Status-Active%20Development-success?style=for-the-badge" alt="Status"/>
<img src="https://img.shields.io/badge/Python-3.9%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
<img src="https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/MediaPipe-Computer%20Vision-FF8C00?style=for-the-badge&logo=google&logoColor=white" alt="MediaPipe"/>

<br/>
<br/>

[🚀 Get Started](#-getting-started) ·
[🧠 How It Works](#-how-it-works) ·
[✨ Features](#-features) ·
[🏗️ Architecture](#️-architecture)

</div>

---

## 🎯 The Problem

Physical rehabilitation often depends on consistent supervision and correct exercise technique.

But outside the clinic, patients may perform exercises with:

- Incorrect posture
- Incomplete range of motion
- Uneven movement between sides
- Incorrect repetition technique
- No immediate feedback
- No clear way to measure improvement

A simple webcam can capture movement — but raw video alone doesn't understand whether the movement is correct.

### That's where RehabAI comes in.

---

## 💡 The Solution

**RehabAI transforms a standard webcam into an AI-assisted rehabilitation coach.**

The platform uses computer vision and pose estimation to understand human movement in real time.

It tracks body landmarks, calculates joint angles, evaluates exercise form, counts only valid repetitions, checks left/right symmetry, and provides actionable feedback while the user is moving.

Instead of:

> "Do 10 squats."

RehabAI can tell you:

> **"Bend deeper."**

> **"Keep your knees aligned."**

> **"Slow down."**

> **"Great form. Keep going."**

The goal is simple:

### **MOVE → ANALYZE → CORRECT → IMPROVE → REPEAT**

---

# ✨ Features

### 🧍 Real-Time Pose Estimation

Track **33 human body landmarks** using Google MediaPipe to understand the user's posture and movement.

### 📐 Intelligent Form Analysis

Calculate exercise-specific joint angles and compare them against predefined movement ranges to identify incorrect form.

### 🔢 Smart Repetition Counting

A repetition is counted only when the user completes the required range of motion — preventing incomplete movements from being counted as valid reps.

### ⚖️ Symmetry Detection

Compare movement between the left and right sides of the body to identify potential asymmetry during exercises.

### 🎯 Dynamic Calibration

Calibrate the user's initial posture before beginning a session to provide a more personalized movement baseline.

### 🔊 Real-Time Voice Coaching

Deliver immediate audio cues such as:

- "Bend deeper"
- "Keep your knees aligned"
- "Slow down"
- "Good form"

### 📊 Performance Tracking

Visualize:

- Form score
- Repetitions
- Symmetry
- Range of motion
- Session history
- Progress over time

### 💻 Responsive Web Experience

A modern React interface designed for desktop, laptop, tablet, and mobile screens.

---

# 🧠 How It Works

RehabAI follows a real-time movement-analysis pipeline:

```text
              WEBCAM
                 │
                 ▼
        ┌─────────────────┐
        │  Video Capture  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │    MediaPipe    │
        │  Pose Detection │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ 33 Body         │
        │ Landmarks       │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Joint Angle     │
        │ Calculation     │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Exercise        │
        │ Analysis        │
        └────────┬────────┘
                 │
        ┌────────┼─────────┐
        ▼        ▼         ▼
      FORM      REPS    SYMMETRY
        │        │         │
        └────────┼─────────┘
                 ▼
        ┌─────────────────┐
        │ AI Feedback     │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ React Frontend  │
        │ Visual + Voice  │
        └─────────────────┘
```

### Example

During a squat, RehabAI can analyze:

```text
Left Knee Angle      88°
Right Knee Angle     92°
Range of Motion      89%
Symmetry             94%
Form Score           91%
Valid Repetitions    08
```

The system then converts those measurements into human-friendly coaching:

> **✓ Great form**

or

> **⚠ Keep your knees aligned**

---

# 🏋️ Supported Movement Analysis

The architecture is designed around exercise-specific analysis rules.

Currently targeted movements include:

- Squats
- Lunges
- Knee exercises
- Mobility movements
- Upper-body exercises
- Balance exercises

Each exercise can define its own:

```text
Landmarks
     ↓
Joint Angles
     ↓
Movement Thresholds
     ↓
Range of Motion
     ↓
Rep Logic
     ↓
Form Rules
     ↓
Feedback
```

This makes it possible to expand RehabAI with additional rehabilitation exercises without rebuilding the entire system.

---

# 🖥️ Product Experience

The application is designed around a simple user journey:

```text
LANDING
   ↓
DASHBOARD
   ↓
CHOOSE EXERCISE
   ↓
EXERCISE INSTRUCTIONS
   ↓
CAMERA CALIBRATION
   ↓
AI READY
   ↓
LIVE REHABILITATION SESSION
   ↓
REAL-TIME FEEDBACK
   ↓
SESSION SUMMARY
   ↓
PROGRESS TRACKING
```

### Live Session

The core experience places the user in front of their webcam while RehabAI displays:

```text
┌──────────────────────────────────────┐
│              AI ACTIVE               │
│                                      │
│         [ LIVE CAMERA FEED ]         │
│                                      │
│            Pose Tracking             │
│                                      │
│       ┌──────┐                       │
│       │  08  │  REPS                 │
│       └──────┘                       │
│                                      │
│  FORM       SYMMETRY       ROM       │
│  91%          94%          89%       │
│                                      │
│  ✓ KEEP YOUR KNEES ALIGNED           │
│                                      │
└──────────────────────────────────────┘
```

The interface is designed to feel like a **personal AI training environment**, not a traditional medical dashboard.

---

# 🏗️ Architecture

RehabAI follows a client-server architecture with a clear separation between the AI engine and user interface.

```text
                     REHABAI
                        │
             ┌──────────┴──────────┐
             │                     │
        WEB FRONTEND           AI ENGINE
        React + Vite             Python
             │                     │
             │              ┌──────┴──────┐
             │              │             │
             │           OpenCV       MediaPipe
             │              │             │
             │              └──────┬──────┘
             │                     │
             │              Movement Analysis
             │                     │
             └──────── API / DATA ─┘
```

### Frontend

Responsible for:

- User interface
- Camera experience
- Pose visualization
- Session controls
- Real-time metrics
- Feedback display
- Exercise library
- Progress dashboards
- Session history

### AI Engine

Responsible for:

- Video processing
- Pose estimation
- Landmark detection
- Joint-angle calculations
- Form analysis
- Repetition detection
- Symmetry analysis
- Feedback generation
- Voice feedback

This separation keeps the AI logic independent from the presentation layer.

---

# 🛠️ Tech Stack

## Frontend

| Technology | Purpose |
|---|---|
| **React** | UI architecture |
| **Vite** | Development & build tooling |
| **Vanilla CSS** | Dark, athletic, AI-powered, responsive UI |
| **Framer Motion** | UI animations |
| **Lucide React** | Interface icons |

## AI / Backend

| Technology | Purpose |
|---|---|
| **Python 3.9+** | AI engine |
| **OpenCV** | Video processing |
| **MediaPipe** | Human pose estimation |
| **Custom Trigonometry Engine** | Joint-angle calculations |
| **pyttsx3** | Voice feedback |

## Data & Configuration

Exercise-specific movement thresholds and baseline parameters are stored as structured JSON configurations.

---

# 📂 Project Structure

```text
RehabAI/
│
├── frontend/                        # 🎨 Modern React Web Application
│   ├── public/                      # Static assets
│   ├── src/                         # Source code (Components, Pages, Hooks, Services)
│   └── package.json                 # Node dependencies
│
├── main.py                          # Primary entry point for real-time analysis
├── pose_engine.py                   # Mathematical joint angle calculation engine
├── vision_engine.py                 # Vision processing utilities
│
├── batch_process.py                 # Script: Batch processing for ideal baseline generation
├── process_ideal_video.py           # Script: Extracts joint parameters from perfect form videos
├── capture_patient_session.py       # Script: Simulate/capture patient data
│
├── squat_angles.json                # Reference angles for perfect squats
├── lunges_angles.json               # Reference angles for lunges
├── ... (other exercise configs)     # Other JSON configuration files
│
├── requirements.txt                 # Python dependencies
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

- Python 3.9+
- Node.js 18+
- npm
- A working webcam

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/RehabAI.git
cd RehabAI
```

---

## 2. Set Up the AI Engine

Create a Python virtual environment:

```bash
python3 -m venv venv
```

Activate it:

### macOS / Linux

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the AI engine:

```bash
python main.py
```

---

## 3. Start the Frontend

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local development URL displayed by Vite, typically:

```text
http://localhost:5173
```

---

# 🔌 Frontend ↔ AI Integration

The frontend and AI engine communicate through a defined integration layer.

Conceptually:

```text
React
  │
  │ Request / Live Data
  ▼
AI Engine
  │
  ├── Pose
  ├── Angles
  ├── Form
  ├── Reps
  └── Symmetry
  │
  ▼
React UI
```

Example analysis payload:

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

The frontend transforms these machine-readable results into a human-readable coaching experience.

---

# 📈 Roadmap

### Current

- [x] Real-time pose estimation
- [x] Joint-angle analysis
- [x] Exercise form detection
- [x] Repetition counting
- [x] Symmetry analysis
- [x] Voice feedback
- [x] React frontend
- [x] Exercise configuration system

### Next

- [ ] Expanded exercise library
- [ ] Persistent user profiles
- [ ] Advanced progress analytics
- [ ] Personalized rehabilitation plans
- [ ] More sophisticated movement baselines
- [ ] Improved AI feedback
- [ ] Cloud deployment
- [ ] Multi-session patient analytics

---

# 🔐 Privacy & Safety

RehabAI is an AI-assisted rehabilitation prototype and is **not a replacement for a licensed physical therapist or medical professional**.

The application is intended to provide movement guidance and feedback, not medical diagnosis or treatment.

Because the platform uses a webcam:

- Camera access should be clearly indicated.
- Users should understand when video is being processed.
- Raw video should not be stored unless explicitly required and disclosed.
- Users should stop an exercise if they experience pain, dizziness, or discomfort and consult an appropriate healthcare professional.

---

# 🤝 Contributing

Contributions are welcome.

Please keep responsibilities separated:

### Frontend

UI and interaction changes should remain inside:

```text
/frontend
```

### AI Engine

Computer vision and analysis changes should remain at the root level:

```text
/main.py (and related scripts)
```

If you introduce a new Python dependency, update:

```text
requirements.txt
```

For frontend dependencies, update:

```text
frontend/package.json
```

---

# 👥 Team

Built collaboratively with ❤️ for the hackathon.

**RehabAI Team**

> Turning every movement into measurable progress.

---

<div align="center">

## 🏋️ RECOVER. REBUILD. RISE.

**MOVE → ANALYZE → CORRECT → IMPROVE → REPEAT**

</div>
