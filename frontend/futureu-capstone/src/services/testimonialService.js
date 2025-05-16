import apiClient from './api';

/**
 * Testimonial Service
 * Handles all API requests related to testimonials
 */

/**
 * Get all testimonials
 * @returns {Promise} Promise object with testimonials data
 */
export const getAllTestimonials = () => {
  return apiClient.get('/testimony/getAllTestimonies');
};

/**
 * Get testimony by ID
 * @param {number} testimonyId - The ID of the testimony
 * @returns {Promise} Promise object with testimony data
 */
export const getTestimonialById = (testimonyId) => {
  return apiClient.get(`/testimony/getTestimony/${testimonyId}`);
};

/**
 * Get testimonials for a specific school
 * @param {number} schoolId - The ID of the school
 * @returns {Promise} Promise object with filtered testimonials data
 */
export const getTestimonialsBySchool = (schoolId) => {
  return apiClient.get(`/testimony/getTestimoniesBySchool/${schoolId}`);
};

/**
 * Get testimonials for a specific student/user
 * @param {number} userId - The ID of the user
 * @returns {Promise} Promise object with filtered testimonials data
 */
export const getTestimonialsByUser = (userId) => {
  return apiClient.get(`/testimony/getTestimoniesByStudent/${userId}`);
};

/**
 * Create a new testimonial
 * @param {Object} testimonialData - The testimonial data to submit
 * @returns {Promise} Promise object with the created testimonial data
 */
export const createTestimonial = (testimonialData) => {
  return apiClient.post('/testimony/postTestimonyRecord', testimonialData);
};

/**
 * Update an existing testimonial
 * @param {number} testimonyId - The ID of the testimonial to update
 * @param {Object} testimonialData - The updated testimonial data
 * @returns {Promise} Promise object with the updated testimonial data
 */
export const updateTestimonial = (testimonyId, testimonialData) => {
  return apiClient.put(`/testimony/putTestimonyDetails?testimonyId=${testimonyId}`, testimonialData);
};

/**
 * Delete a testimonial
 * @param {number} testimonyId - The ID of the testimonial to delete
 * @returns {Promise} Promise object with the deletion status
 */
export const deleteTestimonial = (testimonyId) => {
  return apiClient.delete(`/testimony/deleteTestimonyDetails/${testimonyId}`);
};

/**
 * Search testimonials by keyword
 * @param {string} searchQuery - The search text
 * @returns {Promise} Promise object with matching testimonials
 */
export const searchTestimonials = (searchQuery) => {
  return apiClient.get(`/testimonials/search?query=${searchQuery}`);
}; 