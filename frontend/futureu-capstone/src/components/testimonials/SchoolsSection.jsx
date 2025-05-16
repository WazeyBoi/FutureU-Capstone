import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaComments, FaPlus } from 'react-icons/fa';

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

const SchoolsSection = ({ schools, onSelectSchool, onAddReview }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const schoolCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 50 }
    },
    hover: {
      y: -5,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 300, damping: 10 }
    }
  };

  const calculateAverageRating = (schoolId) => {
    // This would ideally come from the API with actual data
    // For now, return a random rating between 3.5 and 5.0
    return (3.5 + Math.random() * 1.5).toFixed(1);
  };

  const getReviewCount = (schoolId) => {
    // This would ideally come from the API with actual data
    // For now, return a random number between 10 and 100
    return Math.floor(10 + Math.random() * 90);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Schools</h2>
          <button
            onClick={() => onAddReview()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <FaPlus size={14} />
            <span>Add Review</span>
          </button>
        </div>

        {schools.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">Loading schools...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {schools.map((school) => {
              const avgRating = calculateAverageRating(school.schoolId);
              const reviewCount = getReviewCount(school.schoolId);
              const schoolName = school.schoolName || school.name;
              const schoolBackground = getSchoolBackground(schoolName);
              
              return (
                <motion.div
                  key={school.schoolId}
                  variants={schoolCardVariants}
                  whileHover="hover"
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="h-32 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
                    {schoolBackground ? (
                      <img 
                        src={schoolBackground} 
                        alt={`${schoolName} campus`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <h3 className="text-xl font-bold text-white text-center px-4">
                          {schoolName}
                        </h3>
                      </div>
                    )}
                    
                    {/* Overlay school name on image */}
                    {schoolBackground && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-xl font-bold text-white text-center px-4 text-shadow-md">
                          {schoolName}
                        </h3>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <div className="text-yellow-500 mr-2">
                          <FaStar />
                        </div>
                        <span className="font-semibold">{avgRating}</span>
                        <span className="text-gray-500 text-sm ml-1">/ 5.0</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <FaComments className="mr-1" />
                        <span>{reviewCount} reviews</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {school.description || "Read reviews from students and alumni of this school."}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => onSelectSchool(school.schoolId)}
                        className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                      >
                        View Reviews
                      </button>
                      
                      <button
                        onClick={() => onAddReview(school.schoolId)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                      >
                        <FaPlus size={10} />
                        <span>Add Review</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SchoolsSection; 