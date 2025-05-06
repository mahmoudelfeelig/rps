import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1) still loading? render nothing (or a spinner)
  if (loading) {
    return null; 
  }

  // 2) not logged in
  if (user === null) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3) admin‐only
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 4) everything OK
  return children;
};

export default ProtectedRoute;
