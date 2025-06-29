import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from './components/common/ErrorBoundary';
import OfflineIndicator from './components/common/OfflineIndicator';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import DashboardOverview from './components/dashboard/DashboardOverview';
import OpportunityList from './components/opportunities/OpportunityList';
import CreateOpportunityForm from './components/opportunities/CreateOpportunityForm';
import InvestmentDashboard from './components/investments/InvestmentDashboard';
import { useAuth } from './context/AuthContext';
import './i18n';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const OpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {user?.role === 'ENTREPRENEUR' ? 'My Opportunities' : 'Browse Opportunities'}
        </h1>
        {user?.role === 'ENTREPRENEUR' && (
          <button
            onClick={() => window.location.href = '/opportunities/create'}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Opportunity
          </button>
        )}
      </div>
      <OpportunityList userRole={user?.role || ''} userId={user?.id} />
    </div>
  );
};

function App() {
  const { ready } = useTranslation();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <OfflineIndicator />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardOverview />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Opportunities Routes */}
            <Route
              path="/opportunities"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRENEUR', 'INVESTOR']}>
                  <Layout>
                    <OpportunitiesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunities/create"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRENEUR']}>
                  <Layout>
                    <CreateOpportunityForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Investment Routes */}
            <Route
              path="/investments"
              element={
                <ProtectedRoute allowedRoles={['INVESTOR']}>
                  <Layout>
                    <InvestmentDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Browse Opportunities for Investors */}
            <Route
              path="/browse-opportunities"
              element={
                <ProtectedRoute allowedRoles={['INVESTOR']}>
                  <Layout>
                    <OpportunitiesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Service Provider Routes */}
            <Route
              path="/service-requests"
              element={
                <ProtectedRoute allowedRoles={['SERVICE_PROVIDER']}>
                  <Layout>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Service Requests
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300">
                        Manage your service requests and engagements here.
                      </p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Pool Routes */}
            <Route
              path="/pools"
              element={
                <ProtectedRoute allowedRoles={['INVESTOR']}>
                  <Layout>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Investment Pools
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300">
                        Join or create investment pools to collaborate with other investors.
                      </p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Admin Panel
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300">
                        Platform administration and management tools.
                      </p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;