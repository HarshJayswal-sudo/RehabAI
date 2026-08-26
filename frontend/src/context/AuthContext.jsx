import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('rehab_ai_token');
    const storedUser = localStorage.getItem('rehab_ai_user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('rehab_ai_token');
        localStorage.removeItem('rehab_ai_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role = 'patient') => {
    try {
      const data = role === 'doctor'
        ? await api.doctorLogin({ email, password })
        : await api.patientLogin({ email, password });
        
      localStorage.setItem('rehab_ai_token', data.access_token);
      
      const userObj = { id: data.user_id, role: data.role || role, name: data.name };
      localStorage.setItem('rehab_ai_user', JSON.stringify(userObj));
      setUser(userObj);
      return { success: true, user: userObj };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password, role = 'patient') => {
    try {
      if (role === 'doctor') {
        await api.doctorRegister({ name, email, password });
      } else {
        await api.patientRegister({ name, email, password });
      }
      // After successful registration, log them in automatically
      return await login(email, password, role);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginAsGuest = () => {
    const guestUser = { id: 'demo', role: 'patient', name: 'Demo Patient' };
    localStorage.setItem('rehab_ai_token', 'demo-token');
    localStorage.setItem('rehab_ai_user', JSON.stringify(guestUser));
    setUser(guestUser);
    return { success: true, user: guestUser };
  };

  const loginAsDoctorGuest = () => {
    const guestDoctor = { id: 'demo-doctor', role: 'doctor', name: 'Dr. Sarah Jenkins' };
    localStorage.setItem('rehab_ai_token', 'demo-doctor-token');
    localStorage.setItem('rehab_ai_user', JSON.stringify(guestDoctor));
    setUser(guestDoctor);
    return { success: true, user: guestDoctor };
  };

  const logout = () => {
    localStorage.removeItem('rehab_ai_token');
    localStorage.removeItem('rehab_ai_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginAsGuest, loginAsDoctorGuest, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
