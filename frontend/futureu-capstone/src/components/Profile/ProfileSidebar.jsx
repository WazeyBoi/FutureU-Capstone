import React from 'react';
import { motion } from 'framer-motion';
import { User, Edit, Save, X, Camera, Upload, Lock, GraduationCap, CheckCircle } from 'lucide-react';

const ProfileSidebar = ({ 
  user, 
  profilePicture,
  editMode,
  saving,
  uploading,
  hasProfile,
  onEdit,
  onSave,
  onCancel,
  onChangePassword,
  onProfilePictureClick,
  onFileChange,
  setFileInputRef
}) => {
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    let completionPercentage = 0;
    const completionSteps = [];
    
    // Step 1: Personal Information (50%)
    const hasPersonalInfo = user?.firstName && user?.lastname && user?.email;
    if (hasPersonalInfo) {
      completionPercentage += 50;
      completionSteps.push('personal');
    }
    
    // Step 2: Profile Picture (10% additional = 60% total)
    const hasProfilePicture = profilePicture || user?.profilePictureUrl;
    if (hasProfilePicture && hasPersonalInfo) {
      completionPercentage += 10;
      completionSteps.push('picture');
    }
    
    // Step 3: Career Interest Profile (30% additional = 90% total)
    if (hasProfile && hasPersonalInfo) {
      completionPercentage += 30;
      completionSteps.push('career');
    }
    
    // Step 4: Complete profile with additional details (10% additional = 100% total)
    const hasAdditionalDetails = user?.age && user?.contactNumber && user?.address;
    if (hasPersonalInfo && hasProfilePicture && hasProfile && hasAdditionalDetails) {
      completionPercentage += 10;
      completionSteps.push('complete');
    }
    
    return {
      percentage: Math.min(completionPercentage, 100),
      steps: completionSteps
    };
  };
  
  const completion = calculateProfileCompletion();
  
  // Get next step recommendation
  const getNextStepMessage = () => {
    if (!completion.steps.includes('personal')) {
      return "Complete your basic information";
    }
    if (!completion.steps.includes('picture')) {
      return "Add a profile picture";
    }
    if (!completion.steps.includes('career')) {
      return "Complete career interest profile";
    }
    if (!completion.steps.includes('complete')) {
      return "Add contact details for 100%";
    }
    return "Profile fully optimized!";
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 relative overflow-hidden h-fit"
    >

      {/* Profile Picture Section */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          <div
            onClick={onProfilePictureClick}
            className="w-24 h-24 rounded-full border-2 border-gray-800 cursor-pointer group hover:shadow-lg transition-all duration-300"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 relative">
              {(() => {
                const resolveSrc = (url) => {
                  if (!url) return null;
                  // Check if it's already a full URL (Cloudinary URLs start with https://)
                  if (/^https?:\/\//i.test(url) || /^blob:|^data:/i.test(url)) return url;
                  // Fallback for old local URLs (during migration)
                  return `http://localhost:8080${url}`;
                };
                const raw = profilePicture || user?.profilePictureUrl;
                const src = resolveSrc(raw);
                return src ? (
                  <img
                    src={src}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                );
              })()}
              
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Edit icon indicator */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            {uploading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
            ) : (
              <User className="w-3 h-3 text-white" />
            )}
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            ref={setFileInputRef}
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.firstName} {user?.lastname}
          </h2>
          <p className="text-gray-600 text-sm">{user?.email}</p>
          
          <div className="inline-flex items-center bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-semibold">
            <User className="w-3 h-3 mr-1" />
            <span>{user?.role || 'STUDENT'}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        {!editMode ? (
          <>
            <button
              onClick={onEdit}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center group cursor-pointer"
            >
              <Lock className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
            <button
              onClick={onChangePassword}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 py-3 px-4 rounded-lg font-medium transition-all duration-300 border border-gray-300 flex items-center justify-center group cursor-pointer"
            >
              <Lock className="w-4 h-4 mr-2 cursor-pointer" />
              Change Password
            </button>
          </>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-800 py-3 px-4 rounded-lg font-medium transition-all duration-300 border border-gray-300 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Profile Completion Stats */}
      <div className="pt-4 border-t border-gray-200/50 relative z-10">
        <div className="text-sm">
          {/* Header with percentage and status */}
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-gray-700 text-xs">Profile Completeness</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#1D63A1]">
                {completion.percentage}%
              </span>
              {completion.percentage === 100 && (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
          
          {/* Dynamic Progress Bar */}
          <div className="w-full bg-gray-200/50 rounded-full h-3 mb-3 overflow-hidden shadow-inner">
            <motion.div 
              className={`h-3 rounded-full shadow-sm transition-all duration-1000 ${
                completion.percentage === 100 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : completion.percentage >= 90 
                  ? 'bg-gradient-to-r from-[#1D63A1] to-[#FFB71B]'
                  : completion.percentage >= 60 
                  ? 'bg-gradient-to-r from-[#1D63A1] to-blue-500'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${completion.percentage}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          
          {/* Next Step Recommendation */}
          {completion.percentage < 100 && (
            <div className="bg-gradient-to-r from-[#FFB71B]/10 to-[#FF9800]/5 rounded-lg p-3 mb-3 border border-[#FFB71B]/20">
              <p className="text-xs text-[#232D35] font-medium flex items-center">
                <span className="w-2 h-2 bg-[#FFB71B] rounded-full mr-2 animate-pulse"></span>
                {getNextStepMessage()}
              </p>
            </div>
          )}
          
          {/* Completion Steps Breakdown */}
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span>Basic Information</span>
              {completion.steps.includes('personal') ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Profile Picture</span>
              {completion.steps.includes('picture') ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Career Profile</span>
              {completion.steps.includes('career') ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
              )}
            </div>
            
          </div>
          
          {/* Success Message */}
          {completion.percentage === 100 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mt-3 border border-green-200">
              <p className="text-xs text-green-700 font-semibold flex items-center">
                <CheckCircle className="w-3 h-3 mr-2" />
                Profile fully optimized!
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSidebar;