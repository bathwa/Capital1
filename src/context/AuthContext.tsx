import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';
import apiService from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('abathwa_token');
      
      if (token) {
        try {
          // Verify token is still valid by fetching current user from production API
          const currentUser = await apiService.getCurrentUser();
          dispatch({ type: 'SET_USER', payload: { user: currentUser, token } });
        } catch (error: any) {
          console.error('Token validation failed:', error);
          
          // Clear invalid token and user data
          localStorage.removeItem('abathwa_token');
          localStorage.removeItem('abathwa_user');
          
          // Don't show error for expired tokens during initialization
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Call production login API
      const response = await apiService.login(email, password);
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }
      
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('abathwa_token', token);
      localStorage.setItem('abathwa_user', JSON.stringify(user));
      
      dispatch({ type: 'SET_USER', payload: { user, token } });
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call production logout API to invalidate token on server
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage and state
      localStorage.removeItem('abathwa_token');
      localStorage.removeItem('abathwa_user');
      localStorage.removeItem('abathwa_remember_email');
      dispatch({ type: 'CLEAR_USER' });
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
    organization_name?: string;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Call production registration API
      const response = await apiService.register(userData);
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error: any) {
      console.error('Registration error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Registration failed' });
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      // Call production profile update API
      const response = await apiService.updateProfile(updates);
      
      if (!response.success) {
        throw new Error(response.message || 'Profile update failed');
      }
      
      const updatedUser = response.data;
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      // Update local storage
      if (state.user) {
        const newUserData = { ...state.user, ...updatedUser };
        localStorage.setItem('abathwa_user', JSON.stringify(newUserData));
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Profile update failed' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};