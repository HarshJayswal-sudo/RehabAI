import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Search, Calendar, Award, RotateCcw, TrendingUp, Flame, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import bgLeft from '../assets/images/background-left.png';
import bgRight from '../assets/images/background-right.png';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const History = ({ historyList, onStartExercise }) => {
  const { user } = useAuth();
  const [filterExercise, setFilterExercise] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveHistory, setLiveHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch real history from backend for authenticated (non-demo) users
  useEffect(() => {
    const isRealUser = user && user.id && user.id !== 'demo';
    if (!isRealUser) {
      setLiveHistory(null);
      return;
    }

    let isMounted = true;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        // Use the progress endpoint which includes history_trend per session
        const data = await api.getPatientProgress();
        if (!isMounted) return;

        // Map backend history_trend entries to the display format
        const backendSessions = (data.history_trend || data.trends || []).map(t => ({
          id: t.session_id || t.id,
          date: t.date ? t.date.split('T')[0] : '—',
          exercise: t.exercise_name || t.exercise_code || t.exercise || 'Unknown',
          exerciseId: t.exercise_code || t.exercise || 'squat',
          reps: t.repetitions || 0,
          formScore: t.score != null ? Math.round(t.score) : null,
          symmetry: null,
          duration: t.duration_seconds ? `${String(Math.floor(t.duration_seconds / 60)).padStart(2,'0')}:${String(t.duration_seconds % 60).padStart(2,'0')}` : '—',
          status: (t.score || 0) >= 90 ? 'Optimal' : 'Needs Work'
        })).reverse(); // newest first

        setLiveHistory(backendSessions.length > 0 ? backendSessions : []);
      } catch (err) {
        console.warn('Could not load history from backend', err);
        setLiveHistory(null);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [user]);

  // Priority: backend live data > prop historyList > empty list for real users
  const isRealUser = user && user.id && user.id !== 'demo';
  const sessions = liveHistory !== null
    ? liveHistory
    : (historyList && historyList.length > 0)
      ? historyList
      : (isRealUser ? [] : []);

  const filteredSessions = sessions.filter(s => {
    const matchesFilter = filterExercise === 'All' || s.exercise === filterExercise;
    const matchesSearch = s.exercise.toLowerCase().includes(searchQuery.toLowerCase()) || s.date.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const totalReps = sessions.reduce((acc, s) => acc + (s.reps || 0), 0);
  const scoredSessions = sessions.filter(s => s.formScore != null && s.formScore > 0);
  const avgScore = scoredSessions.length > 0 
    ? Math.round(scoredSessions.reduce((acc, s) => acc + s.formScore, 0) / scoredSessions.length) 
    : 0;
  const uniqueDays = new Set(sessions.map(s => s.date).filter(d => d && d !== '—')).size;
  const streakText = sessions.length === 0 ? '0 Days' : `${uniqueDays} ${uniqueDays === 1 ? 'Day' : 'Days'} 🔥`;

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
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#10B981', marginTop: '6px' }}>{avgScore > 0 ? `${avgScore}%` : '—'}</div>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Active Streak</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#F59E0B', marginTop: '6px' }}>{streakText}</div>
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
          {loadingHistory ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-color)', marginBottom: '12px' }} />
              <p style={{ color: '#64748B', fontWeight: 600, margin: 0 }}>Loading your session history...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏋️</div>
              <h3 style={{ fontWeight: 800, color: '#111', margin: '0 0 8px 0' }}>No Workouts Yet</h3>
              <p style={{ color: '#64748B', margin: 0 }}>Complete your first rehabilitation session to see your history here.</p>
            </div>
          ) : (
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
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                      No sessions match your filter.
                    </td>
                  </tr>
                ) : filteredSessions.map((session, i) => (
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
                      {session.formScore != null ? (
                        <span style={{ 
                          backgroundColor: session.formScore >= 90 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                          color: session.formScore >= 90 ? '#059669' : '#D97706', 
                          fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' 
                        }}>
                          {session.formScore}% Accuracy
                        </span>
                      ) : <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>}
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
                      {session.symmetry != null ? `${session.symmetry}%` : '—'}
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748B' }}>
                      {session.duration || '—'}
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
          )}
        </div>

      </div>
    </div>
  );
};

export default History;
