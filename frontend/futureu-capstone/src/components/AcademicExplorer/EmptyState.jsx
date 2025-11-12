import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, School, Building, MapPin, ChevronRight, Users, Star, TrendingUp } from 'lucide-react';
import apiClient from '../../services/api';
import programService from '../../services/programService';
import schoolService from '../../services/schoolService';
import schoolProgramService from '../../services/schoolProgramService';
import { schoolLogos, schoolBuildings } from './constants';

// Helper function to get school building image
const getSchoolBuilding = (school) => {
  if (!school) return null;
  
  // Try by school ID first
  if (school.schoolId && schoolBuildings[school.schoolId]) {
    return schoolBuildings[school.schoolId];
  }
  
  // Try by school name (extract abbreviation)
  const schoolName = school.name.toUpperCase();
  for (const key of Object.keys(schoolBuildings)) {
    if (typeof key === 'string' && schoolName.includes(key)) {
      return schoolBuildings[key];
    }
  }
  
  return null;
};

// School-specific gradient styles for WordArt effect
const getSchoolGradient = (school) => {
  if (!school) return 'from-[#2B3E4E] to-[#1D63A1]'; // Default gradient
  
  const schoolName = school.name.toUpperCase();
  
  if (schoolName.includes('CDU')) {
    return 'from-blue-600 via-blue-500 to-blue-400'; // Blue gradient (removed white)
  }
  if (schoolName.includes('CTU')) {
    return 'from-[#F9A602] to-[#282828]'; // Orange and dark gray
  }
  if (schoolName.includes('CIT-U')) {
    return 'from-red-900 via-red-800 to-yellow-500'; // Maroon and gold
  }
  if (schoolName.includes('CNU')) {
    return 'from-red-700 via-red-600 to-yellow-500'; // Crimson and gold
  }
  if (schoolName.includes('UC')) {
    return 'from-blue-600 via-blue-500 to-yellow-400'; // Blue and yellow
  }
  if (schoolName.includes('USJR')) {
    return 'from-green-700 via-green-600 to-yellow-500'; // Green and gold
  }
  if (schoolName.includes('USC')) {
    return 'from-green-700 via-green-600 to-yellow-500'; // Green and gold
  }
  if (schoolName.includes('SWU')) {
    return 'from-red-900 via-red-700 to-red-600'; // Maroon gradient (removed white)
  }
  if (schoolName.includes('IAU')) {
    return 'from-blue-600 via-blue-500 to-blue-400'; // Blue gradient (removed white)
  }
  if (schoolName.includes('UP')) {
    return 'from-red-900 to-green-800'; // Maroon and forest green only
  }
  if (schoolName.includes('UV')) {
    return 'from-green-700 via-green-600 to-green-500'; // Green gradient (removed white)
  }
  
  return 'from-[#2B3E4E] to-[#1D63A1]'; // Default gradient
};

// Animation variants for empty state
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" 
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// New main empty state that displays programs and schools (without search header)
export const EmptyStateWithMascots = ({ 
  mascotWiggle, 
  onProgramSelect, 
  onSchoolSelect,
  searchMode = 'programs',
  searchTerm = '',
  currentPage = 1,
  setCurrentPage
}) => {
  const [programs, setPrograms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [schoolPrograms, setSchoolPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [programsData, schoolsData, schoolProgramsData] = await Promise.all([
          programService.getAllPrograms(),
          schoolService.getAllSchools(),
          schoolProgramService.getAllSchoolPrograms()
        ]);
        
        setPrograms(programsData || []);
        setSchools(schoolsData || []);
        setSchoolPrograms(schoolProgramsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setPrograms([]);
        setSchools([]);
        setSchoolPrograms([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function to get schools offering a program
  const getSchoolsForProgram = (programId) => {
    const programSchools = schoolPrograms.filter(sp => sp.program?.programId === programId);
    return programSchools.map(sp => sp.school).filter(Boolean);
  };

  // Helper function to get programs offered by a school
  const getProgramsForSchool = (schoolId) => {
    const schoolProgramsList = schoolPrograms.filter(sp => sp.school?.schoolId === schoolId);
    return schoolProgramsList.map(sp => sp.program).filter(Boolean);
  };

  // Filter data based on search term
  const filteredPrograms = useMemo(() => {
    if (!searchTerm) return programs;
    return programs.filter(program => 
      program.programName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [programs, searchTerm]);

  const filteredSchools = useMemo(() => {
    if (!searchTerm) return schools;
    return schools.filter(school => 
      school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [schools, searchTerm]);

  // Pagination logic
  const currentData = searchMode === 'programs' ? filteredPrograms : filteredSchools;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = currentData.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when switching modes or searching
  useEffect(() => {
    if (setCurrentPage) {
      setCurrentPage(1);
    }
  }, [searchMode, searchTerm, setCurrentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1D63A1]/5 via-white to-[#FFB71B]/5">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3E4E]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-[#1D63A1]/5 via-white to-[#FFB71B]/5 rounded-xl">
      <div className="container mx-auto px-6 py-8">

        {/* Enhanced Main Content */}
        <div className="bg-gradient-to-br from-white via-white to-gray-50/30 rounded-xl shadow-lg border border-gray-200 p-8 overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FFB71B]/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#2B3E4E]/5 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#2B3E4E] mb-2">
                  {searchMode === 'programs' ? '🎓 Academic Programs' : '🏫 Educational Institutions'}
                </h2>
                <p className="text-gray-600">
                  {searchMode === 'programs' 
                    ? 'Explore diverse academic programs available in Cebu' 
                    : 'Discover top schools and universities in your area'
                  }
                </p>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <div className="flex items-end justify-end gap-2">
                    <div className="text-3xl font-bold text-[#FFB71B]">{currentItems.length}</div>
                    <div className="text-lg font-semibold text-[#FFB71B] mb-1">
                      {searchMode === 'programs' ? 'programs' : 'schools'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">showing now</div>
                </div>
              </div>
            </div>

            {/* Enhanced Content Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={searchMode} // Force re-animation when mode changes
            >
              {searchMode === 'programs' ? (
                // Enhanced Programs Grid
                currentItems.map((program, index) => {
                  const offeringSchools = getSchoolsForProgram(program.programId);
                  return (
                    <motion.div
                      key={program.programId}
                      variants={itemVariants}
                      onClick={() => onProgramSelect && onProgramSelect(program.programId)}
                      className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl border-2 border-gray-100 p-5 
                               hover:shadow-xl hover:border-[#FFB71B] hover:-translate-y-1 
                               transition-all duration-300 cursor-pointer group relative hover:z-[10000] group-hover:z-[10000]"
                      whileHover={{ 
                        scale: 1.02, 
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Card Background Pattern */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#FFB71B]/10 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                      
                      <div className="relative z-10">
                        <div className="flex flex-col items-center text-center">
                          {/* Program Icon */}
                          <div className="w-16 h-16 bg-[#232D35] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                            <BookOpen className="w-8 h-8 text-[#FFB71B]" />
                          </div>
                          
                          {/* Program Name */}
                          <h4 className="font-bold text-[#2B3E4E] group-hover:text-[#1D63A1] transition-colors text-lg leading-tight mb-3">
                            {program.programName}
                          </h4>
                          
                          {/* Program Description */}
                          {program.description && (
                            <div className="mb-4">
                              <div className="flex items-center justify-center mb-2">
                                <div className="w-3 h-3 bg-[#FFB71B]/20 rounded flex items-center justify-center mr-2">
                                  <BookOpen className="w-1.5 h-1.5 text-[#FFB71B]" />
                                </div>
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Program Overview
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed text-justify line-clamp-4">
                                {program.description}
                              </p>
                            </div>
                          )}
                          
                          {/* School Logos Section */}
                          {offeringSchools.length > 0 && (
                            <div className="mt-auto">
                              <div className="text-xs text-gray-500 mb-3">Available at:</div>
                              <div className="flex flex-wrap gap-1.5 justify-center">
                                {offeringSchools.slice(0, 5).map((school, idx) => {
                                  const logoSize = offeringSchools.length > 6 ? 'w-9 h-9' : offeringSchools.length > 4 ? 'w-10 h-10' : 'w-12 h-12';
                                  const textSize = offeringSchools.length > 6 ? 'text-[10px]' : 'text-xs';
                                  
                                  return (
                                    <div
                                      key={idx}
                                      className="school-logo-container relative group/logo hover:z-[10001]"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {schoolLogos[school.schoolId] ? (
                                        <div className={`${logoSize} rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#FFB71B] transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md cursor-pointer`}>
                                          <img 
                                            src={schoolLogos[school.schoolId]} 
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                          <div 
                                            className={`w-full h-full bg-blue-100 text-blue-700 rounded-full flex items-center justify-center ${textSize} font-bold hidden`}
                                          >
                                            {school.name.substring(0, 2).toUpperCase()}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className={`${logoSize} bg-blue-100 text-blue-700 rounded-full flex items-center justify-center ${textSize} font-bold border-2 border-gray-200 hover:border-[#FFB71B] transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md cursor-pointer`}>
                                          {school.name.substring(0, 2).toUpperCase()}
                                        </div>
                                      )}
                                      
                                      {/* Tooltip - Smart positioning to prevent clipping */}
                                      <div className={`absolute bottom-full mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover/logo:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] ${
                                        idx === 0 ? 'left-0' : 
                                        idx === Math.min(4, offeringSchools.length - 1) ? 'right-0' : 
                                        'left-1/2 transform -translate-x-1/2'
                                      }`}>
                                        {school.name}
                                        <div className={`absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 ${
                                          idx === 0 ? 'left-4' : 
                                          idx === Math.min(4, offeringSchools.length - 1) ? 'right-4' : 
                                          'left-1/2 transform -translate-x-1/2'
                                        }`}></div>
                                      </div>
                                    </div>
                                  );
                                })}
                                {offeringSchools.length > 5 && (
                                  <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 hover:bg-[#FFB71B]/20 hover:border-[#FFB71B] transition-all duration-200 cursor-pointer">
                                    +{offeringSchools.length - 5}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                // Enhanced Schools Grid
                currentItems.map((school, index) => {
                  const offeredPrograms = getProgramsForSchool(school.schoolId);
                  const buildingImage = getSchoolBuilding(school);
                  return (
                    <motion.div
                      key={school.schoolId}
                      variants={itemVariants}
                      onClick={() => onSchoolSelect && onSchoolSelect(school)}
                      className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl border-2 border-gray-100 p-5 
                               hover:shadow-xl hover:border-[#FFB71B] hover:-translate-y-1 
                               transition-all duration-300 cursor-pointer group relative"
                      whileHover={{ 
                        scale: 1.02, 
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative z-10">
                        {/* Header Section - 2 Column Layout */}
                        <div className="grid grid-cols-2 gap-4 mb-4 min-h-[120px] relative">
                          {/* Left Column - Logo (Top) and Name (Bottom) */}
                          <div className="flex flex-col justify-between z-10 pr-2">
                            {/* School Logo - Circle Container */}
                            <div className="flex justify-center mb-3">
                              {schoolLogos[school.schoolId] ? (
                                <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-gray-200 hover:border-[#FFB71B] transition-all duration-300 hover:scale-110 shadow-lg bg-white">
                                  <img 
                                    src={schoolLogos[school.schoolId]} 
                                    alt={`${school.name} logo`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-[#1D63A1] via-[#2B3E4E] to-[#FFB71B] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  <Building className="h-8 w-8 text-white" />
                                </div>
                              )}
                            </div>
                            
                            {/* School Name with WordArt Gradient - Bottom */}
                            <div className="text-center">
                              <h3 className={`text-sm font-black bg-gradient-to-r ${getSchoolGradient(school)} bg-clip-text text-transparent 
                                           line-clamp-3 leading-tight tracking-wide hover:scale-105 transition-transform duration-300
                                           drop-shadow-sm font-serif`}
                                  style={{
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                                    fontWeight: '900',
                                    letterSpacing: '0.5px'
                                  }}>
                                {school.name}
                              </h3>
                            </div>
                          </div>
                          
                          {/* Right Column - School Building Image (Large & Overflowing) */}
                          <div className="relative -mr-5 -mt-2">
                            <div className="absolute inset-0 w-32 h-28 -right-8 -top-3 z-0">
                              {buildingImage ? (
                                <div 
                                  className="w-full h-full overflow-visible shadow-2xl group-hover:shadow-3xl transition-all duration-500"
                                  style={{
                                    transform: 'perspective(200px) rotateY(-25deg) rotateX(5deg)',
                                    transformStyle: 'preserve-3d'
                                  }}
                                >
                                  <img 
                                    src={buildingImage} 
                                    alt={`${school.name} building`}
                                    className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700 
                                             opacity-85 group-hover:opacity-100 rounded-lg"
                                    style={{
                                      filter: 'brightness(1.15) contrast(1.1) saturate(1.1)',
                                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                                    }}
                                  />
                                </div>
                              ) : (
                                <div 
                                  className="w-full h-full bg-gradient-to-br from-[#2B3E4E]/30 to-[#FFB71B]/30 flex items-center justify-center shadow-xl opacity-70 rounded-lg"
                                  style={{
                                    transform: 'perspective(200px) rotateY(-25deg) rotateX(5deg)',
                                    transformStyle: 'preserve-3d'
                                  }}
                                >
                                  <Building className="h-12 w-12 text-[#2B3E4E]/50" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* School Details Section - Below Header */}
                        <div className="space-y-2 mb-4 pl-0">
                          {/* Address */}
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3 w-3 text-[#FFB71B] flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600 break-words leading-tight">
                              {school.location || 'Cebu, Philippines'}
                            </span>
                          </div>
                          
                          {/* School Type (Private/Public) */}
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3 text-[#1D63A1] flex-shrink-0" />
                            <span className="text-xs text-gray-600">
                              {school.isPrivate === true ? 'Private' : 
                               school.isPrivate === false ? 'Public' : 
                               school.schoolType || 'Private'}
                            </span>
                          </div>
                          
                          {/* Program Count */}
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-3 w-3 text-[#2B3E4E] flex-shrink-0" />
                            <span className="text-xs font-medium text-gray-600">
                              {offeredPrograms.length} program{offeredPrograms.length !== 1 ? 's' : ''} offered
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200 group-hover:border-[#FFB71B]/30">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 group-hover:text-[#2B3E4E]">View School Details</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FFB71B] group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage && setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  ← Previous
                </button>
                
                <div className="flex gap-2">
                  {(() => {
                    const pages = [];
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, currentPage + 2);
                    
                    // Adjust window to always show 5 pages when possible
                    if (endPage - startPage < 4) {
                      if (startPage === 1) {
                        endPage = Math.min(totalPages, startPage + 4);
                      } else if (endPage === totalPages) {
                        startPage = Math.max(1, endPage - 4);
                      }
                    }
                    
                    // Add first page and ellipsis if needed
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCurrentPage && setCurrentPage(1)}
                          className="w-10 h-10 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
                      }
                    }
                    
                    // Add visible page range
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage && setCurrentPage(i)}
                          className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 ${
                            currentPage === i
                              ? 'bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/80 text-[#2B3E4E] shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    // Add ellipsis and last page if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage && setCurrentPage(totalPages)}
                          className="w-10 h-10 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={() => setCurrentPage && setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

// Empty state for no schools found
export const NoSchoolsFound = ({ searchTerm, filterOptions }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#1D63A1]/5 via-white to-[#FFB71B]/5">
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="bg-gradient-to-br from-[#2B3E4E]/10 to-[#FFB71B]/10 p-6 rounded-full inline-block mb-6 hover:scale-110 transition-transform duration-300">
            <Search className="w-12 h-12 text-[#2B3E4E]" />
          </div>
          <h3 className="text-2xl font-bold text-[#2B3E4E] mb-4">No schools found</h3>
          <p className="text-gray-600 max-w-md mx-auto text-lg">
            {searchTerm ? 'Try adjusting your search term or filters'
              : filterOptions?.locationSearch 
                ? `No schools found matching location "${filterOptions.locationSearch}"`
                : 'Select a program to view available schools'}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Empty state for no programs found
export const NoProgramsFound = ({ programsOfferedSearchTerm }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#1D63A1]/5 via-white to-[#FFB71B]/5">
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="bg-gradient-to-br from-[#2B3E4E]/10 to-[#FFB71B]/10 p-6 rounded-full inline-block mb-6 hover:scale-110 transition-transform duration-300">
            <BookOpen className="w-12 h-12 text-[#2B3E4E]" />
          </div>
          <h3 className="text-2xl font-bold text-[#2B3E4E] mb-4">No programs found</h3>
          <p className="text-gray-600 text-lg">
            {programsOfferedSearchTerm
              ? 'No programs found matching your search.'
              : 'No programs available for this school'}
          </p>
        </div>
      </div>
    </div>
  </div>
);