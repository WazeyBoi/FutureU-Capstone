import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import authService from '../../services/authService';

const Unauthorized = () => {
  const [redirectPath, setRedirectPath] = useState('/user-landing-page'); // Default path
  
  useEffect(() => {
    // Determine redirect path based on user role
    const getRedirectPath = async () => {
      try {
        const userRole = await authService.getUserRole();
        
        if (userRole === 'ADMIN') {
          setRedirectPath('/admin-dashboard');
        } else if (userRole === 'GUIDANCE_COUNSELOR') {
          setRedirectPath('/counselor-dashboard');
        } else {
          setRedirectPath('/user-landing-page'); // Default for students or other roles
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRedirectPath('/user-landing-page'); // Default fallback
      }
    };

    getRedirectPath();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please return to your dashboard.
        </p>
        <div className="space-y-3">
          <Link 
            to={redirectPath} 
            className="block w-full py-2 px-4 bg-[#FFB71B] hover:bg-[#e09b00] text-black rounded-lg transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;