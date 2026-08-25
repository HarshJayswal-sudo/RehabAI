import c1 from '../assets/images/classes-1.jpg';
import c2 from '../assets/images/classes-2.jpg';
import c3 from '../assets/images/classes-3.jpg';
import c4 from '../assets/images/classes-4.jpg';
import c5 from '../assets/images/classes-5.jpg';

export const EXERCISES = [
  {
    id: 'squat',
    numericId: 1,
    code: 'SQUAT_01',
    name: 'Bodyweight Squat',
    category: 'Lower Body',
    difficulty: 'Beginner',
    duration: '10-15 min',
    target_rom: 90,
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    primaryJoint: 'Knees & Hips',
    idealAngle: '85° - 95°',
    image: c1,
    description: 'Fundamental rehabilitation movement to restore lower body strength, knee stability, and hip mobility.',
    instructions: [
      'Stand with feet shoulder-width apart, toes pointing slightly outward.',
      'Keep your chest proud and spine neutral as you initiate the movement by hinging at your hips.',
      'Lower down until thighs are parallel to the floor (aim for ~90° knee angle).',
      'Press through your heels to return to standing position without locking knees.'
    ],
    formTips: [
      'Prevent knees from caving inwards (valgus collapse).',
      'Keep your weight balanced over your midfoot and heels.',
      'Maintain an upright torso angle throughout the descent.'
    ],
    cameraGuide: 'Position camera at hip height, 6-8 feet away, side-angle or 45-degree angle preferred.',
    voiceCues: {
      good: ['Great depth!', 'Excellent form, keep going!', 'Smooth rep!'],
      warning: ['Bend deeper to reach 90 degrees.', 'Keep your knees aligned with toes.', 'Keep your chest lifted.']
    }
  },
  {
    id: 'lunges',
    numericId: 2,
    code: 'LUNGE_01',
    name: 'Bodyweight Lunge',
    category: 'Lower Body',
    difficulty: 'Intermediate',
    duration: '10-12 min',
    target_rom: 90,
    targetMuscles: ['Quadriceps', 'Glutes', 'Calves', 'Core Stability'],
    primaryJoint: 'Knees & Ankle',
    idealAngle: '85° - 90°',
    image: c2,
    description: 'Unilateral leg exercise that improves balance, corrects left/right symmetry disparities, and strengthens hips.',
    instructions: [
      'Stand tall with feet hip-width apart and hands on hips or chest.',
      'Step forward with one leg, lowering your hips until both knees are bent at about 90 degrees.',
      'Ensure your front knee is directly above your ankle, not pushed out too far.',
      'Drive through front heel to return back to the starting stance.'
    ],
    formTips: [
      'Do not let the back knee slam into the floor.',
      'Keep torso upright without leaning excessively forward.',
      'Engage your abdominal core for lateral balance.'
    ],
    cameraGuide: 'Position camera 6-8 feet away with a clear side-view of your full body.',
    voiceCues: {
      good: ['Nice balance!', 'Good 90 degree angle on front knee!', 'Solid control!'],
      warning: ['Lower your back knee further.', 'Keep your front knee behind your toes.', 'Keep your torso upright.']
    }
  },
  {
    id: 'leg_extension',
    numericId: 3,
    code: 'LEG_EXT_01',
    name: 'Seated Leg Extension',
    category: 'Post-Surgery Rehab',
    difficulty: 'Beginner',
    duration: '8-10 min',
    target_rom: 160,
    targetMuscles: ['Quadriceps', 'Patellar Tendon', 'Vastus Medialis'],
    primaryJoint: 'Knee Extension',
    idealAngle: '150° - 170°',
    image: c3,
    description: 'Targeted quadriceps isolation exercise crucial for post-ACL, patellar tendon, or knee replacement recovery.',
    instructions: [
      'Sit comfortably in an upright chair with feet flat on the floor.',
      'Slowly extend one leg straight out until your knee is fully extended.',
      'Hold the extension at the top for 1-2 seconds to engage the quadriceps.',
      'Slowly and with control, return the foot back to the ground.'
    ],
    formTips: [
      'Avoid jerking or swinging your leg upward.',
      'Keep your hips firmly seated against the chair back.',
      'Control the descent to build eccentric strength.'
    ],
    cameraGuide: 'Place camera 5 feet away at knee height with side view of chair.',
    voiceCues: {
      good: ['Full extension reached!', 'Great quad squeeze!', 'Controlled tempo!'],
      warning: ['Extend leg fully straight.', 'Hold at the top for 1 second.', 'Lower down slowly.']
    }
  },
  {
    id: 'wall_push_up',
    numericId: 4,
    code: 'WALL_PUSH_01',
    name: 'Wall Push-Up',
    category: 'Upper Body',
    difficulty: 'Beginner',
    duration: '8-12 min',
    target_rom: 90,
    targetMuscles: ['Pectorals', 'Anterior Deltoids', 'Triceps', 'Scapular Stabilizers'],
    primaryJoint: 'Elbows & Shoulders',
    idealAngle: '80° - 90°',
    image: c4,
    description: 'Low-impact upper-body strengthening exercise ideal for rotator cuff, shoulder rehab, and postural restoration.',
    instructions: [
      'Stand facing a wall approximately an arm\'s length away.',
      'Place palms flat on the wall at shoulder height and shoulder-width apart.',
      'Bend elbows to bring your chest toward the wall while maintaining a rigid plank body.',
      'Push firmly away until arms are straight without locking elbows.'
    ],
    formTips: [
      'Keep your body in a straight line from head to heels.',
      'Elbows should point back at a 45-degree angle, not flare out wide.',
      'Avoid sagging in the lower back or arching shoulders.'
    ],
    cameraGuide: 'Place camera 6 feet away at a side profile showing the wall and your full body.',
    voiceCues: {
      good: ['Good elbow flexion!', 'Strong core alignment!', 'Smooth push!'],
      warning: ['Bring chest closer to the wall.', 'Keep your body in a straight line.', 'Don\'t flare your elbows out.']
    }
  },
  {
    id: 'wind_will_toe_touch',
    numericId: 5,
    code: 'WINDMILL_01',
    name: 'Windmill Toe Touch',
    category: 'Core & Mobility',
    difficulty: 'Intermediate',
    duration: '10-15 min',
    target_rom: 80,
    targetMuscles: ['Hamstrings', 'Obliques', 'Lower Back', 'Hip Rotators'],
    primaryJoint: 'Hips & Thoracic Spine',
    idealAngle: '70° - 85°',
    image: c5,
    description: 'Dynamic rotational movement to develop hamstring flexibility, spinal mobility, and hip hinge kinematics.',
    instructions: [
      'Stand with feet slightly wider than shoulder-width, arms extended out to the sides.',
      'Hinge at your hips and rotate your torso to reach your right hand toward your left foot.',
      'Extend the opposite hand toward the ceiling and look up toward the elevated hand.',
      'Return smoothly to the standing position and alternate to the other side.'
    ],
    formTips: [
      'Hinge at the hips rather than rounding the spine excessively.',
      'Keep knees soft with a slight micro-bend, avoid hyper-extending.',
      'Rotate from your thoracic spine and ribcage.'
    ],
    cameraGuide: 'Position camera directly in front of you, 7-9 feet away to capture full arm span.',
    voiceCues: {
      good: ['Great reach!', 'Excellent thoracic rotation!', 'Perfect hip hinge!'],
      warning: ['Reach closer to your foot.', 'Keep arms fully outstretched.', 'Engage your core as you rotate.']
    }
  }
];
