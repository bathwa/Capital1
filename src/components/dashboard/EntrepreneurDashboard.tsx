import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Upload,
  Eye,
  Edit,
  Plus,
  BarChart3
} from 'lucide-react';
import { Opportunity, Milestone } from '../../types';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import FileUpload from '../common/FileUpload';
import FundingStageProgress from './FundingStageProgress';
import DueDiligenceProfile from './DueDiligenceProfile';
import OpportunityMetrics from './OpportunityMetrics';

interface DashboardStats {
  activeOpportunities: number;
  totalFunded: number;
  fundingGoal: number;
  reliabilityScore: number;
  overdueMilestones: number;
  completedMilestones: number;
  pendingDocuments: number;
  profileCompleteness: number;
}

interface CachedData {
  opportunities: Opportunity[];
  milestones: Milestone[];
  stats: DashboardStats;
  lastFetch: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const EntrepreneurDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // State management with performance optimization
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedData, setCachedData] = useState<CachedData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'profile' | 'documents'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Memoized data processing
  const dashboardData = useMemo(() => {
    if (!cachedData) return null;

    const { opportunities, milestones } = cachedData;
    
    return {
      opportunities: opportunities.filter(opp => opp.entrepreneur_id === user?.id),
      recentMilestones: milestones
        .filter(m => m.status === 'OVERDUE' || m.status === 'IN_PROGRESS')
        .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
        .slice(0, 5),
      fundingProgress: opportunities.reduce((acc, opp) => ({
        raised: acc.raised + opp.current_funds_raised,
        goal: acc.goal + opp.funding_goal
      }), { raised: 0, goal: 0 })
    };
  }, [cachedData, user?.id]);

  // Optimized data fetching with caching
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first
      if (!forceRefresh && cachedData && Date.now() - cachedData.lastFetch < CACHE_DURATION) {
        setLoading(false);
        return;
      }

      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [opportunitiesRes, milestonesRes, statsRes] = await Promise.all([
        apiService.getOpportunities({ entrepreneur_id: user?.id }),
        apiService.getMilestones({ entrepreneur_id: user?.id }),
        apiService.getDashboardData()
      ]);

      const newCachedData: CachedData = {
        opportunities: opportunitiesRes.data || [],
        milestones: milestonesRes.data || [],
        stats: {
          activeOpportunities: statsRes.active_opportunities || 0,
          totalFunded: statsRes.total_funded || 0,
          fundingGoal: opportunitiesRes.data?.reduce((sum: number, opp: Opportunity) => sum + opp.funding_goal, 0) || 0,
          reliabilityScore: statsRes.reliability_score || 0,
          overdueMilestones: statsRes.overdue_milestones || 0,
          completedMilestones: milestonesRes.data?.filter((m: Milestone) => m.status === 'COMPLETED').length || 0,
          pendingDocuments: 0, // Will be calculated from file uploads
          profileCompleteness: user?.profile_completion_percentage || 0
        },
        lastFetch: Date.now()
      };

      setCachedData(newCachedData);
      setError(null);
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, cachedData]);

  // Initial data load
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, fetchDashboardData]);

  // Auto-refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData(true);
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleRefresh = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  if (loading && !cachedData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !cachedData) {
    return (
      <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-error-600 mr-2" />
          <span className="text-error-800 dark:text-error-200">{error}</span>
        </div>
      </div>
    );
  }

  const stats = cachedData?.stats;
  const data = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('dashboard.entrepreneurOverview')}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {refreshing ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <BarChart3 className="h-4 w-4 mr-2" />
          )}
          {refreshing ? t('common.refreshing') : t('common.refresh')}
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('opportunities.activeOpportunities')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.activeOpportunities || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.totalFunded')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${(stats?.totalFunded || 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.reliabilityScore')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.reliabilityScore || 0}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-accent-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('milestones.overdue')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.overdueMilestones || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-error-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: t('dashboard.overview'), icon: BarChart3 },
            { key: 'opportunities', label: t('opportunities.title'), icon: TrendingUp },
            { key: 'profile', label: t('profile.dueDiligence'), icon: FileText },
            { key: 'documents', label: t('documents.title'), icon: Upload }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === key
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Funding Progress */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('dashboard.fundingProgress')}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{t('dashboard.totalRaised')}</span>
                  <span>
                    ${(data?.fundingProgress.raised || 0).toLocaleString()} / ${(data?.fundingProgress.goal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${data?.fundingProgress.goal ? Math.min((data.fundingProgress.raised / data.fundingProgress.goal) * 100, 100) : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recent Milestones */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('milestones.recent')}
              </h3>
              <div className="space-y-3">
                {data?.recentMilestones.length ? (
                  data.recentMilestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.status === 'OVERDUE' ? 'bg-error-500' : 
                          milestone.status === 'IN_PROGRESS' ? 'bg-warning-500' : 'bg-success-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{milestone.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('common.due')}: {new Date(milestone.target_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        milestone.status === 'OVERDUE' ? 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200' :
                        milestone.status === 'IN_PROGRESS' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200' :
                        'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                      }`}>
                        {t(`milestoneStatus.${milestone.status.toLowerCase()}`)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    {t('milestones.noMilestones')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('opportunities.myOpportunities')}
              </h3>
              <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                {t('opportunities.createOpportunity')}
              </button>
            </div>
            
            <FundingStageProgress opportunities={data?.opportunities || []} />
            <OpportunityMetrics opportunities={data?.opportunities || []} />
          </div>
        )}

        {activeTab === 'profile' && (
          <DueDiligenceProfile user={user} onUpdate={handleRefresh} />
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('documents.businessDocuments')}
              </h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('documents.pendingUploads', { count: stats?.pendingDocuments || 0 })}
              </span>
            </div>
            
            <FileUpload
              entityType="entrepreneur_profile"
              entityId={user?.id || ''}
              allowedTypes={['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']}
              maxFileSize={10 * 1024 * 1024} // 10MB
              multiple={true}
              onUploadComplete={handleRefresh}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntrepreneurDashboard;