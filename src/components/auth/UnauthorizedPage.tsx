import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { authService } from '../../services/authService';

const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as {
    from?: string;
    reason?: string;
    requiredRoles?: string[];
    requiredPermissions?: string[];
  };

  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  const getErrorMessage = () => {
    if (!isAuthenticated) {
      return t('errors.authenticationRequired');
    }

    switch (state?.reason) {
      case 'insufficient_role':
        return t('errors.insufficientRole', { 
          roles: state.requiredRoles?.join(', ') || 'required roles' 
        });
      case 'insufficient_permissions':
        return t('errors.insufficientPermissions', {
          permissions: state.requiredPermissions?.join(', ') || 'required permissions'
        });
      default:
        return t('errors.accessDenied');
    }
  };

  const getActionButtons = () => {
    if (!isAuthenticated) {
      return (
        <div className="space-y-4">
          <button
            onClick={() => navigate('/login', { 
              state: { from: state?.from || '/' }
            })}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            {t('auth.login')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            {t('common.goHome')}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Home className="h-4 w-4 mr-2" />
          {t('dashboard.title')}
        </button>
        {state?.from && (
          <button
            onClick={() => navigate(-1)}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-error-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('errors.accessDenied')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getErrorMessage()}
          </p>
          
          {user && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.currentUser')}: <span className="font-medium">{user.first_name} {user.last_name}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.role')}: <span className="font-medium">{t(`roles.${user.role.toLowerCase()}`)}</span>
              </p>
            </div>
          )}

          {getActionButtons()}
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;