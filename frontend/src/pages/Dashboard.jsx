import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import exerciseImg from '../assets/images/classes-1.jpg';
import bgLeft from '../assets/images/background-left.png';
import { Activity, Play, Target, Flame, CalendarCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const symmetryData = [
  { subject: 'Left Arm', A: 92, fullMark: 100 },
  { subject: 'Right Arm', A: 90, fullMark: 100 },
  { subject: 'Core', A: 85, fullMark: 100 },
  { subject: 'Left Leg', A: 88, fullMark: 100 },
  { subject: 'Right Leg', A: 86, fullMark: 100 },
];

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

const Dashboard = ({ onStartSession }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await api.getPatientProgress();
        setProgressData(data);
      } catch (err) {
        console.error("Failed to load progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const formatData = () => {
    if (!progressData?.trends || progressData.trends.length === 0) {
      return [
        { name: 'Mon', score: 0 }, { name: 'Tue', score: 0 }, { name: 'Wed', score: 0 },
        { name: 'Thu', score: 0 }, { name: 'Fri', score: 0 }, { name: 'Sat', score: 0 }, { name: 'Sun', score: 0 },
      ];
    }
    return progressData.trends.map(t => {
      const d = new Date(t.date);
      return {
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        score: t.score
      };
    }).slice(-7); // Last 7 items
  };

  const activityData = formatData();
  const summary = progressData?.summary || { average_score: 0, total_sessions: 0, improvement: 0 };

  return (
    <div style={{ position: 'relative', overflowX: 'hidden', minHeight: '100vh', paddingBottom: '100px', backgroundColor: '#F8F9FA', color: '#111', paddingTop: '130px' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '400px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'left center', opacity: 0.4, zIndex: 0 }} />
      
      <motion.div 
        style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px', position: 'relative', zIndex: 1 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#111', margin: '0 0 10px 0' }}>Overview</h2>
            <p style={{ margin: 0, fontSize: '15px', color: '#666' }}>Welcome back, {user?.name || 'User'}. Here is your recent physical progress.</p>
          </div>
          <button onClick={onStartSession} className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '14px', fontWeight: 700, borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 25px rgba(100,114,217,0.3)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <Play size={18} fill="currentColor" /> START LIVE SESSION
          </button>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <Loader2 className="spinner" size={48} color="var(--accent-color)" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <StatCard customIcon={AnimatedTarget} label="Avg Form Accuracy" value={`${Math.round(summary.average_score)}%`} color="#6472D9" />
                <StatCard customIcon={AnimatedCalendar} label="Total Sessions" value={summary.total_sessions.toString()} color="#10B981" />
                <StatCard customIcon={AnimatedFlame} label="Improvement" value={`+${summary.improvement}%`} color="#F59E0B" />
              </div>

            {/* Performance Chart */}
            <motion.div variants={itemVariants} style={{ backgroundColor: '#FFF', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(100,114,217,0.05)', border: '1px solid rgba(100,114,217,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111' }}>Form Accuracy Trend</h3>
                <select style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #E2E6EA', backgroundColor: '#F8F9FA', fontSize: '13px', fontWeight: 600, color: '#333', outline: 'none' }}>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
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
            </motion.div>

          </div>

          {/* Sidebar Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Body Symmetry Radar */}
            <motion.div variants={itemVariants} style={{ backgroundColor: '#FFF', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(100,114,217,0.05)', border: '1px solid rgba(100,114,217,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111' }}>Body Symmetry</h3>
                <Activity size={20} color="#666" />
              </div>
              <div style={{ width: '100%', height: '230px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={symmetryData}>
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
            </motion.div>

            {/* AI Recommendation */}
            <motion.div variants={itemVariants} style={{ backgroundColor: '#FFF', borderRadius: '24px', padding: '30px', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 30px rgba(100,114,217,0.05)', border: '1px solid rgba(100,114,217,0.05)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '140px', backgroundImage: `url(${exerciseImg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '140px', background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)', zIndex: 0 }} />
              
              <div style={{ position: 'relative', zIndex: 1, paddingTop: '90px' }}>
                <div style={{ color: 'var(--accent-color)', fontWeight: 800, fontSize: '11px', letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase' }}>Session 04 • Recommended</div>
                <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: '0 0 10px 0' }}>Core Stabilization</h4>
                <p style={{ color: '#666', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>3 sets × 10 reps • Keep up your current streak with this 15-minute routine.</p>
                <button onClick={onStartSession} className="btn btn-primary" style={{ width: '100%', padding: '15px 0', fontSize: '13px', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 15px rgba(100,114,217,0.3)' }}>
                  Begin Routine
                </button>
              </div>
            </motion.div>

          </div>
        </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
