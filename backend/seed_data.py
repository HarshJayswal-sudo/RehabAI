"""
Seed script – creates the core AI-supported rehabilitation exercises so the system is immediately usable.
Run from the backend directory:

    py seed_data.py
"""
from app.database import SessionLocal, engine, Base
from app.models.exercise import Exercise

Base.metadata.create_all(bind=engine)

SAMPLE_EXERCISES = [
    {
        "code": "leg_extension",
        "name": "Leg Extension",
        "description": "Seated lower-body rehabilitation exercise focusing on knee joint extension and quadriceps strengthening.",
        "body_part": "leg",
        "difficulty": "beginner",
        "instructions": "Sit upright on a chair or bench with feet flat. Slowly extend your knee until the leg is straight out in front. Pause briefly at full extension, then lower under control.",
        "target_rom": 90.0,
    },
    {
        "code": "squat",
        "name": "Squat",
        "description": "Lower-body functional movement focusing on hip mobility, knee stability, and quadriceps/glute strength.",
        "body_part": "leg",
        "difficulty": "beginner",
        "instructions": "Stand with feet shoulder-width apart. Lower hips down and back as if sitting into a chair while maintaining an upright chest and neutral spine. Push through feet to return to standing.",
        "target_rom": 90.0,
    },
    {
        "code": "windwheel_toe_touch",
        "name": "Windwheel Toe Touch",
        "description": "Full-body mobility and rehabilitation exercise focusing on thoracic rotation, hip hinge, and hamstring flexibility.",
        "body_part": "spine",
        "difficulty": "intermediate",
        "instructions": "Stand with feet wide apart and arms extended to the sides. Hinge at hips and rotate torso to touch your opposite foot with your hand while keeping the other arm pointed towards the ceiling. Return smoothly and repeat on the opposite side.",
        "target_rom": 170.0,
    },
    {
        "code": "wall_pushup",
        "name": "Wall Push Up",
        "description": "Upper-body rehabilitation exercise focusing on chest strength, shoulder stability, and scapular control against a wall.",
        "body_part": "chest",
        "difficulty": "beginner",
        "instructions": "Stand arm's length from a flat wall with hands placed shoulder-width apart at chest height. Slowly bend your elbows to bring chest toward the wall while keeping your body in a straight plank line. Press firmly back to the starting position.",
        "target_rom": 90.0,
    },
    {
        "code": "shoulder_raise",
        "name": "Shoulder Raise",
        "description": "Upper-body exercise to improve shoulder mobility, deltoid strength, and rotator cuff rehabilitation.",
        "body_part": "shoulder",
        "difficulty": "beginner",
        "instructions": "Stand or sit tall. Raise arms slowly out to the sides until parallel with the floor. Hold briefly, then lower with control.",
        "target_rom": 90.0,
    },
    {
        "code": "arm_circles",
        "name": "Arm Circles",
        "description": "Gentle shoulder and scapular mobility drill to warm up and rehabilitate shoulder joint motion.",
        "body_part": "shoulder",
        "difficulty": "beginner",
        "instructions": "Extend arms straight out to the sides and make small controlled circular motions. Gradually increase the diameter of the circles while keeping core engaged.",
        "target_rom": 360.0,
    },
]


def seed():
    db = SessionLocal()
    try:
        for data in SAMPLE_EXERCISES:
            exists = (
                db.query(Exercise)
                .filter((Exercise.name == data["name"]) | (Exercise.code == data["code"]))
                .first()
            )
            if not exists:
                db.add(Exercise(**data))
                print(f"Added exercise: {data['name']} (code={data['code']})")
            else:
                # Update existing exercise with code and target_rom if missing
                for k, v in data.items():
                    setattr(exists, k, v)
                print(f"Updated exercise: {data['name']} (code={data['code']})")
        db.commit()
        print("Seed completed successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
