import React from 'react';
import iconImg from '../../assets/images/icon.png';
import bgLeft from '../../assets/images/background-left.png';
import bgRight from '../../assets/images/background-right.png';

const Footer = () => {
  return (
    <footer style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#F8F9FA', color: '#111', padding: '80px 0 40px', borderTop: '1px solid rgba(100,114,217,0.1)', fontFamily: 'var(--font-body)' }}>
      
      {/* Premium Texture Layers */}
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.4, zIndex: 0 }} />
      <div style={{ position: 'absolute', left: '-10%', top: 0, bottom: 0, width: '500px', backgroundImage: `url(${bgLeft})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.2, zIndex: 0, filter: 'blur(1px)' }} />
      <div style={{ position: 'absolute', right: '-5%', bottom: '-20%', width: '400px', height: '400px', backgroundImage: `url(${bgRight})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', opacity: 0.2, zIndex: 0 }} />
      
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '50px', paddingBottom: '60px', borderBottom: '1px solid rgba(100,114,217,0.1)' }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <img src={iconImg} alt="PhysioAssist Logo" style={{ height: '32px' }} />
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#111', letterSpacing: '-0.5px' }}>PhysioAssist</h2>
            </div>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.8, marginBottom: '20px', maxWidth: '300px' }}>
              Advanced computer vision and precise AI tracking for your optimal physical rehabilitation and wellness journey.
            </p>
            <div style={{ color: '#666', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span>Available 24/7 Globally</span>
              <span>support@PhysioAssist.com</span>
            </div>
          </div>
          
          {/* Links 1 */}
          <div>
            <h4 style={{ color: '#111', fontSize: '16px', fontWeight: 700, marginBottom: '25px', letterSpacing: '0.5px' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {['Live Pose Tracking', 'Form Correction', 'Progress Analytics', 'Recovery Plans'].map((link, i) => (
                <li key={i}>
                  <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-color)'} onMouseOut={(e) => e.target.style.color = '#666'}>{link}</a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Links 2 */}
          <div>
            <h4 style={{ color: '#111', fontSize: '16px', fontWeight: 700, marginBottom: '25px', letterSpacing: '0.5px' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {['Our Vision', 'Meet The Team', 'Careers', 'Contact Support'].map((link, i) => (
                <li key={i}>
                  <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-color)'} onMouseOut={(e) => e.target.style.color = '#666'}>{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ color: '#111', fontSize: '16px', fontWeight: 700, marginBottom: '25px', letterSpacing: '0.5px' }}>Stay Updated</h4>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>Join our newsletter for the latest updates on AI rehab technology.</p>
            <div style={{ display: 'flex', backgroundColor: '#FFF', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E6EA', boxShadow: '0 5px 15px rgba(100,114,217,0.05)' }}>
              <input type="email" placeholder="Your email address" style={{ flex: 1, backgroundColor: 'transparent', border: 'none', padding: '12px 15px', color: '#111', fontSize: '13px', outline: 'none' }} />
              <button style={{ backgroundColor: 'var(--accent-color)', color: '#FFF', border: 'none', padding: '0 20px', cursor: 'pointer', transition: 'background 0.3s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#5262c7'} onMouseOut={(e) => e.target.style.backgroundColor = 'var(--accent-color)'}>
                Subscribe
              </button>
            </div>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '30px' }}>
          <div style={{ color: '#888', fontSize: '13px' }}>
            &copy; 2026 PhysioAssist Technologies. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '25px' }}>
             <a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-color)'} onMouseOut={(e) => e.target.style.color = '#888'}>Privacy Policy</a>
             <a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-color)'} onMouseOut={(e) => e.target.style.color = '#888'}>Terms of Service</a>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
