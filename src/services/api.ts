import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.abathwa.com';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
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
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('abathwa_token');
          localStorage.removeItem('abathwa_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/api/auth/login', { email, password });
    return response.data;
  }

  async register(userData: any) {
    const response = await this.api.post('/api/auth/register', userData);
    return response.data;
  }

  async confirmEmail(token: string) {
    const response = await this.api.get(`/api/auth/confirm-email?token=${token}`);
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.api.post('/api/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.api.post('/api/auth/reset-password', { token, new_password: newPassword });
    return response.data;
  }

  // User endpoints
  async getCurrentUser() {
    const response = await this.api.get('/api/users/me');
    return response.data;
  }

  async updateProfile(updates: any) {
    const response = await this.api.put('/api/users/me/profile', updates);
    return response.data;
  }

  async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.api.post('/api/users/me/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Opportunity endpoints
  async getOpportunities(params?: any) {
    const response = await this.api.get('/api/opportunities', { params });
    return response.data;
  }

  async getOpportunity(id: string) {
    const response = await this.api.get(`/api/opportunities/${id}`);
    return response.data;
  }

  async createOpportunity(data: any) {
    const response = await this.api.post('/api/opportunities', data);
    return response.data;
  }

  async updateOpportunity(id: string, data: any) {
    const response = await this.api.put(`/api/opportunities/${id}`, data);
    return response.data;
  }

  async publishOpportunity(id: string) {
    const response = await this.api.post(`/api/opportunities/${id}/publish`);
    return response.data;
  }

  // Investment endpoints
  async makeOffer(opportunityId: string, offerData: any) {
    const response = await this.api.post(`/api/opportunities/${opportunityId}/offers`, offerData);
    return response.data;
  }

  async getOffers(opportunityId: string) {
    const response = await this.api.get(`/api/opportunities/${opportunityId}/offers`);
    return response.data;
  }

  async acceptOffer(offerId: string) {
    const response = await this.api.put(`/api/offers/${offerId}/accept`);
    return response.data;
  }

  async rejectOffer(offerId: string) {
    const response = await this.api.put(`/api/offers/${offerId}/reject`);
    return response.data;
  }

  async counterOffer(offerId: string, counterData: any) {
    const response = await this.api.put(`/api/offers/${offerId}/counter`, counterData);
    return response.data;
  }

  // Payment endpoints
  async uploadProofOfPayment(investmentId: string, fileId: string, paymentMethod: string) {
    const response = await this.api.post(`/api/investments/${investmentId}/proof-of-payment`, {
      proof_of_payment_file_id: fileId,
      payment_method: paymentMethod
    });
    return response.data;
  }

  // Milestone endpoints
  async getMilestones(opportunityId: string) {
    const response = await this.api.get(`/api/opportunities/${opportunityId}/milestones`);
    return response.data;
  }

  async createMilestone(opportunityId: string, data: any) {
    const response = await this.api.post(`/api/opportunities/${opportunityId}/milestones`, data);
    return response.data;
  }

  async updateMilestone(milestoneId: string, data: any) {
    const response = await this.api.put(`/api/milestones/${milestoneId}`, data);
    return response.data;
  }

  // Service Provider endpoints
  async getServiceProviders(params?: any) {
    const response = await this.api.get('/api/service-providers', { params });
    return response.data;
  }

  async createServiceRequest(data: any) {
    const response = await this.api.post('/api/service-requests', data);
    return response.data;
  }

  async getServiceRequest(id: string) {
    const response = await this.api.get(`/api/service-requests/${id}`);
    return response.data;
  }

  async acceptServiceRequest(id: string) {
    const response = await this.api.put(`/api/service-requests/${id}/accept`);
    return response.data;
  }

  async declineServiceRequest(id: string) {
    const response = await this.api.put(`/api/service-requests/${id}/decline`);
    return response.data;
  }

  async completeServiceRequest(id: string, reportFileId: string) {
    const response = await this.api.put(`/api/service-requests/${id}/complete`, {
      report_file_id: reportFileId
    });
    return response.data;
  }

  // Investment Pool endpoints
  async getPools(params?: any) {
    const response = await this.api.get('/api/pools', { params });
    return response.data;
  }

  async createPool(data: any) {
    const response = await this.api.post('/api/pools', data);
    return response.data;
  }

  async joinPool(poolId: string) {
    const response = await this.api.post(`/api/pools/${poolId}/join`);
    return response.data;
  }

  async ratePoolLeader(poolId: string, targetMemberId: string, rating: number, feedback?: string) {
    const response = await this.api.post(`/api/pools/${poolId}/leader-rating`, {
      target_pool_member_id: targetMemberId,
      rating,
      feedback_text: feedback
    });
    return response.data;
  }

  // Agreement endpoints
  async generateInvestmentAgreement(offerId: string) {
    const response = await this.api.post('/api/agreements/generate-investment-agreement', {
      offer_id: offerId
    });
    return response.data;
  }

  async generateNDA(opportunityId: string, recipientId: string) {
    const response = await this.api.post('/api/agreements/generate-nda', {
      opportunity_id: opportunityId,
      recipient_id: recipientId
    });
    return response.data;
  }

  async signAgreement(agreementId: string, signatureData: any) {
    const response = await this.api.post(`/api/agreements/${agreementId}/sign`, signatureData);
    return response.data;
  }

  async downloadAgreement(agreementId: string) {
    const response = await this.api.get(`/api/agreements/${agreementId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Observer endpoints
  async addObserver(data: any) {
    const response = await this.api.post('/api/observers', data);
    return response.data;
  }

  async getObservedEntities() {
    const response = await this.api.get('/api/users/me/observed-entities');
    return response.data;
  }

  // Settlement Plan endpoints
  async createSettlementPlan(opportunityId: string, data: any) {
    const response = await this.api.post(`/api/entrepreneur/opportunities/${opportunityId}/settlement-plan`, data);
    return response.data;
  }

  async getSettlementPlans() {
    const response = await this.api.get('/api/entrepreneur/settlement-plans');
    return response.data;
  }

  async paySettlementInstallment(installmentId: string) {
    const response = await this.api.post(`/api/settlement-installments/${installmentId}/pay`);
    return response.data;
  }

  // File upload
  async uploadFile(file: File, entityType: string, entityId: string, category: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);
    formData.append('category', category);
    
    const response = await this.api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async downloadFile(fileId: string) {
    const response = await this.api.get(`/api/files/${fileId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Notifications
  async getNotifications() {
    const response = await this.api.get('/api/users/me/notifications');
    return response.data;
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await this.api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  }

  // Admin endpoints
  async getAdminUsers(params?: any) {
    const response = await this.api.get('/api/admin/users', { params });
    return response.data;
  }

  async getAdminUser(userId: string) {
    const response = await this.api.get(`/api/admin/users/${userId}`);
    return response.data;
  }

  async updateAdminUser(userId: string, data: any) {
    const response = await this.api.put(`/api/admin/users/${userId}`, data);
    return response.data;
  }

  async approveOpportunity(opportunityId: string) {
    const response = await this.api.post(`/api/admin/opportunities/${opportunityId}/approve`);
    return response.data;
  }

  async rejectOpportunity(opportunityId: string, reason: string) {
    const response = await this.api.post(`/api/admin/opportunities/${opportunityId}/reject`, { reason });
    return response.data;
  }

  async getPendingPayments() {
    const response = await this.api.get('/api/admin/payments/pending-confirmation');
    return response.data;
  }

  async confirmPayment(investmentId: string) {
    const response = await this.api.post(`/api/admin/payments/${investmentId}/confirm`);
    return response.data;
  }

  async rejectPayment(investmentId: string, reason: string) {
    const response = await this.api.post(`/api/admin/payments/${investmentId}/reject`, { reason });
    return response.data;
  }

  async releaseFunds(paymentId: string) {
    const response = await this.api.post(`/api/admin/payments/${paymentId}/release`);
    return response.data;
  }

  async getAdminSettings() {
    const response = await this.api.get('/api/admin/settings');
    return response.data;
  }

  async updateAdminSettings(settings: any) {
    const response = await this.api.put('/api/admin/settings', settings);
    return response.data;
  }

  async getPlatformContacts() {
    const response = await this.api.get('/api/admin/platform-contacts');
    return response.data;
  }

  async updatePlatformContact(id: string, data: any) {
    const response = await this.api.put(`/api/admin/platform-contacts/${id}`, data);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;