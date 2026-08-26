import { useState, useEffect, useRef } from 'react';

// Robust, non-blocking Voice Coaching Queue Manager
class SpeechQueueManager {
  constructor() {
    this.queue = [];
    this.isSpeaking = false;
    this.lastSpokenText = '';
    this.lastSpokenTime = 0;
  }

  speak(text, priority = false) {
    if (!('speechSynthesis' in window) || !text) return;
    if (text === 'NO PERSON' || text === 'Waiting for connection...') return;

    const now = Date.now();
    // Prevent repeating the same cue too quickly
    if (this.lastSpokenText === text && now - this.lastSpokenTime < 4000) return;
    if (now - this.lastSpokenTime < 1800 && !priority) return;

    if (priority) {
      window.speechSynthesis.cancel();
      this.queue = [text];
      this.isSpeaking = false;
    } else {
      // Keep queue small to avoid delayed feedback
      if (this.queue.length > 2) this.queue.shift();
      this.queue.push(text);
    }

    this.processQueue();
  }

  processQueue() {
    if (this.isSpeaking || this.queue.length === 0) return;

    const textToSpeak = this.queue.shift();
    this.isSpeaking = true;
    this.lastSpokenText = textToSpeak;
    this.lastSpokenTime = Date.now();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.isSpeaking = false;
      setTimeout(() => this.processQueue(), 200);
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.processQueue();
    };

    window.speechSynthesis.speak(utterance);
  }

  clear() {
    this.queue = [];
    this.isSpeaking = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

const voiceQueue = new SpeechQueueManager();

export function useAIAnalysis(isActive, videoRef, selectedExercise) {
  const exerciseName = selectedExercise?.name || 'Bodyweight Squat';
  const exerciseId = selectedExercise?.id || 'squat';

  const [sessionData, setSessionData] = useState({
    exercise: exerciseName,
    exerciseId: exerciseId,
    rep: 0,
    formScore: 100,
    symmetry: 96,
    status: 'success', // 'success', 'warning'
    feedback: 'Stand in frame to begin tracking.',
    primaryAngle: 170,
    secondaryAngle: 172,
    hipAngle: 175,
    torsoAngle: 5,
    landmarks: null, // Joint keypoints for canvas skeleton rendering
    repHistory: []
  });

  const wsRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const frameIdRef = useRef(null);
  const isWsConnectedRef = useRef(false);

  const localSimRef = useRef({
    angle: 170,
    direction: -1,
    currentRep: 0,
    repInProgress: false,
    lowestAngleThisRep: 180,
    t: 0
  });

  useEffect(() => {
    if (!isActive) {
      voiceQueue.clear();
      return;
    }

    // Connect to Python Backend WebSocket
    try {
      wsRef.current = new WebSocket('ws://localhost:8000/ws/session');

      wsRef.current.onopen = () => {
        isWsConnectedRef.current = true;
        setSessionData(prev => ({
          ...prev,
          feedback: `AI Vision Connected for ${exerciseName}. Ready!`,
          status: 'success'
        }));
        voiceQueue.speak(`AI Vision active for ${exerciseName}`, true);

        const streamFrames = () => {
          if (!isActive || !videoRef.current || wsRef.current?.readyState !== WebSocket.OPEN) return;
          const video = videoRef.current;
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            const canvas = canvasRef.current;
            canvas.width = 320;
            canvas.height = 240;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Frame = canvas.toDataURL('image/jpeg', 0.6);
            wsRef.current.send(JSON.stringify({ 
              type: 'frame', 
              exercise: exerciseId,
              image: base64Frame 
            }));
          }
          setTimeout(() => {
            frameIdRef.current = requestAnimationFrame(streamFrames);
          }, 1000 / 15);
        };

        streamFrames();
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.feedback) {
          voiceQueue.speak(data.feedback);
        }
        setSessionData(prev => ({
          ...prev,
          rep: data.rep ?? prev.rep,
          formScore: data.formScore ?? prev.formScore,
          symmetry: data.symmetry ?? prev.symmetry,
          status: data.status ?? prev.status,
          feedback: data.feedback ?? prev.feedback,
          primaryAngle: data.kneeAngle ?? data.elbowAngle ?? data.hipAngle ?? prev.primaryAngle,
          secondaryAngle: data.rightKneeAngle ?? prev.secondaryAngle,
          torsoAngle: data.torsoAngle ?? prev.torsoAngle,
          landmarks: data.landmarks || prev.landmarks
        }));
      };

      wsRef.current.onerror = () => {
        isWsConnectedRef.current = false;
      };

      wsRef.current.onclose = () => {
        isWsConnectedRef.current = false;
      };

    } catch (err) {
      isWsConnectedRef.current = false;
    }

    // High-performance client-side simulation & skeleton generator
    const clientInterval = setInterval(() => {
      const sim = localSimRef.current;
      sim.t += 0.05;

      const targetMin = exerciseId === 'leg_extension' ? 105 : (exerciseId === 'wind_will_toe_touch' ? 75 : 85);
      const targetMax = exerciseId === 'leg_extension' ? 165 : 175;

      // Smooth kinematic cycle
      if (sim.direction === -1) {
        sim.angle -= Math.floor(Math.random() * 4 + 3);
        if (sim.angle < sim.lowestAngleThisRep) sim.lowestAngleThisRep = sim.angle;

        if (sim.angle <= targetMin) {
          sim.direction = 1;
          sim.repInProgress = true;
        }
      } else {
        sim.angle += Math.floor(Math.random() * 4 + 3);
        if (sim.angle >= targetMax) {
          sim.direction = -1;
          if (sim.repInProgress) {
            sim.repInProgress = false;
            sim.currentRep += 1;

            const repScore = Math.floor(Math.random() * 7 + 93);
            const rom = exerciseId === 'leg_extension' 
              ? Math.round(165 - sim.lowestAngleThisRep) 
              : Math.round(175 - sim.lowestAngleThisRep);
            
            const repDetail = {
              rep: sim.currentRep,
              score: repScore,
              lowestAngle: sim.lowestAngleThisRep,
              rom: Math.max(rom, 65),
              feedback: repScore > 95 ? 'Excellent depth and posture!' : 'Good rep! Maintain continuous pacing.'
            };

            const goodCues = selectedExercise?.voiceCues?.good || ['Great rep!', 'Solid form!', 'Keep moving!'];
            const randomCue = goodCues[Math.floor(Math.random() * goodCues.length)];
            voiceQueue.speak(randomCue, true);

            setSessionData(prev => {
              const currentScore = prev?.formScore || 95;
              const prevReps = sim.currentRep - 1;
              const newScore = prevReps > 0 ? Math.round((currentScore * prevReps + repScore) / sim.currentRep) : repScore;
              const history = Array.isArray(prev?.repHistory) ? prev.repHistory : [];

              return {
                ...prev,
                rep: sim.currentRep,
                formScore: newScore,
                symmetry: Math.floor(Math.random() * 5 + 93),
                status: 'success',
                feedback: randomCue,
                repHistory: [...history, repDetail]
              };
            });

            sim.lowestAngleThisRep = 180;
            return;
          }
        }
      }


      // Compute anatomical joints based on simulated flexion
      const noise = (Math.random() - 0.5) * 2;
      const leftAngle = Math.round(sim.angle);
      const rightAngle = Math.round(sim.angle + noise);
      const currentSymmetry = Math.round(100 - Math.abs(leftAngle - rightAngle) * 2);

      // Normalized coordinates (0.0 to 1.0) for canvas skeleton drawing
      const kneeYOffset = (175 - sim.angle) / 175 * 0.18;
      const hipYOffset = (175 - sim.angle) / 175 * 0.12;

      const landmarks = {
        nose: { x: 0.5, y: 0.20 + hipYOffset },
        leftShoulder: { x: 0.42, y: 0.28 + hipYOffset },
        rightShoulder: { x: 0.58, y: 0.28 + hipYOffset },
        leftElbow: { x: 0.38, y: 0.40 + hipYOffset },
        rightElbow: { x: 0.62, y: 0.40 + hipYOffset },
        leftWrist: { x: 0.40, y: 0.50 + hipYOffset },
        rightWrist: { x: 0.60, y: 0.50 + hipYOffset },
        leftHip: { x: 0.45, y: 0.52 + hipYOffset },
        rightHip: { x: 0.55, y: 0.52 + hipYOffset },
        leftKnee: { x: 0.44, y: 0.70 + kneeYOffset },
        rightKnee: { x: 0.56, y: 0.70 + kneeYOffset },
        leftAnkle: { x: 0.44, y: 0.88 },
        rightAnkle: { x: 0.56, y: 0.88 }
      };

      let liveFeedback = 'Maintain smooth and controlled motion.';
      let liveStatus = 'success';

      if (sim.angle > 145) {
        liveFeedback = exerciseId === 'squat' ? 'Initiate descent by hinging hips.' : 
                       exerciseId === 'lunges' ? 'Step forward and lower rear knee.' :
                       exerciseId === 'wall_push_up' ? 'Bend elbows toward the wall.' :
                       exerciseId === 'leg_extension' ? 'Extend your leg upwards.' :
                       'Hinge hips and reach down.';
      } else if (sim.angle <= 95) {
        liveFeedback = 'Optimal depth reached! Press back up.';
      }

      setSessionData(prev => ({
        ...prev,
        primaryAngle: leftAngle,
        secondaryAngle: rightAngle,
        symmetry: Math.min(100, Math.max(80, currentSymmetry)),
        feedback: liveFeedback,
        status: liveStatus,
        landmarks: landmarks
      }));

    }, 150);

    return () => {
      clearInterval(clientInterval);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (wsRef.current) wsRef.current.close();
      voiceQueue.clear();
    };
  }, [isActive, exerciseId, exerciseName, selectedExercise]);

  return sessionData;
}

