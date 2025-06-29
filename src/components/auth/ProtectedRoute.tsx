import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthMiddleware, RouteGuardOptions } from '../../middleware/authMiddleware';
import { authService } from '../../services/authService';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedRoles = [],
  requiredPermissions = [],
  redirectTo = '/login'
}) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    const validateAccess = async () => {
      setIsLoading(true);

      try {
        // First check if session is valid
        const sessionValid = await AuthMiddleware.validateSession();
        setIsValidSession(sessionValid);

        // If session is invalid and auth is required, don't proceed
        if (requireAuth && !sessionValid) {
          setIsLoading(false);
          return;
        }

        // Check route access permissions
        const options: RouteGuardOptions = {
          requireAuth,
          allowedRoles,
          requiredPermissions,
          redirectTo
        };

        const accessResult = AuthMiddleware.canAccess(options);
        
        if (!accessResult.allowed) {
          setIsValidSession(false);
        }

      } catch (error) {
        console.error('Route validation error:', error);
        setIsValidSession(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateAccess();
  }, [requireAuth, allowedRoles, requiredPermissions, redirectTo, location.pathname]);

  // Show loading spinner while validating
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Validating access...
          </p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !AuthMiddleware.isAuthenticated()) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: 'Please log in to access this page'
        }} 
        replace 
      />
    );
  }

  // Check role requirements
  if (allowedRoles.length > 0 && !AuthMiddleware.hasAnyRole(allowedRoles)) {
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

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission => 
      AuthMiddleware.hasPermission(permission)
    );
    
    if (!hasPermission) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            from: location.pathname,
            reason: 'insufficient_permissions',
            requiredPermissions
          }} 
          replace 
        />
      );
    }
  }

  // If session is invalid, redirect to login
  if (requireAuth && !isValidSession) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: 'Your session has expired. Please log in again.'
        }} 
        replace 
      />
    );
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;