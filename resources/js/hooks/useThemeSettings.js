import { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

/**
 * Custom hook to integrate settings with theme system
 */
export const useThemeSettings = () => {
  const { settings, loading } = useSettings();
  const [themeMode, setThemeMode] = useState('light');

  useEffect(() => {
    if (settings?.dark_mode !== undefined) {
      const mode = settings.dark_mode ? 'dark' : 'light';
      setThemeMode(mode);
      
      // Apply theme to document root for global styling
      document.documentElement.setAttribute('data-theme', mode);
      
      // Update body class for additional styling if needed
      document.body.classList.toggle('dark-theme', settings.dark_mode);
      document.body.classList.toggle('light-theme', !settings.dark_mode);
    }
  }, [settings?.dark_mode]);

  return {
    themeMode,
    isDarkMode: settings?.dark_mode || false,
    siteName: settings?.site_name || 'Palets',
    siteDescription: settings?.site_description || 'Art Gallery Management System',
    logo: settings?.logo,
    favicon: settings?.favicon,
    loading
  };
};
