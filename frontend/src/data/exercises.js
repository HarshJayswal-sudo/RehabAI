import c1 from '../assets/images/classes-1.jpg';
import c2 from '../assets/images/classes-2.jpg';
import c3 from '../assets/images/classes-3.jpg';
import c4 from '../assets/images/classes-4.jpg';
import c5 from '../assets/images/classes-5.jpg';

import squatAvatar from '../assets/avatar/squat_avatar.png';
import lungesAvatar from '../assets/avatar/lunges_avatar.png';
import legExtensionAvatar from '../assets/avatar/leg_extension_avatar.png';
import wallPushupAvatar from '../assets/avatar/wall_pushup_avatar.png';
import windmillAvatar from '../assets/avatar/windmill_avatar.png';

export const EXERCISES = [
  {
    id: 'squat',
    numericId: 1,
    name: 'Bodyweight Squat',
    category: 'Lower Body',
    difficulty: 'Beginner',
    duration: '10-15 min',
    videoUrl: '/videos/exercises/squat/guidance.mp4',
    captionsUrl: '/videos/exercises/squat/captions.vtt',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    primaryJoint: 'Knees & Hips',
    idealAngle: '85° - 95°',
    startAngle: 175,
    targetAngle: 90,
    activeJoint: 'knee',
    jointLabel: 'Knee Flexion',
    avatarImage: squatAvatar,
    image: c1,
    thumbnailUrl: squatAvatar,
    contentStatus: 'VERIFIED_REHAB_PROTOCOL',
    description: 'Fundamental rehabilitation movement to restore lower body strength, knee stability, and hip mobility.',
    purpose: 'This exercise helps rebuild lower-body functional strength, enhance knee stability, and restore hip-hinge mobility for everyday activities like standing up from a seated position.',
    phases: [
      { id: 'starting_position', label: '1. Neutral Stance', angle: 175, cue: 'Stand tall with feet shoulder-width apart and chest lifted', direction: 'READY' },
      { id: 'demonstrating', label: '2. Smooth Descent', angle: 125, cue: 'Hinge hips back and bend knees with controlled tempo', direction: 'DOWN' },
      { id: 'end_position', label: '3. Target Depth (90°)', angle: 90, cue: 'Hold parallel depth with knees aligned over toes', direction: 'HOLD' },
      { id: 'returning', label: '4. Drive to Standing', angle: 165, cue: 'Press firmly through midfoot and heels to return upright', direction: 'UP' }
    ],
    howToPerform: [
      'Stand with feet shoulder-width apart, toes pointing slightly outward.',
      'Keep your chest proud and spine neutral as you initiate the movement by hinging back at your hips.',
      'Lower down smoothly until your thighs reach approximately 90 degrees.',
      'Pause briefly with your knees tracking naturally in line with your toes.',
      'Press firmly through your midfoot and heels to return to standing without locking your knees.'
    ],
    instructions: [
      'Stand with feet shoulder-width apart, toes pointing slightly outward.',
      'Keep your chest proud and spine neutral as you initiate the movement by hinging back at your hips.',
      'Lower down smoothly until your thighs reach approximately 90 degrees.',
      'Pause briefly with your knees tracking naturally in line with your toes.',
      'Press firmly through your midfoot and heels to return to standing without locking your knees.'
    ],
    keyCues: [
      'Maintain knee alignment directly over your toes',
      'Keep your torso upright and chest open throughout',
      'Descend to target 90-degree depth smoothly',
      'Distribute weight evenly across your midfoot and heels'
    ],
    formCues: [
      'Move slowly and smoothly throughout descent and ascent',
      'Keep knees tracking in alignment with your toes',
      'Maintain upright torso and neutral spine posture',
      'Reach comfortable ~90° depth with weight on heels'
    ],
    formTips: [
      'Prevent knees from caving inwards (valgus collapse).',
      'Keep your weight balanced over your midfoot and heels.',
      'Maintain an upright torso angle throughout the descent.'
    ],
    mistakes: [
      'Knees collapsing inward toward each other',
      'Rising onto your toes or lifting heels off the floor',
      'Excessive forward bending or rounding the lower back',
      'Dropping down too quickly without controlled tempo'
    ],
    commonMistakes: [
      'Jerky movements or bouncing at the bottom',
      'Knees caving inward (valgus collapse)',
      'Lifting heels or rising onto your toes',
      'Excessive speed or dropping into the squat'
    ],
    voiceScript: 'Let us begin with the Bodyweight Squat. Start by standing with your feet in a comfortable shoulder-width position. Keep your chest lifted and your posture controlled. Slowly bend your knees and lower your hips toward ninety degrees. Keep your knees aligned over your toes. Then smoothly drive through your heels to return to standing.',
    cameraGuide: 'Position camera at hip height, 6-8 feet away, side-angle or 45-degree angle preferred.',
    voiceCues: {
      good: ['Great depth!', 'Excellent form, keep going!', 'Smooth rep!'],
      warning: ['Bend deeper to reach 90 degrees.', 'Keep your knees aligned with toes.', 'Keep your chest lifted.']
    }
  },
  {
    id: 'lunges',
    numericId: 2,
    name: 'Bodyweight Lunge',
    category: 'Lower Body',
    difficulty: 'Intermediate',
    duration: '10-12 min',
    videoUrl: '/videos/exercises/lunges/guidance.mp4',
    captionsUrl: '/videos/exercises/lunges/captions.vtt',
    targetMuscles: ['Quadriceps', 'Glutes', 'Calves', 'Core Stability'],
    primaryJoint: 'Knees & Ankle',
    idealAngle: '85° - 90°',
    startAngle: 170,
    targetAngle: 90,
    activeJoint: 'knee',
    jointLabel: 'Front Knee Flexion',
    avatarImage: lungesAvatar,
    image: c2,
    thumbnailUrl: lungesAvatar,
    contentStatus: 'VERIFIED_REHAB_PROTOCOL',
    description: 'Unilateral leg exercise that improves balance, corrects left/right symmetry disparities, and strengthens hips.',
    purpose: 'This unilateral exercise helps correct left-to-right strength disparities, reinforces single-leg joint balance, and strengthens hips and stabilizing muscles.',
    phases: [
      { id: 'starting_position', label: '1. Upright Stance', angle: 170, cue: 'Stand tall with feet hip-width apart and core gently engaged', direction: 'READY' },
      { id: 'demonstrating', label: '2. Forward Step', angle: 125, cue: 'Step forward in a controlled stride, keeping torso tall', direction: 'DOWN' },
      { id: 'end_position', label: '3. 90° Knee Depth', angle: 90, cue: 'Lower hips until front knee forms a clean 90-degree angle', direction: 'HOLD' },
      { id: 'returning', label: '4. Drive to Start', angle: 165, cue: 'Drive firmly through front heel to step back to starting stance', direction: 'UP' }
    ],
    howToPerform: [
      'Stand tall with your feet hip-width apart and your hands resting on your hips or chest.',
      'Take a controlled step forward with one leg, keeping your torso upright.',
      'Lower your hips until both knees form approximately 90-degree angles.',
      'Ensure your front knee is stacked directly above your ankle without pushing beyond toes.',
      'Drive through your front heel to step smoothly back to the starting stance.'
    ],
    instructions: [
      'Stand tall with your feet hip-width apart and your hands resting on your hips or chest.',
      'Take a controlled step forward with one leg, keeping your torso upright.',
      'Lower your hips until both knees form approximately 90-degree angles.',
      'Ensure your front knee is stacked directly above your ankle without pushing beyond toes.',
      'Drive through your front heel to step smoothly back to the starting stance.'
    ],
    keyCues: [
      'Keep front knee stacked directly over the ankle',
      'Maintain an upright torso without leaning forward',
      'Lower until front knee achieves ~90° flexion',
      'Ensure symmetric balance and stable lateral posture'
    ],
    formCues: [
      'Move slowly and with controlled cadence',
      'Keep front knee stacked directly above ankle',
      'Maintain an upright posture throughout the movement',
      'Ensure symmetric depth between left and right sides'
    ],
    formTips: [
      'Do not let the back knee slam into the floor.',
      'Keep torso upright without leaning excessively forward.',
      'Engage your abdominal core for lateral balance.'
    ],
    mistakes: [
      'Allowing front knee to shoot past your toes',
      'Letting the back knee slam forcefully into the floor',
      'Leaning your torso excessively forward or twisting',
      'Losing lateral balance or stepping on a narrow tightrope line'
    ],
    commonMistakes: [
      'Pushing front knee excessively past your toes',
      'Slamming the rear knee onto the floor',
      'Leaning torso forward or twisting the spine',
      'Uncontrolled speed or wobbling laterally'
    ],
    voiceScript: 'Let us begin with the Bodyweight Lunge. Stand tall with your feet hip-width apart. Take a controlled step forward, lowering your hips until both knees bend toward ninety degrees. Keep your front knee aligned directly above your ankle. Push firmly through your front heel to return to the starting position.',
    cameraGuide: 'Position camera 6-8 feet away with a clear side-view of your full body.',
    voiceCues: {
      good: ['Nice balance!', 'Good 90 degree angle on front knee!', 'Solid control!'],
      warning: ['Lower your back knee further.', 'Keep your front knee behind your toes.', 'Keep your torso upright.']
    }
  },
  {
    id: 'leg_extension',
    numericId: 3,
    name: 'Seated Knee Extension',
    category: 'Post-Surgery Rehab',
    difficulty: 'Beginner',
    duration: '8-10 min',
    videoUrl: '/videos/exercises/leg_extension/guidance.mp4',
    captionsUrl: '/videos/exercises/leg_extension/captions.vtt',
    targetMuscles: ['Quadriceps', 'Patellar Tendon', 'Vastus Medialis'],
    primaryJoint: 'Knee Extension',
    idealAngle: '150° - 170°',
    startAngle: 90,
    targetAngle: 165,
    activeJoint: 'knee',
    jointLabel: 'Knee Extension',
    avatarImage: legExtensionAvatar,
    image: c3,
    thumbnailUrl: legExtensionAvatar,
    contentStatus: 'VERIFIED_REHAB_PROTOCOL',
    description: 'Targeted quadriceps isolation exercise crucial for post-ACL, patellar tendon, or knee replacement recovery.',
    purpose: 'This exercise is designed to practice controlled knee extension, activating and strengthening the quadriceps muscles that support patellar stability during rehab.',
    phases: [
      { id: 'starting_position', label: '1. Seated Posture', angle: 90, cue: 'Sit upright in chair with back supported and thighs flat on seat', direction: 'READY' },
      { id: 'demonstrating', label: '2. Extension Upward', angle: 130, cue: 'Slowly straighten your leg forward under smooth muscular control', direction: 'UP' },
      { id: 'end_position', label: '3. Full Extension Hold', angle: 165, cue: 'Hold peak extension for 1-2 seconds to contract the quadriceps', direction: 'HOLD' },
      { id: 'returning', label: '4. Controlled Lowering', angle: 105, cue: 'Slowly lower your foot back down without letting it drop', direction: 'DOWN' }
    ],
    howToPerform: [
      'Sit upright with your back supported and feet flat on the floor.',
      'Keep your thigh stable and resting comfortably on the seat.',
      'Slowly extend your leg until you reach a comfortable position.',
      'Hold briefly at the top to engage your quadriceps.',
      'Slowly return to the starting position.'
    ],
    instructions: [
      'Sit upright with your back supported and feet flat on the floor.',
      'Keep your thigh stable and resting comfortably on the seat.',
      'Slowly extend your leg until you reach a comfortable position.',
      'Hold briefly at the top to engage your quadriceps.',
      'Slowly return to the starting position.'
    ],
    keyCues: [
      'Move slowly and smoothly',
      'Keep your upper body stable throughout',
      'Achieve comfortable knee extension (150° - 170°)',
      'Control the descent to protect the knee joint'
    ],
    formCues: [
      'Move slowly and smoothly',
      'Keep your upper body stable and supported',
      'Stay within the demonstrated comfortable range',
      'Hold the peak extension deliberately for 1 to 2 seconds'
    ],
    formTips: [
      'Avoid jerking or swinging your leg upward.',
      'Keep your hips firmly seated against the chair back.',
      'Control the descent to build eccentric strength.'
    ],
    mistakes: [
      'Jerky movements or swinging the lower leg upward',
      'Moving too quickly without muscle engagement',
      'Unnecessary upper body movement or arching the spine',
      'Hyperextending or locking the knee joint forcefully'
    ],
    commonMistakes: [
      'Jerky movements or kicking with momentum',
      'Moving too quickly on the downward phase',
      'Unnecessary body movement or leaning backwards',
      'Going beyond your comfortable pain-free range'
    ],
    voiceScript: 'Let us begin with the Seated Knee Extension. Sit upright with your back supported and feet flat on the floor. Slowly extend your leg until you reach a comfortable position. Hold briefly to engage your quadriceps, then return slowly to the starting position. Keep your upper body stable throughout.',
    cameraGuide: 'Place camera 5 feet away at knee height with side view of chair.',
    voiceCues: {
      good: ['Full extension reached!', 'Great quad squeeze!', 'Controlled tempo!'],
      warning: ['Extend leg fully straight.', 'Hold at the top for 1 second.', 'Lower down slowly.']
    }
  },
  {
    id: 'wall_push_up',
    numericId: 4,
    name: 'Wall Push-Up',
    category: 'Upper Body',
    difficulty: 'Beginner',
    duration: '8-12 min',
    videoUrl: '/videos/exercises/wall_push_up/guidance.mp4',
    captionsUrl: '/videos/exercises/wall_push_up/captions.vtt',
    targetMuscles: ['Pectorals', 'Anterior Deltoids', 'Triceps', 'Scapular Stabilizers'],
    primaryJoint: 'Elbows & Shoulders',
    idealAngle: '80° - 90°',
    startAngle: 175,
    targetAngle: 85,
    activeJoint: 'elbow',
    jointLabel: 'Elbow Flexion',
    avatarImage: wallPushupAvatar,
    image: c4,
    thumbnailUrl: wallPushupAvatar,
    contentStatus: 'VERIFIED_REHAB_PROTOCOL',
    description: 'Low-impact upper-body strengthening exercise ideal for rotator cuff, shoulder rehab, and postural restoration.',
    purpose: 'This exercise helps practice controlled upper-body pushing mechanics, building chest, shoulder, and scapular control with minimal joint stress.',
    phases: [
      { id: 'starting_position', label: '1. Wall Plank Stance', angle: 175, cue: 'Stand an arm length away with hands flat on wall at shoulder height', direction: 'READY' },
      { id: 'demonstrating', label: '2. Chest Incline', angle: 125, cue: 'Bend elbows smoothly to bring chest toward the wall in a straight plank', direction: 'DOWN' },
      { id: 'end_position', label: '3. 85° Elbow Flexion', angle: 85, cue: 'Hold position with elbows angled back at 45 degrees, core tight', direction: 'HOLD' },
      { id: 'returning', label: '4. Push to Arms Straight', angle: 165, cue: 'Press firmly through your palms to return upright without locking elbows', direction: 'UP' }
    ],
    howToPerform: [
      'Stand facing a wall approximately an arm\'s length away.',
      'Place your palms flat on the wall at shoulder height and shoulder-width apart.',
      'Inhale and bend your elbows to bring your chest toward the wall in a rigid plank.',
      'Keep your elbows angled backward at about 45 degrees rather than flared out wide.',
      'Exhale and push firmly through your palms until arms are straight without locking elbows.'
    ],
    instructions: [
      'Stand facing a wall approximately an arm\'s length away.',
      'Place your palms flat on the wall at shoulder height and shoulder-width apart.',
      'Inhale and bend your elbows to bring your chest toward the wall in a rigid plank.',
      'Keep your elbows angled backward at about 45 degrees rather than flared out wide.',
      'Exhale and push firmly through your palms until arms are straight without locking elbows.'
    ],
    keyCues: [
      'Maintain a straight rigid plank from head to heels',
      'Keep elbows tracking back at 45 degrees, avoiding flare',
      'Reach target 80° - 90° elbow flexion smoothly',
      'Press evenly through both palms'
    ],
    formCues: [
      'Move slowly and smoothly toward and away from the wall',
      'Maintain rigid straight-line spinal posture',
      'Keep elbows tracking back at 45 degrees',
      'Stay within the demonstrated range of motion'
    ],
    formTips: [
      'Keep your body in a straight line from head to heels.',
      'Elbows should point back at a 45-degree angle, not flare out wide.',
      'Avoid sagging in the lower back or arching shoulders.'
    ],
    mistakes: [
      'Flaring elbows outward at 90 degrees to the torso',
      'Sagging the lower back or allowing hips to drop forward',
      'Craning the neck forward to touch the wall early',
      'Pushing off with jerky momentum instead of steady control'
    ],
    commonMistakes: [
      'Flaring elbows directly out to the sides',
      'Sagging the lower back or dropping hips forward',
      'Jerky movements or bouncing off the wall',
      'Craning the head or neck toward the wall'
    ],
    voiceScript: 'Let us begin with the Wall Push-Up. Stand facing a wall about an arm length away with hands at shoulder height. Bend your elbows smoothly to lower your chest toward the wall, keeping your body in a straight line. Keep your elbows angled back at forty-five degrees. Push firmly away until your arms are straight.',
    cameraGuide: 'Place camera 6 feet away at a side profile showing the wall and your full body.',
    voiceCues: {
      good: ['Good elbow flexion!', 'Strong core alignment!', 'Smooth push!'],
      warning: ['Bring chest closer to the wall.', 'Keep your body in a straight line.', 'Don\'t flare your elbows out.']
    }
  },
  {
    id: 'wind_will_toe_touch',
    numericId: 5,
    name: 'Windmill Toe Touch',
    category: 'Core & Mobility',
    difficulty: 'Intermediate',
    duration: '10-15 min',
    videoUrl: '/videos/exercises/wind_will_toe_touch/guidance.mp4',
    captionsUrl: '/videos/exercises/wind_will_toe_touch/captions.vtt',
    targetMuscles: ['Hamstrings', 'Obliques', 'Lower Back', 'Hip Rotators'],
    primaryJoint: 'Hips & Thoracic Spine',
    idealAngle: '70° - 85°',
    startAngle: 180,
    targetAngle: 75,
    activeJoint: 'hip',
    jointLabel: 'Hip Hinge & Rotation',
    avatarImage: windmillAvatar,
    image: c5,
    thumbnailUrl: windmillAvatar,
    contentStatus: 'VERIFIED_REHAB_PROTOCOL',
    description: 'Dynamic rotational movement to develop hamstring flexibility, spinal mobility, and hip hinge kinematics.',
    purpose: 'This exercise helps practice controlled thoracic rotation and hamstring flexibility, supporting spinal mobility and hip coordination under active control.',
    phases: [
      { id: 'starting_position', label: '1. Wide Stance', angle: 180, cue: 'Stand with feet wide, arms outstretched to sides, soft knee bend', direction: 'READY' },
      { id: 'demonstrating', label: '2. Torso Rotation', angle: 120, cue: 'Hinge forward from hips and rotate ribcage toward opposite foot', direction: 'DOWN' },
      { id: 'end_position', label: '3. Touch & Reach (75°)', angle: 75, cue: 'Reach hand toward opposite ankle while extending top arm to ceiling', direction: 'HOLD' },
      { id: 'returning', label: '4. Return Upright', angle: 160, cue: 'Contract glutes and core to smoothly return to standing position', direction: 'UP' }
    ],
    howToPerform: [
      'Stand with your feet slightly wider than shoulder-width and arms extended out to your sides.',
      'Keep a soft micro-bend in your knees and hinge forward at your hips.',
      'Rotate your torso smoothly, reaching one hand down toward the opposite foot or shin.',
      'Extend the opposite hand straight up toward the ceiling, looking gently upward.',
      'Return smoothly to the standing position and repeat on the opposite side.'
    ],
    instructions: [
      'Stand with your feet slightly wider than shoulder-width and arms extended out to your sides.',
      'Keep a soft micro-bend in your knees and hinge forward at your hips.',
      'Rotate your torso smoothly, reaching one hand down toward the opposite foot or shin.',
      'Extend the opposite hand straight up toward the ceiling, looking gently upward.',
      'Return smoothly to the standing position and repeat on the opposite side.'
    ],
    keyCues: [
      'Hinge forward from the hips with a long, extended spine',
      'Rotate through the thoracic ribcage rather than twisting lower back',
      'Keep a gentle micro-bend in your knees to protect hamstrings',
      'Move symmetrically between left and right repetitions'
    ],
    formCues: [
      'Move slowly and smoothly through the rotation',
      'Maintain a stable hip-hinge baseline with micro-bent knees',
      'Rotate from your thoracic ribcage, not lower spine',
      'Stay within your comfortable, pain-free range of motion'
    ],
    formTips: [
      'Hinge at the hips rather than rounding the spine excessively.',
      'Keep knees soft with a slight micro-bend, avoid hyper-extending.',
      'Rotate from your thoracic spine and ribcage.'
    ],
    mistakes: [
      'Locking or hyperextending the knees rigidly',
      'Rounding the lower back excessively instead of hinging at the hips',
      'Forcing rotation beyond comfortable flexibility limits',
      'Using rapid momentum or swinging violently'
    ],
    commonMistakes: [
      'Locking or hyperextending knees rigidly',
      'Excessive rounding or curving of the lower spine',
      'Jerky movements or using momentum to swing',
      'Going beyond your comfortable range of motion'
    ],
    voiceScript: 'Let us begin with the Windmill Toe Touch. Stand with your feet wider than shoulder-width and arms extended to your sides. Hinge forward at your hips and gently rotate your upper body, reaching one hand toward the opposite foot. Look toward your elevated hand. Move with control and rotate from your ribcage. Return to the center smoothly.',
    cameraGuide: 'Position camera directly in front of you, 7-9 feet away to capture full arm span.',
    voiceCues: {
      good: ['Great reach!', 'Excellent thoracic rotation!', 'Perfect hip hinge!'],
      warning: ['Reach closer to your foot.', 'Keep arms fully outstretched.', 'Engage your core as you rotate.']
    }
  }
];
