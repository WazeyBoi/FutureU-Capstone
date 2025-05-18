import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" state={{ from: location.pathname }} />;
  }
  
  if (userRole !== 'ADMIN') {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default AdminRoute;