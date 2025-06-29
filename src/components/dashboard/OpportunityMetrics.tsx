import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Target, Clock } from 'lucide-react';
import { Opportunity } from '../../types';

interface OpportunityMetricsProps {
  opportunities: Opportunity[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const OpportunityMetrics: React.FC<OpportunityMetricsProps> = ({ opportunities }) => {
  const { t } = useTranslation();

  const metrics = useMemo(() => {
    const totalFundingGoal = opportunities.reduce((sum, opp) => sum + opp.funding_goal, 0);
    const totalFundsRaised = opportunities.reduce((sum, opp) => sum + opp.current_funds_raised, 0);
    const averageFundingProgress = opportunities.length > 0 
      ? opportunities.reduce((sum, opp) => sum + (opp.current_funds_raised / opp.funding_goal * 100), 0) / opportunities.length
      : 0;

    // Category distribution
    const categoryData = opportunities.reduce((acc, opp) => {
      acc[opp.category] = (acc[opp.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
      name: t(`categories.${category.toLowerCase()}`),
      value: count,
      percentage: (count / opportunities.length * 100).toFixed(1)
    }));

    // Funding stage distribution
    const stageData = opportunities.reduce((acc, opp) => {
      acc[opp.funding_stage] = (acc[opp.funding_stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stageChartData = Object.entries(stageData).map(([stage, count]) => ({
      name: t(`fundingStages.${stage.toLowerCase()}`),
      value: count
    }));

    // Status distribution
    const statusData = opportunities.reduce((acc, opp) => {
      acc[opp.status] = (acc[opp.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusChartData = Object.entries(statusData).map(([status, count]) => ({
      name: t(`opportunityStatus.${status.toLowerCase()}`),
      count,
      percentage: (count / opportunities.length * 100).toFixed(1)
    }));

    // Funding progress over time (mock data for demonstration)
    const progressData = opportunities.map((opp, index) => ({
      name: opp.title.substring(0, 20) + '...',
      goal: opp.funding_goal,
      raised: opp.current_funds_raised,
      progress: (opp.current_funds_raised / opp.funding_goal * 100).toFixed(1)
    }));

    return {
      totalFundingGoal,
      totalFundsRaised,
      averageFundingProgress,
      categoryChartData,
      stageChartData,
      statusChartData,
      progressData
    };
  }, [opportunities, t]);

  if (opportunities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('opportunities.noOpportunities')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {t('opportunities.createFirstOpportunity')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('opportunities.totalOpportunities')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {opportunities.length}
              </p>
            </div>
            <Target className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('opportunities.totalFundingGoal')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${metrics.totalFundingGoal.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('opportunities.totalFundsRaised')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${metrics.totalFundsRaised.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-accent-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('opportunities.averageProgress')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {metrics.averageFundingProgress.toFixed(1)}%
              </p>
            </div>
            <Clock className="h-8 w-8 text-warning-600" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('opportunities.categoryDistribution')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {metrics.categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Funding Stage Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('opportunities.fundingStageDistribution')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.stageChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funding Progress by Opportunity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('opportunities.fundingProgress')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'goal' || name === 'raised' ? `$${value.toLocaleString()}` : value,
                  name === 'goal' ? t('opportunities.fundingGoal') : 
                  name === 'raised' ? t('opportunities.fundsRaised') : name
                ]}
              />
              <Bar dataKey="goal" fill="#E5E7EB" name="goal" />
              <Bar dataKey="raised" fill="#10B981" name="raised" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('opportunities.statusSummary')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics.statusChartData.map((status, index) => (
            <div key={status.name} className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg`}
                   style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                {status.count}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {status.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {status.percentage}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpportunityMetrics;