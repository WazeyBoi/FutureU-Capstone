import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api';

const profileService = {
  async getUserProfile(userId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error.response?.data?.error || 'Failed to fetch profile';
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.put(`${API_BASE_URL}/profile/${userId}`, profileData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error.response?.data?.error || 'Failed to update profile';
    }
  },

  async uploadProfilePicture(userId, file) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/profile/${userId}/upload-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
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
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.delete(`${API_BASE_URL}/profile/${userId}/profile-picture`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error.response?.data?.error || 'Failed to delete profile picture';
    }
  },

  async changePassword(userId, passwordData) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.put(`${API_BASE_URL}/profile/${userId}/change-password`, passwordData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error.response?.data?.error || 'Failed to change password';
    }
  }
};

export default profileService;