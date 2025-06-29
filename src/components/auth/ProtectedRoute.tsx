import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = []
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Quick initial load check
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show minimal loading only on initial load
  if (initialLoad && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location.pathname,
          message: 'Please log in to access this page'
        }} 
        replace 
      />
    );
  }

  // Check role requirements
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          from: location.pathname,
          reason: 'insufficient_role',
          requiredRoles: allowedRoles
        }} 
        replace 
      />
    );
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;