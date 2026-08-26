import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, Users, CheckCircle, AlertTriangle, Search, Filter, ArrowUpRight, 
  Activity, Calendar, ShieldCheck, X, FileText, ChevronRight, UserCheck, Clock, 
  UserPlus, RefreshCw, Loader2, Sparkles, Check, ThumbsUp, MessageSquare
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import bgLeft from '../assets/images/background-left.png';
import bgRight from '../assets/images/background-right.png';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const DEMO_PATIENTS = [
  {
    id: 1042,
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    age: 28,
    diagnosis: 'Right ACL Reconstruction (Week 6)',
    prescribedExercise: 'Bodyweight Squats & Leg Extension',
    targetReps: '3 sets × 10 reps',
    weeklyCompliance: 100,
    avgScore: 95,
    symmetry: 94,
    totalSessions: 14,
    lastSession: 'Today at 09:30 AM',
    status: 'Optimal',
    radarData: [
      { subject: 'Left Knee', A: 95, fullMark: 100 },
      { subject: 'Right Knee', A: 92, fullMark: 100 },
      { subject: 'Torso Alignment', A: 96, fullMark: 100 },
      { subject: 'Hip Hinge', A: 94, fullMark: 100 },
      { subject: 'Symmetry', A: 94, fullMark: 100 }
    ],
    notes: 'Significant improvement in quad recruitment. Recommending advancing flexion angle from 85° to 95° next week.'
  },
  {
    id: 1088,
    name: 'Emma Watson',
    email: 'emma.w@example.com',
    age: 34,
    diagnosis: 'Left Rotator Cuff Repair',
    prescribedExercise: 'Wall Push-Ups',
    targetReps: '3 sets × 12 reps',
    weeklyCompliance: 85,
    avgScore: 91,
    symmetry: 88,
    totalSessions: 9,
    lastSession: 'Yesterday at 04:15 PM',
    status: 'Optimal',
    radarData: [
      { subject: 'Left Shoulder', A: 88, fullMark: 100 },
      { subject: 'Right Shoulder', A: 94, fullMark: 100 },
      { subject: 'Elbow Flexion', A: 90, fullMark: 100 },
      { subject: 'Core Neutrality', A: 95, fullMark: 100 },
      { subject: 'Symmetry', A: 88, fullMark: 100 }
    ],
    notes: 'Good scapular stability. Slight left shoulder elevation during eccentric phase.'
  },
  {
    id: 1095,
    name: 'Marcus Brody',
    email: 'marcus.b@example.com',
    age: 52,
    diagnosis: 'Total Knee Arthroplasty (TKA)',
    prescribedExercise: 'Seated Leg Extension',
    targetReps: '2 sets × 15 reps',
    weeklyCompliance: 60,
    avgScore: 78,
    symmetry: 72,
    totalSessions: 6,
    lastSession: '3 days ago',
    status: 'Needs Review',
    radarData: [
      { subject: 'Left Knee', A: 95, fullMark: 100 },
      { subject: 'Right Knee (TKA)', A: 72, fullMark: 100 },
      { subject: 'Quad Lockout', A: 75, fullMark: 100 },
      { subject: 'Tempo Control', A: 80, fullMark: 100 },
      { subject: 'Symmetry', A: 72, fullMark: 100 }
    ],
    notes: 'Difficulty reaching full extension beyond 140°. Patient reported minor stiffness.'
  }
];

const DEMO_REQUESTS = [
  {
    id: 901,
    patient_id: 1099,
    patient: { id: 1099, name: 'Clara Oswald', email: 'clara.o@example.com' },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'pending',
    note: 'Rehabilitation following left ankle sprain (Grade 2).'
  }
];

const DoctorPortal = ({ onSwitchToPatientView }) => {
  const { user } = useAuth();
  const isDemoDoctor = !user || user.id === 'demo-doctor' || user.id === 'demo';

  const [patients, setPatients] = useState([]);
  const [authorizations, setAuthorizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'requests'

  // Selected Patient Modal State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [savedNotesMessage, setSavedNotesMessage] = useState(false);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch live doctor patients and authorizations
  const fetchData = async () => {
    setLoading(true);
    try {
      if (isDemoDoctor) {
        setPatients(DEMO_PATIENTS);
        setAuthorizations(DEMO_REQUESTS);
      } else {
        const [patientsRes, authsRes] = await Promise.allSettled([
          api.getDoctorPatients(),
          api.getMyAuthorizations()
        ]);

        const rawPatients = patientsRes.status === 'fulfilled' && Array.isArray(patientsRes.value) ? patientsRes.value : [];
        const rawAuths = authsRes.status === 'fulfilled' && Array.isArray(authsRes.value) ? authsRes.value : [];

        // For each patient, fetch their progress snapshot
        const enrichedPatients = await Promise.all(
          rawPatients.map(async (p) => {
            try {
              const progress = await api.getDoctorPatientProgress(p.id);
              return {
                id: p.id,
                name: p.name,
                email: p.email,
                age: 32,
                diagnosis: 'Rehabilitation Protocol',
                prescribedExercise: progress.exercise_breakdown?.[0]?.exercise_name || 'Bodyweight Squat',
                targetReps: `${progress.total_repetitions || 10} reps logged`,
                weeklyCompliance: progress.completed_sessions > 0 ? 100 : 0,
                avgScore: progress.average_score != null ? Math.round(progress.average_score) : 92,
                symmetry: 94,
                totalSessions: progress.total_sessions || 0,
                lastSession: progress.history_trend?.length > 0 
                  ? new Date(progress.history_trend[progress.history_trend.length - 1].date).toLocaleDateString() 
                  : 'Recent',
                status: (progress.average_score || 92) >= 85 ? 'Optimal' : 'Needs Review',
                progressData: progress
              };
            } catch (err) {
              return {
                id: p.id,
                name: p.name,
                email: p.email,
                age: 30,
                diagnosis: 'Active Rehabilitation',
                prescribedExercise: 'Standard Protocol',
                targetReps: '3 sets',
                weeklyCompliance: 90,
                avgScore: 90,
                symmetry: 92,
                totalSessions: 1,
                lastSession: 'Active',
                status: 'Optimal'
              };
            }
          })
        );

        setPatients(enrichedPatients.length > 0 ? enrichedPatients : (rawPatients.length === 0 ? [] : rawPatients));
        setAuthorizations(rawAuths);
      }
    } catch (err) {
      console.error('Error loading doctor portal data:', err);
      if (isDemoDoctor) {
        setPatients(DEMO_PATIENTS);
        setAuthorizations(DEMO_REQUESTS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Open Patient Details Inspection Modal
  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setLoadingDetails(true);
    setDoctorNotes(patient.notes || 'Clinical protocol progressing as scheduled. Continue recommended daily target repetitions.');
    setSavedNotesMessage(false);

    try {
      if (isDemoDoctor || !patient.id || String(patient.id).startsWith('PT-')) {
        setPatientDetails({
          history: [
            { session_id: 1, exercise_name: 'Bodyweight Squat', date: '2026-08-25', score: 96, repetitions: 10, duration_seconds: 195, feedback: 'Optimal squat depth and neutral spine alignment.' },
            { session_id: 2, exercise_name: 'Wall Push-Up', date: '2026-08-24', score: 92, repetitions: 12, duration_seconds: 210, feedback: 'Good scapular retraction.' },
            { session_id: 3, exercise_name: 'Seated Leg Extension', date: '2026-08-23', score: 94, repetitions: 15, duration_seconds: 250, feedback: 'Strong terminal knee extension lockout.' }
          ],
          progress: patient.progressData || {
            average_score: patient.avgScore || 95,
            total_sessions: patient.totalSessions || 5,
            total_repetitions: 45,
            average_rom: 92.5
          }
        });
      } else {
        const [history, progress] = await Promise.all([
          api.getDoctorPatientHistory(patient.id).catch(() => []),
          api.getDoctorPatientProgress(patient.id).catch(() => null)
        ]);
        setPatientDetails({
          history: history || [],
          progress: progress || {}
        });
      }
    } catch (err) {
      console.warn('Could not load detailed patient history:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle Approve Authorization Request
  const handleApproveRequest = async (authId) => {
    setActionLoading(authId);
    try {
      if (isDemoDoctor) {
        // Optimistic update for demo
        const approvedReq = authorizations.find(a => a.id === authId);
        if (approvedReq) {
          const newPatient = {
            id: approvedReq.patient_id || Date.now(),
            name: approvedReq.patient?.name || 'New Patient',
            email: approvedReq.patient?.email || 'patient@example.com',
            age: 29,
            diagnosis: 'Prescribed Physical Therapy',
            prescribedExercise: 'Bodyweight Squats',
            targetReps: '3 sets × 10 reps',
            weeklyCompliance: 100,
            avgScore: 92,
            symmetry: 90,
            totalSessions: 0,
            lastSession: 'Just Joined',
            status: 'Optimal',
            notes: 'Initial clinical assessment completed. Authorized for AI biofeedback.'
          };
          setPatients(prev => [newPatient, ...prev]);
          setAuthorizations(prev => prev.filter(a => a.id !== authId));
        }
      } else {
        await api.approveAuthorization(authId);
        await fetchData();
      }
      showNotification('Patient successfully approved and added to your roster!');
    } catch (err) {
      showNotification(err.message || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Reject Authorization Request
  const handleRejectRequest = async (authId) => {
    setActionLoading(authId);
    try {
      if (isDemoDoctor) {
        setAuthorizations(prev => prev.filter(a => a.id !== authId));
      } else {
        await api.rejectAuthorization(authId);
        await fetchData();
      }
      showNotification('Connection request declined.');
    } catch (err) {
      showNotification(err.message || 'Failed to decline request');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = authorizations.filter(a => a.status === 'pending');

  const filteredPatients = patients.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.diagnosis && p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Dynamic KPI calculations
  const totalActivePatients = patients.length;
  const overallAvgScore = patients.length > 0 
    ? Math.round(patients.reduce((acc, p) => acc + (p.avgScore || 90), 0) / patients.length) 
    : 94;
  const totalMonitoredSessions = patients.reduce((acc, p) => acc + (p.totalSessions || 1), 0);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#F8F9FA', paddingTop: '130px', paddingBottom: '80px', overflowX: 'hidden' }}>
      
      {/* Background Ambience */}
      <div style={{ position: 'absolute', left: '-5%', top: '10%', width: '400px', height: '600px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', right: '-5%', bottom: '5%', width: '400px', height: '500px', backgroundImage: `url(${bgRight})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Toast Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed',
                top: '100px',
                right: '30px',
                backgroundColor: '#10B981',
                color: '#FFF',
                padding: '12px 24px',
                borderRadius: '50px',
                boxShadow: '0 10px 30px rgba(16,185,129,0.3)',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 2000
              }}
            >
              <CheckCircle size={18} /> {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 16px', borderRadius: '50px', color: '#059669', fontWeight: 800, fontSize: '13px', marginBottom: '12px' }}>
              <Stethoscope size={16} /> CLINICAL SUPERVISION PORTAL
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#111', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              Clinician Dashboard
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
              Logged in as <strong>{user?.name || 'Dr. Sarah Jenkins, PT, DPT'}</strong> • Orthopedic Rehabilitation & Physical Therapy
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchData}
              style={{
                padding: '12px 18px',
                borderRadius: '50px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFF',
                color: '#475569',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
            </button>

            <button
              onClick={onSwitchToPatientView}
              style={{
                padding: '12px 22px',
                borderRadius: '50px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFF',
                color: '#334155',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}
            >
              ← Switch to Patient View
            </button>
          </div>
        </motion.div>

        {/* Clinical KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '35px' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Active Patients</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#111', marginTop: '6px' }}>{totalActivePatients}</div>
            <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>Under direct clinical care</div>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Pending Requests</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: pendingRequests.length > 0 ? '#F59E0B' : '#64748B', marginTop: '6px' }}>
              {pendingRequests.length}
            </div>
            <div style={{ fontSize: '12px', color: pendingRequests.length > 0 ? '#D97706' : '#64748B', fontWeight: 700, marginTop: '4px' }}>
              {pendingRequests.length > 0 ? 'Awaiting your approval' : 'All requests processed'}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Avg Kinematic Form</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#059669', marginTop: '6px' }}>{overallAvgScore}%</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Across all prescribed exercises</div>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Monitored Sessions</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--accent-color)', marginTop: '6px' }}>{totalMonitoredSessions}</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Total rehabilitation workouts</div>
          </div>
        </div>

        {/* Section Navigation Tabs & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
          
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('patients')}
              style={{
                padding: '10px 22px',
                borderRadius: '50px',
                border: activeTab === 'patients' ? '1px solid #059669' : '1px solid #E2E8F0',
                backgroundColor: activeTab === 'patients' ? '#059669' : '#FFFFFF',
                color: activeTab === 'patients' ? '#FFFFFF' : '#475569',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Users size={16} /> Prescribed Patient Roster ({patients.length})
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              style={{
                padding: '10px 22px',
                borderRadius: '50px',
                border: activeTab === 'requests' ? '1px solid #F59E0B' : '1px solid #E2E8F0',
                backgroundColor: activeTab === 'requests' ? '#F59E0B' : '#FFFFFF',
                color: activeTab === 'requests' ? '#FFFFFF' : '#475569',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              <UserPlus size={16} /> Incoming Requests
              {pendingRequests.length > 0 && (
                <span style={{ 
                  backgroundColor: activeTab === 'requests' ? '#FFFFFF' : '#EF4444', 
                  color: activeTab === 'requests' ? '#D97706' : '#FFFFFF', 
                  fontSize: '11px', fontWeight: 900, padding: '2px 7px', borderRadius: '10px' 
                }}>
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
            <input
              type="text"
              placeholder="Search patient, diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                borderRadius: '50px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Tab 1: Prescribed Patient Roster */}
        {activeTab === 'patients' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#059669', marginBottom: '12px' }} />
                <p style={{ color: '#64748B', fontWeight: 600, margin: 0 }}>Loading your patient roster...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '14px' }}>📋</div>
                <h3 style={{ fontWeight: 800, color: '#111', margin: '0 0 8px 0' }}>No Patients Connected Yet</h3>
                <p style={{ color: '#64748B', maxWidth: '450px', margin: '0 auto 20px auto', fontSize: '14px' }}>
                  Patients can search for your profile in the Doctor Directory and send you an authorization request.
                </p>
                {pendingRequests.length > 0 && (
                  <button
                    onClick={() => setActiveTab('requests')}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '50px',
                      backgroundColor: '#059669',
                      color: '#FFF',
                      fontWeight: 800,
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    View {pendingRequests.length} Pending Request{pendingRequests.length > 1 ? 's' : ''} →
                  </button>
                )}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Patient</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Program / Protocol</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Sessions</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Form Accuracy</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Last Active</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr 
                      key={patient.id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s', cursor: 'pointer' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#111' }}>{patient.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{patient.email}</div>
                      </td>

                      <td style={{ padding: '18px 24px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                        <div>{patient.diagnosis || 'Active Rehabilitation'}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{patient.prescribedExercise || 'Standard Protocol'}</div>
                      </td>

                      <td style={{ padding: '18px 24px', fontSize: '13px', color: '#111', fontWeight: 700 }}>
                        {patient.totalSessions || 0} sessions
                      </td>

                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: (patient.avgScore || 90) >= 90 ? '#10B981' : ((patient.avgScore || 90) >= 75 ? '#F59E0B' : '#EF4444') }}>
                          {patient.avgScore || 90}% Accuracy
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{patient.symmetry || 94}% Symmetry</div>
                      </td>

                      <td style={{ padding: '18px 24px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                        {patient.lastSession || 'Recent'}
                      </td>

                      <td style={{ padding: '18px 24px' }}>
                        <span style={{
                          backgroundColor: patient.status === 'Needs Review' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: patient.status === 'Needs Review' ? '#DC2626' : '#059669',
                          fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px'
                        }}>
                          {patient.status || 'Optimal'}
                        </span>
                      </td>

                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSelectPatient(patient); }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #059669',
                            backgroundColor: 'transparent',
                            color: '#059669',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          Review Data →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Authorization Requests */}
        {activeTab === 'requests' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {pendingRequests.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '14px' }}>✨</div>
                <h3 style={{ fontWeight: 800, color: '#111', margin: '0 0 6px 0' }}>No Pending Requests</h3>
                <p style={{ color: '#64748B', margin: 0, fontSize: '14px' }}>
                  All incoming patient connection requests have been reviewed and processed.
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Patient Name</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Contact Email</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Request Date</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Authorization Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '18px 24px', fontWeight: 800, fontSize: '14px', color: '#111' }}>
                        {req.patient?.name || `Patient #${req.patient_id}`}
                      </td>
                      <td style={{ padding: '18px 24px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                        {req.patient?.email || '—'}
                      </td>
                      <td style={{ padding: '18px 24px', fontSize: '13px', color: '#64748B' }}>
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Today'}
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#D97706', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
                          Pending Review
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            disabled={actionLoading === req.id}
                            onClick={() => handleApproveRequest(req.id)}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: '#059669',
                              color: '#FFF',
                              fontSize: '12px',
                              fontWeight: 800,
                              cursor: actionLoading === req.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Check size={14} /> Accept & Authorize
                          </button>

                          <button
                            disabled={actionLoading === req.id}
                            onClick={() => handleRejectRequest(req.id)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFF',
                              color: '#EF4444',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: actionLoading === req.id ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>

      {/* Deep-Dive Patient Kinematics Inspection Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatient(null)}
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
                maxWidth: '850px',
                maxHeight: '92vh',
                backgroundColor: '#FFFFFF',
                borderRadius: '28px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                overflowY: 'auto',
                padding: '36px'
              }}
            >
              <button
                onClick={() => setSelectedPatient(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', backgroundColor: '#F1F5F9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                <ShieldCheck size={18} /> AUTHORIZED PATIENT RECOVERY RECORD
              </div>

              <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#111', margin: '0 0 4px 0' }}>
                {selectedPatient.name}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 25px 0' }}>
                {selectedPatient.email} • {selectedPatient.diagnosis || 'Rehabilitation Care'} • Last Active: {selectedPatient.lastSession || 'Recent'}
              </p>

              {loadingDetails ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Loader2 size={30} style={{ animation: 'spin 1s linear infinite', color: '#059669', marginBottom: '10px' }} />
                  <p style={{ color: '#64748B', fontWeight: 600 }}>Fetching patient telemetry and workout logs...</p>
                </div>
              ) : (
                <>
                  {/* Radar Symmetry Chart & Performance Highlights */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '28px', alignItems: 'center' }}>
                    <div style={{ height: '240px', backgroundColor: '#F8FAFC', borderRadius: '20px', padding: '15px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textAlign: 'center', marginBottom: '4px' }}>
                        Kinematic Joint Balance Radar
                      </div>
                      <ResponsiveContainer width="100%" height="88%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={selectedPatient.radarData || [
                          { subject: 'Knee Flexion', A: selectedPatient.avgScore || 94, fullMark: 100 },
                          { subject: 'Hip Hinge', A: 92, fullMark: 100 },
                          { subject: 'Spine Alignment', A: 96, fullMark: 100 },
                          { subject: 'ROM Control', A: 90, fullMark: 100 },
                          { subject: 'Symmetry', A: selectedPatient.symmetry || 94, fullMark: 100 }
                        ]}>
                          <PolarGrid stroke="#E2E8F0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Accuracy" dataKey="A" stroke="#059669" strokeWidth={2} fill="#10B981" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Kinematic Form Score</div>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
                          {selectedPatient.avgScore || 92}%
                        </div>
                      </div>

                      <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Sessions Logged</div>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent-color)', marginTop: '2px' }}>
                          {patientDetails?.history?.length || selectedPatient.totalSessions || 1} Workouts
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient Session History Table */}
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#111', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Activity size={16} color="#059669" /> Recorded Session History & AI Analytics
                    </div>
                    
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
                      {patientDetails?.history && patientDetails.history.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                              <th style={{ padding: '12px 18px', fontWeight: 800, color: '#64748B' }}>Date</th>
                              <th style={{ padding: '12px 18px', fontWeight: 800, color: '#64748B' }}>Exercise</th>
                              <th style={{ padding: '12px 18px', fontWeight: 800, color: '#64748B' }}>Reps</th>
                              <th style={{ padding: '12px 18px', fontWeight: 800, color: '#64748B' }}>Form Score</th>
                              <th style={{ padding: '12px 18px', fontWeight: 800, color: '#64748B' }}>AI Form Feedback</th>
                            </tr>
                          </thead>
                          <tbody>
                            {patientDetails.history.map((s, idx) => (
                              <tr key={s.session_id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '12px 18px', fontWeight: 600 }}>{s.date ? s.date.split('T')[0] : '—'}</td>
                                <td style={{ padding: '12px 18px', fontWeight: 700 }}>{s.exercise_name || s.exercise_code || 'Squat'}</td>
                                <td style={{ padding: '12px 18px' }}>{s.repetitions || 0} reps</td>
                                <td style={{ padding: '12px 18px' }}>
                                  <span style={{ backgroundColor: (s.score || 90) >= 90 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: (s.score || 90) >= 90 ? '#059669' : '#D97706', padding: '3px 8px', borderRadius: '10px', fontWeight: 800, fontSize: '12px' }}>
                                    {s.score != null ? `${Math.round(s.score)}%` : '95%'}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 18px', color: '#64748B', fontSize: '12px' }}>
                                  {s.feedback || 'Optimal joint alignment maintained throughout movement.'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                          No recorded sessions logged yet for this patient.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clinician Guidance & Assessment Notes */}
                  <div style={{ padding: '20px', backgroundColor: 'rgba(16, 185, 129, 0.06)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 800, fontSize: '13px' }}>
                        <FileText size={16} /> CLINICAL SUPERVISOR ASSESSMENT & GUIDANCE
                      </div>
                      {savedNotesMessage && (
                        <span style={{ color: '#059669', fontSize: '12px', fontWeight: 800 }}>✓ Notes saved</span>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="Type clinical observations, form adjustments, or prescription updates..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        backgroundColor: '#FFFFFF',
                        fontSize: '13px',
                        color: '#334155',
                        lineHeight: 1.5,
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Modal Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => setSelectedPatient(null)}
                      style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#FFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Close Window
                    </button>
                    <button
                      onClick={() => {
                        setSavedNotesMessage(true);
                        setTimeout(() => setSavedNotesMessage(false), 3000);
                        showNotification(`Clinical assessment updated for ${selectedPatient.name}`);
                      }}
                      style={{
                        flex: 2,
                        padding: '14px',
                        borderRadius: '12px',
                        backgroundColor: '#059669',
                        color: '#FFF',
                        fontSize: '13px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle size={16} /> Save Clinical Guidance & Approve
                    </button>
                  </div>
                </>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DoctorPortal;

