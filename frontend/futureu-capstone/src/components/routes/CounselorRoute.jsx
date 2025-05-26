import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const CounselorRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();
  
  if (!isAuthenticated) {
    return <Navigate to="/counselor/login" state={{ from: location.pathname }} />;
  }
  
  if (userRole !== 'GUIDANCE_COUNSELOR' && userRole !== 'CAREER_COUNSELOR' && userRole !== 'ADMIN') {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default CounselorRoute;