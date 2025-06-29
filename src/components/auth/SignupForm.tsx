import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import LanguageToggle from '../common/LanguageToggle';
import ThemeToggle from '../common/ThemeToggle';
import LoadingSpinner from '../common/LoadingSpinner';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  organizationName: string;
  acceptTerms: boolean;
}

const SignupForm: React.FC = () => {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: '',
    organizationName: '',
    acceptTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const roles = [
    { value: 'ENTREPRENEUR', label: t('roles.entrepreneur') },
    { value: 'INVESTOR', label: t('roles.investor') },
    { value: 'SERVICE_PROVIDER', label: t('roles.serviceProvider') },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.passwordMinLength');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('validation.passwordComplexity');
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsDoNotMatch');
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('validation.lastNameRequired');
    }

    // Phone validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = t('validation.phoneRequired');
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = t('validation.phoneInvalid');
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = t('validation.roleRequired');
    }

    // Terms validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t('validation.termsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        role: formData.role,
        organization_name: formData.organizationName || undefined,
      };

      await register(userData);
      
      setSuccessMessage(t('auth.registrationSuccess'));
      
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: t('auth.registrationSuccess'),
            email: formData.email 
          }
        });
      }, 2000);

    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors: Record<string, string> = {};
        err.response.data.errors.forEach((error: any) => {
          if (error.field) {
            serverErrors[error.field] = error.message;
          }
        });
        setErrors(serverErrors);
      } else {
        setErrors({
          general: err.response?.data?.message || t('errors.registrationFailed')
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Language and Theme toggles */}
        <div className="flex justify-between items-center">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Abathwa Capital
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('common.tagline')}
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {t('auth.register')}
          </h3>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* General Error */}
          {errors.general && (
            <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700 text-error-700 dark:text-error-200 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {errors.general}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700 text-success-700 dark:text-success-200 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.firstName')} *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.firstName ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={t('auth.firstNamePlaceholder')}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.lastName')} *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.lastName ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={t('auth.lastNamePlaceholder')}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.email')} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  errors.email ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('auth.emailPlaceholder')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.phoneNumber')} *
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  errors.phoneNumber ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="+263 XXX XXX XXX"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.role')} *
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  errors.role ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">{t('auth.selectRole')}</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.role}</p>
              )}
            </div>

            {/* Organization Name (Optional) */}
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.organization')} ({t('common.optional')})
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={t('auth.organizationPlaceholder')}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.password')} *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.password ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={t('auth.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('auth.passwordRequirements')}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.confirmPassword')} *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.confirmPassword ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 ${
                  errors.acceptTerms ? 'border-error-300 dark:border-error-600' : ''
                }`}
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('auth.acceptTerms')}{' '}
                <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:text-primary-500">
                  {t('auth.termsOfService')}
                </a>{' '}
                {t('common.and')}{' '}
                <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:text-primary-500">
                  {t('auth.privacyPolicy')}
                </a>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-error-600 dark:text-error-400">{errors.acceptTerms}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('auth.creatingAccount')}
                </div>
              ) : (
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('auth.register')}
                </div>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
              >
                {t('auth.signInHere')}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;