import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Camera, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { validateEmail, validatePhoneNumber, validateName } from '../../utils/authValidation';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  organization_name: string;
  profile_picture_url: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(authService.getUser());
  const [profileData, setProfileData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    organization_name: '',
    profile_picture_url: '',
  });
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        organization_name: user.organization_name || '',
        profile_picture_url: user.profile_picture_url || '',
      });
    }
  }, [user]);

  const validateProfileForm = (): boolean => {
    // First name validation
    const firstNameValidation = validateName(profileData.first_name, 'First name');
    if (!firstNameValidation.isValid) {
      setError(firstNameValidation.error!);
      return false;
    }

    // Last name validation
    const lastNameValidation = validateName(profileData.last_name, 'Last name');
    if (!lastNameValidation.isValid) {
      setError(lastNameValidation.error!);
      return false;
    }

    // Email validation
    const emailValidation = validateEmail(profileData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error!);
      return false;
    }

    // Phone validation
    const phoneValidation = validatePhoneNumber(profileData.phone_number);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error!);
      return false;
    }

    return true;
  };

  const validatePasswordForm = (): boolean => {
    if (!passwordData.currentPassword) {
      setPasswordError(t('validation.currentPasswordRequired'));
      return false;
    }

    if (!passwordData.newPassword) {
      setPasswordError(t('validation.newPasswordRequired'));
      return false;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError(t('validation.passwordMinLength'));
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      setPasswordError(t('validation.passwordComplexity'));
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('validation.passwordsDoNotMatch'));
      return false;
    }

    return true;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        setSuccess(t('profile.updateSuccess'));
        setUser(authService.getUser()); // Refresh user data
      } else {
        setError(response.message || t('errors.profileUpdateFailed'));
      }
    } catch (err: any) {
      setError(err.message || t('errors.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const response = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      
      if (response.success) {
        setPasswordSuccess(t('profile.passwordChangeSuccess'));
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setPasswordError(response.message || t('errors.passwordChangeFailed'));
      }
    } catch (err: any) {
      setPasswordError(err.message || t('errors.networkError'));
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError('');
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">{t('profile.notLoggedIn')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-600">
                <Camera className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {t(`roles.${user.role.toLowerCase()}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t('profile.profileInfo')}
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t('profile.changePassword')}
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {error && (
                <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700 text-error-700 dark:text-error-200 px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700 text-success-700 dark:text-success-200 px-4 py-3 rounded-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('auth.firstName')} *
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('auth.lastName')} *
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('auth.email')} *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('auth.phoneNumber')} *
                  </label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    required
                    value={profileData.phone_number}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('auth.organization')} ({t('common.optional')})
                  </label>
                  <input
                    id="organization_name"
                    name="organization_name"
                    type="text"
                    value={profileData.organization_name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              {passwordError && (
                <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700 text-error-700 dark:text-error-200 px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700 text-success-700 dark:text-success-200 px-4 py-3 rounded-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  {passwordSuccess}
                </div>
              )}

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('profile.currentPassword')} *
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    required
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('profile.newPassword')} *
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    required
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('auth.passwordRequirements')}
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('profile.confirmNewPassword')} *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    required
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPasswordLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isPasswordLoading ? t('profile.changingPassword') : t('profile.changePassword')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;