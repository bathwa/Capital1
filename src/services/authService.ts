import { supabase } from './supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ENTREPRENEUR' | 'INVESTOR' | 'SERVICE_PROVIDER';
  organizationName?: string;
  phoneNumber: string;
}

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error };
      }

      // Store authentication data in localStorage
      if (data.user && data.session) {
        localStorage.setItem('abathwa_token', data.session.access_token);
        localStorage.setItem('abathwa_user', JSON.stringify(data.user));
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        user: null, 
        error: { 
          message: 'An unexpected error occurred during login',
          name: 'AuthError',
          status: 500
        } as AuthError 
      };
    }
  }

  async register(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      // Sign up the user with Supabase Auth
      // The auth webhook will handle creating the user profile in the database
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName,
            last_name: credentials.lastName,
            role: credentials.role,
            organization_name: credentials.organizationName,
            phone_number: credentials.phoneNumber,
          }
        }
      });

      if (error) {
        return { user: null, error };
      }

      // Store authentication data in localStorage if session exists
      if (data.user && data.session) {
        localStorage.setItem('abathwa_token', data.session.access_token);
        localStorage.setItem('abathwa_user', JSON.stringify(data.user));
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        user: null, 
        error: { 
          message: 'An unexpected error occurred during signup',
          name: 'AuthError',
          status: 500
        } as AuthError 
      };
    }
  }

  async logout(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear localStorage regardless of Supabase signOut result
      localStorage.removeItem('abathwa_token');
      localStorage.removeItem('abathwa_user');
      
      if (error) {
        console.error('Logout error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear localStorage even if there's an error
      localStorage.removeItem('abathwa_token');
      localStorage.removeItem('abathwa_user');
      
      return { 
        error: { 
          message: 'An unexpected error occurred during logout',
          name: 'AuthError',
          status: 500
        } as AuthError 
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        error: { 
          message: 'An unexpected error occurred during password reset',
          name: 'AuthError',
          status: 500
        } as AuthError 
      };
    }
  }

  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Password update error:', error);
      return { 
        error: { 
          message: 'An unexpected error occurred during password update',
          name: 'AuthError',
          status: 500
        } as AuthError 
      };
    }
  }

  async verifyEmail(token: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        return { error };
      }

      // Update localStorage if verification successful
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem('abathwa_user', JSON.stringify(user));
      }

      return { error: null };
    } catch (error) {
      console.error('Email verification error:', error);
      return { 
        error: { 
          message: 'An unexpected error occurred during email verification',
          name: 'AuthError',
          status: 500
        } as AuthError 
      };
    }
  }

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Get user profile error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { data: null, error };
    }
  }

  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Update user profile error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { data: null, error };
    }
  }

  // Synchronous methods for checking authentication state
  isAuthenticated(): boolean {
    const token = localStorage.getItem('abathwa_token');
    const user = localStorage.getItem('abathwa_user');
    return !!(token && user);
  }

  getToken(): string | null {
    return localStorage.getItem('abathwa_token');
  }

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem('abathwa_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  // Auth state change listener
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      // Update localStorage when auth state changes
      if (session?.user && session?.access_token) {
        localStorage.setItem('abathwa_token', session.access_token);
        localStorage.setItem('abathwa_user', JSON.stringify(session.user));
      } else {
        localStorage.removeItem('abathwa_token');
        localStorage.removeItem('abathwa_user');
      }
      
      callback(session?.user || null);
    });
  }
}

export const authService = new AuthService();