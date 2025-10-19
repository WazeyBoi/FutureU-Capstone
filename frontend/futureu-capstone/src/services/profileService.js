import apiClient from './api';

class ProfileService {
  /**
   * Get user profile
   */
  async getUserProfile() {
    try {
      const response = await apiClient.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData) {
    try {
      const response = await apiClient.put('/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Upload profile picture to Cloudinary
   * @param {File} file - The image file to upload
   * @returns {Promise<string>} - The Cloudinary URL of the uploaded image
   */
  async uploadProfilePicture(file) {
    try {
      console.log('ProfileService: Uploading profile picture...');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to backend (which will upload to Cloudinary)
      const response = await apiClient.post('/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add timeout for large file uploads
        timeout: 60000, // 60 seconds
      });

      console.log('ProfileService: Upload response:', response.data);

      // Backend should return the Cloudinary URL
      const imageUrl = response.data.imageUrl || response.data;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      return imageUrl;
    } catch (error) {
      console.error('ProfileService: Upload error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 413) {
        throw new Error('File size too large. Please choose a smaller image (max 10MB).');
      } else if (error.response?.status === 415) {
        throw new Error('Invalid file type. Please upload an image file (JPG, PNG, etc.).');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please try again with a smaller file.');
      }
      
      throw error;
    }
  }

  /**
   * Delete profile picture from Cloudinary
   */
  async deleteProfilePicture() {
    try {
      console.log('ProfileService: Deleting profile picture...');
      
      const response = await apiClient.delete('/profile/delete-picture');
      
      console.log('ProfileService: Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ProfileService: Delete error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post('/profile/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

export default new ProfileService();