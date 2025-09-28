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
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 relative overflow-hidden h-fit"
    >
      {/* Card Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1D63A1]/5 via-transparent to-[#FFB71B]/5"></div>
      <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-[#FFB71B]/10 to-transparent rounded-full blur-xl"></div>

      {/* Profile Picture Section */}
      <div className="text-center mb-6 relative z-10">
        <div className="relative inline-block mb-4">
          <div
            onClick={onProfilePictureClick}
            className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1D63A1] via-[#2B3E4E] to-[#FFB71B] p-1.5 cursor-pointer group hover:shadow-2xl transition-all duration-500 hover:scale-105"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
              {profilePicture || user?.profilePictureUrl ? (
                <img
                  src={`http://localhost:8080${profilePicture || user?.profilePictureUrl}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFB71B] to-[#FF9800]">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
              
              {/* Enhanced Upload overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-full flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-4 h-4 text-white mx-auto mb-1" />
                    <span className="text-xs text-white font-bold">Change</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Camera icon indicator */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Upload className="w-4 h-4 text-white" />
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

        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-bold text-[#232D35] mb-1">
              {user?.firstName} {user?.lastname}
            </h2>
            <p className="text-gray-600 text-sm mb-3">{user?.email}</p>
          </div>
          
          <div className="inline-flex items-center bg-gradient-to-r from-[#1D63A1] to-[#2B3E4E] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
            <GraduationCap className="w-3 h-3 mr-1" />
            <span>{user?.role || 'Student'}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="space-y-3 relative z-10 mb-6">
        {!editMode ? (
          <>
            <button
              onClick={onEdit}
              className="w-full bg-gradient-to-r from-[#1D63A1] to-[#2B3E4E] hover:from-[#1D63A1]/90 hover:to-[#2B3E4E]/90 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center group text-sm"
            >
              <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Edit Profile
            </button>
            <button
              onClick={onChangePassword}
              className="w-full bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-700 py-3 px-4 rounded-xl font-bold transition-all duration-300 border border-gray-200/50 hover:border-gray-300 flex items-center justify-center group hover:shadow-lg text-sm"
            >
              <Lock className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Change Password
            </button>
          </>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
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
              className="flex-1 bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-700 py-3 px-4 rounded-xl font-bold transition-all duration-300 border border-gray-200/50 hover:border-gray-300 flex items-center justify-center hover:shadow-lg text-sm"
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