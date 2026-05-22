import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Create an axios instance with proper base configurations
export const api = axios.create({
  baseURL: '', // Using Vite proxy configured in vite.config.js for dev
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Set auth header whenever token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/api/auth/profile');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user profile', err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // Register user
  const register = async (name, email, password, profileImage = '') => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { name, email, password, profileImage });
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        profileImage: res.data.profileImage,
        income: res.data.income,
      });
      setToken(res.data.token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        profileImage: res.data.profileImage,
        income: res.data.income,
      });
      setToken(res.data.token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
  };

  // Update Monthly Income
  const updateIncome = async (newIncome) => {
    try {
      const res = await api.put('/api/auth/income', { income: Number(newIncome) });
      setUser(prev => ({ ...prev, income: res.data.income }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to update income.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        updateIncome,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
