import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from './components/common/ErrorBoundary';
import OfflineIndicator from './components/common/OfflineIndicator';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import DashboardOverview from './components/dashboard/DashboardOverview';
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
            <Route path="/login" element={<LoginForm />} />
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
            <Route
              path="/opportunities"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRENEUR']}>
                  <Layout>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        My Opportunities
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300">
                        Manage your funding opportunities here.
                      </p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse-opportunities"
              element={
                <ProtectedRoute allowedRoles={['INVESTOR']}>
                  <Layout>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Browse Opportunities
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300">
                        Discover investment opportunities in your community.
                      </p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/investments"
              element={
                <ProtectedRoute allowedRoles={['INVESTOR']}>
                  <Layout>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        My Investments
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300">
                        Track your investment portfolio and returns.
                      </p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;