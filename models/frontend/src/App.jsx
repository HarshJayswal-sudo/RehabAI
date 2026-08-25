import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import Session from './pages/Session';
import Summary from './pages/Summary';
import History from './pages/History';
import Auth from './pages/Auth';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EXERCISES } from './data/exercises';
import './App.css';

const DEFAULT_HISTORY = [
  { id: 1, date: '2026-08-25', exercise: 'Bodyweight Squat', exerciseId: 'squat', reps: 10, formScore: 96, symmetry: 94, duration: '03:15', status: 'Optimal' },
  { id: 2, date: '2026-08-24', exercise: 'Bodyweight Lunge', exerciseId: 'lunges', reps: 8, formScore: 92, symmetry: 90, duration: '02:45', status: 'Optimal' },
  { id: 3, date: '2026-08-23', exercise: 'Wall Push-Up', exerciseId: 'wall_push_up', reps: 12, formScore: 95, symmetry: 96, duration: '03:30', status: 'Optimal' },
  { id: 4, date: '2026-08-22', exercise: 'Seated Leg Extension', exerciseId: 'leg_extension', reps: 15, formScore: 98, symmetry: 95, duration: '04:10', status: 'Optimal' },
  { id: 5, date: '2026-08-21', exercise: 'Windmill Toe Touch', exerciseId: 'wind_will_toe_touch', reps: 10, formScore: 89, symmetry: 88, duration: '03:00', status: 'Needs Work' },
  { id: 6, date: '2026-08-20', exercise: 'Bodyweight Squat', exerciseId: 'squat', reps: 10, formScore: 94, symmetry: 92, duration: '03:05', status: 'Optimal' }
];

function AppContent() {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [sessionResults, setSessionResults] = useState(null);
  const [historyList, setHistoryList] = useState(() => {
    const saved = localStorage.getItem('rehab_ai_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_HISTORY;
      }
    }
    return DEFAULT_HISTORY;
  });

  const navigateTo = (view) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
  };

  const startExercise = (exercise) => {
    setSelectedExercise(exercise || EXERCISES[0]);
    navigateTo('session');
  };

  const startExerciseById = (exerciseId) => {
    const found = EXERCISES.find(ex => ex.id === exerciseId) || EXERCISES[0];
    startExercise(found);
  };

  const finishSession = (results) => {
    setSessionResults(results);

    // Save to history log
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      exercise: results.exercise || selectedExercise.name,
      exerciseId: results.exerciseId || selectedExercise.id,
      reps: results.rep || 0,
      formScore: results.formScore || 95,
      symmetry: results.symmetry || 94,
      duration: results.duration || '02:30',
      status: (results.formScore || 95) >= 90 ? 'Optimal' : 'Needs Work'
    };

    setHistoryList(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem('rehab_ai_history', JSON.stringify(updated));
      return updated;
    });

    navigateTo('summary');
  };

  const repeatCurrentSession = () => {
    navigateTo('session');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentView={currentView} navigateTo={navigateTo} />
      
      <main style={{ flex: 1, backgroundColor: 'var(--bg-color)' }}>
        {currentView === 'landing' && (
          <Landing onStart={() => navigateTo('dashboard')} />
        )}

        {currentView === 'auth' && (
          <Auth onAuthSuccess={() => navigateTo('dashboard')} />
        )}

        {currentView === 'dashboard' && (
          <Dashboard 
            onStartSession={() => startExercise(EXERCISES[0])}
            onSelectExercise={startExercise}
            onViewExercises={() => navigateTo('exercises')}
            onViewHistory={() => navigateTo('history')}
          />
        )}

        {currentView === 'exercises' && (
          <Exercises onSelectExercise={startExercise} />
        )}

        {currentView === 'history' && (
          <History 
            historyList={historyList} 
            onStartExercise={startExerciseById}
          />
        )}

        {currentView === 'session' && (
          <Session 
            selectedExercise={selectedExercise}
            onEnd={finishSession} 
            onCancel={() => navigateTo('exercises')} 
          />
        )}

        {currentView === 'summary' && (
          <Summary 
            results={sessionResults} 
            onFinish={() => navigateTo('dashboard')}
            onRepeat={repeatCurrentSession}
          />
        )}
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
