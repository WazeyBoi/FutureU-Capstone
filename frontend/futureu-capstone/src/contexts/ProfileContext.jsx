import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import profileService from '../services/profileService';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cache keys for localStorage
  const getCacheKeys = (userId) => ({
    profile: `futureu_profile_${userId}`,
    profilePicture: `futureu_profile_picture_${userId}`,
    timestamp: `futureu_profile_timestamp_${userId}`
  });

  // Cache expiration time (30 minutes)
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Load profile on authentication
  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && !isProfileLoaded) {
        // First try to load from cache
        await loadFromCache(currentUser.id);
        
        // If no cache or expired, fetch from API
        if (!userProfile) {
          await fetchUserProfile(currentUser.id);
        }
      }
    };

    if (authService.isAuthenticated()) {
      loadProfile();
    } else {
      // Clear profile data and cache on logout
      clearProfile();
    }
  }, []);

  // Load profile from localStorage cache
  const loadFromCache = async (userId) => {
    try {
      const cacheKeys = getCacheKeys(userId);
      const cachedProfile = localStorage.getItem(cacheKeys.profile);
      const cachedPicture = localStorage.getItem(cacheKeys.profilePicture);
      const cachedTimestamp = localStorage.getItem(cacheKeys.timestamp);

      if (cachedProfile && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const now = Date.now();
        
        // Check if cache is still valid (not expired)
        if (now - timestamp < CACHE_DURATION) {
          const profile = JSON.parse(cachedProfile);
          setUserProfile(profile);
          setProfilePicture(cachedPicture);
          setIsProfileLoaded(true);
          
          console.log('Profile loaded from cache');
          return true;
        } else {
          // Cache expired, clear it
          clearCache(userId);
          console.log('Profile cache expired, clearing...');
        }
      }
    } catch (error) {
      console.error('Failed to load profile from cache:', error);
      clearCache(userId);
    }
    return false;
  };

  // Save profile to localStorage cache
  const saveToCache = (userId, profile, pictureUrl = null) => {
    try {
      const cacheKeys = getCacheKeys(userId);
      
      localStorage.setItem(cacheKeys.profile, JSON.stringify(profile));
      localStorage.setItem(cacheKeys.timestamp, Date.now().toString());
      
      if (pictureUrl) {
        localStorage.setItem(cacheKeys.profilePicture, pictureUrl);
      }
      
      console.log('Profile saved to cache');
    } catch (error) {
      console.error('Failed to save profile to cache:', error);
    }
  };

  // Clear cache for specific user
  const clearCache = (userId) => {
    try {
      const cacheKeys = getCacheKeys(userId);
      localStorage.removeItem(cacheKeys.profile);
      localStorage.removeItem(cacheKeys.profilePicture);
      localStorage.removeItem(cacheKeys.timestamp);
    } catch (error) {
      console.error('Failed to clear profile cache:', error);
    }
  };

  const fetchUserProfile = async (userId, forceRefresh = false) => {
    if (loading && !forceRefresh) return; // Prevent multiple simultaneous requests
    
    try {
      setLoading(true);
      const profile = await profileService.getUserProfile(userId);
      
      setUserProfile(profile);
      setProfilePicture(profile?.profilePictureUrl);
      setIsProfileLoaded(true);
      
      // Save to cache
      saveToCache(userId, profile, profile?.profilePictureUrl);
      
      console.log('Profile fetched from API and cached');
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePicture = async (userId, file) => {
    try {
      setLoading(true);
      const result = await profileService.uploadProfilePicture(userId, file);
      
      const newPictureUrl = result.profilePictureUrl;
      setProfilePicture(newPictureUrl);
      
      // Update the cached profile with new picture URL
      const updatedProfile = { ...userProfile, profilePictureUrl: newPictureUrl };
      setUserProfile(updatedProfile);
      
      // Update cache
      saveToCache(userId, updatedProfile, newPictureUrl);
      
      return result;
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userId, profileData) => {
    try {
      setLoading(true);
      const updatedProfile = await profileService.updateUserProfile(userId, profileData);
      
      setUserProfile(updatedProfile);
      setProfilePicture(updatedProfile?.profilePictureUrl);
      
      // Update cache
      saveToCache(userId, updatedProfile, updatedProfile?.profilePictureUrl);
      
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async (force = false) => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      await fetchUserProfile(currentUser.id, force);
    }
  };

  const clearProfile = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      clearCache(currentUser.id);
    }
    
    setUserProfile(null);
    setProfilePicture(null);
    setIsProfileLoaded(false);
  };

  // Force refresh profile (bypass cache)
  const forceRefreshProfile = async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      clearCache(currentUser.id);
      await fetchUserProfile(currentUser.id, true);
    }
  };

  const value = {
    userProfile,
    profilePicture,
    isProfileLoaded,
    loading,
    fetchUserProfile,
    updateProfilePicture,
    updateProfile,
    refreshProfile,
    forceRefreshProfile,
    clearProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};