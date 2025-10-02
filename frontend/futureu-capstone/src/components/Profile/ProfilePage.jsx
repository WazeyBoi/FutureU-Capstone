import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit, Save, X, Camera, Mail, Phone, MapPin, Calendar, Upload, Lock, Eye, EyeOff, Key, Hash, CheckCircle } from 'lucide-react';
import profileService from '../../services/profileService';
import institutionService from '../../services/institutionService';
import authService from '../../services/authService';
import { useProfile } from '../../contexts/ProfileContext';
import { useCareerInterestProfile } from '../../hooks/useCareerInterestProfile';
import CareerInterestProfileWizard from '../CareerInterestProfile/CareerInterestProfileWizard';
import ChangePasswordModal from './ChangePasswordModal';
import ProfileHeader from './ProfileHeader';
import ProfileSidebar from './ProfileSidebar';
import PersonalInformationSection from './PersonalInformationSection';
import CareerInterestProfileSection from './CareerInterestProfileSection';

// Import mascot characters
import ohMy from '../../assets/characters/ohMy.svg';
import ohMyLeft from '../../assets/characters/ohMyLeft.svg';
import quirky from '../../assets/characters/quirky.svg';
import excited from '../../assets/characters/excited.svg';

// Integrated LoadingScreen Component - Enhanced Responsive Design
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D63A1]/5 via-white to-[#FFB71B]/5 pt-16 sm:pt-20 pb-6 sm:pb-10 relative overflow-hidden flex items-center justify-center px-4">
      {/* Background Decorative Elements - Responsive positioning */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 sm:top-32 left-4 sm:left-8 w-16 sm:w-24 h-16 sm:h-24 bg-[#FFB71B]/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-48 sm:top-96 right-6 sm:right-12 w-20 sm:w-32 h-20 sm:h-32 bg-[#1D63A1]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 sm:bottom-32 left-1/4 w-12 sm:w-20 h-12 sm:h-20 bg-[#232D35]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-24 sm:w-40 h-24 sm:h-40 bg-gradient-to-br from-[#FFB71B]/5 to-[#1D63A1]/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Loading Content - Responsive sizing */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center w-full max-w-md mx-auto"
      >
        {/* Loading Card - Responsive padding and sizing */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-12 border border-white/20 relative overflow-hidden">
          {/* Card Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1D63A1]/5 via-transparent to-[#FFB71B]/5"></div>
          
          {/* Mascot - Responsive sizing */}
          <div className="relative z-10 mb-6 sm:mb-8">
            <motion.img
              src={quirky}
              alt="Loading mascot"
              className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 mx-auto"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(255, 183, 27, 0.3)) drop-shadow(0 8px 16px rgba(255, 183, 27, 0.2))'
              }}
              animate={{
                y: [0, -8, 0],
                rotate: [0, 3, -3, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Loading Spinner - Responsive sizing */}
          <div className="relative z-10 mb-4 sm:mb-6">
            <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 mx-auto">
              <div className="animate-spin rounded-full h-full w-full border-3 sm:border-4 border-[#FFB71B]/30 border-t-[#1D63A1] shadow-lg"></div>
            </div>
          </div>

          {/* Loading Text - Responsive typography */}
          <div className="relative z-10">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#232D35] mb-2 sm:mb-3">Loading Your Profile</h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              Getting everything ready for you...
            </p>
            
            {/* Loading Dots Animation - Responsive sizing */}
            <div className="flex justify-center mt-3 sm:mt-4 space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#FFB71B] rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>

          {/* Floating Elements - Responsive positioning */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-4 sm:w-6 md:w-8 h-4 sm:h-6 md:h-8 bg-[#1D63A1]/20 rounded-full blur-sm animate-pulse"></div>
          <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 w-3 sm:w-4 md:w-6 h-3 sm:h-4 md:h-6 bg-[#FFB71B]/20 rounded-full blur-sm animate-pulse"></div>
        </div>

        {/* Motivational Message - Responsive spacing and sizing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 sm:mt-8 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
        >
          <p className="text-[#232D35] text-xs sm:text-sm font-medium">
            ✨ Preparing your personalized dashboard experience
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

const ProfilePage = () => {
  // Use profile context instead of local state for user profile
  const { userProfile, profilePicture, updateProfilePicture, updateProfile, refreshProfile } = useProfile();
  
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editData, setEditData] = useState({});
  const [fileInputRef, setFileInputRef] = useState(null);

  // Change Password Modal States
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Career Interest Profile States
  const { hasProfile, profile: interestProfile, refreshProfile: refreshInterestProfile } = useCareerInterestProfile();
  const [showInterestWizard, setShowInterestWizard] = useState(false);

  // Mascot animation states
  const [mascotWiggle, setMascotWiggle] = useState(false);
  const [activeMascot, setActiveMascot] = useState('quirky');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Use profile context data when available
  useEffect(() => {
    if (userProfile) {
      setUser(userProfile);
      setEditData(userProfile);
      setLoading(false);
    }
  }, [userProfile]);

  // Mascot animation cycle
  useEffect(() => {
    const mascots = ['quirky', 'ohMy', 'ohMyLeft', 'excited'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      setMascotWiggle(true);
      
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % mascots.length;
        setActiveMascot(mascots[currentIndex]);
      }, 300);
      
      setTimeout(() => setMascotWiggle(false), 700);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Manual mascot wiggle trigger
  useEffect(() => {
    const wiggleInterval = setInterval(() => {
      setMascotWiggle(true);
      setTimeout(() => setMascotWiggle(false), 700);
    }, 5000);

    return () => clearInterval(wiggleInterval);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setError('Please log in to view your profile');
        return;
      }

      if (!userProfile) {
        const profileData = await profileService.getUserProfile(currentUser.id);
        setUser(profileData);
        setEditData(profileData);
      }
    } catch (error) {
      console.error('Full error object:', error);
      setError(typeof error === 'string' ? error : error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setError(null);
    setSuccess(null);
    setEditData(user);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData(user);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Validate school code for counselors if provided
      const role = user?.role;
      if ((role === 'GUIDANCE_COUNSELOR' || role === 'CAREER_COUNSELOR') && 
          editData.schoolCode && editData.schoolCode.trim()) {
        
        try {
          const isValidCode = await institutionService.validateSchoolCode(editData.schoolCode.trim());
          if (!isValidCode) {
            setError('Invalid school code. Please verify with your institution.');
            return;
          }
        } catch (validationError) {
          setError('Failed to validate school code. Please try again.');
          return;
        }
      }

      const currentUser = authService.getCurrentUser();
      const updatedUser = await updateProfile(currentUser.id, editData);
      
      setUser(updatedUser);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Full error object:', error);
      setError(typeof error === 'string' ? error : error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePictureClick = () => {
    if (fileInputRef) {
      fileInputRef.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const currentUser = authService.getCurrentUser();
      const result = await updateProfilePicture(currentUser.id, file);
      
      setUser(prev => ({
        ...prev,
        profilePictureUrl: result.profilePictureUrl
      }));
      setEditData(prev => ({
        ...prev,
        profilePictureUrl: result.profilePictureUrl
      }));
      
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Full error object:', error);
      setError(typeof error === 'string' ? error : error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  // Get current mascot image
  const getCurrentMascotImage = () => {
    switch (activeMascot) {
      case 'ohMy': return ohMy;
      case 'ohMyLeft': return ohMyLeft;
      case 'excited': return excited;
      default: return quirky;
    }
  };

  const getMascotMessage = () => {
    switch (activeMascot) {
      case 'ohMy': return "Keep your profile updated for better recommendations!";
      case 'ohMyLeft': return "Complete your career profile to unlock your potential!";
      case 'excited': return "You're doing great! Keep building your profile!";
      default: return "Welcome to your profile dashboard!";
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D63A1]/5 via-white to-[#FFB71B]/5 pt-16 sm:pt-20 pb-6 sm:pb-10 relative overflow-hidden">
      {/* Enhanced CSS for mascot animations */}
      <style>{`
        @keyframes mascotWiggle {
          0% { transform: rotate(0deg) scale(1) translateY(0px); }
          10% { transform: rotate(-8deg) scale(1.05) translateY(-5px); }
          20% { transform: rotate(6deg) scale(1.08) translateY(-8px); }
          30% { transform: rotate(-4deg) scale(1.06) translateY(-4px); }
          40% { transform: rotate(3deg) scale(1.04) translateY(-6px); }
          50% { transform: rotate(-2deg) scale(1.02) translateY(-3px); }
          60% { transform: rotate(1deg) scale(1.01) translateY(-2px); }
          70% { transform: rotate(-0.5deg) scale(1.005) translateY(-1px); }
          80% { transform: rotate(0.25deg) scale(1.002) translateY(-0.5px); }
          90% { transform: rotate(-0.125deg) scale(1.001) translateY(-0.25px); }
          100% { transform: rotate(0deg) scale(1) translateY(0px); }
        }
        
        .mascot-wiggle {
          animation: mascotWiggle 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(1deg); }
          50% { transform: translateY(-15px) rotate(0deg); }
          75% { transform: translateY(-8px) rotate(-1deg); }
        }
        
        .mascot-float {
          animation: float 4s ease-in-out infinite;
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Background Decorative Elements - Responsive positioning */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 sm:top-32 left-4 sm:left-8 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-[#FFB71B]/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-48 sm:top-96 right-6 sm:right-12 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-[#1D63A1]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 sm:bottom-32 left-1/4 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-[#232D35]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 bg-gradient-to-br from-[#FFB71B]/5 to-[#1D63A1]/5 rounded-full blur-3xl animate-bounce-slow"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        {/* Profile Header */}
        <ProfileHeader getMascotMessage={getMascotMessage} />

        {/* Enhanced Alert Messages - Responsive design */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 px-4 sm:px-6 py-4 sm:py-5 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 shadow-lg flex flex-col sm:flex-row items-start max-w-4xl mx-auto"
            >
              <div className="flex-shrink-0 bg-red-100 p-2 rounded-lg mr-0 sm:mr-4 mb-3 sm:mb-0">
                <X className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-sm sm:text-base">Error</h4>
                <p className="font-medium text-sm sm:text-base">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-green-50/80 backdrop-blur-sm border-l-4 border-green-500 text-green-700 px-4 sm:px-6 py-4 sm:py-5 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 shadow-lg flex flex-col sm:flex-row items-start max-w-4xl mx-auto"
            >
              <div className="flex-shrink-0 bg-green-100 p-2 rounded-lg mr-0 sm:mr-4 mb-3 sm:mb-0">
                <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-sm sm:text-base">Success</h4>
                <p className="font-medium text-sm sm:text-base">{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Profile Grid - Enhanced responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Left Column - Profile Overview & Actions */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ProfileSidebar 
              user={user}
              profilePicture={profilePicture}
              editMode={editMode}
              saving={saving}
              uploading={uploading}
              hasProfile={hasProfile}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
              onChangePassword={() => setShowChangePasswordModal(true)}
              onProfilePictureClick={handleProfilePictureClick}
              onFileChange={handleFileChange}
              setFileInputRef={setFileInputRef}
            />
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Personal Information Section */}
            <PersonalInformationSection 
              user={user}
              editMode={editMode}
              editData={editData}
              onInputChange={handleInputChange}
              activeMascot={activeMascot}
              getCurrentMascotImage={getCurrentMascotImage}
              getMascotMessage={getMascotMessage}
              mascotWiggle={mascotWiggle}
              setMascotWiggle={setMascotWiggle}
            />
          </div>
        </div>

        {/* Career Interest Profile Section - Full Width Below - Only for Students */}
        {user && user.role !== 'GUIDANCE_COUNSELOR' && user.role !== 'CAREER_COUNSELOR' && (
          <div className="order-3">
            <CareerInterestProfileSection 
              hasProfile={hasProfile}
              interestProfile={interestProfile}
              onSetupProfile={() => setShowInterestWizard(true)}
              onEditProfile={() => setShowInterestWizard(true)}
            />
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePasswordModal && (
          <ChangePasswordModal 
            onClose={() => setShowChangePasswordModal(false)}
            onSuccess={(message) => {
              setSuccess(message);
              setTimeout(() => setSuccess(null), 3000);
            }}
          />
        )}
      </AnimatePresence>

      {/* Career Interest Profile Wizard */}
      <AnimatePresence>
        {showInterestWizard && (
          <CareerInterestProfileWizard
            onComplete={() => {
              setShowInterestWizard(false);
              refreshInterestProfile();
              setSuccess('Career Interest Profile updated successfully!');
              setTimeout(() => setSuccess(null), 3000);
            }}
            onSkip={() => setShowInterestWizard(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;