import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
 
const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
 
  useEffect(() => {
    // Check authentication status and role when component mounts or location changes
    setIsAuthenticated(authService.isAuthenticated());
    setUserRole(authService.getUserRole());
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
          <Link to={userRole === 'ADMIN' ? '/admin-dashboard' : '/user-landing-page'} className="text-white text-xl font-semibold">
            FutureU {userRole === 'ADMIN' && <span className="text-[#FFB71B] text-sm ml-2">Admin</span>}
          </Link>
 
          {/* Navigation Links */}
          <div className="flex space-x-1">
            {/* Admin-specific navigation */}
            {isAuthenticated && userRole === 'ADMIN' && (
              <>
                <Link
                  to="/admin-dashboard"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin-dashboard')
                      ? 'bg-[#FFB71B] text-[#2B3E4E]'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                
                {/* Add other admin-specific links here */}
                <Link
                  to="/assessment-categories"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.includes('/assessment')
                      ? 'bg-[#f5fafc] text-white'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Assessment Management
                </Link>
                
                <Link
                  to="/questions"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.includes('/questions')
                      ? 'bg-[#f5fafc] text-white'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Questions
                </Link>
              </>
            )}
            
            {/* Student/Regular user navigation */}
            {isAuthenticated && userRole !== 'ADMIN' && (
              <>
                <Link
                  to="/user-landing-page"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/user-landing-page')
                      ? 'bg-[#f5fafc] text-white'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Home
                </Link>
                
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
                
                {/* Other student-specific links... */}
                <Link
                  to="/assessment-dashboard"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.includes('/assessment')
                      ? 'bg-[#f5fafc] text-white'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Assessments
                </Link>
              </>
            )}
            
            {/* Public links (not logged in) */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/user-landing-page"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/user-landing-page')
                      ? 'bg-[#f5fafc] text-white'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  Home
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