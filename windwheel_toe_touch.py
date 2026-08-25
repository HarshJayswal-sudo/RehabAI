class WindwheelToeTouchAnalyzer:
    def __init__(self):
        self.phase = "standing"
        self.reps = 0
        self.lowest_angle = 180.0
        self.starting_angle = 180.0
        
        # Current rep tracking
        self.current_rep_errors = []
        self.current_rep_score = 100
        
        # Overall session tracking
        self.session_roms = []
        self.session_scores = []
        self.repetitions_detail = []

    def update(self, hip_angle):
        # Track the deepest part of the stretch
        if hip_angle < self.lowest_angle:
            self.lowest_angle = hip_angle

        # Phase: Standing -> Bending (reaching for the toe)
        if self.phase == "standing" and hip_angle < 160:
            self.phase = "bending"
            self.current_rep_score = 100
            self.current_rep_errors = []

        # Phase: Bending -> Touching (bottom of the movement)
        elif self.phase == "bending" and hip_angle <= 100:
            self.phase = "touching"

        # Phase: Touching -> Returning (standing back up)
        elif self.phase == "touching" and hip_angle > 100:
            self.phase = "returning"

        # Phase: Returning -> Standing (Repetition Completed)
        elif self.phase == "returning" and hip_angle >= 160:
            self.phase = "standing"
            self.reps += 1
            
            # Evaluate Form: Did they hinge deep enough?
            if self.lowest_angle > 110:
                self.current_rep_score -= 20
                self.current_rep_errors.append("shallow_stretch")
                feedback_text = "Bend deeper at the hips! Try to touch your toes."
            else:
                feedback_text = "Great hip hinge and flexibility!"
            
            # Calculate ROM
            rom = self.starting_angle - self.lowest_angle
            
            # Save rep details
            self.repetitions_detail.append({
                "rep": self.reps,
                "score": self.current_rep_score,
                "lowest_angle": round(self.lowest_angle, 1),
                "rom": round(rom, 1),
                "errors": self.current_rep_errors.copy(),
                "feedback": feedback_text
            })
            
            # Update session metrics
            self.session_scores.append(self.current_rep_score)
            self.session_roms.append(rom)
            
            # Reset lowest angle for the next repetition
            self.lowest_angle = 180.0

    def get_session_results(self):
        avg_score = sum(self.session_scores) / len(self.session_scores) if self.session_scores else 0
        avg_rom = sum(self.session_roms) / len(self.session_roms) if self.session_roms else 0
        
        return {
            "exercise": "windwheel_toe_touch",
            "repetitions": self.reps,
            "average_score": round(avg_score, 1),
            "average_rom": round(avg_rom, 1),
            "repetitions_detail": self.repetitions_detail
        }