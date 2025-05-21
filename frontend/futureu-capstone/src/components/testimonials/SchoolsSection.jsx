import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaComments, FaPlus } from 'react-icons/fa';
import { getSchoolAverageRating } from '../../services/testimonialService';

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

const SchoolsSection = ({ schools, onSelectSchool, onAddReview, searchQuery, schoolTestimonialCounts }) => {
  // State for school ratings
  const [schoolRatings, setSchoolRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState(true);

  // Fetch all school ratings
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoadingRatings(true);
        
        // Create an object to store ratings for each school
        const ratingsData = {};

        // Fetch ratings for each school
        for (const school of schools) {
          try {
            const response = await getSchoolAverageRating(school.schoolId);
            if (response && response.data) {
              ratingsData[school.schoolId] = {
                averageRating: response.data.averageRating.toFixed(1),
                ratingCount: response.data.ratingCount
              };
            }
          } catch (error) {
            console.error(`Error fetching rating for school ID ${school.schoolId}:`, error);
            // Set default values if error occurs
            ratingsData[school.schoolId] = {
              averageRating: '0.0',
              ratingCount: 0
            };
          }
        }

        setSchoolRatings(ratingsData);
      } catch (error) {
        console.error('Error fetching school ratings:', error);
      } finally {
        setLoadingRatings(false);
      }
    };

    if (schools && schools.length > 0) {
      fetchRatings();
    }
  }, [schools]);

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

  const getAverageRating = (schoolId) => {
    // Return actual rating from API if available
    if (schoolRatings[schoolId]) {
      return schoolRatings[schoolId].averageRating;
    }
    // Fallback to 0 if no ratings
    return '0.0';
  };

  const getReviewCount = (schoolId) => {
    // Return actual count from the schoolTestimonialCounts object or 0 if not found
    return schoolTestimonialCounts[schoolId] || 0;
  };

  // Filter schools based on search query
  const filteredSchools = searchQuery
    ? schools.filter(school => {
        const schoolName = (school.schoolName || school.name || '').toLowerCase();
        return schoolName.includes(searchQuery.toLowerCase());
      })
    : schools;

  // Display star rating component
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
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Schools</h2>
          <button
            onClick={() => onAddReview()}
            style={{ 
              backgroundColor: '#FFB71B', 
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e09b00'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFB71B'}
          >
            <FaPlus size={14} />
            <span>Add Review</span>
          </button>
        </div>

        {schools.length === 0 || loadingRatings ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">Loading schools...</p>
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">No schools match your search criteria.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSchools.map((school) => {
              const avgRating = getAverageRating(school.schoolId);
              const reviewCount = getReviewCount(school.schoolId);
              const schoolName = school.schoolName || school.name;
              const schoolBackground = getSchoolBackground(schoolName);
              
              return (
                <motion.div
                  key={school.schoolId}
                  variants={schoolCardVariants}
                  whileHover="hover"
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col h-full"
                >
                  <div className="h-48 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                    {schoolBackground ? (
                      <img 
                        src={schoolBackground} 
                        alt={`${schoolName} campus`}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#2B3E4E] to-[#1b2d3d] flex items-center justify-center">
                        <h3 className="text-xl font-bold text-white text-center px-4">
                          {schoolName}
                        </h3>
                      </div>
                    )}
                    
                    {/* Overlay school name on image */}
                    {schoolBackground && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-2xl font-bold text-white text-center px-4 text-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.4)' }}>
                          {schoolName}
                        </h3>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        {/* Star rating visualization */}
                        <div className="mr-2">
                          <StarRatingDisplay rating={avgRating} />
                        </div>
                        <span className="font-semibold">{avgRating}</span>
                        <span className="text-gray-500 text-sm ml-1">/ 5.0</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <FaComments className="mr-1" />
                        <span>{reviewCount} reviews</span>
                      </div>
                    </div>
                    
                    <div className="flex-grow mb-4">
                      <p className="text-gray-600 text-left">
                      {school.description || "Read reviews from students and alumni of this school."}
                    </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto">
                      <button
                        onClick={() => onSelectSchool(school.schoolId)}
                        style={{ 
                          backgroundColor: '#2B3E4E',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          fontWeight: '500',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1b2d3d'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2B3E4E'}
                      >
                        View Reviews
                      </button>
                      
                      <button
                        onClick={() => onAddReview(school.schoolId)}
                        style={{ 
                          backgroundColor: '#FFB71B',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.875rem'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e09b00'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFB71B'}
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