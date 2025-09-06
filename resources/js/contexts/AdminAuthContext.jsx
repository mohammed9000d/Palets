import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_BASE_URL = '/api';

  // Check if admin is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      // Try to get admin info using stored token
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      
      if (!token || !adminData) {
        setAdmin(null);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Parse stored admin data
        const parsedAdminData = JSON.parse(adminData);
        setAdmin(parsedAdminData);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoginLoading(true);
      const response = await axios.post(`${API_BASE_URL}/admin/login`, {
        email,
        password
      });

      if (response.data.token) {
        // Store the token and admin data
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.user));
        
        // Set admin data
        setAdmin(response.data.user);
        setIsAuthenticated(true);
        
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Remove token and admin data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      // Clear admin state
      setAdmin(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server request fails
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      setAdmin(null);
      setIsAuthenticated(false);
      return { success: false, message: 'Logout failed' };
    }
  };

  const value = {
    admin,
    loading,
    loginLoading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
