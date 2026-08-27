class BodyweightLungeAnalyzer:
    def __init__(self):
        self.state = 'STANDING'
        self.reps = 0
        self.rep_details = []
        self.start_angle = 180.0
        self.lowest_angle_in_rep = 180.0

    def update(self, angle, *args):
        if self.state == 'STANDING':
            if angle < 150:
                self.state = 'DESCENDING'
                self.start_angle = angle
                self.lowest_angle_in_rep = angle
        elif self.state in ['DESCENDING', 'BOTTOM', 'ASCENDING']:
            self.lowest_angle_in_rep = min(self.lowest_angle_in_rep, angle)
            
            if self.state == 'DESCENDING' and angle <= 110:
                self.state = 'BOTTOM'
            elif self.state == 'DESCENDING' and angle >= 150:
                if self.start_angle - self.lowest_angle_in_rep >= 45:
                    self._count_rep()
                self.state = 'STANDING'
            elif self.state == 'BOTTOM' and angle > 110:
                self.state = 'ASCENDING'
            elif self.state == 'ASCENDING' and angle >= 150:
                if self.start_angle - self.lowest_angle_in_rep >= 45:
                    self._count_rep()
                self.state = 'STANDING'

    def _count_rep(self):
        self.reps += 1
        score = 100
        errors = []
        rom = max(0, self.start_angle - self.lowest_angle_in_rep)
        
        if self.lowest_angle_in_rep > 110:
            score -= 20
            errors.append('shallow_lunge')
            
        if score == 100:
            feedback = 'Excellent lunge depth and form!'
        else:
            feedback = 'Lunge deeper for full range'
            
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
            'exercise': 'bodyweight_lunge',
            'repetitions': self.reps,
            'average_score': float(avg_score),
            'average_rom': float(avg_rom),
            'repetitions_detail': self.rep_details
        }
