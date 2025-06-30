import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface InvestorStats {
  totalInvested: number;
  activeInvestments: number;
  portfolioROI: number;
  poolMemberships: number;
  monthlyReturn: number;
  pendingOffers: number;
}

interface Investment {
  id: string;
  opportunityTitle: string;
  entrepreneur: string;
  amountInvested: number;
  equityPercentage: number;
  currentValue: number;
  roi: number;
  status: string;
  investmentDate: string;
}

interface Opportunity {
  id: string;
  title: string;
  entrepreneur: string;
  industry: string;
  fundingGoal: number;
  currentFunding: number;
  equityOffered: number;
  minInvestment: number;
  daysLeft: number;
}

const InvestorDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'investments' | 'opportunities'>('overview');
  
  const [stats, setStats] = useState<InvestorStats>({
    totalInvested: 0,
    activeInvestments: 0,
    portfolioROI: 0,
    poolMemberships: 0,
    monthlyReturn: 0,
    pendingOffers: 0
  });

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats({
        totalInvested: 125000,
        activeInvestments: 8,
        portfolioROI: 18.5,
        poolMemberships: 3,
        monthlyReturn: 2.3,
        pendingOffers: 2
      });

      setInvestments([
        {
          id: '1',
          opportunityTitle: 'Solar Energy Installation Project',
          entrepreneur: 'Green Energy Solutions Ltd.',
          amountInvested: 25000,
          equityPercentage: 8,
          currentValue: 28500,
          roi: 14.0,
          status: 'ACTIVE',
          investmentDate: '2024-01-15'
        },
        {
          id: '2',
          opportunityTitle: 'Agricultural Equipment Rental',
          entrepreneur: 'Farm Solutions Co.',
          amountInvested: 35000,
          equityPercentage: 12,
          currentValue: 42000,
          roi: 20.0,
          status: 'ACTIVE',
          investmentDate: '2023-12-10'
        },
        {
          id: '3',
          opportunityTitle: 'Mobile Payment Platform',
          entrepreneur: 'FinTech Innovations',
          amountInvested: 50000,
          equityPercentage: 15,
          currentValue: 65000,
          roi: 30.0,
          status: 'COMPLETED',
          investmentDate: '2023-11-05'
        }
      ]);

      setOpportunities([
        {
          id: '1',
          title: 'E-commerce Platform for Local Artisans',
          entrepreneur: 'Digital Marketplace Ltd.',
          industry: 'Technology',
          fundingGoal: 75000,
          currentFunding: 45000,
          equityOffered: 20,
          minInvestment: 5000,
          daysLeft: 15
        },
        {
          id: '2',
          title: 'Organic Food Processing Plant',
          entrepreneur: 'Healthy Foods Co.',
          industry: 'Agriculture',
          fundingGoal: 150000,
          currentFunding: 90000,
          equityOffered: 25,
          minInvestment: 10000,
          daysLeft: 8
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
      case 'ACTIVE':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'COMPLETED':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      case 'PENDING':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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
              Investor Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Track your investments and discover new opportunities
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Investment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats.totalInvested)}
              </p>
              <p className="text-sm text-success-600 mt-1">
                +{stats.monthlyReturn}% this month
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Investments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.activeInvestments}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Across {stats.poolMemberships} pools
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio ROI</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.portfolioROI}%
              </p>
              <p className="text-sm text-success-600 mt-1">
                Above market average
              </p>
            </div>
            <PieChart className="h-8 w-8 text-accent-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pool Memberships</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.poolMemberships}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.pendingOffers} pending offers
              </p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Portfolio Overview' },
              { id: 'investments', label: 'My Investments' },
              { id: 'opportunities', label: 'New Opportunities' }
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
              {/* Portfolio Performance Chart Placeholder */}
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Portfolio Performance Chart
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Interactive chart showing investment performance over time
                </p>
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
                        Investment in Solar Energy Project completed milestone
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-primary-600" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        Dividend payment received from Farm Solutions Co.
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'investments' && (
            <div className="space-y-4">
              {investments.map((investment) => (
                <div key={investment.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {investment.opportunityTitle}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                          {investment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {investment.entrepreneur}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Invested</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(investment.amountInvested)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Equity</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {investment.equityPercentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Current Value</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(investment.currentValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
                          <p className={`text-sm font-medium ${investment.roi > 0 ? 'text-success-600' : 'text-error-600'}`}>
                            {investment.roi > 0 ? '+' : ''}{investment.roi}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {opportunity.title}
                        </h4>
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-xs font-medium">
                          {opportunity.industry}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {opportunity.entrepreneur}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Funding Goal</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(opportunity.fundingGoal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Current Funding</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(opportunity.currentFunding)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Equity Offered</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {opportunity.equityOffered}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Min Investment</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(opportunity.minInvestment)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{Math.round((opportunity.currentFunding / opportunity.fundingGoal) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min((opportunity.currentFunding / opportunity.fundingGoal) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          {opportunity.daysLeft} days left
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                        Make Offer
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

export default InvestorDashboardPage;