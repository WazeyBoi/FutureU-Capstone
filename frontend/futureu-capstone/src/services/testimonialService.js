import apiClient from './api';
import authService from './authService';

/**
 * Testimonial Service
 * Handles all API requests related to testimonials
 */

/**
 * Get all testimonials
 * @returns {Promise} Promise object with testimonials data
 */
export const getAllTestimonials = () => {
  return apiClient.get('/testimony/getAllTestimonies')
    .catch(error => {
      console.error('Error fetching testimonials:', error);
      throw error;
    });
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
 * Get testimonials for a specific school
 * @param {number} schoolId - The ID of the school
 * @returns {Promise} Promise object with filtered testimonials data
 */
export const getTestimonialsBySchool = (schoolId) => {
  return apiClient.get(`/testimony/getTestimoniesBySchool/${schoolId}`)
    .catch(error => {
      console.error(`Error fetching testimonials for school ID ${schoolId}:`, error);
      throw error;
    });
};

/**
 * Get average rating for a school
 * @param {number} schoolId - The ID of the school
 * @returns {Promise} Promise object with the average rating data
 */
export const getSchoolAverageRating = (schoolId) => {
  return apiClient.get(`/testimony/getSchoolAverageRating/${schoolId}`)
    .catch(error => {
      console.error(`Error fetching average rating for school ID ${schoolId}:`, error);
      throw error;
    });
};

/**
 * Get all school ratings at once
 * @returns {Promise} Promise object with all school ratings
 */
export const getAllSchoolRatings = () => {
  return apiClient.get('/testimony/getAllSchoolRatings')
    .catch(error => {
      console.error('Error fetching all school ratings:', error);
      throw error;
    });
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
export const createTestimonial = (testimonialData) => {
  // Get the current token
  const token = authService.getToken();
  if (!token) {
    console.error('Authentication token is missing');
    return Promise.reject(new Error('You must be logged in to submit a testimonial'));
  }
  
  return apiClient.post('/testimony/postTestimonyRecord', testimonialData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .catch(error => {
    console.error('Error creating testimonial:', error);
    throw error;
  });
};

/**
 * Update an existing testimonial
 * @param {number} testimonyId - The ID of the testimonial to update
 * @param {Object} testimonialData - The updated testimonial data
 * @returns {Promise} Promise object with the updated testimonial data
 */
export const updateTestimonial = (testimonyId, testimonialData) => {
  // Get the current token
  const token = authService.getToken();
  if (!token) {
    console.error('Authentication token is missing');
    return Promise.reject(new Error('You must be logged in to update a testimonial'));
  }

  return apiClient.put(`/testimony/putTestimonyDetails?testimonyId=${testimonyId}`, testimonialData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .catch(error => {
    console.error(`Error updating testimonial with ID ${testimonyId}:`, error);
    
    // Check for forbidden status (unauthorized access)
    if (error.response && error.response.status === 403) {
      throw new Error('You can only update your own testimonials');
    } else {
      throw error;
    }
  });
};

/**
 * Delete a testimonial
 * @param {number} testimonyId - The ID of the testimonial to delete
 * @returns {Promise} Promise object with the deletion status
 */
export const deleteTestimonial = (testimonyId) => {
  // Get the current token
  const token = authService.getToken();
  if (!token) {
    console.error('Authentication token is missing');
    return Promise.reject(new Error('You must be logged in to delete a testimonial'));
  }

  return apiClient.delete(`/testimony/deleteTestimonyDetails/${testimonyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .catch(error => {
    console.error(`Error deleting testimonial with ID ${testimonyId}:`, error);
    
    // Check for forbidden status (unauthorized access)
    if (error.response && error.response.status === 403) {
      throw new Error('You can only delete your own testimonials');
    } else if (error.response && error.response.status === 404) {
      throw new Error('Testimonial not found');
    } else {
      throw error;
    }
  });
};

/**
 * Search testimonials by keyword
 * @param {string} searchQuery - The search text
 * @returns {Promise} Promise object with matching testimonials
 */
export const searchTestimonials = (searchQuery) => {
  return apiClient.get(`/testimonials/search?query=${searchQuery}`)
    .catch(error => {
      console.error(`Error searching testimonials with query "${searchQuery}":`, error);
      throw error;
    });
}; 