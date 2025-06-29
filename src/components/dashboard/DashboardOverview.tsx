import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/api';

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard data from production API
        const [dashboardData, notifications] = await Promise.all([
          apiService.getDashboardData(),
          apiService.getNotifications({ limit: 5 })
        ]);
        
        // Set stats based on user role and real data
        const roleStats = getStatsForRole(user.role, dashboardData);
        setStats(roleStats);

        // Set recent activity from real notifications
        const activities = notifications.data?.map((notif: any) => ({
          id: notif.id,
          type: notif.type,
          message: notif.message,
          created_at: notif.created_at,
          is_read: notif.is_read
        })) || [];
        
        setRecentActivity(activities);

      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        setError(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getStatsForRole = (role: string, data: any): StatCard[] => {
    switch (role) {
      case 'ADMIN':
        return [
          {
            title: t('dashboard.totalUsers'),
            value: data.total_users?.toString() || '0',
            icon: <Users className="h-6 w-6 text-primary-600" />,
            change: data.user_growth_percentage ? `+${data.user_growth_percentage}%` : undefined,
            changeType: 'positive',
            description: t('dashboard.activeUsers')
          },
          {
            title: t('dashboard.pendingApprovals'),
            value: data.pending_approvals?.toString() || '0',
            icon: <Clock className="h-6 w-6 text-warning-600" />,
            description: t('opportunities.pendingReview')
          },
          {
            title: t('dashboard.activeInvestments'),
            value: `$${data.total_active_investments?.toLocaleString() || '0'}`,
            icon: <DollarSign className="h-6 w-6 text-success-600" />,
            change: data.investment_growth_percentage ? `+${data.investment_growth_percentage}%` : undefined,
            changeType: 'positive',
            description: t('investments.totalActive')
          },
          {
            title: t('dashboard.platformRevenue'),
            value: `$${data.platform_revenue?.toLocaleString() || '0'}`,
            icon: <TrendingUp className="h-6 w-6 text-accent-600" />,
            change: data.revenue_growth_percentage ? `+${data.revenue_growth_percentage}%` : undefined,
            changeType: 'positive',
            description: t('dashboard.monthlyFees')
          }
        ];
      
      case 'ENTREPRENEUR':
        return [
          {
            title: t('opportunities.activeOpportunities'),
            value: data.active_opportunities?.toString() || '0',
            icon: <TrendingUp className="h-6 w-6 text-primary-600" />,
            description: t('opportunities.seekingFunding')
          },
          {
            title: t('dashboard.totalFunded'),
            value: `$${data.total_funded?.toLocaleString() || '0'}`,
            icon: <DollarSign className="h-6 w-6 text-success-600" />,
            change: data.funding_growth_percentage ? `+${data.funding_growth_percentage}%` : undefined,
            changeType: 'positive',
            description: t('dashboard.lifetimeFunding')
          },
          {
            title: t('dashboard.reliabilityScore'),
            value: `${data.reliability_score || '0'}%`,
            icon: <CheckCircle className="h-6 w-6 text-success-600" />,
            change: data.reliability_change ? `${data.reliability_change > 0 ? '+' : ''}${data.reliability_change}%` : undefined,
            changeType: data.reliability_change > 0 ? 'positive' : 'negative',
            description: t('dashboard.milestoneCompletion')
          },
          {
            title: t('milestones.overdue'),
            value: data.overdue_milestones?.toString() || '0',
            icon: <AlertTriangle className="h-6 w-6 text-error-600" />,
            description: t('milestones.requireAttention')
          }
        ];
      
      case 'INVESTOR':
        return [
          {
            title: t('investments.activeInvestments'),
            value: data.active_investments?.toString() || '0',
            icon: <TrendingUp className="h-6 w-6 text-primary-600" />,
            description: t('investments.currentlyInvested')
          },
          {
            title: t('investments.totalInvested'),
            value: `$${data.total_invested?.toLocaleString() || '0'}`,
            icon: <DollarSign className="h-6 w-6 text-primary-600" />,
            description: t('investments.lifetimeAmount')
          },
          {
            title: t('dashboard.portfolioROI'),
            value: `${data.portfolio_roi > 0 ? '+' : ''}${data.portfolio_roi || '0'}%`,
            icon: <TrendingUp className="h-6 w-6 text-success-600" />,
            change: data.roi_change ? `${data.roi_change > 0 ? '+' : ''}${data.roi_change}%` : undefined,
            changeType: data.roi_change > 0 ? 'positive' : 'negative',
            description: t('investments.averageReturn')
          },
          {
            title: t('pools.memberships'),
            value: data.pool_memberships?.toString() || '0',
            icon: <Users className="h-6 w-6 text-accent-600" />,
            description: t('pools.poolsJoined')
          }
        ];
      
      case 'SERVICE_PROVIDER':
        return [
          {
            title: t('serviceProviders.activeRequests'),
            value: data.active_requests?.toString() || '0',
            icon: <FileText className="h-6 w-6 text-primary-600" />,
            description: t('serviceProviders.currentEngagements')
          },
          {
            title: t('serviceProviders.completedServices'),
            value: data.completed_services?.toString() || '0',
            icon: <CheckCircle className="h-6 w-6 text-success-600" />,
            change: data.services_growth ? `+${data.services_growth}` : undefined,
            changeType: 'positive',
            description: t('serviceProviders.successfullyDelivered')
          },
          {
            title: t('dashboard.totalEarnings'),
            value: `$${data.total_earnings?.toLocaleString() || '0'}`,
            icon: <DollarSign className="h-6 w-6 text-success-600" />,
            change: data.earnings_growth_percentage ? `+${data.earnings_growth_percentage}%` : undefined,
            changeType: 'positive',
            description: t('serviceProviders.platformEarnings')
          },
          {
            title: t('dashboard.rating'),
            value: `${data.average_rating || '0'}/5`,
            icon: <CheckCircle className="h-6 w-6 text-accent-600" />,
            description: t('serviceProviders.clientSatisfaction')
          }
        ];
      
      case 'OBSERVER':
        return [
          {
            title: t('observer.observedEntities'),
            value: data.observed_entities?.toString() || '0',
            icon: <Eye className="h-6 w-6 text-primary-600" />,
            description: t('observer.entitiesMonitored')
          },
          {
            title: t('observer.permissions'),
            value: data.access_permissions?.toString() || '0',
            icon: <Users className="h-6 w-6 text-success-600" />,
            description: t('observer.accessLevels')
          },
          {
            title: t('dashboard.recentReports'),
            value: data.recent_reports?.toString() || '0',
            icon: <FileText className="h-6 w-6 text-accent-600" />,
            description: t('dashboard.newReportsAvailable')
          },
          {
            title: t('dashboard.alerts'),
            value: data.alerts?.toString() || '0',
            icon: <AlertTriangle className="h-6 w-6 text-warning-600" />,
            description: t('dashboard.performanceAlerts')
          }
        ];
      
      default:
        return [];
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment_confirmed': return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'offer_received': return <TrendingUp className="h-4 w-4 text-primary-500" />;
      case 'milestone_overdue': return <AlertTriangle className="h-4 w-4 text-error-500" />;
      case 'opportunity_approved': return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'agreement_signed': return <FileText className="h-4 w-4 text-primary-500" />;
      case 'funds_released': return <DollarSign className="h-4 w-4 text-success-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-error-600 mr-2" />
          <span className="text-error-800 dark:text-error-200">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.welcome')}, {user.first_name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {t('dashboard.roleDescription', { role: user.role.toLowerCase().replace('_', ' ') })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.profileCompletion')}
            </div>
            <div className="flex items-center mt-1">
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${user.profile_completion_percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user.profile_completion_percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm mt-2 ${
                    stat.changeType === 'positive' ? 'text-success-600' : 
                    stat.changeType === 'negative' ? 'text-error-600' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {stat.change} {t('dashboard.fromLastMonth')}
                  </p>
                )}
                {stat.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.description}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.recentActivity')}
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${activity.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatActivityTime(activity.created_at)}
                    </p>
                  </div>
                  {!activity.is_read && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('dashboard.noRecentActivity')}
              </p>
            )}
          </div>
          
          {recentActivity.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium">
                {t('dashboard.viewAll')} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;