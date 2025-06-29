import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAI } from '../../hooks/useAI';
import LoadingSpinner from '../common/LoadingSpinner';

interface ReliabilityScoreCardProps {
  entrepreneurData: {
    milestoneUpdateFrequency: number;
    profileCompleteness: number;
    overdueMilestones: number;
    communicationFrequency: number;
    progressNotes?: string[];
  };
  className?: string;
}

const ReliabilityScoreCard: React.FC<ReliabilityScoreCardProps> = ({
  entrepreneurData,
  className = ''
}) => {
  const { t } = useTranslation();
  const { analyzeReliability, isLoading } = useAI();
  const [analysis, setAnalysis] = useState<{
    score: number;
    insights: string[];
    recommendations: string[];
  } | null>(null);

  useEffect(() => {
    const performAnalysis = async () => {
      try {
        const result = await analyzeReliability(entrepreneurData);
        setAnalysis(result);
      } catch (error) {
        console.error('Failed to analyze reliability:', error);
      }
    };

    performAnalysis();
  }, [entrepreneurData, analyzeReliability]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-error-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-6 w-6 text-success-600" />;
    if (score >= 60) return <TrendingUp className="h-6 w-6 text-warning-600" />;
    return <AlertTriangle className="h-6 w-6 text-error-600" />;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.reliabilityScore')}
          </h3>
        </div>
        {analysis && (
          <div className="flex items-center space-x-2">
            {getScoreIcon(analysis.score)}
            <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}%
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {t('ai.analyzingReliability')}
          </span>
        </div>
      ) : analysis ? (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                analysis.score >= 80 ? 'bg-success-500' :
                analysis.score >= 60 ? 'bg-warning-500' : 'bg-error-500'
              }`}
              style={{ width: `${analysis.score}%` }}
            />
          </div>

          {/* AI Insights */}
          {analysis.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t('ai.insights')}
              </h4>
              <ul className="space-y-1">
                {analysis.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t('ai.recommendations')}
              </h4>
              <ul className="space-y-1">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                    <span className="text-accent-500 mr-2">→</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          {t('ai.analysisUnavailable')}
        </div>
      )}
    </div>
  );
};

export default ReliabilityScoreCard;