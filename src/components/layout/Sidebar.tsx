import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign, 
  Settings, 
  ShieldCheck,
  Briefcase,
  UserCheck,
  BarChart3,
  AlertTriangle,
  HandshakeIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: string[];
  badge?: string;
}

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems: SidebarItem[] = [
    // Common items
    {
      icon: <Home className="h-5 w-5" />,
      label: t('dashboard.title'),
      path: '/dashboard',
      roles: ['ADMIN', 'ENTREPRENEUR', 'INVESTOR', 'SERVICE_PROVIDER', 'OBSERVER'],
    },
    
    // Entrepreneur specific
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: t('opportunities.myOpportunities'),
      path: '/opportunities',
      roles: ['ENTREPRENEUR'],
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: t('dashboard.performance'),
      path: '/performance',
      roles: ['ENTREPRENEUR'],
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      label: t('settlement.title'),
      path: '/settlement-plans',
      roles: ['ENTREPRENEUR'],
    },
    
    // Investor specific
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: t('opportunities.browseOpportunities'),
      path: '/browse-opportunities',
      roles: ['INVESTOR'],
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: t('investments.myInvestments'),
      path: '/investments',
      roles: ['INVESTOR'],
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: t('pools.title'),
      path: '/pools',
      roles: ['INVESTOR'],
    },
    
    // Service Provider specific
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: t('serviceProviders.serviceRequests'),
      path: '/service-requests',
      roles: ['SERVICE_PROVIDER'],
      badge: '2'
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: t('serviceProviders.myServices'),
      path: '/services',
      roles: ['SERVICE_PROVIDER'],
    },
    
    // Observer specific
    {
      icon: <UserCheck className="h-5 w-5" />,
      label: t('observer.observedEntities'),
      path: '/observed',
      roles: ['OBSERVER'],
    },
    
    // Admin specific
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      label: t('admin.userManagement'),
      path: '/admin/users',
      roles: ['ADMIN'],
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: t('admin.opportunityReview'),
      path: '/admin/opportunities',
      roles: ['ADMIN'],
      badge: '5'
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: t('admin.paymentConfirmation'),
      path: '/admin/payments',
      roles: ['ADMIN'],
      badge: '3'
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: t('admin.poolManagement'),
      path: '/admin/pools',
      roles: ['ADMIN'],
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: t('admin.platformSettings'),
      path: '/admin/settings',
      roles: ['ADMIN'],
    },
    
    // Common bottom items
    {
      icon: <HandshakeIcon className="h-5 w-5" />,
      label: t('agreements.title'),
      path: '/agreements',
      roles: ['ENTREPRENEUR', 'INVESTOR', 'SERVICE_PROVIDER'],
    },
  ];

  const filteredItems = sidebarItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const currentPath = window.location.pathname;

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300`}>
      {/* Collapse Toggle */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {filteredItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === item.path
                  ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-r-2 border-primary-500'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-medium px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>
      </div>
      
      {/* Support Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-primary-50 dark:bg-primary-900 rounded-lg p-4">
            <h3 className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
              {t('help.title')}
            </h3>
            <p className="text-xs text-primary-700 dark:text-primary-300 mb-3">
              {t('help.contactSupport')}
            </p>
            <div className="space-y-1 text-xs text-primary-600 dark:text-primary-400">
              <p>📞 +263789989619</p>
              <p>📧 admin@abathwa.com</p>
              <p>💬 wa.me/789989619</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;