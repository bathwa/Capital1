import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { mockApiService } from './mockApi';

// Production API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.abathwa.com';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.DEV;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token and other headers
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('abathwa_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add language header
        const language = localStorage.getItem('i18nextLng') || import.meta.env.VITE_DEFAULT_LANGUAGE || 'en';
        config.headers['Accept-Language'] = language;
        
        // Add CSRF token if available
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
          config.headers[import.meta.env.VITE_CSRF_TOKEN_HEADER || 'X-CSRF-TOKEN'] = csrfToken;
        }
        
        // Add request timestamp for debugging
        config.headers['X-Request-Timestamp'] = new Date().toISOString();
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.api.interceptors.response.use(
      (response) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
          console.log(`API Response [${response.config.method?.toUpperCase()}] ${response.config.url}:`, response.data);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // If using mock API and network error occurs, fall back to mock
        if (USE_MOCK_API && !error.response) {
          console.warn('Network error detected, using mock API fallback');
          return this.handleMockFallback(originalRequest);
        }

        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Clear invalid token
          localStorage.removeItem('abathwa_token');
          localStorage.removeItem('abathwa_user');
          
          // Only redirect to login if not already on auth pages
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
            window.location.href = '/login';
          }
          
          return Promise.reject(error);
        }

        // Handle 403 Forbidden - insufficient permissions
        if (error.response?.status === 403) {
          console.error('Access forbidden:', error.response.data);
        }

        // Handle 429 Too Many Requests - rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
        }

        // Handle 500+ Server Errors
        if (error.response?.status >= 500) {
          console.error('Server error:', error.response.data);
        }

        // Handle network errors
        if (!error.response) {
          console.error('Network error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  private async handleMockFallback(originalRequest: any) {
    const method = originalRequest.method?.toLowerCase();
    const url = originalRequest.url;
    
    try {
      if (url.includes('/auth/login') && method === 'post') {
        const { email, password } = originalRequest.data;
        return { data: await mockApiService.login(email, password) };
      }
      
      if (url.includes('/auth/register') && method === 'post') {
        return { data: await mockApiService.register(originalRequest.data) };
      }
      
      if (url.includes('/users/me/dashboard') && method === 'get') {
        return { data: await mockApiService.getDashboardData() };
      }
      
      if (url.includes('/users/me') && method === 'get') {
        return { data: await mockApiService.getCurrentUser() };
      }
      
      if (url.includes('/notifications/me') && method === 'get') {
        return { data: await mockApiService.getNotifications() };
      }
      
      if (url.includes('/auth/logout') && method === 'post') {
        return { data: await mockApiService.logout() };
      }
      
      // Default fallback
      return { data: { success: true, message: 'Mock API fallback' } };
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    if (USE_MOCK_API) {
      return await mockApiService.login(email, password);
    }
    
    const response = await this.api.post('/api/v1/auth/login', { 
      email: email.toLowerCase().trim(), 
      password 
    });
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
    organization_name?: string;
  }) {
    if (USE_MOCK_API) {
      return await mockApiService.register(userData);
    }
    
    const response = await this.api.post('/api/v1/auth/register', {
      ...userData,
      email: userData.email.toLowerCase().trim(),
      phone_number: userData.phone_number.replace(/\s+/g, ''),
    });
    return response.data;
  }

  async logout() {
    if (USE_MOCK_API) {
      return await mockApiService.logout();
    }
    
    const response = await this.api.post('/api/v1/auth/logout');
    return response.data;
  }

  // User endpoints
  async getCurrentUser() {
    if (USE_MOCK_API) {
      return await mockApiService.getCurrentUser();
    }
    
    const response = await this.api.get('/api/v1/users/me');
    return response.data;
  }

  async updateProfile(updates: any) {
    if (USE_MOCK_API) {
      return await mockApiService.updateProfile(updates);
    }
    
    const response = await this.api.put('/api/v1/users/me/profile', updates);
    return response.data;
  }

  async getDashboardData() {
    if (USE_MOCK_API) {
      return await mockApiService.getDashboardData();
    }
    
    const response = await this.api.get('/api/v1/users/me/dashboard');
    return response.data;
  }

  // Notifications
  async getNotifications(params?: { 
    is_read?: boolean; 
    type?: string; 
    page?: number; 
    limit?: number; 
  }) {
    if (USE_MOCK_API) {
      return await mockApiService.getNotifications(params);
    }
    
    const response = await this.api.get('/api/v1/notifications/me', { params });
    return response.data;
  }

  async markNotificationAsRead(notificationId: string) {
    if (USE_MOCK_API) {
      return await mockApiService.markNotificationAsRead(notificationId);
    }
    
    const response = await this.api.put(`/api/v1/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    if (USE_MOCK_API) {
      return await mockApiService.markAllNotificationsAsRead();
    }
    
    const response = await this.api.put('/api/v1/notifications/me/read-all');
    return response.data;
  }

  // Health check
  async healthCheck() {
    if (USE_MOCK_API) {
      return await mockApiService.healthCheck();
    }
    
    const response = await this.api.get('/api/v1/health');
    return response.data;
  }

  // Test connection
  async testConnection() {
    try {
      const response = await this.healthCheck();
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Connection failed' 
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;