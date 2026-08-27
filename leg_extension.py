class LegExtensionAnalyzer:
    def __init__(self):
        self.state = 'BENT'
        self.reps = 0
        self.rep_details = []
        self.start_angle = 90.0
        self.highest_angle_in_rep = 90.0

    def update(self, angle, *args):
        if self.state == 'BENT':
            if angle > 140:
                self.state = 'EXTENDING'
                self.start_angle = angle
                self.highest_angle_in_rep = angle
        elif self.state in ['EXTENDING', 'PEAK', 'RETURNING']:
            self.highest_angle_in_rep = max(self.highest_angle_in_rep, angle)
            
            if self.state == 'EXTENDING' and angle >= 160:
                self.state = 'PEAK'
            elif self.state == 'EXTENDING' and angle <= 140:
                if self.highest_angle_in_rep - self.start_angle >= 15:
                    self._count_rep()
                self.state = 'BENT'
            elif self.state == 'PEAK' and angle < 160:
                self.state = 'RETURNING'
            elif self.state == 'RETURNING' and angle <= 140:
                if self.highest_angle_in_rep - self.start_angle >= 15:
                    self._count_rep()
                self.state = 'BENT'

    def _count_rep(self):
        self.reps += 1
        score = 100
        errors = []
        rom = max(0, self.highest_angle_in_rep - self.start_angle)
        
        if self.highest_angle_in_rep < 155:
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

    def get_realtime_guidance(self):
        """Maps the current state to a real-time UI instruction and arrow direction."""
        if self.state == 'BENT':
            return {"instruction": "↑ Raise your leg", "direction": "UP"}
        elif self.state == 'EXTENDING':
            return {"instruction": "↑ Keep going", "direction": "UP"}
        elif self.state == 'PEAK':
            return {"instruction": "✓ Good! Hold", "direction": "HOLD"}
        elif self.state == 'RETURNING':
            return {"instruction": "↓ Slowly lower your leg", "direction": "DOWN"}
        
        return {"instruction": "Ready", "direction": "NONE"}

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
