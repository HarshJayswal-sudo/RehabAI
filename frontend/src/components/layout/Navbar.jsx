import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Home, LayoutDashboard, Activity, Dumbbell, History as HistoryIcon, Settings, LogOut, Crown, Stethoscope, Users, Menu, X } from 'lucide-react';
import iconImg from '../../assets/images/icon.png';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ currentView, navigateTo }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, loginAsGuest } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const navItems = isDoctor ? [
    { id: 'landing', label: 'Home', icon: <Home size={18} strokeWidth={2.5} /> },
    { id: 'doctor', label: 'Doctor Portal', icon: <Stethoscope size={18} strokeWidth={2.5} /> },
    { id: 'exercises', label: 'Exercise Library', icon: <Dumbbell size={18} strokeWidth={2.5} /> },
    { id: 'dashboard', label: 'Patient View', icon: <LayoutDashboard size={18} strokeWidth={2.5} /> },
  ] : [
    { id: 'landing', label: 'Home', icon: <Home size={18} strokeWidth={2.5} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} strokeWidth={2.5} /> },
    { id: 'exercises', label: 'Exercises', icon: <Dumbbell size={18} strokeWidth={2.5} /> },
    { id: 'history', label: 'History', icon: <HistoryIcon size={18} strokeWidth={2.5} /> },
    { id: 'doctor', label: 'Doctor Portal', icon: <Stethoscope size={18} strokeWidth={2.5} /> },
  ];

  const handleMobileNav = (viewId) => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    navigateTo(viewId);
  };

  return (
    <div style={{ position: 'fixed', top: '16px', left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', pointerEvents: 'none', padding: '0 12px' }}>
      <header style={{ 
        width: '100%', 
        maxWidth: '1140px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '50px',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.06), 0 5px 15px rgba(0, 0, 0, 0.03)',
        pointerEvents: 'auto',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center', height: '68px' }}>
        
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => handleMobileNav('landing')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', backgroundColor: '#FFF', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
             <img src={iconImg} alt="PhysioAssist" style={{ height: '22px' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)', color: '#111' }}>
            Physio<span style={{ color: isDoctor ? '#10B981' : 'var(--accent-color)' }}>Assist</span>
          </h1>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hide-mobile" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          <ul style={{ 
            listStyle: 'none', display: 'flex', margin: 0, padding: 0, gap: '20px', height: '100%', alignItems: 'center'
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
        
        {/* Actions & Profile Dropdown & Mobile Hamburger */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn hide-mobile" 
            style={{ 
              padding: '10px 20px', 
              fontSize: '12px', 
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
          
          <div className="hide-mobile" style={{ width: '1px', height: '20px', backgroundColor: 'rgba(0,0,0,0.1)' }}></div>
          
          {/* Functional Profile Avatar & Dropdown */}
          <div style={{ position: 'relative' }}>
            <div 
              style={{ 
                cursor: 'pointer', 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                background: isDoctor ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, #D1FAE5 100%)' : 'linear-gradient(135deg, var(--accent-light) 0%, #e0e5ff 100%)',
                border: '2px solid #FFF',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: isDoctor ? '#059669' : 'var(--accent-color)',
                transition: 'transform 0.2s ease'
              }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="User Account"
            >
              {isDoctor ? <Stethoscope size={18} strokeWidth={2.5} /> : <User size={18} strokeWidth={2.5} />}
            </div>

            {/* Desktop / Global Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: '0',
                    width: '280px',
                    backgroundColor: '#FFF',
                    borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    zIndex: 1000
                  }}
                >
                  <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: isDoctor ? 'rgba(16,185,129,0.1)' : 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDoctor ? '#059669' : 'var(--accent-color)' }}>
                      {isDoctor ? <Stethoscope size={20} /> : <User size={20} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.name || (isDoctor ? 'Dr. Sarah Jenkins' : 'Demo Patient')}
                      </h4>
                      <p style={{ margin: 0, fontSize: '11px', color: isDoctor ? '#059669' : '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 700 }}>
                        {isDoctor ? <><Stethoscope size={12} /> Licensed Clinician</> : <><Crown size={12} color="#F59E0B" /> Active Patient</>}
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '8px' }}>
                    {isDoctor ? (
                      <>
                        <button 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569', textAlign: 'left' }} 
                          onClick={() => { setIsProfileOpen(false); navigateTo('doctor'); }}
                        >
                          <Stethoscope size={16} /> Clinical Dashboard
                        </button>
                        <button 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569', textAlign: 'left' }} 
                          onClick={() => { setIsProfileOpen(false); navigateTo('dashboard'); }}
                        >
                          <LayoutDashboard size={16} /> Patient View
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569', textAlign: 'left' }} 
                          onClick={() => { setIsProfileOpen(false); navigateTo('dashboard'); }}
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </button>
                        <button 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569', textAlign: 'left' }} 
                          onClick={() => { setIsProfileOpen(false); navigateTo('history'); }}
                        >
                          <HistoryIcon size={16} /> Workout Records
                        </button>
                        <button 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#059669', textAlign: 'left' }} 
                          onClick={() => { setIsProfileOpen(false); navigateTo('doctor'); }}
                        >
                          <Stethoscope size={16} /> Doctor Portal
                        </button>
                      </>
                    )}
                  </div>

                  <div style={{ padding: '8px', borderTop: '1px solid #F1F5F9' }}>
                    {user ? (
                      <button 
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#EF4444', textAlign: 'left' }} 
                        onClick={() => { logout(); setIsProfileOpen(false); navigateTo('auth'); }}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    ) : (
                      <button 
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--accent-color)', textAlign: 'left' }} 
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

          {/* Mobile Hamburger Button */}
          <button
            className="show-mobile"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsProfileOpen(false);
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: isMobileMenuOpen ? '#1E293B' : '#F1F5F9',
              color: isMobileMenuOpen ? '#FFF' : '#334155',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              touchAction: 'manipulation'
            }}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </div>

      {/* Animated Mobile Slide-down Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '74px',
              left: 0,
              right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {/* Quick user banner on mobile */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px 14px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#111' }}>{user?.name || (isDoctor ? 'Dr. Sarah Jenkins' : 'Demo Patient')}</div>
                <div style={{ fontSize: '11px', color: isDoctor ? '#059669' : 'var(--accent-color)', fontWeight: 700 }}>
                  {isDoctor ? 'Physiotherapist Portal' : 'Patient Rehabilitation'}
                </div>
              </div>
              <button
                onClick={() => handleMobileNav(isDoctor ? 'doctor' : 'exercises')}
                className="btn"
                style={{
                  padding: '8px 16px',
                  fontSize: '11px',
                  fontWeight: 800,
                  borderRadius: '50px',
                  backgroundColor: isDoctor ? '#059669' : 'var(--accent-color)',
                  color: '#FFF',
                  border: 'none'
                }}
              >
                {isDoctor ? 'PATIENTS' : 'START NOW'}
              </button>
            </div>

            {/* Nav list */}
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNav(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: isActive ? (isDoctor ? 'rgba(16, 185, 129, 0.1)' : 'var(--accent-light)') : 'transparent',
                    color: isActive ? (isDoctor ? '#059669' : 'var(--accent-color)') : '#334155',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '15px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    touchAction: 'manipulation'
                  }}
                >
                  <span style={{ color: isActive ? (isDoctor ? '#059669' : 'var(--accent-color)') : '#64748B' }}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && (
                    <span style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isDoctor ? '#10B981' : 'var(--accent-color)' }} />
                  )}
                </button>
              );
            })}

            {/* Mobile Auth button */}
            <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
              {user ? (
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); navigateTo('auth'); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#EF4444',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <button
                  onClick={() => { loginAsGuest(); setIsMobileMenuOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent-color)',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <User size={16} /> Sign In as Guest
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </header>
    </div>
  );
};

export default Navbar;

