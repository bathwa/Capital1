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

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      // First, sign up the user with Supabase Auth
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

      // If signup successful, create user profile in our users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: credentials.email,
            first_name: credentials.firstName,
            last_name: credentials.lastName,
            role: credentials.role,
            organization_name: credentials.organizationName,
            phone_number: credentials.phoneNumber,
            status: 'PENDING_EMAIL_CONFIRMATION',
            email_verified: false,
            profile_completion_percentage: 30,
            reliability_score: 0,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Note: User is still created in auth, but profile creation failed
        }
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
      
      if (error) {
        console.error('Logout error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
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

  // Auth state change listener
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}

export const authService = new AuthService();