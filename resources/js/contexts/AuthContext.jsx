import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import configService from '../services/configService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [configReady, setConfigReady] = useState(false);

  // Initialize config service
  useEffect(() => {
    const initConfig = async () => {
      try {
        await configService.initialize();
        setConfigReady(true);
      } catch (error) {
        console.error('Failed to initialize config in AuthContext:', error);
        setConfigReady(true); // Continue with fallback
      }
    };
    
    initConfig();
  }, []);

  // Helper function to get API URL
  const getApiUrl = (endpoint = '') => {
    if (configService.isInitialized()) {
      return configService.getApiEndpointUrl(endpoint);
    }
    return `/api/${endpoint}`.replace(/\/+/g, '/').replace(/\/$/, '');
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    if (configReady) {
      checkAuthStatus();
    }
  }, [configReady]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('auth/me'), {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // User not authenticated
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, remember = false) => {
    try {
      const response = await axios.post(getApiUrl('auth/login'), {
        email,
        password,
        remember
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Fetch complete user profile data after successful login
        await checkAuthStatus();
        
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(getApiUrl('auth/register'), userData, {
        withCredentials: true
      });

      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.post(getApiUrl('auth/logout'), {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Check if we have a file upload (avatar)
      const hasFileUpload = profileData.avatar && profileData.avatar instanceof File;
      
      if (hasFileUpload) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        Object.keys(profileData).forEach(key => {
          if (key === 'avatar' && profileData[key] instanceof File) {
            formData.append(key, profileData[key]);
          } else if (typeof profileData[key] === 'boolean') {
            formData.append(key, profileData[key] ? '1' : '0');
          } else if (profileData[key] !== null && profileData[key] !== undefined) {
            formData.append(key, profileData[key]);
          }
        });

        const response = await axios.post(getApiUrl('auth/profile'), formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        if (response.data.success) {
          setUser(response.data.user);
          return { success: true, message: response.data.message };
        } else {
          return { success: false, message: response.data.message };
        }
      } else {
        // Use JSON for regular updates (no file upload)
        const jsonData = { ...profileData };
        delete jsonData.avatar; // Remove avatar from JSON data
        
        // Convert boolean values to proper format
        if (typeof jsonData.newsletter_subscription === 'boolean') {
          jsonData.newsletter_subscription = jsonData.newsletter_subscription;
        }
        if (typeof jsonData.sms_notifications === 'boolean') {
          jsonData.sms_notifications = jsonData.sms_notifications;
        }

        const response = await axios.put(getApiUrl('auth/profile'), jsonData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data.success) {
          setUser(response.data.user);
          return { success: true, message: response.data.message };
        } else {
          return { success: false, message: response.data.message };
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed. Please try again.';
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};