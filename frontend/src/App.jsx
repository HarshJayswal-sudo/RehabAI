import React, { useState } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Session from './pages/Session';
import Summary from './pages/Summary';
import Auth from './pages/Auth';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function AppContent() {
  const [currentView, setCurrentView] = useState('landing');
  const [sessionResults, setSessionResults] = useState(null);
  const { user } = useAuth();

  const navigateTo = (view) => {
    // Removed route protection for hackathon showcase
    setCurrentView(view);
  };

  const finishSession = (results) => {
    setSessionResults(results);
    setCurrentView('summary');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentView={currentView} navigateTo={navigateTo} />
      <main style={{ flex: 1, backgroundColor: 'var(--bg-color)' }}>
        {currentView === 'landing' && <Landing onStart={() => navigateTo('dashboard')} />}
        {currentView === 'auth' && <Auth onAuthSuccess={() => navigateTo('dashboard')} />}
        {currentView === 'dashboard' && <Dashboard onStartSession={() => navigateTo('session')} />}
        {currentView === 'session' && <Session onEnd={finishSession} onCancel={() => navigateTo('dashboard')} />}
        {currentView === 'summary' && <Summary results={sessionResults} onFinish={() => navigateTo('dashboard')} />}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
