import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-[#111d24] border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/academic-explorer" className="text-white text-xl font-semibold">
            FutureU
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-1">
            <Link
              to="/academic-explorer"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/academic-explorer') 
                  ? 'bg-[#f5fafc] text-white' // Changed text color to white
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              Academic Explorer
            </Link>
            
            <Link
              to="/accreditation"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.includes('/accreditation')
                  ? 'bg-[#f5fafc] text-white' // Changed text color to white
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              Accreditation Ratings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;