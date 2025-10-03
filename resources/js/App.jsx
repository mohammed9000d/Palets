import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';
import ThemeCustomization from 'themes';
import LoadingScreen from 'components/LoadingScreen';
import FaviconUpdater from 'components/FaviconUpdater';
import configService from 'services/configService';
import { LoadingProvider } from 'contexts/LoadingContext';
import { SettingsProvider } from 'contexts/SettingsContext';
import { AdminAuthProvider } from 'contexts/AdminAuthContext';

// ==============================|| APP ||============================== //

export default function App() {
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app configuration...');
        await configService.initialize();
        console.log('App configuration loaded successfully');
        setConfigLoading(false);
      } catch (error) {
        console.error('Failed to initialize app configuration:', error);
        setConfigError(error.message);
        setConfigLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (configLoading) {
    return (
      <LoadingProvider>
        <AdminAuthProvider>
          <SettingsProvider>
            <ThemeCustomization>
              <LoadingScreen message="Initializing application..." />
            </ThemeCustomization>
          </SettingsProvider>
        </AdminAuthProvider>
      </LoadingProvider>
    );
  }

  if (configError) {
    return (
      <LoadingProvider>
        <AdminAuthProvider>
          <SettingsProvider>
            <ThemeCustomization>
              <LoadingScreen message={`Configuration Error: ${configError}`} />
            </ThemeCustomization>
          </SettingsProvider>
        </AdminAuthProvider>
      </LoadingProvider>
    );
  }

  return (
    <LoadingProvider>
      <AdminAuthProvider>
        <SettingsProvider>
          <ThemeCustomization>
            <FaviconUpdater />
          <NavigationScroll>
            <RouterProvider router={router} />
          </NavigationScroll>
          </ThemeCustomization>
        </SettingsProvider>
      </AdminAuthProvider>
    </LoadingProvider>
  );
}
