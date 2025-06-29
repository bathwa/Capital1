import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { Opportunity } from '../../types';

interface FundingStageProgressProps {
  opportunities: Opportunity[];
}

// Enhanced funding stage mapping with category-specific paths
const FUNDING_STAGE_PATHS = {
  GOING_CONCERN: [
    { stage: 'SEED', label: 'Seed Funding', description: 'Initial capital for business operations' },
    { stage: 'STARTUP', label: 'Growth Capital', description: 'Expansion and market penetration' },
    { stage: 'GROWTH', label: 'Scale Funding', description: 'Market leadership and diversification' }
  ],
  ORDER_FULFILLMENT: [
    { stage: 'SEED', label: 'Order Capital', description: 'Initial order fulfillment funding' },
    { stage: 'STARTUP', label: 'Working Capital', description: 'Inventory and operations scaling' },
    { stage: 'GROWTH', label: 'Expansion Capital', description: 'Market expansion and automation' }
  ],
  PROJECT_PARTNERSHIP: [
    { stage: 'SEED', label: 'Project Initiation', description: 'Initial project development' },
    { stage: 'STARTUP', label: 'Implementation', description: 'Project execution and delivery' },
    { stage: 'GROWTH', label: 'Partnership Expansion', description: 'Strategic partnerships and scaling' }
  ]
};

const STAGE_VALIDATION_RULES = {
  GOING_CONCERN: {
    SEED: { minAmount: 5000, maxAmount: 50000, requiredDocs: ['business_plan', 'financial_projections'] },
    STARTUP: { minAmount: 25000, maxAmount: 250000, requiredDocs: ['financial_statements', 'market_analysis'] },
    GROWTH: { minAmount: 100000, maxAmount: 1000000, requiredDocs: ['audited_financials', 'growth_strategy'] }
  },
  ORDER_FULFILLMENT: {
    SEED: { minAmount: 10000, maxAmount: 100000, requiredDocs: ['purchase_orders', 'supplier_agreements'] },
    STARTUP: { minAmount: 50000, maxAmount: 500000, requiredDocs: ['inventory_plan', 'fulfillment_strategy'] },
    GROWTH: { minAmount: 200000, maxAmount: 2000000, requiredDocs: ['automation_plan', 'market_expansion'] }
  },
  PROJECT_PARTNERSHIP: {
    SEED: { minAmount: 15000, maxAmount: 150000, requiredDocs: ['project_proposal', 'partnership_agreements'] },
    STARTUP: { minAmount: 75000, maxAmount: 750000, requiredDocs: ['implementation_plan', 'milestone_schedule'] },
    GROWTH: { minAmount: 300000, maxAmount: 3000000, requiredDocs: ['partnership_expansion', 'strategic_plan'] }
  }
};

const FundingStageProgress: React.FC<FundingStageProgressProps> = ({ opportunities }) => {
  const { t } = useTranslation();

  const getStageProgress = (category: keyof typeof FUNDING_STAGE_PATHS) => {
    const categoryOpportunities = opportunities.filter(opp => opp.category === category);
    const stages = FUNDING_STAGE_PATHS[category];
    
    return stages.map(stage => {
      const stageOpportunities = categoryOpportunities.filter(opp => opp.funding_stage === stage.stage);
      const completedOpportunities = stageOpportunities.filter(opp => 
        opp.status === 'COMPLETED' || opp.current_funds_raised >= opp.funding_goal
      );
      
      return {
        ...stage,
        opportunities: stageOpportunities,
        completed: completedOpportunities.length,
        total: stageOpportunities.length,
        isCompleted: completedOpportunities.length > 0,
        isActive: stageOpportunities.some(opp => 
          opp.status === 'FUNDING_LIVE' || opp.status === 'ACTIVE_INVESTMENT'
        )
      };
    });
  };

  const validateStageRequirements = (opportunity: Opportunity) => {
    const rules = STAGE_VALIDATION_RULES[opportunity.category]?.[opportunity.funding_stage];
    if (!rules) return { isValid: true, issues: [] };

    const issues = [];
    
    if (opportunity.funding_goal < rules.minAmount) {
      issues.push(`Minimum funding amount for ${opportunity.funding_stage} stage is $${rules.minAmount.toLocaleString()}`);
    }
    
    if (opportunity.funding_goal > rules.maxAmount) {
      issues.push(`Maximum funding amount for ${opportunity.funding_stage} stage is $${rules.maxAmount.toLocaleString()}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      requiredDocs: rules.requiredDocs
    };
  };

  const categories = Object.keys(FUNDING_STAGE_PATHS) as Array<keyof typeof FUNDING_STAGE_PATHS>;

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t('dashboard.fundingStageProgress')}
        </h3>

        {categories.map(category => {
          const stageProgress = getStageProgress(category);
          const hasOpportunities = opportunities.some(opp => opp.category === category);

          if (!hasOpportunities) return null;

          return (
            <div key={category} className="mb-8">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
                {t(`categories.${category.toLowerCase()}`)}
              </h4>
              
              <div className="flex items-center space-x-4">
                {stageProgress.map((stage, index) => (
                  <React.Fragment key={stage.stage}>
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                        stage.isCompleted 
                          ? 'bg-success-100 border-success-500 text-success-700 dark:bg-success-900 dark:text-success-200'
                          : stage.isActive
                          ? 'bg-primary-100 border-primary-500 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                      }`}>
                        {stage.isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {stage.label}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 max-w-24">
                          {stage.description}
                        </p>
                        {stage.total > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {stage.completed}/{stage.total} {t('common.completed')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {index < stageProgress.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Stage Validation Warnings */}
              <div className="mt-4 space-y-2">
                {opportunities
                  .filter(opp => opp.category === category)
                  .map(opportunity => {
                    const validation = validateStageRequirements(opportunity);
                    if (validation.isValid) return null;

                    return (
                      <div key={opportunity.id} className="bg-warning-50 dark:bg-warning-900 border border-warning-200 dark:border-warning-700 rounded-lg p-3">
                        <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
                          {opportunity.title} - {t('validation.stageRequirements')}
                        </p>
                        <ul className="text-xs text-warning-700 dark:text-warning-300 mt-1 list-disc list-inside">
                          {validation.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FundingStageProgress;