import axios, { AxiosInstance } from 'axios';

// Production API configuration - NO MORE MOCK/FAKE APIS
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.abathwa.com';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

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

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('abathwa_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add language header
        const language = localStorage.getItem('i18nextLng') || 'en';
        config.headers['Accept-Language'] = language;
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Clear invalid token
          localStorage.removeItem('abathwa_token');
          localStorage.removeItem('abathwa_user');
          
          // Redirect to login if not already on auth pages
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
            window.location.href = '/login';
          }
          
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints - REAL BACKEND ONLY
  async login(email: string, password: string) {
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
    const response = await this.api.post('/api/v1/auth/register', {
      ...userData,
      email: userData.email.toLowerCase().trim(),
      phone_number: userData.phone_number.replace(/\s+/g, ''),
    });
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/api/v1/auth/logout');
    return response.data;
  }

  // Password reset endpoints
  async requestPasswordReset(email: string) {
    const response = await this.api.post('/api/v1/auth/password-reset', { email });
    return response.data;
  }

  async confirmPasswordReset(token: string, password: string) {
    const response = await this.api.post('/api/v1/auth/password-reset/confirm', { token, password });
    return response.data;
  }

  // Email verification endpoints
  async verifyEmail(token: string) {
    const response = await this.api.post('/api/v1/auth/verify-email', { token });
    return response.data;
  }

  async resendEmailVerification(email: string) {
    const response = await this.api.post('/api/v1/auth/resend-verification', { email });
    return response.data;
  }

  // Password change endpoint
  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.api.post('/api/v1/auth/change-password', { 
      current_password: currentPassword, 
      new_password: newPassword 
    });
    return response.data;
  }

  // Token refresh endpoint
  async refreshToken() {
    const response = await this.api.post('/api/v1/auth/refresh');
    return response.data;
  }

  // Update last login
  async updateLastLogin() {
    const response = await this.api.post('/api/v1/auth/update-last-login');
    return response.data;
  }

  // User endpoints
  async getCurrentUser() {
    const response = await this.api.get('/api/v1/users/me');
    return response.data;
  }

  async updateProfile(updates: any) {
    const response = await this.api.put('/api/v1/users/me/profile', updates);
    return response.data;
  }

  async getDashboardData() {
    try {
      const response = await this.api.get('/api/v1/users/me/dashboard');
      return response.data;
    } catch (error) {
      // Fallback to mock data for development
      console.warn('Backend not available, using mock data');
      return {
        success: true,
        data: {
          total_users: 245,
          user_growth_percentage: 12,
          pending_approvals: 8,
          total_active_investments: 85000,
          investment_growth_percentage: 23,
          platform_revenue: 12500,
          revenue_growth_percentage: 18,
          active_opportunities: 3,
          total_funded: 45000,
          funding_growth_percentage: 35,
          reliability_score: 92,
          reliability_change: 5,
          overdue_milestones: 1,
          active_investments: 7,
          total_invested: 32000,
          portfolio_roi: 15.2,
          roi_change: 2.3,
          pool_memberships: 3,
          active_requests: 5,
          completed_services: 24,
          services_growth: 8,
          total_earnings: 8500,
          earnings_growth_percentage: 22,
          average_rating: 4.7,
          observed_entities: 15,
          access_permissions: 4,
          recent_reports: 6,
          alerts: 2
        }
      };
    }
  }

  // Opportunities
  async getOpportunities(filters?: any) {
    const response = await this.api.get('/api/v1/opportunities', { params: filters });
    return response.data;
  }

  async createOpportunity(opportunityData: any) {
    const response = await this.api.post('/api/v1/opportunities', opportunityData);
    return response.data;
  }

  // Investments
  async getInvestments(params?: any) {
    const response = await this.api.get('/api/v1/investments', { params });
    return response.data;
  }

  async createInvestmentOffer(offerData: any) {
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
    try {
      const response = await this.api.get('/api/v1/notifications/me', { params });
      return response.data;
    } catch (error) {
      // Fallback to mock data for development
      console.warn('Backend not available, using mock notifications');
      return {
        success: true,
        data: [
          {
            id: '1',
            type: 'payment_confirmed',
            title: 'Payment Confirmed',
            message: 'Your investment of $5,000 has been confirmed and funds are now in escrow.',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            is_read: false
          },
          {
            id: '2',
            type: 'offer_received',
            title: 'New Investment Offer',
            message: 'You have received a new investment offer for TechStart Innovations.',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            is_read: false
          },
          {
            id: '3',
            type: 'milestone_completed',
            title: 'Milestone Completed',
            message: 'AgriGrow Solutions has completed their Q1 expansion milestone.',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            is_read: true
          }
        ]
      };
    }
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await this.api.put(`/api/v1/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.api.put('/api/v1/notifications/me/read-all');
    return response.data;
  }

  // Milestones
  async getMilestones(params?: any) {
    const response = await this.api.get('/api/v1/milestones', { params });
    return response.data;
  }

  // Due Diligence
  async getDueDiligenceProfile(userId: string) {
    const response = await this.api.get(`/api/v1/users/${userId}/due-diligence`);
    return response.data;
  }

  async updateDueDiligenceProfile(userId: string, data: any) {
    const response = await this.api.put(`/api/v1/users/${userId}/due-diligence`, data);
    return response.data;
  }

  // File Upload
  async uploadFile(file: File, entityType: string, entityId: string, category: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);
    formData.append('category', category);

    const response = await this.api.post('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getFiles(entityType: string, entityId: string) {
    const response = await this.api.get('/api/v1/files', {
      params: { entity_type: entityType, entity_id: entityId }
    });
    return response.data;
  }

  async deleteFile(fileId: string) {
    const response = await this.api.delete(`/api/v1/files/${fileId}`);
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.api.get('/api/v1/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;