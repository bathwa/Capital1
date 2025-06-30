import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
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
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      // Quick check for existing session without loading state
      if (authService.isAuthenticated()) {
        const user = authService.getUser();
        const token = authService.getToken();
        
        if (user && token) {
          dispatch({ type: 'SET_USER', payload: { user, token } });
          return;
        }
      }
      
      // Clear any invalid session data
      await authService.logout();
      dispatch({ type: 'CLEAR_USER' });
    };

    initializeAuth();

    // Listen for auth events
    const handleLogout = () => {
      dispatch({ type: 'CLEAR_USER' });
    };

    const handleSessionTimeout = () => {
      dispatch({ type: 'SET_ERROR', payload: 'Your session has expired. Please log in again.' });
      dispatch({ type: 'CLEAR_USER' });
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:session-timeout', handleSessionTimeout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:session-timeout', handleSessionTimeout);
    };
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const response = await authService.login({ email, password, rememberMe });
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      if (response.data) {
        const { user, token } = response.data;
        dispatch({ type: 'SET_USER', payload: { user, token } });
        
        // Navigate to role-specific dashboard
        const roleRoutes = {
          'ADMIN': '/admin-dashboard',
          'ENTREPRENEUR': '/entrepreneur-dashboard', 
          'INVESTOR': '/investor-dashboard',
          'SERVICE_PROVIDER': '/service-provider-dashboard',
          'OBSERVER': '/observer-dashboard'
        };
        
        const targetRoute = roleRoutes[user.role as keyof typeof roleRoutes] || '/dashboard';
        window.location.href = targetRoute;
      } else {
        throw new Error('Login failed - no user data received');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'CLEAR_USER' });
      // Redirect to landing page after logout
      window.location.href = '/';
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
    organization_name?: string;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const response = await authService.register({
        email: userData.email,
        password: userData.password,
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number,
        role: userData.role as 'ENTREPRENEUR' | 'INVESTOR' | 'SERVICE_PROVIDER',
        organizationName: userData.organization_name,
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Registration failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!state.user) {
        throw new Error('No user logged in');
      }

      const response = await authService.updateUserProfile(state.user.id, updates);
      
      if (response.error) {
        throw new Error(response.error.message || 'Profile update failed');
      }

      if (response.data) {
        dispatch({ type: 'UPDATE_USER', payload: response.data });
        // Update localStorage
        localStorage.setItem('abathwa_user', JSON.stringify({ ...state.user, ...response.data }));
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