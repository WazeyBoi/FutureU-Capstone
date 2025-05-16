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
              to="/user-landing-page"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/user-landing-page') 
                  ? 'bg-[#f5fafc] text-white' // Changed text color to white
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              Landing Page
            </Link>
            
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

            <Link
              to="/virtual-campus-tours"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.includes('/virtual-campus-tours')
                  ? 'bg-[#f5fafc] text-white' // Changed text color to white
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              Virtual Campus Tours
            </Link>

            <Link
              to="/testimonials"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.includes('/testimonials')
                  ? 'bg-[#f5fafc] text-white'
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              Testimonials
            </Link>

            <Link
              to="/career-pathways"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname.includes('/career-pathways')
                  ? 'bg-[#f5fafc] text-white'
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              Career Pathways
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;