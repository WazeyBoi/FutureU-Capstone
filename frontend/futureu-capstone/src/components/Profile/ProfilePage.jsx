import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit, Save, X, Camera, Mail, Phone, MapPin, Calendar, Upload, Lock, Eye, EyeOff, Key } from 'lucide-react';
import profileService from '../../services/profileService';
import authService from '../../services/authService';

const ProfilePage = () => {
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
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setError('Please log in to view your profile');
        return;
      }

      const profileData = await profileService.getUserProfile(currentUser.id);
      setUser(profileData);
      setEditData(profileData);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData(user);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const currentUser = authService.getCurrentUser();
      
      // Send all the edited data, not just firstName
      console.log('Sending profile data:', editData);
      const updatedUser = await profileService.updateUserProfile(currentUser.id, editData);
      
      setUser(updatedUser);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response?.data);
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
      const result = await profileService.uploadProfilePicture(currentUser.id, file);
      
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
      setError(error);
    } finally {
      setUploading(false);
    }
  };

  // Change Password Functions
  const handleChangePasswordClick = () => {
    setShowChangePasswordModal(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClosePasswordModal = () => {
    setShowChangePasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError(null);
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordError(null);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    
    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleChangePassword = async () => {
    setPasswordError(null);

    // Validate inputs
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }

    if (!passwordData.confirmPassword) {
      setPasswordError('Please confirm your new password');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePassword(passwordData.newPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);

    try {
      const currentUser = authService.getCurrentUser();
      await profileService.changePassword(currentUser.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setShowChangePasswordModal(false);
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setPasswordError(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1D63A1]/5 to-[#FFB71B]/5 pt-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl p-8 shadow-xl"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1D63A1] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#232D35] font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D63A1]/5 to-[#FFB71B]/5 pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[#232D35] mb-3">My Profile</h1>
          <p className="text-gray-600 text-lg">Manage your personal information and preferences</p>
        </motion.div>

        {/* Alert Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm flex items-start"
          >
            <div className="flex-shrink-0">
              <X className="w-5 h-5 mt-0.5" />
            </div>
            <div className="ml-3">
              <p className="font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl mb-6 shadow-sm flex items-start"
          >
            <div className="flex-shrink-0">
              <Save className="w-5 h-5 mt-0.5" />
            </div>
            <div className="ml-3">
              <p className="font-medium">{success}</p>
            </div>
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#2B3E4E] to-[#1D63A1] p-8 text-white relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFB71B] rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div
                  onClick={handleProfilePictureClick}
                  className="w-32 h-32 rounded-full bg-white/20 border-4 border-white overflow-hidden cursor-pointer hover:bg-white/30 transition-all duration-300 group shadow-xl relative"
                >
                  {user?.profilePictureUrl ? (
                    <img
                      src={`http://localhost:8080${user.profilePictureUrl}`}
                      alt="Profile"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFB71B] to-[#FFB71B]/80">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-6 h-6 text-white mx-auto mb-1" />
                        <span className="text-xs text-white font-medium">Change</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Camera icon indicator */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FFB71B] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Upload className="w-5 h-5 text-[#232D35]" />
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={setFileInputRef}
                  className="hidden"
                />
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl font-bold mb-3 text-shadow">
                  {user?.firstName} {user?.lastname}
                </h2>
                <div className="flex items-center justify-center lg:justify-start text-blue-100 mb-3">
                  <Mail className="w-5 h-5 mr-2" />
                  <span className="text-lg">{user?.email}</span>
                </div>
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">Role: {user?.role || 'Student'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-6 right-6">
                {!editMode ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleEdit}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-black p-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                      title="Edit Profile"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleChangePasswordClick}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-black p-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                      title="Change Password"
                    >
                      <Key className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-500 hover:bg-green-600 text-black p-3 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:scale-105"
                      title="Save Changes"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-red-500 hover:bg-red-600 text-black p-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-[#1D63A1]/10 rounded-xl flex items-center justify-center mr-4">
                    <User className="w-5 h-5 text-[#1D63A1]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#232D35]">Personal Information</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1] transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Enter your first name"
                      />
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <p className="text-gray-900 font-medium">{user?.firstName || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editData.lastname || ''}
                        onChange={(e) => handleInputChange('lastname', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1] transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Enter your last name"
                      />
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <p className="text-gray-900 font-medium">{user?.lastname || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Middle Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editData.middleName || ''}
                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1] transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Enter your middle name"
                      />
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <p className="text-gray-900 font-medium">{user?.middleName || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    {editMode ? (
                      <input
                        type="number"
                        value={editData.age || ''}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1] transition-colors bg-gray-50 focus:bg-white"
                        min="1"
                        max="120"
                        placeholder="Enter your age"
                      />
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                          <p className="text-gray-900 font-medium">
                            {user?.age ? `${user.age} years old` : 'Not provided'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-[#FFB71B]/10 rounded-xl flex items-center justify-center mr-4">
                    <Phone className="w-5 h-5 text-[#FFB71B]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#232D35]">Contact Information</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    {editMode ? (
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1] transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Enter your email address"
                      />
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 mr-3 text-gray-500" />
                          <p className="text-gray-900 font-medium">{user?.email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={editData.contactNumber || ''}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1] transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Enter your contact number"
                      />
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 mr-3 text-gray-500" />
                          <p className="text-gray-900 font-medium">{user?.contactNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    {editMode ? (
                      <textarea
                        value={editData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows="4"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1] transition-colors bg-gray-50 focus:bg-white resize-none"
                        placeholder="Enter your full address"
                      />
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 min-h-[120px]">
                        <div className="flex items-start">
                          <MapPin className="w-5 h-5 mr-3 text-gray-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-900 font-medium leading-relaxed">
                            {user?.address || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Last updated: {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#2B3E4E] to-[#1D63A1] p-6 text-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                      <Key className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Change Password</h3>
                  </div>
                  <button
                    onClick={handleClosePasswordModal}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {passwordError && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
                    <p className="text-sm font-medium">{passwordError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        className="w-full pl-12 pr-12 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1] transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        className="w-full pl-12 pr-12 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1] transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        className="w-full pl-12 pr-12 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1] transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-medium mb-1">Password Requirements:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Contains uppercase and lowercase letters</li>
                      <li>• Contains at least one number</li>
                      <li>• Contains at least one special character</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={handleClosePasswordModal}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#2B3E4E] to-[#1D63A1] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Changing...
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;