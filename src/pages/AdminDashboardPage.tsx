import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Shield,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  totalInvestments: number;
  platformRevenue: number;
  monthlyGrowth: number;
}

interface PendingItem {
  id: string;
  type: 'USER' | 'OPPORTUNITY' | 'PAYMENT';
  title: string;
  description: string;
  createdAt: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalInvestments: 0,
    platformRevenue: 0,
    monthlyGrowth: 0
  });

  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 1247,
        activeUsers: 892,
        pendingApprovals: 23,
        totalInvestments: 2450000,
        platformRevenue: 125000,
        monthlyGrowth: 12.5
      });

      setPendingItems([
        {
          id: '1',
          type: 'OPPORTUNITY',
          title: 'Solar Energy Installation Project',
          description: 'New opportunity requiring admin approval for funding stage',
          createdAt: '2024-01-20',
          priority: 'HIGH'
        },
        {
          id: '2',
          type: 'PAYMENT',
          title: 'Investment Payment Confirmation',
          description: 'Payment verification needed for $25,000 investment',
          createdAt: '2024-01-19',
          priority: 'URGENT'
        },
        {
          id: '3',
          type: 'USER',
          title: 'Service Provider Registration',
          description: 'Legal consultant awaiting profile verification',
          createdAt: '2024-01-18',
          priority: 'MEDIUM'
        }
      ]);

      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'USER':
        return <Users className="h-4 w-4" />;
      case 'OPPORTUNITY':
        return <TrendingUp className="h-4 w-4" />;
      case 'PAYMENT':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('admin.title')} Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Platform administration and management overview
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-success-600 mt-1">
                +{stats.monthlyGrowth}% this month
              </p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.activeUsers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.pendingApprovals}
              </p>
              <p className="text-sm text-warning-600 mt-1">
                Requires attention
              </p>
            </div>
            <Clock className="h-8 w-8 text-warning-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Platform Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${stats.platformRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-success-600 mt-1">
                This month
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-success-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Manage user accounts, roles, and permissions
          </p>
          <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
            Manage Users
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Opportunity Review</h3>
            <TrendingUp className="h-6 w-6 text-success-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Review and approve funding opportunities
          </p>
          <button className="w-full bg-success-600 text-white py-2 px-4 rounded-lg hover:bg-success-700 transition-colors">
            Review Opportunities
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Verification</h3>
            <DollarSign className="h-6 w-6 text-accent-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Verify and confirm investment payments
          </p>
          <button className="w-full bg-accent-600 text-white py-2 px-4 rounded-lg hover:bg-accent-700 transition-colors">
            Verify Payments
          </button>
        </div>
      </div>

      {/* Pending Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Actions
            </h2>
            <span className="bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200 px-2 py-1 rounded-full text-sm font-medium">
              {pendingItems.length} items
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-success-600 text-white rounded hover:bg-success-700 transition-colors text-sm">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-error-600 text-white rounded hover:bg-error-700 transition-colors text-sm">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h3>
            <Shield className="h-6 w-6 text-success-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
              <span className="flex items-center text-sm text-success-600">
                <div className="w-2 h-2 bg-success-600 rounded-full mr-2"></div>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <span className="flex items-center text-sm text-success-600">
                <div className="w-2 h-2 bg-success-600 rounded-full mr-2"></div>
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Payment Gateway</span>
              <span className="flex items-center text-sm text-success-600">
                <div className="w-2 h-2 bg-success-600 rounded-full mr-2"></div>
                Connected
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <BarChart3 className="h-6 w-6 text-primary-600" />
          </div>
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">New user registration:</span>
              <span className="text-gray-900 dark:text-white ml-2">5 minutes ago</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Investment approved:</span>
              <span className="text-gray-900 dark:text-white ml-2">12 minutes ago</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Payment confirmed:</span>
              <span className="text-gray-900 dark:text-white ml-2">25 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;