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
            className="block w-full py-2 px-4 bg-[#FFB71B] hover:bg-[#e09b00] text-black rounded-lg transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;