import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Pause, Square, Play, VideoOff, Scan, Activity, Maximize, AlertCircle, Flame } from 'lucide-react';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { api } from '../services/api';
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

// Physics-based Fire Burst Particle System
const FireBurst = () => {
  const particles = Array.from({ length: 15 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 15 + (Math.random() - 0.5) * 0.5;
    const velocity = 40 + Math.random() * 60;
    return {
      id: i,
      x: Math.cos(angle) * velocity,
      y: Math.sin(angle) * velocity - 30, // Bias upwards like fire
      scale: 0.5 + Math.random(),
      duration: 0.5 + Math.random() * 0.5,
      color: Math.random() > 0.5 ? '#F59E0B' : '#EF4444' // Mix of orange and red
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

const Session = ({ onEnd, onCancel }) => {
  const [isActive, setIsActive] = useState(true);
  const videoRef = useRef(null);
  const data = useAIAnalysis(isActive, videoRef);
  
  // Real Webcam state
  const streamRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('requesting'); // 'requesting', 'active', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // DB Session Tracking
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraStatus('active');
        
        // Start backend session tracking (assuming exercise_id 1 is Squat)
        api.startSession(1)
           .then(res => setSessionId(res.id))
           .catch(err => console.error("DB Session tracking failed to start", err));
           
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraStatus('error');
        setErrorMessage(err.message || 'Camera access denied or not available.');
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  const handleEnd = async () => {
    setIsActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (sessionId) {
      try {
        await api.submitSessionResult(sessionId, {
          exercise: "squat",
          repetitions: data.rep,
          average_score: data.formScore,
          average_rom: 111.6, // Placeholder since ROM isn't fully calculated yet
          repetitions_detail: [] 
        });
        await api.completeSession(sessionId);
      } catch (err) {
        console.error("Failed to save final session results to DB", err);
      }
    }
    
    onEnd(data);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F6F9', paddingTop: '130px', paddingBottom: '50px' }}>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '0 40px', display: 'flex', gap: '40px', height: 'calc(100vh - 180px)' }}>
        
        {/* Left: Advanced AI Camera Feed */}
        <motion.div 
          style={isFullscreen ? {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
            backgroundColor: '#0F172A', display: 'flex', flexDirection: 'column'
          } : { 
            flex: 2, position: 'relative', borderRadius: '32px', overflow: 'hidden',
            backgroundColor: '#0F172A', boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column'
          }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Real Webcam Video */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              objectFit: 'cover', zIndex: 0, transform: 'scaleX(-1)', // Mirror effect
              display: cameraStatus === 'active' ? 'block' : 'none'
            }} 
          />
          
          {/* Status Overlay: Requesting Camera */}
          {cameraStatus === 'requesting' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', zIndex: 5 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ marginBottom: '20px' }}>
                <Scan size={48} color="var(--accent-color)" />
              </motion.div>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#FFF', fontSize: '24px' }}>Initializing Camera</h3>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#94A3B8' }}>Please allow camera access in your browser.</p>
            </div>
          )}

          {/* Status Overlay: Camera Error */}
          {cameraStatus === 'error' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', zIndex: 5 }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
                <VideoOff size={48} color="#EF4444" />
              </div>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#FFF', fontSize: '24px' }}>Camera Unavailable</h3>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#94A3B8', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6 }}>
                {errorMessage} Make sure your webcam is connected and you have granted permission in your browser settings.
              </p>
            </div>
          )}

          {/* Dark Vignette Overlay */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(15,23,42,0) 40%, rgba(15,23,42,0.8) 100%)', zIndex: 1, pointerEvents: 'none' }} />

          {/* Top Camera Controls Overlay */}
          <div style={{ position: 'relative', zIndex: 10, padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => {
                if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
                onCancel();
              }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.3s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                <ArrowLeft size={18} /> Exit Workout
              </button>
              
              {/* Manual Stop Camera Button */}
              {cameraStatus === 'active' && (
                <button onClick={() => {
                  if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
                  setCameraStatus('error');
                  setErrorMessage('Camera manually disabled.');
                }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FFF', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.3s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}>
                  <VideoOff size={18} /> Stop Cam
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {cameraStatus === 'active' ? (
                <>
                  <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
                  <span style={{ color: '#FFF', fontWeight: 700, fontSize: '13px', letterSpacing: '1px' }}>AI VISION ACTIVE</span>
                </>
              ) : (
                <>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  <span style={{ color: '#FFF', fontWeight: 700, fontSize: '13px', letterSpacing: '1px' }}>NO CAMERA</span>
                </>
              )}
            </div>
            
            <button onClick={toggleFullscreen} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'background 0.3s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
              <Maximize size={18} />
            </button>
          </div>

          {/* AI Tracking Visualizer (Center Overlay) - Only show if camera is active */}
          {cameraStatus === 'active' && (
            <div style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              {/* Target Reticle */}
              <div style={{ position: 'relative', width: '300px', height: '500px' }}>
                {/* Corner Brackets */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '3px solid var(--accent-color)', borderLeft: '3px solid var(--accent-color)', borderRadius: '8px 0 0 0' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderTop: '3px solid var(--accent-color)', borderRight: '3px solid var(--accent-color)', borderRadius: '0 8px 0 0' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px', borderBottom: '3px solid var(--accent-color)', borderLeft: '3px solid var(--accent-color)', borderRadius: '0 0 0 8px' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '3px solid var(--accent-color)', borderRight: '3px solid var(--accent-color)', borderRadius: '0 0 8px 0' }} />
                
                {/* Animated Scanline */}
                <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', left: 0, right: 0, height: '2px', backgroundColor: 'var(--accent-color)', boxShadow: '0 0 15px var(--accent-color)', opacity: 0.5 }} />

                {/* Mock Skeleton Nodes */}
                <motion.div style={{ position: 'absolute', top: '25%', left: '50%', width: '12px', height: '12px', background: '#10B981', borderRadius: '50%', x: '-50%', y: '-50%', boxShadow: '0 0 10px #10B981' }} />
                <motion.div style={{ position: 'absolute', top: '45%', left: '35%', width: '12px', height: '12px', background: '#38BDF8', borderRadius: '50%', x: '-50%', y: '-50%', boxShadow: '0 0 10px #38BDF8' }} />
                <motion.div style={{ position: 'absolute', top: '45%', right: '35%', width: '12px', height: '12px', background: '#38BDF8', borderRadius: '50%', x: '-50%', y: '-50%', boxShadow: '0 0 10px #38BDF8' }} />
                <motion.div 
                  style={{ position: 'absolute', left: '35%', width: '12px', height: '12px', background: 'var(--accent-color)', borderRadius: '50%', x: '-50%', y: '-50%', boxShadow: '0 0 10px var(--accent-color)' }} 
                  animate={{ top: (100 - (data.kneeAngle / 180 * 40)) + '%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <motion.div 
                  style={{ position: 'absolute', right: '35%', width: '12px', height: '12px', background: 'var(--accent-color)', borderRadius: '50%', x: '-50%', y: '-50%', boxShadow: '0 0 10px var(--accent-color)' }} 
                  animate={{ top: (100 - (data.kneeAngle / 180 * 40)) + '%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Right: Highly Polished Metrics Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <motion.div 
            style={{ position: 'relative', backgroundColor: '#FFF', borderRadius: '32px', padding: '40px', textAlign: 'center', boxShadow: '0 15px 40px rgba(100,114,217,0.08)', border: '1px solid rgba(100,114,217,0.05)', overflow: 'hidden' }} 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
          >
            {/* Floral Texture Background */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '250px', height: '250px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.1, zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '200px', height: '200px', backgroundImage: `url(${bgRight})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.1, zIndex: 0 }} />
            
            {/* Burst effect when rep is counted */}
            {data.status === 'success' && <FireBurst key={data.rep} />}
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', position: 'relative', zIndex: 1 }}>
              <motion.div 
                animate={data.status === 'success' ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.6 }}
                style={{ backgroundColor: data.status === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(100,114,217,0.1)', padding: '12px', borderRadius: '50%' }}
              >
                <Activity color={data.status === 'success' ? '#10B981' : "var(--accent-color)"} size={28} />
              </motion.div>
            </div>
            <div style={{ position: 'relative', zIndex: 1, fontWeight: 800, letterSpacing: '2px', fontSize: '13px', color: '#666', textTransform: 'uppercase', marginBottom: '5px' }}>Total Reps</div>
            <motion.div 
              key={data.rep}
              initial={{ scale: 1.4, color: '#10B981' }}
              animate={{ scale: 1, color: '#111' }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ position: 'relative', zIndex: 1, fontSize: '100px', fontWeight: 900, lineHeight: 1, fontFamily: 'var(--font-heading)' }}
            >
              {String(data.rep).padStart(2, '0')}
            </motion.div>
          </motion.div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <motion.div 
              style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#FFF', borderRadius: '32px', padding: '30px', textAlign: 'center', boxShadow: data.formScore >= 90 ? '0 10px 30px rgba(16,185,129,0.15)' : (data.formScore < 80 ? '0 10px 40px rgba(239,68,68,0.2)' : '0 10px 30px rgba(100,114,217,0.05)'), border: data.formScore >= 90 ? '2px solid rgba(16,185,129,0.3)' : (data.formScore < 80 ? '2px solid rgba(239,68,68,0.5)' : '1px solid rgba(100,114,217,0.05)') }} 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div style={{ position: 'absolute', top: '-30%', right: '-30%', width: '150px', height: '150px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.15, zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '12px', color: '#666', letterSpacing: '1px', marginBottom: '10px' }}>FORM SCORE</div>
              <motion.div 
                key={data.formScore}
                animate={data.formScore < 80 ? { scale: [1, 1.1, 1], color: ['#111', '#EF4444', '#EF4444'] } : { scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ fontSize: '42px', fontWeight: 900, color: data.formScore >= 90 ? '#10B981' : (data.formScore < 80 ? '#EF4444' : 'var(--accent-color)') }}
              >
                {data.formScore}%
              </motion.div>
              </div>
            </motion.div>
            <motion.div 
              style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#FFF', borderRadius: '32px', padding: '30px', textAlign: 'center', boxShadow: data.symmetry >= 90 ? '0 10px 30px rgba(16,185,129,0.15)' : (data.symmetry < 80 ? '0 10px 40px rgba(239,68,68,0.2)' : '0 10px 30px rgba(100,114,217,0.05)'), border: data.symmetry >= 90 ? '2px solid rgba(16,185,129,0.3)' : (data.symmetry < 80 ? '2px solid rgba(239,68,68,0.5)' : '1px solid rgba(100,114,217,0.05)') }} 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '150px', height: '150px', backgroundImage: `url(${bgRight})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.15, zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '12px', color: '#666', letterSpacing: '1px', marginBottom: '10px' }}>SYMMETRY</div>
              <motion.div 
                key={data.symmetry}
                animate={data.symmetry < 80 ? { scale: [1, 1.1, 1], color: ['#111', '#EF4444', '#EF4444'] } : { scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ fontSize: '42px', fontWeight: 900, color: data.symmetry >= 90 ? '#10B981' : (data.symmetry < 80 ? '#EF4444' : '#111') }}
              >
                {data.symmetry}%
              </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Feedback Banner */}
          <motion.div 
            key={data.feedback}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{ 
              position: 'relative',
              overflow: 'hidden',
              padding: '25px', 
              borderRadius: '20px',
              marginTop: 'auto',
              border: data.status === 'warning' ? '2px solid rgba(239, 68, 68, 0.5)' : '2px solid rgba(16, 185, 129, 0.4)',
              backgroundColor: data.status === 'warning' ? 'rgba(254, 226, 226, 0.9)' : 'rgba(209, 250, 229, 0.8)',
              boxShadow: data.status === 'success' ? '0 10px 40px rgba(16, 185, 129, 0.25)' : '0 10px 40px rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px'
            }}
          >
             {/* Render FireBurst overlay in the banner if it's a success */}
             {data.status === 'success' && <FireBurst />}
             
             <motion.div 
               animate={data.status === 'success' ? { scale: [1, 1.2, 1] } : { x: [-3, 3, -3, 3, 0] }}
               transition={{ duration: 0.5, repeat: data.status === 'success' ? Infinity : 0, repeatDelay: 1 }}
               style={{ position: 'relative', zIndex: 1 }}
             >
               {data.status === 'warning' ? <AlertCircle color="#EF4444" size={28} /> : <Scan color="#10B981" size={28} />}
             </motion.div>
             <div style={{ position: 'relative', zIndex: 1, fontWeight: 900, fontSize: '22px', letterSpacing: '0.5px', color: data.status === 'warning' ? '#EF4444' : '#10B981', textAlign: 'center', textTransform: 'uppercase', textShadow: data.status === 'success' ? '0 0 10px rgba(16,185,129,0.3)' : '0 0 10px rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {data.status === 'success' && <AnimatedFlame color="#10B981" />}
               <span>{data.feedback}</span>
             </div>
          </motion.div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ flex: 1, padding: '20px', borderRadius: '20px', border: '2px solid #E2E6EA', backgroundColor: '#FFF', color: '#111', fontWeight: 800, fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setIsActive(!isActive)} onMouseOver={(e) => {e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.backgroundColor = '#F8F9FA'}} onMouseOut={(e) => {e.currentTarget.style.borderColor = '#E2E6EA'; e.currentTarget.style.backgroundColor = '#FFF'}}>
              {isActive ? <Pause size={20} /> : <Play size={20} />} {isActive ? 'PAUSE WORKOUT' : 'RESUME WORKOUT'}
            </button>
            <button style={{ flex: 1, padding: '20px', borderRadius: '20px', border: 'none', backgroundColor: '#EF4444', color: '#FFF', fontWeight: 800, fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 10px 25px rgba(239,68,68,0.3)' }} onClick={handleEnd} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <Square size={20} fill="#FFF" /> END SESSION
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Session;
