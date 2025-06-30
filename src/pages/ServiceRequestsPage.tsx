import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Upload,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  proposedPayment: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  requesterName: string;
  requesterType: 'ENTREPRENEUR' | 'INVESTOR';
  opportunityTitle?: string;
  createdDate: string;
  dueDate?: string;
  completedDate?: string;
  attachments: string[];
  messages: number;
  skills: string[];
  estimatedHours?: number;
  isDirected: boolean;
}

const ServiceRequestsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'all' | 'directed' | 'global' | 'my-requests'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Mock data for demonstration
  const serviceRequests: ServiceRequest[] = [
    {
      id: '1',
      title: 'Legal Review for Investment Agreement',
      description: 'Need comprehensive legal review of investment agreement terms and conditions. Must ensure compliance with local regulations and protect investor interests.',
      category: 'Legal Services',
      proposedPayment: 2500,
      status: 'PENDING',
      priority: 'HIGH',
      requesterName: 'Green Energy Solutions Ltd.',
      requesterType: 'ENTREPRENEUR',
      opportunityTitle: 'Solar Energy Installation Project',
      createdDate: '2024-01-20',
      dueDate: '2024-01-25',
      attachments: ['investment-agreement-draft.pdf', 'company-registration.pdf'],
      messages: 3,
      skills: ['Corporate Law', 'Investment Law', 'Contract Review'],
      estimatedHours: 15,
      isDirected: true
    },
    {
      id: '2',
      title: 'Market Research for AgriTech Expansion',
      description: 'Conduct comprehensive market research for agricultural technology expansion into rural markets. Need analysis of competition, pricing strategies, and market penetration opportunities.',
      category: 'Market Research',
      proposedPayment: 3200,
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      requesterName: 'Farm Solutions Co.',
      requesterType: 'ENTREPRENEUR',
      opportunityTitle: 'Agricultural Equipment Rental',
      createdDate: '2024-01-15',
      dueDate: '2024-01-30',
      attachments: ['market-brief.pdf'],
      messages: 8,
      skills: ['Market Analysis', 'Agricultural Sector', 'Rural Markets'],
      estimatedHours: 25,
      isDirected: false
    },
    {
      id: '3',
      title: 'Financial Audit and Compliance Review',
      description: 'Complete financial audit for mobile payment platform. Ensure compliance with financial regulations and prepare documentation for investor due diligence.',
      category: 'Financial Services',
      proposedPayment: 4500,
      status: 'COMPLETED',
      priority: 'HIGH',
      requesterName: 'Mobile Payment Ltd.',
      requesterType: 'ENTREPRENEUR',
      opportunityTitle: 'Mobile Payment Platform Expansion',
      createdDate: '2024-01-10',
      dueDate: '2024-01-20',
      completedDate: '2024-01-18',
      attachments: ['financial-statements.pdf', 'audit-report.pdf'],
      messages: 12,
      skills: ['Financial Audit', 'Compliance', 'FinTech'],
      estimatedHours: 35,
      isDirected: true
    },
    {
      id: '4',
      title: 'Technical Due Diligence for Tech Startup',
      description: 'Perform technical due diligence on software architecture, security protocols, and scalability assessment for a growing tech startup.',
      category: 'Technical Consulting',
      proposedPayment: 3800,
      status: 'ACCEPTED',
      priority: 'MEDIUM',
      requesterName: 'Investment Group A',
      requesterType: 'INVESTOR',
      createdDate: '2024-01-18',
      dueDate: '2024-02-05',
      attachments: ['tech-stack-overview.pdf'],
      messages: 5,
      skills: ['Software Architecture', 'Security Assessment', 'Scalability'],
      estimatedHours: 30,
      isDirected: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'ACCEPTED':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'COMPLETED':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'DECLINED':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Briefcase className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'DECLINED':
        return <X className="h-4 w-4" />;
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'directed' && request.isDirected) ||
                      (activeTab === 'global' && !request.isDirected) ||
                      (activeTab === 'my-requests' && request.status !== 'PENDING');
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && request.status === 'PENDING') ||
                         (statusFilter === 'active' && ['ACCEPTED', 'IN_PROGRESS'].includes(request.status)) ||
                         (statusFilter === 'completed' && ['COMPLETED', 'CANCELLED'].includes(request.status));
    
    return matchesSearch && matchesTab && matchesStatus;
  });

  const getTabCounts = () => {
    return {
      all: serviceRequests.length,
      directed: serviceRequests.filter(r => r.isDirected).length,
      global: serviceRequests.filter(r => !r.isDirected).length,
      myRequests: serviceRequests.filter(r => r.status !== 'PENDING').length
    };
  };

  const tabCounts = getTabCounts();

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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('serviceProviders.serviceRequests')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage service requests and grow your professional network
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Active Requests
              </div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {serviceRequests.filter(r => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status)).length}
              </div>
            </div>
            <button 
              onClick={() => setShowRequestModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Request
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {serviceRequests.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-warning-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {serviceRequests.filter(r => r.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {serviceRequests.filter(r => r.status === 'COMPLETED').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${serviceRequests.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.proposedPayment, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-success-600" />
          </div>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'all', label: 'All Requests', count: tabCounts.all },
              { id: 'directed', label: 'Directed to Me', count: tabCounts.directed },
              { id: 'global', label: 'Global Requests', count: tabCounts.global },
              { id: 'my-requests', label: 'My Requests', count: tabCounts.myRequests }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Search requests..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Service Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {request.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(request.status)}
                      <span>{request.status.replace('_', ' ')}</span>
                    </div>
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  {request.isDirected && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Directed
                    </span>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {request.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4 mr-2" />
                    <span>{request.requesterName}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>${request.proposedPayment.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Due: {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>{request.messages} messages</span>
                  </div>
                </div>

                {request.opportunityTitle && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>Related to: {request.opportunityTitle}</span>
                  </div>
                )}

                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium mr-2">Category:</span>
                    {request.category}
                  </div>
                  {request.estimatedHours && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{request.estimatedHours}h estimated</span>
                    </div>
                  )}
                </div>

                {request.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {request.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {request.attachments.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{request.attachments.length} attachment(s)</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 ml-6">
                <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </button>
                
                {request.status === 'PENDING' && (
                  <>
                    <button className="flex items-center px-3 py-1 bg-success-600 text-white rounded hover:bg-success-700 transition-colors text-sm">
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </button>
                    <button className="flex items-center px-3 py-1 bg-error-600 text-white rounded hover:bg-error-700 transition-colors text-sm">
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </button>
                  </>
                )}
                
                {request.status === 'IN_PROGRESS' && (
                  <button className="flex items-center px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Report
                  </button>
                )}
                
                {request.status === 'COMPLETED' && (
                  <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Download className="h-4 w-4 mr-1" />
                    Download Report
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No service requests found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Service requests will appear here when available'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestsPage;