import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const PublicRoute = ({ children }) => {
  // If user is already authenticated, redirect to landing page
  if (authService.isAuthenticated()) {
    return <Navigate to="/user-landing-page" replace />;
  }

  // Otherwise render the public route (login/register)
  return children;
};

export default PublicRoute;