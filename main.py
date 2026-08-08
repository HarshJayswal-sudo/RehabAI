import cv2
import math
import os
import time
import threading
import queue

import pyttsx3
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = os.path.join(
    "models",
    "pose_landmarker_full.task"
)

CAMERA_INDEX = 0

# Prototype thresholds.
# These are NOT clinical prescriptions.
STANDING_ANGLE = 160
BOTTOM_ANGLE = 120
MAX_ASYMMETRY = 20

MIN_VISIBILITY = 0.5

# Minimum time before repeating the same voice instruction.
VOICE_COOLDOWN = 3.0


# ============================================================
# CHECK MODEL
# ============================================================

if not os.path.exists(MODEL_PATH):

    print()
    print("ERROR: Pose model not found.")
    print()
    print("Expected file:")
    print(MODEL_PATH)
    print()
    print("Folder structure should be:")
    print("rehab_ai/")
    print("    main.py")
    print("    models/")
    print("        pose_landmarker_full.task")
    print()

    raise SystemExit


# ============================================================
# VOICE SYSTEM
# ============================================================

voice_queue = queue.Queue()

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

    print("Voice engine initialized.")

except Exception as error:

    print(
        "WARNING: Voice engine could not start."
    )

    print(error)

    voice_available = False


def voice_worker():

    """
    One dedicated worker handles all speech.

    This prevents multiple speech threads
    from fighting with each other.
    """

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

    voice_thread = threading.Thread(
        target=voice_worker,
        daemon=True
    )

    voice_thread.start()


# ============================================================
# VOICE CONTROL
# ============================================================

last_spoken_message = ""

last_spoken_time = 0


def speak(message):

    """
    Put a message into the voice queue.
    """

    if not voice_available:

        return

    if not message:

        return

    voice_queue.put(message)


def speak_if_needed(message):

    """
    Prevent the same instruction from
    being spoken continuously.
    """

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
# ANGLE CALCULATION
# ============================================================

def calculate_angle(a, b, c):

    """
    Calculate angle at point B.

        A
         \
          B
           \
            C
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
# LANDMARK VISIBILITY
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
# DRAW LANDMARK
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
# DRAW SKELETON CONNECTION
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
# CREATE MEDIAPIPE POSE LANDMARKER
# ============================================================

base_options = python.BaseOptions(
    model_asset_path=MODEL_PATH
)

options = vision.PoseLandmarkerOptions(
    base_options=base_options,

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
# OPEN CAMERA
# ============================================================

camera = cv2.VideoCapture(
    CAMERA_INDEX
)

if not camera.isOpened():

    print(
        "ERROR: Could not open camera."
    )

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
# STARTUP
# ============================================================

print()
print("========================================")
print("          REHAB AI MVP")
print("========================================")
print()
print("Camera : READY")
print("Pose AI: READY")

if voice_available:

    print("Voice  : READY")

else:

    print("Voice  : DISABLED")

print()
print("Instructions:")
print("1. Stand where your full body is visible.")
print("2. Face the camera.")
print("3. Perform slow squats.")
print("4. Listen for corrections.")
print("5. Press Q to stop.")
print()


# ============================================================
# STARTUP VOICE TEST
# ============================================================

if voice_available:

    time.sleep(1)

    speak(
        "Rehab AI is ready. Begin your exercise."
    )


# ============================================================
# SESSION VARIABLES
# ============================================================

rep_count = 0

correct_reps = 0

incorrect_reps = 0

current_state = "STANDING"

rep_started = False

rep_good = True

rep_feedback = ""

last_feedback = "READY"


# ============================================================
# MAIN LOOP
# ============================================================

while True:

    # --------------------------------------------------------
    # READ CAMERA
    # --------------------------------------------------------

    success, frame = camera.read()

    if not success:

        print(
            "ERROR: Could not read camera frame."
        )

        break


    # Mirror image.
    frame = cv2.flip(
        frame,
        1
    )


    # --------------------------------------------------------
    # CONVERT BGR → RGB
    # --------------------------------------------------------

    rgb_frame = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )


    # --------------------------------------------------------
    # CREATE MEDIAPIPE IMAGE
    # --------------------------------------------------------

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb_frame
    )


    # --------------------------------------------------------
    # RUN POSE AI
    # --------------------------------------------------------

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
    # DEFAULT VALUES
    # ========================================================

    form_status = "NO PERSON"

    feedback = ""

    left_knee_angle = None

    right_knee_angle = None


    # ========================================================
    # PERSON DETECTED
    # ========================================================

    if result.pose_landmarks:

        landmarks = result.pose_landmarks[0]


        # ----------------------------------------------------
        # GET LANDMARKS
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

        required = [

            left_hip,
            left_knee,
            left_ankle,

            right_hip,
            right_knee,
            right_ankle

        ]

        all_visible = all(
            landmark_is_visible(x)
            for x in required
        )


        if all_visible:

            # ------------------------------------------------
            # CALCULATE ANGLES
            # ------------------------------------------------

            left_knee_angle = calculate_angle(
                left_hip,
                left_knee,
                left_ankle
            )

            right_knee_angle = calculate_angle(
                right_hip,
                right_knee,
                right_ankle
            )


            # ------------------------------------------------
            # AVERAGE ANGLE
            # ------------------------------------------------

            average_angle = (
                left_knee_angle
                +
                right_knee_angle
            ) / 2


            # ------------------------------------------------
            # DETERMINE STATE
            # ------------------------------------------------

            if average_angle > STANDING_ANGLE:

                new_state = "STANDING"

            elif average_angle > BOTTOM_ANGLE:

                new_state = "DESCENDING"

            else:

                new_state = "BOTTOM"


            # =================================================
            # START REP
            # =================================================

            if (
                new_state == "DESCENDING"
                and
                not rep_started
            ):

                rep_started = True

                rep_good = True

                rep_feedback = ""


            # =================================================
            # FORM ANALYSIS
            # =================================================

            if rep_started:

                # ---------------------------------------------
                # KNEE SYMMETRY
                # ---------------------------------------------

                angle_difference = abs(
                    left_knee_angle
                    -
                    right_knee_angle
                )


                if angle_difference > MAX_ASYMMETRY:

                    rep_good = False

                    rep_feedback = (
                        "Keep both knees balanced"
                    )


                # ---------------------------------------------
                # SQUAT DEPTH
                # ---------------------------------------------

                if new_state == "BOTTOM":

                    if (
                        left_knee_angle > BOTTOM_ANGLE
                        or
                        right_knee_angle > BOTTOM_ANGLE
                    ):

                        rep_good = False

                        rep_feedback = (
                            "Bend deeper"
                        )


            # =================================================
            # LIVE FEEDBACK
            # =================================================

            if rep_started:

                if rep_good:

                    form_status = "GOOD FORM"

                    feedback = "Keep going"

                else:

                    form_status = "INCORRECT"

                    feedback = rep_feedback

                    speak_if_needed(
                        feedback
                    )


            # =================================================
            # REP COMPLETION
            # =================================================

            if (
                rep_started
                and
                new_state == "STANDING"
                and
                current_state != "STANDING"
            ):

                rep_count += 1


                if rep_good:

                    correct_reps += 1

                    last_feedback = "Good rep"

                    speak_if_needed(
                        "Good rep"
                    )

                else:

                    incorrect_reps += 1

                    last_feedback = rep_feedback


                rep_started = False

                rep_good = True

                rep_feedback = ""


            # ------------------------------------------------
            # UPDATE STATE
            # ------------------------------------------------

            current_state = new_state


            # =================================================
            # READY MESSAGE
            # =================================================

            if not rep_started:

                form_status = "READY"

                feedback = last_feedback


            # =================================================
            # DRAW SKELETON
            # =================================================

            connections = [

                (11, 13),
                (13, 15),

                (12, 14),
                (14, 16),

                (11, 12),

                (11, 23),
                (12, 24),

                (23, 24),

                (23, 25),
                (25, 27),

                (24, 26),
                (26, 28),

                (27, 29),
                (29, 31),

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
            # LEFT LEG
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
            # RIGHT LEG
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
        (330, 255),
        (25, 25, 25),
        -1
    )


    # --------------------------------------------------------
    # KNEE ANGLES
    # --------------------------------------------------------

    if left_knee_angle is not None:

        cv2.putText(
            frame,
            f"Left Knee: {int(left_knee_angle)} deg",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            f"Right Knee: {int(right_knee_angle)} deg",
            (20, 68),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (0, 0, 255),
            2
        )


    # --------------------------------------------------------
    # STATE
    # --------------------------------------------------------

    cv2.putText(
        frame,
        f"State: {current_state}",
        (20, 96),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        2
    )


    # --------------------------------------------------------
    # REPS
    # --------------------------------------------------------

    cv2.putText(
        frame,
        f"Reps: {rep_count}",
        (20, 124),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2
    )


    # --------------------------------------------------------
    # FORM STATUS
    # --------------------------------------------------------

    if form_status == "GOOD FORM":

        status_color = (0, 255, 0)

    elif form_status == "INCORRECT":

        status_color = (0, 0, 255)

    else:

        status_color = (255, 255, 255)


    cv2.putText(
        frame,
        form_status,
        (20, 154),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        status_color,
        2
    )


    # --------------------------------------------------------
    # FEEDBACK
    # --------------------------------------------------------

    if feedback:

        cv2.putText(
            frame,
            feedback,
            (20, 184),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.48,
            status_color,
            1
        )


    # --------------------------------------------------------
    # SCORE
    # --------------------------------------------------------

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
        (20, 215),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        2
    )


    # --------------------------------------------------------
    # PRIVACY
    # --------------------------------------------------------

    cv2.putText(
        frame,
        "LOCAL AI - VIDEO NOT SAVED",
        (20, 242),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.38,
        (200, 200, 200),
        1
    )


    # ========================================================
    # SHOW CAMERA
    # ========================================================

    cv2.imshow(
        "Rehab AI - Privacy First MVP",
        frame
    )


    # ========================================================
    # QUIT
    # ========================================================

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):

        break


# ============================================================
# CLEAN UP
# ============================================================

camera.release()

cv2.destroyAllWindows()

landmarker.close()


# ============================================================
# FINAL REPORT
# ============================================================

print()
print("========================================")
print("          REHAB AI SESSION")
print("========================================")

print(
    f"Total repetitions   : {rep_count}"
)

print(
    f"Correct repetitions : {correct_reps}"
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
        f"Technique score     : {final_score:.1f}%"
    )

else:

    print(
        "Technique score     : N/A"
    )


print()
print("Raw video was not recorded or saved.")
print("========================================")