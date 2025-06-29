import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Production API configuration
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

        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Clear invalid token
          localStorage.removeItem('abathwa_token');
          localStorage.removeItem('abathwa_user');
          
          // Redirect to login
          window.location.href = '/login';
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

  // Auth endpoints
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

  async confirmEmail(token: string) {
    const response = await this.api.post('/api/v1/auth/confirm-email', { token });
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.api.post('/api/v1/auth/forgot-password', { 
      email: email.toLowerCase().trim() 
    });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.api.post('/api/v1/auth/reset-password', { 
      token, 
      new_password: newPassword 
    });
    return response.data;
  }

  async refreshToken() {
    const response = await this.api.post('/api/v1/auth/refresh');
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/api/v1/auth/logout');
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

  async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('profile_picture', file);
    const response = await this.api.post('/api/v1/users/me/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async getDashboardData() {
    const response = await this.api.get('/api/v1/users/me/dashboard');
    return response.data;
  }

  // Opportunity endpoints
  async getOpportunities(params?: {
    page?: number;
    limit?: number;
    category?: string;
    industry?: string;
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const response = await this.api.get('/api/v1/opportunities', { params });
    return response.data;
  }

  async getOpportunity(id: string) {
    const response = await this.api.get(`/api/v1/opportunities/${id}`);
    return response.data;
  }

  async createOpportunity(data: {
    title: string;
    description: string;
    category: string;
    industry: string;
    location: string;
    funding_goal: number;
    equity_offered_percentage: number;
    roi_projected_percentage: number;
    funding_stage: string;
    min_investment_amount: number;
    due_diligence_summary: string;
  }) {
    const response = await this.api.post('/api/v1/opportunities', data);
    return response.data;
  }

  async updateOpportunity(id: string, data: any) {
    const response = await this.api.put(`/api/v1/opportunities/${id}`, data);
    return response.data;
  }

  async publishOpportunity(id: string) {
    const response = await this.api.post(`/api/v1/opportunities/${id}/publish`);
    return response.data;
  }

  async deleteOpportunity(id: string) {
    const response = await this.api.delete(`/api/v1/opportunities/${id}`);
    return response.data;
  }

  // Investment endpoints
  async makeOffer(opportunityId: string, offerData: {
    amount_offered: number;
    equity_requested_percentage: number;
    offer_terms: string;
  }) {
    const response = await this.api.post(`/api/v1/opportunities/${opportunityId}/offers`, offerData);
    return response.data;
  }

  async getOffers(opportunityId: string) {
    const response = await this.api.get(`/api/v1/opportunities/${opportunityId}/offers`);
    return response.data;
  }

  async getMyOffers(params?: { status?: string; page?: number; limit?: number }) {
    const response = await this.api.get('/api/v1/offers/me', { params });
    return response.data;
  }

  async acceptOffer(offerId: string) {
    const response = await this.api.put(`/api/v1/offers/${offerId}/accept`);
    return response.data;
  }

  async rejectOffer(offerId: string, reason?: string) {
    const response = await this.api.put(`/api/v1/offers/${offerId}/reject`, { reason });
    return response.data;
  }

  async counterOffer(offerId: string, counterData: {
    amount_offered: number;
    equity_requested_percentage: number;
    offer_terms: string;
  }) {
    const response = await this.api.put(`/api/v1/offers/${offerId}/counter`, counterData);
    return response.data;
  }

  async withdrawOffer(offerId: string) {
    const response = await this.api.put(`/api/v1/offers/${offerId}/withdraw`);
    return response.data;
  }

  // Investment management
  async getMyInvestments(params?: { status?: string; page?: number; limit?: number }) {
    const response = await this.api.get('/api/v1/investments/me', { params });
    return response.data;
  }

  async getInvestment(id: string) {
    const response = await this.api.get(`/api/v1/investments/${id}`);
    return response.data;
  }

  // Payment endpoints
  async uploadProofOfPayment(investmentId: string, file: File, paymentMethod: string) {
    const formData = new FormData();
    formData.append('proof_of_payment', file);
    formData.append('payment_method', paymentMethod);
    
    const response = await this.api.post(`/api/v1/investments/${investmentId}/proof-of-payment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async confirmPayment(investmentId: string, transactionReference: string) {
    const response = await this.api.post(`/api/v1/investments/${investmentId}/confirm-payment`, {
      transaction_reference: transactionReference
    });
    return response.data;
  }

  // Milestone endpoints
  async getMilestones(opportunityId: string) {
    const response = await this.api.get(`/api/v1/opportunities/${opportunityId}/milestones`);
    return response.data;
  }

  async createMilestone(opportunityId: string, data: {
    title: string;
    description: string;
    target_date: string;
  }) {
    const response = await this.api.post(`/api/v1/opportunities/${opportunityId}/milestones`, data);
    return response.data;
  }

  async updateMilestone(milestoneId: string, data: {
    title?: string;
    description?: string;
    target_date?: string;
    status?: string;
    progress_notes?: string;
  }) {
    const response = await this.api.put(`/api/v1/milestones/${milestoneId}`, data);
    return response.data;
  }

  async completeMilestone(milestoneId: string, progressNotes: string) {
    const response = await this.api.post(`/api/v1/milestones/${milestoneId}/complete`, {
      progress_notes: progressNotes
    });
    return response.data;
  }

  // Service Provider endpoints
  async getServiceProviders(params?: { 
    category?: string; 
    location?: string; 
    page?: number; 
    limit?: number; 
  }) {
    const response = await this.api.get('/api/v1/service-providers', { params });
    return response.data;
  }

  async createServiceRequest(data: {
    service_provider_id: string;
    opportunity_id: string;
    service_category: string;
    service_description: string;
    proposed_payment: number;
  }) {
    const response = await this.api.post('/api/v1/service-requests', data);
    return response.data;
  }

  async getServiceRequests(params?: { status?: string; page?: number; limit?: number }) {
    const response = await this.api.get('/api/v1/service-requests/me', { params });
    return response.data;
  }

  async getServiceRequest(id: string) {
    const response = await this.api.get(`/api/v1/service-requests/${id}`);
    return response.data;
  }

  async acceptServiceRequest(id: string) {
    const response = await this.api.put(`/api/v1/service-requests/${id}/accept`);
    return response.data;
  }

  async declineServiceRequest(id: string, reason?: string) {
    const response = await this.api.put(`/api/v1/service-requests/${id}/decline`, { reason });
    return response.data;
  }

  async completeServiceRequest(id: string, reportFile: File) {
    const formData = new FormData();
    formData.append('completion_report', reportFile);
    
    const response = await this.api.put(`/api/v1/service-requests/${id}/complete`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Investment Pool endpoints
  async getPools(params?: { 
    category?: string; 
    status?: string; 
    page?: number; 
    limit?: number; 
  }) {
    const response = await this.api.get('/api/v1/pools', { params });
    return response.data;
  }

  async getPool(id: string) {
    const response = await this.api.get(`/api/v1/pools/${id}`);
    return response.data;
  }

  async createPool(data: {
    name: string;
    description: string;
    category: string;
  }) {
    const response = await this.api.post('/api/v1/pools', data);
    return response.data;
  }

  async joinPool(poolId: string) {
    const response = await this.api.post(`/api/v1/pools/${poolId}/join`);
    return response.data;
  }

  async leavePool(poolId: string) {
    const response = await this.api.post(`/api/v1/pools/${poolId}/leave`);
    return response.data;
  }

  async ratePoolLeader(poolId: string, targetMemberId: string, rating: number, feedback?: string) {
    const response = await this.api.post(`/api/v1/pools/${poolId}/rate-leader`, {
      target_member_id: targetMemberId,
      rating,
      feedback
    });
    return response.data;
  }

  async getPoolMembers(poolId: string) {
    const response = await this.api.get(`/api/v1/pools/${poolId}/members`);
    return response.data;
  }

  // Agreement endpoints
  async generateInvestmentAgreement(offerId: string) {
    const response = await this.api.post('/api/v1/agreements/generate-investment', {
      offer_id: offerId
    });
    return response.data;
  }

  async generateNDA(opportunityId: string, recipientId: string) {
    const response = await this.api.post('/api/v1/agreements/generate-nda', {
      opportunity_id: opportunityId,
      recipient_id: recipientId
    });
    return response.data;
  }

  async getAgreements(params?: { type?: string; status?: string; page?: number; limit?: number }) {
    const response = await this.api.get('/api/v1/agreements/me', { params });
    return response.data;
  }

  async getAgreement(id: string) {
    const response = await this.api.get(`/api/v1/agreements/${id}`);
    return response.data;
  }

  async signAgreement(agreementId: string, signatureData: {
    signature_type: 'digital' | 'electronic';
    signature_data: string;
  }) {
    const response = await this.api.post(`/api/v1/agreements/${agreementId}/sign`, signatureData);
    return response.data;
  }

  async downloadAgreement(agreementId: string) {
    const response = await this.api.get(`/api/v1/agreements/${agreementId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Observer endpoints
  async addObserver(data: {
    observer_email: string;
    entity_type: 'opportunity' | 'pool' | 'user';
    entity_id: string;
    permissions: string[];
  }) {
    const response = await this.api.post('/api/v1/observers', data);
    return response.data;
  }

  async getObservedEntities() {
    const response = await this.api.get('/api/v1/observers/me/entities');
    return response.data;
  }

  async removeObserver(observerId: string) {
    const response = await this.api.delete(`/api/v1/observers/${observerId}`);
    return response.data;
  }

  // Settlement Plan endpoints
  async createSettlementPlan(opportunityId: string, data: {
    reason_for_failure: string;
    total_amount_to_settle: number;
    installments: Array<{
      amount: number;
      due_date: string;
    }>;
  }) {
    const response = await this.api.post(`/api/v1/opportunities/${opportunityId}/settlement-plan`, data);
    return response.data;
  }

  async getSettlementPlans(params?: { status?: string; page?: number; limit?: number }) {
    const response = await this.api.get('/api/v1/settlement-plans/me', { params });
    return response.data;
  }

  async getSettlementPlan(id: string) {
    const response = await this.api.get(`/api/v1/settlement-plans/${id}`);
    return response.data;
  }

  async paySettlementInstallment(installmentId: string, proofOfPayment: File) {
    const formData = new FormData();
    formData.append('proof_of_payment', proofOfPayment);
    
    const response = await this.api.post(`/api/v1/settlement-installments/${installmentId}/pay`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // File management
  async uploadFile(file: File, entityType: string, entityId: string, category: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);
    formData.append('category', category);
    
    const response = await this.api.post('/api/v1/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async getFiles(entityType: string, entityId: string, category?: string) {
    const response = await this.api.get('/api/v1/files', {
      params: { entity_type: entityType, entity_id: entityId, category }
    });
    return response.data;
  }

  async downloadFile(fileId: string) {
    const response = await this.api.get(`/api/v1/files/${fileId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteFile(fileId: string) {
    const response = await this.api.delete(`/api/v1/files/${fileId}`);
    return response.data;
  }

  // Notifications
  async getNotifications(params?: { 
    is_read?: boolean; 
    type?: string; 
    page?: number; 
    limit?: number; 
  }) {
    const response = await this.api.get('/api/v1/notifications/me', { params });
    return response.data;
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await this.api.put(`/api/v1/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.api.put('/api/v1/notifications/me/read-all');
    return response.data;
  }

  async getNotificationSettings() {
    const response = await this.api.get('/api/v1/notifications/me/settings');
    return response.data;
  }

  async updateNotificationSettings(settings: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    notification_types: string[];
  }) {
    const response = await this.api.put('/api/v1/notifications/me/settings', settings);
    return response.data;
  }

  // Admin endpoints
  async getAdminUsers(params?: { 
    role?: string; 
    status?: string; 
    search?: string; 
    page?: number; 
    limit?: number; 
  }) {
    const response = await this.api.get('/api/v1/admin/users', { params });
    return response.data;
  }

  async getAdminUser(userId: string) {
    const response = await this.api.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  }

  async updateAdminUser(userId: string, data: {
    status?: string;
    role?: string;
    notes?: string;
  }) {
    const response = await this.api.put(`/api/v1/admin/users/${userId}`, data);
    return response.data;
  }

  async approveUser(userId: string) {
    const response = await this.api.post(`/api/v1/admin/users/${userId}/approve`);
    return response.data;
  }

  async suspendUser(userId: string, reason: string) {
    const response = await this.api.post(`/api/v1/admin/users/${userId}/suspend`, { reason });
    return response.data;
  }

  async getAdminOpportunities(params?: { 
    status?: string; 
    category?: string; 
    page?: number; 
    limit?: number; 
  }) {
    const response = await this.api.get('/api/v1/admin/opportunities', { params });
    return response.data;
  }

  async approveOpportunity(opportunityId: string) {
    const response = await this.api.post(`/api/v1/admin/opportunities/${opportunityId}/approve`);
    return response.data;
  }

  async rejectOpportunity(opportunityId: string, reason: string) {
    const response = await this.api.post(`/api/v1/admin/opportunities/${opportunityId}/reject`, { reason });
    return response.data;
  }

  async getPendingPayments(params?: { page?: number; limit?: number }) {
    const response = await this.api.get('/api/v1/admin/payments/pending', { params });
    return response.data;
  }

  async confirmPayment(investmentId: string, notes?: string) {
    const response = await this.api.post(`/api/v1/admin/payments/${investmentId}/confirm`, { notes });
    return response.data;
  }

  async rejectPayment(investmentId: string, reason: string) {
    const response = await this.api.post(`/api/v1/admin/payments/${investmentId}/reject`, { reason });
    return response.data;
  }

  async releaseFunds(investmentId: string) {
    const response = await this.api.post(`/api/v1/admin/payments/${investmentId}/release-funds`);
    return response.data;
  }

  async getAdminSettings() {
    const response = await this.api.get('/api/v1/admin/settings');
    return response.data;
  }

  async updateAdminSettings(settings: any) {
    const response = await this.api.put('/api/v1/admin/settings', settings);
    return response.data;
  }

  async getPlatformContacts() {
    const response = await this.api.get('/api/v1/admin/platform-contacts');
    return response.data;
  }

  async updatePlatformContact(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  }) {
    const response = await this.api.put(`/api/v1/admin/platform-contacts/${id}`, data);
    return response.data;
  }

  async getAdminAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    metric_type?: string;
  }) {
    const response = await this.api.get('/api/v1/admin/analytics', { params });
    return response.data;
  }

  async exportData(entityType: string, format: 'csv' | 'xlsx' | 'json') {
    const response = await this.api.get(`/api/v1/admin/export/${entityType}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  // Search and filtering
  async searchOpportunities(query: string, filters?: {
    category?: string;
    industry?: string;
    location?: string;
    min_funding?: number;
    max_funding?: number;
    risk_level?: string;
  }) {
    const response = await this.api.get('/api/v1/search/opportunities', {
      params: { q: query, ...filters }
    });
    return response.data;
  }

  async searchUsers(query: string, filters?: {
    role?: string;
    location?: string;
  }) {
    const response = await this.api.get('/api/v1/search/users', {
      params: { q: query, ...filters }
    });
    return response.data;
  }

  // Analytics and reporting
  async getUserAnalytics(timeframe: 'week' | 'month' | 'quarter' | 'year') {
    const response = await this.api.get('/api/v1/analytics/me', {
      params: { timeframe }
    });
    return response.data;
  }

  async getPortfolioPerformance(timeframe: 'week' | 'month' | 'quarter' | 'year') {
    const response = await this.api.get('/api/v1/analytics/me/portfolio', {
      params: { timeframe }
    });
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