import cv2
import math
import os
import time
import threading
import queue
from collections import deque

import pyttsx3
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


# ============================================================
# REHAB AI - SQUAT MVP
# ============================================================
#
# IMPORTANT:
# This is a hackathon prototype.
#
# The exercise thresholds below are demonstration rules.
# They are NOT clinically validated rehabilitation advice.
#
# The system:
# 1. Opens the webcam
# 2. Detects the human pose locally
# 3. Finds both knee angles
# 4. Calibrates the user's standing position
# 5. Detects squat movement
# 6. Checks squat depth
# 7. Checks left/right knee symmetry
# 8. Counts repetitions
# 9. Gives visual + voice feedback
#
# Raw video is NOT saved.
# ============================================================


# ============================================================
# 1. CONFIGURATION
# ============================================================

MODEL_PATH = os.path.join(
    "models",
    "pose_landmarker_full.task"
)

CAMERA_INDEX = 0


# ------------------------------------------------------------
# CALIBRATION
# ------------------------------------------------------------

# Number of good frames used to calculate standing baseline.
CALIBRATION_FRAMES = 60


# ------------------------------------------------------------
# SQUAT MOVEMENT THRESHOLDS
# ------------------------------------------------------------

# How much the knee angle must decrease from standing
# before we consider the person to have started squatting.
START_FLEXION = 10


# How much the knee must bend from the standing baseline
# before we consider it a real squat bottom.
TARGET_FLEXION = 45


# If the person has started a squat but has not reached
# TARGET_FLEXION, we give "Bend deeper".
MINIMUM_BOTTOM_FLEXION = 25


# ------------------------------------------------------------
# LEFT / RIGHT SYMMETRY
# ------------------------------------------------------------

MAX_KNEE_ASYMMETRY = 15


# ------------------------------------------------------------
# LANDMARK CONFIDENCE
# ------------------------------------------------------------

MIN_VISIBILITY = 0.5


# ------------------------------------------------------------
# VOICE
# ------------------------------------------------------------

VOICE_COOLDOWN = 3.0


# ============================================================
# 2. CHECK MODEL
# ============================================================

if not os.path.exists(MODEL_PATH):

    print()
    print("==============================================")
    print("ERROR: POSE MODEL NOT FOUND")
    print("==============================================")
    print()
    print("Expected:")
    print(MODEL_PATH)
    print()
    print("Your project should look like:")
    print()
    print("rehab_ai/")
    print("│")
    print("├── main.py")
    print("│")
    print("├── models/")
    print("│   └── pose_landmarker_full.task")
    print("│")
    print("└── venv/")
    print()

    raise SystemExit


# ============================================================
# 3. VOICE SYSTEM
# ============================================================

voice_queue = queue.Queue()

voice_available = False

try:

    voice_engine = pyttsx3.init()

    voice_engine.setProperty(
        "rate",
        160
    )

    voice_engine.setProperty(
        "volume",
        1.0
    )

    voice_available = True

    print("Voice system: READY")

except Exception as error:

    print("Voice system: DISABLED")

    print("Reason:", error)


# ------------------------------------------------------------
# VOICE WORKER
# ------------------------------------------------------------

def voice_worker():

    while True:

        message = voice_queue.get()

        if message is None:

            voice_queue.task_done()

            break

        try:

            voice_engine.say(message)

            voice_engine.runAndWait()

        except Exception as error:

            print(
                "Voice error:",
                error
            )

        finally:

            voice_queue.task_done()


if voice_available:

    threading.Thread(
        target=voice_worker,
        daemon=True
    ).start()


# ============================================================
# 4. VOICE CONTROL
# ============================================================

last_spoken_message = ""

last_spoken_time = 0


def speak(message):

    if not voice_available:

        return

    if not message:

        return

    voice_queue.put(message)


def speak_if_needed(message):

    global last_spoken_message
    global last_spoken_time

    if not message:

        return

    current_time = time.time()

    message_changed = (
        message != last_spoken_message
    )

    cooldown_finished = (
        current_time - last_spoken_time
        >= VOICE_COOLDOWN
    )

    if (
        message_changed
        or
        cooldown_finished
    ):

        speak(message)

        last_spoken_message = message

        last_spoken_time = current_time


# ============================================================
# 5. ANGLE CALCULATION
# ============================================================

def calculate_angle(a, b, c):

    """
    Calculate the angle at point B.

             A
              \
               B
                \
                 C

    Returns angle in degrees.
    """

    angle = math.degrees(
        math.atan2(
            c.y - b.y,
            c.x - b.x
        )
        -
        math.atan2(
            a.y - b.y,
            a.x - b.x
        )
    )

    angle = abs(angle)

    if angle > 180:

        angle = 360 - angle

    return angle


# ============================================================
# 6. LANDMARK QUALITY CHECK
# ============================================================

def landmark_is_visible(landmark):

    visibility = getattr(
        landmark,
        "visibility",
        1.0
    )

    presence = getattr(
        landmark,
        "presence",
        1.0
    )

    return (
        visibility >= MIN_VISIBILITY
        and
        presence >= MIN_VISIBILITY
    )


# ============================================================
# 7. DRAW LANDMARK
# ============================================================

def draw_landmark(
    frame,
    landmark,
    label,
    color
):

    height, width = frame.shape[:2]

    x = int(
        landmark.x * width
    )

    y = int(
        landmark.y * height
    )

    cv2.circle(
        frame,
        (x, y),
        7,
        color,
        -1
    )

    cv2.putText(
        frame,
        label,
        (x + 10, y),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.45,
        color,
        1
    )


# ============================================================
# 8. DRAW CONNECTION
# ============================================================

def draw_connection(
    frame,
    landmarks,
    start_index,
    end_index
):

    start = landmarks[start_index]

    end = landmarks[end_index]

    height, width = frame.shape[:2]

    start_point = (
        int(start.x * width),
        int(start.y * height)
    )

    end_point = (
        int(end.x * width),
        int(end.y * height)
    )

    cv2.line(
        frame,
        start_point,
        end_point,
        (255, 255, 255),
        2
    )


# ============================================================
# 9. CREATE MEDIAPIPE POSE LANDMARKER
# ============================================================

base_options = python.BaseOptions(
    model_asset_path=MODEL_PATH
)

options = vision.PoseLandmarkerOptions(

    base_options=base_options,

    # IMAGE mode is intentionally used for this MVP.
    running_mode=vision.RunningMode.IMAGE,

    num_poses=1,

    min_pose_detection_confidence=0.5,

    min_pose_presence_confidence=0.5,

    min_tracking_confidence=0.5
)

landmarker = vision.PoseLandmarker.create_from_options(
    options
)


# ============================================================
# 10. OPEN CAMERA
# ============================================================

camera = cv2.VideoCapture(
    CAMERA_INDEX
)

if not camera.isOpened():

    print()
    print("ERROR: Could not open camera.")
    print()

    landmarker.close()

    raise SystemExit


camera.set(
    cv2.CAP_PROP_FRAME_WIDTH,
    640
)

camera.set(
    cv2.CAP_PROP_FRAME_HEIGHT,
    480
)


# ============================================================
# 11. SESSION VARIABLES
# ============================================================

rep_count = 0

correct_reps = 0

incorrect_reps = 0


# ------------------------------------------------------------
# EXERCISE STATE
# ------------------------------------------------------------

state = "CALIBRATING"


# Possible states:
#
# CALIBRATING
# STANDING
# DESCENDING
# BOTTOM
# RETURNING
#


# ------------------------------------------------------------
# REP STATE
# ------------------------------------------------------------

rep_started = False

rep_reached_bottom = False

rep_good = True

rep_feedback = ""


# ------------------------------------------------------------
# CURRENT ANGLES
# ------------------------------------------------------------

left_knee_angle = None

right_knee_angle = None


# ------------------------------------------------------------
# BASELINE ANGLES
# ------------------------------------------------------------

left_baseline = None

right_baseline = None


# ------------------------------------------------------------
# CALIBRATION DATA
# ------------------------------------------------------------

left_calibration_values = []

right_calibration_values = []


# ------------------------------------------------------------
# ANGLE SMOOTHING
# ------------------------------------------------------------

left_angle_history = deque(
    maxlen=7
)

right_angle_history = deque(
    maxlen=7
)


# ------------------------------------------------------------
# FEEDBACK
# ------------------------------------------------------------

feedback = ""

last_feedback = ""


# ============================================================
# 12. START MESSAGE
# ============================================================

print()
print("==============================================")
print("           REHAB AI - SQUAT MVP")
print("==============================================")
print()
print("Camera      : READY")
print("Pose AI     : READY")
print(
    "Voice       :",
    "READY" if voice_available else "DISABLED"
)
print()
print("IMPORTANT:")
print("Stand normally for calibration.")
print()
print("Then perform slow squats.")
print()
print("Press Q to quit.")
print()


if voice_available:

    time.sleep(1)

    speak(
        "Stand normally. Calibration will begin."
    )


# ============================================================
# 13. MAIN LOOP
# ============================================================

while True:

    # ========================================================
    # READ CAMERA
    # ========================================================

    success, frame = camera.read()

    if not success:

        print(
            "ERROR: Could not read camera."
        )

        break


    # Mirror the camera.
    frame = cv2.flip(
        frame,
        1
    )


    # ========================================================
    # CONVERT BGR → RGB
    # ========================================================

    rgb_frame = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )


    # ========================================================
    # CREATE MEDIAPIPE IMAGE
    # ========================================================

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb_frame
    )


    # ========================================================
    # RUN POSE DETECTION
    # ========================================================

    try:

        result = landmarker.detect(
            mp_image
        )

    except Exception as error:

        print(
            "Pose detection error:",
            error
        )

        break


    # ========================================================
    # DEFAULT DISPLAY
    # ========================================================

    display_status = "NO PERSON"

    feedback = ""


    # ========================================================
    # PERSON DETECTED?
    # ========================================================

    if result.pose_landmarks:

        landmarks = result.pose_landmarks[0]


        # ----------------------------------------------------
        # IMPORTANT LANDMARKS
        # ----------------------------------------------------

        left_hip = landmarks[23]

        left_knee = landmarks[25]

        left_ankle = landmarks[27]

        right_hip = landmarks[24]

        right_knee = landmarks[26]

        right_ankle = landmarks[28]


        # ----------------------------------------------------
        # CHECK VISIBILITY
        # ----------------------------------------------------

        required_landmarks = [

            left_hip,
            left_knee,
            left_ankle,

            right_hip,
            right_knee,
            right_ankle

        ]


        all_visible = all(
            landmark_is_visible(x)
            for x in required_landmarks
        )


        if all_visible:

            # =================================================
            # CALCULATE RAW ANGLES
            # =================================================

            raw_left_angle = calculate_angle(
                left_hip,
                left_knee,
                left_ankle
            )

            raw_right_angle = calculate_angle(
                right_hip,
                right_knee,
                right_ankle
            )


            # =================================================
            # SMOOTH ANGLES
            # =================================================

            left_angle_history.append(
                raw_left_angle
            )

            right_angle_history.append(
                raw_right_angle
            )


            left_knee_angle = sum(
                left_angle_history
            ) / len(
                left_angle_history
            )


            right_knee_angle = sum(
                right_angle_history
            ) / len(
                right_angle_history
            )


            # =================================================
            # CALIBRATION
            # =================================================

            if state == "CALIBRATING":

                left_calibration_values.append(
                    left_knee_angle
                )

                right_calibration_values.append(
                    right_knee_angle
                )


                calibration_count = len(
                    left_calibration_values
                )


                display_status = (
                    f"CALIBRATING "
                    f"{calibration_count}/"
                    f"{CALIBRATION_FRAMES}"
                )

                feedback = (
                    "Stand normally"
                )


                # ---------------------------------------------
                # FINISH CALIBRATION
                # ---------------------------------------------

                if (
                    calibration_count
                    >=
                    CALIBRATION_FRAMES
                ):

                    left_baseline = (
                        sum(
                            left_calibration_values
                        )
                        /
                        len(
                            left_calibration_values
                        )
                    )


                    right_baseline = (
                        sum(
                            right_calibration_values
                        )
                        /
                        len(
                            right_calibration_values
                        )
                    )


                    state = "STANDING"


                    display_status = "READY"

                    feedback = (
                        "Calibration complete"
                    )


                    print()
                    print(
                        "Calibration complete."
                    )

                    print(
                        f"Left baseline: "
                        f"{left_baseline:.1f}"
                    )

                    print(
                        f"Right baseline: "
                        f"{right_baseline:.1f}"
                    )

                    print()


                    if voice_available:

                        speak(
                            "Calibration complete. Begin your squat."
                        )


            # =================================================
            # AFTER CALIBRATION
            # =================================================

            else:

                # ------------------------------------------------
                # CALCULATE FLEXION FROM PERSONAL BASELINE
                # ------------------------------------------------

                left_flexion = (
                    left_baseline
                    -
                    left_knee_angle
                )


                right_flexion = (
                    right_baseline
                    -
                    right_knee_angle
                )


                average_flexion = (
                    left_flexion
                    +
                    right_flexion
                ) / 2


                # =================================================
                # STANDING
                # =================================================

                if state == "STANDING":

                    display_status = "READY"

                    feedback = "Ready"


                    # Start a new squat only if
                    # there is REAL movement.

                    if average_flexion >= START_FLEXION:

                        state = "DESCENDING"

                        rep_started = True

                        rep_reached_bottom = False

                        rep_good = True

                        rep_feedback = ""


                # =================================================
                # DESCENDING
                # =================================================

                elif state == "DESCENDING":

                    display_status = "DESCENDING"

                    feedback = "Keep going"


                    # ------------------------------------------------
                    # CHECK KNEE ASYMMETRY
                    # ------------------------------------------------

                    angle_difference = abs(
                        left_knee_angle
                        -
                        right_knee_angle
                    )


                    if (
                        angle_difference
                        >
                        MAX_KNEE_ASYMMETRY
                    ):

                        rep_good = False

                        rep_feedback = (
                            "Keep both knees balanced"
                        )


                    # ------------------------------------------------
                    # DID WE REACH BOTTOM?
                    # ------------------------------------------------

                    if (
                        average_flexion
                        >=
                        TARGET_FLEXION
                    ):

                        state = "BOTTOM"

                        rep_reached_bottom = True


                    # ------------------------------------------------
                    # SIGNIFICANT BEND BUT NOT ENOUGH
                    # ------------------------------------------------

                    elif (
                        average_flexion
                        >=
                        MINIMUM_BOTTOM_FLEXION
                    ):

                        display_status = "BEND DEEPER"

                        feedback = (
                            "Bend deeper"
                        )


                        speak_if_needed(
                            "Bend deeper"
                        )


                # =================================================
                # BOTTOM
                # =================================================

                elif state == "BOTTOM":

                    display_status = "GOOD FORM"

                    feedback = "Good depth"


                    # ------------------------------------------------
                    # CHECK ASYMMETRY
                    # ------------------------------------------------

                    angle_difference = abs(
                        left_knee_angle
                        -
                        right_knee_angle
                    )


                    if (
                        angle_difference
                        >
                        MAX_KNEE_ASYMMETRY
                    ):

                        rep_good = False

                        rep_feedback = (
                            "Keep both knees balanced"
                        )

                        display_status = "INCORRECT"

                        feedback = (
                            "Keep both knees balanced"
                        )


                        speak_if_needed(
                            "Keep both knees balanced"
                        )


                    # ------------------------------------------------
                    # CHECK DEPTH
                    # ------------------------------------------------

                    if (
                        average_flexion
                        <
                        MINIMUM_BOTTOM_FLEXION
                    ):

                        rep_good = False

                        rep_feedback = (
                            "Bend deeper"
                        )

                        display_status = "BEND DEEPER"

                        feedback = (
                            "Bend deeper"
                        )


                        speak_if_needed(
                            "Bend deeper"
                        )


                    # ------------------------------------------------
                    # START RETURNING
                    # ------------------------------------------------

                    if average_flexion < START_FLEXION:

                        state = "RETURNING"


                # =================================================
                # RETURNING TO STANDING
                # =================================================

                elif state == "RETURNING":

                    display_status = "RETURNING"

                    feedback = (
                        "Return to standing"
                    )


                    # ------------------------------------------------
                    # CHECK IF STANDING AGAIN
                    # ------------------------------------------------

                    if average_flexion < 5:

                        # --------------------------------------------
                        # ONLY COUNT IF WE ACTUALLY REACHED BOTTOM
                        # --------------------------------------------

                        if (
                            rep_started
                            and
                            rep_reached_bottom
                        ):

                            rep_count += 1


                            # ----------------------------------------
                            # CORRECT REP
                            # ----------------------------------------

                            if rep_good:

                                correct_reps += 1

                                last_feedback = (
                                    "Good rep"
                                )

                                display_status = (
                                    "GOOD REP"
                                )

                                feedback = (
                                    "Good rep"
                                )


                                speak_if_needed(
                                    "Good rep"
                                )


                            # ----------------------------------------
                            # INCORRECT REP
                            # ----------------------------------------

                            else:

                                incorrect_reps += 1

                                last_feedback = (
                                    rep_feedback
                                )


                            print(
                                f"Rep {rep_count} | "
                                f"Correct: "
                                f"{correct_reps} | "
                                f"Incorrect: "
                                f"{incorrect_reps}"
                            )


                        # --------------------------------------------
                        # RESET REP
                        # --------------------------------------------

                        rep_started = False

                        rep_reached_bottom = False

                        rep_good = True

                        rep_feedback = ""

                        state = "STANDING"


            # =================================================
            # DRAW SKELETON
            # =================================================

            connections = [

                # Left arm
                (11, 13),
                (13, 15),

                # Right arm
                (12, 14),
                (14, 16),

                # Shoulders
                (11, 12),

                # Torso
                (11, 23),
                (12, 24),
                (23, 24),

                # Left leg
                (23, 25),
                (25, 27),

                # Right leg
                (24, 26),
                (26, 28),

                # Left foot
                (27, 29),
                (29, 31),

                # Right foot
                (28, 30),
                (30, 32)
            ]


            for start, end in connections:

                draw_connection(
                    frame,
                    landmarks,
                    start,
                    end
                )


            # =================================================
            # DRAW LEFT LEG
            # =================================================

            draw_landmark(
                frame,
                left_hip,
                "L HIP",
                (0, 255, 0)
            )

            draw_landmark(
                frame,
                left_knee,
                "L KNEE",
                (0, 255, 0)
            )

            draw_landmark(
                frame,
                left_ankle,
                "L ANKLE",
                (0, 255, 0)
            )


            # =================================================
            # DRAW RIGHT LEG
            # =================================================

            draw_landmark(
                frame,
                right_hip,
                "R HIP",
                (0, 0, 255)
            )

            draw_landmark(
                frame,
                right_knee,
                "R KNEE",
                (0, 0, 255)
            )

            draw_landmark(
                frame,
                right_ankle,
                "R ANKLE",
                (0, 0, 255)
            )


    # ========================================================
    # INFORMATION PANEL
    # ========================================================

    cv2.rectangle(
        frame,
        (10, 10),
        (360, 285),
        (25, 25, 25),
        -1
    )


    # ========================================================
    # TITLE
    # ========================================================

    cv2.putText(
        frame,
        "REHAB AI",
        (20, 35),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2
    )


    # ========================================================
    # KNEE ANGLES
    # ========================================================

    if (
        left_knee_angle is not None
        and
        right_knee_angle is not None
    ):

        cv2.putText(
            frame,
            f"Left Knee: "
            f"{int(left_knee_angle)} deg",
            (20, 65),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.52,
            (0, 255, 0),
            2
        )


        cv2.putText(
            frame,
            f"Right Knee: "
            f"{int(right_knee_angle)} deg",
            (20, 92),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.52,
            (0, 0, 255),
            2
        )


        if (
            left_baseline is not None
            and
            right_baseline is not None
        ):

            left_flexion = (
                left_baseline
                -
                left_knee_angle
            )

            right_flexion = (
                right_baseline
                -
                right_knee_angle
            )

            average_flexion = (
                left_flexion
                +
                right_flexion
            ) / 2


            cv2.putText(
                frame,
                f"Flexion: "
                f"{int(average_flexion)} deg",
                (20, 119),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.52,
                (255, 255, 255),
                2
            )


    # ========================================================
    # STATE
    # ========================================================

    cv2.putText(
        frame,
        f"State: {state}",
        (20, 147),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.52,
        (255, 255, 255),
        2
    )


    # ========================================================
    # REPS
    # ========================================================

    cv2.putText(
        frame,
        f"Reps: {rep_count}",
        (20, 175),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.58,
        (255, 255, 255),
        2
    )


    # ========================================================
    # FORM COLOR
    # ========================================================

    if display_status in [
        "GOOD FORM",
        "GOOD REP"
    ]:

        status_color = (0, 255, 0)

    elif display_status in [
        "BEND DEEPER",
        "INCORRECT"
    ]:

        status_color = (0, 0, 255)

    elif display_status == "CALIBRATING":

        status_color = (0, 255, 255)

    else:

        status_color = (255, 255, 255)


    # ========================================================
    # STATUS
    # ========================================================

    cv2.putText(
        frame,
        display_status,
        (20, 205),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.62,
        status_color,
        2
    )


    # ========================================================
    # FEEDBACK
    # ========================================================

    if feedback:

        cv2.putText(
            frame,
            feedback,
            (20, 233),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.48,
            status_color,
            1
        )


    # ========================================================
    # SCORE
    # ========================================================

    if rep_count > 0:

        score = (
            correct_reps
            /
            rep_count
        ) * 100

    else:

        score = 0


    cv2.putText(
        frame,
        f"Score: {int(score)}%",
        (20, 260),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 255, 255),
        2
    )


    # ========================================================
    # SHOW CAMERA
    # ========================================================

    cv2.imshow(
        "Rehab AI - Privacy First",
        frame
    )


    # ========================================================
    # QUIT
    # ========================================================

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):

        break


# ============================================================
# 14. CLEANUP
# ============================================================

camera.release()

cv2.destroyAllWindows()

landmarker.close()


# ============================================================
# 15. FINAL REPORT
# ============================================================

print()
print("==============================================")
print("             REHAB AI REPORT")
print("==============================================")

print(
    f"Total repetitions    : {rep_count}"
)

print(
    f"Correct repetitions  : {correct_reps}"
)

print(
    f"Incorrect repetitions: {incorrect_reps}"
)


if rep_count > 0:

    final_score = (
        correct_reps
        /
        rep_count
    ) * 100

    print(
        f"Technique score      : "
        f"{final_score:.1f}%"
    )

else:

    print(
        "Technique score      : N/A"
    )


print()
print(
    "Raw video was not recorded or saved."
)

print("==============================================")