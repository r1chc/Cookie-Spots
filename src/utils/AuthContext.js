import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authApi.getCurrentUser();
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error loading user:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError('Session expired. Please log in again.');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.register(userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      
      // Load user data after registration
      const userRes = await authApi.getCurrentUser();
      setUser(userRes.data);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.msg || 'Registration failed. Please try again.';
      setError(errorMessage);
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.login(email, password);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      
      // Load user data after login
      const userRes = await authApi.getCurrentUser();
      setUser(userRes.data);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.msg || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const contextValue = {
    token,
    isAuthenticated,
    loading,
    user,
    error,
    register,
    login,
    logout,
    clearError
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
