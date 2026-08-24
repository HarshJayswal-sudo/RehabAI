import React from 'react';
import { motion } from 'framer-motion';

const Summary = ({ results, onFinish }) => {
  if (!results) return null;

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '120px 20px 40px', backgroundColor: '#F4F6F9'
    }}>
      <motion.div 
        style={{ maxWidth: '550px', width: '100%', padding: '50px 40px', textAlign: 'center', backgroundColor: '#FFF', borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', border: '1px solid rgba(100,114,217,0.1)' }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        
        <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '8px', color: '#111827' }}>Session Complete 🎉</h1>
        <p className="text-muted" style={{ fontSize: '18px', marginBottom: '48px' }}>Great work today, Alex!</p>

        {/* Big Score */}
        <motion.div 
          style={{ 
            width: '200px', height: '200px', borderRadius: '50%', border: '8px solid var(--accent-color)',
            margin: '0 auto 48px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(5,150,105,0.1)'
          }}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
        >
          <div style={{ fontSize: '64px', fontWeight: 800, lineHeight: 1, color: '#111827' }}>{results.formScore}%</div>
          <div style={{ fontWeight: 700, letterSpacing: '2px', color: 'var(--text-secondary)' }}>FORM</div>
        </motion.div>

        {/* Key Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '64px', marginBottom: '48px' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div style={{ fontSize: '40px', fontWeight: 800, color: '#111827' }}>{results.rep}</div>
            <div className="text-muted" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>REPS COMPLETED</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div style={{ fontSize: '40px', fontWeight: 800, color: '#111827' }}>{results.symmetry}%</div>
            <div className="text-muted" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>SYMMETRY</div>
          </motion.div>
        </div>

        {/* Breakdown */}
        <motion.div 
          style={{ textAlign: 'left', backgroundColor: '#F3F4F6', padding: '32px', borderRadius: '24px', marginBottom: '48px' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        >
          <h3 style={{ fontSize: '14px', color: '#6B7280', fontWeight: 700, marginBottom: '20px', letterSpacing: '1px' }}>FORM ANALYSIS</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li className="flex-between" style={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
              <span><span style={{ color: 'var(--success-color)', marginRight: '12px' }}>✓</span> Knee alignment</span>
              <strong style={{ fontWeight: 800 }}>94%</strong>
            </li>
            <li className="flex-between" style={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
              <span><span style={{ color: 'var(--success-color)', marginRight: '12px' }}>✓</span> Torso stability</span>
              <strong style={{ fontWeight: 800 }}>92%</strong>
            </li>
            <li className="flex-between" style={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
              <span><span style={{ color: '#F59E0B', marginRight: '12px' }}>⚠</span> Left/right symmetry</span>
              <strong style={{ fontWeight: 800 }}>{results.symmetry}%</strong>
            </li>
          </ul>
        </motion.div>

        <motion.button 
          className="btn btn-primary" onClick={onFinish} style={{ width: '100%', padding: '20px', fontSize: '18px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        >
          Return to Dashboard
        </motion.button>

      </motion.div>
    </div>
  );
};

export default Summary;
