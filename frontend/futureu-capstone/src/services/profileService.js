import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create a custom axios instance for profile service
const profileClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const profileService = {
  async getUserProfile(userId) {
    try {
      const response = await profileClient.get(`/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error.response?.data?.error || 'Failed to fetch profile';
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      const response = await profileClient.put(`/profile/${userId}`, profileData);
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

      const response = await profileClient.post(`/profile/${userId}/upload-picture`, formData, {
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
      const response = await profileClient.delete(`/profile/${userId}/profile-picture`);
      return response.data;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error.response?.data?.error || 'Failed to delete profile picture';
    }
  },

  async changePassword(userId, passwordData) {
    try {
      const response = await profileClient.put(`/profile/${userId}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error.response?.data?.error || 'Failed to change password';
    }
  }
};

export default profileService;