import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';
import apiService from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
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
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('abathwa_token');
      const userData = localStorage.getItem('abathwa_user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          
          // Verify token is still valid by fetching current user
          const currentUser = await apiService.getCurrentUser();
          dispatch({ type: 'SET_USER', payload: { user: currentUser, token } });
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('abathwa_token');
          localStorage.removeItem('abathwa_user');
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
      const response = await apiService.login(email, password);
      const { token, user } = response;
      
      localStorage.setItem('abathwa_token', token);
      localStorage.setItem('abathwa_user', JSON.stringify(user));
      
      dispatch({ type: 'SET_USER', payload: { user, token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('abathwa_token');
    localStorage.removeItem('abathwa_user');
    dispatch({ type: 'CLEAR_USER' });
  };

  const register = async (userData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await apiService.register(userData);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const updatedUser = await apiService.updateProfile(updates);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      if (state.user) {
        localStorage.setItem('abathwa_user', JSON.stringify({ ...state.user, ...updatedUser }));
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        updateProfile,
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