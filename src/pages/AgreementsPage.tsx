import React from 'react';
import { 
  FileText, 
  Shield, 
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Edit,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Agreement } from '../services/agreementsService';
import { useI18n } from '../context/I18nContext';
import { useAgreements } from '../context/AgreementsContext';

const AgreementsPage: React.FC = () => {
  const { t } = useI18n();
  const { 
    agreements, 
    activeTab,
    searchTerm,
    statusFilter,
    setActiveTab,
    setSearchTerm,
    setStatusFilter
  } = useAgreements();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INVESTMENT_AGREEMENT':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      case 'NDA':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'SERVICE_AGREEMENT':
        return 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FULLY_EXECUTED':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'PENDING_SIGNATURES':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'EXPIRED':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FULLY_EXECUTED':
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case 'PENDING_SIGNATURES':
        return <Clock className="h-4 w-4 text-warning-600" />;
      case 'DRAFT':
        return <Edit className="h-4 w-4 text-gray-600" />;
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-error-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INVESTMENT_AGREEMENT':
        return <FileText className="h-5 w-5 text-primary-600" />;
      case 'NDA':
        return <Shield className="h-5 w-5 text-purple-600" />;
      case 'SERVICE_AGREEMENT':
        return <Briefcase className="h-5 w-5 text-accent-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredAgreements = agreements.filter((agreement: Agreement) => {
    const matchesSearch = agreement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agreement.parties.some((party: string) => party.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'investment' && agreement.type === 'INVESTMENT_AGREEMENT') ||
                      (activeTab === 'nda' && agreement.type === 'NDA') ||
                      (activeTab === 'service' && agreement.type === 'SERVICE_AGREEMENT');
    const matchesStatus = statusFilter === 'all' || agreement.status.toLowerCase().includes(statusFilter);
    
    return matchesSearch && matchesTab && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('agreements.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your investment agreements, NDAs, and service contracts
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              {t('agreements.generateAgreement')}
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'all', label: 'All Agreements', count: agreements.length },
              { id: 'investment', label: t('agreements.investmentAgreement'), count: agreements.filter((a: Agreement) => a.type === 'INVESTMENT_AGREEMENT').length },
              { id: 'nda', label: t('agreements.nda'), count: agreements.filter((a: Agreement) => a.type === 'NDA').length },
              { id: 'service', label: t('agreements.serviceAgreement'), count: agreements.filter((a: Agreement) => a.type === 'SERVICE_AGREEMENT').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'all' | 'investment' | 'nda' | 'service')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Search agreements..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as 'all' | 'draft' | 'pending' | 'executed' | 'expired')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('agreements.all')}</option>
            <option value="draft">{t('agreements.draft')}</option>
            <option value="pending">{t('agreements.pending')}</option>
            <option value="executed">{t('agreements.executed')}</option>
            <option value="expired">{t('agreements.expired')}</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Agreements List */}
      <div className="space-y-4">
        {filteredAgreements.map((agreement: Agreement) => (
          <div key={agreement.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0">
                  {getTypeIcon(agreement.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {agreement.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(agreement.type)}`}>
                      {agreement.type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(agreement.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agreement.status)}`}>
                        {t(`agreements.${agreement.status.toLowerCase()}`)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">Parties:</span>
                      {agreement.parties.join(', ')}
                    </div>
                    
                    {agreement.opportunity && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium mr-2">Opportunity:</span>
                        {agreement.opportunity}
                      </div>
                    )}
                    
                    {agreement.amount && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium mr-2">Amount:</span>
                        ${agreement.amount.toLocaleString()}
                        {agreement.equity && (
                          <span className="ml-2">({agreement.equity}% equity)</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">Created:</span>
                      {new Date(agreement.createdDate).toLocaleDateString()}
                      {agreement.signedDate && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="font-medium mr-2">Signed:</span>
                          {new Date(agreement.signedDate).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Signatures */}
                  {agreement.signatures.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Signatures:</h4>
                      <div className="space-y-1">
                        {agreement.signatures.map((signature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                            <span>{signature.party}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(signature.signedAt).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{signature.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
                <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
                {agreement.status === 'PENDING_SIGNATURES' && (
                  <button className="flex items-center px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm">
                    {t('agreements.signAgreement')}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAgreements.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No agreements found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? t('agreements.noResults')
              : t('agreements.noAgreements')
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AgreementsPage;