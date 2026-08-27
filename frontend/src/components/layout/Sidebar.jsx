import React from 'react';
import { motion } from 'framer-motion';
import { Home, PlayCircle, BarChart2, History, User } from 'lucide-react';

const Sidebar = ({ currentView, navigateTo }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'exercises', label: 'Exercises', icon: PlayCircle },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 0',
      zIndex: 10,
      boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
    }}>
      <div style={{ padding: '0 32px', marginBottom: '60px' }}>
        <h1 style={{ letterSpacing: '1px', fontWeight: 800, fontSize: '24px', color: '#111827' }}>
          Physio<span className="text-accent">Assist</span>
        </h1>
      </div>

      <nav style={{ flex: 1, padding: '0 16px' }}>
        <ul style={{ listStyle: 'none' }}>
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <motion.li 
                key={item.id} 
                style={{ marginBottom: '8px' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <button
                  onClick={() => navigateTo(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    backgroundColor: isActive ? 'rgba(5, 150, 105, 0.1)' : 'transparent',
                    color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#F3F4F6';
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} color={isActive ? 'var(--accent-color)' : 'currentColor'} />
                  {item.label}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <motion.div 
        style={{ padding: '32px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div style={{ 
          padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', 
          borderRadius: '16px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: 'var(--accent-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFF'
          }}>
            <User size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>Alex J.</div>
            <div className="text-accent" style={{ fontSize: '12px', fontWeight: 600 }}>Pro Member</div>
          </div>
        </div>
      </motion.div>
    </aside>
  );
};

export default Sidebar;
