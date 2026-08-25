import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Info, CheckCircle2, AlertTriangle, Video, Sparkles, X, ChevronRight, Activity } from 'lucide-react';
import { EXERCISES } from '../data/exercises';
import bgLeft from '../assets/images/background-left.png';
import bgRight from '../assets/images/background-right.png';

const CATEGORIES = ['All', 'Lower Body', 'Upper Body', 'Core & Mobility', 'Post-Surgery Rehab'];

const Exercises = ({ onSelectExercise }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalExercise, setActiveModalExercise] = useState(null);

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.targetMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#F8F9FA', paddingTop: '130px', paddingBottom: '80px', overflowX: 'hidden' }}>
      
      {/* Background Ambience */}
      <div style={{ position: 'absolute', left: '-5%', top: '10%', width: '400px', height: '600px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.35, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', right: '-5%', bottom: '5%', width: '400px', height: '500px', backgroundImage: `url(${bgRight})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '40px' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--accent-light)', padding: '6px 16px', borderRadius: '50px', color: 'var(--accent-color)', fontWeight: 700, fontSize: '13px', marginBottom: '15px' }}>
            <Sparkles size={16} /> CLINICAL EXERCISE LIBRARY
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: 900, color: '#111', margin: '0 0 12px 0', letterSpacing: '-1px' }}>
            Rehabilitation Movements
          </h1>
          <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '700px', margin: 0, lineHeight: 1.6 }}>
            Select an AI-guided exercise below. Each movement uses real-time joint-angle kinematics and computer vision to ensure optimal recovery and form.
          </p>
        </motion.div>

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
          
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '50px',
                    border: isSelected ? '1px solid var(--accent-color)' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? 'var(--accent-color)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 8px 20px rgba(100,114,217,0.25)' : 'none'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
            <input
              type="text"
              placeholder="Search exercises, muscles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 46px',
                borderRadius: '50px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent-color)'; e.target.style.boxShadow = '0 0 0 3px rgba(100,114,217,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)'; }}
            />
          </div>
        </div>

        {/* Exercises Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
          {filteredExercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(100,114,217,0.12)' }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid rgba(100,114,217,0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Exercise Thumbnail & Badges */}
              <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                <img 
                  src={exercise.image} 
                  alt={exercise.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
                
                {/* Category & Difficulty Badges */}
                <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', color: '#111', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                    {exercise.category}
                  </span>
                  <span style={{ 
                    backgroundColor: exercise.difficulty === 'Beginner' ? '#10B981' : '#F59E0B', 
                    color: '#FFF', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px' 
                  }}>
                    {exercise.difficulty}
                  </span>
                </div>

                <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: '#FFF' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>Ideal Target Angle</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#38BDF8' }}>{exercise.idealAngle}</div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                    ⏱️ {exercise.duration}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: '0 0 10px 0' }}>
                  {exercise.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, margin: '0 0 20px 0', flex: 1 }}>
                  {exercise.description}
                </p>

                {/* Target Muscle Pills */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Target Muscles
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {exercise.targetMuscles.map((muscle, idx) => (
                      <span key={idx} style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px' }}>
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setActiveModalExercise(exercise)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#E2E8F0'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                  >
                    <Info size={16} /> Guide
                  </button>

                  <button
                    onClick={() => onSelectExercise(exercise)}
                    className="btn btn-primary"
                    style={{
                      flex: 2,
                      padding: '12px 18px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 800,
                      boxShadow: '0 6px 20px rgba(100,114,217,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Play size={16} fill="currentColor" /> Start Workout
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {activeModalExercise && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalExercise(null)}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                backgroundColor: '#FFFFFF',
                borderRadius: '28px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                overflowY: 'auto',
                padding: '40px'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalExercise(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', backgroundColor: '#F1F5F9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-color)', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                <Activity size={18} /> {activeModalExercise.category.toUpperCase()}
              </div>

              <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#111', margin: '0 0 15px 0' }}>
                {activeModalExercise.name}
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6, marginBottom: '30px' }}>
                {activeModalExercise.description}
              </p>

              {/* Angle & Specs Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', marginBottom: '30px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Target Joint</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#111', marginTop: '2px' }}>{activeModalExercise.primaryJoint}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Required Flexion</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-color)', marginTop: '2px' }}>{activeModalExercise.idealAngle}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Difficulty</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>{activeModalExercise.difficulty}</div>
                </div>
              </div>

              {/* Instructions */}
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#111', marginBottom: '15px' }}>
                  Step-by-Step Instructions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeModalExercise.instructions.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>
                        {idx + 1}
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Tips & Camera Guidance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '35px' }}>
                <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                    <CheckCircle2 size={16} /> KEY FORM CUES
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#065F46', lineHeight: 1.6 }}>
                    {activeModalExercise.formTips.map((tip, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '16px', backgroundColor: 'rgba(100, 114, 217, 0.08)', borderRadius: '16px', border: '1px solid rgba(100, 114, 217, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                    <Video size={16} /> CAMERA SETUP
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
                    {activeModalExercise.cameraGuide}
                  </p>
                </div>
              </div>

              {/* Launch CTA */}
              <button
                onClick={() => {
                  const ex = activeModalExercise;
                  setActiveModalExercise(null);
                  onSelectExercise(ex);
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <Play size={18} fill="currentColor" /> Launch AI Workout Session <ChevronRight size={18} />
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Exercises;

