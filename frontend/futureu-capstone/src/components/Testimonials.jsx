import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import TestimonialCard from './testimonials/TestimonialCard';
import SchoolFilter from './testimonials/SchoolFilter';
import TestimonialHero from './testimonials/TestimonialHero';
import TestimonialForm from './testimonials/TestimonialForm';
import SchoolsSection from './testimonials/SchoolsSection';
import { FaSearch, FaFilter, FaArrowLeft, FaPlus, FaTimes, FaStar } from 'react-icons/fa';
import { getAllTestimonials, getTestimonialsBySchool, deleteTestimonial, createTestimonial, updateTestimonial } from '../services/testimonialService';
import authService from '../services/authService';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Testimonials = () => {
  const [view, setView] = useState('schools'); // 'schools' or 'testimonials'
  const [schools, setSchools] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedSchoolName, setSelectedSchoolName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [testimonialToEdit, setTestimonialToEdit] = useState(null);
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const [schoolTestimonialCounts, setSchoolTestimonialCounts] = useState({});
  
  // Get current user from auth service
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get the authenticated user
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Fetch schools from the API
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get('/api/school/getAllSchools');
        setSchools(response.data);
      } catch (error) {
        console.error('Error fetching schools:', error);
        // Fallback with some mock data in case the API fails
        setSchools([
          { schoolId: 1, schoolName: "Cebu Institute of Technology - University" },
          { schoolId: 2, schoolName: "University of San Jose - Recoletos" },
          { schoolId: 3, schoolName: "Southwestern University - PHINMA" },
          { schoolId: 4, schoolName: "University of San Carlos" },
          { schoolId: 5, schoolName: "University of the Visayas - Main Campus" },
          { schoolId: 6, schoolName: "Cebu Doctors' University" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  // Fetch testimonials using the service
  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const response = await getAllTestimonials();
        setTestimonials(response.data);
        setFilteredTestimonials(response.data);
        
        // Calculate testimonial counts per school
        const counts = {};
        response.data.forEach(testimonial => {
          const schoolId = testimonial.schoolId || 
                         (testimonial.school && testimonial.school.schoolId);
          
          if (schoolId) {
            counts[schoolId] = (counts[schoolId] || 0) + 1;
          }
        });
        setSchoolTestimonialCounts(counts);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        // Fallback to mock data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Filter testimonials based on selected school and search query
  useEffect(() => {
    let filtered = testimonials;

    if (selectedSchool !== 'all') {
      filtered = filtered.filter(testimonial => {
        // Handle both formats: direct schoolId or nested school.schoolId
        const testimonialSchoolId = testimonial.schoolId || 
                                 (testimonial.school && testimonial.school.schoolId);
        return testimonialSchoolId && testimonialSchoolId.toString() === selectedSchool;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(testimonial => {
        const schoolName = testimonial.schoolName || 
                         (testimonial.school && (testimonial.school.schoolName || testimonial.school.name)) || 
                         '';
        const description = testimonial.description || testimonial.quote || '';
        
        return description.toLowerCase().includes(query) || 
               schoolName.toLowerCase().includes(query);
      });
    }

    setFilteredTestimonials(filtered);
  }, [selectedSchool, searchQuery, testimonials]);

  // Update school suggestions when search query changes
  useEffect(() => {
    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase();
      const matchingSchools = schools.filter(
        school => (school.schoolName || school.name || "").toLowerCase().includes(query)
      );
      setSchoolSuggestions(matchingSchools.slice(0, 5)); // Limit to 5 suggestions
      setShowSuggestions(true);
    } else {
      setSchoolSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, schools]);

  // Handle click outside of search suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchRef]);

  const handleAddReview = (schoolId) => {
    // Check if user is logged in
    if (!currentUser) {
      alert('Please log in to add a review.');
      return;
    }
    
    // If schoolId is provided, preselect the school in the form
    if (schoolId) {
      // Create a new form data object, explicitly without testimonyId to indicate this is a new review
      setTestimonialToEdit({
        schoolId: schoolId,
        isNewTestimonial: true // Flag to indicate this is a new review, not an edit
      });
    } else {
      setTestimonialToEdit(null);
    }
    setIsFormOpen(true);
  };

  const handleEditTestimonial = (testimonial) => {
    // Check if user is logged in and is the owner of the testimonial
    if (!currentUser) {
      alert('Please log in to edit your review.');
      return;
    }
    
    // Check if the current user is the owner of this testimonial
    const testimonialUserId = testimonial.userId || 
                             (testimonial.student && testimonial.student.userId);
                             
    if (testimonialUserId && testimonialUserId !== currentUser.id) {
      alert('You can only edit your own reviews.');
      return;
    }
    
    setTestimonialToEdit(testimonial);
    setIsFormOpen(true);
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    // Check if user is logged in
    if (!currentUser) {
      alert('Please log in to delete a review.');
      return;
    }
    
    try {
      await deleteTestimonial(testimonialId);
      
      // Find the school ID of the deleted testimonial
      const deletedTestimonial = testimonials.find(t => {
        const id = t.id || t.testimonyId;
        return id === testimonialId;
      });
      
      if (deletedTestimonial) {
        const schoolId = deletedTestimonial.schoolId || 
                       (deletedTestimonial.school && deletedTestimonial.school.schoolId);
                       
        if (schoolId) {
          // Update count for this school
          setSchoolTestimonialCounts(prev => ({
            ...prev,
            [schoolId]: Math.max(0, (prev[schoolId] || 0) - 1)
          }));
        }
      }
      
      // Remove the testimonial from the state upon successful deletion
      setTestimonials(prev => prev.filter(t => {
        // Handle both formats: direct id or testimonyId
        const id = t.id || t.testimonyId;
        return id !== testimonialId;
      }));
      setFilteredTestimonials(prev => prev.filter(t => {
        const id = t.id || t.testimonyId;
        return id !== testimonialId;
      }));
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      // Show the specific error message from the backend if available
      alert(error.message || 'Failed to delete the testimonial. Please try again.');
    }
  };

  const handleSelectSchool = (schoolId) => {
    setSelectedSchool(schoolId.toString());
    setView('testimonials');
    setLoading(true);
    
    // Find the name of the selected school for display
    const selectedSchool = schools.find(s => s.schoolId && s.schoolId.toString() === schoolId.toString());
    console.log('Selected school:', selectedSchool);
    setSelectedSchoolName(selectedSchool ? (selectedSchool.name || selectedSchool.schoolName) : '');
    
    // Fetch testimonials specifically for this school
    getTestimonialsBySchool(schoolId)
      .then(response => {
        console.log('School testimonials response:', response.data);
        setFilteredTestimonials(response.data);
      })
      .catch(error => {
        console.error(`Error fetching testimonials for school ID ${schoolId}:`, error);
        setFilteredTestimonials([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSchoolSuggestionClick = (schoolId) => {
    setSearchQuery('');
    setShowSuggestions(false);
    handleSelectSchool(schoolId);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleBackToSchools = () => {
    setView('schools');
    setSelectedSchool('all');
    
    // Refresh all testimonials when going back to schools view
    getAllTestimonials()
      .then(response => {
        if (response && response.data) {
          setTestimonials(response.data);
          setFilteredTestimonials(response.data);
        }
      })
      .catch(error => {
        console.error('Error refreshing testimonials:', error);
      });
  };

  const handleSubmitTestimonial = async (formData) => {
    try {
      // The form data should already include the necessary school and student references
      
      let updatedTestimonial;
      if (formData.testimonyId) {
        // Update existing testimonial
        try {
          const response = await updateTestimonial(formData.testimonyId, formData);
          updatedTestimonial = response.data;
          
          // If API call was successful, update the local state
          setTestimonials(prev => prev.map(t => 
            (t.testimonyId === updatedTestimonial.testimonyId) ? updatedTestimonial : t
          ));
        } catch (error) {
          console.error('Error updating testimonial:', error);
          // Show the specific error message from the backend if available
          alert(error.message || 'Failed to update your review. Please try again.');
          return; // Stop execution on error
        }
      } else {
        // Create new testimonial
        try {
          const response = await createTestimonial(formData);
          // Just add new testimonial to state if successful
          if (response && response.data) {
            setTestimonials(prev => [...prev, response.data]);
            
            // Update count for this school
            const schoolId = formData.schoolId || 
                           (formData.school && formData.school.schoolId);
                           
            if (schoolId) {
              setSchoolTestimonialCounts(prev => ({
                ...prev,
                [schoolId]: (prev[schoolId] || 0) + 1
              }));
            }
          }
        } catch (error) {
          console.error('Error creating testimonial:', error);
          // Show the specific error message from the backend if available
          alert(error.message || 'Failed to submit your review. Please try again.');
          return; // Stop execution if there's an error
        }
      }
      
      // Refresh testimonials from server to get the complete data
      try {
        // If we're viewing a specific school's testimonials, refresh that specific view
        if (selectedSchool !== 'all') {
          const response = await getTestimonialsBySchool(parseInt(selectedSchool));
          if (response && response.data) {
            setFilteredTestimonials(response.data);
          }
        } else {
          // Otherwise refresh all testimonials
          const response = await getAllTestimonials();
          if (response && response.data) {
            setTestimonials(response.data);
            setFilteredTestimonials(response.data);
          }
        }
      } catch (refreshError) {
        // Just log the refresh error but don't show it to the user
        // since the primary operation already succeeded
        console.error('Error refreshing testimonial list:', refreshError);
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      // Show the specific error message from the backend if available
      alert(error.message || 'Failed to submit your review. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative">
      <TestimonialHero />
        
        {/* Prominent Search Bar - Overlay on Hero */}
        {view === 'schools' && (
          <div className="absolute bottom-0 left-0 right-0 transform z-20">
            <div className="max-w-3xl mx-auto px-4">
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search for a school or campus..."
                  className="w-full py-3.5 px-14 rounded-full border-0 focus:ring-2 focus:ring-blue-300 shadow-lg transition-all bg-white text-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  style={{ fontSize: '16px' }}
                />
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
                
                {/* School suggestions dropdown */}
                {showSuggestions && schoolSuggestions.length > 0 && (
                  <div className="absolute z-40 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                    <ul>
                      {schoolSuggestions.map(school => (
                        <li 
                          key={school.schoolId} 
                          className="px-5 py-3 hover:bg-gray-100 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSchoolSuggestionClick(school.schoolId)}
                        >
                          {school.schoolName || school.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {searchQuery && schoolSuggestions.length === 0 && (
                <div className="bg-white mt-1 p-3 rounded-lg shadow-lg border border-gray-200 z-40 relative">
                  <p className="text-gray-600 text-center">No schools found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`container mx-auto px-4 ${view === 'schools' ? 'pt-12' : 'pt-12'} pb-12`}>
        {view === 'schools' ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mb-6"
          >
          <SchoolsSection 
            schools={schools} 
            onSelectSchool={handleSelectSchool}
            onAddReview={handleAddReview}
              searchQuery={searchQuery}
              schoolTestimonialCounts={schoolTestimonialCounts}
          />
          </motion.div>
        ) : (
          <div>
            {/* Back button and school name */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={handleBackToSchools}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                <span>Back to Schools</span>
              </button>
              
              {selectedSchoolName && (
                <h2 className="text-2xl font-bold text-gray-800">{selectedSchoolName}</h2>
              )}
              
              <button
                onClick={() => handleAddReview(selectedSchool !== 'all' ? parseInt(selectedSchool) : null)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                <FaPlus size={14} />
                <span>Add Review</span>
              </button>
            </div>

            {/* School Header with Background Image */}
            {selectedSchool !== 'all' && (
              <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
                <div className="h-64 relative">
                  {/* Background Image with Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.7)]"></div>
                  
                  {(() => {
                    // Find the selected school
                    const school = schools.find(s => s.schoolId.toString() === selectedSchool);
                    const schoolName = school ? (school.schoolName || school.name) : '';
                    
                    // Get school background using the function from SchoolsSection
                    const getSchoolBackground = (name) => {
                      if (!name) return null;
                      
                      const normalizedName = name.toLowerCase();
                      const schoolMappings = {
                        "cebu institute of technology": "/src/assets/school_images/citu_school_image.jpg",
                        "cebu doctors": "/src/assets/school_images/cdu_school_image.jpg",
                        "cebu normal university": "/src/assets/school_images/cnu_school_image.jpg",
                        "cebu technological university": "/src/assets/school_images/ctu_school_image.jpg",
                        "southwestern university": "/src/assets/school_images/swu_school_image.jpg",
                        "university of san carlos": "/src/assets/school_images/usc_school_image.jpg",
                        "university of san jose": "/src/assets/school_images/usjr_school_image.jpg",
                        "university of the philippines": "/src/assets/school_images/up_school_image.jpg",
                        "university of cebu": "/src/assets/school_images/uc_school_image.jpg",
                        "university of the visayas": "/src/assets/school_images/uv_school_image.jpg",
                        "indiana aerospace university": "/src/assets/school_images/iau_school_image.jpg"
                      };
                      
                      for (const [key, bgImage] of Object.entries(schoolMappings)) {
                        if (normalizedName.includes(key)) {
                          return bgImage;
                        }
                      }
                      
                      return null;
                    };
                    
                    const bgImage = getSchoolBackground(schoolName);
                    
                    if (bgImage) {
                      return (
                        <img 
                          src={bgImage}
                          alt={`${schoolName} campus`}
                          className="w-full h-full object-cover"
                        />
                      );
                    } else {
                      return (
                        <div className="w-full h-full bg-gradient-to-r from-[#2B3E4E] to-[#1b2d3d]"></div>
                      );
                    }
                  })()}
                  
                  {/* School Logo and Info Overlay */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-6 flex items-center">
                      <div className="bg-white rounded-full p-4 shadow-lg mr-6">
                        {(() => {
                          // Find the selected school
                          const school = schools.find(s => s.schoolId.toString() === selectedSchool);
                          const schoolName = school ? (school.schoolName || school.name) : '';
                          
                          // Get school logo using school name
                          const getSchoolLogo = (name) => {
                            if (!name) return null;
                            
                            const normalizedName = name.toLowerCase();
                            const logoMappings = {
                              "cebu institute of technology": "citu_school_logo",
                              "cebu doctors": "cdu_school_logo",
                              "cebu normal university": "cnu_school_logo",
                              "cebu technological university": "ctu_school_logo",
                              "southwestern university": "swu_school_logo",
                              "university of san carlos": "usc_school_logo",
                              "university of san jose": "usjr_school_logo",
                              "university of the philippines": "up_school_logo",
                              "university of cebu": "uc_school_logo",
                              "university of the visayas": "uv_school_logo",
                              "indiana aerospace university": "iau_school_logo"
                            };
                            
                            for (const [key, logoName] of Object.entries(logoMappings)) {
                              if (normalizedName.includes(key)) {
                                return `/src/assets/school_logos/${logoName}.png`;
                              }
                            }
                            
                            return null;
                          };
                          
                          const logoImage = getSchoolLogo(schoolName);
                          
                          if (logoImage) {
                            return (
                              <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center">
                                <img 
                                  src={logoImage}
                                  alt={`${schoolName} logo`}
                                  className="w-[200%] h-[300%] object-scale-down transform scale-[2.1]"
                                />
                              </div>
                            );
                          } else {
                            // Fallback to initial if no logo is found
                            return (
                              <div className="w-24 h-24 flex items-center justify-center bg-[#2B3E4E] rounded-full text-white text-4xl font-bold">
                                {schoolName ? schoolName.charAt(0) : ''}
                              </div>
                            );
                          }
                        })()}
                      </div>
                      <div className="text-white">
                        <h1 className="text-4xl font-bold mb-2 text-shadow-md">{selectedSchoolName}</h1>
                        
                        {/* Average Rating Stars */}
                        <div className="flex items-center">
                          {(() => {
                            // Find reviews for this school
                            const schoolReviews = testimonials.filter(t => {
                              const schoolId = t.schoolId || (t.school && t.school.schoolId);
                              return schoolId && schoolId.toString() === selectedSchool;
                            });
                            
                            // Calculate average rating
                            let totalRating = 0;
                            let ratingCount = 0;
                            
                            schoolReviews.forEach(review => {
                              if (review.rating) {
                                totalRating += review.rating;
                                ratingCount++;
                              }
                            });
                            
                            const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;
                            
                            return (
                              <>
                                <div className="flex mr-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                      key={star}
                                      className="mr-1"
                                      size={20}
                                      color={star <= avgRating ? "#FFB71B" : "#e4e5e94d"}
                                    />
                                  ))}
                                </div>
                                <span className="font-semibold text-lg">
                                  {avgRating.toFixed(1)}
                                </span>
                                <span className="text-gray-200 ml-1">/ 5.0</span>
                                <span className="ml-4 text-gray-200">({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filter Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-1/2 relative">
                  <input
                    type="text"
                    placeholder="Search in testimonials..."
                    className="w-full py-3 px-12 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                <button
                  className="flex items-center gap-2 py-3 px-6 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter />
                  <span>Filters</span>
                </button>
              </div>

              {/* Filters */}
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 p-4 bg-white rounded-lg shadow-md"
                >
                  <SchoolFilter 
                    schools={schools} 
                    selectedSchool={selectedSchool}
                    setSelectedSchool={setSelectedSchool}
                  />
                </motion.div>
              )}
            </div>

            {/* Testimonials Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredTestimonials.length > 0 ? (
                  filteredTestimonials.map((testimonial) => {
                    // Check if the current user owns this testimonial
                    const testimonialUserId = testimonial.userId || 
                                            (testimonial.student && testimonial.student.userId);
                    const isUserOwned = currentUser && testimonialUserId === currentUser.id;
                    
                    return (
                    <TestimonialCard 
                        key={testimonial.id || testimonial.testimonyId} 
                      testimonial={testimonial}
                        isUserOwned={isUserOwned}
                      onEdit={handleEditTestimonial}
                      onDelete={handleDeleteTestimonial}
                    />
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-xl text-gray-600">No testimonials found matching your criteria.</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Testimonial Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <TestimonialForm 
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setTestimonialToEdit(null);
              
              // Refresh testimonials when closing the form
              if (selectedSchool !== 'all') {
                getTestimonialsBySchool(parseInt(selectedSchool))
                  .then(response => {
                    if (response && response.data) {
                      setFilteredTestimonials(response.data);
                    }
                  })
                  .catch(error => {
                    console.error(`Error refreshing testimonials for school ID ${selectedSchool}:`, error);
                  });
              } else {
                getAllTestimonials()
                  .then(response => {
                    if (response && response.data) {
                      setTestimonials(response.data);
                      setFilteredTestimonials(response.data);
                    }
                  })
                  .catch(error => {
                    console.error('Error refreshing testimonials:', error);
                  });
              }
            }}
            schools={schools}
            testimonialToEdit={testimonialToEdit}
            onSubmitSuccess={handleSubmitTestimonial}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Testimonials; 