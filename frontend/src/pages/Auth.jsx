import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, User, ArrowRight, AlertCircle, Stethoscope, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Auth = ({ onAuthSuccess }) => {
  const { login, register, loginAsGuest, loginAsDoctorGuest } = useAuth();
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor'
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(email, password, role);
    } else {
      result = await register(name, email, password, role);
    }

    setLoading(false);
    
    if (result.success) {
      if (onAuthSuccess) onAuthSuccess(result.user);
    } else {
      setError(result.error || 'Authentication failed. Please check credentials.');
    }
  };

  const isDoctor = role === 'doctor';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F6F9', paddingTop: '120px', paddingBottom: '60px', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Background Decorators */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: isDoctor ? 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(244,246,249,0) 70%)' : 'radial-gradient(circle, rgba(100,114,217,0.1) 0%, rgba(244,246,249,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(244,246,249,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '480px', backgroundColor: '#FFF', borderRadius: '32px', padding: '40px 36px', boxShadow: '0 20px 50px rgba(0,0,0,0.06)', position: 'relative', zIndex: 1, border: '1px solid rgba(100,114,217,0.1)' }}
      >
        {/* Role Toggle Switcher */}
        <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '16px', padding: '4px', marginBottom: '30px' }}>
          <button
            type="button"
            onClick={() => { setRole('patient'); setError(''); }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: role === 'patient' ? '#FFFFFF' : 'transparent',
              color: role === 'patient' ? 'var(--accent-color)' : '#64748B',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: role === 'patient' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <User size={16} /> Patient Portal
          </button>

          <button
            type="button"
            onClick={() => { setRole('doctor'); setError(''); }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: role === 'doctor' ? '#FFFFFF' : 'transparent',
              color: role === 'doctor' ? '#059669' : '#64748B',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: role === 'doctor' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Stethoscope size={16} /> Doctor / Clinician
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ backgroundColor: isDoctor ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100,114,217,0.1)', padding: '14px', borderRadius: '50%' }}>
            {isDoctor ? <Stethoscope color="#059669" size={30} /> : <Activity color="var(--accent-color)" size={30} />}
          </div>
        </div>

        <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', fontSize: '26px', fontWeight: 800, color: '#111' }}>
          {isLogin ? (isDoctor ? 'Doctor Sign In' : 'Welcome Back') : (isDoctor ? 'Register Clinician' : 'Create Account')}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748B', marginBottom: '30px', fontSize: '14px' }}>
          {isDoctor 
            ? (isLogin ? 'Access your clinical dashboard and monitor patients.' : 'Register as an orthopedic physiotherapist.')
            : (isLogin ? 'Sign in to track your rehabilitation journey.' : 'Join Rehab AI to start your recovery plan.')}
        </p>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 16px', borderRadius: '12px', color: '#EF4444', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
              <input 
                type="text" 
                placeholder={isDoctor ? "Dr. Full Name (e.g. Dr. Sarah Jenkins)" : "Full Name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '14px', backgroundColor: '#F8FAFC', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                onFocus={(e) => { e.target.style.borderColor = isDoctor ? '#059669' : 'var(--accent-color)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
            <input 
              type="email" 
              placeholder={isDoctor ? "doctor@clinic.com" : "Email Address"} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '14px', backgroundColor: '#F8FAFC', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = isDoctor ? '#059669' : 'var(--accent-color)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '14px', backgroundColor: '#F8FAFC', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = isDoctor ? '#059669' : 'var(--accent-color)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '6px', 
              width: '100%', 
              padding: '14px', 
              borderRadius: '14px', 
              backgroundColor: isDoctor ? '#059669' : 'var(--accent-color)', 
              color: '#FFF', 
              fontWeight: 800, 
              fontSize: '15px', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px', 
              transition: 'all 0.2s', 
              boxShadow: isDoctor ? '0 10px 25px rgba(16,185,129,0.3)' : '0 10px 25px rgba(100,114,217,0.3)', 
              opacity: loading ? 0.7 : 1 
            }}
          >
            {loading ? 'Processing...' : (isLogin ? (isDoctor ? 'Sign In to Clinical Portal' : 'Sign In') : 'Create Account')} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
            {isLogin ? "Don't have an account? " : "Already registered? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              style={{ background: 'none', border: 'none', color: isDoctor ? '#059669' : 'var(--accent-color)', fontWeight: 800, cursor: 'pointer', padding: 0, fontSize: '13px' }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Hackathon Demo 1-Click Access */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #E2E8F0', paddingTop: '18px' }}>
          <p style={{ color: '#94A3B8', fontSize: '11px', textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Quick 1-Click Demo Evaluation</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button 
              type="button"
              onClick={() => { 
                const res = loginAsGuest();
                if (onAuthSuccess) onAuthSuccess(res.user);
              }}
              style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: '#F8FAFC', color: 'var(--accent-color)', fontWeight: 700, fontSize: '12px', border: '1px solid rgba(100,114,217,0.2)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(100,114,217,0.08)' }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC' }}
            >
              <User size={14} /> Demo Patient
            </button>

            <button 
              type="button"
              onClick={() => { 
                const res = loginAsDoctorGuest();
                if (onAuthSuccess) onAuthSuccess(res.user);
              }}
              style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: '#F8FAFC', color: '#059669', fontWeight: 700, fontSize: '12px', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.08)' }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC' }}
            >
              <Stethoscope size={14} /> Demo Doctor
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Auth;
