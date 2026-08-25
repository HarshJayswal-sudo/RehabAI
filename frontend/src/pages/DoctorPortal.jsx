import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Users, CheckCircle, AlertTriangle, Search, Filter, ArrowUpRight, Activity, Calendar, ShieldCheck, X, FileText, ChevronRight } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import bgLeft from '../assets/images/background-left.png';
import bgRight from '../assets/images/background-right.png';

const PATIENTS = [
  {
    id: 'PT-1042',
    name: 'Alex Johnson',
    age: 28,
    diagnosis: 'Right ACL Reconstruction (Week 6)',
    prescribedExercise: 'Bodyweight Squats & Leg Extension',
    targetReps: '3 sets × 10 reps',
    weeklyCompliance: 100,
    avgScore: 95,
    symmetry: 94,
    lastSession: 'Today at 09:30 AM',
    status: 'On Track',
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
    id: 'PT-1088',
    name: 'Emma Watson',
    age: 34,
    diagnosis: 'Left Rotator Cuff Repair',
    prescribedExercise: 'Wall Push-Ups',
    targetReps: '3 sets × 12 reps',
    weeklyCompliance: 80,
    avgScore: 91,
    symmetry: 88,
    lastSession: 'Yesterday at 04:15 PM',
    status: 'On Track',
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
    id: 'PT-1095',
    name: 'Marcus Brody',
    age: 52,
    diagnosis: 'Total Knee Arthroplasty (TKA)',
    prescribedExercise: 'Seated Leg Extension',
    targetReps: '2 sets × 15 reps',
    weeklyCompliance: 60,
    avgScore: 78,
    symmetry: 72,
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

const DoctorPortal = ({ onSwitchToPatientView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const filteredPatients = PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#F8F9FA', paddingTop: '130px', paddingBottom: '80px', overflowX: 'hidden' }}>
      
      {/* Background Ambience */}
      <div style={{ position: 'absolute', left: '-5%', top: '10%', width: '400px', height: '600px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', right: '-5%', bottom: '5%', width: '400px', height: '500px', backgroundImage: `url(${bgRight})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Top Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 16px', borderRadius: '50px', color: '#059669', fontWeight: 800, fontSize: '13px', marginBottom: '12px' }}>
              <Stethoscope size={16} /> CLINICAL SUPERVISION PORTAL
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#111', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              Provider Dashboard
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
              Logged in as <strong>Dr. Sarah Jenkins, PT, DPT</strong> • Orthopedic Rehabilitation Clinic
            </p>
          </div>

          <button
            onClick={onSwitchToPatientView}
            style={{
              padding: '12px 24px',
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
        </motion.div>

        {/* Clinical KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Active Patients</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#111', marginTop: '6px' }}>48</div>
            <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>↑ 4 new this week</div>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Weekly Compliance</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#10B981', marginTop: '6px' }}>94.2%</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Target threshold &gt; 85%</div>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Avg Kinematic Score</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--accent-color)', marginTop: '6px' }}>92.8%</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Across all 5 exercises</div>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Attention Flags</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#EF4444', marginTop: '6px' }}>1 Patient</div>
            <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 700, marginTop: '4px' }}>Asymmetry detected</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: 0 }}>
            Prescribed Patient Roster
          </h3>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
            <input
              type="text"
              placeholder="Search patient, ID, diagnosis..."
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

        {/* Patient Table Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Patient</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Diagnosis / Program</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Prescribed Protocol</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Compliance</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Kinematic Accuracy</th>
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
                  onClick={() => setSelectedPatient(patient)}
                >
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#111' }}>{patient.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{patient.id} • {patient.age} yrs</div>
                  </td>

                  <td style={{ padding: '18px 24px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                    {patient.diagnosis}
                  </td>

                  <td style={{ padding: '18px 24px', fontSize: '13px', color: '#111', fontWeight: 700 }}>
                    <div>{patient.prescribedExercise}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{patient.targetReps}</div>
                  </td>

                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${patient.weeklyCompliance}%`, height: '100%', backgroundColor: patient.weeklyCompliance >= 80 ? '#10B981' : '#F59E0B' }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{patient.weeklyCompliance}%</span>
                    </div>
                  </td>

                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: patient.avgScore >= 90 ? '#10B981' : (patient.avgScore >= 75 ? '#F59E0B' : '#EF4444') }}>
                      {patient.avgScore}% Form
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{patient.symmetry}% Bilateral Symmetry</div>
                  </td>

                  <td style={{ padding: '18px 24px' }}>
                    <span style={{
                      backgroundColor: patient.status === 'On Track' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: patient.status === 'On Track' ? '#059669' : '#DC2626',
                      fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px'
                    }}>
                      {patient.status}
                    </span>
                  </td>

                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--accent-color)',
                        backgroundColor: 'transparent',
                        color: 'var(--accent-color)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Review Data →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Patient Kinematics Inspection Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatient(null)}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '780px',
                maxHeight: '90vh',
                backgroundColor: '#FFFFFF',
                borderRadius: '28px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                overflowY: 'auto',
                padding: '40px'
              }}
            >
              <button
                onClick={() => setSelectedPatient(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', backgroundColor: '#F1F5F9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-color)', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                <ShieldCheck size={18} /> PATIENT RECOVERY RECORD
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#111', margin: '0 0 4px 0' }}>
                {selectedPatient.name} ({selectedPatient.id})
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 25px 0' }}>
                {selectedPatient.diagnosis} • Last active: {selectedPatient.lastSession}
              </p>

              {/* Radar Symmetry Chart & Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '30px', alignItems: 'center' }}>
                <div style={{ height: '260px', backgroundColor: '#F8FAFC', borderRadius: '20px', padding: '15px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textAlign: 'center', marginBottom: '5px' }}>
                    Kinematic Joint Balance Radar
                  </div>
                  <ResponsiveContainer width="100%" height="90%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={selectedPatient.radarData}>
                      <PolarGrid stroke="#E2E6EA" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Symmetry" dataKey="A" stroke="var(--accent-color)" strokeWidth={2} fill="var(--accent-color)" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Weekly Compliance</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>{selectedPatient.weeklyCompliance}%</div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Average Kinematic Form</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-color)', marginTop: '2px' }}>{selectedPatient.avgScore}%</div>
                  </div>
                </div>
              </div>

              {/* Clinician Notes & Protocol */}
              <div style={{ padding: '20px', backgroundColor: 'rgba(100, 114, 217, 0.08)', borderRadius: '16px', border: '1px solid rgba(100, 114, 217, 0.2)', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                  <FileText size={16} /> CLINICAL SUPERVISOR ASSESSMENT
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                  {selectedPatient.notes}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  onClick={() => setSelectedPatient(null)}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#FFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  onClick={() => { alert(`Prescription updated for ${selectedPatient.name}`); setSelectedPatient(null); }}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 800 }}
                >
                  Authorize & Approve Protocol
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DoctorPortal;

