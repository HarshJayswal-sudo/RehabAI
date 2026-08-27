import React from 'react';
import { motion } from 'framer-motion';
import heroImg from '../assets/images/hero.jpg';
import aboutImg from '../assets/images/about-page-pic.png';
import bgLeft from '../assets/images/background-left.png';
import bgRight from '../assets/images/background-right.png';
import iconImg from '../assets/images/icon.png';
import s1 from '../assets/images/services/services-1.png';
import s2 from '../assets/images/services/services-2.png';
import s3 from '../assets/images/services/services-3.png';
import s4 from '../assets/images/services/services-4.png';
import s5 from '../assets/images/services/services-5.png';

const Landing = ({ onStart }) => {
  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* 1. HERO SECTION */}
      <section style={{ 
        height: '100vh', 
        width: '100%', 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8%',
        backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%), url(" + heroImg + ")",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ maxWidth: '650px', color: '#FFF' }}>
          <div>
             <motion.p 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               style={{ letterSpacing: '6px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '25px', color: '#FFF', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
             >
               WELCOME TO PhysioAssist
             </motion.p>
             
             <motion.h1 
               variants={{
                 hidden: { opacity: 0 },
                 visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
               }}
               initial="hidden"
               animate="visible"
               style={{ fontSize: '85px', fontWeight: 900, lineHeight: 1.05, marginBottom: '40px', fontFamily: 'var(--font-heading)', color: '#FFF', textShadow: '0 5px 30px rgba(0,0,0,0.5)', letterSpacing: '-1.5px', maxWidth: '800px' }}
             >
               {"What hurts today makes you stronger tomorrow".split(' ').map((word, index) => (
                 <motion.span 
                   key={index} 
                   variants={{
                     hidden: { opacity: 0, y: 50, rotateX: 45, filter: 'blur(10px)' },
                     visible: { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', transition: { type: "spring", damping: 15, stiffness: 150 } }
                   }}
                   style={{ display: 'inline-block', marginRight: '20px', perspective: '1000px' }}
                 >
                   {word}
                 </motion.span>
               ))}
             </motion.h1>
             
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 1.2, type: "spring" }}
             >
               <motion.button 
                 whileHover={{ scale: 1.05, backgroundColor: '#4C58B3' }}
                 whileTap={{ scale: 0.95 }}
                 className="btn btn-primary" 
                 style={{ padding: '18px 45px', fontSize: '15px', fontWeight: 800, letterSpacing: '1px', borderRadius: '50px', boxShadow: '0 15px 40px rgba(100,114,217,0.5)', transition: 'background-color 0.3s' }} 
                 onClick={onStart}
               >
                 DISCOVER MORE
               </motion.button>
             </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID (Enjoy All Aspects) */}
      {/* 2. SERVICES / FEATURES */}
      <section style={{ padding: '100px 0', textAlign: 'center', position: 'relative', backgroundColor: '#FFFFFF' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '300px', backgroundImage: "url(" + bgLeft + ")", backgroundRepeat: 'no-repeat', backgroundPosition: 'left center', opacity: 0.7, zIndex: 0 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '300px', backgroundImage: "url(" + bgRight + ")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', opacity: 0.7, zIndex: 0 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '60px' }}>
             <img src={iconImg} alt="Icon" style={{ height: '40px', marginBottom: '20px' }} />
             <h2 className="section-title" style={{ margin: 0 }}>Enjoy All Aspects Of AI Training</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
            {[
              { icon: s1, title: 'Live Tracking', desc: 'Real-time pose estimation and tracking.' },
              { icon: s2, title: 'Form Correction', desc: 'Instant feedback to prevent injury.' },
              { icon: s3, title: 'Analytics', desc: 'Deep insights into your progress.' },
              { icon: s4, title: 'Recovery', desc: 'Tailored plans for safe rehab.' },
              { icon: s5, title: 'Wellness', desc: 'Holistic approach to body strength.' }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(100,114,217,0.15)' }}
                style={{ 
                  backgroundColor: '#FFF', 
                  padding: '40px 20px', 
                  borderRadius: '20px', 
                  boxShadow: '0 10px 30px rgba(100,114,217,0.08)', 
                  border: '1px solid rgba(100,114,217,0.1)',
                  position: 'relative', 
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <img src={feature.icon} alt={feature.title} style={{ height: '60px', marginBottom: '25px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '15px' }}>{feature.title}</h4>
                <p className="text-muted" style={{ fontSize: '12px', lineHeight: 1.6, margin: 0 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2.5 HOW IT WORKS (PhysioAssist Specific Briefing) */}
      <section style={{ 
        padding: '120px 0', 
        position: 'relative', 
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F7FC 50%, #FFFFFF 100%)',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Subtle Background Pattern & Orbs */}
        <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.3, zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(100,114,217,0.15) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '70px' }}>
             <h2 style={{ margin: '0 0 15px 0', fontSize: '42px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>How PhysioAssist Works</h2>
             <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '16px', lineHeight: 1.8, color: '#64748B' }}>
               Our advanced computer vision models analyze your movements in real-time through your device's camera. No sensors required. Just you and the AI.
             </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', position: 'relative' }}>
            
            {/* Connecting Line behind cards (visible on desktop) */}
            <div style={{ position: 'absolute', top: '80px', left: '15%', right: '15%', height: '2px', background: 'linear-gradient(90deg, rgba(100,114,217,0) 0%, rgba(100,114,217,0.2) 50%, rgba(100,114,217,0) 100%)', zIndex: 0 }} />

            {[
              { step: '01', title: 'Start Your Camera', desc: 'Securely connect your webcam or mobile camera. Video is processed locally on your device for total privacy.', color: '#6472D9' },
              { step: '02', title: 'Perform Exercises', desc: 'Follow the guided sessions. The AI maps 33 joints on your body at 30 frames per second.', color: '#10B981' },
              { step: '03', title: 'Live Form Correction', desc: 'Receive instant visual and audio feedback if your form deviates, preventing injury and maximizing recovery.', color: '#F59E0B' }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ delay: i * 0.2, duration: 0.7, type: 'spring' }}
                whileHover={{ y: -15, boxShadow: `0 25px 50px ${item.color}20` }}
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  backdropFilter: 'blur(20px)',
                  padding: '50px 40px', 
                  borderRadius: '24px', 
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,1)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {/* Massive Watermark Number */}
                <div style={{ fontSize: '140px', fontWeight: 900, color: `${item.color}15`, position: 'absolute', top: '5%', right: '5%', lineHeight: 1, zIndex: 0, pointerEvents: 'none', transform: 'rotate(-5deg)' }}>
                  {item.step}
                </div>
                
                {/* Glowing Number Badge */}
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}ee 100%)`, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800, marginBottom: '35px', boxShadow: `0 10px 25px ${item.color}50`, position: 'relative', zIndex: 1 }}>
                  {i + 1}
                </div>
                
                <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#111', marginBottom: '15px', position: 'relative', zIndex: 1 }}>{item.title}</h4>
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#64748B', position: 'relative', zIndex: 1, margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHAT WE DO (Progress Bars & Image) */}
      <section style={{ 
        padding: '120px 0', 
        position: 'relative',
        backgroundColor: '#FFF',
        overflow: 'hidden'
      }}>
        {/* Flawless Floral Background behind image */}
        <div style={{ position: 'absolute', left: '-5%', top: '-15%', width: '800px', height: '800px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.7, zIndex: 0 }} />
        <div style={{ position: 'absolute', right: '-5%', bottom: '-10%', width: '600px', height: '600px', backgroundImage: `url(${bgRight})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.6, zIndex: 0 }} />
        
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '80px', position: 'relative', zIndex: 1 }}>
          
          {/* Left: Transparent Image */}
          <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
            <img src={aboutImg} alt="Yoga Pose" style={{ width: '100%', maxWidth: '500px', height: 'auto', display: 'block', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))', position: 'relative', zIndex: 2 }} />
          </div>

          {/* Right: Text and Progress Bars */}
          <div style={{ flex: 1, paddingLeft: '20px', position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: '15px' }}>
                <img src={iconImg} alt="Lotus Icon" style={{ width: '30px' }} />
            </div>
            <h2 className="text-heading" style={{ color: '#111', fontSize: '36px' }}>What We Do</h2>
            <p className="text-muted" style={{ marginBottom: '40px', fontSize: '15px', lineHeight: 1.8 }}>
              To be invited to the nearest AI tracking center and get free physical advice to learn more about our program. We offer precise form correction and digital rehab.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
               {[
                 { label: 'Form Accuracy', pct: '94%' },
                 { label: 'Joint Tracking', pct: '82%' },
                 { label: 'Symmetry', pct: '99%' }
               ].map((stat, i) => (
                 <div key={i}>
                   <div className="flex-between" style={{ marginBottom: '12px' }}>
                     <span style={{ fontWeight: 700, fontSize: '14px', color: '#333' }}>{stat.label}</span>
                     <span style={{ fontWeight: 700, fontSize: '13px', color: '#FFF', backgroundColor: 'var(--accent-color)', padding: '3px 12px', borderRadius: '20px' }}>{stat.pct}</span>
                   </div>
                   <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E6EA', borderRadius: '3px', overflow: 'hidden' }}>
                     <motion.div 
                       style={{ width: stat.pct, height: '100%', backgroundColor: 'var(--accent-color)' }} 
                       initial={{ width: 0 }}
                       whileInView={{ width: stat.pct }}
                       viewport={{ once: true }}
                       transition={{ duration: 1, delay: 0.2 }}
                     />
                   </div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Landing;
