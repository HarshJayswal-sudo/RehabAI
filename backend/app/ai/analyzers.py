"""
analyzers.py
------------
Real-time state machines and form evaluators for live rehabilitation exercises.
"""
from typing import Dict, Any, List, Optional


class BaseLiveAnalyzer:
    """Base interface for real-time exercise analysis."""
    def __init__(self, exercise_code: str, name: str):
        self.exercise_code = exercise_code
        self.name = name
        self.reps = 0
        self.phase = "ready"
        self.current_rep_errors: List[str] = []
        self.current_rep_score = 100
        self.repetitions_detail: List[Dict[str, Any]] = []
        self.session_scores: List[float] = []
        self.session_roms: List[float] = []

    def update(self, pose_data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

    def get_session_results(self) -> Dict[str, Any]:
        avg_score = round(sum(self.session_scores) / len(self.session_scores), 1) if self.session_scores else 100.0
        avg_rom = round(sum(self.session_roms) / len(self.session_roms), 1) if self.session_roms else 90.0
        correct_reps = sum(1 for r in self.repetitions_detail if r.get("score", 0) >= 80)
        
        all_errors = []
        for r in self.repetitions_detail:
            all_errors.extend(r.get("errors", []))

        return {
            "exercise": self.exercise_code,
            "repetitions": self.reps,
            "correct_repetitions": correct_reps,
            "incorrect_repetitions": self.reps - correct_reps,
            "average_score": avg_score,
            "score": avg_score,
            "average_rom": avg_rom,
            "errors": list(set(all_errors)),
            "feedback": f"Completed {self.reps} repetitions with an average form score of {avg_score}%.",
            "repetitions_detail": self.repetitions_detail,
        }


class LiveSquatAnalyzer(BaseLiveAnalyzer):
    def __init__(self):
        super().__init__("squat", "Bodyweight Squat")
        self.phase = "standing"
        self.lowest_angle = 180.0
        self.starting_angle = 175.0

    def update(self, pose_data: Dict[str, Any]) -> Dict[str, Any]:
        l_knee = pose_data.get("left_knee_angle", 180.0)
        r_knee = pose_data.get("right_knee_angle", 180.0)
        torso_angle = pose_data.get("torso_angle", 0.0)
        symmetry = pose_data.get("symmetry", 100.0)

        # Primary angle: minimum of left and right knee
        knee_angle = min(l_knee, r_knee)
        hip_angle = min(pose_data.get("left_hip_angle", 175.0), pose_data.get("right_hip_angle", 175.0))

        if knee_angle < self.lowest_angle:
            self.lowest_angle = knee_angle

        status = "good"
        feedback = "Maintain steady form"

        # State machine
        if self.phase == "standing":
            feedback = "Stand tall and begin squatting"
            if knee_angle < 160:
                self.phase = "descending"
                self.lowest_angle = knee_angle
                self.current_rep_score = 100
                self.current_rep_errors = []

        elif self.phase == "descending":
            if knee_angle > 115:
                feedback = "Bend deeper — aim for 90 degrees"
                status = "warning"
            else:
                feedback = "Great depth! Hold and push up"
                status = "good"

            if knee_angle <= 105:
                self.phase = "bottom"

        elif self.phase == "bottom":
            feedback = "Push through feet to stand up"
            if knee_angle > 110:
                self.phase = "ascending"

        elif self.phase == "ascending":
            feedback = "Straighten up fully"
            if knee_angle >= 160:
                self.phase = "standing"
                self.reps += 1

                # Evaluate rep form
                if self.lowest_angle > 120:
                    self.current_rep_score -= 20
                    self.current_rep_errors.append("shallow_squat")
                if torso_angle > 40:
                    self.current_rep_score -= 20
                    self.current_rep_errors.append("forward_lean")
                if symmetry < 75:
                    self.current_rep_score -= 15
                    self.current_rep_errors.append("asymmetric_loading")

                self.current_rep_score = max(0, self.current_rep_score)
                rom = round(max(0.0, 180.0 - self.lowest_angle), 1)

                if "shallow_squat" in self.current_rep_errors:
                    feedback = "Rep counted! Go a little deeper next rep."
                    status = "warning"
                elif "forward_lean" in self.current_rep_errors:
                    feedback = "Rep counted! Keep your chest more upright."
                    status = "warning"
                else:
                    feedback = "Excellent rep! Keep it up."
                    status = "good"

                self.session_scores.append(self.current_rep_score)
                self.session_roms.append(rom)
                self.repetitions_detail.append({
                    "rep": self.reps,
                    "score": self.current_rep_score,
                    "lowest_angle": round(self.lowest_angle, 1),
                    "rom": rom,
                    "errors": self.current_rep_errors.copy(),
                    "feedback": feedback,
                })
                self.lowest_angle = 180.0

        current_form_score = round(sum(self.session_scores) / len(self.session_scores), 1) if self.session_scores else self.current_rep_score

        return {
            "exercise": self.name,
            "rep": self.reps,
            "formScore": current_form_score,
            "symmetry": symmetry,
            "status": status,
            "feedback": feedback,
            "kneeAngle": knee_angle,
            "hipAngle": hip_angle,
            "phase": self.phase,
        }


class LiveLegExtensionAnalyzer(BaseLiveAnalyzer):
    def __init__(self):
        super().__init__("leg_extension", "Leg Extension")
        self.phase = "seated_bent"
        self.highest_angle = 0.0
        self.starting_angle = 90.0

    def update(self, pose_data: Dict[str, Any]) -> Dict[str, Any]:
        l_knee = pose_data.get("left_knee_angle", 90.0)
        r_knee = pose_data.get("right_knee_angle", 90.0)
        symmetry = pose_data.get("symmetry", 100.0)
        knee_angle = max(l_knee, r_knee)
        hip_angle = min(pose_data.get("left_hip_angle", 90.0), pose_data.get("right_hip_angle", 90.0))

        if knee_angle > self.highest_angle:
            self.highest_angle = knee_angle

        status = "good"
        feedback = "Sit upright and extend your leg"

        if self.phase == "seated_bent":
            if knee_angle > 110:
                self.phase = "extending"
                self.current_rep_score = 100
                self.current_rep_errors = []
                self.highest_angle = knee_angle

        elif self.phase == "extending":
            feedback = "Extend leg straight forward"
            if knee_angle >= 160:
                self.phase = "fully_extended"
                feedback = "Hold full extension briefly"

        elif self.phase == "fully_extended":
            if knee_angle < 155:
                self.phase = "bending"
                feedback = "Lower slowly under control"

        elif self.phase == "bending":
            if knee_angle <= 100:
                self.phase = "seated_bent"
                self.reps += 1

                if self.highest_angle < 150:
                    self.current_rep_score -= 20
                    self.current_rep_errors.append("incomplete_extension")
                    feedback = "Kick higher! Try to fully straighten your leg."
                    status = "warning"
                else:
                    feedback = "Great extension. Keep it up!"
                    status = "good"

                rom = round(max(0.0, self.highest_angle - self.starting_angle), 1)
                self.session_scores.append(self.current_rep_score)
                self.session_roms.append(rom)
                self.repetitions_detail.append({
                    "rep": self.reps,
                    "score": self.current_rep_score,
                    "highest_angle": round(self.highest_angle, 1),
                    "rom": rom,
                    "errors": self.current_rep_errors.copy(),
                    "feedback": feedback,
                })
                self.highest_angle = 0.0

        current_form_score = round(sum(self.session_scores) / len(self.session_scores), 1) if self.session_scores else self.current_rep_score

        return {
            "exercise": self.name,
            "rep": self.reps,
            "formScore": current_form_score,
            "symmetry": symmetry,
            "status": status,
            "feedback": feedback,
            "kneeAngle": knee_angle,
            "hipAngle": hip_angle,
            "phase": self.phase,
        }


class LiveWallPushupAnalyzer(BaseLiveAnalyzer):
    def __init__(self):
        super().__init__("wall_pushup", "Wall Push-Up")
        self.phase = "arms_extended"
        self.lowest_angle = 180.0

    def update(self, pose_data: Dict[str, Any]) -> Dict[str, Any]:
        l_elbow = pose_data.get("left_elbow_angle", 170.0)
        r_elbow = pose_data.get("right_elbow_angle", 170.0)
        elbow_angle = min(l_elbow, r_elbow)
        symmetry = max(0.0, min(100.0, round(100.0 - abs(l_elbow - r_elbow), 1)))

        if elbow_angle < self.lowest_angle:
            self.lowest_angle = elbow_angle

        status = "good"
        feedback = "Keep body straight and bend elbows toward wall"

        if self.phase == "arms_extended":
            if elbow_angle < 155:
                self.phase = "bending"
                self.lowest_angle = elbow_angle
                self.current_rep_score = 100
                self.current_rep_errors = []

        elif self.phase == "bending":
            feedback = "Bring chest toward the wall"
            if elbow_angle <= 100:
                self.phase = "inflection"
                feedback = "Good depth! Push back smoothly"

        elif self.phase == "inflection":
            if elbow_angle > 105:
                self.phase = "pushing"

        elif self.phase == "pushing":
            feedback = "Push all the way back"
            if elbow_angle >= 155:
                self.phase = "arms_extended"
                self.reps += 1

                if self.lowest_angle > 115:
                    self.current_rep_score -= 20
                    self.current_rep_errors.append("shallow_depth")
                    feedback = "Bend elbows deeper toward wall."
                    status = "warning"
                else:
                    feedback = "Great push-up form!"
                    status = "good"

                rom = round(max(0.0, 180.0 - self.lowest_angle), 1)
                self.session_scores.append(self.current_rep_score)
                self.session_roms.append(rom)
                self.repetitions_detail.append({
                    "rep": self.reps,
                    "score": self.current_rep_score,
                    "lowest_angle": round(self.lowest_angle, 1),
                    "rom": rom,
                    "errors": self.current_rep_errors.copy(),
                    "feedback": feedback,
                })
                self.lowest_angle = 180.0

        current_form_score = round(sum(self.session_scores) / len(self.session_scores), 1) if self.session_scores else self.current_rep_score

        return {
            "exercise": self.name,
            "rep": self.reps,
            "formScore": current_form_score,
            "symmetry": symmetry,
            "status": status,
            "feedback": feedback,
            "kneeAngle": elbow_angle,  # Generic display angle
            "hipAngle": pose_data.get("torso_angle", 0.0),
            "phase": self.phase,
        }


class LiveLungeAnalyzer(BaseLiveAnalyzer):
    def __init__(self):
        super().__init__("bodyweight_lunge", "Bodyweight Lunge")
        self.phase = "standing"
        self.lowest_angle = 180.0

    def update(self, pose_data: Dict[str, Any]) -> Dict[str, Any]:
        l_knee = pose_data.get("left_knee_angle", 180.0)
        r_knee = pose_data.get("right_knee_angle", 180.0)
        front_knee = min(l_knee, r_knee)
        symmetry = pose_data.get("symmetry", 100.0)

        if front_knee < self.lowest_angle:
            self.lowest_angle = front_knee

        status = "good"
        feedback = "Step forward and lower hips"

        if self.phase == "standing":
            if front_knee < 155:
                self.phase = "stepping_down"
                self.lowest_angle = front_knee
                self.current_rep_score = 100
                self.current_rep_errors = []

        elif self.phase == "stepping_down":
            feedback = "Lower back knee toward the floor"
            if front_knee <= 105:
                self.phase = "bottom"
                feedback = "Hold and push back through front heel"

        elif self.phase == "bottom":
            if front_knee > 110:
                self.phase = "returning"

        elif self.phase == "returning":
            if front_knee >= 160:
                self.phase = "standing"
                self.reps += 1

                if self.lowest_angle > 115:
                    self.current_rep_score -= 20
                    self.current_rep_errors.append("shallow_lunge")
                    feedback = "Lower your hips more next rep."
                    status = "warning"
                else:
                    feedback = "Great lunge depth!"
                    status = "good"

                rom = round(max(0.0, 180.0 - self.lowest_angle), 1)
                self.session_scores.append(self.current_rep_score)
                self.session_roms.append(rom)
                self.repetitions_detail.append({
                    "rep": self.reps,
                    "score": self.current_rep_score,
                    "lowest_angle": round(self.lowest_angle, 1),
                    "rom": rom,
                    "errors": self.current_rep_errors.copy(),
                    "feedback": feedback,
                })
                self.lowest_angle = 180.0

        current_form_score = round(sum(self.session_scores) / len(self.session_scores), 1) if self.session_scores else self.current_rep_score

        return {
            "exercise": self.name,
            "rep": self.reps,
            "formScore": current_form_score,
            "symmetry": symmetry,
            "status": status,
            "feedback": feedback,
            "kneeAngle": front_knee,
            "hipAngle": pose_data.get("left_hip_angle", 170.0),
            "phase": self.phase,
        }


class LiveWindwheelAnalyzer(BaseLiveAnalyzer):
    def __init__(self):
        super().__init__("windwheel_toe_touch", "Windwheel Toe Touch")
        self.phase = "standing_wide"
        self.lowest_hip_angle = 180.0

    def update(self, pose_data: Dict[str, Any]) -> Dict[str, Any]:
        l_hip = pose_data.get("left_hip_angle", 175.0)
        r_hip = pose_data.get("right_hip_angle", 175.0)
        hip_hinge = min(l_hip, r_hip)
        symmetry = pose_data.get("symmetry", 100.0)

        if hip_hinge < self.lowest_hip_angle:
            self.lowest_hip_angle = hip_hinge

        status = "good"
        feedback = "Stand with arms wide and rotate to touch opposite foot"

        if self.phase == "standing_wide":
            if hip_hinge < 150:
                self.phase = "reaching_down"
                self.lowest_hip_angle = hip_hinge
                self.current_rep_score = 100
                self.current_rep_errors = []

        elif self.phase == "reaching_down":
            feedback = "Reach down toward opposite toe"
            if hip_hinge <= 85:
                self.phase = "touched_bottom"
                feedback = "Touch and rotate back smoothly"

        elif self.phase == "touched_bottom":
            if hip_hinge > 95:
                self.phase = "rotating_up"

        elif self.phase == "rotating_up":
            if hip_hinge >= 155:
                self.phase = "standing_wide"
                self.reps += 1

                if self.lowest_hip_angle > 95:
                    self.current_rep_score -= 20
                    self.current_rep_errors.append("incomplete_reach")
                    feedback = "Hinge deeper to reach the toe."
                    status = "warning"
                else:
                    feedback = "Great flexibility and rotation!"
                    status = "good"

                rom = round(max(0.0, 180.0 - self.lowest_hip_angle), 1)
                self.session_scores.append(self.current_rep_score)
                self.session_roms.append(rom)
                self.repetitions_detail.append({
                    "rep": self.reps,
                    "score": self.current_rep_score,
                    "lowest_angle": round(self.lowest_hip_angle, 1),
                    "rom": rom,
                    "errors": self.current_rep_errors.copy(),
                    "feedback": feedback,
                })
                self.lowest_hip_angle = 180.0

        current_form_score = round(sum(self.session_scores) / len(self.session_scores), 1) if self.session_scores else self.current_rep_score

        return {
            "exercise": self.name,
            "rep": self.reps,
            "formScore": current_form_score,
            "symmetry": symmetry,
            "status": status,
            "feedback": feedback,
            "kneeAngle": pose_data.get("left_knee_angle", 175.0),
            "hipAngle": hip_hinge,
            "phase": self.phase,
        }


def get_analyzer(exercise_code: Optional[str] = None) -> BaseLiveAnalyzer:
    """Factory creating the appropriate analyzer for an exercise code."""
    code = (exercise_code or "squat").lower().strip().replace(" ", "_").replace("-", "_")
    if "extension" in code:
        return LiveLegExtensionAnalyzer()
    elif "pushup" in code or "push_up" in code:
        return LiveWallPushupAnalyzer()
    elif "lunge" in code:
        return LiveLungeAnalyzer()
    elif "toe_touch" in code or "windwheel" in code:
        return LiveWindwheelAnalyzer()
    else:
        return LiveSquatAnalyzer()

