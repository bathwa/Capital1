import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Briefcase, 
  DollarSign, 
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Plus,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ServiceProviderStats {
  activeRequests: number;
  completedServices: number;
  totalEarnings: number;
  averageRating: number;
  monthlyGrowth: number;
  responseTime: number;
}

interface ServiceRequest {
  id: string;
  title: string;
  client: string;
  category: string;
  payment: number;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  description: string;
}

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  basePrice: number;
  rating: number;
  completedJobs: number;
  isActive: boolean;
}

const ServiceProviderDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'services'>('overview');
  
  const [stats, setStats] = useState<ServiceProviderStats>({
    activeRequests: 0,
    completedServices: 0,
    totalEarnings: 0,
    averageRating: 0,
    monthlyGrowth: 0,
    responseTime: 0
  });

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats({
        activeRequests: 5,
        completedServices: 23,
        totalEarnings: 45000,
        averageRating: 4.8,
        monthlyGrowth: 15.2,
        responseTime: 2.5
      });

      setServiceRequests([
        {
          id: '1',
          title: 'Legal Review for Investment Agreement',
          client: 'Green Energy Solutions Ltd.',
          category: 'Legal Services',
          payment: 2500,
          status: 'IN_PROGRESS',
          dueDate: '2024-01-25',
          description: 'Comprehensive legal review of investment agreement terms and conditions.'
        },
        {
          id: '2',
          title: 'Market Research for AgriTech',
          client: 'Farm Solutions Co.',
          category: 'Market Research',
          payment: 3200,
          status: 'PENDING',
          dueDate: '2024-01-30',
          description: 'Conduct market research for agricultural technology expansion.'
        },
        {
          id: '3',
          title: 'Financial Audit',
          client: 'Mobile Payment Ltd.',
          category: 'Financial Services',
          payment: 4500,
          status: 'COMPLETED',
          dueDate: '2024-01-20',
          description: 'Complete financial audit for mobile payment platform.'
        }
      ]);

      setServices([
        {
          id: '1',
          title: 'Legal Document Review',
          category: 'Legal Services',
          description: 'Professional review of contracts, agreements, and legal documents',
          basePrice: 150,
          rating: 4.9,
          completedJobs: 12,
          isActive: true
        },
        {
          id: '2',
          title: 'Market Research & Analysis',
          category: 'Business Consulting',
          description: 'Comprehensive market research and competitive analysis',
          basePrice: 200,
          rating: 4.7,
          completedJobs: 8,
          isActive: true
        },
        {
          id: '3',
          title: 'Financial Consulting',
          category: 'Financial Services',
          description: 'Financial planning, analysis, and audit services',
          basePrice: 180,
          rating: 4.8,
          completedJobs: 15,
          isActive: true
        }
      ]);

      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Service Provider Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your services and grow your professional network
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.activeRequests}
              </p>
              <p className="text-sm text-primary-600 mt-1">
                Current engagements
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.completedServices}
              </p>
              <p className="text-sm text-success-600 mt-1">
                +{stats.monthlyGrowth}% this month
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
                {formatCurrency(stats.totalEarnings)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Platform earnings
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
              <div className="flex items-center mt-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
                  {stats.averageRating}
                </p>
                <div className="flex">
                  {renderStars(stats.averageRating)}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Client satisfaction
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'requests', label: 'Service Requests' },
              { id: 'services', label: 'My Services' }
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
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</span>
                    <Clock className="h-5 w-5 text-primary-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats.responseTime}h
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Average response</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</span>
                    <TrendingUp className="h-5 w-5 text-success-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">98%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Project completion</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Repeat Clients</span>
                    <Users className="h-5 w-5 text-accent-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">65%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Client retention</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-success-600" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        Completed financial audit for Mobile Payment Ltd.
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5 text-primary-600" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        New service request from Green Energy Solutions
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {serviceRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {request.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {request.client} • {request.category}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {request.description}
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(request.payment)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {new Date(request.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      {request.status === 'PENDING' && (
                        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {service.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.isActive 
                            ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {service.category}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {service.description}
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(service.basePrice)}/hour
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex mr-1">
                            {renderStars(service.rating)}
                          </div>
                          {service.rating} ({service.completedJobs} jobs)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        <Eye className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderDashboardPage;