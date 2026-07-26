import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const sendOtp = async (mobileNumber) => {
    try {
      const response = await api.post('/api/auth/send-otp', { mobileNumber });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const verifyOtp = async (mobileNumber, otp) => {
    try {
      const response = await api.post('/api/auth/verify-otp', { mobileNumber, otp });
      const authData = response.data.data; // AuthResponse DTO fields: token, userId, role, name, mobileNumber

      if (authData.role !== 'CUSTOMER') {
        throw new Error('This mobile number is registered as a Salon Owner. Please log into the Admin Panel (port 5174) or use a customer mobile number.');
      }

      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      
      setToken(authData.token);
      setUser(authData);
      return authData;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfileInContext = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        sendOtp,
        verifyOtp,
        logout,
        updateProfileInContext,
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
