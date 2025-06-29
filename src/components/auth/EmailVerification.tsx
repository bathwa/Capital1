import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';
import LanguageToggle from '../common/LanguageToggle';
import ThemeToggle from '../common/ThemeToggle';
import LoadingSpinner from '../common/LoadingSpinner';

const EmailVerification: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError(t('auth.invalidVerificationToken'));
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        
        if (response.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/login', { 
              state: { message: t('auth.emailVerifiedSuccess') }
            });
          }, 3000);
        } else {
          setError(response.message || t('auth.emailVerificationFailed'));
        }
      } catch (err: any) {
        setError(err.message || t('errors.networkError'));
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, t]);

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setError('');

    try {
      const response = await authService.resendEmailVerification();
      
      if (response.success) {
        setResendSuccess(true);
      } else {
        setError(response.message || t('auth.resendVerificationFailed'));
      }
    } catch (err: any) {
      setError(err.message || t('errors.networkError'));
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t('auth.verifyingEmail')}
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="flex justify-between items-center">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-success-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('auth.emailVerified')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('auth.emailVerifiedMessage')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('auth.redirectingToLogin')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-between items-center">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-error-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.emailVerificationFailed')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>

          {resendSuccess && (
            <div className="bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700 text-success-700 dark:text-success-200 px-4 py-3 rounded-lg mb-6">
              {t('auth.verificationEmailResent')}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('auth.resendingVerification')}
                </div>
              ) : (
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('auth.resendVerification')}
                </div>
              )}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              {t('auth.backToLogin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;