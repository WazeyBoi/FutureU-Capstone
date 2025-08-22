import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const PublicRoute = ({ children }) => {
  const [authState, setAuthState] = useState({ loading: true, isAuthenticated: false, role: null });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          const role = await authService.getUserRole();
          setAuthState({ loading: false, isAuthenticated: true, role });
        } else {
          setAuthState({ loading: false, isAuthenticated: false, role: null });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthState({ loading: false, isAuthenticated: false, role: null });
      }
    };

    checkAuth();
  }, []);

  if (authState.loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If user is already authenticated, redirect based on role
  if (authState.isAuthenticated) {
    // Redirect based on user role
    if (authState.role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (authState.role === 'CAREER_GUIDANCE') {
      return <Navigate to="/counselor-dashboard" replace />;
    } else {
      // Default for STUDENT or other roles
      return <Navigate to="/user-landing-page" replace />;
    }
  }

  // Otherwise render the public route (login/register)
  return children;
};

export default PublicRoute;