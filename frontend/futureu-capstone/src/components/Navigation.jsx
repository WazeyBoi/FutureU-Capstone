import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status when component mounts or location changes
    setIsAuthenticated(authService.isAuthenticated());
  }, [location]);

  const handleLogout = () => {
    authService.signout();
    setIsAuthenticated(false);
    navigate('/user-landing-page');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-[#111d24] border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/user-landing-page" className="text-white text-xl font-semibold">
            FutureU
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-1">
            {/* Always visible links */}
            <Link
              to="/user-landing-page"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/user-landing-page') 
                  ? 'bg-[#f5fafc] text-white'
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              Landing Page
            </Link>
            
            {/* Links that require authentication */}
            {isAuthenticated && (
              <>
                <Link
                  to="/academic-explorer"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/academic-explorer') 
                      ? 'bg-[#f5fafc] text-white'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Academic Explorer
                </Link>
                
                <Link
                  to="/accreditation"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.includes('/accreditation')
                      ? 'bg-[#f5fafc] text-white'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Accreditation Ratings
                </Link>

                <Link
                  to="/virtual-campus-tours"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.includes('/virtual-campus-tours')
                      ? 'bg-[#f5fafc] text-white'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Virtual Campus Tours
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
              </>
            )}
            
            {/* Authentication buttons */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] font-medium rounded-md transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/login') 
                      ? 'bg-[#f5fafc] text-white'
                      : 'bg-[#1D63A1] text-white hover:bg-[#1D63A1]/90'
                  }`}
                >
                  Sign In
                </Link>
                
                <Link
                  to="/register"
                  className="ml-2 px-4 py-2 bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] font-medium rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;