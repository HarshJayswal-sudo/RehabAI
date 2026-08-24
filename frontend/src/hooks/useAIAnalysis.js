import { useState, useEffect, useRef } from 'react';

export function useAIAnalysis(isActive, videoRef) {
  const [sessionData, setSessionData] = useState({
    exercise: "Bodyweight Squat",
    rep: 0,
    formScore: 100,
    symmetry: 100,
    status: "warning",
    feedback: "Waiting for connection...",
    kneeAngle: 170,
    hipAngle: 175
  });

  const wsRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const frameIdRef = useRef(null);

  useEffect(() => {
    if (!isActive || !videoRef?.current) return;

    // Handle voice synthesis on the frontend
    const speakFeedback = (text) => {
      if ('speechSynthesis' in window && text && text !== "Waiting for connection..." && text !== "NO PERSON") {
        // Simple cooldown logic so it doesn't spam
        const now = Date.now();
        if (!window.lastSpeechTime || now - window.lastSpeechTime > 3000) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.1;
          window.speechSynthesis.speak(utterance);
          window.lastSpeechTime = now;
        }
      }
    };

    // Initialize WebSocket
    try {
      wsRef.current = new WebSocket('ws://localhost:8000/ws/session');
      
      wsRef.current.onopen = () => {
        console.log("Connected to AI Server");
        setSessionData(prev => ({ ...prev, feedback: "Connected. Stand back for calibration.", status: "warning" }));
        
        // Start streaming frames
        const streamFrames = () => {
          if (!isActive || !videoRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
          
          const video = videoRef.current;
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            const canvas = canvasRef.current;
            // Downscale for performance
            canvas.width = 320;
            canvas.height = 240;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const base64Frame = canvas.toDataURL('image/jpeg', 0.6);
            wsRef.current.send(JSON.stringify({ type: 'frame', image: base64Frame }));
          }
          
          // Stream at roughly 15 fps
          setTimeout(() => {
            frameIdRef.current = requestAnimationFrame(streamFrames);
          }, 1000 / 15);
        };
        
        streamFrames();
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setSessionData(prev => {
          // If feedback changed significantly and isn't just status info, speak it
          if (data.feedback && data.feedback !== prev.feedback && !data.feedback.includes("Stand normally")) {
             speakFeedback(data.feedback);
          }
          return {
            ...prev,
            rep: data.rep,
            formScore: data.formScore,
            symmetry: data.symmetry,
            status: data.status,
            feedback: data.feedback,
            kneeAngle: data.kneeAngle,
            hipAngle: data.hipAngle
          };
        });
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setSessionData(prev => ({ ...prev, feedback: "AI Server Error. Is it running?", status: "warning" }));
      };
      
      wsRef.current.onclose = () => {
        console.log("Disconnected from AI Server");
        setSessionData(prev => ({ ...prev, feedback: "AI Server Disconnected", status: "warning" }));
      };

    } catch (err) {
      console.error("Failed to connect to AI server", err);
    }

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isActive, videoRef]);

  return sessionData;
}
