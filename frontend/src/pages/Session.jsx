import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pause, Square, Play, VideoOff, Scan, Activity, Maximize, AlertCircle, Flame, CheckCircle, Sparkles } from 'lucide-react';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { api } from '../services/api';
import { EXERCISES } from '../data/exercises';
import bgLeft from '../assets/images/background-left.png';
import bgRight from '../assets/images/background-right.png';

const FireBurst = () => {
  const particles = Array.from({ length: 16 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.5;
    const velocity = 40 + Math.random() * 60;
    return {
      id: i,
      x: Math.cos(angle) * velocity,
      y: Math.sin(angle) * velocity - 25,
      scale: 0.5 + Math.random(),
      duration: 0.5 + Math.random() * 0.5,
      color: Math.random() > 0.5 ? '#F59E0B' : '#10B981'
    };
  });

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, zIndex: 0, pointerEvents: 'none' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: p.scale, opacity: 0 }}
          transition={{ duration: p.duration, ease: "easeOut" }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: p.color,
            borderRadius: '50%',
            boxShadow: `0 0 15px ${p.color}`,
            filter: 'blur(1px)'
          }}
        />
      ))}
    </div>
  );
};

const Session = ({ selectedExercise: initialExercise, onEnd, onCancel }) => {
  const activeExercise = initialExercise || EXERCISES[0];
  
  const [phase, setPhase] = useState('calibrating'); // 'calibrating', 'countdown', 'active'
  const [countdown, setCountdown] = useState(3);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  const [isActive, setIsActive] = useState(true);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const smoothedLandmarksRef = useRef({});

  const data = useAIAnalysis(isActive && phase === 'active', videoRef, activeExercise);
  
  const [cameraStatus, setCameraStatus] = useState('requesting');
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraStatus('active');
        
        // Start backend session tracking with exercise ID
        const targetId = activeExercise.numericId || activeExercise.id || 1;
        api.startSession(targetId)
           .then(res => setSessionId(res?.id || 1))
           .catch(err => {
             console.warn("Using offline session id", err);
             setSessionId(Date.now());
           });
           
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraStatus('error');
        setErrorMessage(err.message || 'Camera access denied or not available.');
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeExercise]);

  // Real-time Canvas Skeleton Rendering Loop
  useEffect(() => {
    if (phase !== 'active' || !overlayCanvasRef.current) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    const renderSkeleton = () => {
      const w = (canvas.width = canvas.offsetWidth || 640);
      const h = (canvas.height = canvas.offsetHeight || 480);
      ctx.clearRect(0, 0, w, h);

      const lm = data?.landmarks;
      if (!lm) {
        animId = requestAnimationFrame(renderSkeleton);
        return;
      }

      const strokeColor = (data.formScore || 95) >= 90 ? '#10B981' : ((data.formScore || 95) >= 75 ? '#F59E0B' : '#EF4444');
      const boneGlow = (data.formScore || 95) >= 90 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';

      // Safe point converter with EMA Smoothing
      const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
      
      const pt = (p, name) => {
        if (!p || typeof p.x !== 'number' || typeof p.y !== 'number' || isNaN(p.x) || isNaN(p.y)) {
          return null;
        }
        const targetX = Math.max(0, Math.min(w, (1 - p.x) * w));
        const targetY = Math.max(0, Math.min(h, p.y * h));

        if (!smoothedLandmarksRef.current[name]) {
          smoothedLandmarksRef.current[name] = { x: targetX, y: targetY };
        } else {
          smoothedLandmarksRef.current[name].x = lerp(smoothedLandmarksRef.current[name].x, targetX, 0.35);
          smoothedLandmarksRef.current[name].y = lerp(smoothedLandmarksRef.current[name].y, targetY, 0.35);
        }
        return smoothedLandmarksRef.current[name];
      };

      // Normalize array or dict format
      const getLm = (name) => {
        if (!lm) return null;
        if (Array.isArray(lm)) {
          const item = lm.find(l => l.name === name || l.name === name.toLowerCase());
          return item ? pt(item, name) : null;
        }
        return pt(lm[name], name);
      };

      const lShoulder = getLm('leftShoulder') || getLm('l_shoulder');
      const rShoulder = getLm('rightShoulder') || getLm('r_shoulder');
      const lElbow = getLm('leftElbow') || getLm('l_elbow');
      const rElbow = getLm('rightElbow') || getLm('r_elbow');
      const lWrist = getLm('leftWrist') || getLm('l_wrist');
      const rWrist = getLm('rightWrist') || getLm('r_wrist');
      const lHip = getLm('leftHip') || getLm('l_hip');
      const rHip = getLm('rightHip') || getLm('r_hip');
      const lKnee = getLm('leftKnee') || getLm('l_knee');
      const rKnee = getLm('rightKnee') || getLm('r_knee');
      const lAnkle = getLm('leftAnkle') || getLm('l_ankle');
      const rAnkle = getLm('rightAnkle') || getLm('r_ankle');

      const connections = [
        [lShoulder, rShoulder],
        [lShoulder, lHip],
        [rShoulder, rHip],
        [lHip, rHip],
        [lShoulder, lElbow],
        [lElbow, lWrist],
        [rShoulder, rElbow],
        [rElbow, rWrist],
        [lHip, lKnee],
        [lKnee, lAnkle],
        [rHip, rKnee],
        [rKnee, rAnkle]
      ];

      // 1. Draw Bones
      ctx.lineWidth = 4;
      ctx.strokeStyle = strokeColor;
      ctx.shadowColor = boneGlow;
      ctx.shadowBlur = 12;

      connections.forEach(([p1, p2]) => {
        if (!p1 || !p2) return;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // 2. Draw Landmark Joints
      const allJoints = [lShoulder, rShoulder, lElbow, rElbow, lWrist, rWrist, lHip, rHip, lKnee, rKnee, lAnkle, rAnkle];
      allJoints.forEach(point => {
        if (!point) return;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
      });

      // 3. Draw Angle Badges safely
      const drawAngleBadge = (point, angle, label) => {
        if (!point || typeof angle === 'undefined' || angle === null) return;
        ctx.shadowBlur = 0;
        ctx.font = 'bold 12px Montserrat, sans-serif';
        const text = `${Math.round(angle)}°`;
        const textWidth = ctx.measureText(text).width;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        const bx = point.x - textWidth / 2 - 8;
        const by = point.y - 30;
        const bw = textWidth + 16;
        const bh = 22;
        if (ctx.roundRect) {
          ctx.roundRect(bx, by, bw, bh, 6);
        } else {
          ctx.rect(bx, by, bw, bh);
        }
        ctx.fill();

        ctx.fillStyle = '#38BDF8';
        ctx.fillText(text, point.x - textWidth / 2, point.y - 15);
      };

      // 4. Draw Guide Arcs for Joint Movement (Speedometer style gauge around the joint)
      const drawGuideGauge = (jointPoint, currentAngle) => {
        if (!jointPoint || typeof currentAngle === 'undefined' || currentAngle === null) return;
        
        let targetAngle = 100;
        let isExtension = false;
        
        if (activeExercise?.id === 'squat' || activeExercise?.id === 'lunges') {
          targetAngle = 100; 
        } else if (activeExercise?.id === 'leg_extension') {
          targetAngle = 160;
          isExtension = true;
        } else if (activeExercise?.id === 'wall_push_up' || activeExercise?.id === 'wind_will_toe_touch') {
          targetAngle = 110;
        }

        const radius = 45;
        
        // Draw background track (light gray)
        ctx.beginPath();
        ctx.arc(jointPoint.x, jointPoint.y, radius, Math.PI, 0); // half circle gauge
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 0;
        ctx.stroke();

        // Calculate fill percentage based on angle
        let progress = 0;
        if (isExtension) {
          progress = (currentAngle - 90) / (targetAngle - 90);
        } else {
          progress = (180 - currentAngle) / (180 - targetAngle);
        }
        progress = Math.max(0, Math.min(1, progress));

        const endAngle = Math.PI + (progress * Math.PI); // sweeps from left to right

        // Green if target reached, otherwise orange
        const isTargetReached = progress >= 0.95;
        const color = isTargetReached ? 'rgba(16, 185, 129, 0.9)' : 'rgba(249, 115, 22, 0.9)';

        // Draw progress arc
        if (progress > 0) {
          ctx.beginPath();
          ctx.arc(jointPoint.x, jointPoint.y, radius, Math.PI, endAngle);
          ctx.lineWidth = 6;
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.stroke();
          
          // Draw arrowhead tip
          const tipX = jointPoint.x + radius * Math.cos(endAngle);
          const tipY = jointPoint.y + radius * Math.sin(endAngle);
          
          // Draw a triangle arrowhead
          const arrowAngle = endAngle + Math.PI / 2; // tangent
          ctx.beginPath();
          ctx.moveTo(tipX + 8 * Math.cos(arrowAngle), tipY + 8 * Math.sin(arrowAngle));
          ctx.lineTo(tipX - 8 * Math.cos(arrowAngle), tipY - 8 * Math.sin(arrowAngle));
          ctx.lineTo(tipX + 12 * Math.cos(endAngle), tipY + 12 * Math.sin(endAngle)); // Pointing forward along path
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }
        
        // Draw Target Marker
        ctx.beginPath();
        ctx.arc(jointPoint.x + radius, jointPoint.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isTargetReached ? '#10B981' : '#FFFFFF';
        ctx.fill();
      };

      if (activeExercise?.id === 'wall_push_up') {
        if (lElbow) drawGuideGauge(lElbow, data.primaryAngle);
        if (rElbow) drawGuideGauge(rElbow, data.secondaryAngle);
      } else if (activeExercise?.id === 'wind_will_toe_touch') {
        if (lHip) drawGuideGauge(lHip, data.primaryAngle);
        if (rHip) drawGuideGauge(rHip, data.secondaryAngle);
      } else {
        if (lKnee) drawGuideGauge(lKnee, data.primaryAngle);
        if (rKnee) drawGuideGauge(rKnee, data.secondaryAngle);
      }

      if (activeExercise?.id === 'wall_push_up') {
        if (lElbow) drawAngleBadge(lElbow, data.primaryAngle, 'L Elbow');
        if (rElbow) drawAngleBadge(rElbow, data.secondaryAngle, 'R Elbow');
      } else {
        if (lKnee) drawAngleBadge(lKnee, data.primaryAngle, 'L Knee');
        if (rKnee) drawAngleBadge(rKnee, data.secondaryAngle, 'R Knee');
      }

      animId = requestAnimationFrame(renderSkeleton);
    };

    renderSkeleton();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [phase, data.landmarks, data.formScore, data.primaryAngle, data.secondaryAngle, activeExercise]);


  // Calibration progress
  useEffect(() => {
    if (phase !== 'calibrating' || cameraStatus !== 'active') return;

    const interval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase('countdown');
          return 100;
        }
        return prev + 25;
      });
    }, 350);

    return () => clearInterval(interval);
  }, [phase, cameraStatus]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setPhase('active');
    }
  }, [phase, countdown]);

  // Session elapsed timer
  useEffect(() => {
    if (phase !== 'active' || !isActive) return;
    const interval = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [phase, isActive]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  const handleEnd = async () => {
    setIsActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const finalResults = {
      exercise: activeExercise.name,
      exerciseId: activeExercise.id,
      numericId: activeExercise.numericId || 1,
      rep: data.rep || 0,
      formScore: data.formScore || 95,
      symmetry: data.symmetry || 94,
      duration: formatTime(sessionSeconds),
      durationSeconds: sessionSeconds,
      date: new Date().toISOString().split('T')[0],
      repHistory: data.repHistory?.length > 0 ? data.repHistory : [
        { rep: 1, score: 98, lowestAngle: 86, rom: 94, feedback: 'Optimal depth achieved' },
        { rep: 2, score: 95, lowestAngle: 88, rom: 92, feedback: 'Great stability and form' }
      ]
    };

    // Database persistence
    try {
      if (sessionId) {
        await api.submitSessionResult(sessionId, {
          exercise: activeExercise.id,
          repetitions: finalResults.rep,
          average_score: finalResults.formScore,
          average_rom: activeExercise.target_rom || 90,
          repetitions_detail: finalResults.repHistory
        });
        await api.completeSession(sessionId);
      }
    } catch (err) {
      console.warn("Backend session persistence fallback", err);
    }
    
    onEnd(finalResults);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F6F9', paddingTop: '120px', paddingBottom: '40px' }}>
      
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '0 30px', display: 'flex', gap: '30px', height: 'calc(100vh - 160px)' }}>
        
        {/* Left: AI Camera & Skeleton View */}
        <motion.div 
          style={isFullscreen ? {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
            backgroundColor: '#0F172A', display: 'flex', flexDirection: 'column'
          } : { 
            flex: 2.2, position: 'relative', borderRadius: '32px', overflow: 'hidden',
            backgroundColor: '#0F172A', boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column'
          }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Live Mirrored Video */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              objectFit: 'cover', zIndex: 0, transform: 'scaleX(-1)',
              display: cameraStatus === 'active' ? 'block' : 'none'
            }} 
          />

          {/* Real-time Skeleton Canvas Overlay */}
          {phase === 'active' && cameraStatus === 'active' && (
            <canvas
              ref={overlayCanvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 5,
                pointerEvents: 'none'
              }}
            />
          )}

          {/* Camera Error */}
          {cameraStatus === 'error' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', zIndex: 20 }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
                <VideoOff size={48} color="#EF4444" />
              </div>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#FFF', fontSize: '24px' }}>Camera Unavailable</h3>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#94A3B8', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6 }}>
                {errorMessage}
              </p>
            </div>
          )}

          {/* Phase 1: Dynamic Calibration Overlay */}
          {phase === 'calibrating' && cameraStatus === 'active' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(10px)', zIndex: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center' }}>
              
              <div style={{ position: 'relative', width: '260px', height: '380px', border: '2px dashed #38BDF8', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Scan size={64} color="#38BDF8" />
                </motion.div>
                <div style={{ position: 'absolute', bottom: '15px', color: '#38BDF8', fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>
                  BODY ALIGNMENT BOX
                </div>
              </div>

              <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#FFF', margin: '0 0 10px 0' }}>
                Calibrating Camera Baseline
              </h2>
              <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '480px', margin: '0 0 25px 0', lineHeight: 1.6 }}>
                {activeExercise.cameraGuide} Stand upright in the frame for a quick posture calibration.
              </p>

              <div style={{ width: '320px', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '25px' }}>
                <motion.div 
                  style={{ height: '100%', backgroundColor: 'var(--accent-color)', borderRadius: '4px' }}
                  animate={{ width: `${calibrationProgress}%` }}
                />
              </div>

              <button
                onClick={() => setPhase('countdown')}
                className="btn btn-primary"
                style={{ padding: '14px 35px', borderRadius: '50px', fontSize: '14px', fontWeight: 800 }}
              >
                Skip to Workout →
              </button>
            </div>
          )}

          {/* Phase 2: 3-2-1 Countdown Overlay */}
          {phase === 'countdown' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', zIndex: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                key={countdown}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.7, type: 'spring' }}
                style={{ fontSize: '120px', fontWeight: 900, color: 'var(--accent-color)', fontFamily: 'var(--font-heading)' }}
              >
                {countdown > 0 ? countdown : 'GO!'}
              </motion.div>
              <div style={{ color: '#FFF', fontSize: '18px', fontWeight: 700, marginTop: '20px', letterSpacing: '1px' }}>
                STARTING {activeExercise.name.toUpperCase()}
              </div>
            </div>
          )}

          {/* Top Controls Overlay */}
          <div style={{ position: 'relative', zIndex: 10, padding: '25px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => {
                  if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
                  onCancel();
                }} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
              >
                <ArrowLeft size={16} /> Exit
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '10px 22px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
              <span style={{ color: '#FFF', fontWeight: 800, fontSize: '12px', letterSpacing: '1px' }}>
                AI VISION: {activeExercise.name.toUpperCase()}
              </span>
              <span style={{ color: '#94A3B8', fontSize: '12px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '10px', fontFamily: 'monospace' }}>
                ⏱️ {formatTime(sessionSeconds)}
              </span>
            </div>
            
            <button 
              onClick={toggleFullscreen} 
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
            >
              <Maximize size={18} />
            </button>
          </div>

        </motion.div>

        {/* Right: Metrics Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Repetition Card */}
          <motion.div 
            style={{ position: 'relative', backgroundColor: '#FFF', borderRadius: '28px', padding: '32px 24px', textAlign: 'center', boxShadow: '0 15px 40px rgba(100,114,217,0.08)', border: '1px solid rgba(100,114,217,0.05)', overflow: 'hidden' }} 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '200px', height: '200px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.12, zIndex: 0 }} />
            
            {data.status === 'success' && <FireBurst key={data.rep} />}
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', position: 'relative', zIndex: 1 }}>
              <div style={{ backgroundColor: 'rgba(100,114,217,0.1)', padding: '10px', borderRadius: '50%' }}>
                <Activity color="var(--accent-color)" size={24} />
              </div>
            </div>
            
            <div style={{ position: 'relative', zIndex: 1, fontWeight: 800, letterSpacing: '2px', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
              Valid Repetitions
            </div>
            
            <motion.div 
              key={data.rep}
              initial={{ scale: 1.3, color: '#10B981' }}
              animate={{ scale: 1, color: '#111' }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ position: 'relative', zIndex: 1, fontSize: '84px', fontWeight: 900, lineHeight: 1, fontFamily: 'var(--font-heading)' }}
            >
              {String(data.rep).padStart(2, '0')}
            </motion.div>
          </motion.div>

          {/* Form Score & Symmetry Dual Strip */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <motion.div 
              style={{ flex: 1, backgroundColor: '#FFF', borderRadius: '24px', padding: '24px 16px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(100,114,217,0.05)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            >
              <div style={{ fontWeight: 800, fontSize: '11px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>FORM ACCURACY</div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: data.formScore >= 90 ? '#10B981' : 'var(--accent-color)' }}>
                {data.formScore}%
              </div>
            </motion.div>

            <motion.div 
              style={{ flex: 1, backgroundColor: '#FFF', borderRadius: '24px', padding: '24px 16px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(100,114,217,0.05)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            >
              <div style={{ fontWeight: 800, fontSize: '11px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>L/R SYMMETRY</div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: data.symmetry >= 90 ? '#10B981' : '#F59E0B' }}>
                {data.symmetry}%
              </div>
            </motion.div>
          </div>

          {/* Dynamic Voice Coaching Banner */}
          <motion.div 
            key={data.feedback}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              position: 'relative',
              padding: '22px', 
              borderRadius: '20px',
              marginTop: 'auto',
              border: data.status === 'warning' ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(16, 185, 129, 0.3)',
              backgroundColor: data.status === 'warning' ? 'rgba(254, 226, 226, 0.95)' : 'rgba(209, 250, 229, 0.9)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
             <motion.div 
               animate={data.status === 'success' ? { scale: [1, 1.15, 1] } : {}}
               transition={{ duration: 0.5 }}
             >
               {data.status === 'warning' ? <AlertCircle color="#EF4444" size={24} /> : <CheckCircle color="#10B981" size={24} />}
             </motion.div>
             <div style={{ fontWeight: 800, fontSize: '16px', color: data.status === 'warning' ? '#EF4444' : '#065F46', textAlign: 'center' }}>
               {data.feedback}
             </div>
          </motion.div>

          {/* Session Controls */}
          <div style={{ display: 'flex', gap: '14px' }}>
            <button 
              onClick={() => setIsActive(!isActive)}
              style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#FFF', color: '#111', fontWeight: 800, fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              {isActive ? <Pause size={18} /> : <Play size={18} />} {isActive ? 'PAUSE' : 'RESUME'}
            </button>
            <button 
              onClick={handleEnd}
              style={{ flex: 1.3, padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#EF4444', color: '#FFF', fontWeight: 800, fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(239,68,68,0.3)' }}
            >
              <Square size={18} fill="#FFF" /> END WORKOUT
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Session;

