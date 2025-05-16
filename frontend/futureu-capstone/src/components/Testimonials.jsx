import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import TestimonialCard from './testimonials/TestimonialCard';
import SchoolFilter from './testimonials/SchoolFilter';
import TestimonialHero from './testimonials/TestimonialHero';
import TestimonialForm from './testimonials/TestimonialForm';
import SchoolsSection from './testimonials/SchoolsSection';
import { FaSearch, FaFilter, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { getAllTestimonials, deleteTestimonial } from '../services/testimonialService';

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
  
  // Simulating user authentication
  const [currentUser] = useState({
    id: 1,
    name: 'Current User'
  });

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
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        // Fallback to mock data if API fails
        // ... your existing mock data ...
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
      filtered = filtered.filter(testimonial => 
        testimonial.schoolId.toString() === selectedSchool
      );
      
      // Find the name of the selected school for display
      const school = schools.find(s => s.schoolId.toString() === selectedSchool);
      setSelectedSchoolName(school ? (school.schoolName || school.name) : '');
    } else {
      setSelectedSchoolName('');
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(testimonial => 
        testimonial.name.toLowerCase().includes(query) ||
        testimonial.schoolName.toLowerCase().includes(query) ||
        testimonial.program.toLowerCase().includes(query) ||
        testimonial.quote.toLowerCase().includes(query)
      );
    }

    setFilteredTestimonials(filtered);
  }, [selectedSchool, searchQuery, testimonials, schools]);

  const handleAddReview = (schoolId) => {
    // If schoolId is provided, preselect the school in the form
    if (schoolId) {
      setTestimonialToEdit({
        ...testimonialToEdit,
        schoolId: schoolId
      });
    } else {
      setTestimonialToEdit(null);
    }
    setIsFormOpen(true);
  };

  const handleEditTestimonial = (testimonial) => {
    setTestimonialToEdit(testimonial);
    setIsFormOpen(true);
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    try {
      await deleteTestimonial(testimonialId);
      // Remove the testimonial from the state upon successful deletion
      setTestimonials(prev => prev.filter(t => t.id !== testimonialId));
      setFilteredTestimonials(prev => prev.filter(t => t.id !== testimonialId));
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const handleSubmitTestimonial = (formData) => {
    // In a real app, this would be handled by the backend
    const newTestimonial = {
      ...formData,
      // If editing an existing testimonial, keep its ID; otherwise, generate a new one
      id: formData.id || testimonials.length + 1,
      // Add the userId from the current user
      userId: currentUser.id,
      // Add the school name
      schoolName: schools.find(s => s.schoolId.toString() === formData.schoolId.toString())?.schoolName || ''
    };

    if (formData.id) {
      // Updating an existing testimonial
      setTestimonials(prev => 
        prev.map(t => t.id === formData.id ? newTestimonial : t)
      );
    } else {
      // Adding a new testimonial
      setTestimonials(prev => [...prev, newTestimonial]);
    }
  };

  const handleSelectSchool = (schoolId) => {
    setSelectedSchool(schoolId.toString());
    setView('testimonials');
  };

  const handleBackToSchools = () => {
    setView('schools');
    setSelectedSchool('all');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <TestimonialHero />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {view === 'schools' ? (
          <SchoolsSection 
            schools={schools} 
            onSelectSchool={handleSelectSchool}
            onAddReview={handleAddReview}
          />
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

            {/* Search and Filter Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-1/2 relative">
                  <input
                    type="text"
                    placeholder="Search testimonials..."
                    className="w-full py-3 px-12 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                  filteredTestimonials.map((testimonial) => (
                    <TestimonialCard 
                      key={testimonial.id} 
                      testimonial={testimonial}
                      isUserOwned={testimonial.userId === currentUser.id}
                      onEdit={handleEditTestimonial}
                      onDelete={handleDeleteTestimonial}
                    />
                  ))
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