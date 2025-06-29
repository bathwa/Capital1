import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, PieChart, Calendar, AlertTriangle } from 'lucide-react';
import { Investment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const InvestmentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getInvestments();
      setInvestments(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch investments:', err);
      setError(err.message || 'Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioStats = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.invested_amount, 0);
    const activeInvestments = investments.filter(inv => 
      ['FUNDS_IN_ESCROW', 'FUNDS_RELEASED_TO_ENTREPRENEUR'].includes(inv.status)
    ).length;
    
    // Mock ROI calculation - in real app, this would be calculated based on actual returns
    const averageROI = 12.5;
    
    return {
      totalInvested,
      activeInvestments,
      averageROI,
      totalInvestments: investments.length
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_INVESTOR_PAYMENT': return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'PENDING_ADMIN_CONFIRMATION': return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'FUNDS_IN_ESCROW': return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      case 'FUNDS_RELEASED_TO_ENTREPRENEUR': return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'COMPLETED': return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'REJECTED_BY_ADMIN': return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
          <AlertTriangle className="h-5 w-5 text-error-600 mr-2" />
          <span className="text-error-800 dark:text-error-200">{error}</span>
        </div>
      </div>
    );
  }

  const stats = calculatePortfolioStats();

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('investments.totalInvested')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats.totalInvested)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('investments.activeInvestments')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.activeInvestments}
              </p>
            </div>
            <div className="flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.portfolioROI')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.averageROI}%
              </p>
            </div>
            <div className="flex-shrink-0">
              <PieChart className="h-6 w-6 text-accent-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('investments.totalInvestments')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalInvestments}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('investments.myInvestments')}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('opportunities.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('investments.amountInvested')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('investments.equityPercentage')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('investments.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('common.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {investments.map((investment) => (
                <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {(investment as any).opportunity?.title || 'Unknown Opportunity'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {(investment as any).opportunity?.industry}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(investment.invested_amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {investment.equity_percentage}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(investment.status)}`}>
                      {t(`investmentStatus.${investment.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(investment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 dark:text-primary-400 hover:text-primary-500">
                      {t('common.view')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {investments.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('investments.noInvestments')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('investments.startInvesting')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentDashboard;