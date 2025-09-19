import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/unauthorized' 
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate 
      to="/login" 
      state={{ 
        from: location.pathname,
        message: "Please log in to access this page." 
      }} 
      replace 
    />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate 
      to={redirectTo} 
      state={{ 
        from: location.pathname,
        message: `This page requires ${allowedRoles.join(' or ')} role. Your current role is ${user.role}.`,
        isRoleIssue: true
      }} 
      replace 
    />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
