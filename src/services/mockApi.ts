// Mock API service for development when backend is not available
export class MockApiService {
  private delay(ms: number = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(email: string, password: string) {
    await this.delay(800);
    
    // Mock successful login
    if (email && password) {
      return {
        success: true,
        data: {
          user: {
            id: 'mock-user-id',
            email: email,
            first_name: 'John',
            last_name: 'Doe',
            role: 'ENTREPRENEUR',
            phone_number: '+263123456789',
            organization_name: 'Mock Organization',
            profile_completion_percentage: 75,
            reliability_score: 85,
            email_verified: true,
            status: 'ACTIVE',
            date_registered: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          token: 'mock-jwt-token-' + Date.now(),
        },
        message: 'Login successful'
      };
    }
    
    throw new Error('Invalid credentials');
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
    await this.delay(1200);
    
    // Mock successful registration
    return {
      success: true,
      data: {
        user: {
          id: 'mock-user-id-' + Date.now(),
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          phone_number: userData.phone_number,
          organization_name: userData.organization_name,
          profile_completion_percentage: 30,
          reliability_score: 0,
          email_verified: false,
          status: 'PENDING_EMAIL_CONFIRMATION',
          date_registered: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      message: 'Registration successful. Please check your email to verify your account.'
    };
  }

  async getCurrentUser() {
    await this.delay(400);
    const storedUser = localStorage.getItem('abathwa_user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    return {
      id: 'mock-user-id',
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'ENTREPRENEUR',
      phone_number: '+263123456789',
      organization_name: 'Mock Organization',
      profile_completion_percentage: 75,
      reliability_score: 85,
      email_verified: true,
      status: 'ACTIVE',
      date_registered: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async getDashboardData() {
    await this.delay(800);
    return {
      // Mock dashboard data based on user role
      total_users: 1250,
      user_growth_percentage: 15,
      pending_approvals: 8,
      total_active_investments: 2500000,
      investment_growth_percentage: 22,
      platform_revenue: 125000,
      revenue_growth_percentage: 18,
      active_opportunities: 12,
      total_funded: 450000,
      funding_growth_percentage: 28,
      reliability_score: 85,
      reliability_change: 5,
      overdue_milestones: 2,
      active_investments: 8,
      total_invested: 180000,
      portfolio_roi: 12.5,
      roi_change: 3.2,
      pool_memberships: 3,
      active_requests: 5,
      completed_services: 24,
      services_growth: 6,
      total_earnings: 45000,
      earnings_growth_percentage: 20,
      average_rating: 4.7,
      observed_entities: 15,
      access_permissions: 8,
      recent_reports: 3,
      alerts: 1,
    };
  }

  async getNotifications(params?: any) {
    await this.delay(400);
    return {
      data: [
        {
          id: '1',
          type: 'payment_confirmed',
          message: 'Payment of $5,000 has been confirmed for TechStart opportunity',
          created_at: new Date().toISOString(),
          is_read: false,
        },
        {
          id: '2',
          type: 'offer_received',
          message: 'New investment offer received for your AgriTech project',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: false,
        },
        {
          id: '3',
          type: 'milestone_overdue',
          message: 'Milestone "Product Development Phase 1" is overdue',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          is_read: true,
        },
      ]
    };
  }

  async logout() {
    await this.delay(200);
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  async updateProfile(updates: any) {
    await this.delay(600);
    return {
      success: true,
      data: { ...updates, updated_at: new Date().toISOString() },
      message: 'Profile updated successfully'
    };
  }

  async markNotificationAsRead(notificationId: string) {
    await this.delay(200);
    return {
      success: true,
      message: 'Notification marked as read'
    };
  }

  async markAllNotificationsAsRead() {
    await this.delay(300);
    return {
      success: true,
      message: 'All notifications marked as read'
    };
  }

  // Password reset methods
  async requestPasswordReset(email: string) {
    await this.delay(800);
    return {
      success: true,
      message: 'Password reset email sent successfully'
    };
  }

  async confirmPasswordReset(token: string, password: string) {
    await this.delay(600);
    return {
      success: true,
      message: 'Password reset successfully'
    };
  }

  // Email verification methods
  async verifyEmail(token: string) {
    await this.delay(500);
    return {
      success: true,
      data: {
        user: {
          id: 'mock-user-id',
          email: 'user@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'ENTREPRENEUR',
          phone_number: '+263123456789',
          organization_name: 'Mock Organization',
          profile_completion_percentage: 75,
          reliability_score: 85,
          email_verified: true,
          status: 'ACTIVE',
          date_registered: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      },
      message: 'Email verified successfully'
    };
  }

  async resendEmailVerification(email: string) {
    await this.delay(400);
    return {
      success: true,
      message: 'Verification email sent successfully'
    };
  }

  // Password change method
  async changePassword(currentPassword: string, newPassword: string) {
    await this.delay(600);
    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  // Token refresh method
  async refreshToken() {
    await this.delay(300);
    return {
      success: true,
      data: {
        token: 'mock-refreshed-token-' + Date.now()
      },
      message: 'Token refreshed successfully'
    };
  }

  // Update last login
  async updateLastLogin() {
    await this.delay(200);
    return {
      success: true,
      message: 'Last login updated'
    };
  }

  async healthCheck() {
    await this.delay(100);
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: 'development-mock'
      }
    };
  }

  async testConnection() {
    try {
      const response = await this.healthCheck();
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Connection failed' 
      };
    }
  }
}

export const mockApiService = new MockApiService();