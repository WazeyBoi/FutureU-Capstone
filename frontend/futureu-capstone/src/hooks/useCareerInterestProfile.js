import { useState, useEffect } from 'react';
import authService from '../services/authService';
import careerInterestProfileService from '../services/careerInterestProfileService';

export const useCareerInterestProfile = () => {
  const [hasProfile, setHasProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setHasProfile(false);
        setLoading(false);
        return;
      }

      // Check if user has any active profiles
      const profiles = await careerInterestProfileService.getActiveProfilesByUser(currentUser.id);
      
      if (profiles && profiles.length > 0) {
        setHasProfile(true);
        setProfile(profiles[0]); // Get the most recent one
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    setLoading(true);
    checkUserProfile();
  };

  return {
    hasProfile,
    loading,
    profile,
    refreshProfile
  };
};