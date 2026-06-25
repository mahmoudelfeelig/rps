import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireStaff = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; 
  }

  if (user === null) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !['admin', 'global-admin'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (requireStaff && !['admin', 'global-admin', 'game-master'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
