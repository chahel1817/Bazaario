import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token: receivedToken, name, role, provider } = response.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify({ email, name, role, provider }));
      
      setToken(receivedToken);
      setUser({ email, name, role, provider });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      const { token: receivedToken, role, provider } = response.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify({ email, name, role, provider }));
      
      setToken(receivedToken);
      setUser({ email, name, role, provider });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Try again.' 
      };
    }
  };

  const loginWithGoogle = async (idToken, email, name, providerId) => {
    try {
      const response = await api.post('/api/auth/google', { idToken, email, name, providerId });
      const { token: receivedToken, email: receivedEmail, name: receivedName, role, provider } = response.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify({ email: receivedEmail || email, name: receivedName, role, provider }));
      
      setToken(receivedToken);
      setUser({ email: receivedEmail || email, name: receivedName, role, provider });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Google authentication failed.' 
      };
    }
  };

  const sendOtp = async () => {
    try {
      const response = await api.post('/api/auth/send-otp');
      return { success: true, otp: response.data.otp, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP.'
      };
    }
  };

  const setPassword = async (password, otp) => {
    try {
      const response = await api.post('/api/auth/set-password', { password, otp });
      const { token: receivedToken, email, name, role, provider } = response.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify({ email, name, role, provider }));
      
      setToken(receivedToken);
      setUser({ email, name, role, provider });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to set password.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout, isAdmin, sendOtp, setPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
