class LegExtensionAnalyzer:
    def __init__(self):
        self.phase = "seated_bent"
        self.reps = 0
        self.highest_angle = 0.0  # Tracking how straight the leg gets
        self.starting_angle = 90.0
        
        # Current rep tracking
        self.current_rep_errors = []
        self.current_rep_score = 100
        
        # Overall session tracking
        self.session_roms = []
        self.session_scores = []
        self.repetitions_detail = []

    def update(self, knee_angle):
        # Track the highest angle (how straight the leg gets)
        if knee_angle > self.highest_angle:
            self.highest_angle = knee_angle

        # Phase: Seated -> Extending (lifting the weight)
        if self.phase == "seated_bent" and knee_angle > 110:
            self.phase = "extending"
            self.current_rep_score = 100
            self.current_rep_errors = []

        # Phase: Extending -> Fully Extended (top of the movement)
        elif self.phase == "extending" and knee_angle >= 160:
            self.phase = "fully_extended"

        # Phase: Fully Extended -> Bending (lowering the weight)
        elif self.phase == "fully_extended" and knee_angle < 160:
            self.phase = "bending"

        # Phase: Bending -> Seated (Repetition Completed)
        elif self.phase == "bending" and knee_angle <= 100:
            self.phase = "seated_bent"
            self.reps += 1
            
            # Evaluate Form: Did they fully straighten their leg?
            if self.highest_angle < 150:
                self.current_rep_score -= 20
                self.current_rep_errors.append("incomplete_extension")
                feedback_text = "Kick higher! Try to fully straighten your leg."
            else:
                feedback_text = "Great extension. Keep it up!"
            
            # Calculate ROM
            rom = self.highest_angle - self.starting_angle
            
            # Save rep details
            self.repetitions_detail.append({
                "rep": self.reps,
                "score": self.current_rep_score,
                "highest_angle": round(self.highest_angle, 1),
                "rom": round(rom, 1),
                "errors": self.current_rep_errors.copy(),
                "feedback": feedback_text
            })
            
            # Update session metrics
            self.session_scores.append(self.current_rep_score)
            self.session_roms.append(rom)
            
            # Reset highest angle for the next repetition
            self.highest_angle = 0.0

    def get_session_results(self):
        avg_score = sum(self.session_scores) / len(self.session_scores) if self.session_scores else 0
        avg_rom = sum(self.session_roms) / len(self.session_roms) if self.session_roms else 0
        
        return {
            "exercise": "leg_extension",
            "repetitions": self.reps,
            "average_score": round(avg_score, 1),
            "average_rom": round(avg_rom, 1),
            "repetitions_detail": self.repetitions_detail
        }