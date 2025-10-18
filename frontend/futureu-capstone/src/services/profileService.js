import apiClient from './api';
 
const profileService = {
  async getUserProfile(userId) {
    try {
      const response = await apiClient.get(`/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error.response?.data?.error || 'Failed to fetch profile';
    }
  },
 
  async updateUserProfile(userId, profileData) {
    try {
      const response = await apiClient.put(`/profile/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error.response?.data?.error || 'Failed to update profile';
    }
  },
 
  async uploadProfilePicture(userId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
 
      const response = await apiClient.post(`/profile/${userId}/upload-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error.response?.data?.error || 'Failed to upload profile picture';
    }
  },
 
  async deleteProfilePicture(userId) {
    try {
      const response = await apiClient.delete(`/profile/${userId}/profile-picture`);
      return response.data;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error.response?.data?.error || 'Failed to delete profile picture';
    }
  },
 
  async changePassword(userId, passwordData) {
    try {
      const response = await apiClient.put(`/profile/${userId}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error.response?.data?.error || 'Failed to change password';
    }
  }
};
 
export default profileService;