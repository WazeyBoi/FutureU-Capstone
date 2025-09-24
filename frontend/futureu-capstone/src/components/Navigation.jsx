import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import profileService from '../services/profileService';
import FutureULogo from '../assets/header_logo_normal.svg';
import FutureULogo2 from '../assets/header_logo_yellow.svg';
import { clearRecommendationsFromLocalStorage } from './tabs/RecommendationsTab';
import { Users, FileText, Calendar, MessageSquare, BarChart2, BookOpen, LogOut, User } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [logoHover, setLogoHover] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      fetchUserProfile(user.id);
      
      let role = authService.getUserRole();
      if (role && role.toUpperCase() === 'GUIDANCE_COUNSELOR') role = 'CAREER_COUNSELOR';
      setUserRole(role);
    } else {
      setCurrentUser(null);
      setUserProfile(null);
      setUserRole(null);
    }
  }, [location]);

  const fetchUserProfile = async (userId) => {
    try {
      const profile = await profileService.getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Enhanced click outside handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    // Use capture phase to ensure this runs before other handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setShowDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    const userId = authService.getCurrentUserId();
    if (userId) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('futureu_recommendations_') || key.startsWith('futureu_program_recommendations_')) {
          localStorage.removeItem(key);
        }
      });
    }
    authService.signout();
    setIsAuthenticated(false);
    setUserProfile(null);
    setShowDropdown(false);
    navigate('/user-landing-page');
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    navigate('/profile');
  };

  // Enhanced dropdown toggle with proper event handling
  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(prev => !prev);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getProfilePictureUrl = () => {
    return userProfile?.profilePictureUrl || currentUser?.profilePictureUrl || null;
  };

  const ProfilePicture = ({ size = "w-10 h-10", showBorder = true, isClickable = false }) => {
    const [imageError, setImageError] = useState(false);
    const profilePictureUrl = getProfilePictureUrl();
    
    const handleImageError = () => {
      setImageError(true);
    };

    const borderClass = showBorder ? "border-2 border-white shadow-lg" : "";
    const hoverClass = isClickable ? "cursor-pointer hover:ring-2 hover:ring-[#FFB71B] hover:ring-offset-2 transition-all duration-200" : "";
    
    return (
      <div 
        className={`${size} rounded-full overflow-hidden ${borderClass} ${hoverClass}`}
        onClick={isClickable ? handleDropdownToggle : undefined}
      >
        {profilePictureUrl && !imageError ? (
          <img
            src={`http://localhost:8080${profilePictureUrl}`}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FFB71B] to-[#FFB71B]/80 flex items-center justify-center">
            <User className={`${size === "w-10 h-10" ? "w-6 h-6" : "w-7 h-7"} text-white`} />
          </div>
        )}
      </div>
    );
  };

  // Simplified ProfileDropdown - just the profile picture circle
  const ProfileDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      {/* Just the profile picture - no container or chevron */}
      <ProfilePicture size="w-10 h-10" showBorder={true} isClickable={true} />

      {/* Enhanced dropdown with higher z-index and better positioning */}
      {showDropdown && (
        <>
          {/* Backdrop overlay to catch clicks */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown menu with very high z-index */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[9999] animate-fadeIn">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <ProfilePicture size="w-12 h-12" showBorder={false} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#232D35] truncate">
                    {userProfile?.firstName || currentUser?.firstName} {userProfile?.lastname || currentUser?.lastname}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{userProfile?.email || currentUser?.email}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FFB71B]/20 text-[#232D35] mt-1">
                    {userRole === 'CAREER_COUNSELOR' || userRole === 'GUIDANCE_COUNSELOR' ? 'Counselor' : userRole || 'Student'}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={handleProfileClick}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#FFB71B]/10 hover:text-[#232D35] transition-colors duration-150 text-left"
                type="button"
              >
                <User className="w-5 h-5 mr-3 text-[#FFB71B]" />
                <span className="font-medium">My Profile</span>
              </button>
              
              <button
                onClick={handleLogout}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 text-left"
                type="button"
              >
                <LogOut className="w-5 h-5 mr-3 text-red-500" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Don't render the navigation bar for Counselor routes
  if (userRole === 'CAREER_COUNSELOR' || userRole === 'GUIDANCE_COUNSELOR') {
    return (
      <nav className="bg-transparent shadow-lg backdrop-blur-md nav-override relative z-40">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 w-full">
            {/* Brand with Logo */}
            <Link 
              to="/counselor-dashboard" 
              className="group flex items-center space-x-2 transition-all duration-300 hover:scale-105"
              onMouseEnter={() => setLogoHover(true)}
              onMouseLeave={() => setLogoHover(false)}
            >
              <img 
                src={logoHover ? FutureULogo2 : FutureULogo} 
                alt="FutureU Logo" 
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-110" 
              />
              
              <div className="text-[#232D35] text-xl font-bold tracking-wide group-hover:text-[#FFB71B] transition-colors duration-300">
                FutureU
              </div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FFB71B] to-[#FF9800] text-black shadow-md transition-colors duration-300 group-hover:text-[#EAE7DE]">
                Counselor
              </div>
            </Link>
            
            {/* Counselor Navigation Links */}
            <div className="flex items-center space-x-1">
              <Link
                to="/counselor-dashboard"
                className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  location.pathname.startsWith('/counselor-dashboard')
                    ? 'bg-[#FFB71B] text-black shadow-lg'
                    : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                }`}
              >
                <span className="relative z-10">
                  <BarChart2 className="w-4 h-4 inline-block mr-1.5" />
                  Dashboard
                </span>
              </Link>
              
              {/* Profile Dropdown for Counselors */}
              <div className="ml-6 pl-6 border-l border-[#FFB71B]/80">
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Default navigation for other roles (Students and Admin)
  return (
    <nav className="bg-transparent shadow-lg backdrop-blur-md nav-override relative z-40">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Brand with Logo */}
          <Link 
            to={userRole === 'ADMIN' ? '/admin-dashboard' : '/user-landing-page'} 
            className="group flex items-center space-x-2 transition-all duration-300 hover:scale-105"
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
          >
            <img 
              src={logoHover ? FutureULogo2 : FutureULogo} 
              alt="FutureU Logo" 
              className="h-12 w-auto transition-transform duration-300 group-hover:scale-110" 
            />
            
            <div className="text-[#232D35] text-xl font-bold tracking-wide group-hover:text-[#FFB71B] transition-colors duration-300">
              FutureU
            </div>
            {userRole === 'ADMIN' && (
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FFB71B] to-[#FF9800] text-black shadow-md transition-colors duration-300 group-hover:text-[#EAE7DE]">
                Admin
              </div>
            )}
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {/* Admin-specific navigation */}
            {isAuthenticated && (userRole === 'ADMIN' || userRole === 'CAREER_COUNSELOR' || userRole === 'GUIDANCE_COUNSELOR') && (
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
                  to="/counselor-dashboard"
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive('/counselor-dashboard')
                      ? 'bg-[#FFB71B] text-black shadow-lg'
                      : 'text-black hover:bg-[#FFB71B]/20 hover:text-[#FFB71B] hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">Counselor Dashboard</span>
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
           
            {/* Authentication buttons / Profile Dropdown */}
            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-[#FFB71B]/80">
              {isAuthenticated ? (
                <ProfileDropdown />
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

// Enhanced animation styles for dropdown
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default Navigation;