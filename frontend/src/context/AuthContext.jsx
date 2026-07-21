import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user info if tokens exist on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await api.get('users/me/');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user session', err);
          // Interceptors will handle clearing token if it's completely invalid
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const res = await api.post('users/token/', { username, password });
      localStorage.setItem('accessToken', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);
      
      // Fetch user profile info
      const userRes = await api.get('users/me/');
      setUser(userRes.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
      return false;
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      await api.post('users/register/', { username, email, password });
      // Log in automatically after registration
      return await login(username, password);
    } catch (err) {
      const errData = err.response?.data;
      let errMsg = 'Registration failed. Please try again.';
      if (errData) {
        if (typeof errData === 'object') {
          errMsg = Object.entries(errData)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
            .join(' | ');
        } else {
          errMsg = errData;
        }
      }
      setError(errMsg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('users/profile/', profileData);
      // Update state with new profile details
      setUser((prev) => ({
        ...prev,
        profile: res.data,
      }));
      return true;
    } catch (err) {
      console.error('Failed to update profile', err);
      return false;
    }
  };

  const logWeight = async (weight, date) => {
    try {
      await api.post('users/weight/', { weight, date });
      // Update local profile weight
      setUser((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          weight: parseFloat(weight)
        }
      }));
      return true;
    } catch (err) {
      console.error('Failed to log weight', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile, logWeight }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
