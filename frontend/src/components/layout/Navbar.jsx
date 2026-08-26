import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Home, LayoutDashboard, Activity, Dumbbell, History as HistoryIcon, Settings, LogOut, Crown, Stethoscope, Users } from 'lucide-react';
import iconImg from '../../assets/images/icon.png';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ currentView, navigateTo }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, loginAsGuest } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const navItems = isDoctor ? [
    { id: 'landing', label: 'Home', icon: <Home size={16} strokeWidth={2.5} /> },
    { id: 'doctor', label: 'Doctor Portal', icon: <Stethoscope size={16} strokeWidth={2.5} /> },
    { id: 'exercises', label: 'Exercise Library', icon: <Dumbbell size={16} strokeWidth={2.5} /> },
    { id: 'dashboard', label: 'Patient View', icon: <LayoutDashboard size={16} strokeWidth={2.5} /> },
  ] : [
    { id: 'landing', label: 'Home', icon: <Home size={16} strokeWidth={2.5} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} strokeWidth={2.5} /> },
    { id: 'exercises', label: 'Exercises', icon: <Dumbbell size={16} strokeWidth={2.5} /> },
    { id: 'history', label: 'History', icon: <HistoryIcon size={16} strokeWidth={2.5} /> },
    { id: 'doctor', label: 'Doctor Portal', icon: <Stethoscope size={16} strokeWidth={2.5} /> },
  ];

  return (
    <div style={{ position: 'fixed', top: '25px', left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <header style={{ 
        width: '90%', 
        maxWidth: '1140px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '50px',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.05), 0 5px 15px rgba(0, 0, 0, 0.02)',
        pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 30px', alignItems: 'center', height: '76px' }}>
        
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => navigateTo('landing')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', backgroundColor: '#FFF', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
             <img src={iconImg} alt="RehabAI" style={{ height: '24px' }} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)', color: '#111' }}>
            Rehab<span style={{ background: isDoctor ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' : 'linear-gradient(135deg, var(--accent-color) 0%, #a8b2f0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
          </h1>
        </div>

        {/* Main Navigation Links */}
        <nav style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          <ul style={{ 
            listStyle: 'none', display: 'flex', margin: 0, padding: 0, gap: '22px', height: '100%', alignItems: 'center'
          }}>
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <li key={item.id} style={{ height: '100%' }}>
                  <button
                    onClick={() => navigateTo(item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      height: '100%',
                      padding: '0 5px',
                      color: isActive ? (isDoctor ? '#059669' : 'var(--accent-color)') : '#555',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px'
                    }}
                  >
                    <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                    {item.label}
                    {isActive && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: isDoctor ? '#10B981' : 'var(--accent-color)', borderRadius: '3px 3px 0 0' }} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Actions & Profile Dropdown */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            className="btn" 
            style={{ 
              padding: '11px 22px', 
              fontSize: '13px', 
              fontWeight: 800, 
              borderRadius: '50px', 
              backgroundColor: isDoctor ? '#059669' : 'var(--accent-color)',
              color: '#FFF',
              border: 'none',
              boxShadow: isDoctor ? '0 8px 20px rgba(16,185,129,0.25)' : '0 8px 20px rgba(100,114,217,0.25)', 
              letterSpacing: '0.5px',
              cursor: 'pointer'
            }} 
            onClick={() => navigateTo(isDoctor ? 'doctor' : 'exercises')}
          >
            {isDoctor ? 'MY PATIENTS' : 'START WORKOUT'}
          </button>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(0,0,0,0.1)' }}></div>
          
          {/* Functional Profile Avatar & Dropdown */}
          <div style={{ position: 'relative' }}>
            <div 
              style={{ 
                cursor: 'pointer', 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: isDoctor ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, #D1FAE5 100%)' : 'linear-gradient(135deg, var(--accent-light) 0%, #e0e5ff 100%)',
                border: '2px solid #FFF',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: isDoctor ? '#059669' : 'var(--accent-color)',
                transition: 'transform 0.2s ease'
              }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isDoctor ? <Stethoscope size={18} strokeWidth={2.5} /> : <User size={18} strokeWidth={2.5} />}
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                  style={{
                    position: 'absolute',
                    top: '55px',
                    right: '0',
                    width: '290px',
                    backgroundColor: '#FFF',
                    borderRadius: '24px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    zIndex: 1000
                  }}
                >
                  <div style={{ padding: '20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: isDoctor ? 'rgba(16,185,129,0.1)' : 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDoctor ? '#059669' : 'var(--accent-color)' }}>
                      {isDoctor ? <Stethoscope size={22} /> : <User size={22} />}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111' }}>
                        {user?.name || (isDoctor ? 'Dr. Sarah Jenkins' : 'Demo User')}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: isDoctor ? '#059669' : '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 700 }}>
                        {isDoctor ? <><Stethoscope size={13} /> Licensed Physiotherapist</> : <><Crown size={13} color="#F59E0B" /> Active Patient</>}
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '10px' }}>
                    {isDoctor ? (
                      <>
                        <button 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569', transition: 'all 0.2s' }} 
                          onClick={() => { setIsProfileOpen(false); navigateTo('doctor'); }}
                        >
                          <Stethoscope size={16} /> Clinical Dashboard
                        </button>
                        <button 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569', transition: 'all 0.2s' }} 
                          onClick={() => { setIsProfileOpen(false); navigateTo('dashboard'); }}
                        >
                          <LayoutDashboard size={16} /> Patient View
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569', transition: 'all 0.2s' }} 
                          onClick={() => { setIsProfileOpen(false); navigateTo('dashboard'); }}
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </button>
                        <button 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569', transition: 'all 0.2s' }} 
                          onClick={() => { setIsProfileOpen(false); navigateTo('history'); }}
                        >
                          <HistoryIcon size={16} /> Workout Records
                        </button>
                        <button 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#059669', transition: 'all 0.2s' }} 
                          onClick={() => { setIsProfileOpen(false); navigateTo('doctor'); }}
                        >
                          <Stethoscope size={16} /> Doctor Portal
                        </button>
                      </>
                    )}
                  </div>

                  <div style={{ padding: '10px', borderTop: '1px solid #F1F5F9' }}>
                    {user ? (
                      <button 
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#EF4444', transition: 'all 0.2s' }} 
                        onClick={() => { logout(); setIsProfileOpen(false); navigateTo('auth'); }}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    ) : (
                      <button 
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--accent-color)', transition: 'all 0.2s' }} 
                        onClick={() => { loginAsGuest(); setIsProfileOpen(false); }}
                      >
                        <User size={16} /> Sign In
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
      </header>
    </div>
  );
};

export default Navbar;
