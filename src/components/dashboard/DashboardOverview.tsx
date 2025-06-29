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
  type: string;
  message: string;
  time: string;
}

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch role-specific dashboard data
        const dashboardData = await apiService.getCurrentUser();
        
        // Set stats based on user role
        const roleStats = getStatsForRole(user.role, dashboardData);
        setStats(roleStats);

        // Fetch recent activity
        const notifications = await apiService.getNotifications();
        const activities = notifications.slice(0, 4).map((notif: any) => ({
          type: notif.type.toLowerCase(),
          message: notif.message,
          time: new Date(notif.created_at).toLocaleString()
        }));
        setRecentActivity(activities);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
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
            value: data.total_users || '0',
            icon: <Users className="h-6 w-6 text-primary-600" />,
            change: '+12%',
            changeType: 'positive',
            description: t('dashboard.activeUsers')
          },
          {
            title: t('dashboard.pendingApprovals'),
            value: data.pending_approvals || '0',
            icon: <Clock className="h-6 w-6 text-warning-600" />,
            description: t('opportunities.pendingReview')
          },
          {
            title: t('dashboard.activeInvestments'),
            value: `$${data.active_investments || '0'}`,
            icon: <DollarSign className="h-6 w-6 text-success-600" />,
            change: '+18%',
            changeType: 'positive',
            description: t('investments.totalActive')
          },
          {
            title: t('dashboard.platformRevenue'),
            value: `$${data.platform_revenue || '0'}`,
            icon: <TrendingUp className="h-6 w-6 text-accent-600" />,
            change: '+25%',
            changeType: 'positive',
            description: t('dashboard.monthlyFees')
          }
        ];
      
      case 'ENTREPRENEUR':
        return [
          {
            title: t('opportunities.activeOpportunities'),
            value: data.active_opportunities || '0',
            icon: <TrendingUp className="h-6 w-6 text-primary-600" />,
            description: t('opportunities.seekingFunding')
          },
          {
            title: t('dashboard.totalFunded'),
            value: `$${data.total_funded || '0'}`,
            icon: <DollarSign className="h-6 w-6 text-success-600" />,
            change: '+15%',
            changeType: 'positive',
            description: t('dashboard.lifetimeFunding')
          },
          {
            title: t('dashboard.reliabilityScore'),
            value: `${data.reliability_score || '0'}%`,
            icon: <CheckCircle className="h-6 w-6 text-success-600" />,
            change: '+5%',
            changeType: 'positive',
            description: t('dashboard.milestoneCompletion')
          },
          {
            title: t('milestones.overdue'),
            value: data.overdue_milestones || '0',
            icon: <AlertTriangle className="h-6 w-6 text-error-600" />,
            description: t('milestones.requireAttention')
          }
        ];
      
      case 'INVESTOR':
        return [
          {
            title: t('investments.activeInvestments'),
            value: data.active_investments || '0',
            icon: <TrendingUp className="h-6 w-6 text-primary-600" />,
            description: t('investments.currentlyInvested')
          },
          {
            title: t('investments.totalInvested'),
            value: `$${data.total_invested || '0'}`,
            icon: <DollarSign className="h-6 w-6 text-primary-600" />,
            description: t('investments.lifetimeAmount')
          },
          {
            title: t('dashboard.portfolioROI'),
            value: `+${data.portfolio_roi || '0'}%`,
            icon: <TrendingUp className="h-6 w-6 text-success-600" />,
            change: '+2.1%',
            changeType: 'positive',
            description: t('investments.averageReturn')
          },
          {
            title: t('pools.memberships'),
            value: data.pool_memberships || '0',
            icon: <Users className="h-6 w-6 text-accent-600" />,
            description: t('pools.poolsJoined')
          }
        ];
      
      case 'SERVICE_PROVIDER':
        return [
          {
            title: t('serviceProviders.activeRequests'),
            value: data.active_requests || '0',
            icon: <FileText className="h-6 w-6 text-primary-600" />,
            description: t('serviceProviders.currentEngagements')
          },
          {
            title: t('serviceProviders.completedServices'),
            value: data.completed_services || '0',
            icon: <CheckCircle className="h-6 w-6 text-success-600" />,
            change: '+8',
            changeType: 'positive',
            description: t('serviceProviders.successfullyDelivered')
          },
          {
            title: t('dashboard.totalEarnings'),
            value: `$${data.total_earnings || '0'}`,
            icon: <DollarSign className="h-6 w-6 text-success-600" />,
            change: '+12%',
            changeType: 'positive',
            description: t('serviceProviders.platformEarnings')
          },
          {
            title: t('dashboard.rating'),
            value: `${data.rating || '0'}/5`,
            icon: <CheckCircle className="h-6 w-6 text-accent-600" />,
            description: t('serviceProviders.clientSatisfaction')
          }
        ];
      
      case 'OBSERVER':
        return [
          {
            title: t('observer.observedEntities'),
            value: data.observed_entities || '0',
            icon: <Eye className="h-6 w-6 text-primary-600" />,
            description: t('observer.entitiesMonitored')
          },
          {
            title: t('observer.permissions'),
            value: data.access_permissions || '0',
            icon: <Users className="h-6 w-6 text-success-600" />,
            description: t('observer.accessLevels')
          },
          {
            title: t('dashboard.recentReports'),
            value: data.recent_reports || '0',
            icon: <FileText className="h-6 w-6 text-accent-600" />,
            description: t('dashboard.newReportsAvailable')
          },
          {
            title: t('dashboard.alerts'),
            value: data.alerts || '0',
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

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
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
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('dashboard.noRecentActivity')}
              </p>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium">
              {t('dashboard.viewAll')} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;