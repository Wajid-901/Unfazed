import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('unfazed_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('unfazed_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('unfazed_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
        setUser(null);
        setToken(null);
        localStorage.removeItem('unfazed_token');
        localStorage.removeItem('unfazed_user');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password, isClient = false) => {
    const endpoint = isClient ? '/auth/client/login' : '/auth/login';
    const { data } = await api.post(endpoint, { email, password });

    if (data.success) {
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('unfazed_token', data.accessToken);
      localStorage.setItem('unfazed_user', JSON.stringify(data.user));
      return data;
    }
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.success) {
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('unfazed_token', data.accessToken);
      localStorage.setItem('unfazed_user', JSON.stringify(data.user));
      return data;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('unfazed_token');
      localStorage.removeItem('unfazed_user');
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('unfazed_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isTherapist: user?.role === 'THERAPIST',
        isClient: user?.role === 'CLIENT',
        loading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
