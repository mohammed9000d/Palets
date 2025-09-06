import axios from 'axios';
import configService from './configService';

// Dynamic API base URL - will be set after config is loaded
let API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Function to update API base URL when config is loaded
export const updateApiBaseUrl = (newBaseUrl) => {
  API_BASE_URL = newBaseUrl;
  api.defaults.baseURL = newBaseUrl;
  console.log('API base URL updated to:', newBaseUrl);
};

// Initialize API base URL from config service if available
const initializeApiUrl = async () => {
  try {
    if (configService.isInitialized()) {
      const apiUrl = configService.getApiUrl();
      updateApiBaseUrl(apiUrl);
    } else {
      // Wait for config to be initialized
      const config = await configService.initialize();
      updateApiBaseUrl(config.api_url);
    }
  } catch (error) {
    console.warn('Failed to initialize API URL from config, using default:', error);
  }
};

// Initialize on module load
initializeApiUrl();

// Add request interceptor to include admin token for admin routes
api.interceptors.request.use(
  (config) => {
    // Check if this is an admin route (not public routes)
    const isAdminRoute = !config.url.startsWith('/public/') && 
                        !config.url.includes('/admin/login') && 
                        !config.url.includes('/admin/logout') &&
                        !config.url.includes('/auth/');
    
    if (isAdminRoute) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, clear admin data and redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      // Only redirect if we're on an admin page
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Admin API endpoints
export const adminAPI = {
  // Get all admins
  getAll: () => api.get('/admins'),
  
  // Get single admin
  getById: (id) => api.get(`/admins/${id}`),
  
  // Create new admin
  create: (data) => api.post('/admins', data),
  
  // Update admin
  update: (id, data) => api.put(`/admins/${id}`, data),
  
  // Delete admin
  delete: (id) => api.delete(`/admins/${id}`),
};

// Users API endpoints
export const usersAPI = {
  // Get all users
  getAll: () => api.get('/users'),
  
  // Get single user
  getById: (id) => api.get(`/users/${id}`),
  
  // Create new user
  create: (data) => api.post('/users', data),
  
  // Update user
  update: (id, data) => api.put(`/users/${id}`, data),
  
  // Delete user
  delete: (id) => api.delete(`/users/${id}`),
};

// Artists API endpoints
export const artistsAPI = {
  // Get all artists
  getAll: (params = {}) => api.get('/artists', { params }),
  
  // Get single artist by slug
  getBySlug: (slug) => api.get(`/artists/${slug}`),
  
  // Create new artist
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'avatar' && data[key]) {
        formData.append('avatar', data[key]);
      } else if (key === 'gallery_images' && data[key]) {
        data[key].forEach(file => formData.append('gallery_images[]', file));
      } else if (key === 'social_links') {
        // Always send social_links, even if empty object
        const socialLinks = data[key] || {};
        formData.append('social_links', JSON.stringify(socialLinks));
      } else if (key === 'is_active') {
        formData.append('is_active', data[key] ? '1' : '0');
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return api.post('/artists', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Update artist
  update: (slug, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'avatar' && data[key]) {
        formData.append('avatar', data[key]);
      } else if (key === 'gallery_images' && data[key]) {
        data[key].forEach(file => formData.append('gallery_images[]', file));
      } else if (key === 'social_links') {
        // Always send social_links, even if empty object
        const socialLinks = data[key] || {};
        formData.append('social_links', JSON.stringify(socialLinks));
      } else if (key === 'is_active') {
        formData.append('is_active', data[key] ? '1' : '0');
      } else if (key === 'remove_avatar') {
        formData.append(key, data[key] ? '1' : '0');
      } else if (key === 'existing_gallery_ids') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    formData.append('_method', 'PUT');
    return api.post(`/artists/${slug}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete artist
  delete: (slug) => api.delete(`/artists/${slug}`),
  
  // Get artist's works
  getWorks: (slug, params = {}) => api.get(`/artists/${slug}/works`, { params }),
};

// Artist Works API endpoints
export const artworksAPI = {
  // Get all artworks
  getAll: (params = {}) => api.get('/artist-works', { params }),
  
  // Get single artwork by slug
  getBySlug: (slug) => api.get(`/artist-works/${slug}`),
  
  // Create new artwork
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'cover_image' && data[key]) {
        formData.append('cover_image', data[key]);
      } else if (key === 'images' && data[key]) {
        data[key].forEach(file => formData.append('images[]', file));
      } else if (key === 'tags' && data[key]) {
        formData.append('tags', JSON.stringify(data[key]));
      } else if (key === 'is_for_sale' || key === 'is_featured') {
        formData.append(key, data[key] ? '1' : '0');
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return api.post('/artist-works', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Update artwork
  update: (slug, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'cover_image' && data[key]) {
        formData.append('cover_image', data[key]);
      } else if (key === 'images' && data[key]) {
        data[key].forEach(file => formData.append('images[]', file));
      } else if (key === 'tags' && data[key]) {
        formData.append('tags', JSON.stringify(data[key]));
      } else if (key === 'is_for_sale' || key === 'is_featured') {
        formData.append(key, data[key] ? '1' : '0');
      } else if (key === 'remove_cover_image') {
        formData.append(key, data[key] ? '1' : '0');
      } else if (key === 'existing_image_ids') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    formData.append('_method', 'PUT');
    return api.post(`/artist-works/${slug}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete artwork
  delete: (slug) => api.delete(`/artist-works/${slug}`),
  
  // Toggle featured status
  toggleFeatured: (slug) => api.post(`/artist-works/${slug}/toggle-featured`),
  
  // Toggle for sale status
  toggleForSale: (slug) => api.post(`/artist-works/${slug}/toggle-for-sale`),
  
  // Like artwork
  like: (slug) => api.post(`/artist-works/${slug}/like`),
  
  // Get all tags
  getTags: () => api.get('/tags'),
  
  // Alias for getTags (for consistency)
  getAllTags: () => api.get('/tags'),
};

// Products API endpoints
export const productsAPI = {
  // Get all products
  getAll: (params = {}) => api.get('/products', { params }),
  
  // Get single product by slug
  getBySlug: (slug) => api.get(`/products/${slug}`),
  
  // Create new product
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'cover_photo' && data[key]) {
        formData.append('cover_photo', data[key]);
      } else if (key === 'product_images' && data[key]) {
        data[key].forEach(file => formData.append('product_images[]', file));
      } else if (key === 'dimensions') {
        // Handle JSON fields
        const jsonValue = data[key] || {};
        formData.append(key, JSON.stringify(jsonValue));
      } else if (key === 'in_stock' || key === 'is_custom_dimension') {
        formData.append(key, data[key] ? '1' : '0');
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Update product
  update: (slug, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'cover_photo' && data[key]) {
        formData.append('cover_photo', data[key]);
      } else if (key === 'product_images' && data[key]) {
        data[key].forEach(file => formData.append('product_images[]', file));
      } else if (key === 'dimensions') {
        // Handle JSON fields
        const jsonValue = data[key] || {};
        formData.append(key, JSON.stringify(jsonValue));
      } else if (key === 'in_stock' || key === 'is_custom_dimension') {
        formData.append(key, data[key] ? '1' : '0');
      } else if (key === 'remove_cover_photo') {
        formData.append(key, data[key] ? '1' : '0');
      } else if (key === 'remove_product_images') {
        formData.append(key, JSON.stringify(data[key] || []));
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    formData.append('_method', 'PUT');
    return api.post(`/products/${slug}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete product
  delete: (slug) => api.delete(`/products/${slug}`),
  
  // Toggle stock status
  toggleStock: (slug) => api.post(`/products/${slug}/toggle-stock`),
  
  // Like product
  like: (slug) => api.post(`/products/${slug}/like`),
  
  // Get artists for dropdown
  getArtists: () => api.get('/products-artists'),
};

// Art Panel Galleries API endpoints
export const galleriesAPI = {
  // Get all galleries
  getAll: (params = {}) => api.get('/art-panel-galleries', { params }),
  
  // Get single gallery by slug
  getBySlug: (slug) => api.get(`/art-panel-galleries/${slug}`),
  
  // Create new gallery
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'cover_image' && data[key]) {
        formData.append('cover_image', data[key]);
      } else if (key === 'gallery_images' && data[key]) {
        data[key].forEach(file => formData.append('gallery_images[]', file));
      } else if (key === 'participating_artists') {
        formData.append(key, JSON.stringify(data[key] || []));
      } else if (key === 'in_stock' || key === 'is_custom_dimension') {
        formData.append(key, data[key] ? '1' : '0');
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return api.post('/art-panel-galleries', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Update gallery
  update: (slug, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'cover_image' && data[key]) {
        formData.append('cover_image', data[key]);
      } else if (key === 'gallery_images' && data[key]) {
        data[key].forEach(file => formData.append('gallery_images[]', file));
      } else if (key === 'participating_artists') {
        formData.append(key, JSON.stringify(data[key] || []));
      } else if (key === 'remove_cover_image') {
        formData.append(key, data[key] ? '1' : '0');
      } else if (key === 'remove_gallery_images') {
        formData.append(key, JSON.stringify(data[key] || []));
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    formData.append('_method', 'PUT');
    return api.post(`/art-panel-galleries/${slug}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete gallery
  delete: (slug) => api.delete(`/art-panel-galleries/${slug}`),
  
  // Get artists for dropdown
  getArtists: () => api.get('/galleries-artists'),
};

// News API endpoints
export const newsApi = {
  // Get all news
  getAll: (params = {}) => api.get('/news', { params }),
  
  // Get single news by id
  getById: (id) => api.get(`/news/${id}`),
  
  // Create new news
  create: (data) => {
    const formData = new FormData();
    
    // Always append text fields (even if empty, let backend validation handle it)
    const textFields = ['main_title', 'sub_title', 'description', 'author_name'];
    textFields.forEach(field => {
      if (data[field] !== null && data[field] !== undefined) {
        formData.append(field, data[field]);
      }
    });
    
    // Append files only if they exist
    if (data.cover_photo && data.cover_photo instanceof File) {
      formData.append('cover_photo', data.cover_photo);
    }
    if (data.author_photo && data.author_photo instanceof File) {
      formData.append('author_photo', data.author_photo);
    }
    
    return api.post('/news', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Update news
  update: (id, data) => {
    const formData = new FormData();
    
    // Always append text fields (even if empty, let backend validation handle it)
    const textFields = ['main_title', 'sub_title', 'description', 'author_name'];
    textFields.forEach(field => {
      if (data[field] !== null && data[field] !== undefined) {
        formData.append(field, data[field]);
      }
    });
    
    // Append files only if they exist
    if (data.cover_photo && data.cover_photo instanceof File) {
      formData.append('cover_photo', data.cover_photo);
    }
    if (data.author_photo && data.author_photo instanceof File) {
      formData.append('author_photo', data.author_photo);
    }
    
    formData.append('_method', 'PUT');
    return api.post(`/news/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete news
  delete: (id) => api.delete(`/news/${id}`),
};

// Helper function to get current API base URL
const getApiBaseUrl = () => {
  return configService.isInitialized() ? configService.getApiUrl() : API_BASE_URL;
};

// Articles API endpoints (public)
export const articlesAPI = {
  // Get all articles (public)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const baseUrl = getApiBaseUrl();
    return axios.get(`${baseUrl}/public/news${queryString ? `?${queryString}` : ''}`);
  },

  // Get single article by id (public)
  getById: (id) => {
    const baseUrl = getApiBaseUrl();
    return axios.get(`${baseUrl}/public/news/${id}`);
  }
};

// Public Artists API endpoints
export const publicArtistsAPI = {
  // Get all artists (public)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const baseUrl = getApiBaseUrl();
    return axios.get(`${baseUrl}/public/artists${queryString ? `?${queryString}` : ''}`);
  },

  // Get single artist by slug (public)
  getBySlug: (slug) => {
    const baseUrl = getApiBaseUrl();
    return axios.get(`${baseUrl}/public/artists/${slug}`);
  },

  // Get artist works by slug (public)
  getWorks: (slug, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const baseUrl = getApiBaseUrl();
    return axios.get(`${baseUrl}/public/artists/${slug}/works${queryString ? `?${queryString}` : ''}`);
  }
};

// Public Products API endpoints
export const publicProductsAPI = {
  // Get all products (public)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const baseUrl = getApiBaseUrl();
    return axios.get(`${baseUrl}/public/products${queryString ? `?${queryString}` : ''}`);
  },

  // Get single product by slug (public)
  getBySlug: (slug) => {
    const baseUrl = getApiBaseUrl();
    return axios.get(`${baseUrl}/public/products/${slug}`);
  }
};

// Public News API endpoints
export const publicNewsAPI = {
  // Get all news (public)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const baseUrl = getApiBaseUrl();
    return axios.get(`${baseUrl}/public/news${queryString ? `?${queryString}` : ''}`);
  },

  // Get single news by id (public)
  getById: (id) => {
    const baseUrl = getApiBaseUrl();
    return axios.get(`${baseUrl}/public/news/${id}`);
  }
};

export default api;
