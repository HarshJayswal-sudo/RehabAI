import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowDown, 
  ArrowUp, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  EyeOff,
  Gauge
} from 'lucide-react';

const ExerciseAvatar = ({ 
  exercise, 
  onPhaseChange,
  isPaused: externalPaused = false
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 1.0 = Normal, 0.75 = Slow-Mo
  const [showJointHUD, setShowJointHUD] = useState(true);

  const phases = exercise?.phases || [
    { id: 'starting_position', label: '1. Neutral Stance', angle: exercise?.startAngle || 175, cue: 'Starting neutral alignment', direction: 'READY' },
    { id: 'demonstrating', label: '2. Controlled Movement', angle: 125, cue: 'Moving slowly into target range', direction: 'DOWN' },
    { id: 'end_position', label: '3. Target Angle Hold', angle: exercise?.targetAngle || 90, cue: 'Hold peak position with controlled balance', direction: 'HOLD' },
    { id: 'returning', label: '4. Controlled Return', angle: 165, cue: 'Smooth return back to starting stance', direction: 'UP' }
  ];

  const currentPhase = phases[currentPhaseIndex];

  // Notify parent of phase change
  useEffect(() => {
    if (onPhaseChange) {
      onPhaseChange(currentPhase, currentPhaseIndex);
    }
  }, [currentPhaseIndex, currentPhase, onPhaseChange]);

  // Animation playback cycle loop
  useEffect(() => {
    if (!isPlaying || externalPaused) return;

    // Phase durations based on speed:
    // starting: 2000ms, demonstrating: 2500ms, end_position: 1800ms, returning: 2200ms
    const baseDurations = [2200, 2600, 2000, 2400];
    const duration = (baseDurations[currentPhaseIndex] || 2200) / playbackSpeed;

    const timer = setTimeout(() => {
      setCurrentPhaseIndex(prev => (prev + 1) % phases.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, externalPaused, currentPhaseIndex, playbackSpeed, phases.length]);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const restartLoop = () => {
    setCurrentPhaseIndex(0);
    setIsPlaying(true);
  };

  const jumpToPhase = (index) => {
    setCurrentPhaseIndex(index);
  };

  const toggleSpeed = () => {
    setPlaybackSpeed(prev => (prev === 1.0 ? 0.75 : (prev === 0.75 ? 0.5 : 1.0)));
  };

  // Kinetic displacement configurations per exercise and phase
  const getKinematicTransform = () => {
    const id = exercise?.id;
    const phaseId = currentPhase.id;

    if (id === 'squat') {
      if (phaseId === 'starting_position') {
        return { y: 0, scale: 0.96, rotate: 0 };
      } else if (phaseId === 'demonstrating') {
        return { y: 18, scale: 1.0, rotate: 1 };
      } else if (phaseId === 'end_position') {
        return { y: 32, scale: 1.03, rotate: 2 };
      } else {
        return { y: 12, scale: 0.98, rotate: 1 };
      }
    }

    if (id === 'lunges') {
      if (phaseId === 'starting_position') {
        return { y: 0, x: -10, scale: 0.97 };
      } else if (phaseId === 'demonstrating') {
        return { y: 15, x: 0, scale: 1.0 };
      } else if (phaseId === 'end_position') {
        return { y: 28, x: 8, scale: 1.02 };
      } else {
        return { y: 10, x: -4, scale: 0.98 };
      }
    }

    if (id === 'leg_extension') {
      if (phaseId === 'starting_position') {
        return { y: 0, scale: 0.98 };
      } else if (phaseId === 'demonstrating') {
        return { y: -4, scale: 1.0 };
      } else if (phaseId === 'end_position') {
        return { y: -8, scale: 1.02 };
      } else {
        return { y: -2, scale: 0.99 };
      }
    }

    if (id === 'wall_push_up') {
      if (phaseId === 'starting_position') {
        return { x: 10, y: 0, scale: 0.98 };
      } else if (phaseId === 'demonstrating') {
        return { x: -6, y: 6, scale: 1.0 };
      } else if (phaseId === 'end_position') {
        return { x: -16, y: 12, scale: 1.03 };
      } else {
        return { x: -4, y: 4, scale: 0.99 };
      }
    }

    if (id === 'wind_will_toe_touch') {
      if (phaseId === 'starting_position') {
        return { rotate: 0, y: 0, scale: 0.98 };
      } else if (phaseId === 'demonstrating') {
        return { rotate: -4, y: 8, scale: 1.0 };
      } else if (phaseId === 'end_position') {
        return { rotate: -8, y: 16, scale: 1.02 };
      } else {
        return { rotate: -3, y: 6, scale: 0.99 };
      }
    }

    return { y: 0, scale: 1.0 };
  };

  const transform = getKinematicTransform();

  // Joint dot coordinate mapping for the avatar overlay
  const getJointCoordinates = () => {
    const id = exercise?.id;
    if (id === 'squat') {
      return { hip: { top: '48%', left: '38%' }, knee: { top: '64%', left: '55%' }, ankle: { top: '88%', left: '42%' } };
    }
    if (id === 'lunges') {
      return { hip: { top: '50%', left: '45%' }, knee: { top: '66%', left: '68%' }, ankle: { top: '87%', left: '71%' } };
    }
    if (id === 'leg_extension') {
      return { hip: { top: '55%', left: '32%' }, knee: { top: '63%', left: '54%' }, ankle: { top: '64%', left: '86%' } };
    }
    if (id === 'wall_push_up') {
      return { shoulder: { top: '35%', left: '40%' }, elbow: { top: '38%', left: '33%' }, wrist: { top: '35%', left: '16%' } };
    }
    return { hip: { top: '54%', left: '54%' }, shoulder: { top: '46%', left: '34%' }, hand: { top: '85%', left: '26%' } };
  };

  const joints = getJointCoordinates();

  return (
    <div style={{
      backgroundColor: '#0A0E17',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 20px 45px rgba(10, 14, 23, 0.25)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid rgba(100, 114, 217, 0.15)'
    }}>
      
      {/* Top Header Badge Strip */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 5,
        pointerEvents: 'none'
      }}>
        {/* Instructor Avatar Badge */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '6px 14px',
          borderRadius: '50px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
          <span style={{ color: '#F8FAFC', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>
            HUMAN-LIKE AVATAR INSTRUCTOR
          </span>
        </div>

        {/* Phase Pill */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '6px 12px',
          borderRadius: '50px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#38BDF8',
          fontSize: '11px',
          fontWeight: 800
        }}>
          {currentPhase.label}
        </div>
      </div>

      {/* Main Avatar Stage */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '420px',
        height: '460px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #151D2C 0%, #080C14 100%)',
        overflow: 'hidden'
      }}>
        
        {/* Subtle Biomechanical Grid Backplane */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.6,
          pointerEvents: 'none'
        }} />

        {/* 3D Humanoid Avatar Image with Smooth Kinetic Transformations */}
        <motion.div
          animate={{
            y: transform.y || 0,
            x: transform.x || 0,
            scale: transform.scale || 1,
            rotate: transform.rotate || 0
          }}
          transition={{
            duration: 1.2 / playbackSpeed,
            ease: [0.25, 0.1, 0.25, 1.0]
          }}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img 
            src={exercise?.avatarImage} 
            alt={`${exercise?.name} Visual Avatar`}
            style={{
              maxHeight: '90%',
              maxWidth: '85%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.6))',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />

          {/* Joint HUD & Angle Arc Overlays */}
          {showJointHUD && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
              
              {/* Primary Active Joint Halo (e.g. Knee) */}
              {joints.knee && (
                <div style={{ position: 'absolute', top: joints.knee.top, left: joints.knee.left, transform: 'translate(-50%, -50%)' }}>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.2, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #38BDF8' }}
                  />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38BDF8', boxShadow: '0 0 10px #38BDF8' }} />
                </div>
              )}

              {/* Elbow Joint Halo */}
              {joints.elbow && (
                <div style={{ position: 'absolute', top: joints.elbow.top, left: joints.elbow.left, transform: 'translate(-50%, -50%)' }}>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.2, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #38BDF8' }}
                  />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38BDF8', boxShadow: '0 0 10px #38BDF8' }} />
                </div>
              )}

              {/* Hip Pivot Dot */}
              {joints.hip && (
                <div style={{ position: 'absolute', top: joints.hip.top, left: joints.hip.left, transform: 'translate(-50%, -50%)', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#A5B4FC', boxShadow: '0 0 8px #A5B4FC' }} />
              )}
            </div>
          )}

        </motion.div>

        {/* Live Kinematic Angle & Direction HUD Card */}
        {showJointHUD && (
          <div style={{
            position: 'absolute',
            bottom: '68px',
            right: '16px',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '12px 16px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            zIndex: 4,
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
          }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {exercise?.jointLabel || 'Target Joint Angle'}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: currentPhase.id === 'end_position' ? '#10B981' : '#38BDF8', lineHeight: 1.2 }}>
                {currentPhase.angle}°
              </div>
            </div>

            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8' }}>Ideal Range</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#F8FAFC' }}>
                {exercise?.idealAngle || '85° - 95°'}
              </div>
            </div>
          </div>
        )}

        {/* Real-Time Movement Direction Banner */}
        <div style={{
          position: 'absolute',
          bottom: '68px',
          left: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          padding: '10px 14px',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 4
        }}>
          {currentPhase.direction === 'DOWN' && <ArrowDown size={16} color="#38BDF8" />}
          {currentPhase.direction === 'UP' && <ArrowUp size={16} color="#10B981" />}
          {currentPhase.direction === 'HOLD' && <CheckCircle2 size={16} color="#10B981" />}
          {currentPhase.direction === 'READY' && <Sparkles size={16} color="#F59E0B" />}
          <span style={{ color: '#F8FAFC', fontSize: '12px', fontWeight: 700 }}>
            {currentPhase.cue}
          </span>
        </div>

      </div>

      {/* Interactive Movement Phase Step Bar */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#0F172A',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        
        {/* Play / Pause / Replay Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause avatar movement' : 'Play avatar movement'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? 'rgba(56, 189, 248, 0.15)' : 'var(--accent-color)',
              color: '#FFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
          </button>

          <button
            onClick={restartLoop}
            aria-label="Restart movement loop"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#CBD5E1',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Phase Step Scrubbing Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1, justifyContent: 'center' }}>
          {phases.map((p, idx) => {
            const isActive = currentPhaseIndex === idx;
            return (
              <button
                key={p.id}
                onClick={() => jumpToPhase(idx)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backgroundColor: isActive ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  border: isActive ? '1px solid var(--accent-color)' : '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Speed & HUD Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleSpeed}
            title="Adjust demonstration speed"
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              backgroundColor: playbackSpeed < 1.0 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: playbackSpeed < 1.0 ? '#38BDF8' : '#CBD5E1',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Gauge size={13} /> {playbackSpeed === 1.0 ? '1.0x' : (playbackSpeed === 0.75 ? '0.75x' : '0.5x')}
          </button>

          <button
            onClick={() => setShowJointHUD(prev => !prev)}
            title={showJointHUD ? 'Hide Joint Overlays' : 'Show Joint Overlays'}
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: showJointHUD ? '#38BDF8' : '#64748B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {showJointHUD ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>

      </div>

    </div>
  );
};

export default ExerciseAvatar;
