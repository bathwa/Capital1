import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { mockApiService } from './mockApi';
import { supabaseApiService } from './supabaseApi';

// Production API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.abathwa.com';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';
const USE_SUPABASE = import.meta.env.VITE_SUPABASE_URL && !USE_MOCK_API;

class ApiService {
  private api: AxiosInstance;
  private supabaseAvailable: boolean = true;

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

        // If using Supabase or mock API and network error occurs, fall back
        if ((USE_SUPABASE || USE_MOCK_API) && !error.response) {
          console.warn('Network error detected, using fallback API');
          return this.handleFallback(originalRequest);
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

        // Handle other errors
        if (error.response?.status === 403) {
          console.error('Access forbidden:', error.response.data);
        }

        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
        }

        if (error.response?.status >= 500) {
          console.error('Server error:', error.response.data);
        }

        if (!error.response) {
          console.error('Network error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  private async handleFallback(originalRequest: any) {
    const method = originalRequest.method?.toLowerCase();
    const url = originalRequest.url;
    
    try {
      // Use mock API as fallback when Supabase is unavailable
      const apiService = mockApiService;
      
      if (url.includes('/auth/login') && method === 'post') {
        const { email, password } = originalRequest.data;
        return { data: await apiService.login(email, password) };
      }
      
      if (url.includes('/auth/register') && method === 'post') {
        return { data: await apiService.register(originalRequest.data) };
      }
      
      if (url.includes('/users/me/dashboard') && method === 'get') {
        return { data: await apiService.getDashboardData() };
      }
      
      if (url.includes('/users/me') && method === 'get') {
        return { data: await apiService.getCurrentUser() };
      }
      
      if (url.includes('/notifications/me') && method === 'get') {
        return { data: await apiService.getNotifications() };
      }
      
      if (url.includes('/auth/logout') && method === 'post') {
        return { data: await apiService.logout() };
      }
      
      // Default fallback
      return { data: { success: true, message: 'Fallback API response' } };
    } catch (error) {
      throw error;
    }
  }

  private async handleSupabaseError(operation: () => Promise<any>, fallbackOperation?: () => Promise<any>) {
    try {
      return await operation();
    } catch (error: any) {
      if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
        this.supabaseAvailable = false;
        console.warn('Supabase unavailable, falling back to mock API');
        
        if (fallbackOperation) {
          return await fallbackOperation();
        }
        
        throw new Error('Service temporarily unavailable. Please try again later.');
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.login(email, password),
        () => mockApiService.login(email, password)
      );
    }
    
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
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.register(userData),
        () => mockApiService.register(userData)
      );
    }
    
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
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.logout(),
        () => mockApiService.logout()
      );
    }
    
    if (USE_MOCK_API) {
      return await mockApiService.logout();
    }
    
    const response = await this.api.post('/api/v1/auth/logout');
    return response.data;
  }

  // Password reset endpoints
  async requestPasswordReset(email: string) {
    if (USE_MOCK_API) {
      return await mockApiService.requestPasswordReset(email);
    }
    
    const response = await this.api.post('/api/v1/auth/password-reset', { email });
    return response.data;
  }

  async confirmPasswordReset(token: string, password: string) {
    if (USE_MOCK_API) {
      return await mockApiService.confirmPasswordReset(token, password);
    }
    
    const response = await this.api.post('/api/v1/auth/password-reset/confirm', { token, password });
    return response.data;
  }

  // Email verification endpoints
  async verifyEmail(token: string) {
    if (USE_MOCK_API) {
      return await mockApiService.verifyEmail(token);
    }
    
    const response = await this.api.post('/api/v1/auth/verify-email', { token });
    return response.data;
  }

  async resendEmailVerification(email: string) {
    if (USE_MOCK_API) {
      return await mockApiService.resendEmailVerification(email);
    }
    
    const response = await this.api.post('/api/v1/auth/resend-verification', { email });
    return response.data;
  }

  // Password change endpoint
  async changePassword(currentPassword: string, newPassword: string) {
    if (USE_MOCK_API) {
      return await mockApiService.changePassword(currentPassword, newPassword);
    }
    
    const response = await this.api.post('/api/v1/auth/change-password', { 
      current_password: currentPassword, 
      new_password: newPassword 
    });
    return response.data;
  }

  // Token refresh endpoint
  async refreshToken() {
    if (USE_MOCK_API) {
      return await mockApiService.refreshToken();
    }
    
    const response = await this.api.post('/api/v1/auth/refresh');
    return response.data;
  }

  // Update last login
  async updateLastLogin() {
    if (USE_MOCK_API) {
      return await mockApiService.updateLastLogin();
    }
    
    const response = await this.api.post('/api/v1/auth/update-last-login');
    return response.data;
  }

  // User endpoints
  async getCurrentUser() {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.getCurrentUser(),
        () => mockApiService.getCurrentUser()
      );
    }
    
    if (USE_MOCK_API) {
      return await mockApiService.getCurrentUser();
    }
    
    const response = await this.api.get('/api/v1/users/me');
    return response.data;
  }

  async updateProfile(updates: any) {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.updateProfile(updates),
        () => mockApiService.updateProfile(updates)
      );
    }
    
    if (USE_MOCK_API) {
      return await mockApiService.updateProfile(updates);
    }
    
    const response = await this.api.put('/api/v1/users/me/profile', updates);
    return response.data;
  }

  async getDashboardData() {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.getDashboardData(),
        () => mockApiService.getDashboardData()
      );
    }
    
    if (USE_MOCK_API) {
      return await mockApiService.getDashboardData();
    }
    
    const response = await this.api.get('/api/v1/users/me/dashboard');
    return response.data;
  }

  // Opportunities
  async getOpportunities(filters?: any) {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.getOpportunities(filters)
      );
    }
    
    const response = await this.api.get('/api/v1/opportunities', { params: filters });
    return response.data;
  }

  async createOpportunity(opportunityData: any) {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.createOpportunity(opportunityData)
      );
    }
    
    const response = await this.api.post('/api/v1/opportunities', opportunityData);
    return response.data;
  }

  // Investments
  async getInvestments(params?: any) {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.getInvestments(params)
      );
    }
    
    const response = await this.api.get('/api/v1/investments', { params });
    return response.data;
  }

  async createInvestmentOffer(offerData: any) {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.createInvestmentOffer(offerData)
      );
    }
    
    const response = await this.api.post('/api/v1/investment-offers', offerData);
    return response.data;
  }

  // Notifications
  async getNotifications(params?: { 
    is_read?: boolean; 
    type?: string; 
    page?: number; 
    limit?: number; 
  }) {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.getNotifications(params),
        () => mockApiService.getNotifications(params)
      );
    }
    
    if (USE_MOCK_API) {
      return await mockApiService.getNotifications(params);
    }
    
    const response = await this.api.get('/api/v1/notifications/me', { params });
    return response.data;
  }

  async markNotificationAsRead(notificationId: string) {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.markNotificationAsRead(notificationId),
        () => mockApiService.markNotificationAsRead(notificationId)
      );
    }
    
    if (USE_MOCK_API) {
      return await mockApiService.markNotificationAsRead(notificationId);
    }
    
    const response = await this.api.put(`/api/v1/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.markAllNotificationsAsRead(),
        () => mockApiService.markAllNotificationsAsRead()
      );
    }
    
    if (USE_MOCK_API) {
      return await mockApiService.markAllNotificationsAsRead();
    }
    
    const response = await this.api.put('/api/v1/notifications/me/read-all');
    return response.data;
  }

  // Health check
  async healthCheck() {
    if (USE_SUPABASE && this.supabaseAvailable) {
      return await this.handleSupabaseError(
        () => supabaseApiService.healthCheck(),
        () => mockApiService.healthCheck()
      );
    }
    
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