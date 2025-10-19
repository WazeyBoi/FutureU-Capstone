import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import profileService from '../services/profileService';
import careerInterestProfileService from '../services/careerInterestProfileService';

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
  const [profilePictureBlob, setProfilePictureBlob] = useState(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  // Load profile on authentication - ONLY RUN ONCE
  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        await fetchUserProfile(currentUser.id, false); // Don't force refresh initially
      } else {
        clearProfile();
      }
    };

    loadProfile();
  }, []); // Run only once

  // Listen for auth changes separately
  useEffect(() => {
    const handleAuthChange = async () => {
      const currentUser = authService.getCurrentUser();
      const isAuth = authService.isAuthenticated();
      
      if (isAuth && currentUser && (!userProfile || userProfile.userId !== currentUser.id)) {
        // User just logged in or switched users
        await fetchUserProfile(currentUser.id, true);
      } else if (!isAuth && userProfile) {
        // User just logged out
        clearProfile();
      }
    };

    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [userProfile]); // Only depend on userProfile to detect user changes

  // Cache keys for localStorage
  const getCacheKeys = (userId) => ({
    profile: `futureu_profile_${userId}`,
    profilePicture: `futureu_profile_picture_${userId}`,
    profilePictureBlob: `futureu_profile_picture_blob_${userId}`, // Add blob cache key
    timestamp: `futureu_profile_timestamp_${userId}`
  });

  // Cache expiration time (30 minutes) - matches dataCache TTL
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Load profile from localStorage cache
  const loadFromCache = async (userId) => {
    try {
      const cacheKeys = getCacheKeys(userId);
      const cachedProfile = localStorage.getItem(cacheKeys.profile);
      const cachedPicture = localStorage.getItem(cacheKeys.profilePicture);
      const cachedPictureBlob = localStorage.getItem(cacheKeys.profilePictureBlob);
      const cachedTimestamp = localStorage.getItem(cacheKeys.timestamp);

      if (cachedProfile && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const now = Date.now();
        
        // Check if cache is still valid (not expired)
        if (now - timestamp < CACHE_DURATION) {
          const profile = JSON.parse(cachedProfile);
          setUserProfile(profile);
          setProfilePicture(cachedPicture);
          
          // Load cached image blob if available
          if (cachedPictureBlob) {
            setProfilePictureBlob(cachedPictureBlob);
          } else if (cachedPicture) {
            // Fetch and cache the image blob
            await fetchAndCacheImageBlob(cachedPicture, userId);
          }
          
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

  // Fetch and cache image as blob
  const fetchAndCacheImageBlob = async (imageUrl, userId) => {
    try {
      if (!imageUrl) return;
      
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:8080${imageUrl}`;
      const response = await fetch(fullUrl);
      
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        setProfilePictureBlob(blobUrl);
        
        // Save blob URL to cache (note: this is temporary and will be lost on page refresh)
        // For persistent caching, we'd convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          const cacheKeys = getCacheKeys(userId);
          localStorage.setItem(cacheKeys.profilePictureBlob, base64data);
        };
        reader.readAsDataURL(blob);
        
        console.log('Profile picture cached as blob');
      }
    } catch (error) {
      console.error('Failed to cache profile picture blob:', error);
    }
  };

  // Save profile to localStorage cache
  const saveToCache = (userId, profile, pictureUrl = null) => {
    try {
      // Do not write to cache when not authenticated (e.g., during logout teardown)
      if (!authService.isAuthenticated()) return;

      const cacheKeys = getCacheKeys(userId);
      
      localStorage.setItem(cacheKeys.profile, JSON.stringify(profile));
      localStorage.setItem(cacheKeys.timestamp, Date.now().toString());
      
      if (pictureUrl) {
        localStorage.setItem(cacheKeys.profilePicture, pictureUrl);
        // Fetch and cache the image blob for instant loading
        fetchAndCacheImageBlob(pictureUrl, userId);
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
      localStorage.removeItem(cacheKeys.profilePictureBlob);
      localStorage.removeItem(cacheKeys.timestamp);
      
      // Revoke blob URL to prevent memory leaks
      if (profilePictureBlob && profilePictureBlob.startsWith('blob:')) {
        URL.revokeObjectURL(profilePictureBlob);
      }
      
      setProfilePictureBlob(null);
    } catch (error) {
      console.error('Failed to clear profile cache:', error);
    }
  };

  const fetchUserProfile = async (userId, forceRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (fetchingProfile && !forceRefresh) {
      console.log('Profile fetch already in progress, skipping...');
      return;
    }
    
    // If we already have profile data for this user and it's not a forced refresh, don't fetch again
    if (userProfile && userProfile.userId === userId && isProfileLoaded && !forceRefresh) {
      console.log('Profile already loaded for this user, skipping fetch...');
      return;
    }

    try {
      setFetchingProfile(true);
      setLoading(true);

      // Try to load from cache first (unless forced refresh)
      if (!forceRefresh) {
        const cacheLoaded = await loadFromCache(userId);
        if (cacheLoaded) {
          return;
        }
      }

      console.log('Fetching fresh profile data...');
      const profile = await profileService.getUserProfile(userId);
      
      setUserProfile(profile);
      setProfilePicture(profile?.profilePictureUrl);
      setIsProfileLoaded(true);
      
      saveToCache(userId, profile, profile?.profilePictureUrl);
      
      console.log('Profile fetched from API and cached');
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
      setFetchingProfile(false);
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
      
      // Clear old blob URL and cache new one
      if (profilePictureBlob && profilePictureBlob.startsWith('blob:')) {
        URL.revokeObjectURL(profilePictureBlob);
      }
      
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
      
      // Only refresh career profile cache if force is true
      if (force) {
        try {
          await careerInterestProfileService.refreshUserProfileCaches(currentUser.id);
        } catch (error) {
          console.log('Career interest profile cache refresh failed (user may not have profile)');
        }
      }
    }
  };

  const clearProfile = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      clearCache(currentUser.id);
      // Clear career interest profile caches too
      careerInterestProfileService.clearAllCaches();
    }
    
    setUserProfile(null);
    setProfilePicture(null);
    setProfilePictureBlob(null);
    setIsProfileLoaded(false);
  };

  // Force refresh profile (bypass cache)
  const forceRefreshProfile = async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      clearCache(currentUser.id);
      // Clear career interest profile caches
      careerInterestProfileService.clearAllCaches();
      await fetchUserProfile(currentUser.id, true);
    }
  };

  // Get the best available profile picture URL (prioritize blob for instant loading)
  const getProfilePictureUrl = () => {
    // If we have a blob URL (for instant loading), use it
    if (profilePictureBlob) return profilePictureBlob;
    
    // Otherwise, use the profile picture URL directly (Cloudinary URLs are already full)
    // No need to prepend localhost anymore since Cloudinary provides full URLs
    if (profilePicture) {
      // Check if it's already a full URL (Cloudinary)
      if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
        return profilePicture;
      }
      // Fallback for old local URLs (during migration)
      return `http://localhost:8080${profilePicture}`;
    }
    
    return null;
  };

  const value = {
    userProfile,
    profilePicture,
    profilePictureBlob,
    isProfileLoaded,
    loading,
    fetchUserProfile,
    updateProfilePicture,
    updateProfile,
    refreshProfile,
    forceRefreshProfile,
    clearProfile,
    getProfilePictureUrl // Add this helper method
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};