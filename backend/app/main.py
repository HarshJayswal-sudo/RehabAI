from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.core.config import settings
from app.routers import auth, patients, doctors, authorizations, exercises, sessions, websocket

# Create tables (for development). Use Alembic in production.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Rehab AI – Backend API for AI-assisted rehabilitation platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS – open for hackathon; restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(doctors.router, prefix=settings.API_V1_STR)
app.include_router(authorizations.router, prefix=settings.API_V1_STR)
app.include_router(exercises.router, prefix=settings.API_V1_STR)
app.include_router(sessions.router, prefix=settings.API_V1_STR)
app.include_router(websocket.router)



@app.get("/")
def root():
    return {
        "message": "RehabAI Backend is running!",
        "docs": "/docs",
        "api_prefix": settings.API_V1_STR,
    }


@app.get("/health")
def health():
    return {"status": "ok"}
