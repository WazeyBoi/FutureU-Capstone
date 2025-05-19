import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. This area requires administrator privileges.
        </p>
        <div className="space-y-3">
          <Link 
            to="/user-landing-page" 
            className="block w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            Return to Home
          </Link>
          <Link 
            to="/admin-login" 
            className="block w-full py-2 px-4 bg-[#1D63A1] hover:bg-[#1D63A1]/90 text-white rounded-lg transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;