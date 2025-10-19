import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, ChevronRight } from 'lucide-react';

const ProfileButtonWithTooltip = ({ 
  profilePictureUrl, 
  hasProfile, 
  onProfileClick, 
  onSetupProfile,
  showTooltip = true,
  showProfileWizard,
  setShowProfileWizard,
  tooltipPinned,
  setTooltipPinned,
  setShowNotificationTooltip // Add this prop
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const resolveSrc = (url) => {
    if (!url) return null;
    // Check if it's already a full URL (Cloudinary URLs start with https://)
    if (/^https?:\/\//i.test(url) || /^blob:|^data:/i.test(url)) return url;
    // Fallback for old local URLs (during migration)
    return `http://localhost:8080${url}`;
  };

  const handleImageError = () => setImageError(true);

  // Reset image error if URL changes (e.g., new upload finishes)
  React.useEffect(() => {
    setImageError(false);
  }, [profilePictureUrl]);

  // Handle notification hover
  const handleNotificationMouseEnter = () => {
    if (!tooltipPinned) {
      setIsHovered(true);
    }
  };

  const handleNotificationMouseLeave = () => {
    if (!tooltipPinned) {
      setTimeout(() => setIsHovered(false), 300);
    }
  };

  // Handle notification click to pin tooltip
  const handleNotificationClick = (e) => {
    e.stopPropagation();
    setTooltipPinned(!tooltipPinned);
    setIsHovered(!tooltipPinned);
  };

  // Handle tooltip hover to keep it visible
  const handleTooltipMouseEnter = () => {
    setIsHovered(true);
  };

  const handleTooltipMouseLeave = () => {
    if (!tooltipPinned) {
      setTimeout(() => setIsHovered(false), 300);
    }
  };

  // TRANSFERRED FUNCTION FROM NAVIGATION - Handle "Set up now" button click
  const handleSetupNowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotificationTooltip && setShowNotificationTooltip(false);
    setTooltipPinned(false);
    setShowProfileWizard(true);
    setIsHovered(false);
  };

  return (
    <div className="relative">
      {/* Profile Picture/Button */}
      <div 
        className="relative cursor-pointer"
        onMouseEnter={handleNotificationMouseEnter}
        onMouseLeave={handleNotificationMouseLeave}
        onClick={!hasProfile ? handleNotificationClick : onProfileClick}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg hover:ring-2 hover:ring-[#FFB71B] hover:ring-offset-2 transition-all duration-200">
          {profilePictureUrl && !imageError ? (
            <img
              src={resolveSrc(profilePictureUrl)}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FFB71B] to-[#FFB71B]/80 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        
        {/* Profile completion indicator with notification badge */}
        {!hasProfile && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Enhanced Hover Tooltip with Navigation design */}
      <AnimatePresence>
        {(isHovered || tooltipPinned) && !hasProfile && showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 z-50"
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <div className="bg-white/95 backdrop-blur-lg border border-[#FFB71B]/20 rounded-2xl shadow-xl p-4 w-80">
              {/* Arrow pointer */}
              <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-[#FFB71B]/20 transform rotate-45"></div>
              
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="bg-gradient-to-br from-[#FFB71B] to-[#FFB71B]/80 p-2.5 rounded-xl flex-shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#232D35] mb-1">
                    Complete Your Career Profile
                  </h4>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    Get personalized program recommendations, career insights, and tailored guidance based on your interests and goals.
                  </p>
                  
                  {/* Enhanced Button with Navigation design */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSetupNowClick}
                      className="inline-flex items-center text-xs font-semibold text-white hover:text-[#232D35] transition-all duration-300 group bg-gradient-to-r from-[#1D63A1] to-[#2B3E4E] hover:from-[#FFB71B] hover:to-[#FFB71B] px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Set up now
                      <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    
                    {tooltipPinned && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTooltipPinned(false);
                          setIsHovered(false);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Takes less than 2 minutes
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileButtonWithTooltip;