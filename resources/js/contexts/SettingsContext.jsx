import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_name: 'Palets',
    site_description: 'Art Gallery Management System',
    logo: null,
    favicon: null,
    dark_mode: false,
  });
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/settings');
      if (response.data.success) {
        setSettings(prev => ({
          ...prev,
          ...response.data.data
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      // Don't set error for settings loading failure, just use defaults
      // This ensures the app continues to work even if settings API fails
      console.warn('Using default settings due to API failure');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      
      // Add text fields
      Object.keys(newSettings).forEach(key => {
        if (key !== 'logo' && key !== 'favicon') {
          let value = newSettings[key];
          // Convert boolean to proper format for Laravel
          if (typeof value === 'boolean') {
            value = value ? '1' : '0';
          }
          formData.append(key, value);
        }
      });

      // Add files if they exist
      if (newSettings.logo instanceof File) {
        formData.append('logo', newSettings.logo);
      }
      if (newSettings.favicon instanceof File) {
        formData.append('favicon', newSettings.favicon);
      }

      const response = await api.post('/settings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Update local state with returned data
        setSettings(prev => ({
          ...prev,
          ...response.data.data
        }));
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update settings';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileType) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.delete('/settings/file', {
        data: { key: fileType }
      });

      if (response.data.success) {
        setSettings(prev => ({
          ...prev,
          [fileType]: null
        }));
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to delete file');
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete file';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
    deleteFile,
    setError
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
