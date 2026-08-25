import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Auth = ({ onAuthSuccess }) => {
  const { login, register, loginAsGuest } = useAuth();
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
      result = await login(email, password);
    } else {
      result = await register(name, email, password);
    }

    setLoading(false);
    
    if (result.success) {
      if (onAuthSuccess) onAuthSuccess();
    } else {
      setError(result.error || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F6F9', paddingTop: '100px', paddingBottom: '50px', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Background Decorators */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(100,114,217,0.1) 0%, rgba(244,246,249,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(244,246,249,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '450px', backgroundColor: '#FFF', borderRadius: '32px', padding: '50px 40px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', position: 'relative', zIndex: 1, border: '1px solid rgba(100,114,217,0.1)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <div style={{ backgroundColor: 'rgba(100,114,217,0.1)', padding: '15px', borderRadius: '50%' }}>
            <Activity color="var(--accent-color)" size={32} />
          </div>
        </div>

        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', fontSize: '28px', fontWeight: 800, color: '#111' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '15px' }}>
          {isLogin ? 'Sign in to track your rehab progress.' : 'Join Rehab AI to start your recovery journey.'}
        </p>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 16px', borderRadius: '12px', color: '#EF4444', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '15px', backgroundColor: '#F8FAFC', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent-color)'; e.target.style.boxShadow = '0 0 0 3px rgba(100,114,217,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '15px', backgroundColor: '#F8FAFC', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent-color)'; e.target.style.boxShadow = '0 0 0 3px rgba(100,114,217,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
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
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '15px', backgroundColor: '#F8FAFC', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent-color)'; e.target.style.boxShadow = '0 0 0 3px rgba(100,114,217,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '10px', width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'var(--accent-color)', color: '#FFF', fontWeight: 700, fontSize: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'all 0.2s', boxShadow: '0 10px 25px rgba(100,114,217,0.3)', opacity: loading ? 0.7 : 1 }}
            onMouseOver={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '14px' }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Hackathon Demo Bypass */}
        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
          <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Demo / Hackathon</p>
          <button 
            onClick={() => { 
              loginAsGuest();
              if (onAuthSuccess) onAuthSuccess();
            }}
            style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: '#F8FAFC', color: '#6472D9', fontWeight: 700, fontSize: '14px', border: '1px solid rgba(100,114,217,0.2)', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(100,114,217,0.1)' }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC' }}
          >
            Continue as Demo User
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default Auth;
