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

  const login = async (email, password) => {
    try {
      const data = await api.patientLogin({ email, password });
      localStorage.setItem('rehab_ai_token', data.access_token);
      
      const userObj = { id: data.user_id, role: data.role, name: data.name };
      localStorage.setItem('rehab_ai_user', JSON.stringify(userObj));
      setUser(userObj);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.patientRegister({ name, email, password });
      // After successful registration, log them in automatically
      return await login(email, password);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginAsGuest = () => {
    const guestUser = { id: 'demo', role: 'patient', name: 'Demo User' };
    localStorage.setItem('rehab_ai_token', 'demo-token');
    localStorage.setItem('rehab_ai_user', JSON.stringify(guestUser));
    setUser(guestUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('rehab_ai_token');
    localStorage.removeItem('rehab_ai_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginAsGuest, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
