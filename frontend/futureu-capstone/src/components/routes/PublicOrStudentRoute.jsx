import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const PublicOrStudentRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  // Allow guests
  if (!isAuthenticated) {
    return children;
  }

  // Allow authenticated students
  if (userRole === 'STUDENT') {
    return children;
  }

  // Block other authenticated roles
  return <Navigate to="/unauthorized" />;
};

export default PublicOrStudentRoute;


