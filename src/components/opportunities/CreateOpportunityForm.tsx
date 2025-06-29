import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Save, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

interface OpportunityFormData {
  title: string;
  description: string;
  category: string;
  industry: string;
  location: string;
  funding_goal: string;
  equity_offered_percentage: string;
  roi_projected_percentage: string;
  funding_stage: string;
  min_investment_amount: string;
  start_date: string;
  end_date: string;
  due_diligence_summary: string;
}

const CreateOpportunityForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    description: '',
    category: '',
    industry: '',
    location: '',
    funding_goal: '',
    equity_offered_percentage: '',
    roi_projected_percentage: '',
    funding_stage: '',
    min_investment_amount: '',
    start_date: '',
    end_date: '',
    due_diligence_summary: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('validation.titleRequired');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('validation.descriptionRequired');
    }

    if (!formData.category) {
      newErrors.category = t('validation.categoryRequired');
    }

    if (!formData.industry.trim()) {
      newErrors.industry = t('validation.industryRequired');
    }

    if (!formData.location.trim()) {
      newErrors.location = t('validation.locationRequired');
    }

    if (!formData.funding_goal || parseFloat(formData.funding_goal) <= 0) {
      newErrors.funding_goal = t('validation.fundingGoalRequired');
    }

    if (!formData.equity_offered_percentage || parseFloat(formData.equity_offered_percentage) <= 0 || parseFloat(formData.equity_offered_percentage) > 100) {
      newErrors.equity_offered_percentage = t('validation.equityPercentageInvalid');
    }

    if (!formData.funding_stage) {
      newErrors.funding_stage = t('validation.fundingStageRequired');
    }

    if (!formData.min_investment_amount || parseFloat(formData.min_investment_amount) <= 0) {
      newErrors.min_investment_amount = t('validation.minInvestmentRequired');
    }

    if (formData.end_date && formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = t('validation.endDateAfterStartDate');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    if (!isDraft && !validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const opportunityData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        industry: formData.industry,
        location: formData.location,
        funding_goal: parseFloat(formData.funding_goal),
        equity_offered_percentage: parseFloat(formData.equity_offered_percentage),
        roi_projected_percentage: formData.roi_projected_percentage ? parseFloat(formData.roi_projected_percentage) : null,
        funding_stage: formData.funding_stage,
        min_investment_amount: parseFloat(formData.min_investment_amount),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        due_diligence_summary: formData.due_diligence_summary,
        status: isDraft ? 'DRAFT' : 'PENDING_ADMIN_REVIEW',
      };

      const response = await apiService.createOpportunity(opportunityData);
      
      setSuccessMessage(
        isDraft 
          ? t('opportunities.draftSaved') 
          : t('opportunities.submittedForReview')
      );
      
      // Redirect after success
      setTimeout(() => {
        navigate('/opportunities');
      }, 2000);

    } catch (err: any) {
      console.error('Failed to create opportunity:', err);
      
      if (err.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        err.response.data.errors.forEach((error: any) => {
          if (error.field) {
            serverErrors[error.field] = error.message;
          }
        });
        setErrors(serverErrors);
      } else {
        setErrors({
          general: err.response?.data?.message || t('errors.opportunityCreationFailed')
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('opportunities.createOpportunity')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {t('opportunities.createDescription')}
          </p>
        </div>

        <form className="p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700 text-error-700 dark:text-error-200 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {errors.general}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700 text-success-700 dark:text-success-200 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('opportunities.opportunityTitle')} *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.title ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('opportunities.titlePlaceholder')}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('opportunities.category')} *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.category ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">{t('opportunities.selectCategory')}</option>
                <option value="GOING_CONCERN">{t('categories.goingConcern')}</option>
                <option value="ORDER_FULFILLMENT">{t('categories.orderFulfillment')}</option>
                <option value="PROJECT_PARTNERSHIP">{t('categories.projectPartnership')}</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="funding_stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('opportunities.fundingStage')} *
              </label>
              <select
                id="funding_stage"
                name="funding_stage"
                required
                value={formData.funding_stage}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.funding_stage ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">{t('opportunities.selectFundingStage')}</option>
                <option value="SEED">{t('fundingStages.seed')}</option>
                <option value="STARTUP">{t('fundingStages.startup')}</option>
                <option value="GROWTH">{t('fundingStages.growth')}</option>
              </select>
              {errors.funding_stage && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.funding_stage}</p>
              )}
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('opportunities.industry')} *
              </label>
              <input
                id="industry"
                name="industry"
                type="text"
                required
                value={formData.industry}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.industry ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('opportunities.industryPlaceholder')}
              />
              {errors.industry && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.industry}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('opportunities.location')} *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.location ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('opportunities.locationPlaceholder')}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('opportunities.description')} *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.description ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder={t('opportunities.descriptionPlaceholder')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.description}</p>
            )}
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="funding_goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('opportunities.fundingGoal')} (USD) *
              </label>
              <input
                id="funding_goal"
                name="funding_goal"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.funding_goal}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.funding_goal ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="50000"
              />
              {errors.funding_goal && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.funding_goal}</p>
              )}
            </div>

            <div>
              <label htmlFor="equity_offered_percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('opportunities.equityOffered')} (%) *
              </label>
              <input
                id="equity_offered_percentage"
                name="equity_offered_percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                value={formData.equity_offered_percentage}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.equity_offered_percentage ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="10"
              />
              {errors.equity_offered_percentage && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.equity_offered_percentage}</p>
              )}
            </div>

            <div>
              <label htmlFor="roi_projected_percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('opportunities.projectedROI')} (%)
              </label>
              <input
                id="roi_projected_percentage"
                name="roi_projected_percentage"
                type="number"
                min="0"
                step="0.01"
                value={formData.roi_projected_percentage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="15"
              />
            </div>
          </div>

          <div>
            <label htmlFor="min_investment_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('opportunities.minInvestment')} (USD) *
            </label>
            <input
              id="min_investment_amount"
              name="min_investment_amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.min_investment_amount}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.min_investment_amount ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="1000"
            />
            {errors.min_investment_amount && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.min_investment_amount}</p>
            )}
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('opportunities.startDate')}
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('opportunities.endDate')}
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.end_date ? 'border-error-300 dark:border-error-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Due Diligence */}
          <div>
            <label htmlFor="due_diligence_summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('opportunities.dueDiligence')}
            </label>
            <textarea
              id="due_diligence_summary"
              name="due_diligence_summary"
              rows={3}
              value={formData.due_diligence_summary}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t('opportunities.dueDiligencePlaceholder')}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isLoading}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t('opportunities.saveDraft')}
            </button>

            <button
              type="submit"
              onClick={(e) => handleSubmit(e, false)}
              disabled={isLoading}
              className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {t('opportunities.submitForReview')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOpportunityForm;