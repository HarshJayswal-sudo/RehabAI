import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  Activity, 
  AlertTriangle,
  FileText,
  Info,
  Camera,
  Subtitles
} from 'lucide-react';
import bgLeft from '../../assets/images/background-left.png';
import bgRight from '../../assets/images/background-right.png';
import { EXERCISES } from '../../data/exercises';
import ExerciseVideoPlayer from './ExerciseVideoPlayer';

const ExerciseIntroduction = ({ 
  exercise: initialExercise, 
  onBack, 
  onStartAI 
}) => {
  const exercise = initialExercise || EXERCISES[0];
  const currentIndex = EXERCISES.findIndex(ex => ex.id === exercise.id);
  const exerciseNumber = currentIndex !== -1 ? currentIndex + 1 : 1;
  const totalExercises = EXERCISES.length;

  // UI Flow States: 'intro' | 'ready' | 'countdown'
  const [flowState, setFlowState] = useState('intro');
  const [countdownNum, setCountdownNum] = useState(3);

  // Active Phase from Avatar
  const [currentAvatarPhase, setCurrentAvatarPhase] = useState(
    exercise?.phases?.[0] || { label: '1. Neutral Stance', cue: 'Prepare posture' }
  );

  // Voice Guidance & Captions State
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceBlocked, setVoiceBlocked] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const speechRef = useRef(null);

  // Voice Guidance Synthesizer
  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (!voiceEnabled || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Choose calm, clear natural voice
    const preferredVoice = voices.find(v => 
      v.name.includes('Zira') || 
      v.name.includes('Google UK English Female') || 
      v.name.includes('Google US English') ||
      v.name.includes('Samantha') || 
      v.name.includes('Victoria') ||
      (v.lang.startsWith('en-') && v.name.toLowerCase().includes('female'))
    ) || voices.find(v => v.lang.startsWith('en-')) || voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.95; // reassuring rehabilitation tempo
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setVoiceBlocked(false);
    };

    utterance.onerror = (e) => {
      if (e.error === 'not-allowed') {
        setVoiceBlocked(true);
      }
    };

    speechRef.current = utterance;
    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      setVoiceBlocked(true);
    }
  }, [voiceEnabled]);

  // Trigger narration on mount or when exercise changes
  useEffect(() => {
    setFlowState('intro');

    const voiceTimer = setTimeout(() => {
      if (voiceEnabled) {
        speakText(exercise.voiceScript);
      }
    }, 450);

    return () => {
      clearTimeout(voiceTimer);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [exercise.id, exercise.voiceScript, speakText, voiceEnabled]);

  const handleVideoTimeUpdate = useCallback((curTime) => {
    if (!exercise?.phases || exercise.phases.length === 0) return;
    const progress = curTime % 10.0;
    let idx = 0;
    if (progress < 2.0) idx = 0;
    else if (progress < 6.0) idx = 1;
    else if (progress < 8.0) idx = 2;
    else idx = 3;

    if (exercise.phases[idx]) {
      setCurrentAvatarPhase(exercise.phases[idx]);
    }
  }, [exercise]);

  const toggleVoice = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    if (!nextState) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
      speakText(exercise.voiceScript);
    }
  };

  const toggleCaptions = () => {
    setCaptionsEnabled(prev => !prev);
  };

  const handleSkipIntroduction = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setFlowState('ready');
  };

  const handleStartAnalysis = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setFlowState('countdown');
    setCountdownNum(3);
  };

  // Countdown timer: 3 -> 2 -> 1 -> LET'S BEGIN
  useEffect(() => {
    if (flowState !== 'countdown') return;

    if (countdownNum > 0) {
      const timer = setTimeout(() => {
        setCountdownNum(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      const launchTimer = setTimeout(() => {
        onStartAI();
      }, 600);
      return () => clearTimeout(launchTimer);
    }
  }, [flowState, countdownNum, onStartAI]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#F8FAFC', paddingTop: '95px', paddingBottom: '70px', overflowX: 'hidden' }}>
      
      {/* Background Ambience */}
      <div style={{ position: 'absolute', left: '-5%', top: '10%', width: '400px', height: '600px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.35, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', right: '-5%', bottom: '5%', width: '400px', height: '500px', backgroundImage: `url(${bgRight})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* SECTION 1 — HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '10px 18px',
              borderRadius: '50px',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
          >
            <ArrowLeft size={16} /> Back to Exercises
          </button>

          {/* Exercise Progress Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', backgroundColor: '#FFFFFF', padding: '6px 14px', borderRadius: '50px', border: '1px solid #E2E8F0' }}>
              Exercise {exerciseNumber} of {totalExercises}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-color)', backgroundColor: 'var(--accent-light)', padding: '6px 14px', borderRadius: '50px' }}>
              {exercise.category}
            </span>
          </div>
        </div>

        {/* SECTION 3 — TITLE & CONTEXT */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            <Sparkles size={14} /> Before You Begin
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
              {exercise.name}
            </h1>
            <span style={{ 
              backgroundColor: exercise.difficulty === 'Beginner' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
              color: exercise.difficulty === 'Beginner' ? '#059669' : '#D97706', 
              fontSize: '12px', 
              fontWeight: 800, 
              padding: '4px 12px', 
              borderRadius: '20px' 
            }}>
              {exercise.difficulty}
            </span>
            {exercise.contentStatus === 'PLACEHOLDER_REQUIRES_CLINICAL_REVIEW' && (
              <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={13} /> Requires Clinical Review
              </span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px', maxWidth: '800px', lineHeight: 1.6 }}>
            Our 3D anatomical avatar instructor is demonstrating the exact movement, joint angles, and posture before WeHelp AI analyzes your movement with the webcam.
          </p>
        </div>

        {/* MAIN 2-COLUMN RESPONSIVE LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Humanoid Avatar Instructor Stage & Guidance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* SECTION 2 — CONTINUOUS 3D ANATOMICAL AVATAR DEMONSTRATION VIDEO */}
            <ExerciseVideoPlayer 
              exercise={exercise} 
              captionsEnabled={captionsEnabled}
              onToggleCaptions={toggleCaptions}
              onPhaseTimeUpdate={handleVideoTimeUpdate}
            />

            {/* Captions Overlay Bar (if enabled) */}
            {captionsEnabled && (
              <div style={{
                backgroundColor: '#0F172A',
                borderRadius: '14px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}>
                <Subtitles size={16} color="#38BDF8" />
                <span style={{ color: '#F8FAFC', fontSize: '13px', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{currentAvatarPhase.cue || exercise.voiceScript}"
                </span>
              </div>
            )}

            {/* SECTION 4 — VOICE GUIDANCE CONTROLLER BANNER */}
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '16px', 
              padding: '16px', 
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%', 
                  backgroundColor: voiceEnabled ? 'var(--accent-light)' : '#F1F5F9', 
                  color: voiceEnabled ? 'var(--accent-color)' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Volume2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    Instructor Voice Guidance
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {voiceBlocked 
                      ? 'Browser restricted autoplay. Tap to enable.' 
                      : (voiceEnabled ? 'Synchronized clinical narration active' : 'Voice guidance muted')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* CC Toggle */}
                <button
                  onClick={toggleCaptions}
                  aria-label="Toggle closed captions"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: captionsEnabled ? 'var(--accent-light)' : '#F1F5F9',
                    color: captionsEnabled ? 'var(--accent-color)' : '#64748B',
                    border: '1px solid #E2E8F0',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Subtitles size={13} /> CC
                </button>

                {voiceBlocked ? (
                  <button
                    onClick={() => speakText(exercise.voiceScript)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '50px',
                      backgroundColor: 'var(--accent-color)',
                      color: '#FFF',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    🔊 Enable Voice
                  </button>
                ) : (
                  <button
                    onClick={toggleVoice}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '50px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#475569',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {voiceEnabled ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    <span>{voiceEnabled ? 'Mute' : 'Unmute'}</span>
                  </button>
                )}

                <button
                  onClick={() => speakText(exercise.voiceScript)}
                  title="Replay spoken narration"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            {/* Narration Script Card */}
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '16px', 
              padding: '16px', 
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                <FileText size={14} /> Narration Transcript
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{exercise.voiceScript}"
              </p>
            </div>

          </div>


          {/* RIGHT COLUMN: Clinical Cards (Purpose, How to Perform, Cues, Avoid) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* SECTION 6 — WHY THIS EXERCISE? */}
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '20px', 
              padding: '22px', 
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                <Sparkles size={15} /> WHY THIS EXERCISE?
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
                Rehabilitation Focus
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65, margin: 0 }}>
                {exercise.purpose}
              </p>

              {/* Specs Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', color: '#334155', border: '1px solid #E2E8F0' }}>
                  <strong>Target Joint:</strong> {exercise.primaryJoint}
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', color: '#334155', border: '1px solid #E2E8F0' }}>
                  <strong>Intended Range:</strong> <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{exercise.idealAngle}</span>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', color: '#334155', border: '1px solid #E2E8F0' }}>
                  <strong>Session Est:</strong> {exercise.duration}
                </div>
              </div>
            </div>

            {/* SECTION 7 — HOW TO PERFORM */}
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '20px', 
              padding: '22px', 
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
                <Activity size={15} color="var(--accent-color)" /> HOW TO PERFORM
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(exercise.instructions || exercise.howToPerform || []).map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '26px', 
                      height: '26px', 
                      borderRadius: '50%', 
                      backgroundColor: 'var(--accent-light)', 
                      color: 'var(--accent-color)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '11px', 
                      fontWeight: 800, 
                      flexShrink: 0, 
                      marginTop: '2px' 
                    }}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 8 & 9 — KEY FORM CUES & AVOID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              
              {/* Key Form Cues */}
              <div style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.05)', 
                borderRadius: '18px', 
                padding: '18px', 
                border: '1px solid rgba(16, 185, 129, 0.2)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  <CheckCircle2 size={15} /> KEY FORM CUES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(exercise.formCues || exercise.keyCues || []).map((cue, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#10B981', fontWeight: 800, fontSize: '13px', lineHeight: 1.4 }}>✓</span>
                      <span style={{ fontSize: '12px', color: '#065F46', lineHeight: 1.5 }}>{cue}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avoid / Common Mistakes */}
              <div style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.05)', 
                borderRadius: '18px', 
                padding: '18px', 
                border: '1px solid rgba(239, 68, 68, 0.2)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  <AlertCircle size={15} /> AVOID
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(exercise.commonMistakes || exercise.mistakes || []).map((mistake, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#EF4444', fontWeight: 800, fontSize: '13px', lineHeight: 1.4 }}>✕</span>
                      <span style={{ fontSize: '12px', color: '#991B1B', lineHeight: 1.5 }}>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* SECTION 10 — READY STATE & BOTTOM BAR */}
        <div style={{ marginTop: '36px' }}>
          
          {flowState === 'ready' ? (
            /* READY STATE CARD */
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '28px 24px',
                border: '2px solid var(--accent-color)',
                boxShadow: '0 20px 40px rgba(100,114,217,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                    ✓ Introduction Complete
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0' }}>
                    You're ready to begin.
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                    We'll now use AI to analyze your movement and provide real-time feedback.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => setFlowState('intro')}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '14px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={15} /> Review Avatar Again
                </button>

                <button
                  onClick={handleStartAnalysis}
                  className="btn btn-primary"
                  style={{
                    padding: '15px 32px',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: 800,
                    boxShadow: '0 10px 25px rgba(100,114,217,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={18} /> START AI ANALYSIS <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          ) : (
            /* INTRO STATE ACTIONS */
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={16} color="var(--accent-color)" />
                <span style={{ fontSize: '13px', color: '#475569' }}>
                  Camera remains OFF during introduction. It will only activate after you start the countdown.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleSkipIntroduction}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Skip Introduction
                </button>

                <button
                  onClick={handleSkipIntroduction}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 26px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 800,
                    boxShadow: '0 6px 20px rgba(100,114,217,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <CheckCircle2 size={16} /> I'm Ready
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* COUNTDOWN OVERLAY BEFORE CAMERA ACTIVATION */}
      <AnimatePresence>
        {flowState === 'countdown' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(14px)',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              textAlign: 'center',
              color: '#FFFFFF'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                maxWidth: '480px'
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(100, 114, 217, 0.25)',
                color: '#A5B4FC',
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                <Camera size={16} /> GET READY
              </div>

              <h2 style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Position yourself in front of the camera
              </h2>

              <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0, lineHeight: 1.6 }}>
                AI analysis is starting. Position yourself so your body and target joints are clearly visible.
              </p>

              {/* Big Animated Number: 3 -> 2 -> 1 -> LET'S BEGIN */}
              <div style={{ position: 'relative', width: '160px', height: '160px', margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                  key={countdownNum}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    fontSize: countdownNum > 0 ? '90px' : '38px',
                    fontWeight: 900,
                    color: countdownNum > 0 ? '#38BDF8' : '#10B981',
                    textShadow: '0 0 30px rgba(56, 189, 248, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {countdownNum > 0 ? countdownNum : "LET'S BEGIN"}
                </motion.div>

                {/* Subtle pulsing ring */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    border: '2px solid rgba(56, 189, 248, 0.3)',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600 }}>
                {exercise.name} • {exercise.primaryJoint}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ExerciseIntroduction;
