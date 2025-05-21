import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaStar } from 'react-icons/fa';
import { createTestimonial, updateTestimonial } from '../../services/testimonialService';
import authService from '../../services/authService';

const StarRating = ({ rating, onRatingChange }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        
        return (
          <FaStar 
            key={index}
            className="cursor-pointer transition-colors duration-200"
            color={ratingValue <= (hover || rating) ? "#FFB71B" : "#e4e5e9"}
            size={30}
            onClick={() => onRatingChange(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          />
        );
      })}
    </div>
  );
};

const TestimonialForm = ({ isOpen, onClose, schools, testimonialToEdit, onSubmitSuccess }) => {
  const initialFormState = {
    description: '',
    schoolId: '',
    rating: 0,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If testimonialToEdit is provided, it means we're editing an existing testimonial
  useEffect(() => {
    if (testimonialToEdit) {
      setFormData({
        ...testimonialToEdit,
        // Ensure we have the correct structure
        description: testimonialToEdit.description || '',
        schoolId: testimonialToEdit.schoolId || testimonialToEdit.school?.schoolId || '',
        rating: testimonialToEdit.rating || 0,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [testimonialToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get the current user from auth service
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || !currentUser.id) {
        throw new Error('You must be logged in to submit a testimonial');
      }

      // Prepare the data according to backend structure
      const testimonialData = {
        description: formData.description,
        rating: formData.rating,  // Include rating data
        // If we're editing, keep the ID
        testimonyId: testimonialToEdit?.testimonyId, 
        // Reference to School entity
        school: {
          schoolId: parseInt(formData.schoolId)
        },
        // Reference to User entity (student)
        student: {
          userId: currentUser.id
        }
      };

      // Capture if we're creating or updating for the success message
      const isNewTestimonial = !testimonialToEdit?.testimonyId || testimonialToEdit?.isNewTestimonial;

    try {
      let response;
      
        if (testimonialToEdit?.testimonyId && !testimonialToEdit?.isNewTestimonial) {
        // Update existing testimonial
          response = await updateTestimonial(testimonialToEdit.testimonyId, testimonialData);
      } else {
        // Create new testimonial
          response = await createTestimonial(testimonialData);
      }
      
      // Call the success callback with the response data
        onSubmitSuccess(response.data || testimonialData);
        
        // Since data is actually saved to the database even when we get errors later,
        // we can close the form and reset it
      onClose();
      setFormData(initialFormState);
        
        // Show success message to the user
        alert(isNewTestimonial ? 'Your review has been submitted successfully!' : 'Your review has been updated successfully!');
        
      } catch (apiError) {
        // We might get API errors but the data might still be saved
        console.error('API error during testimonial submission:', apiError);
        setError('There was a problem completing your request. Please check if your review was saved.');
      }
    } catch (err) {
      console.error('Error submitting testimonial:', err);
      setError(err.message || 'Failed to submit your testimonial. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // If not open, don't render
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 overflow-hidden relative flex flex-col max-h-[90vh]"
      >
        {/* Header with gradient */}
        <div className="flex justify-between items-center p-6 bg-[#2B3E4E] text-white sticky top-0 z-10 shadow-md">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">
              {testimonialToEdit && !testimonialToEdit.isNewTestimonial ? 'Edit Your Review' : 'Share Your Experience'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'white',
              color: '#FF4B4B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#FFF5F5';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          <form id="testimonial-form" onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border-l-4 border-red-500 flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="schoolId" className="block text-[#2B3E4E] font-medium mb-2 text-sm">School</label>
              <div className="relative">
                <select
                  id="schoolId"
                  name="schoolId"
                  value={formData.schoolId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] appearance-none bg-white shadow-sm pr-10"
                  required
                  disabled={testimonialToEdit?.schoolId}
                >
                  <option value="">Select a school</option>
                  {schools.map(school => (
                    <option key={school.schoolId} value={school.schoolId}>
                      {school.schoolName || school.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Star Rating Component */}
            <div className="mb-6">
              <label className="block text-[#2B3E4E] font-medium mb-2 text-sm">Your Rating</label>
              <StarRating rating={formData.rating} onRatingChange={handleRatingChange} />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-[#2B3E4E] font-medium mb-2 text-sm">Your Review</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all shadow-sm"
                placeholder="Tell us about your experience with this school..."
                required
              ></textarea>
            </div>
          </form>
        </div>
        
        {/* Fixed footer with buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 flex justify-end shadow-lg z-10">
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#2B3E4E',
              color: 'white',
              padding: '0.625rem 1.5rem',
              borderRadius: '0.5rem',
              marginRight: '1rem',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1b2d3d'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2B3E4E'}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="testimonial-form"
            disabled={loading}
            style={{
              backgroundColor: '#FFB71B',
              color: 'white',
              padding: '0.625rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e09b00';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#FFB71B';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <span>{testimonialToEdit && !testimonialToEdit.isNewTestimonial ? 'Update Review' : 'Submit Review'}</span>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TestimonialForm;