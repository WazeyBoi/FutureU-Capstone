import apiClient from './api';
import authService from './authService';
import dataCacheService from './dataCache';

/**
 * Testimonial Service with caching
 * Handles all API requests related to testimonials
 */

/**
 * Get all testimonials with caching
 * @param {boolean} forceRefresh - Force refresh from API
 * @returns {Promise} Promise object with testimonials data
 */
export const getAllTestimonials = async (forceRefresh = false) => {
  const cacheKey = 'testimonials';
  
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = dataCacheService.get(cacheKey);
    if (cached) {
      return { data: cached };
    }
  }
  
  // Check if already loading
  if (dataCacheService.isLoading(cacheKey)) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!dataCacheService.isLoading(cacheKey)) {
          clearInterval(checkInterval);
          const cached = dataCacheService.get(cacheKey);
          resolve({ data: cached || [] });
        }
      }, 100);
    });
  }

  try {
    dataCacheService.setLoading(cacheKey, true);
    
    const response = await apiClient.get('/testimony/getAllTestimonies');
    const testimonials = response.data || [];
    
    // Cache the result
    dataCacheService.set(cacheKey, testimonials);
    
    return { data: testimonials };
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  } finally {
    dataCacheService.setLoading(cacheKey, false);
  }
};

/**
 * Get testimony by ID
 * @param {number} testimonyId - The ID of the testimony
 * @returns {Promise} Promise object with testimony data
 */
export const getTestimonialById = (testimonyId) => {
  return apiClient.get(`/testimony/getTestimony/${testimonyId}`)
    .catch(error => {
      console.error(`Error fetching testimonial with ID ${testimonyId}:`, error);
      throw error;
    });
};

/**
 * Get testimonials for a specific school with caching
 * @param {number} schoolId - The ID of the school
 * @returns {Promise} Promise object with filtered testimonials data
 */
export const getTestimonialsBySchool = async (schoolId) => {
  const cacheKey = `testimonials_school_${schoolId}`;
  
  // Check cache first
  const cached = dataCacheService.get(cacheKey);
  if (cached) {
    return { data: cached };
  }
  
  // Check if already loading
  if (dataCacheService.isLoading(cacheKey)) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!dataCacheService.isLoading(cacheKey)) {
          clearInterval(checkInterval);
          const cached = dataCacheService.get(cacheKey);
          resolve({ data: cached || [] });
        }
      }, 100);
    });
  }

  try {
    dataCacheService.setLoading(cacheKey, true);
    
    const response = await apiClient.get(`/testimony/getTestimoniesBySchool/${schoolId}`);
    const testimonials = response.data || [];
    
    // Cache the result
    dataCacheService.set(cacheKey, testimonials);
    
    return { data: testimonials };
  } catch (error) {
    console.error(`Error fetching testimonials for school ID ${schoolId}:`, error);
    throw error;
  } finally {
    dataCacheService.setLoading(cacheKey, false);
  }
};

/**
 * Get testimonials for a specific student/user
 * @param {number} userId - The ID of the user
 * @returns {Promise} Promise object with filtered testimonials data
 */
export const getTestimonialsByUser = (userId) => {
  return apiClient.get(`/testimony/getTestimoniesByStudent/${userId}`)
    .catch(error => {
      console.error(`Error fetching testimonials for user ID ${userId}:`, error);
      throw error;
    });
};

/**
 * Create a new testimonial
 * @param {Object} testimonialData - The testimonial data to submit
 * @returns {Promise} Promise object with the created testimonial data
 */
export const createTestimonial = async (testimonialData) => {
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    console.error('User is not authenticated');
    return Promise.reject(new Error('You must be logged in to submit a testimonial'));
  }
  
  try {
    const response = await apiClient.post('/testimony/postTestimonyRecord', testimonialData);
    
    // Clear related caches
    dataCacheService.clear('testimonials');
    dataCacheService.clearByPattern('testimonials_school_'); // Clear all school-specific caches
    
    return response;
  } catch (error) {
    console.error('Error creating testimonial:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Failed to submit your testimonial. Please try again later.';
    
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'You must be logged in to submit a testimonial.';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid testimonial data. Please check your input.';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing testimonial
 * @param {number} testimonyId - The ID of the testimony to update
 * @param {Object} testimonialData - The updated testimonial data
 * @returns {Promise} Promise object with the updated testimonial data
 */
export const updateTestimonial = async (testimonyId, testimonialData) => {
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    console.error('User is not authenticated');
    return Promise.reject(new Error('You must be logged in to update a testimonial'));
  }
  
  try {
    const response = await apiClient.put(`/testimony/putTestimonyDetails?testimonyId=${testimonyId}`, testimonialData);
    
    // Clear related caches
    dataCacheService.clear('testimonials');
    dataCacheService.clearByPattern('testimonials_school_'); // Clear all school-specific caches
    
    return response;
  } catch (error) {
    console.error('Error updating testimonial:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Failed to update your testimonial. Please try again later.';
    
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'You are not authorized to update this testimonial.';
      } else if (error.response.status === 404) {
        errorMessage = 'Testimonial not found.';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid testimonial data. Please check your input.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Delete a testimonial
 * @param {number} testimonyId - The ID of the testimony to delete
 * @returns {Promise} Promise object with deletion confirmation
 */
export const deleteTestimonial = async (testimonyId) => {
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    console.error('User is not authenticated');
    return Promise.reject(new Error('You must be logged in to delete a testimonial'));
  }
  
  try {
    const response = await apiClient.delete(`/testimony/deleteTestimonyDetails/${testimonyId}`);
    
    // Clear all testimonial caches since we don't know which school this belonged to
    dataCacheService.clear('testimonials');
    dataCacheService.clearByPattern('testimonials_school_');
    
    return response;
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Failed to delete your testimonial. Please try again later.';
    
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'You are not authorized to delete this testimonial.';
      } else if (error.response.status === 404) {
        errorMessage = 'Testimonial not found.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Get average rating for a school
 * @param {number} schoolId - The school ID
 * @returns {Promise<Object>} Promise object with average rating data
 */
export const getSchoolAverageRating = async (schoolId) => {
  try {
    // Get testimonials for this school - fetch fresh data to avoid caching issues
    const cacheKey = `testimonials_school_${schoolId}`;
    
    // Clear cache to ensure fresh data
    dataCacheService.clear(cacheKey);
    
    const response = await apiClient.get(`/testimony/getTestimoniesBySchool/${schoolId}`);
    const testimonials = response.data || [];
    
    if (testimonials.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0
      };
    }
    
    // Calculate average rating
    const totalRating = testimonials.reduce((sum, testimonial) => {
      return sum + (testimonial.rating || 0);
    }, 0);
    
    const averageRating = totalRating / testimonials.length;
    
    const result = {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: testimonials.length
    };
    
    return result;
  } catch (error) {
    console.error(`Error calculating average rating for school ${schoolId}:`, error);
    return {
      averageRating: 0,
      totalReviews: 0
    };
  }
};

/**
 * Search testimonials by keyword
 * @param {string} searchQuery - The search text
 * @returns {Promise} Promise object with matching testimonials
 */
export const searchTestimonials = async (searchQuery) => {
  try {
    // For now, get all testimonials and filter client-side
    // In the future, this could be optimized with a server-side search endpoint
    const response = await getAllTestimonials();
    const allTestimonials = response.data || [];
    
    if (!searchQuery || searchQuery.trim() === '') {
      return { data: allTestimonials };
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = allTestimonials.filter(testimonial => {
      const description = (testimonial.description || '').toLowerCase();
      const schoolName = (testimonial.schoolName || '').toLowerCase();
      const studentName = `${testimonial.studentFirstName || ''} ${testimonial.studentLastName || ''}`.toLowerCase();
      
      return description.includes(query) || 
             schoolName.includes(query) || 
             studentName.includes(query);
    });
    
    return { data: filtered };
  } catch (error) {
    console.error(`Error searching testimonials with query "${searchQuery}":`, error);
    throw error;
  }
};

/**
 * Get testimonial statistics
 * @returns {Promise<Object>} Promise object with testimonial statistics
 */
export const getTestimonialStatistics = async () => {
  try {
    const response = await getAllTestimonials();
    const testimonials = response.data || [];
    
    // Calculate statistics
    const totalTestimonials = testimonials.length;
    const uniqueSchools = new Set(testimonials.map(t => t.schoolId).filter(Boolean)).size;
    const averageRating = testimonials.length > 0 
      ? testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length 
      : 0;
    
    // Rating distribution
    const ratingDistribution = {
      5: testimonials.filter(t => t.rating === 5).length,
      4: testimonials.filter(t => t.rating === 4).length,
      3: testimonials.filter(t => t.rating === 3).length,
      2: testimonials.filter(t => t.rating === 2).length,
      1: testimonials.filter(t => t.rating === 1).length,
    };
    
    return {
      totalTestimonials,
      uniqueSchools,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    };
  } catch (error) {
    console.error('Error fetching testimonial statistics:', error);
    return {
      totalTestimonials: 0,
      uniqueSchools: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
};

/**
 * Force refresh all testimonial caches
 * @returns {Promise<void>}
 */
export const refreshTestimonialCaches = async () => {
  try {
    // Clear all testimonial-related caches
    dataCacheService.clear('testimonials');
    dataCacheService.clearByPattern('testimonials_school_');
    
    // Fetch fresh data
    await getAllTestimonials(true);
  } catch (error) {
    console.error('Error refreshing testimonial caches:', error);
    throw error;
  }
};