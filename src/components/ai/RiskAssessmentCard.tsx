import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAI } from '../../hooks/useAI';
import LoadingSpinner from '../common/LoadingSpinner';

interface RiskAssessmentCardProps {
  opportunity: {
    category: string;
    industry: string;
    fundingGoal: number;
    description: string;
    entrepreneurReliabilityScore: number;
    fundingStage: string;
  };
  className?: string;
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({
  opportunity,
  className = ''
}) => {
  const { t } = useTranslation();
  const { assessRisk, isLoading } = useAI();
  const [assessment, setAssessment] = useState<{
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskFactors: string[];
    suggestions: string[];
  } | null>(null);

  useEffect(() => {
    const performAssessment = async () => {
      try {
        const result = await assessRisk(opportunity);
        setAssessment(result);
      } catch (error) {
        console.error('Failed to assess risk:', error);
      }
    };

    performAssessment();
  }, [opportunity, assessRisk]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-success-600 bg-success-100 dark:bg-success-900';
      case 'MEDIUM': return 'text-warning-600 bg-warning-100 dark:bg-warning-900';
      case 'HIGH': return 'text-error-600 bg-error-100 dark:bg-error-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW': return <CheckCircle className="h-5 w-5" />;
      case 'MEDIUM': return <Shield className="h-5 w-5" />;
      case 'HIGH': return <AlertTriangle className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('ai.riskAssessment')}
          </h3>
        </div>
        {assessment && (
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getRiskColor(assessment.riskLevel)}`}>
            {getRiskIcon(assessment.riskLevel)}
            <span className="text-sm font-medium">
              {t(`risk.${assessment.riskLevel.toLowerCase()}`)} ({assessment.riskScore}%)
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {t('ai.assessingRisk')}
          </span>
        </div>
      ) : assessment ? (
        <div className="space-y-4">
          {/* Risk Score Visualization */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                assessment.riskLevel === 'LOW' ? 'bg-success-500' :
                assessment.riskLevel === 'MEDIUM' ? 'bg-warning-500' : 'bg-error-500'
              }`}
              style={{ width: `${assessment.riskScore}%` }}
            />
          </div>

          {/* Risk Factors */}
          {assessment.riskFactors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t('ai.riskFactors')}
              </h4>
              <ul className="space-y-1">
                {assessment.riskFactors.map((factor, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                    <AlertTriangle className="h-3 w-3 text-warning-500 mr-2 mt-1 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Suggestions */}
          {assessment.suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t('ai.suggestions')}
              </h4>
              <ul className="space-y-1">
                {assessment.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                    <span className="text-primary-500 mr-2">💡</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          {t('ai.assessmentUnavailable')}
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentCard;