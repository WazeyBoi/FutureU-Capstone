import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaTimes } from 'react-icons/fa';
import { createTestimonial, updateTestimonial } from '../../services/testimonialService';

const TestimonialForm = ({ isOpen, onClose, schools, testimonialToEdit, onSubmitSuccess }) => {
  const initialFormState = {
    id: null,
    name: '',
    type: 'student',
    schoolId: '',
    program: '',
    gradYear: new Date().getFullYear(),
    quote: '',
    rating: 5
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // If testimonialToEdit is provided, it means we're editing an existing testimonial
  useEffect(() => {
    if (testimonialToEdit) {
      setFormData(testimonialToEdit);
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

  const handleRatingClick = (rating) => {
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
      let response;
      
      if (formData.id) {
        // Update existing testimonial
        response = await updateTestimonial(formData.id, formData);
      } else {
        // Create new testimonial
        response = await createTestimonial(formData);
      }
      
      // Call the success callback with the response data
      onSubmitSuccess(response.data || formData);
      onClose();
      setFormData(initialFormState);
    } catch (err) {
      console.error('Error submitting testimonial:', err);
      setError('Failed to submit your testimonial. Please try again later.');
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
            <div className="w-10 h-10 rounded-full bg-[#FFB71B]/20 flex items-center justify-center">
              <FaStar className="text-[#FFB71B]" />
            </div>
            <h2 className="text-xl font-bold">
              {testimonialToEdit ? 'Edit Your Review' : 'Share Your Experience'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
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
              <label htmlFor="name" className="block text-[#2B3E4E] font-medium mb-2 text-sm">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all bg-white/50 shadow-sm"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-[#2B3E4E] font-medium mb-2 text-sm">You are</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center relative">
                  <input
                    type="radio"
                    name="type"
                    value="student"
                    checked={formData.type === 'student'}
                    onChange={handleChange}
                    className="absolute opacity-0 h-0 w-0"
                  />
                  <span className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${formData.type === 'student' ? 'bg-[#2B3E4E] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    Current Student
                  </span>
                </label>
                <label className="inline-flex items-center relative">
                  <input
                    type="radio"
                    name="type"
                    value="alumni"
                    checked={formData.type === 'alumni'}
                    onChange={handleChange}
                    className="absolute opacity-0 h-0 w-0"
                  />
                  <span className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${formData.type === 'alumni' ? 'bg-[#2B3E4E] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    Alumni
                  </span>
                </label>
              </div>
            </div>

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

            <div className="mb-6">
              <label htmlFor="program" className="block text-[#2B3E4E] font-medium mb-2 text-sm">Program/Course</label>
              <input
                type="text"
                id="program"
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all shadow-sm"
                placeholder="e.g. Bachelor of Science in Computer Science"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="gradYear" className="block text-[#2B3E4E] font-medium mb-2 text-sm">
                {formData.type === 'alumni' ? 'Graduation Year' : 'Expected Graduation Year'}
              </label>
              <input
                type="number"
                id="gradYear"
                name="gradYear"
                value={formData.gradYear}
                onChange={handleChange}
                min="2000"
                max="2030"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all shadow-sm"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-[#2B3E4E] font-medium mb-2 text-sm">Your Rating</label>
              <div className="flex space-x-1 bg-gray-50 p-3 rounded-xl items-center">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onMouseEnter={() => setHoverRating(rating)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRatingClick(rating)}
                      className="focus:outline-none transition-transform hover:scale-110 p-1"
                    >
                      <FaStar
                        size={28}
                        className={`${
                          rating <= (hoverRating || formData.rating)
                            ? 'text-[#FFB71B]'
                            : 'text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                <div className="ml-3 text-[#2B3E4E] font-medium">
                  {formData.rating === 1 && "Poor"}
                  {formData.rating === 2 && "Fair"}
                  {formData.rating === 3 && "Good"}
                  {formData.rating === 4 && "Very Good"}
                  {formData.rating === 5 && "Excellent"}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="quote" className="block text-[#2B3E4E] font-medium mb-2 text-sm">Your Review</label>
              <textarea
                id="quote"
                name="quote"
                value={formData.quote}
                onChange={handleChange}
                rows="4"
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all shadow-sm"
                placeholder="Tell us about your experience..."
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
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-[#2B3E4E] hover:bg-gray-50 mr-4 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="testimonial-form"
            disabled={loading}
            className="px-6 py-2.5 bg-[#2B3E4E] hover:bg-[#2B3E4E]/90 text-white rounded-lg shadow-md hover:shadow-lg flex items-center font-medium transition-all"
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
              <>
                <span>{testimonialToEdit ? 'Update Review' : 'Submit Review'}</span>
                <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TestimonialForm;