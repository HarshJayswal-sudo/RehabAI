import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Search, Calendar, Award, RotateCcw, TrendingUp, Flame, CheckCircle, ArrowRight } from 'lucide-react';
import bgLeft from '../assets/images/background-left.png';
import bgRight from '../assets/images/background-right.png';

const DEFAULT_HISTORY = [
  { id: 1, date: '2026-08-25', exercise: 'Bodyweight Squat', exerciseId: 'squat', reps: 10, formScore: 96, symmetry: 94, duration: '03:15', status: 'Optimal' },
  { id: 2, date: '2026-08-24', exercise: 'Bodyweight Lunge', exerciseId: 'lunges', reps: 8, formScore: 92, symmetry: 90, duration: '02:45', status: 'Optimal' },
  { id: 3, date: '2026-08-23', exercise: 'Wall Push-Up', exerciseId: 'wall_push_up', reps: 12, formScore: 95, symmetry: 96, duration: '03:30', status: 'Optimal' },
  { id: 4, date: '2026-08-22', exercise: 'Seated Leg Extension', exerciseId: 'leg_extension', reps: 15, formScore: 98, symmetry: 95, duration: '04:10', status: 'Optimal' },
  { id: 5, date: '2026-08-21', exercise: 'Windmill Toe Touch', exerciseId: 'wind_will_toe_touch', reps: 10, formScore: 89, symmetry: 88, duration: '03:00', status: 'Needs Work' },
  { id: 6, date: '2026-08-20', exercise: 'Bodyweight Squat', exerciseId: 'squat', reps: 10, formScore: 94, symmetry: 92, duration: '03:05', status: 'Optimal' }
];

const History = ({ historyList, onStartExercise }) => {
  const [filterExercise, setFilterExercise] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const sessions = (historyList && historyList.length > 0) ? historyList : DEFAULT_HISTORY;

  const filteredSessions = sessions.filter(s => {
    const matchesFilter = filterExercise === 'All' || s.exercise === filterExercise;
    const matchesSearch = s.exercise.toLowerCase().includes(searchQuery.toLowerCase()) || s.date.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const totalReps = sessions.reduce((acc, s) => acc + (s.reps || 0), 0);
  const avgScore = Math.round(sessions.reduce((acc, s) => acc + (s.formScore || 0), 0) / (sessions.length || 1));

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#F8F9FA', paddingTop: '130px', paddingBottom: '80px', overflowX: 'hidden' }}>
      
      {/* Ambience */}
      <div style={{ position: 'absolute', left: '-5%', top: '10%', width: '400px', height: '600px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.35, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', right: '-5%', bottom: '5%', width: '400px', height: '500px', backgroundImage: `url(${bgRight})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--accent-light)', padding: '6px 16px', borderRadius: '50px', color: 'var(--accent-color)', fontWeight: 700, fontSize: '13px', marginBottom: '15px' }}>
            <HistoryIcon size={16} /> SESSION RECORDS & LOGS
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: 900, color: '#111', margin: '0 0 12px 0', letterSpacing: '-1px' }}>
            Workout History & Analytics
          </h1>
          <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '700px', margin: 0 }}>
            Track every completed rehabilitation routine, measure form improvement over time, and maintain your recovery streak.
          </p>
        </motion.div>

        {/* Stats Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Sessions</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#111', marginTop: '6px' }}>{sessions.length}</div>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Reps Logged</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--accent-color)', marginTop: '6px' }}>{totalReps}</div>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Avg Form Score</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#10B981', marginTop: '6px' }}>{avgScore}%</div>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Active Streak</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#F59E0B', marginTop: '6px' }}>5 Days 🔥</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['All', 'Bodyweight Squat', 'Bodyweight Lunge', 'Wall Push-Up', 'Seated Leg Extension', 'Windmill Toe Touch'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterExercise(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '50px',
                  border: filterExercise === cat ? '1px solid var(--accent-color)' : '1px solid #E2E8F0',
                  backgroundColor: filterExercise === cat ? 'var(--accent-color)' : '#FFFFFF',
                  color: filterExercise === cat ? '#FFFFFF' : '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
            <input
              type="text"
              placeholder="Search date or exercise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                borderRadius: '50px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* History Table Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Exercise</th>
                <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Reps Completed</th>
                <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Form Accuracy</th>
                <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Symmetry</th>
                <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Duration</th>
                <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session, i) => (
                <tr 
                  key={session.id || i}
                  style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#111827', fontWeight: 600 }}>
                    {session.date}
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#111827', fontWeight: 800 }}>
                    {session.exercise}
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#111827', fontWeight: 700 }}>
                    {session.reps} reps
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={{ 
                      backgroundColor: session.formScore >= 90 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                      color: session.formScore >= 90 ? '#059669' : '#D97706', 
                      fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' 
                    }}>
                      {session.formScore}% Accuracy
                    </span>
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
                    {session.symmetry || 94}%
                  </td>
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748B' }}>
                    {session.duration || '03:00'}
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <button
                      onClick={() => onStartExercise && onStartExercise(session.exerciseId || 'squat')}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #E2E8F0',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--accent-color)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-light)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <RotateCcw size={14} /> Re-do
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default History;

