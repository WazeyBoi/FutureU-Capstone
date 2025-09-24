import React, { useState, useRef } from 'react';
import { Camera, User, Upload } from 'lucide-react';
import profileService from '../../services/profileService';

const ProfilePictureUpload = ({ userId, currentImageUrl, onImageUpdate, editMode = true }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    if (editMode) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await profileService.uploadProfilePicture(userId, file);
      onImageUpdate(result.profilePictureUrl);
    } catch (error) {
      setError(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <div
        className={`w-24 h-24 rounded-full bg-white/20 border-4 border-white overflow-hidden ${
          editMode ? 'cursor-pointer hover:bg-white/30' : 'cursor-default'
        } transition-colors group`}
        onClick={handleFileSelect}
      >
        {currentImageUrl ? (
          <img
            src={`http://localhost:8080${currentImageUrl}`}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
        )}

        {/* Upload overlay */}
        {editMode && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </div>
        )}
      </div>

      {/* Upload button for mobile/accessibility */}
      {editMode && (
        <button
          onClick={handleFileSelect}
          disabled={uploading}
          className="absolute -bottom-2 -right-2 bg-[#1D63A1] hover:bg-[#1D63A1]/90 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="absolute top-full left-0 mt-2 text-xs text-red-300 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
};

export default ProfilePictureUpload;