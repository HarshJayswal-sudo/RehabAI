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
    
    // Find a natural sounding voice instead of the default robotic one
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Zira') || // Microsoft Zira (Natural Female)
      v.name.includes('Google UK English Female') || 
      v.name.includes('Google US English') ||
      v.name.includes('Samantha') || 
      v.name.includes('Victoria')
    ) || voices.find(v => v.lang.startsWith('en-') && v.name.includes('Female')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

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
    direction: 'NONE',
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
      wsRef.current = new WebSocket(`ws://${window.location.hostname}:8000/ws/session`);

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
        
        // Only speak if the feedback instruction has changed from the last spoken text!
        // The SpeechQueueManager already handles the 4-second identical-text debounce.
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
          direction: data.direction ?? prev.direction,
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

    // Simulation block removed to use real WebSocket data

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (wsRef.current) wsRef.current.close();
      voiceQueue.clear();
    };
  }, [isActive, exerciseId, exerciseName, selectedExercise]);

  return sessionData;
}

