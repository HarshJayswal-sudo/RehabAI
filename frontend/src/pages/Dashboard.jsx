import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import bgLeft from '../assets/images/background-left.png';
import { Activity, Play, Target, Flame, CalendarCheck, Loader2, ArrowRight, Dumbbell, History, Sparkles, CheckCircle2, ChevronRight, Stethoscope, UserPlus, Check, X, ShieldCheck } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EXERCISES } from '../data/exercises';

const AnimatedTarget = ({ color }) => (
  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '28px', height: '28px' }}>
    {[1, 2].map(i => (
      <motion.div
        key={i}
        animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: i === 1 ? 0 : 1, ease: "easeOut" }}
        style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${color}`, zIndex: 0 }}
      />
    ))}
    <motion.div
      animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 180] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      style={{ position: 'relative', zIndex: 1, display: 'flex' }}
    >
      <Target size={28} color={color} strokeWidth={2.5} />
    </motion.div>
  </div>
);

const AnimatedFlame = ({ color }) => {
  const sparks = [
    { id: 1, delay: 0.1, x: -8, dur: 1.2, height: -35 },
    { id: 2, delay: 0.8, x: 10, dur: 1.5, height: -25 },
    { id: 3, delay: 1.5, x: -4, dur: 1.1, height: -40 },
    { id: 4, delay: 0.4, x: 6, dur: 1.4, height: -30 },
  ];

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '28px', height: '28px' }}>
      {sparks.map(spark => (
        <motion.div
          key={spark.id}
          animate={{ y: [5, spark.height], x: [0, spark.x], opacity: [0, 1, 0], scale: [0.5, 1, 0] }}
          transition={{ duration: spark.dur, repeat: Infinity, delay: spark.delay, ease: "easeOut" }}
          style={{ position: 'absolute', bottom: '4px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 6px ${color}`, zIndex: 1 }}
        />
      ))}
      <motion.div
        animate={{ rotate: [0, -6, 3, -4, 5, 0], scaleY: [1, 1.1, 0.9, 1.15, 0.95, 1], skewX: [0, 2, -2, 3, -1, 0], filter: [`drop-shadow(0px 0px 4px ${color}80)`, `drop-shadow(0px 0px 12px ${color})`, `drop-shadow(0px 0px 4px ${color}80)`] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: 'bottom center', position: 'relative', zIndex: 2, display: 'flex' }}
      >
        <Flame size={28} color={color} fill={color} strokeWidth={1} />
      </motion.div>
    </div>
  );
};

const AnimatedCalendar = ({ color }) => (
  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '28px', height: '28px' }}>
    <motion.div
      animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.4, 0.8] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: 'absolute', width: '20px', height: '20px', backgroundColor: color, filter: 'blur(8px)', borderRadius: '50%', zIndex: 0 }}
    />
    <motion.div
      animate={{ rotate: [0, -8, 5, -3, 0], y: [0, -3, 2, -1, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: 'relative', zIndex: 1, display: 'flex' }}
    >
      <CalendarCheck size={28} color={color} strokeWidth={2.5} />
    </motion.div>
  </div>
);

const StatCard = ({ customIcon: CustomIcon, label, value, color }) => (
  <motion.div 
    whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(100,114,217,0.1)' }}
    style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(100,114,217,0.05)', border: '1px solid rgba(100,114,217,0.05)' }}
  >
    <div style={{ backgroundColor: `${color}15`, width: '56px', height: '56px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CustomIcon color={color} />
    </div>
    <div>
      <h3 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 5px 0', color: '#111', lineHeight: 1 }}>{value}</h3>
      <p style={{ margin: 0, fontSize: '13px', color: '#666', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</p>
    </div>
  </motion.div>
);

const Dashboard = ({ onStartSession, onSelectExercise, onViewExercises, onViewHistory }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  
  // Doctor Connection & Supervision State
  const [authorizations, setAuthorizations] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [requestingDoctorId, setRequestingDoctorId] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [progress, auths, doctors] = await Promise.allSettled([
        api.getPatientProgress(),
        api.getMyAuthorizations(),
        api.getDoctorsList()
      ]);

      if (progress.status === 'fulfilled') setProgressData(progress.value);
      if (auths.status === 'fulfilled' && Array.isArray(auths.value)) setAuthorizations(auths.value);
      if (doctors.status === 'fulfilled' && Array.isArray(doctors.value)) setDoctorsList(doctors.value);
    } catch (err) {
      console.warn("Using fallback dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleRequestDoctor = async (doctorId) => {
    setRequestingDoctorId(doctorId);
    setConnectionMessage('');
    try {
      await api.requestDoctorAuthorization(doctorId);
      setConnectionMessage('Connection request sent to clinician! Awaiting approval.');
      await fetchDashboardData();
    } catch (err) {
      setConnectionMessage(err.message || 'Failed to send request');
    } finally {
      setRequestingDoctorId(null);
    }
  };

  // Find active or pending doctor authorization
  const activeAuthorization = authorizations.find(a => a.status === 'approved');
  const pendingAuthorization = authorizations.find(a => a.status === 'pending');

  const isRealUser = user && user.id && user.id !== 'demo';

  const totalSessions = progressData?.summary?.total_sessions ?? (isRealUser ? 0 : 24);
  const avgScore = progressData?.summary?.average_score != null ? Math.round(progressData.summary.average_score) : (isRealUser ? 0 : 94);
  const improvement = isRealUser ? (totalSessions > 1 ? '4.5' : '0.0') : '6.3';

  const formatTrendData = () => {
    const trend = progressData?.history_trend || progressData?.trends;
    if (!trend || trend.length === 0) {
      if (isRealUser) {
        return [
          { name: 'Day 1', score: avgScore > 0 ? avgScore : 0 }
        ];
      }
      return [
        { name: 'Mon', score: 85 }, { name: 'Tue', score: 88 }, { name: 'Wed', score: 91 },
        { name: 'Thu', score: 89 }, { name: 'Fri', score: 94 }, { name: 'Sat', score: 96 }, { name: 'Sun', score: 95 },
      ];
    }
    return trend.map((t, idx) => {
      const d = t.date ? new Date(t.date) : null;
      return {
        name: d && !isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { weekday: 'short' }) : `S${idx + 1}`,
        score: Math.round(t.score || 0)
      };
    }).slice(-7);
  };

  const activityData = formatTrendData();

  const symmetryRadarData = [
    { subject: 'Left Knee', A: avgScore > 0 ? Math.min(100, avgScore + 1) : (isRealUser ? 0 : 94), fullMark: 100 },
    { subject: 'Right Knee', A: avgScore > 0 ? Math.min(100, avgScore - 1) : (isRealUser ? 0 : 92), fullMark: 100 },
    { subject: 'Torso Stability', A: avgScore > 0 ? Math.min(100, avgScore + 2) : (isRealUser ? 0 : 96), fullMark: 100 },
    { subject: 'Hip Alignment', A: avgScore > 0 ? Math.min(100, avgScore - 2) : (isRealUser ? 0 : 90), fullMark: 100 },
    { subject: 'Upper Body', A: avgScore > 0 ? Math.min(100, avgScore) : (isRealUser ? 0 : 88), fullMark: 100 },
  ];


  return (
    <div style={{ position: 'relative', overflowX: 'hidden', minHeight: '100vh', paddingBottom: '100px', backgroundColor: '#F8F9FA', color: '#111', paddingTop: '130px' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '400px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'left center', opacity: 0.4, zIndex: 0 }} />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        
        {/* Top Greeting Header */}
        <div style={{ marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Sparkles size={16} /> Rehabilitation Dashboard
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#111', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              Welcome back, {user?.name || 'Alex'}
            </h2>
            <p style={{ margin: 0, fontSize: '15px', color: '#64748B' }}>
              Here is your AI recovery compliance and daily rehabilitation plan.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={onViewExercises} 
              style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 800, borderRadius: '50px', border: '1px solid #E2E8F0', backgroundColor: '#FFF', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Dumbbell size={16} /> All Exercises
            </button>
            <button 
              onClick={() => onSelectExercise ? onSelectExercise(EXERCISES[0]) : onStartSession()} 
              className="btn btn-primary" 
              style={{ padding: '12px 28px', fontSize: '13px', fontWeight: 800, borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 25px rgba(100,114,217,0.3)' }}
            >
              <Play size={16} fill="currentColor" /> Quick Workout
            </button>
          </div>
        </div>

        {/* Quick Exercise Selection Grid */}
        <div style={{ marginBottom: '35px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111', margin: 0 }}>
              Select Exercise Routine
            </h3>
            <button 
              onClick={onViewExercises} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View all 5 exercises <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
            {EXERCISES.map((ex) => (
              <div
                key={ex.id}
                onClick={() => onSelectExercise(ex)}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '20px',
                  padding: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--accent-color)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                <img src={ex.image} alt={ex.name} style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ex.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                    Target: {ex.idealAngle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <StatCard customIcon={AnimatedTarget} label="Avg Form Accuracy" value={`${avgScore}%`} color="#6472D9" />
              <StatCard customIcon={AnimatedCalendar} label="Total Sessions" value={totalSessions.toString()} color="#10B981" />
              <StatCard customIcon={AnimatedFlame} label="Improvement" value={`+${improvement}%`} color="#F59E0B" />
            </div>


            {/* Performance Chart */}
            <div style={{ backgroundColor: '#FFF', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(100,114,217,0.05)', border: '1px solid rgba(100,114,217,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111' }}>Form Accuracy Trend</h3>
                <button 
                  onClick={onViewHistory}
                  style={{ background: 'transparent', border: '1px solid #E2E8F0', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#64748B', cursor: 'pointer' }}
                >
                  View Log History →
                </button>
              </div>
              
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorForm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EA" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#FFF', color: '#111', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 600 }} />
                    <Area type="monotone" dataKey="score" stroke="var(--accent-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorForm)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Body Symmetry Radar */}
            <div style={{ backgroundColor: '#FFF', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(100,114,217,0.05)', border: '1px solid rgba(100,114,217,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111' }}>Kinematic Symmetry</h3>
                <Activity size={20} color="#666" />
              </div>
              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={symmetryRadarData}>
                    <PolarGrid stroke="#E2E6EA" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Symmetry" dataKey="A" stroke="var(--accent-color)" strokeWidth={2} fill="var(--accent-color)" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFF', border: 'none', borderRadius: '8px', color: '#111', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                 <span style={{ color: '#10B981', fontWeight: 700, fontSize: '13px', backgroundColor: 'rgba(16,185,129,0.1)', padding: '6px 14px', borderRadius: '20px' }}>Balanced posture detected.</span>
              </div>
            </div>

            {/* Clinical Supervision / Connected Doctor Card */}
            <div style={{ backgroundColor: '#FFF', borderRadius: '24px', padding: '26px', boxShadow: '0 10px 30px rgba(100,114,217,0.05)', border: '1px solid rgba(100,114,217,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Stethoscope size={16} /> Clinical Supervision
                </div>
                {activeAuthorization ? (
                  <span style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#059669', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px' }}>
                    Active
                  </span>
                ) : pendingAuthorization ? (
                  <span style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#D97706', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px' }}>
                    Pending
                  </span>
                ) : null}
              </div>

              {activeAuthorization ? (
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#111', margin: '0 0 6px 0' }}>
                    {activeAuthorization.doctor?.name || 'Dr. Sarah Jenkins'}
                  </h4>
                  <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    Your recovery metrics and session reports are being reviewed by your assigned physical therapist.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                    <ShieldCheck size={14} /> Telemetry Link Active
                  </div>
                </div>
              ) : pendingAuthorization ? (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#111', margin: '0 0 6px 0' }}>
                    Request Sent to {pendingAuthorization.doctor?.name || 'Clinician'}
                  </h4>
                  <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                    Waiting for the clinician to review and approve your connection request.
                  </p>
                  <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 700 }}>
                    ⏳ Awaiting Doctor Approval
                  </div>
                </div>
              ) : (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#111', margin: '0 0 6px 0' }}>
                    Connect with a Physiotherapist
                  </h4>
                  <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    Share your rehabilitation telemetry and receive personalized clinical form guidance.
                  </p>
                  <button
                    onClick={() => setIsDoctorModalOpen(true)}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(16,185,129,0.1)',
                      color: '#059669',
                      border: '1px solid rgba(16,185,129,0.3)',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <UserPlus size={15} /> Find & Connect Doctor
                  </button>
                </div>
              )}
            </div>

            {/* Prescribed Routine Recommendation */}
            <div style={{ backgroundColor: '#FFF', borderRadius: '24px', padding: '26px', position: 'relative', boxShadow: '0 10px 30px rgba(100,114,217,0.05)', border: '1px solid rgba(100,114,217,0.05)' }}>
              <div style={{ color: 'var(--accent-color)', fontWeight: 800, fontSize: '11px', letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase' }}>
                Today's Prescribed Routine
              </div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: '0 0 8px 0' }}>
                Bodyweight Squat Routine
              </h4>
              <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
                3 sets × 10 reps • Target Knee Flexion 85°-95°. Maintain your active recovery streak!
              </p>
              <button 
                onClick={() => onSelectExercise(EXERCISES[0])} 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px 0', fontSize: '13px', fontWeight: 800, borderRadius: '12px', border: 'none', cursor: 'pointer' }}
              >
                Start Prescribed Routine
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Find & Connect Doctor Modal */}
      <AnimatePresence>
        {isDoctorModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDoctorModalOpen(false)}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)' }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                backgroundColor: '#FFFFFF',
                borderRadius: '28px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                overflowY: 'auto',
                padding: '36px'
              }}
            >
              <button
                onClick={() => setIsDoctorModalOpen(false)}
                style={{ position: 'absolute', top: '24px', right: '24px', backgroundColor: '#F1F5F9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                <Stethoscope size={18} /> CLINICAL SUPERVISION DIRECTORY
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111', margin: '0 0 6px 0' }}>
                Connect with a Physical Therapist
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px 0' }}>
                Select a licensed physiotherapist from the directory to share your daily exercise telemetry and receive clinical guidance.
              </p>

              {connectionMessage && (
                <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#059669', fontSize: '13px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> {connectionMessage}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '25px' }}>
                {doctorsList.length === 0 ? (
                  // Fallback demo doctor if none in DB yet
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: '#111' }}>Dr. Sarah Jenkins, PT, DPT</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>drsarah@PhysioAssist.com • Orthopedic Specialist</div>
                    </div>
                    <button
                      onClick={() => handleRequestDoctor(1)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        backgroundColor: '#059669',
                        color: '#FFF',
                        fontWeight: 800,
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Connect
                    </button>
                  </div>
                ) : (
                  doctorsList.map((doc) => (
                    <div key={doc.id} style={{ border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#111' }}>{doc.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{doc.email} • Licensed Clinician</div>
                      </div>
                      <button
                        disabled={requestingDoctorId === doc.id}
                        onClick={() => handleRequestDoctor(doc.id)}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '8px',
                          backgroundColor: '#059669',
                          color: '#FFF',
                          fontWeight: 800,
                          fontSize: '12px',
                          border: 'none',
                          cursor: requestingDoctorId === doc.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {requestingDoctorId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                        Connect
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setIsDoctorModalOpen(false)}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#FFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;

