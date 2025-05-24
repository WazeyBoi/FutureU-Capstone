

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import FutureULogo from '../assets/FutureU_Logo_Header_Display.png'; // Import the logo - adjust path/extension if needed
 
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
    <nav className="bg-transparent border-b border-[#2B3E4E]/20 shadow-lg backdrop-blur-md nav-override">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand with Logo */}
          <Link 
            to={userRole === 'ADMIN' ? '/admin-dashboard' : '/user-landing-page'} 
            className="group flex items-center space-x-2 transition-all duration-300 hover:scale-105"
          >
            {/* Real Logo - Increased Size */}
            <img 
              src={FutureULogo} 
              alt="FutureU Logo" 
              className="h-12 w-auto transition-transform duration-300 group-hover:scale-110" 
            />
            
            <div className="text-black text-xl font-bold tracking-wide group-hover:text-[#FFB71B] transition-colors duration-300">
              FutureU
            </div>
            {userRole === 'ADMIN' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FFB71B] to-[#FF9800] text-black shadow-md">
                Admin
              </span>
            )}
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {/* Admin-specific navigation */}
            {isAuthenticated && userRole === 'ADMIN' && (
              <>
                <Link
                  to="/admin-dashboard"
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive('/admin-dashboard')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Dashboard</span>
                </Link>
                
                <Link
                  to="/assessment-categories"
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    location.pathname.includes('/assessment')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Assessment Management</span>
                </Link>
                
                <Link
                  to="/questions"
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    location.pathname.includes('/questions')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Questions</span>
                </Link>
              </>
            )}
            
            {/* Student/Regular user navigation */}
            {isAuthenticated && userRole !== 'ADMIN' && (
              <>
                <Link
                  to="/user-landing-page"
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive('/user-landing-page')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Home</span>
                </Link>
                
                <Link
                  to="/academic-explorer"
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive('/academic-explorer')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Academic Explorer</span>
                </Link>
                
                <Link
                  to="/accreditation"
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    location.pathname.includes('/accreditation')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Accreditation</span>
                </Link>
                
                <Link
                  to="/virtual-campus-tours"
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive('/virtual-campus-tours')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Virtual Campus Tours</span>
                </Link>
                
                <Link
                  to="/testimonials"
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive('/testimonials')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Testimonials</span>
                </Link>
                
                <Link
                  to="/career-pathways"
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive('/career-pathways')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Career Pathways</span>
                </Link>
                
                <Link
                  to="/assessment-dashboard"
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    location.pathname.includes('/assessment')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Assessments</span>
                </Link>
              </>
            )}
            
            {/* Public links (not logged in) */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/user-landing-page"
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive('/user-landing-page')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Home</span>
                </Link>
              </>
            )}
           
            {/* Authentication buttons */}
            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-[#2B3E4E]/30">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="relative overflow-hidden px-6 py-2.5 bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  <span className="relative z-10">Logout</span>
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 border border-[#2B3E4E] ${
                      isActive('/login')
                        ? 'bg-[#FFB71B]/20 text-[#2B3E4E] shadow-lg'
                        : 'bg-[#2B3E4E] text-[#FFB71B] hover:bg-[#2B3E4E]/90 hover:shadow-lg'
                    }`}
                  >
                    <span className="relative z-10">Sign In</span>
                  </Link>
                 
                  <Link
                    to="/register"
                    className="relative overflow-hidden px-6 py-2.5 bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    <span className="relative z-10">Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
 
export default Navigation;