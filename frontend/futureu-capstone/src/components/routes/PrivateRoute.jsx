import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState({ loading: true, isAuthenticated: false });
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        setAuthState({ loading: false, isAuthenticated });
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthState({ loading: false, isAuthenticated: false });
      }
    };

    checkAuth();
  }, []);

  if (authState.loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!authState.isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
};

export default PrivateRoute;
