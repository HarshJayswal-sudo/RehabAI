class LegExtensionAnalyzer:
    def __init__(self):
        self.state = 'BENT'
        self.reps = 0
        self.rep_details = []
        self.start_angle = 90.0
        self.highest_angle_in_rep = 90.0

    def update(self, angle, *args):
        if self.state == 'BENT':
            if angle > 120:
                self.state = 'EXTENDING'
                self.start_angle = angle
                self.highest_angle_in_rep = angle
        elif self.state in ['EXTENDING', 'PEAK', 'RETURNING']:
            self.highest_angle_in_rep = max(self.highest_angle_in_rep, angle)
            
            if self.state == 'EXTENDING' and angle >= 160:
                self.state = 'PEAK'
            elif self.state == 'EXTENDING' and angle <= 120:
                if self.highest_angle_in_rep - self.start_angle >= 30:
                    self._count_rep()
                self.state = 'BENT'
            elif self.state == 'PEAK' and angle < 160:
                self.state = 'RETURNING'
            elif self.state == 'RETURNING' and angle <= 120:
                if self.highest_angle_in_rep - self.start_angle >= 30:
                    self._count_rep()
                self.state = 'BENT'

    def _count_rep(self):
        self.reps += 1
        score = 100
        errors = []
        rom = max(0, self.highest_angle_in_rep - self.start_angle)
        
        if self.highest_angle_in_rep < 160:
            score -= 20
            errors.append('incomplete_extension')
            
        if score == 100:
            feedback = 'Great extension. Keep it up!'
        else:
            feedback = 'Extend your leg fully'
            
        self.rep_details.append({
            'rep': self.reps,
            'score': max(0, score),
            'highest_angle': float(self.highest_angle_in_rep),
            'rom': float(rom),
            'errors': errors,
            'feedback': feedback
        })

    def get_session_results(self):
        avg_score = sum(r['score'] for r in self.rep_details) / self.reps if self.reps > 0 else 0.0
        avg_rom = sum(r['rom'] for r in self.rep_details) / self.reps if self.reps > 0 else 0.0
        return {
            'exercise': 'leg_extension',
            'repetitions': self.reps,
            'average_score': float(avg_score),
            'average_rom': float(avg_rom),
            'repetitions_detail': self.rep_details
        }
