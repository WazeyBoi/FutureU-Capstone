import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const VirtualCampusToursPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [school, setSchool] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [filteredCampuses, setFilteredCampuses] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [realSchoolData, setRealSchoolData] = useState({});
  const [apiSchools, setApiSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Animation variants - simplified for smoother animations
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 70, 
        damping: 15 
      } 
    },
    hover: { 
      y: -5, 
      boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  // Map school names as they might appear in the API to the names in our current data
  // This helps match schools from the API to our existing video data
  const schoolNameMapping = {
    "Cebu Institute of Technology - University": ["CIT", "CIT-U", "Cebu Institute of Technology"],
    "University of San Jose - Recoletos": ["USJ-R", "San Jose Recoletos"],
    "Southwestern University - PHINMA": ["SWU", "Southwestern University"],
    "University of San Carlos": ["USC", "San Carlos"],
    "University of the Visayas - Main Campus": ["UV", "University of the Visayas"],
    "Cebu Doctors' University": ["CDU", "Cebu Doctors"],
    "Cebu Technological University": ["CTU", "Cebu Tech"],
    "Indiana Aerospace University": ["IAU", "Indiana Aerospace"],
    "Cebu Normal University": ["CNU", "Normal University"],
  };

  const campuses = [
    {
      name: "Cebu Institute of Technology - University",
      description:
        "Our main campus offers state-of-the-art facilities and a vibrant student community.",
      video: "https://drive.google.com/file/d/1M_HWOUz4Z-UIkJMWhuxbFOpnlfVXKLn7/preview", // Updated embed link
      location: "Cebu",
      schoolType: "Private",
      featured: true,
    },
    {
      name: "University of San Jose - Recoletos",
      description:
        "The University of San Jose - Recoletos is known for its rich history and academic excellence.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fusjr.official%2Fvideos%2F358279392604079%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "Southwestern University - PHINMA",
      description:
        "Southwestern University - PHINMA is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fswuphinma%2Fvideos%2F1186881652309815%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
      featured: true,
    },
    {
      name: "University of San Carlos",
      description:
        "University of San Carlos is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fusccebu%2Fvideos%2F668876398463718%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "University of the Visayas - Main Campus",
      description:
        "University of the Visayas - Main Campus is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Funiversityofthevisayascebu%2Fvideos%2F1700673043796685%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "University of the Visayas - Main Campus",
      description:
        "University of the Visayas - Main Campus is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Funiversityofthevisayascebu%2Fvideos%2F975038627400028%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "Cebu Doctors' University",
      description: "Cebu Doctors' University is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fcebudoctorsuniversityofficial%2Fvideos%2F583647479816850%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "Cebu Doctors' University",
      description: "Cebu Doctors' University is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fcebudoctorsuniversityofficial%2Fvideos%2F468438925081437%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "Cebu Technological University",
      description: "Cebu Technological University is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fctu.premier%2Fvideos%2F609134661314472%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Public",
      featured: true,
    },
    {
      name: "Indiana Aerospace University",
      description: "Indiana Aerospace University is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2FIndianaAeroUniv%2Fvideos%2F601543727175461%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Private",
    },
    {
      name: "Cebu Normal University",
      description: "Cebu Normal University is a leading institution in Cebu, offering a wide range of programs.",
      video: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fweb.facebook.com%2Fcebunormaluniversityofficial%2Fvideos%2F364001561712089%2F&show_text=false&width=560&t=0",
      location: "Cebu",
      schoolType: "Public",
    },
    // Add more campuses here...
  ];

  // Helper function to find a matching school name across different formats
  const findMatchingSchool = (apiSchoolName) => {
    for (const [displayName, alternativeNames] of Object.entries(schoolNameMapping)) {
      if (
        displayName.toLowerCase().includes(apiSchoolName.toLowerCase()) ||
        alternativeNames.some(alt => apiSchoolName.toLowerCase().includes(alt.toLowerCase()))
      ) {
        return displayName;
      }
    }
    return null;
  };

  // Fetch school metadata from API
  useEffect(() => {
    const fetchSchoolData = async () => {
      setIsLoading(true);
      try {
        // First try the getAllSchools endpoint
        const response = await axios.get('/api/school/getAllSchools');
        console.log("API Response:", response.data);
        
        setApiSchools(response.data);
        
        // Create a map of school name to school metadata
        const schoolMap = {};
        
        response.data.forEach(school => {
          // Debug each school object
          console.log("Processing school:", school);
          
          // The API might return school data in different formats
          // Let's check the possible property names
          const schoolName = school.schoolName || school.name || "";
          const schoolLocation = school.location || school.address || "";
          const schoolType = school.schoolType || school.type || "";
          const schoolDescription = school.description || school.about || "";
          
          console.log(`School data: Name=${schoolName}, Location=${schoolLocation}, Type=${schoolType}`);
          
          // Try to match this school to our existing data
          const matchedName = findMatchingSchool(schoolName) || schoolName;
          
          if (matchedName) {
            schoolMap[matchedName] = {
              location: schoolLocation,
              schoolType: schoolType,
              description: schoolDescription
            };
            
            console.log(`Matched school ${schoolName} to ${matchedName}`);
          }
        });
        
        console.log("Final school mapping:", schoolMap);
        setRealSchoolData(schoolMap);
      } catch (error) {
        console.error("Error fetching from getAllSchools:", error);
        
        // If the first endpoint fails, try another one
        try {
          const response = await axios.get('/api/school/test');
          console.log("API Test Response:", response.data);
          
          // If we can reach the test endpoint but not the data, there might be other issues
          alert("Connected to API but couldn't retrieve school data. Check console for details.");
        } catch (fallbackError) {
          console.error("Error fetching from test endpoint:", fallbackError);
          alert("Could not connect to school API. Using default data instead.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchoolData();
  }, []);

  // Initialize the filtered campuses with all campuses when component mounts
  useEffect(() => {
    // Sort alphabetically
    const sortedCampuses = [...campuses].sort((a, b) => a.name.localeCompare(b.name));
    setFilteredCampuses(sortedCampuses);
  }, []);

  // Update campus data with real metadata if available
  const enhancedCampuses = campuses.map(campus => {
    const realData = realSchoolData[campus.name];
    
    if (realData) {
      console.log(`Enhancing ${campus.name} with real data:`, realData);
      
      return {
        ...campus,
        location: realData.location || campus.location,
        schoolType: realData.schoolType || campus.schoolType,
        description: realData.description || campus.description
      };
    }
    return campus;
  });

  // Log the enhanced campuses for debugging
  useEffect(() => {
    console.log("Enhanced campuses with real data:", enhancedCampuses);
  }, [realSchoolData]);

  useEffect(() => {
    // Filter campuses based on search query and selected filters
    const filtered = enhancedCampuses.filter(
      (campus) =>
        (searchQuery ? campus.name.toLowerCase().includes(searchQuery.toLowerCase()) : true) &&
        (school ? campus.name === school : true) &&
        (schoolType ? campus.schoolType === schoolType : true)
    );
    
    // Sort the filtered campuses alphabetically by name
    const sortedFiltered = [...filtered].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    setFilteredCampuses(sortedFiltered);
  }, [searchQuery, school, schoolType, realSchoolData, enhancedCampuses]);

  const handleReset = () => {
    setSchool("");
    setSchoolType("");
    setSearchQuery("");
  };

  // Check if any featured schools match the search query
  const hasFeaturedResults = searchQuery && filteredCampuses.some(campus => campus.featured);

  // Render function for campus cards to avoid duplication
  const renderCampusCard = (campus, index) => (
    <motion.div
      key={`${campus.name}-${index}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ 
        delay: index * 0.05,
        duration: 0.3
      }}
      className="bg-white rounded-xl overflow-hidden shadow-[rgba(0,0,0,0.08)_0px_8px_24px] border border-gray-100 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <iframe
          className="w-full h-full"
          src={campus.video}
          title={campus.name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        
        {campus.featured && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute top-3 right-3 bg-amber-400 text-xs font-bold px-3 py-1 rounded-full text-black shadow-md"
          >
            FEATURED
          </motion.div>
        )}
      </div>
      
      <div className="p-5 text-left">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {campus.name}
        </h3>
        
        <div className="flex items-center space-x-3 mt-3">
          <div className="flex items-center text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {campus.location}
          </div>
          <div className="text-sm text-gray-400">•</div>
          <div className="flex items-center text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {campus.schoolType}
          </div>
        </div>
        
        <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">
            {campus.description}
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Wave */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 text-white relative"
      >
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-4xl font-bold mb-4 tracking-tight"
          >
            Virtual Campus Tours
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-xl max-w-3xl mx-auto text-gray-200"
          >
            Experience the campus environment. Explore facilities,
            classrooms, and student spaces through our immersive virtual tours.
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative max-w-2xl mx-auto mt-10"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a school or campus..."
              className="w-full py-3 px-12 rounded-full shadow-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer" 
                onClick={() => setSearchQuery('')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        </div>
        
        {/* Wave Shape */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L80,106.7C160,117,320,139,480,138.7C640,139,800,117,960,96C1120,75,1280,53,1360,42.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </motion.div>

      {/* Main Content - Conditionally show search results or featured tours */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="py-12 max-w-7xl mx-auto px-4"
      >
        <AnimatePresence mode="wait">
          {searchQuery ? (
            /* Search Results Section */
            <motion.div
              key="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-10"
              >
                <h2 className="text-3xl font-bold text-gray-800 relative inline-block">
                  Search Results
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-amber-400 rounded-full"></span>
                </h2>
                <p className="mt-6 text-gray-600">
                  Showing results for "{searchQuery}"
                </p>
              </motion.div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"
                  ></motion.div>
                  <span className="ml-3 text-gray-600">Loading school data...</span>
                </div>
              ) : filteredCampuses.length > 0 ? (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredCampuses.map((campus, index) => (
                    renderCampusCard(campus, index)
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-16"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-4 text-xl font-medium text-gray-600">
                    No schools found matching "{searchQuery}"
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Try adjusting your search terms or filters
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset} 
                    className="mt-6 px-4 py-2 bg-amber-400 hover:bg-amber-500 rounded-lg text-black font-medium transition-colors"
                  >
                    Clear Search
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Featured Campus Tours (when no search) */
            <motion.div
              key="featured-tours"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-10"
              >
                <h2 className="text-3xl font-bold text-gray-800 relative inline-block">
                  Featured Campus Tours
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-amber-400 rounded-full"></span>
                </h2>
                <p className="mt-6 text-gray-600">
                  Explore our most popular virtual campus experiences
                </p>
              </motion.div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"
                  ></motion.div>
                  <span className="ml-3 text-gray-600">Loading school data...</span>
                </div>
              ) : (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {enhancedCampuses
                    .filter(campus => campus.featured)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .slice(0, 3)
                    .map((campus, index) => (
                      renderCampusCard(campus, index)
                    ))}
                </motion.div>
              )}
          
              {/* All Campus Tours */}
              <motion.div 
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                className="mt-16"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 border-b-4 border-amber-400 pb-1 inline-block">
                      All Campus Tours
                    </h2>
                  </div>
                  
                  <div className="flex items-center mt-4 md:mt-0">
                    <p className="text-sm text-gray-600 mr-4">Showing {filteredCampuses.length} campus tours</p>
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowFilters(!showFilters)} 
                      className="flex items-center space-x-1 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:border-amber-400 hover:shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span>Filter Options</span>
                      <motion.svg 
                        animate={{ rotate: showFilters ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </motion.svg>
                    </motion.button>
                  </div>
                </div>
                
                {/* Filter options panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white p-6 rounded-lg shadow-md mb-8 overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-end justify-between">
                        <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
                          <div className="w-64">
                            <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                              School
                            </label>
                            <select
                              id="school"
                              value={school}
                              onChange={(e) => setSchool(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm transition-all duration-300"
                            >
                              <option value="">All Schools</option>
                              {enhancedCampuses
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((campus, index) => (
                                  <option key={index} value={campus.name}>
                                    {campus.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div className="w-64">
                            <label htmlFor="schoolType" className="block text-sm font-medium text-gray-700">
                              School Type
                            </label>
                            <select
                              id="schoolType"
                              value={schoolType}
                              onChange={(e) => setSchoolType(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm transition-all duration-300"
                            >
                              <option value="">All School Types</option>
                              <option value="Public">Public</option>
                              <option value="Private">Private</option>
                            </select>
                          </div>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleReset}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all duration-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reset Filters
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"
                    ></motion.div>
                    <span className="ml-3 text-gray-600">Loading school data...</span>
                  </div>
                ) : (
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredCampuses
                      .map((campus, index) => (
                        renderCampusCard(campus, index)
                      ))}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VirtualCampusToursPage;

