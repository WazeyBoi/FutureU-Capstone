import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const PublicRoute = ({ children }) => {
  // If user is already authenticated, redirect based on role
  if (authService.isAuthenticated()) {
    const role = authService.getUserRole();
    
    // Redirect based on user role
    if (role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (role === 'CAREER_GUIDANCE') {
      return <Navigate to="/counselor-general-dashboard" replace />;
    } else {
      // Default for STUDENT or other roles - redirect to student homepage
      return <Navigate to="/student-home" replace />;
    }
  }

  // Otherwise render the public route (login/register)
  return children;
};

export default PublicRoute;