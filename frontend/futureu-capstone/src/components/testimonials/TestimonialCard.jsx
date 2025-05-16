import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft, FaQuoteRight, FaUserGraduate, FaUser, FaEdit, FaTrash } from 'react-icons/fa';

// Import school images
import citu_school_image from '../../assets/school_images/citu_school_image.jpg';
import cdu_school_image from '../../assets/school_images/cdu_school_image.jpg';
import cnu_school_image from '../../assets/school_images/cnu_school_image.jpg';
import ctu_school_image from '../../assets/school_images/ctu_school_image.jpg';
import swu_school_image from '../../assets/school_images/swu_school_image.jpg';
import usc_school_image from '../../assets/school_images/usc_school_image.jpg';
import usjr_school_image from '../../assets/school_images/usjr_school_image.jpg';
import up_school_image from '../../assets/school_images/up_school_image.jpg';
import uc_school_image from '../../assets/school_images/uc_school_image.jpg';
import uv_school_image from '../../assets/school_images/uv_school_image.jpg';
import iau_school_image from '../../assets/school_images/iau_school_image.jpg';

// Create a mapping for school name detection to their background images
const schoolBackgroundMap = {
  "Cebu Institute of Technology": citu_school_image,
  "Cebu Doctors'": cdu_school_image,
  "Cebu Normal University": cnu_school_image,
  "Cebu Technological University": ctu_school_image,
  "Southwestern University": swu_school_image,
  "University of San Carlos": usc_school_image,
  "University of San Jose": usjr_school_image,
  "University of the Philippines": up_school_image,
  "University of Cebu": uc_school_image,
  "University of the Visayas": uv_school_image,
  "Indiana Aerospace University": iau_school_image,
};

// Function to get the school background based on name
const getSchoolBackground = (schoolName) => {
  if (!schoolName) return null;
  
  const normalizedName = schoolName.toLowerCase();
  
  // Check each key in our map to see if it's in the school name
  for (const [key, background] of Object.entries(schoolBackgroundMap)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return background;
    }
  }
  
  return null;
};

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
  
  // Get school background image
  const schoolBackground = getSchoolBackground(testimonial.schoolName);

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      {/* School background header image */}
      <div className="h-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
        {schoolBackground ? (
          <img 
            src={schoolBackground} 
            alt={`${testimonial.schoolName} campus`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <h3 className="text-xl font-bold text-white text-center px-4">{testimonial.schoolName}</h3>
          </div>
        )}
      </div>
      
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