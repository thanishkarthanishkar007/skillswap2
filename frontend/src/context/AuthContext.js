import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { mockLogin, mockRegister, mockGetMe, isMockMode } from '../utils/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('ss_token');
    if (!token) { setLoading(false); return; }

    // Mock mode: load user from localStorage directly
    if (isMockMode()) {
      try {
        const u = mockGetMe(token);
        if (u) { setUser(u); } else { localStorage.removeItem('ss_token'); }
      } catch { localStorage.removeItem('ss_token'); }
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('ss_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    if (isMockMode()) {
      const data = mockLogin(email, password);
      localStorage.setItem('ss_token', data.token);
      localStorage.setItem('ss_user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    }
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('ss_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Cannot connect to server. Please check backend is running.';
      throw { response: { data: { message: msg } } };
    }
  };

  const register = async (formData) => {
    if (isMockMode()) {
      const data = mockRegister(formData);
      localStorage.setItem('ss_token', data.token);
      localStorage.setItem('ss_user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    }
    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('ss_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      // Provide clear, specific error messages
      if (!err.response) {
        throw { response: { data: { message: '❌ Cannot connect to backend server. Make sure:\n1. Backend is running: cd backend && npm run dev\n2. MongoDB is connected\n3. .env file has MONGODB_URI and JWT_SECRET\n\nOr set REACT_APP_MOCK_MODE=true in .env to use demo mode.' } } };
      }
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && serverErrors.length > 0) {
        throw { response: { data: { message: serverErrors.map(e => e.msg).join(', ') } } };
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    if (isMockMode()) localStorage.setItem('ss_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
