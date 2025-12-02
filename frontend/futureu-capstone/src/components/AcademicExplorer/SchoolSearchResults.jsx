import React, { useState, useEffect } from 'react';
import { Info, BookOpen, MapPin, School, Search, X, ChevronRight, Award, ExternalLink, Loader2, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { schoolLogos } from './constants';
import { getSchoolBackground } from './utils';
import { NoProgramsFound } from './EmptyState';
import programService from '../../services/programService';
import accreditationService from '../../services/accreditationService';

// Tooltip data for accreditation information (from SchoolGrid.jsx)
const accreditationBodyInfo = {
  'PACUCOA': {
    fullName: 'Philippine Association of Colleges and Universities Commission on Accreditation',
    focus: 'Primarily private, non-sectarian colleges and universities',
    significance: 'One of the most active accreditation bodies in the private sector'
  },
  'AACCUP': {
    fullName: 'Accrediting Agency of Chartered Colleges and Universities in the Philippines',
    focus: 'Primarily State Universities and Colleges (SUCs) and Local Universities and Colleges (LUCs)',
    significance: 'The main accrediting body for public higher education institutions'
  },
  'PAASCU': {
    fullName: 'Philippine Accrediting Association of Schools, Colleges and Universities',
    focus: 'Private, sectarian, and non-sectarian institutions',
    significance: 'One of the oldest and most recognized accrediting bodies'
  },
  'PTC-ACBET': {
    fullName: 'Philippine Technological Council - Accreditation and Certification Board for Engineering and Technology',
    focus: 'Focuses specifically on Engineering and Technology programs',
    significance: 'Certifies that an engineering program meets local and international standards, crucial for global mobility'
  },
  'PAASCU/PTC-ACBET': {
    fullName: 'Combined Accreditation Engineering and Technology programs in PAASCU-affiliated schools',
    focus: 'Indicates the program meets both the general PAASCU quality standards and the specific engineering competencies',
    significance: 'PAASCU quality standards and the specific engineering competencies set by PTC-ACBET'
  }
};

const accreditationLevelInfo = {
  'Level I': 'The program has successfully met the minimum standards set by the accrediting body and has achieved a basic level of quality assurance.',
  'Level II': 'The program has demonstrated substantial compliance and continuous quality improvement since its initial accreditation.',
  'Level III': 'The program meets a high level of quality in all aspects (instruction, research, community extension). The university is often granted partial deregulation in curriculum matters for this program by CHED.',
  'Level IV': 'Highest level attainable. The program is highly esteemed, has a strong research tradition, and is nationally and internationally recognized for excellence. The university is granted full autonomy in curriculum and program matters for this specific program by CHED.'
};

const chedRecognitionInfo = {
  'COE': 'Center of Excellence (COE) refers to a department/program within a higher education institution, which continuously demonstrates excellent performance in the areas of instruction, research and publication, extension and linkages and institutional qualifications.',
  'COD': 'Center of Development (COD) refers to a department/program within a higher education institution, which demonstrates the potential to become a Center of Excellence (COE) in the future.'
};

// Simple Tooltip Component (from SchoolGrid.jsx)
const Tooltip = ({ children, content, title, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-[10000] pointer-events-none ${
          position === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-2' :
          position === 'bottom' ? 'top-full left-1/2 transform -translate-x-1/2 mt-2' :
          position === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-2' :
          'left-full top-1/2 transform -translate-y-1/2 ml-2'
        }`}>
          <div className="w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700">
            {title && <div className="font-semibold text-yellow-400 mb-2">{title}</div>}
            <div className="leading-relaxed whitespace-pre-line text-justify">{content}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const SchoolSearchResults = ({ 
  searchedSchool, 
  schoolPrograms, 
  programsOfferedSearchTerm, 
  setProgramsOfferedSearchTerm 
}) => {
  // Modal state for program details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programDetails, setProgramDetails] = useState(null);
  const [accreditationDetails, setAccreditationDetails] = useState(null);
  const [loadingProgramDetails, setLoadingProgramDetails] = useState(false);
  const [loadingAccreditation, setLoadingAccreditation] = useState(false);
  const [error, setError] = useState(null);

  // Fetch program and accreditation details when program is selected
  useEffect(() => {
    if (selectedProgram && isModalOpen) {
      fetchProgramDetails();
      fetchAccreditationDetails();
    }
  }, [selectedProgram, isModalOpen]);

  // Fetch detailed program information
  const fetchProgramDetails = async () => {
    try {
      setLoadingProgramDetails(true);
      setError(null);
      
      // Get program details by ID
      const details = await programService.getProgramById(selectedProgram.programId);
      setProgramDetails(details);
      
    } catch (error) {
      console.error('Error fetching program details:', error);
      setError('Failed to load program details');
    } finally {
      setLoadingProgramDetails(false);
    }
  };

  // Fetch accreditation details from accreditation service
  const fetchAccreditationDetails = async () => {
    try {
      setLoadingAccreditation(true);
      
      // Get school accreditation data
      const schoolAccredData = await accreditationService.getSchoolAccreditationData(searchedSchool.schoolId);
      
      if (schoolAccredData && schoolAccredData.programs) {
        // Find the specific program in the accreditation data
        const allPrograms = schoolAccredData.programs.flatMap(category => category.items);
        const matchingProgram = allPrograms.find(p => 
          p.name.toLowerCase().includes(selectedProgram.programName.toLowerCase()) ||
          selectedProgram.programName.toLowerCase().includes(p.name.toLowerCase())
        );
        
        setAccreditationDetails(matchingProgram);
      }
      
    } catch (error) {
      console.error('Error fetching accreditation details:', error);
      // Don't set error for accreditation as it's not critical
    } finally {
      setLoadingAccreditation(false);
    }
  };

  // Open modal with program details
  const openProgramModal = (program) => {
    setSelectedProgram(program);
    setProgramDetails(null);
    setAccreditationDetails(null);
    setError(null);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
    setProgramDetails(null);
    setAccreditationDetails(null);
    setError(null);
  };
  const filteredSchoolPrograms = schoolPrograms.filter(program =>
    program.programName.toLowerCase().includes(programsOfferedSearchTerm.toLowerCase())
  );

  // Group programs by departments
  const groupProgramsByDepartments = (programs) => {
    const departmentGroups = {};
    
    programs.forEach((program) => {
      // Get department, default to 'Department Not Specified' if missing
      const department = program.department || 'Department Not Specified';
      
      if (!departmentGroups[department]) {
        departmentGroups[department] = [];
      }
      departmentGroups[department].push(program);
    });
    
    // Sort departments: 'Department Not Specified' goes last, others alphabetically
    const sortedDepartments = Object.keys(departmentGroups).sort((a, b) => {
      if (a === 'Department Not Specified') return 1;
      if (b === 'Department Not Specified') return -1;
      return a.localeCompare(b);
    });
    
    return sortedDepartments.map(department => ({
      department,
      programs: departmentGroups[department]
    }));
  };

  const departmentGroups = groupProgramsByDepartments(filteredSchoolPrograms);

  return (
    <>
      <div className="flex flex-col h-auto animate-fade-in-up">
      {/* School Header with Background */}
      <div className="relative w-full h-96 rounded-xl mb-8 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          {(() => {
            const bgImage = getSchoolBackground(searchedSchool.name);
            if (bgImage) {
              return (
                <img 
                  src={bgImage} 
                  alt={`${searchedSchool.name} campus`}
                  className="w-full h-full object-cover"
                />
              );
            } else {
              return (
                <div className="w-full h-full bg-gradient-to-r from-[#2B3E4E] to-[#1b2d3d]"></div>
              );
            }
          })()}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.7)]"></div>
        </div>

        {/* School Logo and Info - Left aligned */}
        <div className="absolute inset-0 flex flex-row items-center justify-start px-8 sm:px-12 md:px-16 z-30">
          {/* School Logo */}
          <div className="mr-6 flex-shrink-0">
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800 overflow-hidden">
              {(() => {
                const logo = schoolLogos[searchedSchool.schoolId];
                if (logo) {
                  return (
                    <img 
                      src={logo} 
                      alt={`${searchedSchool.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  );
                } else {
                  return (
                    <School className="w-24 h-24 text-[#2B3E4E]" />
                  );
                }
              })()}
            </div>
          </div>

          {/* Text Container (Name and Location) */}
          <div className="flex flex-col">
            {/* School Name */}
            <h2 className="text-2xl md:text-3xl font-bold text-white text-left text-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.4)' }}>
              {searchedSchool.name}
            </h2>
            
            {/* School Location */}
            <div className="flex items-center text-white/90 mt-2 text-sm md:text-base">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{searchedSchool.location}</span>
            </div>

            {/* School Type */}
            {searchedSchool.type && (
              <div className="flex items-center text-white/90 mt-2 text-sm md:text-base">
                <School className="w-5 h-5 mr-2" />
                <span>{searchedSchool.type}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* School Description */}
      <div className="bg-gray-50 dark:bg-gray-700/40 p-6 rounded-xl mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#2B3E4E] dark:text-[#FFB71B] mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          About {searchedSchool.name}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {searchedSchool.description || 'No description available for this school.'}
        </p>
      </div>
      
      {/* Programs Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="relative w-150 max-w-md group">
          {/* Program Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <BookOpen className={`h-4 w-4 transition-colors duration-300 ${
              programsOfferedSearchTerm ? 'text-[#2B3E4E]' : 'text-gray-500'
            }`} />
          </div>
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-10 pl-2 flex items-center pointer-events-none z-10">
            <Search className={`h-4 w-4 transition-colors duration-300 ${
              programsOfferedSearchTerm ? 'text-[#FFB71B]' : 'text-gray-400'
            }`} />
          </div>
          
          {/* Enhanced Search Input */}
          <input
            type="text"
            className="block w-full pl-17 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm 
                     focus:ring-4 focus:ring-[#FFB71B]/20 focus:border-[#FFB71B] 
                     transition-all duration-300 bg-white dark:bg-gray-700 dark:text-white backdrop-blur-sm
                     hover:border-[#FFB71B]/50 hover:shadow-md
                     group-hover:bg-white text-gray-700"
            placeholder=" Search programs by name..."
            value={programsOfferedSearchTerm}
            onChange={e => setProgramsOfferedSearchTerm(e.target.value)}
          />
          
          {/* Clear Button */}
          {programsOfferedSearchTerm && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#FFB71B] transition-colors hover:scale-110 z-10"
              onClick={() => setProgramsOfferedSearchTerm('')}
              aria-label="Clear program search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <h3 className="text-xl font-bold text-[#2B3E4E] dark:text-white flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-[#FFB71B]" />
          Programs Offered ({filteredSchoolPrograms.length})
        </h3>
      </div>
      
      {/* Programs by Department */}
      {filteredSchoolPrograms.length > 0 ? (
        <div className="space-y-8 pb-4">
          {departmentGroups.map((departmentGroup, deptIndex) => (
            <div key={departmentGroup.department} className="animate-fade-in-up" style={{ animationDelay: `${deptIndex * 200}ms` }}>
              {/* Department Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B3E4E] to-[#1B2836] flex items-center justify-center mr-4 shadow-lg">
                      <Building className="w-5 h-5 text-[#FFB71B]" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#2B3E4E] dark:text-white">
                        {departmentGroup.department}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {departmentGroup.programs.length} program{departmentGroup.programs.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                  {departmentGroup.department === 'Department Not Specified' && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      <Info className="w-3 h-3 mr-1" />
                      Department data not available
                    </div>
                  )}
                </div>
                
                {/* Department Divider */}
                <div className="h-px bg-gradient-to-r from-[#2B3E4E]/20 via-[#FFB71B]/40 to-[#2B3E4E]/20"></div>
              </div>
              
              {/* Programs Grid for this Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {departmentGroup.programs.map((program, programIndex) => (
                  <div
                    key={`${departmentGroup.department}-${program.programId}-${programIndex}`}
                    className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl border-2 border-gray-100 p-5 
                             hover:shadow-xl hover:border-[#FFB71B] hover:-translate-y-1 
                             transition-all duration-300 cursor-pointer group relative hover:z-[10000] group-hover:z-[10000]"
                    style={{ animationDelay: `${(deptIndex * 200) + (programIndex * 100)}ms` }}
                    onClick={() => openProgramModal(program)}
                  >
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
                          <div className="mb-4 flex-1">
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
                        
                        {/* Bottom Section - Link/Button */}
                        <div className="mt-auto w-full pt-4 border-t border-gray-100 dark:border-gray-700">
                          {program.schoolProgramURL ? (
                            <a
                              href={program.schoolProgramURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2B3E4E] dark:text-[#FFB71B] text-sm font-medium flex items-center justify-center hover:underline group-hover:text-[#FFB71B] group-hover:translate-x-1 transition-all duration-300"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="group-hover:translate-x-1 transition-transform duration-300">
                                {program.schoolProgramURLType === "department_page"
                                  ? "Visit Department Page"
                                  : program.schoolProgramURLType === "general_academic_page"
                                  ? "Visit Academics Page"
                                  : "Visit Program Page"}
                              </span>
                              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                            </a>
                          ) : (
                            <div className="text-gray-400 dark:text-gray-500 text-sm font-medium flex items-center justify-center cursor-not-allowed">
                              <span>No Online Info</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <NoProgramsFound programsOfferedSearchTerm={programsOfferedSearchTerm} />
      )}
      </div>
    
    {/* Program Details Modal - Positioned outside main container for proper centering */}
    {isModalOpen && selectedProgram && (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" 
        onClick={closeModal}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full max-w-4xl md:max-w-5xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Enhanced Modal Header */}
            <div className="relative px-8 py-6 bg-gradient-to-r from-[#232D35] to-[#2B3E4E] text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFB71B] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-[#232D35]" />
                  </div>
                  <div className="pr-8">
                    <h3 className="text-2xl font-bold tracking-tight mb-1">{selectedProgram.programName}</h3>
                    <p className="text-white/80 text-sm flex items-center">
                      <School className="w-4 h-4 mr-2" />
                      {searchedSchool.name}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeModal} 
                  aria-label="Close Modal"
                  className="absolute top-6 right-6 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content with Enhanced Styling */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-8">
                {/* Error State */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Program Description Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-xl font-bold text-[#2B3E4E] dark:text-[#FFB71B] mb-4 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-[#FFB71B] flex items-center justify-center mr-3">
                      <BookOpen className="w-4 h-4 text-[#232D35]" />
                    </div>
                    Program Description
                  </h4>
                  
                  {loadingProgramDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#FFB71B] mr-3" />
                      <span className="text-gray-600 dark:text-gray-400">Loading program details...</span>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-base whitespace-pre-wrap text-justify">
                        {programDetails?.description || 
                         programDetails?.programDescription || 
                         selectedProgram.description ||
                         'No detailed description available for this program. Please visit the program page for more information.'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* CHED Recognition & Accreditation Grid - Enhanced Design */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* CHED Recognition - Enhanced */}
                  <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/30 rounded-2xl p-8 border-2 border-amber-300 dark:border-amber-700 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-2xl font-bold text-[#2B3E4E] dark:text-[#FFB71B] flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB71B] to-[#F59E0B] flex items-center justify-center mr-4 shadow-lg">
                          <School className="w-5 h-5 text-[#232D35]" />
                        </div>
                        CHED Recognition
                      </h4>
                      <Tooltip 
                        content="CHED (Commission on Higher Education) Recognition indicates the quality and performance level of academic programs in Philippine higher education institutions."
                        title="CHED Recognition Information"
                        position="right"
                      >
                        <Info className="w-5 h-5 text-amber-600 hover:text-amber-800 cursor-pointer transition-colors" />
                      </Tooltip>
                    </div>
                    
                    {loadingAccreditation ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#FFB71B] mr-3" />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Loading recognition status...</span>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-800/70 rounded-xl p-6 border border-amber-200 dark:border-amber-700/50 shadow-lg">
                        <div className="text-center mb-6">
                          {accreditationDetails?.recognition ? (
                            <div className="space-y-4">
                              <Tooltip 
                                content={
                                  accreditationDetails.recognition === 'COE' 
                                    ? chedRecognitionInfo.COE
                                    : chedRecognitionInfo.COD
                                }
                                title={`${accreditationDetails.recognition === 'COE' ? 'Center of Excellence (COE)' : 'Center of Development (COD)'}`}
                                position="right"
                              >
                                <div className={`inline-flex px-6 py-3 rounded-full text-lg font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform ${
                                  accreditationDetails.recognition === 'COE' 
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                                    : 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                                }`}>
                                  {accreditationDetails.recognition === 'COE' ? '🏆 Center of Excellence' : '⭐ Center of Development'}
                                </div>
                              </Tooltip>
                              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                {accreditationDetails.recognition === 'COE' 
                                  ? 'This program demonstrates excellent performance in instruction, research, and community service.'
                                  : 'This program shows potential to become a Center of Excellence in the future.'}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="inline-flex px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium">
                                📋 No CHED Recognition Data Available
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                CHED recognition information not available for this program
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accreditation Details - Enhanced */}
                  <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-cyan-900/30 rounded-2xl p-8 border-2 border-emerald-300 dark:border-emerald-700 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-2xl font-bold text-[#2B3E4E] dark:text-[#FFB71B] flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-4 shadow-lg">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        Accreditation Status
                      </h4>
                      <Tooltip 
                        content="Accreditation levels indicate the maturity and quality development stage of educational programs and institutions."
                        title="Accreditation Information"
                        position="left"
                      >
                        <Info className="w-5 h-5 text-emerald-600 hover:text-emerald-800 cursor-pointer transition-colors" />
                      </Tooltip>
                    </div>
                    
                    {loadingAccreditation ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mr-3" />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Loading accreditation status...</span>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Accrediting Body - Enhanced */}
                        <div className="bg-white dark:bg-gray-800/70 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700/50 shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center">
                              🏛️ Accrediting Body
                            </span>
                          </div>
                          <div className="text-center mb-6">
                            {accreditationDetails?.accreditingBody && 
                             accreditationDetails.accreditingBody !== 'Information not available' && 
                             accreditationDetails.accreditingBody !== '-' && 
                             accreditationDetails.accreditingBody.trim() !== '' ? (
                              <div className="space-y-4">
                                <Tooltip 
                                  content={
                                    accreditationBodyInfo[accreditationDetails.accreditingBody] 
                                      ? `${accreditationBodyInfo[accreditationDetails.accreditingBody].fullName}\n\nFocus: ${accreditationBodyInfo[accreditationDetails.accreditingBody].focus}\n\nSignificance: ${accreditationBodyInfo[accreditationDetails.accreditingBody].significance}`
                                      : 'Information not available for this accrediting body.'
                                  }
                                  title={accreditationDetails.accreditingBody}
                                  position="left"
                                >
                                  <div className="inline-flex px-6 py-3 rounded-full text-lg font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-emerald-400 to-teal-500 text-white">
                                    🏛️ {accreditationDetails.accreditingBody}
                                  </div>
                                </Tooltip>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                  {accreditationBodyInfo[accreditationDetails.accreditingBody] 
                                    ? `Accredited by ${accreditationDetails.accreditingBody} - ${accreditationBodyInfo[accreditationDetails.accreditingBody].focus}` 
                                    : `Accredited by ${accreditationDetails.accreditingBody}`}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <div className="inline-flex px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium">
                                  📄 No Accrediting Body Data Available
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                  Accrediting body information not available for this program
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Accreditation Level - Redesigned similar to CHED Recognition */}
                        <div className="bg-white dark:bg-gray-800/70 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700/50 shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center">
                              📊 Accreditation Level
                            </span>
                          </div>
                          <div className="text-center mb-6">
                            {accreditationDetails?.level && accreditationDetails.level > 0 ? (
                              <div className="space-y-4">
                                <Tooltip 
                                  content={accreditationLevelInfo[`Level ${ ['', 'I', 'II', 'III', 'IV'][accreditationDetails.level]}`] || 'Information not available for this accreditation level.'}
                                  title={`Level ${ ['', 'I', 'II', 'III', 'IV'][accreditationDetails.level]} Details`}
                                  position="left"
                                >
                                  <div className={`inline-flex px-6 py-3 rounded-full text-lg font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform ${
                                    accreditationDetails.level >= 3 
                                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white' 
                                      : accreditationDetails.level === 2
                                      ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                                  }`}>
                                    {accreditationDetails.level >= 3 ? '🏆' : accreditationDetails.level === 2 ? '⭐' : '📋'} Level {['', 'I', 'II', 'III', 'IV'][accreditationDetails.level]}
                                  </div>
                                </Tooltip>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                  {accreditationDetails.level === 1 ? 'Basic quality standards met - Foundation level accreditation ensuring minimum requirements.' :
                                   accreditationDetails.level === 2 ? 'Substantial compliance demonstrated - Continuous improvement with quality assurance.' :
                                   accreditationDetails.level === 3 ? 'High quality in all aspects - Excellence in instruction, research, and community service.' :
                                   'Highest level of excellence achieved - Nationally recognized with full autonomy granted.'}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <div className="inline-flex px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium">
                                  📋 No Accreditation Level Data Available
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                  Accreditation level information not available for this program
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Modal Footer */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end items-center">
                {selectedProgram.schoolProgramURL && (
                  <a
                    href={selectedProgram.schoolProgramURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 bg-gradient-to-r from-[#FFB71B] to-[#F59E0B] hover:from-[#F59E0B] hover:to-[#D97706] text-sm font-bold rounded-xl transition-all duration-200 flex items-center hover:scale-105 shadow-lg border-2 border-[#FFB71B]/20 hover:shadow-xl"
                    style={{ color: '#000000' }}
                  >
                    Visit {selectedProgram.schoolProgramURLType === "department_page"
                      ? "Department Page"
                      : selectedProgram.schoolProgramURLType === "general_academic_page"
                      ? "Academics Page"
                      : "Program Page"}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
};

export default SchoolSearchResults;