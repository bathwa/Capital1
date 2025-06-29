import { supabase, signUp, signIn, signOut, getCurrentUser, getUserProfile, updateUserProfile } from '../lib/supabase';
import { User, Opportunity, Investment, InvestmentOffer, Notification } from '../types';

export class SupabaseApiService {
  // Authentication methods
  async login(email: string, password: string) {
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) throw error;
      
      if (data.user) {
        // Get user profile
        const { data: profile, error: profileError } = await getUserProfile(data.user.id);
        
        if (profileError) throw profileError;
        
        return {
          success: true,
          data: {
            user: profile,
            token: data.session?.access_token
          },
          message: 'Login successful'
        };
      }
      
      throw new Error('Login failed');
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
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
    try {
      const { data, error } = await signUp(userData.email, userData.password, {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
        role: userData.role,
        organization_name: userData.organization_name
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone_number: userData.phone_number,
            role: userData.role as any,
            organization_name: userData.organization_name,
            email_verified: false,
            profile_completion_percentage: 30
          })
          .select()
          .single();
        
        if (profileError) throw profileError;
        
        return {
          success: true,
          data: { user: profile },
          message: 'Registration successful. Please check your email to verify your account.'
        };
      }
      
      throw new Error('Registration failed');
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async logout() {
    try {
      const { error } = await signOut();
      if (error) throw error;
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  async getCurrentUser() {
    try {
      const { user, error } = await getCurrentUser();
      
      if (error) throw error;
      if (!user) throw new Error('No user found');
      
      const { data: profile, error: profileError } = await getUserProfile(user.id);
      
      if (profileError) throw profileError;
      
      return profile;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get current user');
    }
  }

  async updateProfile(updates: Partial<User>) {
    try {
      const { user } = await getCurrentUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await updateUserProfile(user.id, updates);
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        message: 'Profile updated successfully'
      };
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  // Dashboard data
  async getDashboardData() {
    try {
      const { user } = await getCurrentUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase.functions.invoke('dashboard-data');
      
      if (error) throw error;
      
      return data.data;
    } catch (error: any) {
      // Fallback to basic queries if edge function fails
      return this.getFallbackDashboardData();
    }
  }

  private async getFallbackDashboardData() {
    const { user } = await getCurrentUser();
    if (!user) throw new Error('No user found');
    
    const { data: profile } = await getUserProfile(user.id);
    if (!profile) throw new Error('Profile not found');
    
    // Basic dashboard data based on role
    const dashboardData: any = {};
    
    switch (profile.role) {
      case 'ADMIN':
        const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: pendingCount } = await supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'PENDING_ADMIN_REVIEW');
        
        dashboardData.total_users = usersCount || 0;
        dashboardData.pending_approvals = pendingCount || 0;
        break;
        
      case 'ENTREPRENEUR':
        const { data: myOpportunities } = await supabase
          .from('opportunities')
          .select('*')
          .eq('entrepreneur_id', user.id);
        
        dashboardData.active_opportunities = myOpportunities?.filter(o => o.status === 'FUNDING_LIVE').length || 0;
        dashboardData.total_funded = myOpportunities?.reduce((sum, o) => sum + o.current_funds_raised, 0) || 0;
        break;
        
      case 'INVESTOR':
        const { data: myInvestments } = await supabase
          .from('investments')
          .select('*')
          .eq('investor_id', user.id);
        
        dashboardData.active_investments = myInvestments?.filter(i => i.status === 'FUNDS_IN_ESCROW').length || 0;
        dashboardData.total_invested = myInvestments?.reduce((sum, i) => sum + i.invested_amount, 0) || 0;
        break;
    }
    
    return dashboardData;
  }

  // Opportunities
  async getOpportunities(filters?: any) {
    try {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          entrepreneur:users!entrepreneur_id(first_name, last_name, organization_name),
          milestones(*)
        `);
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return { data };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch opportunities');
    }
  }

  async createOpportunity(opportunityData: any) {
    try {
      const { user } = await getCurrentUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          ...opportunityData,
          entrepreneur_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        message: 'Opportunity created successfully'
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create opportunity');
    }
  }

  // Investments
  async getInvestments(params?: any) {
    try {
      const { user } = await getCurrentUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile } = await getUserProfile(user.id);
      if (!profile) throw new Error('Profile not found');
      
      let query = supabase
        .from('investments')
        .select(`
          *,
          opportunity:opportunities(*),
          investor:users!investor_id(first_name, last_name)
        `);
      
      if (profile.role === 'INVESTOR') {
        query = query.eq('investor_id', user.id);
      } else if (profile.role === 'ENTREPRENEUR') {
        const { data: myOpportunities } = await supabase
          .from('opportunities')
          .select('id')
          .eq('entrepreneur_id', user.id);
        
        const opportunityIds = myOpportunities?.map(o => o.id) || [];
        query = query.in('opportunity_id', opportunityIds);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return { data };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch investments');
    }
  }

  async createInvestmentOffer(offerData: any) {
    try {
      const { user } = await getCurrentUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('investment_offers')
        .insert({
          ...offerData,
          investor_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        message: 'Investment offer created successfully'
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create investment offer');
    }
  }

  // Notifications
  async getNotifications(params?: any) {
    try {
      const { user } = await getCurrentUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(params?.limit || 10);
      
      if (error) throw error;
      
      return { data };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        message: 'Notification marked as read'
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const { user } = await getCurrentUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'All notifications marked as read'
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark all notifications as read');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      
      return {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: 'supabase'
        }
      };
    } catch (error: any) {
      throw new Error(error.message || 'Health check failed');
    }
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

export const supabaseApiService = new SupabaseApiService();