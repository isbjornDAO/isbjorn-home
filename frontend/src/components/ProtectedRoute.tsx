import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveAccount } from 'thirdweb/react';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const activeAccount = useActiveAccount();
  const location = useLocation();

  // Consider user authenticated if either:
  // 1. Traditional auth (email/password) is active
  // 2. Thirdweb wallet is connected
  const isUserAuth = isAuthenticated || !!activeAccount;

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifying authentication..." />;
  }

  if (!isUserAuth) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Role check only applies if user has traditional auth
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;