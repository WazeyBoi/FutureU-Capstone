import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Info, School, BookOpen, MapPin, Globe, X, Search, ChevronRight, Star, StarOff, Filter, AlertCircle } from 'lucide-react';

// Import all logos
import logo1 from '../assets/logos/1_logo.png';
import logo2 from '../assets/logos/2_logo.png';
import logo3 from '../assets/logos/3_logo.png';
import logo4 from '../assets/logos/4_logo.png';
import logo5 from '../assets/logos/5_logo.png';
import logo6 from '../assets/logos/6_logo.png';
import logo7 from '../assets/logos/7_logo.png';
import logo8 from '../assets/logos/8_logo.png';
import logo9 from '../assets/logos/9_logo.png';
import logo10 from '../assets/logos/10_logo.png';
import logo11 from '../assets/logos/11_logo.png';

// Create a mapping of school IDs to logos
const schoolLogos = {
  1: logo1,
  2: logo2,
  3: logo3,
  4: logo4,
  5: logo5,
  6: logo6,
  7: logo7,
  8: logo8,
  9: logo9,
  10: logo10,
  11: logo11,
};

const AcademicExplorer = () => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [hoveredSchool, setHoveredSchool] = useState(null);
  const [error, setError] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    hasVirtualTour: false,
    sortBy: 'name'
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [programSearchTerm, setProgramSearchTerm] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [programsResponse, schoolsResponse] = await Promise.all([
          axios.get('/api/program/getAllPrograms'),
          axios.get('/api/school/getAllSchools')
        ]);
        
        if (Array.isArray(programsResponse.data)) {
          const transformedPrograms = programsResponse.data.map((program) => ({
            programId: program.programId,
            programName: program.programName,
          }));
          setPrograms(transformedPrograms);
        } else {
          setError('Failed to load programs. Please try again later.');
        }
        
        if (Array.isArray(schoolsResponse.data)) {
          setSchools(schoolsResponse.data);
        } else {
          setError('Failed to load schools. Please try again later.');
        }
      } catch (error) {
        setError('Failed to load data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      const fetchSchoolPrograms = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `/api/schoolprogram/getSchoolProgramsByProgram/${selectedProgram}`
          );
          if (Array.isArray(response.data)) {
            const filtered = response.data.map((schoolProgram) => schoolProgram.school);
          if (filtered.length === 0) {
              setFilteredSchools(schools);
              console.log("No specific schools found for this program, showing all schools");
            } else {
              setFilteredSchools(filtered);
            }
        } else {
            setFilteredSchools(schools);
            console.log("Invalid response format, showing all schools");
          }
      } catch (error) {
        console.error("Error fetching school programs:", error);
          setFilteredSchools(schools);
          setError('Failed to load specific schools for the selected program. Showing all schools instead.');
        } finally {
          setLoading(false);
        }
      };
  
      fetchSchoolPrograms();
    } else {
      setFilteredSchools([]);
    }
  }, [selectedProgram, schools]);

  const handleSchoolSelect = (school) => {
    if (selectedSchools.find((s) => s.schoolId === school.schoolId)) {
      setSelectedSchools(selectedSchools.filter((s) => s.schoolId !== school.schoolId));
    } else if (selectedSchools.length < 3) {
      setSelectedSchools([...selectedSchools, school]);
    } else {
    const toastElement = document.getElementById('toast');
      if (toastElement) {
        toastElement.classList.remove('hidden');
        setTimeout(() => {
          toastElement.classList.add('hidden');
        }, 3000);
      }
    }
  };

  const handleCompareClick = () => {
    if (selectedSchools.length < 2) {
      const toastElement = document.getElementById('toast');
      if (toastElement) {
        toastElement.textContent = 'Please select at least 2 schools to compare';
        toastElement.classList.remove('hidden');
        setTimeout(() => {
          toastElement.classList.add('hidden');
        }, 3000);
      }
      return;
    }
    setShowComparison(true);
  };

  const filteredAndSearchedSchools = filteredSchools
  .filter(school => {
      const matchesSearch = searchTerm === '' || 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (school.description && school.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesVirtualTour = !filterOptions.hasVirtualTour || 
        (school.virtualTourUrl && school.virtualTourUrl.trim() !== '');
      
      return matchesSearch && matchesVirtualTour;
    })
  .sort((a, b) => {
      if (filterOptions.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (filterOptions.sortBy === 'location') {
        return a.location.localeCompare(b.location);
      }
      return 0;
    });

const getAnimationClass = (index) => {
    const baseDelay = 50;
    const delay = index * baseDelay;
    return `animate-fade-in-up animation-delay-${delay}`;
  };

  const handleMouseEnter = (school, e) => {
    setHoveredSchool(school);
    setTooltipVisible(true);
    
  const rect = e.currentTarget.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.right;
    const spaceBelow = window.innerHeight - rect.top;
    
    let x = rect.right + 10;
    let y = rect.top;
    
    if (spaceOnRight < 400) {
      x = rect.left - 410;
    }
    
    if (spaceBelow < 500) {
      y = Math.max(10, rect.bottom - 500);
    }
    
    setTooltipPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
    setHoveredSchool(null);
  };

  if (showComparison) {
    return (
      <div className="min-h-screen h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
        <div className="w-full px-4 h-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">School Comparison</h1>
            <button
              onClick={() => setShowComparison(false)}
              className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-full shadow-sm transition-all hover:shadow"
              aria-label="Close comparison view"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedSchools.map((school) => {
              const schoolLogo = schoolLogos[school.schoolId];
              return (
                <div 
                  key={school.schoolId} 
                  className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {schoolLogo ? (
                        <img 
                          src={schoolLogo} 
                          alt={`${school.name} logo`}
                          className="w-24 h-24 object-cover rounded-full border-4 border-indigo-100"
                        />
                      ) : (
                        <div className="p-3 bg-indigo-100 rounded-full mr-3">
                          <School className="w-8 h-8 text-indigo-600" />
                        </div>
                      )}
                      <h2 className="text-xl font-semibold text-gray-900 ml-4">{school.name}</h2>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSchoolSelect(school);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label="Remove from comparison"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">{school.location}</p>
                    </div>
                    
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-gray-500 mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">{school.admissionRequirements || 'Admission requirements not available'}</p>
                    </div>
                    
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <Info className="w-5 h-5 text-gray-500 mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">{school.description || 'Description not available'}</p>
                    </div>
                    
                    {school.virtualTourUrl && (
                      <a
                        href={school.virtualTourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-3 px-4 rounded-lg transition-colors mt-4"
                      >
                        <Globe className="w-5 h-5 mr-2" />
                        Take Virtual Tour
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            
            {selectedSchools.length < 3 && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center p-6 min-h-64">
                <div className="text-center text-gray-500">
                  <div className="bg-gray-100 p-3 rounded-full inline-block mb-3">
                    <School className="w-8 h-8 text-gray-400" />
                  </div>
                  <p>Add up to {3 - selectedSchools.length} more {selectedSchools.length === 2 ? 'school' : 'schools'} to compare</p>
                  <button
                    onClick={() => setShowComparison(false)}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Browse Schools
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="h-screen w-full flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div 
        id="toast" 
        className="hidden fixed top-4 right-4 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded shadow-lg z-50 animate-slide-in-right"
      >
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>You can compare up to 3 schools at a time</p>
        </div>
      </div>
      
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 w-full">
        <div className="w-full px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-white font-semibold">
              <span className="text-xl">Academic Explorer</span>
            </div>
            
            <div className="flex flex-1 md:max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </button>
                
                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 z-40">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Filter Options</h3>
                    
                    <div className="mb-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterOptions.hasVirtualTour}
                          onChange={() => setFilterOptions({
                            ...filterOptions,
                            hasVirtualTour: !filterOptions.hasVirtualTour
                          })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Virtual Tour Available</span>
                      </label>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sortBy"
                            checked={filterOptions.sortBy === 'name'}
                            onChange={() => setFilterOptions({
                              ...filterOptions,
                              sortBy: 'name'
                            })}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>School Name</span>
                        </label>
                        
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sortBy"
                            checked={filterOptions.sortBy === 'location'}
                            onChange={() => setFilterOptions({
                              ...filterOptions,
                              sortBy: 'location'
                            })}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Location</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedSchools.length > 0 && (
                <button
                  onClick={handleCompareClick}
                  className="bg-indigo-600 text-black px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow flex items-center"
                >
                  <span>Compare</span>
                  <span className="ml-2 bg-white text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    {selectedSchools.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full overflow-y-auto">
        <div className="w-full px-4 py-6 h-full">
        <div className="flex flex-col md:flex-row gap-8 h-full">
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 sticky top-24">
                <h2 className="text-gray-900 dark:text-white font-semibold text-lg mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Programs
                </h2>

              <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={programSearchTerm}
                    onChange={(e) => setProgramSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
                  />
                </div>

                {loading && !selectedProgram ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                ) : (
                  <div
                    className="space-y-1 overflow-y-auto"
                    style={{ maxHeight: '400px' }}
                  >
                    {programs.length > 0 ?
                      programs
                        .filter((program) =>
                          program.programName.toLowerCase().includes(programSearchTerm.toLowerCase())
                        )
                        .map((program) => (
                          <button
                            key={program.programId}
                            className={`block w-full text-left px-4 py-3 rounded-lg transition-all ${
                              selectedProgram === program.programId
                                ? 'bg-indigo-100 text-indigo-700 font-medium shadow-sm'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              setSelectedProgram(program.programId);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span>{program.programName}</span>
                              {selectedProgram === program.programId && (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </div>
                          </button>
                        ))
                      : (
                        <div className="text-center py-4">
                          <p className="text-gray-600">No programs found</p>
                        </div>
                      )}
                    
                    {programs.length > 0 && 
                    programs.filter(program => 
                    program.programName.toLowerCase().includes(programSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-600">No matching programs found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          <div className="flex-1 overflow-hidden flex flex-col">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedProgram
                    ? `Schools Offering ${
                        programs.find((p) => p.programId === selectedProgram)?.programName
                      }`
                    : 'Select a Program to View Schools'}
                </h1>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex-1 overflow-y-auto">
                {loading && selectedProgram ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredAndSearchedSchools.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No schools found</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {searchTerm ? 'Try adjusting your search term or filters' : 'Select a program to view available schools'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSearchedSchools.map((school, index) => {
                      const isSelected = selectedSchools.find((s) => s.schoolId === school.schoolId);
                      const schoolLogo = schoolLogos[school.schoolId];

                      return (
                        <div
                          key={school.schoolId}
                          className={`relative bg-white dark:bg-gray-700 border rounded-xl transition-all duration-300 overflow-hidden ${getAnimationClass(index)} ${
                            isSelected
                              ? 'border-indigo-500 shadow-md ring-2 ring-indigo-200'
                              : 'border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1'
                          }`}
                          onMouseEnter={(e) => handleMouseEnter(school, e)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleSchoolSelect(school)}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-indigo-500 text-white p-1 rounded-full z-10">
                              <Star className="w-4 h-4" />
                            </div>
                          )}

                          <div className="p-5">
                            <div className="flex flex-col items-center mb-4">
                              {schoolLogo ? (
                                <img 
                                  src={schoolLogo} 
                                  alt={`${school.name} logo`}
                                  className="w-20 h-20 object-cover rounded-full border-4 border-indigo-100 mb-3"
                                />
                              ) : (
                                <div className="p-4 bg-indigo-50 rounded-full mb-3">
                                  <School className="w-8 h-8 text-indigo-600" />
                                </div>
                              )}
                              <h3 className="font-medium text-gray-900 dark:text-white text-center">{school.name}</h3>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{school.location}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <Globe className="w-4 h-4 mr-2" />
                                <span>{school.type}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <BookOpen className="w-4 h-4 mr-2" />
                                <span>{school.programCount} Programs</span>
                              </div>
                            </div>
                          </div>

                          {tooltipVisible && hoveredSchool?.schoolId === school.schoolId && (
                            <div 
                              className="fixed z-50 w-[400px] bg-white border border-gray-200 rounded-xl shadow-2xl p-6 transform transition-all duration-200 ease-in-out"
                              style={{
                                top: tooltipPosition.y + 'px',
                                left: tooltipPosition.x + 'px'
                              }}
                            >
                              <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                                {schoolLogo ? (
                                  <img 
                                    src={schoolLogo} 
                                    alt={`${school.name} logo`}
                                    className="w-20 h-20 object-cover rounded-full border-4 border-indigo-100"
                                  />
                                ) : (
                                  <div className="p-4 bg-indigo-50 rounded-full">
                                    <School className="w-8 h-8 text-indigo-600" />
                                  </div>
                                )}
                                <div className="ml-4">
                                  <h4 className="font-bold text-xl text-gray-900">{school.name}</h4>
                                  <p className="text-sm text-gray-500">{school.location}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-5">
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <h5 className="text-sm font-semibold text-gray-700 mb-2">About</h5>
                                  <p className="text-gray-600 text-sm leading-relaxed">
                                    {school.description || 'No description available'}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                      <BookOpen className="w-4 h-4 text-indigo-600 mr-2" />
                                      <h5 className="text-sm font-semibold text-gray-700">Requirements</h5>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                      {school.admissionRequirements || 'Not specified'}
                                    </p>
                                  </div>

                                  {school.tuitionFee && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="flex items-center mb-2">
                                        <div className="w-4 h-4 mr-2">💰</div>
                                        <h5 className="text-sm font-semibold text-gray-700">Tuition</h5>
                                      </div>
                                      <p className="text-gray-600 text-sm">{school.tuitionFee}</p>
                                    </div>
                                  )}
                                </div>

                                {school.virtualTourUrl && (
                                  <a
                                    href={school.virtualTourUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-3 px-4 rounded-lg transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Globe className="w-4 h-4 mr-2" />
                                    Take Virtual Tour
                                  </a>
                                )}
                              </div>

                              <div className="mt-6 pt-4 border-t border-gray-100">
                                <button 
                                  className={`w-full bg-indigo-600 ${
                                    selectedSchools.find(s => s.schoolId === school.schoolId) ? 'text-black' : 'text-white'
                                  } hover:bg-indigo-700 py-3 px-4 rounded-lg transition-colors flex items-center justify-center font-medium`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSchoolSelect(school);
                                  }}
                                >
                                  {selectedSchools.find(s => s.schoolId === school.schoolId) ? (
                                    <>
                                      <StarOff className="w-4 h-4 mr-2" />
                                      Remove from Comparison
                                    </>
                                  ) : (
                                    <>
                                      <Star className="w-4 h-4 mr-2" />
                                      Add to Comparison
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AcademicExplorer;