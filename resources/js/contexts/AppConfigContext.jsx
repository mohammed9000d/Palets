import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import configService from '../services/configService';

// Create context
const AppConfigContext = createContext();

// Hook to use the app config context
export const useAppConfig = () => {
    const context = useContext(AppConfigContext);
    if (!context) {
        throw new Error('useAppConfig must be used within an AppConfigProvider');
    }
    return context;
};

// Provider component
export const AppConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeConfig = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const appConfig = await configService.initialize();
                setConfig(appConfig);
                
                console.log('App configuration initialized:', appConfig);
            } catch (err) {
                console.error('Failed to initialize app configuration:', err);
                setError(err.message);
                
                // Set fallback configuration
                setConfig({
                    app_url: window.location.origin,
                    app_name: 'Palets',
                    api_url: window.location.origin + '/api',
                    storage_url: window.location.origin + '/storage'
                });
            } finally {
                setLoading(false);
            }
        };

        initializeConfig();
    }, []);

    // Helper functions
    const getApiUrl = (endpoint = '') => {
        if (!config) return '/api';
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        return cleanEndpoint ? `${config.api_url}/${cleanEndpoint}` : config.api_url;
    };

    const getStorageUrl = (path = '') => {
        if (!config) return '/storage';
        if (!path) return config.storage_url;
        
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${config.storage_url}/${cleanPath}`;
    };

    const getAppUrl = () => {
        return config?.app_url || window.location.origin;
    };

    const getAppName = () => {
        return config?.app_name || 'Palets';
    };

    const value = {
        config,
        loading,
        error,
        isReady: !loading && !error && config,
        
        // Helper functions
        getApiUrl,
        getStorageUrl,
        getAppUrl,
        getAppName,
        
        // Direct access to config service
        configService
    };

    return (
        <AppConfigContext.Provider value={value}>
            {children}
        </AppConfigContext.Provider>
    );
};

AppConfigProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default AppConfigContext;
