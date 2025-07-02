import { supabase } from './supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
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
  user: any | null;
  error: AuthError | null;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<ServiceResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        return { 
          success: false, 
          message: this.getErrorMessage(error)
        };
      }

      if (!data.user) {
        return { 
          success: false, 
          message: 'Authentication failed - no user data received'
        };
      }

      // Fetch the complete user profile from the users table
      let { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // If profile doesn't exist, the auth webhook should have created it
        // This might be a timing issue or the webhook failed
        if (profileError.code === 'PGRST116') {
          return { 
            success: false, 
            message: 'User profile not found. Please contact support if this issue persists.'
          };
        } else {
          return { 
            success: false, 
            message: 'Failed to fetch user profile'
          };
        }
      }

      // Store authentication data
      if (data.session) {
        localStorage.setItem('abathwa_token', data.session.access_token);
        localStorage.setItem('abathwa_user', JSON.stringify(userProfile));
        
        // Handle remember me
        if (credentials.rememberMe) {
          localStorage.setItem('abathwa_remember_email', credentials.email);
        }
      }

      return { 
        success: true, 
        data: { 
          user: userProfile, 
          token: data.session?.access_token 
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'An unexpected error occurred during login'
      };
    }
  }

  async register(credentials: SignupCredentials): Promise<ServiceResponse> {
    try {
      // Sign up the user with Supabase Auth
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
        console.error('Supabase signup error:', error);
        return { 
          success: false, 
          message: this.getErrorMessage(error)
        };
      }

      if (!data.user) {
        return { 
          success: false, 
          message: 'Registration failed - no user data received'
        };
      }

      // If we have a session (email confirmation disabled), the auth webhook will create the profile
      if (data.session) {
        // Store authentication data - the webhook will have created the profile
        localStorage.setItem('abathwa_token', data.session.access_token);
        
        // Wait a moment for the webhook to process, then fetch the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch the user profile created by the webhook
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error after signup:', profileError);
          // If webhook failed to create profile, return error instead of trying to create it client-side
          return { 
            success: false, 
            message: 'Registration completed but failed to create user profile. Please contact support.'
          };
        }

        localStorage.setItem('abathwa_user', JSON.stringify(userProfile));

        return { 
          success: true, 
          data: { 
            user: userProfile, 
            token: data.session.access_token 
          }
        };
      }

      // Email confirmation required
      return { 
        success: true, 
        message: 'Registration successful! Please check your email to confirm your account.'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'An unexpected error occurred during registration'
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

  // Helper method to convert Supabase errors to user-friendly messages
  private getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link before signing in.';
      case 'Too many requests':
        return 'Too many login attempts. Please wait a moment before trying again.';
      case 'User not found':
        return 'No account found with this email address.';
      case 'Signup disabled':
        return 'New account registration is currently disabled.';
      case 'Email already registered':
        return 'An account with this email address already exists.';
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.';
      case 'Invalid email':
        return 'Please enter a valid email address.';
      default:
        return error.message || 'An authentication error occurred. Please try again.';
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

  getUser(): any | null {
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