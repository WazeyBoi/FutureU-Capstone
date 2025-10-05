import apiClient from './api';
import dataCacheService from './dataCache';

/**
 * Service for handling career interest profile API requests with caching
 */
class CareerInterestProfileService {
  
  /**
   * Test if the career interest profile API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/career-interest-profile/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Create a new career interest profile for a user
   * @param {number} userId - The user ID
   * @param {Object} profileData - The profile data
   * @returns {Promise<Object>} - Created profile data
   */
  async createProfile(userId, profileData) {
    try {
      const response = await apiClient.post(`/career-interest-profile/create/${userId}`, profileData);
      
      // Clear related caches when new profile is created
      dataCacheService.clear(`careerProfile_user_${userId}`);
      dataCacheService.clear(`careerProfile_active_${userId}`);
      dataCacheService.clear(`careerProfile_latest_${userId}`);
      dataCacheService.clear('careerProfiles_all');
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating profile');
      throw error;
    }
  }

  /**
   * Get all profiles with caching
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} - List of all profiles
   */
  async getAllProfiles(forceRefresh = false) {
    const cacheKey = 'careerProfiles_all';
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dataCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Check if already loading
    if (dataCacheService.isLoading(cacheKey)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!dataCacheService.isLoading(cacheKey)) {
            clearInterval(checkInterval);
            resolve(dataCacheService.get(cacheKey) || []);
          }
        }, 100);
      });
    }

    try {
      dataCacheService.setLoading(cacheKey, true);
      
      const response = await apiClient.get('/career-interest-profile/getAll');
      const profiles = response.data || [];
      
      // Cache the result
      dataCacheService.set(cacheKey, profiles);
      
      return profiles;
    } catch (error) {
      this.handleError(error, 'Fetching all profiles');
      throw error;
    } finally {
      dataCacheService.setLoading(cacheKey, false);
    }
  }

  /**
   * Get profile by ID with caching
   * @param {number} profileId - The profile ID
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object>} - The profile data
   */
  async getProfileById(profileId, forceRefresh = false) {
    const cacheKey = `careerProfile_${profileId}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dataCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Check if already loading
    if (dataCacheService.isLoading(cacheKey)) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!dataCacheService.isLoading(cacheKey)) {
            clearInterval(checkInterval);
            const cached = dataCacheService.get(cacheKey);
            if (cached) {
              resolve(cached);
            } else {
              reject(new Error('Profile not found'));
            }
          }
        }, 100);
      });
    }

    try {
      dataCacheService.setLoading(cacheKey, true);
      
      const response = await apiClient.get(`/career-interest-profile/get/${profileId}`);
      const profile = response.data;
      
      // Cache the result
      dataCacheService.set(cacheKey, profile);
      
      return profile;
    } catch (error) {
      this.handleError(error, 'Fetching profile by ID');
      throw error;
    } finally {
      dataCacheService.setLoading(cacheKey, false);
    }
  }

  /**
   * Get profiles by user ID with caching
   * @param {number} userId - The user ID
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} - User's profiles
   */
  async getProfilesByUser(userId, forceRefresh = false) {
    const cacheKey = `careerProfile_user_${userId}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dataCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Check if already loading
    if (dataCacheService.isLoading(cacheKey)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!dataCacheService.isLoading(cacheKey)) {
            clearInterval(checkInterval);
            resolve(dataCacheService.get(cacheKey) || []);
          }
        }, 100);
      });
    }

    try {
      dataCacheService.setLoading(cacheKey, true);
      
      const response = await apiClient.get(`/career-interest-profile/user/${userId}`);
      const profiles = response.data || [];
      
      // Cache the result
      dataCacheService.set(cacheKey, profiles);
      
      return profiles;
    } catch (error) {
      this.handleError(error, 'Fetching profiles by user');
      throw error;
    } finally {
      dataCacheService.setLoading(cacheKey, false);
    }
  }

  /**
   * Get active profiles by user ID with caching
   * @param {number} userId - The user ID
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} - User's active profiles
   */
  async getActiveProfilesByUser(userId, forceRefresh = false) {
    const cacheKey = `careerProfile_active_${userId}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dataCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Check if already loading
    if (dataCacheService.isLoading(cacheKey)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!dataCacheService.isLoading(cacheKey)) {
            clearInterval(checkInterval);
            resolve(dataCacheService.get(cacheKey) || []);
          }
        }, 100);
      });
    }

    try {
      dataCacheService.setLoading(cacheKey, true);
      
      const response = await apiClient.get(`/career-interest-profile/user/${userId}/active`);
      const profiles = response.data || [];
      
      // Cache the result
      dataCacheService.set(cacheKey, profiles);
      
      return profiles;
    } catch (error) {
      this.handleError(error, 'Fetching active profiles by user');
      throw error;
    } finally {
      dataCacheService.setLoading(cacheKey, false);
    }
  }

  /**
   * Get most recent active profile by user ID with caching
   * @param {number} userId - The user ID
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object|null>} - User's most recent active profile or null if none exists
   */
  async getMostRecentProfile(userId, forceRefresh = false) {
    const cacheKey = `careerProfile_latest_${userId}`;
    if (!forceRefresh) {
      const cached = dataCacheService.get(cacheKey);
      if (cached !== undefined) return cached;
    }

    try {
      // Prefer the active list (returns 200 with [] when none exist)
      const active = await this.getActiveProfilesByUser(userId, forceRefresh);
      const latest = Array.isArray(active) && active.length ? active[0] : null;
      dataCacheService.set(cacheKey, latest);
      return latest;
    } catch (error) {
      // Gracefully handle "no profile" semantics
      if (error?.response?.status === 404) {
        dataCacheService.set(cacheKey, null);
        return null;
      }
      this.handleError(error, 'Fetching most recent profile');
      dataCacheService.set(cacheKey, null);
      return null;
    }
  }

  /**
   * Update an existing profile
   * @param {Object} profileData - The updated profile data
   * @returns {Promise<Object>} - Updated profile data
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/career-interest-profile/update', profileData);
      
      // Clear related caches when profile is updated
      if (profileData.profileId) {
        dataCacheService.clear(`careerProfile_${profileData.profileId}`);
      }
      if (profileData.user?.userId) {
        const userId = profileData.user.userId;
        dataCacheService.clear(`careerProfile_user_${userId}`);
        dataCacheService.clear(`careerProfile_active_${userId}`);
        dataCacheService.clear(`careerProfile_latest_${userId}`);
      }
      dataCacheService.clear('careerProfiles_all');
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating profile');
      throw error;
    }
  }

  /**
   * Deactivate a profile (soft delete)
   * @param {number} profileId - The profile ID
   * @returns {Promise<Object>} - Response message
   */
  async deactivateProfile(profileId) {
    try {
      const response = await apiClient.put(`/career-interest-profile/deactivate/${profileId}`);
      
      // Clear related caches when profile is deactivated
      dataCacheService.clear(`careerProfile_${profileId}`);
      dataCacheService.clearByPattern('careerProfile_user_');
      dataCacheService.clearByPattern('careerProfile_active_');
      dataCacheService.clearByPattern('careerProfile_latest_');
      dataCacheService.clear('careerProfiles_all');
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Deactivating profile');
      throw error;
    }
  }

  /**
   * Delete a profile permanently (hard delete)
   * @param {number} profileId - The profile ID
   * @returns {Promise<Object>} - Response message
   */
  async deleteProfile(profileId) {
    try {
      const response = await apiClient.delete(`/career-interest-profile/delete/${profileId}`);
      
      // Clear related caches when profile is deleted
      dataCacheService.clear(`careerProfile_${profileId}`);
      dataCacheService.clearByPattern('careerProfile_user_');
      dataCacheService.clearByPattern('careerProfile_active_');
      dataCacheService.clearByPattern('careerProfile_latest_');
      dataCacheService.clear('careerProfiles_all');
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Deleting profile');
      throw error;
    }
  }

  /**
   * Search profiles by dream career with caching
   * @param {string} keyword - The search keyword
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} - Matching profiles
   */
  async searchByDreamCareer(keyword, forceRefresh = false) {
    const cacheKey = `careerProfile_search_dream_${keyword.toLowerCase()}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dataCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await apiClient.get('/career-interest-profile/search/dream-career', {
        params: { keyword }
      });
      const profiles = response.data || [];
      
      // Cache the result with shorter TTL for search results
      dataCacheService.set(cacheKey, profiles);
      
      return profiles;
    } catch (error) {
      this.handleError(error, 'Searching by dream career');
      throw error;
    }
  }

  /**
   * Search profiles by interests with caching
   * @param {string} keyword - The search keyword
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} - Matching profiles
   */
  async searchByInterests(keyword, forceRefresh = false) {
    const cacheKey = `careerProfile_search_interests_${keyword.toLowerCase()}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dataCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await apiClient.get('/career-interest-profile/search/interests', {
        params: { keyword }
      });
      const profiles = response.data || [];
      
      // Cache the result
      dataCacheService.set(cacheKey, profiles);
      
      return profiles;
    } catch (error) {
      this.handleError(error, 'Searching by interests');
      throw error;
    }
  }

  /**
   * Get profile statistics with caching
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object>} - Profile statistics
   */
  async getProfileStatistics(forceRefresh = false) {
    const cacheKey = 'careerProfile_statistics';
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dataCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Get all profiles and calculate statistics
      const allProfiles = await this.getAllProfiles(forceRefresh);
      
      const statistics = {
        totalProfiles: allProfiles.length,
        activeProfiles: allProfiles.filter(p => p.isActive).length,
        totalUsers: new Set(allProfiles.map(p => p.user?.userId).filter(Boolean)).size,
        popularCareers: this.getPopularCareers(allProfiles),
        completionRate: this.calculateCompletionRate(allProfiles)
      };
      
      // Cache the statistics
      dataCacheService.set(cacheKey, statistics);
      
      return statistics;
    } catch (error) {
      this.handleError(error, 'Getting profile statistics');
      throw error;
    }
  }

  /**
   * Helper method to get popular careers from profiles
   * @param {Array} profiles - Array of profiles
   * @returns {Array} - Popular careers with counts
   */
  getPopularCareers(profiles) {
    const careerCounts = {};
    
    profiles.forEach(profile => {
      if (profile.dreamCareer && profile.isActive) {
        const career = profile.dreamCareer.toLowerCase().trim();
        careerCounts[career] = (careerCounts[career] || 0) + 1;
      }
    });
    
    return Object.entries(careerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([career, count]) => ({ career, count }));
  }

  /**
   * Helper method to calculate profile completion rate
   * @param {Array} profiles - Array of profiles
   * @returns {number} - Completion rate percentage
   */
  calculateCompletionRate(profiles) {
    if (profiles.length === 0) return 0;
    
    const completeProfiles = profiles.filter(profile => {
      return profile.mainInterestsHobbies &&
             profile.dreamCareer &&
             profile.personalStrengthsSkills &&
             profile.careerValues &&
             profile.preferredWorkEnvironment &&
             profile.educationTrainingAspirations;
    });
    
    return Math.round((completeProfiles.length / profiles.length) * 100);
  }

  /**
   * Force refresh all career profile caches for a specific user
   * @param {number} userId - The user ID
   * @returns {Promise<void>}
   */
  async refreshUserProfileCaches(userId) {
    try {
      // Clear all user-specific caches
      dataCacheService.clear(`careerProfile_user_${userId}`);
      dataCacheService.clear(`careerProfile_active_${userId}`);
      dataCacheService.clear(`careerProfile_latest_${userId}`);
      
      await Promise.allSettled([
        this.getProfilesByUser(userId, true),
        this.getActiveProfilesByUser(userId, true),
        this.getMostRecentProfile(userId, true)
      ]);
      
      // Downgrade noisy log:
      // console.log(`Career interest profile caches refreshed for user ${userId}`);
    } catch (error) {
      console.warn('Error refreshing user profile caches:', error);
    }
  }

  /**
   * Clear all career profile related caches
   * @returns {void}
   */
  clearAllCaches() {
    dataCacheService.clearByPattern('careerProfile_');
    dataCacheService.clear('careerProfiles_all');
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    // Silently ignore 404 for "no profile yet"
    if (error?.response?.status === 404) return;
    console.error(`[CareerInterestProfileService] ${context}`, error);
  }
}

export default new CareerInterestProfileService();