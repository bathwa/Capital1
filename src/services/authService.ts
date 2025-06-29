import { User } from '../types';
import apiService from './api';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  organization_name?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
  errors?: string[];
}

class AuthService {
  private readonly TOKEN_KEY = 'abathwa_token';
  private readonly USER_KEY = 'abathwa_user';
  private readonly REMEMBER_EMAIL_KEY = 'abathwa_remember_email';
  private readonly SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds
  private sessionTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSessionTimer();
  }

  // Session Management
  private initializeSessionTimer() {
    const token = this.getToken();
    if (token) {
      this.startSessionTimer();
    }
  }

  private startSessionTimer() {
    this.clearSessionTimer();
    this.sessionTimer = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.SESSION_TIMEOUT);
  }

  private clearSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private handleSessionTimeout() {
    this.logout();
    window.dispatchEvent(new CustomEvent('auth:session-timeout'));
  }

  // Token Management
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.startSessionTimer();
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.clearSessionTimer();
  }

  // User Data Management
  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Authentication State
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.login(credentials.email, credentials.password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store authentication data
        this.setToken(token);
        this.setUser(user);
        
        // Handle remember me
        if (credentials.rememberMe) {
          localStorage.setItem(this.REMEMBER_EMAIL_KEY, credentials.email);
        } else {
          localStorage.removeItem(this.REMEMBER_EMAIL_KEY);
        }

        // Update last login
        await this.updateLastLogin();

        return {
          success: true,
          data: { user, token },
          message: 'Login successful'
        };
      }

      return {
        success: false,
        message: response.message || 'Login failed'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Login failed',
        errors: error.errors
      };
    }
  }

  // Registration
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        };
      }

      const userData = {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        role: data.role,
        organization_name: data.organization_name
      };

      const response = await apiService.register(userData);
      
      return {
        success: response.success,
        message: response.message || 'Registration successful',
        errors: response.errors
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Registration failed',
        errors: error.errors
      };
    }
  }

  // Password Reset Request
  async requestPasswordReset(data: PasswordResetRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.requestPasswordReset(data.email);
      
      return {
        success: response.success,
        message: response.message || 'Password reset email sent'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send password reset email'
      };
    }
  }

  // Password Reset Confirmation
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<AuthResponse> {
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        };
      }

      const response = await apiService.confirmPasswordReset(data.token, data.password);
      
      return {
        success: response.success,
        message: response.message || 'Password reset successful'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Password reset failed'
      };
    }
  }

  // Email Verification
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await apiService.verifyEmail(token);
      
      if (response.success && response.data) {
        // Update user data if verification successful
        this.setUser(response.data.user);
      }
      
      return {
        success: response.success,
        message: response.message || 'Email verified successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Email verification failed'
      };
    }
  }

  // Resend Email Verification
  async resendEmailVerification(): Promise<AuthResponse> {
    try {
      const user = this.getUser();
      if (!user) {
        return {
          success: false,
          message: 'No user found'
        };
      }

      const response = await apiService.resendEmailVerification(user.email);
      
      return {
        success: response.success,
        message: response.message || 'Verification email sent'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send verification email'
      };
    }
  }

  // Update Profile
  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await apiService.updateProfile(updates);
      
      if (response.success && response.data) {
        // Update stored user data
        const currentUser = this.getUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...response.data };
          this.setUser(updatedUser);
        }
      }
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Profile updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Profile update failed'
      };
    }
  }

  // Change Password
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<AuthResponse> {
    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: 'New passwords do not match'
        };
      }

      const response = await apiService.changePassword(currentPassword, newPassword);
      
      return {
        success: response.success,
        message: response.message || 'Password changed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Password change failed'
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Call API logout to invalidate server-side session
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      this.removeToken();
      this.removeUser();
      this.clearSessionTimer();
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  // Refresh Token
  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiService.refreshToken();
      
      if (response.success && response.data) {
        this.setToken(response.data.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Get Remembered Email
  getRememberedEmail(): string | null {
    return localStorage.getItem(this.REMEMBER_EMAIL_KEY);
  }

  // Update Last Login
  private async updateLastLogin(): Promise<void> {
    try {
      await apiService.updateLastLogin();
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  }

  // Check if user has role
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  // Check if user has any of the roles
  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }

  // Get user permissions based on role
  getUserPermissions(): string[] {
    const user = this.getUser();
    if (!user) return [];

    const rolePermissions: Record<string, string[]> = {
      ADMIN: ['*'], // All permissions
      ENTREPRENEUR: [
        'opportunities:create',
        'opportunities:read',
        'opportunities:update',
        'opportunities:delete',
        'milestones:create',
        'milestones:update',
        'settlements:create',
        'agreements:read'
      ],
      INVESTOR: [
        'opportunities:read',
        'investments:create',
        'investments:read',
        'pools:create',
        'pools:join',
        'agreements:read'
      ],
      SERVICE_PROVIDER: [
        'services:create',
        'services:read',
        'services:update',
        'requests:accept',
        'requests:decline'
      ],
      OBSERVER: [
        'opportunities:read',
        'investments:read',
        'reports:read'
      ]
    };

    return rolePermissions[user.role] || [];
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes('*') || permissions.includes(permission);
  }
}

export const authService = new AuthService();
export default authService;