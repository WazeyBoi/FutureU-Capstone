import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const StudentRoute = ({ children }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState({ loading: true, isAuthenticated: false, userRole: null });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          const userRole = await authService.getUserRole();
          setAuthState({ loading: false, isAuthenticated: true, userRole });
        } else {
          setAuthState({ loading: false, isAuthenticated: false, userRole: null });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthState({ loading: false, isAuthenticated: false, userRole: null });
      }
    };

    checkAuth();
  }, []);

  if (authState.loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  if (authState.userRole !== 'STUDENT') {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default StudentRoute;