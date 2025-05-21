import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaQuoteRight, FaUser, FaEdit, FaTrash, FaEllipsisV, FaStar } from 'react-icons/fa';

// Star Rating Display Component
const StarRatingDisplay = ({ rating }) => {
  // Convert to a number between 0 and 5
  const numericRating = parseFloat(rating) || 0;
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className="mr-1"
          color={star <= numericRating ? "#FFB71B" : "#e4e5e9"}
          size={14}
        />
      ))}
    </div>
  );
};

const TestimonialCard = ({ testimonial, onEdit, onDelete, isUserOwned = false }) => {
  const [studentName, setStudentName] = useState('Student');
  const [schoolName, setSchoolName] = useState('School');
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // Log the entire structure for debugging
    console.log('Testimonial data:', JSON.stringify(testimonial, null, 2));
    
    // With the direct mapping approach, we can access properties directly
    const firstName = testimonial.studentFirstName || '';
    const lastName = testimonial.studentLastName || '';
    
    if (firstName || lastName) {
      setStudentName(`${firstName} ${lastName}`.trim());
    } else {
      // Fallback to old format if properties aren't available
      if (testimonial.student) {
        const student = testimonial.student;
        const stdFirstName = student.firstName || '';
        const stdLastName = student.lastname || ''; // Note: backend uses lowercase 'lastname'
        if (stdFirstName || stdLastName) {
          setStudentName(`${stdFirstName} ${stdLastName}`.trim());
        } else {
          setStudentName('Student');
        }
      }
    }
    
    // Extract school name directly from mapping
    if (testimonial.schoolName) {
      setSchoolName(testimonial.schoolName);
    } else if (testimonial.school && testimonial.school.name) {
      // Fallback to old format
      setSchoolName(testimonial.school.name);
    }
  }, [testimonial]);
  
  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showOptions && !e.target.closest('.options-menu')) {
        setShowOptions(false);
    }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptions]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 70, damping: 15 }
    },
    hover: { 
      y: -5, 
      boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const optionsMenuVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.1 }
    }
  };

  // Get testimonial data, handling both direct and nested properties
  const testimonialId = testimonial.testimonyId || testimonial.id;
  const description = testimonial.description || testimonial.quote || '';
  const role = 'Student'; // Default role
  const rating = testimonial.rating || 0; // Get rating or default to 0

  const handleEdit = () => {
    setShowOptions(false);
    if (onEdit) onEdit(testimonial);
  };

  const handleDelete = () => {
    setShowOptions(false);
    if (onDelete && window.confirm('Are you sure you want to delete this review?')) {
      onDelete(testimonialId);
    }
  };
  
  const toggleOptions = () => {
    setShowOptions(prevState => !prevState);
  };

  // Render the star rating
  const renderStarRating = () => {
    return (
      <div className="flex mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${star <= rating ? 'text-[#FFB71B]' : 'text-gray-300'} text-lg mr-1`}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-6">
        {/* User info */}
        <div className="flex items-center mb-4">
            <div className="bg-gray-100 rounded-full p-2 mr-4">
            <FaUser className="text-[#2B3E4E] text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{studentName}</h3>
            <p className="text-sm text-gray-600">{role}</p>
          </div>
        </div>

        {/* School name */}
        <div className="mb-3">
          <h4 className="font-semibold text-[#2B3E4E]">{schoolName}</h4>
        </div>
        
        {/* Rating stars */}
        {renderStarRating()}
        
        {/* Review content */}
        <div className="relative text-gray-700 italic">
          <FaQuoteLeft className="absolute top-0 left-0 text-[#FFB71B] opacity-30 text-xl" />
          <p className="pl-6 pr-6 mb-4">
            {description}
          </p>
          <FaQuoteRight className="absolute bottom-0 right-0 text-[#FFB71B] opacity-30 text-xl" />
        </div>
      </div>
      
      {/* Footer with 3-dot menu for edit/delete */}
      <div className="px-6 py-3 bg-gray-50 flex justify-end items-center">
        {isUserOwned && (
          <div className="relative options-menu">
            <button
              onClick={toggleOptions}
              className="text-[#2B3E4E] p-2 rounded-full hover:bg-gray-200 flex items-center justify-center"
              title="Options"
            >
              <FaEllipsisV />
            </button>
            
            {showOptions && (
              <div 
                className="absolute right-0 bottom-10 w-32 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200"
              >
                <button
                onClick={handleEdit}
                  className="w-full px-4 py-2 text-left flex items-center text-sm text-gray-700 hover:bg-[#2B3E4E] hover:text-white"
              >
                  <FaEdit className="text-[#FFB71B] mr-2" />
                  <span>Edit</span>
                </button>
              
                <button
                onClick={handleDelete}
                  className="w-full px-4 py-2 text-left flex items-center text-sm text-gray-700 hover:bg-[#2B3E4E] hover:text-white"
              >
                  <FaTrash className="text-red-500 mr-2" />
                  <span>Delete</span>
                </button>
              </div>
            )}
        </div>
        )}
      </div>
    </motion.div>
  );
};

export default TestimonialCard; 