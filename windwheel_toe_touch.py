class WindwheelToeTouchAnalyzer:
    def __init__(self):
        self.state = 'STANDING'
        self.reps = 0
        self.rep_details = []
        self.start_angle = 180.0
        self.lowest_angle_in_rep = 180.0

    def update(self, angle, *args):
        if self.state == 'STANDING':
            if angle < 150:
                self.state = 'BENDING'
                self.start_angle = angle
                self.lowest_angle_in_rep = angle
        elif self.state in ['BENDING', 'BOTTOM', 'RISING']:
            self.lowest_angle_in_rep = min(self.lowest_angle_in_rep, angle)
            
            if self.state == 'BENDING' and angle <= 110:
                self.state = 'BOTTOM'
            elif self.state == 'BENDING' and angle >= 150:
                if self.start_angle - self.lowest_angle_in_rep >= 30:
                    self._count_rep()
                self.state = 'STANDING'
            elif self.state == 'BOTTOM' and angle > 110:
                self.state = 'RISING'
            elif self.state == 'RISING' and angle >= 150:
                if self.start_angle - self.lowest_angle_in_rep >= 30:
                    self._count_rep()
                self.state = 'STANDING'

    def _count_rep(self):
        self.reps += 1
        score = 100
        errors = []
        rom = max(0, self.start_angle - self.lowest_angle_in_rep)
        
        if self.lowest_angle_in_rep > 110:
            score -= 20
            errors.append('insufficient_bend')
            
        if score == 100:
            feedback = 'Great hip hinge and flexibility!'
        else:
            feedback = 'Bend further at the hips'
            
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
            'exercise': 'windwheel_toe_touch',
            'repetitions': self.reps,
            'average_score': float(avg_score),
            'average_rom': float(avg_rom),
            'repetitions_detail': self.rep_details
        }
