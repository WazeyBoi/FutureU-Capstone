import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft, FaQuoteRight, FaUserGraduate, FaUser, FaEdit, FaTrash } from 'react-icons/fa';

const TestimonialCard = ({ testimonial, onEdit, onDelete, isUserOwned = false }) => {
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

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i < rating ? "text-yellow-500" : "text-gray-300"} 
        />
      );
    }
    return stars;
  };

  const handleEdit = () => {
    if (onEdit) onEdit(testimonial);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this review?')) {
      onDelete(testimonial.id);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-gray-100 rounded-full p-2 mr-4">
              {testimonial.type === 'alumni' ? (
                <FaUserGraduate className="text-blue-600 text-xl" />
              ) : (
                <FaUser className="text-green-600 text-xl" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">{testimonial.name}</h3>
              <p className="text-sm text-gray-600">
                {testimonial.type === 'alumni' ? 'Alumni' : 'Student'} • {testimonial.program}
              </p>
            </div>
          </div>
          <div className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-xs font-medium">
            {testimonial.type === 'alumni' ? `Class of ${testimonial.gradYear}` : `Graduating ${testimonial.gradYear}`}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-yellow-500 flex mb-1">
            {renderStars(testimonial.rating)}
          </div>
          <h4 className="font-semibold text-gray-700 mb-1">{testimonial.schoolName}</h4>
        </div>
        
        <div className="relative text-gray-700 italic">
          <FaQuoteLeft className="absolute top-0 left-0 text-gray-200 text-xl" />
          <p className="pl-6 pr-6 mb-4">
            {testimonial.quote}
          </p>
          <FaQuoteRight className="absolute bottom-0 right-0 text-gray-200 text-xl" />
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 flex justify-between items-center">
        <span className="text-xs font-medium text-gray-500">
          {testimonial.type === 'alumni' ? 'ALUMNI REVIEW' : 'STUDENT REVIEW'}
        </span>
        
        <div className="flex items-center gap-2">
          {isUserOwned && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEdit}
                className="text-blue-600 p-1 rounded-full hover:bg-blue-50"
                title="Edit review"
              >
                <FaEdit />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                className="text-red-600 p-1 rounded-full hover:bg-red-50"
                title="Delete review"
              >
                <FaTrash />
              </motion.button>
            </>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-blue-600 text-sm font-medium hover:text-blue-800 ml-2"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard; 