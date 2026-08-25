class SquatAnalyzer:
    def __init__(self):
        self.state = 'STANDING'
        self.reps = 0
        self.rep_details = []
        self.start_angle = 180.0
        self.lowest_angle_in_rep = 180.0
        self.has_lean_error = False

    def update(self, angle, torso_angle=0.0):
        if self.state == 'STANDING':
            if angle < 155:
                self.state = 'DESCENDING'
                self.start_angle = angle
                self.lowest_angle_in_rep = angle
                self.has_lean_error = torso_angle > 45
        elif self.state in ['DESCENDING', 'BOTTOM', 'ASCENDING']:
            self.lowest_angle_in_rep = min(self.lowest_angle_in_rep, angle)
            if torso_angle > 45:
                self.has_lean_error = True
            
            if self.state == 'DESCENDING' and angle <= 100:
                self.state = 'BOTTOM'
            elif self.state == 'DESCENDING' and angle > 100 and angle >= 155:
                # Early return without reaching bottom, check if sufficient ROM to count as a bad rep
                if self.start_angle - self.lowest_angle_in_rep >= 30:
                    self._count_rep()
                self.state = 'STANDING'
            elif self.state == 'BOTTOM' and angle > 100:
                self.state = 'ASCENDING'
            elif self.state == 'ASCENDING' and angle >= 155:
                if self.start_angle - self.lowest_angle_in_rep >= 30:
                    self._count_rep()
                self.state = 'STANDING'

    def _count_rep(self):
        self.reps += 1
        score = 100
        errors = []
        rom = max(0, self.start_angle - self.lowest_angle_in_rep)
        
        if self.lowest_angle_in_rep > 100:
            score -= 20
            errors.append('shallow_depth')
        if self.has_lean_error:
            score -= 15
            errors.append('excessive_forward_lean')
            
        if score == 100:
            feedback = 'Good form. Keep going!'
        elif 'shallow_depth' in errors:
            feedback = 'Squat lower to reach full depth.'
        elif 'excessive_forward_lean' in errors:
            feedback = 'Keep your chest up to avoid excessive leaning.'
        else:
            feedback = 'Watch your form.'
            
        self.rep_details.append({
            'rep': self.reps,
            'score': max(0, score),
            'lowest_angle': float(self.lowest_angle_in_rep),
            'rom': float(rom),
            'errors': errors,
            'feedback': feedback
        })

    def get_session_results(self):
        avg_score = sum(r['score'] for r in self.rep_details) / self.reps if self.reps > 0 else 0.0
        avg_rom = sum(r['rom'] for r in self.rep_details) / self.reps if self.reps > 0 else 0.0
        return {
            'exercise': 'squat',
            'repetitions': self.reps,
            'average_score': float(avg_score),
            'average_rom': float(avg_rom),
            'repetitions_detail': self.rep_details
        }
