import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import Session from './pages/Session';
import Summary from './pages/Summary';
import History from './pages/History';
import DoctorPortal from './pages/DoctorPortal';
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
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [sessionResults, setSessionResults] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  // Sync user-specific history whenever user changes
  useEffect(() => {
    if (!user || user.id === 'demo' || user.id === 'demo-doctor') {
      const saved = localStorage.getItem('rehab_ai_history_demo');
      if (saved) {
        try { setHistoryList(JSON.parse(saved)); } catch (e) { setHistoryList(DEFAULT_HISTORY); }
      } else {
        setHistoryList(DEFAULT_HISTORY);
      }
    } else {
      const storageKey = `rehab_ai_history_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try { setHistoryList(JSON.parse(saved)); } catch (e) { setHistoryList([]); }
      } else {
        setHistoryList([]);
      }
    }

    // Auto-route on login if on auth or landing
    if (user?.role === 'doctor') {
      setCurrentView(prev => (prev === 'auth' || prev === 'landing' ? 'doctor' : prev));
    }
  }, [user]);

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

    // Save to persistent user-specific history log
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      exercise: results.exercise || selectedExercise.name,
      exerciseId: results.exerciseId || selectedExercise.id,
      numericId: results.numericId || selectedExercise.numericId || 1,
      reps: results.rep || 0,
      formScore: results.formScore || 95,
      symmetry: results.symmetry || 94,
      duration: results.duration || '02:30',
      status: (results.formScore || 95) >= 90 ? 'Optimal' : 'Needs Work'
    };

    const storageKey = (!user || user.id === 'demo' || user.id === 'demo-doctor') ? 'rehab_ai_history_demo' : `rehab_ai_history_${user.id}`;
    setHistoryList(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem(storageKey, JSON.stringify(updated));
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
          <Landing onStart={() => navigateTo(user?.role === 'doctor' ? 'doctor' : 'dashboard')} />
        )}

        {currentView === 'auth' && (
          <Auth onAuthSuccess={(authUser) => {
            if (authUser?.role === 'doctor') {
              navigateTo('doctor');
            } else {
              navigateTo('dashboard');
            }
          }} />
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

        {currentView === 'doctor' && (
          <DoctorPortal 
            onSwitchToPatientView={() => navigateTo('dashboard')}
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("RehabAI UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', color: '#FFF', padding: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>Workout Session Paused</h2>
          <p style={{ color: '#94A3B8', maxWidth: '500px', marginBottom: '24px' }}>
            A temporary display issue occurred. You can return to the exercise selection screen and resume.
          </p>
          <button 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
            className="btn btn-primary"
            style={{ padding: '12px 30px', borderRadius: '50px', fontWeight: 800 }}
          >
            Return to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;


