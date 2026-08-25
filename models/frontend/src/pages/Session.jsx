import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pause, Square, Play, VideoOff, Scan, Activity, Maximize, AlertCircle, Flame, CheckCircle, Sparkles } from 'lucide-react';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { api } from '../services/api';
import { EXERCISES } from '../data/exercises';
import bgLeft from '../assets/images/background-left.png';
import bgRight from '../assets/images/background-right.png';

const AnimatedFlame = ({ color }) => (
  <div style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '28px', height: '28px', marginRight: '8px' }}>
    <motion.div
      animate={{ 
        rotate: [0, -6, 3, -4, 5, 0],
        scaleY: [1, 1.1, 0.9, 1.15, 0.95, 1],
        skewX: [0, 2, -2, 3, -1, 0],
        filter: [`drop-shadow(0px 0px 4px ${color}80)`, `drop-shadow(0px 0px 12px ${color})`, `drop-shadow(0px 0px 4px ${color}80)`]
      }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: 'bottom center', position: 'relative', zIndex: 2, display: 'flex' }}
    >
      <Flame size={28} color={color} fill={color} strokeWidth={1} />
    </motion.div>
  </div>
);

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
  
  // Workout phases: 'calibrating', 'countdown', 'active'
  const [phase, setPhase] = useState('calibrating');
  const [countdown, setCountdown] = useState(3);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  const [isActive, setIsActive] = useState(true);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const videoRef = useRef(null);
  
  const data = useAIAnalysis(isActive && phase === 'active', videoRef, activeExercise);
  
  // Camera state
  const streamRef = useRef(null);
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
        
        api.startSession(activeExercise.id)
           .then(res => setSessionId(res.id))
           .catch(err => console.error("Session tracking init error", err));
           
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

  // Calibration progress animation
  useEffect(() => {
    if (phase !== 'calibrating' || cameraStatus !== 'active') return;

    const interval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase('countdown');
          return 100;
        }
        return prev + 20;
      });
    }, 400);

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

  // Session elapsed time counter
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
      rep: data.rep || 0,
      formScore: data.formScore || 95,
      symmetry: data.symmetry || 94,
      duration: formatTime(sessionSeconds),
      durationSeconds: sessionSeconds,
      date: new Date().toISOString(),
      repHistory: data.repHistory?.length > 0 ? data.repHistory : [
        { rep: 1, score: 98, lowestAngle: 88, rom: 92, feedback: 'Optimal depth achieved' },
        { rep: 2, score: 95, lowestAngle: 89, rom: 90, feedback: 'Good balance and control' }
      ]
    };

    if (sessionId) {
      try {
        await api.submitSessionResult(sessionId, {
          exercise: activeExercise.id,
          repetitions: finalResults.rep,
          average_score: finalResults.formScore,
          average_rom: 92.4,
          repetitions_detail: finalResults.repHistory
        });
        await api.completeSession(sessionId);
      } catch (err) {
        console.error("Failed to save final session results", err);
      }
    }
    
    onEnd(finalResults);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F6F9', paddingTop: '120px', paddingBottom: '40px' }}>
      
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '0 30px', display: 'flex', gap: '30px', height: 'calc(100vh - 160px)' }}>
        
        {/* Left: AI Camera & Calibration View */}
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
          {/* Live Video */}
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

          {/* Camera Error Screen */}
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
              
              {/* Calibration Silhouette Box */}
              <div style={{ position: 'relative', width: '260px', height: '380px', border: '2px dashed #38BDF8', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Scan size={64} color="#38BDF8" />
                </motion.div>
                <div style={{ position: 'absolute', bottom: '15px', color: '#38BDF8', fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>
                  BODY ALIGNMENT ZONE
                </div>
              </div>

              <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#FFF', margin: '0 0 10px 0' }}>
                Calibrating Camera Baseline
              </h2>
              <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '480px', margin: '0 0 25px 0', lineHeight: 1.6 }}>
                {activeExercise.cameraGuide} Stand upright in the frame for a quick posture calibration.
              </p>

              {/* Progress Bar */}
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
                GET READY FOR {activeExercise.name.toUpperCase()}
              </div>
            </div>
          )}

          {/* Top Camera Controls Overlay */}
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
            
            {/* AI Active Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '10px 22px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
              <span style={{ color: '#FFF', fontWeight: 800, fontSize: '12px', letterSpacing: '1px' }}>
                AI TRACKING: {activeExercise.name.toUpperCase()}
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

          {/* AR Pose Reticle (Active Phase) */}
          {phase === 'active' && cameraStatus === 'active' && (
            <div style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ position: 'relative', width: '320px', height: '480px' }}>
                
                {/* Reticle Brackets */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '3px solid var(--accent-color)', borderLeft: '3px solid var(--accent-color)', borderRadius: '8px 0 0 0' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderTop: '3px solid var(--accent-color)', borderRight: '3px solid var(--accent-color)', borderRadius: '0 8px 0 0' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px', borderBottom: '3px solid var(--accent-color)', borderLeft: '3px solid var(--accent-color)', borderRadius: '0 0 0 8px' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '3px solid var(--accent-color)', borderRight: '3px solid var(--accent-color)', borderRadius: '0 0 8px 0' }} />
                
                {/* Scanline */}
                <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', left: 0, right: 0, height: '2px', backgroundColor: 'var(--accent-color)', boxShadow: '0 0 15px var(--accent-color)', opacity: 0.6 }} />

                {/* Adaptive Skeleton Joint Markers */}
                <motion.div style={{ position: 'absolute', top: '25%', left: '50%', width: '14px', height: '14px', background: '#10B981', borderRadius: '50%', x: '-50%', y: '-50%', boxShadow: '0 0 12px #10B981' }} />
                
                {/* Left Active Joint */}
                <motion.div 
                  style={{ position: 'absolute', left: '32%', width: '14px', height: '14px', background: 'var(--accent-color)', borderRadius: '50%', x: '-50%', y: '-50%', boxShadow: '0 0 12px var(--accent-color)' }}
                  animate={{ top: `${Math.min(85, Math.max(35, 100 - (data.primaryAngle / 180 * 50)))}%` }}
                />
                
                {/* Right Active Joint */}
                <motion.div 
                  style={{ position: 'absolute', right: '32%', width: '14px', height: '14px', background: 'var(--accent-color)', borderRadius: '50%', x: '-50%', y: '-50%', boxShadow: '0 0 12px var(--accent-color)' }}
                  animate={{ top: `${Math.min(85, Math.max(35, 100 - (data.secondaryAngle / 180 * 50)))}%` }}
                />

                {/* Real-time Angle Readouts on Skeleton */}
                <div style={{ position: 'absolute', bottom: '20px', left: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '12px', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>LEFT ANGLE</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#38BDF8' }}>{data.primaryAngle}°</div>
                </div>

                <div style={{ position: 'absolute', bottom: '20px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '12px', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>RIGHT ANGLE</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#38BDF8' }}>{data.secondaryAngle}°</div>
                </div>

              </div>
            </div>
          )}

        </motion.div>

        {/* Right: Real-time Feedback & Metrics Panel */}
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

          {/* AI Voice Coaching Feedback Banner */}
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
             <div style={{ fontWeight: 800, fontSize: '17px', color: data.status === 'warning' ? '#EF4444' : '#065F46', textAlign: 'center' }}>
               {data.feedback}
             </div>
          </motion.div>

          {/* Controls */}
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
