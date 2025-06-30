import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Eye, 
  Users, 
  FileText, 
  AlertTriangle,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ObserverStats {
  observedEntities: number;
  accessPermissions: number;
  recentReports: number;
  alerts: number;
  totalObservations: number;
  activeMonitoring: number;
}

interface ObservedEntity {
  id: string;
  name: string;
  type: 'ENTREPRENEUR' | 'INVESTOR' | 'OPPORTUNITY' | 'POOL';
  status: 'ACTIVE' | 'INACTIVE' | 'FLAGGED';
  lastActivity: string;
  permissions: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface Report {
  id: string;
  title: string;
  entityName: string;
  type: 'FINANCIAL' | 'PERFORMANCE' | 'COMPLIANCE' | 'MILESTONE';
  generatedDate: string;
  status: 'READY' | 'PROCESSING' | 'ERROR';
}

const ObserverDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'entities' | 'reports'>('overview');
  
  const [stats, setStats] = useState<ObserverStats>({
    observedEntities: 0,
    accessPermissions: 0,
    recentReports: 0,
    alerts: 0,
    totalObservations: 0,
    activeMonitoring: 0
  });

  const [observedEntities, setObservedEntities] = useState<ObservedEntity[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats({
        observedEntities: 12,
        accessPermissions: 8,
        recentReports: 5,
        alerts: 3,
        totalObservations: 45,
        activeMonitoring: 9
      });

      setObservedEntities([
        {
          id: '1',
          name: 'Green Energy Solutions Ltd.',
          type: 'ENTREPRENEUR',
          status: 'ACTIVE',
          lastActivity: '2024-01-20',
          permissions: ['VIEW_FINANCIALS', 'VIEW_MILESTONES', 'VIEW_REPORTS'],
          riskLevel: 'LOW'
        },
        {
          id: '2',
          name: 'Solar Energy Investment Pool',
          type: 'POOL',
          status: 'ACTIVE',
          lastActivity: '2024-01-19',
          permissions: ['VIEW_MEMBER_LIST', 'VIEW_MEETING_MINUTES', 'VIEW_FINANCIALS'],
          riskLevel: 'MEDIUM'
        },
        {
          id: '3',
          name: 'Farm Solutions Co.',
          type: 'ENTREPRENEUR',
          status: 'FLAGGED',
          lastActivity: '2024-01-18',
          permissions: ['VIEW_MILESTONES', 'VIEW_REPORTS'],
          riskLevel: 'HIGH'
        },
        {
          id: '4',
          name: 'Investment Group A',
          type: 'INVESTOR',
          status: 'ACTIVE',
          lastActivity: '2024-01-20',
          permissions: ['VIEW_PORTFOLIO', 'VIEW_TRANSACTIONS'],
          riskLevel: 'LOW'
        }
      ]);

      setReports([
        {
          id: '1',
          title: 'Monthly Financial Report',
          entityName: 'Green Energy Solutions Ltd.',
          type: 'FINANCIAL',
          generatedDate: '2024-01-20',
          status: 'READY'
        },
        {
          id: '2',
          title: 'Milestone Progress Report',
          entityName: 'Farm Solutions Co.',
          type: 'MILESTONE',
          generatedDate: '2024-01-19',
          status: 'READY'
        },
        {
          id: '3',
          title: 'Compliance Audit Report',
          entityName: 'Solar Energy Investment Pool',
          type: 'COMPLIANCE',
          generatedDate: '2024-01-18',
          status: 'PROCESSING'
        }
      ]);

      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'FLAGGED':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'PROCESSING':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'ERROR':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ENTREPRENEUR':
        return <TrendingUp className="h-4 w-4" />;
      case 'INVESTOR':
        return <Users className="h-4 w-4" />;
      case 'OPPORTUNITY':
        return <BarChart3 className="h-4 w-4" />;
      case 'POOL':
        return <Users className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Observer Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Monitor and oversee investment activities with read-only access
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Observed Entities</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.observedEntities}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.activeMonitoring} actively monitored
              </p>
            </div>
            <Eye className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Access Permissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.accessPermissions}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Different access levels
              </p>
            </div>
            <Shield className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Reports</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.recentReports}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                New reports available
              </p>
            </div>
            <FileText className="h-8 w-8 text-accent-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.alerts}
              </p>
              <p className="text-sm text-warning-600 mt-1">
                Require attention
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-warning-600" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'entities', label: 'Observed Entities' },
              { id: 'reports', label: 'Reports' }
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
              {/* Monitoring Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Monitoring Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Observations</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {stats.totalObservations}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Monitoring</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {stats.activeMonitoring}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Flagged Entities</span>
                      <span className="text-sm font-medium text-error-600">
                        {observedEntities.filter(e => e.status === 'FLAGGED').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Risk Distribution
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Low Risk</span>
                      <span className="text-sm font-medium text-success-600">
                        {observedEntities.filter(e => e.riskLevel === 'LOW').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Medium Risk</span>
                      <span className="text-sm font-medium text-warning-600">
                        {observedEntities.filter(e => e.riskLevel === 'MEDIUM').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">High Risk</span>
                      <span className="text-sm font-medium text-error-600">
                        {observedEntities.filter(e => e.riskLevel === 'HIGH').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Alerts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Alerts
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-error-50 dark:bg-error-900 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-error-600" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        Farm Solutions Co. missed milestone deadline
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-warning-50 dark:bg-warning-900 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-warning-600" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        Solar Energy Investment Pool meeting scheduled
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Observed Entities
                </h3>
                <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </button>
              </div>
              
              {observedEntities.map((entity) => (
                <div key={entity.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(entity.type)}
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {entity.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entity.status)}`}>
                          {entity.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(entity.riskLevel)}`}>
                          {entity.riskLevel} RISK
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Type: {entity.type} • Last Activity: {new Date(entity.lastActivity).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {entity.permissions.map((permission, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                            {permission.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        <Eye className="h-4 w-4 mr-1" />
                        Monitor
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Available Reports
                </h3>
                <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </button>
              </div>
              
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="h-5 w-5 text-primary-600" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {report.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {report.entityName} • {report.type} Report
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Generated: {new Date(report.generatedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {report.status === 'READY' && (
                        <>
                          <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </>
                      )}
                      {report.status === 'PROCESSING' && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Processing...</span>
                      )}
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

export default ObserverDashboardPage;