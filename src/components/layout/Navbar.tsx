import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, User, LogOut, Settings, UserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageToggle from '../common/LanguageToggle';
import ThemeToggle from '../common/ThemeToggle';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'ENTREPRENEUR': t('roles.entrepreneur'),
      'INVESTOR': t('roles.investor'),
      'SERVICE_PROVIDER': t('roles.serviceProvider'),
      'ADMIN': t('roles.admin'),
      'OBSERVER': t('roles.observer')
    };
    return roleMap[role] || t('roles.user');
  };

  const roleColors = {
    ENTREPRENEUR: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
    INVESTOR: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    SERVICE_PROVIDER: 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200',
    ADMIN: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200',
    OBSERVER: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/dashboard" className="flex items-center">
                <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  Abathwa Capital
                </h1>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                {t('common.tagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageToggle />
            <ThemeToggle />
            
            {user && (
              <>
                {/* Role Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role as keyof typeof roleColors]}`}>
                  {getRoleDisplay(user.role)}
                </span>

                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                    )}
                    <span className="font-medium">{user.first_name}</span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        {user.organization_name && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.organization_name}
                          </p>
                        )}
                      </div>
                      
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-2 w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          <UserCircle className="h-4 w-4" />
                          <span>{t('profile.title')}</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-2 w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          <Settings className="h-4 w-4" />
                          <span>{t('settings.title')}</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-error-600 dark:text-error-400"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{t('auth.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            
            {user && (
              <>
                <div className="flex items-center space-x-3 p-2">
                  {user.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role as keyof typeof roleColors]}`}>
                      {getRoleDisplay(user.role)}
                    </span>
                  </div>
                </div>
                
                <button className="flex items-center space-x-2 w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <Bell className="h-4 w-4" />
                  <span>{t('notifications.title')}</span>
                  <span className="ml-auto bg-error-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>
                
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <UserCircle className="h-4 w-4" />
                  <span>{t('profile.title')}</span>
                </Link>
                
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Settings className="h-4 w-4" />
                  <span>{t('settings.title')}</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-error-600 dark:text-error-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('auth.logout')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;