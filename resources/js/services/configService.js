/**
 * Configuration Service
 * Fetches dynamic configuration from the Laravel backend
 */

class ConfigService {
    constructor() {
        this.config = null;
        this.loading = false;
        this.initialized = false;
    }

    /**
     * Initialize configuration by fetching from API
     */
    async initialize() {
        if (this.initialized) {
            return this.config;
        }
        
        if (this.loading) {
            // Wait for existing initialization to complete
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this.loading) {
                        clearInterval(checkInterval);
                        resolve(this.config);
                    }
                }, 50);
            });
        }

        this.loading = true;
        
        try {
            // Use relative URL to fetch config from current domain
            const response = await fetch('/api/config', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch config: ${response.status}`);
            }

            this.config = await response.json();
            this.initialized = true;
            
            console.log('Configuration loaded:', this.config);
            
            return this.config;
        } catch (error) {
            console.error('Failed to load configuration:', error);
            
            // Fallback configuration for development
            this.config = {
                app_url: window.location.origin,
                app_name: 'Palets',
                api_url: window.location.origin + '/api',
                storage_url: window.location.origin + '/storage'
            };
            
            this.initialized = true;
            return this.config;
        } finally {
            this.loading = false;
        }
    }

    /**
     * Get configuration value
     */
    get(key, defaultValue = null) {
        if (!this.config) {
            console.warn('Configuration not initialized. Call initialize() first.');
            return defaultValue;
        }
        
        return this.config[key] || defaultValue;
    }

    /**
     * Get all configuration
     */
    getAll() {
        return this.config;
    }

    /**
     * Check if configuration is loaded
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Get API base URL
     */
    getApiUrl() {
        return this.get('api_url', '/api');
    }

    /**
     * Get storage base URL
     */
    getStorageUrl() {
        return this.get('storage_url', '/storage');
    }

    /**
     * Get app URL
     */
    getAppUrl() {
        return this.get('app_url', window.location.origin);
    }

    /**
     * Get app name
     */
    getAppName() {
        return this.get('app_name', 'Palets');
    }

    /**
     * Build full storage URL for a given path
     */
    getStorageFileUrl(path) {
        if (!path) return null;
        
        const storageUrl = this.getStorageUrl();
        
        // Remove leading slash from path if present
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        
        return `${storageUrl}/${cleanPath}`;
    }

    /**
     * Build full API URL for a given endpoint
     */
    getApiEndpointUrl(endpoint) {
        const apiUrl = this.getApiUrl();
        
        // Remove leading slash from endpoint if present
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        
        return `${apiUrl}/${cleanEndpoint}`;
    }
}

// Create singleton instance
const configService = new ConfigService();

export default configService;
