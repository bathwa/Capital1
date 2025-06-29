import React, { useEffect, useState } from 'react';
import { Star, TrendingUp, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAI } from '../../hooks/useAI';
import LoadingSpinner from '../common/LoadingSpinner';

interface RecommendationsListProps {
  investorProfile: {
    preferredIndustries: string[];
    minInvestment: number;
    maxInvestment: number;
    riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
    investmentType: string[];
  };
  opportunities: any[];
  onOpportunityClick: (opportunityId: string) => void;
  className?: string;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({
  investorProfile,
  opportunities,
  onOpportunityClick,
  className = ''
}) => {
  const { t } = useTranslation();
  const { generateRecommendations, isLoading } = useAI();
  const [recommendations, setRecommendations] = useState<Array<{
    opportunityId: string;
    matchScore: number;
    matchReasons: string[];
  }>>([]);

  useEffect(() => {
    const getRecommendations = async () => {
      if (opportunities.length === 0) return;
      
      try {
        const result = await generateRecommendations(investorProfile, opportunities);
        setRecommendations(result.recommendedOpportunities);
      } catch (error) {
        console.error('Failed to generate recommendations:', error);
      }
    };

    getRecommendations();
  }, [investorProfile, opportunities, generateRecommendations]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600 bg-success-100 dark:bg-success-900';
    if (score >= 60) return 'text-primary-600 bg-primary-100 dark:bg-primary-900';
    if (score >= 40) return 'text-warning-600 bg-warning-100 dark:bg-warning-900';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
  };

  const getStarRating = (score: number) => {
    const stars = Math.round((score / 100) * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getOpportunityById = (id: string) => {
    return opportunities.find(opp => opp.id === id);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('ai.recommendedForYou')}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('ai.aiPoweredRecommendations')}
        </p>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {t('ai.generatingRecommendations')}
            </span>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => {
              const opportunity = getOpportunityById(recommendation.opportunityId);
              if (!opportunity) return null;

              return (
                <div
                  key={recommendation.opportunityId}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onOpportunityClick(recommendation.opportunityId)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {opportunity.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {opportunity.industry} • {opportunity.category}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(recommendation.matchScore)}`}>
                        {recommendation.matchScore}% {t('ai.match')}
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStarRating(recommendation.matchScore)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>${opportunity.funding_goal?.toLocaleString()}</span>
                      <span>{opportunity.roi_projected_percentage}% ROI</span>
                      <span>Min: ${opportunity.min_investment_amount?.toLocaleString()}</span>
                    </div>
                  </div>

                  {recommendation.matchReasons.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('ai.whyRecommended')}:
                      </h5>
                      <ul className="space-y-1">
                        {recommendation.matchReasons.slice(0, 3).map((reason, reasonIndex) => (
                          <li key={reasonIndex} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                            <TrendingUp className="h-3 w-3 text-primary-500 mr-1 mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('ai.noRecommendationsAvailable')}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {t('ai.updatePreferencesForBetter')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsList;