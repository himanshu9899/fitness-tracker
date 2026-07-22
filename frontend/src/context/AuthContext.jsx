import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Saved accounts on device
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('savedAccounts');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Prompt modal state for saving account after fresh login
  const [pendingSaveAccount, setPendingSaveAccount] = useState(null);

  // Load active user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await api.get('users/me/');
          setUser(res.data);
          localStorage.setItem('activeUserId', String(res.data.id));
        } catch (err) {
          console.error('Failed to load user session', err);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('activeUserId');
          setUser(null);
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
      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Fetch user profile info
      const userRes = await api.get('users/me/');
      const userData = userRes.data;
      
      setUser(userData);
      localStorage.setItem('activeUserId', String(userData.id));

      // Check if user is already in savedAccounts
      const isAlreadySaved = savedAccounts.some((acc) => String(acc.id) === String(userData.id));
      if (isAlreadySaved) {
        // Update stored tokens for this saved account
        const updated = savedAccounts.map((acc) => {
          if (String(acc.id) === String(userData.id)) {
            return {
              ...acc,
              username: userData.username,
              email: userData.email,
              accessToken,
              refreshToken,
              lastUsed: new Date().toISOString(),
            };
          }
          return acc;
        });
        setSavedAccounts(updated);
        localStorage.setItem('savedAccounts', JSON.stringify(updated));
      } else {
        // Trigger "Save account on device?" modal prompt
        setPendingSaveAccount({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          accessToken,
          refreshToken,
          lastUsed: new Date().toISOString(),
        });
      }

      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
      return false;
    }
  };

  const confirmSaveAccount = () => {
    if (!pendingSaveAccount) return;
    const updated = [
      ...savedAccounts.filter((acc) => String(acc.id) !== String(pendingSaveAccount.id)),
      pendingSaveAccount,
    ];
    setSavedAccounts(updated);
    localStorage.setItem('savedAccounts', JSON.stringify(updated));
    setPendingSaveAccount(null);
  };

  const declineSaveAccount = () => {
    setPendingSaveAccount(null);
  };

  const removeSavedAccount = (userId) => {
    const updated = savedAccounts.filter((acc) => String(acc.id) !== String(userId));
    setSavedAccounts(updated);
    localStorage.setItem('savedAccounts', JSON.stringify(updated));
  };

  const switchAccount = async (targetAccount) => {
    // Completely clear existing active user state to enforce data isolation
    setUser(null);
    setError(null);

    localStorage.setItem('accessToken', targetAccount.accessToken);
    localStorage.setItem('refreshToken', targetAccount.refreshToken);
    localStorage.setItem('activeUserId', String(targetAccount.id));

    try {
      // Validate token with backend me endpoint
      const res = await api.get('users/me/');
      setUser(res.data);

      // Update lastUsed timestamp in saved accounts
      const updated = savedAccounts.map((acc) => {
        if (String(acc.id) === String(targetAccount.id)) {
          return { ...acc, lastUsed: new Date().toISOString() };
        }
        return acc;
      });
      setSavedAccounts(updated);
      localStorage.setItem('savedAccounts', JSON.stringify(updated));
      return true;
    } catch (err) {
      console.error('Failed to switch to saved account directly', err);
      // Clean up active session pointers so UI knows it's unauthenticated
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('activeUserId');
      setUser(null);
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
    // Logout only clears current active tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('activeUserId');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('users/profile/', profileData);
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
      setUser((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          weight: parseFloat(weight),
        },
      }));
      return true;
    } catch (err) {
      console.error('Failed to log weight', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        savedAccounts,
        pendingSaveAccount,
        confirmSaveAccount,
        declineSaveAccount,
        removeSavedAccount,
        switchAccount,
        login,
        register,
        logout,
        updateProfile,
        logWeight,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
