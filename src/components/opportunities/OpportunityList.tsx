import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, MapPin, DollarSign, Calendar, Filter, Search } from 'lucide-react';
import { Opportunity } from '../../types';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

interface OpportunityListProps {
  userRole: string;
  userId?: string;
}

const OpportunityList: React.FC<OpportunityListProps> = ({ userRole, userId }) => {
  const { t } = useTranslation();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    industry: '',
    funding_stage: '',
    search: ''
  });

  useEffect(() => {
    fetchOpportunities();
  }, [filters]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getOpportunities(filters);
      setOpportunities(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch opportunities:', err);
      setError(err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FUNDING_LIVE': return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'PENDING_ADMIN_REVIEW': return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'ADMIN_REJECTED': return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200';
      case 'COMPLETED': return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

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
          <span className="text-error-800 dark:text-error-200">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('common.search')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t('opportunities.searchPlaceholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('opportunities.category')}
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">{t('common.all')}</option>
              <option value="GOING_CONCERN">{t('categories.goingConcern')}</option>
              <option value="ORDER_FULFILLMENT">{t('categories.orderFulfillment')}</option>
              <option value="PROJECT_PARTNERSHIP">{t('categories.projectPartnership')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('opportunities.fundingStage')}
            </label>
            <select
              value={filters.funding_stage}
              onChange={(e) => handleFilterChange('funding_stage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">{t('common.all')}</option>
              <option value="SEED">{t('fundingStages.seed')}</option>
              <option value="STARTUP">{t('fundingStages.startup')}</option>
              <option value="GROWTH">{t('fundingStages.growth')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('opportunities.industry')}
            </label>
            <input
              type="text"
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t('opportunities.industryPlaceholder')}
            />
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {opportunity.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                  {t(`opportunityStatus.${opportunity.status.toLowerCase()}`)}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {opportunity.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {opportunity.location}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {opportunity.industry}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('opportunities.fundingGoal')}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(opportunity.funding_goal)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('opportunities.equityOffered')}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {opportunity.equity_offered_percentage}%
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <span>{t('opportunities.progress')}</span>
                  <span>
                    {formatCurrency(opportunity.current_funds_raised)} / {formatCurrency(opportunity.funding_goal)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((opportunity.current_funds_raised / opportunity.funding_goal) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {opportunity.end_date ? new Date(opportunity.end_date).toLocaleDateString() : t('common.ongoing')}
                </div>
                
                {userRole === 'INVESTOR' && opportunity.status === 'FUNDING_LIVE' && (
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                    {t('investments.makeOffer')}
                  </button>
                )}
                
                {userRole === 'ENTREPRENEUR' && opportunity.entrepreneur_id === userId && (
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                    {t('common.edit')}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('opportunities.noOpportunities')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {userRole === 'ENTREPRENEUR' 
              ? t('opportunities.createFirstOpportunity')
              : t('opportunities.checkBackLater')
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default OpportunityList;