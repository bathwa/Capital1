import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, AlertCircle, CheckCircle, Building, MapPin, Users, FileText, DollarSign, Scale } from 'lucide-react';
import { User } from '../../types';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

interface DueDiligenceData {
  // Legal compliance and history
  legal_compliance: {
    business_registration_number: string;
    registration_date: string;
    legal_structure: string;
    compliance_status: string;
    pending_legal_issues: string;
    court_cases: boolean;
    court_cases_details: string;
  };
  
  // Company background and status
  company_background: {
    founding_date: string;
    founding_story: string;
    mission_statement: string;
    vision_statement: string;
    core_values: string[];
    business_model: string;
    revenue_streams: string[];
    target_market: string;
    competitive_advantages: string[];
  };
  
  // Business location and facilities
  business_location: {
    primary_address: string;
    facility_ownership: 'OWNED' | 'LEASED' | 'SHARED';
    lease_expiry_date?: string;
    facility_size: string;
    facility_type: string;
    additional_locations: Array<{
      address: string;
      type: string;
      ownership: string;
    }>;
  };
}

interface OpportunityDueDiligence {
  // Financial documentation
  financial_documentation: {
    financial_statements: boolean;
    cash_flow_projections: boolean;
    break_even_analysis: boolean;
    funding_history: string;
    current_revenue: number;
    projected_revenue: number;
    burn_rate: number;
  };
  
  // Business/Project metrics
  business_metrics: {
    key_performance_indicators: Array<{
      metric: string;
      current_value: string;
      target_value: string;
      measurement_period: string;
    }>;
    customer_acquisition_cost: number;
    customer_lifetime_value: number;
    monthly_recurring_revenue: number;
    churn_rate: number;
    market_size: string;
    market_share: string;
  };
  
  // Market analysis
  market_analysis: {
    target_market_size: string;
    market_growth_rate: string;
    competitive_landscape: string;
    market_positioning: string;
    pricing_strategy: string;
    go_to_market_strategy: string;
    customer_segments: string[];
  };
  
  // Partnerships and syndication
  partnerships: {
    existing_partnerships: Array<{
      partner_name: string;
      partnership_type: string;
      start_date: string;
      value_proposition: string;
    }>;
    strategic_alliances: string[];
    supplier_relationships: string[];
    distribution_channels: string[];
    syndication_opportunities: string;
  };
  
  // Debt profiling
  debt_profile: {
    total_debt: number;
    debt_to_equity_ratio: number;
    debt_service_coverage: number;
    outstanding_loans: Array<{
      lender: string;
      amount: number;
      interest_rate: number;
      maturity_date: string;
      collateral: string;
    }>;
    credit_rating: string;
    payment_history: string;
  };
  
  // Banking independence
  banking_independence: {
    primary_bank: string;
    banking_relationship_duration: string;
    credit_facilities: Array<{
      facility_type: string;
      limit: number;
      utilization: number;
    }>;
    banking_references: string[];
    financial_independence_score: number;
  };
  
  // Opportunity locations
  opportunity_locations: Array<{
    location: string;
    market_potential: string;
    local_partnerships: string[];
    regulatory_considerations: string;
    operational_requirements: string;
  }>;
}

interface DueDiligenceProfileProps {
  user: User | null;
  onUpdate: () => void;
}

const DueDiligenceProfile: React.FC<DueDiligenceProfileProps> = ({ user, onUpdate }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState<DueDiligenceData>({
    legal_compliance: {
      business_registration_number: '',
      registration_date: '',
      legal_structure: '',
      compliance_status: '',
      pending_legal_issues: '',
      court_cases: false,
      court_cases_details: ''
    },
    company_background: {
      founding_date: '',
      founding_story: '',
      mission_statement: '',
      vision_statement: '',
      core_values: [],
      business_model: '',
      revenue_streams: [],
      target_market: '',
      competitive_advantages: []
    },
    business_location: {
      primary_address: '',
      facility_ownership: 'LEASED',
      facility_size: '',
      facility_type: '',
      additional_locations: []
    }
  });

  const [opportunityData, setOpportunityData] = useState<OpportunityDueDiligence>({
    financial_documentation: {
      financial_statements: false,
      cash_flow_projections: false,
      break_even_analysis: false,
      funding_history: '',
      current_revenue: 0,
      projected_revenue: 0,
      burn_rate: 0
    },
    business_metrics: {
      key_performance_indicators: [],
      customer_acquisition_cost: 0,
      customer_lifetime_value: 0,
      monthly_recurring_revenue: 0,
      churn_rate: 0,
      market_size: '',
      market_share: ''
    },
    market_analysis: {
      target_market_size: '',
      market_growth_rate: '',
      competitive_landscape: '',
      market_positioning: '',
      pricing_strategy: '',
      go_to_market_strategy: '',
      customer_segments: []
    },
    partnerships: {
      existing_partnerships: [],
      strategic_alliances: [],
      supplier_relationships: [],
      distribution_channels: [],
      syndication_opportunities: ''
    },
    debt_profile: {
      total_debt: 0,
      debt_to_equity_ratio: 0,
      debt_service_coverage: 0,
      outstanding_loans: [],
      credit_rating: '',
      payment_history: ''
    },
    banking_independence: {
      primary_bank: '',
      banking_relationship_duration: '',
      credit_facilities: [],
      banking_references: [],
      financial_independence_score: 0
    },
    opportunity_locations: []
  });

  const [activeSection, setActiveSection] = useState<'profile' | 'opportunities'>('profile');

  useEffect(() => {
    fetchDueDiligenceData();
  }, [user?.id]);

  const fetchDueDiligenceData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await apiService.getDueDiligenceProfile(user.id);
      
      if (response.success && response.data) {
        setProfileData(response.data.profile || profileData);
        setOpportunityData(response.data.opportunities || opportunityData);
      }
    } catch (err: any) {
      console.error('Failed to fetch due diligence data:', err);
      setError(err.message || 'Failed to load due diligence data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      setError(null);
      
      const response = await apiService.updateDueDiligenceProfile(user.id, {
        profile: profileData,
        opportunities: opportunityData
      });
      
      if (response.success) {
        setSuccess(t('profile.dueDiligenceUpdated'));
        onUpdate();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to update due diligence profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update due diligence profile');
    } finally {
      setSaving(false);
    }
  };

  const updateProfileField = (section: keyof DueDiligenceData, field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateOpportunityField = (section: keyof OpportunityDueDiligence, field: string, value: any) => {
    setOpportunityData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addArrayItem = (section: keyof DueDiligenceData | keyof OpportunityDueDiligence, field: string, item: any) => {
    if (activeSection === 'profile') {
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof DueDiligenceData],
          [field]: [...(prev[section as keyof DueDiligenceData][field as any] || []), item]
        }
      }));
    } else {
      setOpportunityData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof OpportunityDueDiligence],
          [field]: [...(prev[section as keyof OpportunityDueDiligence][field as any] || []), item]
        }
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('profile.dueDiligenceProfile')}
        </h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? t('common.saving') : t('common.save')}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-error-50 dark:bg-error-900 border border-error-200 dark:border-error-700 text-error-700 dark:text-error-200 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700 text-success-700 dark:text-success-200 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Section Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSection('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeSection === 'profile'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>{t('profile.businessProfile')}</span>
          </button>
          <button
            onClick={() => setActiveSection('opportunities')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeSection === 'opportunities'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{t('opportunities.dueDiligence')}</span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeSection === 'profile' && (
          <>
            {/* Legal Compliance Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="h-5 w-5 text-primary-600" />
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  {t('profile.legalCompliance')}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.businessRegistrationNumber')}
                  </label>
                  <input
                    type="text"
                    value={profileData.legal_compliance.business_registration_number}
                    onChange={(e) => updateProfileField('legal_compliance', 'business_registration_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.legalStructure')}
                  </label>
                  <select
                    value={profileData.legal_compliance.legal_structure}
                    onChange={(e) => updateProfileField('legal_compliance', 'legal_structure', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t('common.select')}</option>
                    <option value="SOLE_PROPRIETORSHIP">{t('legalStructures.soleProprietorship')}</option>
                    <option value="PARTNERSHIP">{t('legalStructures.partnership')}</option>
                    <option value="PRIVATE_LIMITED">{t('legalStructures.privateLimited')}</option>
                    <option value="PUBLIC_LIMITED">{t('legalStructures.publicLimited')}</option>
                    <option value="COOPERATIVE">{t('legalStructures.cooperative')}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={profileData.legal_compliance.court_cases}
                      onChange={(e) => updateProfileField('legal_compliance', 'court_cases', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('profile.hasCourtCases')}
                    </span>
                  </label>
                  
                  {profileData.legal_compliance.court_cases && (
                    <textarea
                      value={profileData.legal_compliance.court_cases_details}
                      onChange={(e) => updateProfileField('legal_compliance', 'court_cases_details', e.target.value)}
                      placeholder={t('profile.courtCasesDetails')}
                      rows={3}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Business Location Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-primary-600" />
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  {t('profile.businessLocation')}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.primaryAddress')}
                  </label>
                  <textarea
                    value={profileData.business_location.primary_address}
                    onChange={(e) => updateProfileField('business_location', 'primary_address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.facilityOwnership')}
                  </label>
                  <select
                    value={profileData.business_location.facility_ownership}
                    onChange={(e) => updateProfileField('business_location', 'facility_ownership', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="OWNED">{t('facilityOwnership.owned')}</option>
                    <option value="LEASED">{t('facilityOwnership.leased')}</option>
                    <option value="SHARED">{t('facilityOwnership.shared')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.facilitySize')}
                  </label>
                  <input
                    type="text"
                    value={profileData.business_location.facility_size}
                    onChange={(e) => updateProfileField('business_location', 'facility_size', e.target.value)}
                    placeholder="e.g., 500 sqm"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeSection === 'opportunities' && (
          <>
            {/* Financial Documentation Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="h-5 w-5 text-primary-600" />
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  {t('opportunities.financialDocumentation')}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('financial.currentRevenue')}
                  </label>
                  <input
                    type="number"
                    value={opportunityData.financial_documentation.current_revenue}
                    onChange={(e) => updateOpportunityField('financial_documentation', 'current_revenue', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('financial.projectedRevenue')}
                  </label>
                  <input
                    type="number"
                    value={opportunityData.financial_documentation.projected_revenue}
                    onChange={(e) => updateOpportunityField('financial_documentation', 'projected_revenue', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('financial.burnRate')}
                  </label>
                  <input
                    type="number"
                    value={opportunityData.financial_documentation.burn_rate}
                    onChange={(e) => updateOpportunityField('financial_documentation', 'burn_rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('financial.availableDocuments')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'financial_statements', label: t('financial.financialStatements') },
                    { key: 'cash_flow_projections', label: t('financial.cashFlowProjections') },
                    { key: 'break_even_analysis', label: t('financial.breakEvenAnalysis') }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={opportunityData.financial_documentation[key as keyof typeof opportunityData.financial_documentation] as boolean}
                        onChange={(e) => updateOpportunityField('financial_documentation', key, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Debt Profile Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-primary-600" />
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  {t('opportunities.debtProfile')}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('debt.totalDebt')}
                  </label>
                  <input
                    type="number"
                    value={opportunityData.debt_profile.total_debt}
                    onChange={(e) => updateOpportunityField('debt_profile', 'total_debt', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('debt.debtToEquityRatio')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={opportunityData.debt_profile.debt_to_equity_ratio}
                    onChange={(e) => updateOpportunityField('debt_profile', 'debt_to_equity_ratio', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('debt.creditRating')}
                  </label>
                  <select
                    value={opportunityData.debt_profile.credit_rating}
                    onChange={(e) => updateOpportunityField('debt_profile', 'credit_rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t('common.select')}</option>
                    <option value="EXCELLENT">Excellent (750+)</option>
                    <option value="GOOD">Good (700-749)</option>
                    <option value="FAIR">Fair (650-699)</option>
                    <option value="POOR">Poor (600-649)</option>
                    <option value="VERY_POOR">Very Poor (<600)</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DueDiligenceProfile;