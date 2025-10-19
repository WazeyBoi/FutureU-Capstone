import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import careerInterestProfileService from '../services/careerInterestProfileService';

export const useCareerInterestProfile = () => {
  const [hasProfile, setHasProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Remove isChecking from dependencies to prevent infinite loops
  const checkUserProfile = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (isChecking) {
      // console.log('Profile check already in progress, skipping...');
      return;
    }

    try {
      setIsChecking(true);
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || !authService.isAuthenticated()) {
        setHasProfile(false);
        setProfile(null);
        return;
      }

      try {
        // Use cached service method with force refresh to ensure accuracy
        const profiles = await careerInterestProfileService.getActiveProfilesByUser(currentUser.id, false);
        
        if (profiles && profiles.length > 0) {
          setHasProfile(true);
          setProfile(profiles[0]);
        } else {
          setHasProfile(false);
          setProfile(null);
        }
      } catch (apiError) {
        console.error('API Error fetching career interest profiles:', apiError);
        setHasProfile(false);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      setHasProfile(false);
      setProfile(null);
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  }, []); // Empty dependency array to prevent recreation

  // Only run once when component mounts or when auth state changes
  useEffect(() => {
    if (authService.isAuthenticated()) {
      checkUserProfile();
    } else {
      setHasProfile(false);
      setProfile(null);
      setLoading(false);
    }
  }, []); // Only run once on mount

  // Separate effect to listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      if (authService.isAuthenticated() && !isChecking) {
        checkUserProfile();
      } else if (!authService.isAuthenticated()) {
        setHasProfile(false);
        setProfile(null);
        setLoading(false);
      }
    };

    // Listen for storage events (auth changes)
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [checkUserProfile, isChecking]);

  const refreshProfile = useCallback(async (forceRefresh = true) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || isChecking) return;
    
    try {
      setIsChecking(true);
      setLoading(true);
      
      // Clear cache and fetch fresh data
      await careerInterestProfileService.refreshUserProfileCaches(currentUser.id);
      
      // Re-check profile status with fresh data
      const profiles = await careerInterestProfileService.getActiveProfilesByUser(currentUser.id, true);
      
      if (profiles && profiles.length > 0) {
        setHasProfile(true);
        setProfile(profiles[0]);
      } else {
        setHasProfile(false);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setHasProfile(false);
      setProfile(null);
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  }, []); // Empty dependency array

  return {
    hasProfile,
    loading,
    profile,
    refreshProfile,
    checkUserProfile
  };
};