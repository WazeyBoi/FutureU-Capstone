import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaComments, FaPlus } from 'react-icons/fa';
import { getSchoolAverageRating } from '../../services/testimonialService';
import dataCacheService from '../../services/dataCache';

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
  const [lastInstantUpdate, setLastInstantUpdate] = useState(null); // Track when we made instant updates

  // Global event listener that works even when component is not mounted
  useEffect(() => {
    const globalEventHandler = (event) => {
      console.log('GLOBAL EVENT HANDLER: Full Event Object:', event);
      console.log('GLOBAL EVENT HANDLER: Event Detail:', event.detail);
      const { action, schoolId, deletedRating } = event.detail || {};
      console.log('GLOBAL EVENT HANDLER: Destructured Action:', action);

      // Handle deletion events
      if (action === 'delete') {
        console.log('GLOBAL EVENT HANDLER: Processing deletion for school:', schoolId, 'rating:', deletedRating);

        // Process deletion immediately if SchoolsSection is mounted
        if (schools && schools.length > 0) {
          console.log('GLOBAL EVENT HANDLER: SchoolsSection is mounted, processing deletion immediately');

          setSchoolRatings(currentRatings => {
            const currentRating = currentRatings[schoolId] || { averageRating: '0.0', ratingCount: 0 };
            const currentCount = currentRating.ratingCount || 0;
            const currentAverage = parseFloat(currentRating.averageRating) || 0;

            console.log(`GLOBAL DELETE: School ${schoolId}, Current: ${currentAverage}, Count: ${currentCount}, Deleted rating: ${deletedRating}`);

            if (currentCount <= 1) {
              // No reviews left, reset to 0
              console.log(`GLOBAL DELETE CALC: Resetting school ${schoolId} to 0.0 stars`);
              return {
                ...currentRatings,
                [schoolId]: { averageRating: '0.0', ratingCount: 0 }
              };
            } else {
              // Calculate new average
              const newTotal = (currentAverage * currentCount) - deletedRating;
              const newCount = currentCount - 1;
              const newAverage = newTotal / newCount;

              console.log(`GLOBAL DELETE CALC: School ${schoolId} new average: ${newAverage.toFixed(1)}`);
              return {
                ...currentRatings,
                [schoolId]: { averageRating: newAverage.toFixed(1), ratingCount: newCount }
              };
            }
          });

          // Clear cache and mark instant update
          dataCacheService.clear('school_ratings_full');
          setLastInstantUpdate(Date.now());
        } else {
          // SchoolsSection not mounted, store for later
          console.log('GLOBAL EVENT HANDLER: SchoolsSection not mounted, storing for later');
          try {
            localStorage.setItem('futureu_pending_deletion', JSON.stringify({
              schoolId: schoolId,
              deletedRating: deletedRating,
              timestamp: Date.now()
            }));
            console.log('GLOBAL EVENT HANDLER: Stored pending deletion in localStorage');
          } catch (e) {
            console.error('GLOBAL EVENT HANDLER: Error storing pending deletion:', e);
          }
        }
      }

      // This block will now only handle actual 'add' or 'update' events, or if no action is specified (which we'll assume is an add/update)
      if (action === 'add' || !action) { // Removed 'event.detail &&' as it's already destructured
        console.log('GLOBAL EVENT HANDLER: Received add/update event:', event.detail);
      }
    };
    
    window.addEventListener('futureu_testimonials_updated', globalEventHandler);
    
    // Test listener to catch ALL events
    const testListener = (event) => {
      console.log('TEST LISTENER: Event received:', event.type, event.detail);
    };
    window.addEventListener('futureu_testimonials_updated', testListener);
    
    return () => {
      window.removeEventListener('futureu_testimonials_updated', globalEventHandler);
      window.removeEventListener('futureu_testimonials_updated', testListener);
    };
  }, [schools]); // Add schools as dependency so it can access current state

  // Fetch all school ratings - define function outside useEffect for reuse
  const fetchRatings = async (showLoading = true) => {
      try {
        // Skip fetching if we have recent instant updates (within last 5 seconds)
        if (lastInstantUpdate && (Date.now() - lastInstantUpdate) < 5000) {
          console.log('Skipping fetchRatings - recent instant updates detected');
          return;
        }
        
        // Check cache first for instant display
        const cacheKey = `school_ratings_full`;
        const cachedRatings = dataCacheService.get(cacheKey);
        if (cachedRatings && schools.length === cachedRatings.schoolCount) {
          setSchoolRatings(cachedRatings.ratings || {});
          setLoadingRatings(false);
          console.log('Using cached school ratings for instant display');
          return;
        }

        if (showLoading) setLoadingRatings(true);
        
        // Create an object to store ratings for each school
        const ratingsData = {};

        // Fetch ratings for each school
        for (const school of schools) {
          try {
            const response = await getSchoolAverageRating(school.schoolId);
            if (response) {
              ratingsData[school.schoolId] = {
                averageRating: response.averageRating.toFixed(1),
                ratingCount: response.totalReviews
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
        
        // Cache the ratings data
        dataCacheService.set(cacheKey, {
          ratings: ratingsData,
          schoolCount: schools.length,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error fetching school ratings:', error);
      } finally {
        if (showLoading) setLoadingRatings(false);
      }
    };

  // Fetch ratings on mount and when schools change
  useEffect(() => {
    if (schools && schools.length > 0) {
      let pendingDeletionProcessed = false;

      // Check for pending deletions when component mounts
      try {
        const pendingDeletion = localStorage.getItem('futureu_pending_deletion');
        if (pendingDeletion) {
          const { schoolId, deletedRating, timestamp } = JSON.parse(pendingDeletion);

          // Only process if deletion happened within last 10 seconds
          if (Date.now() - timestamp < 10000) {
            console.log('Processing pending deletion:', { schoolId, deletedRating });

            setSchoolRatings(currentRatings => {
              const currentRating = currentRatings[schoolId] || { averageRating: '0.0', ratingCount: 0 };
              const currentCount = currentRating.ratingCount || 0;
              const currentAverage = parseFloat(currentRating.averageRating) || 0;

              if (currentCount <= 1) {
                console.log(`PENDING DELETE: Resetting school ${schoolId} to 0.0 stars`);
                return {
                  ...currentRatings,
                  [schoolId]: { averageRating: '0.0', ratingCount: 0 }
                };
              } else {
                const newTotal = (currentAverage * currentCount) - deletedRating;
                const newCount = currentCount - 1;
                const newAverage = newTotal / newCount;

                console.log(`PENDING DELETE: School ${schoolId} new average: ${newAverage.toFixed(1)}`);
                return {
                  ...currentRatings,
                  [schoolId]: { averageRating: newAverage.toFixed(1), ratingCount: newCount }
                };
              }
            });

            // Clear cache and mark instant update
            dataCacheService.clear('school_ratings_full');
            setLastInstantUpdate(Date.now()); // Mark this as an instant update
            pendingDeletionProcessed = true;
          }

          // Clear the pending deletion regardless of whether it was processed or not
          localStorage.removeItem('futureu_pending_deletion');
        }
      } catch (e) {
        console.error('Error processing pending deletion:', e);
        localStorage.removeItem('futureu_pending_deletion'); // Ensure it's cleared on error
      }

      // Only fetch ratings if no pending deletion was processed AND no recent instant update
      if (!pendingDeletionProcessed) {
        fetchRatings();
      }
    }
  }, [schools]);

  // Listen for testimonial changes to refresh ratings
  useEffect(() => {
    const handleStorageChange = () => {
      if (schools && schools.length > 0) {
        fetchRatings();
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomRefresh = (event) => {
      console.log('SchoolsSection: Event received (Custom Refresh):', event.type, event.detail);
      
      // Always process events, even if schools not loaded yet
      const { newTestimonial, schoolId, rating, action, deletedRating } = event.detail || {};
      
      console.log('SchoolsSection: Processing event:', { schoolId, rating, action, deletedRating });
      
      // Handle DELETION
      if (action === 'delete' && schoolId && deletedRating) {
        console.log('SchoolsSection: DELETION EVENT DETECTED - Processing...');
          
          // Use callback to get fresh state
          setSchoolRatings(currentRatings => {
            // Debug log to track the issue
            console.log(`DELETE EVENT RECEIVED (Custom Refresh):`, { schoolId, deletedRating, currentRatings });
            
            // Get current rating or use defaults
            const currentRating = currentRatings[schoolId] || { averageRating: '0.0', ratingCount: 0 };
            const currentCount = currentRating.ratingCount || 0;
            const currentAverage = parseFloat(currentRating.averageRating) || 0;
            
            console.log(`INSTANT DELETE (Custom Refresh): School ${schoolId}, Current: ${currentAverage}, Count: ${currentCount}, Deleted rating: ${deletedRating}`);
            
            // Calculate new average after deletion
            if (currentCount <= 1) {
              // No reviews left, reset to 0
              console.log(`INSTANT DELETE CALC (Custom Refresh): Resetting to 0.0 stars (0 reviews)`);
              
              // Return updated state (still within callback)
              const newState = {
                ...currentRatings,
                [schoolId]: {
                  averageRating: '0.0',
                  ratingCount: 0
                }
              };
              
              // Mark that we made an instant update
              setLastInstantUpdate(Date.now());
              
              // Clear cache to prevent override
              dataCacheService.clear('school_ratings_full');
              
              return newState;
            } else {
              // Calculate: (oldTotal - deletedRating) / (oldCount - 1)
              const newTotal = (currentAverage * currentCount) - deletedRating;
              const newCount = currentCount - 1;
              const newAverage = newTotal / newCount;
                
              console.log(`INSTANT DELETE CALC (Custom Refresh): ${newAverage.toFixed(1)} stars (${newCount} reviews)`);
              
              // Return updated state (still within callback)
              const newState = {
                ...currentRatings,
                [schoolId]: {
                  averageRating: newAverage.toFixed(1),
                  ratingCount: newCount
                }
              };
              
              // Mark that we made an instant update
              setLastInstantUpdate(Date.now());
              
              // Clear cache to prevent override
              dataCacheService.clear('school_ratings_full');
              
              return newState;
            }
          });
          
          // Skip background refresh for deletions too
          return;
        }
        
        // Handle ADDITION/UPDATE (existing logic)
        if (schoolId && rating && action !== 'delete') {
          
          // Use callback to get fresh state
          setSchoolRatings(currentRatings => {
            // Debug log to track the issue
            console.log(`ADD EVENT RECEIVED:`, { schoolId, rating, currentRatings });
            
            // Get current rating or use defaults
            const currentRating = currentRatings[schoolId] || { averageRating: '0.0', ratingCount: 0 };
            const currentCount = currentRating.ratingCount || 0;
            const currentAverage = parseFloat(currentRating.averageRating) || 0;
            
            console.log(`INSTANT ADD: School ${schoolId}, Current: ${currentAverage}, Count: ${currentCount}, New rating: ${rating}`);
            
            // Calculate new average: (oldTotal + newRating) / (oldCount + 1)
            const newTotal = (currentAverage * currentCount) + rating;
            const newCount = currentCount + 1;
            const newAverage = newTotal / newCount;
            
            console.log(`INSTANT ADD CALC: ${newAverage.toFixed(1)} stars (${newCount} reviews)`);
            
            // Return updated state (still within callback)
            const newState = {
              ...currentRatings,
              [schoolId]: {
                averageRating: newAverage.toFixed(1),
                ratingCount: newCount
              }
            };
            
            // Mark that we made an instant update
            setLastInstantUpdate(Date.now());
            
            // Clear cache to prevent override
            dataCacheService.clear('school_ratings_full');
            
            return newState;
          });
          
          // Skip background refresh for instant updates
          return;
        }
        
      // Force fresh data by clearing caches IMMEDIATELY
      dataCacheService.clear('testimonials');
      dataCacheService.clearByPattern('testimonials_school_');
      
      // Fetch fresh ratings IMMEDIATELY (no delay)
      fetchRatings();
    };
    
    window.addEventListener('futureu_testimonials_updated', handleCustomRefresh);
    
    // Add a simple test listener to verify events are being received
    const testListener = (event) => {
      console.log('TEST LISTENER: Event received:', event.type, event.detail);
    };
    window.addEventListener('futureu_testimonials_updated', testListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('futureu_testimonials_updated', handleCustomRefresh);
      window.removeEventListener('futureu_testimonials_updated', testListener);
    };
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