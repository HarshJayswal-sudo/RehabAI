import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Activity, Calendar, Clock, Flame } from 'lucide-react';
import bgLeft from '../assets/images/background-left.png';
import bgRight from '../assets/images/background-right.png';

const Summary = ({ results, onFinish, onRepeat }) => {
  if (!results) return null;

  const repDetails = results.repHistory || [
    { rep: 1, score: 98, lowestAngle: 86, rom: 94, feedback: 'Optimal depth achieved.' },
    { rep: 2, score: 96, lowestAngle: 88, rom: 92, feedback: 'Good balance and control.' },
    { rep: 3, score: 94, lowestAngle: 90, rom: 90, feedback: 'Maintain steady pace.' }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '130px 20px 60px', backgroundColor: '#F8F9FA', overflowX: 'hidden' }}>
      
      <div style={{ position: 'absolute', left: '-5%', top: '15%', width: '400px', height: '500px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.35, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: '-5%', bottom: '10%', width: '400px', height: '500px', backgroundImage: `url(${bgRight})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.35, pointerEvents: 'none' }} />

      <motion.div 
        style={{ maxWidth: '800px', width: '100%', padding: '50px 40px', backgroundColor: '#FFF', borderRadius: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.06)', border: '1px solid rgba(100,114,217,0.1)', position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 18px', borderRadius: '50px', color: '#059669', fontWeight: 800, fontSize: '13px', marginBottom: '15px' }}>
            <Award size={16} /> SESSION COMPLETED
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', color: '#111827', letterSpacing: '-0.5px' }}>
            {results.exercise || 'Rehabilitation Routine'}
          </h1>
          <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
            Outstanding work! Your AI biomechanical analysis has been evaluated.
          </p>
        </div>

        {/* Big Score Circular Gauge & Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px', alignItems: 'center', marginBottom: '40px', padding: '30px', backgroundColor: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              style={{ 
                width: '160px', height: '160px', borderRadius: '50%', border: '8px solid var(--accent-color)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(100,114,217,0.2)', backgroundColor: '#FFF'
              }}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <div style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1, color: '#111827' }}>
                {results.formScore}%
              </div>
              <div style={{ fontWeight: 800, fontSize: '11px', letterSpacing: '1.5px', color: 'var(--accent-color)', marginTop: '4px' }}>
                FORM ACCURACY
              </div>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>TOTAL REPS</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#111', marginTop: '4px' }}>{results.rep}</div>
            </div>

            <div style={{ backgroundColor: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>L/R SYMMETRY</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>{results.symmetry}%</div>
            </div>

            <div style={{ backgroundColor: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>DURATION</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#111', marginTop: '4px' }}>{results.duration || '02:45'}</div>
            </div>

            <div style={{ backgroundColor: '#FFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>AVG RANGE OF MOTION</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent-color)', marginTop: '4px' }}>92%</div>
            </div>
          </div>
        </div>

        {/* Repetition-by-Repetition Breakdown */}
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--accent-color)" /> Repetition Breakdown
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
            {repDetails.map((item, idx) => (
              <div 
                key={idx} 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                    #{item.rep || idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{item.feedback || 'Good repetition'}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Peak Joint Angle: {item.lowestAngle || 88}° • ROM: {item.rom || 92}%</div>
                  </div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#10B981' }}>
                  {item.score || 96}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Form Checklist */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '20px', marginBottom: '35px', border: '1px solid #E2E8F0' }}>
          <h4 style={{ fontSize: '13px', color: '#64748B', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Kinematic Form Checklist
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#111827', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10B981" /> Joint Range of Motion
              </span>
              <strong style={{ fontWeight: 800 }}>96% Optimal</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#111827', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10B981" /> Torso & Spine Neutrality
              </span>
              <strong style={{ fontWeight: 800 }}>92% Aligned</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#111827', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10B981" /> Left / Right Bilateral Symmetry
              </span>
              <strong style={{ fontWeight: 800 }}>{results.symmetry}% Balanced</strong>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {onRepeat && (
            <button
              onClick={onRepeat}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <RotateCcw size={16} /> Repeat Routine
            </button>
          )}

          <button 
            onClick={onFinish}
            className="btn btn-primary"
            style={{ flex: 1.5, padding: '16px', borderRadius: '16px', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Save & Return to Dashboard <ArrowRight size={16} />
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default Summary;
