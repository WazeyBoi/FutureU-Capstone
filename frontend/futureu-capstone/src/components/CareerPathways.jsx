import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import careerService from "../services/careerService";
import { X, Check, Star, ChevronRight, Building, Globe, Briefcase, Info, BookOpen, TrendingUp, TrendingDown, Minus, Search } from "lucide-react";

const PAGE_SIZE = 10;

const CareerPathways = () => {
  const [careers, setCareers] = useState([]);
  const [schoolPrograms, setSchoolPrograms] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [careerPrograms, setCareerPrograms] = useState({});  // Store programs by career ID
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedJobTrend, setSelectedJobTrend] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [programSearch, setProgramSearch] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showSchoolsModal, setShowSchoolsModal] = useState(false);
  
  // New state for programs modal
  const [showProgramsModal, setShowProgramsModal] = useState(false);
  const [selectedProgramsCareer, setSelectedProgramsCareer] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all programs first to ensure we have the complete program list
        const programsRes = await apiClient.get("/program/getAllPrograms");
        setPrograms(programsRes.data || []);
        
        // Then fetch careers and school programs
        const [careersRes, schoolProgramsRes] = await Promise.all([
          apiClient.get("/career/getAllCareers"),
          apiClient.get("/schoolprogram/getAllSchoolPrograms"),
        ]);
        
        if (careersRes.data) {
          const careersData = careersRes.data;
          setCareers(careersData);
          
          // Fetch programs for each career using the dedicated endpoint
          const programsByCareer = {};
          await Promise.all(
            careersData.map(async (career) => {
              try {
                const programsResponse = await apiClient.get(`/careerprogram/getProgramsByCareer/${career.careerId}`);
                programsByCareer[career.careerId] = programsResponse.data || [];
              } catch (err) {
                console.error(`Failed to fetch programs for career ID ${career.careerId}:`, err);
                programsByCareer[career.careerId] = [];
              }
            })
          );
          
          setCareerPrograms(programsByCareer);
        }
        
        if (schoolProgramsRes.data) {
          setSchoolPrograms(schoolProgramsRes.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper function to get programs for a career
  const getProgramsForCareer = (career) => {
    if (!career || !career.careerId) return [];
    
    // Get programs from our dedicated careerPrograms state
    return careerPrograms[career.careerId] || [];
  };

  // Helper function to check if career has a specific program
  const careerHasProgram = (career, programId) => {
    if (!career || !career.careerId) return false;
    const programs = careerPrograms[career.careerId] || [];
    return programs.some(p => p.programId === parseInt(programId));
  };

  // Derive unique programs from all careers and the programs endpoint
  const allPrograms = React.useMemo(() => {
    const programMap = new Map();
    
    // Add programs from programs API
    programs.forEach(program => {
      if (program && program.programId) {
        programMap.set(program.programId, program);
      }
    });
    
    // Add programs from careerPrograms mapping
    Object.values(careerPrograms).forEach(programList => {
      programList.forEach(program => {
        if (program && program.programId) {
          programMap.set(program.programId, program);
        }
      });
    });
    
    return Array.from(programMap.values());
  }, [programs, careerPrograms]);

  // Derive unique schools from schoolPrograms
  const allSchools = React.useMemo(() => {
    return Array.from(
      new Map(
        schoolPrograms
          .filter(sp => sp && sp.school)
          .map((sp) => [sp.school.schoolId, sp.school])
      ).values()
    );
  }, [schoolPrograms]);

  // Filter programs based on selected school and search term
  const filteredPrograms = React.useMemo(() => {
    if (selectedSchool) {
      return allPrograms.filter((program) =>
        schoolPrograms.some(
          (sp) =>
            sp && sp.program && sp.school &&
            sp.program.programId === program.programId &&
            sp.school.schoolId === Number(selectedSchool)
        )
      );
    }
    
    if (programSearch) {
      return allPrograms.filter((p) =>
        p.programName.toLowerCase().includes(programSearch.toLowerCase())
      );
    }
    
    return allPrograms;
  }, [selectedSchool, programSearch, allPrograms, schoolPrograms]);

  // Unique industries and job trends
  const industries = Array.from(new Set(careers.map((c) => c.industry).filter(Boolean)));
  const jobTrends = Array.from(new Set(careers.map((c) => c.jobTrend).filter(Boolean)));

  // Filtering logic for careers
  const filteredCareers = React.useMemo(() => {
    return careers.filter((career) => {
      const matchesIndustry = !selectedIndustry || career.industry === selectedIndustry;
      
      const matchesProgram = !selectedProgram || careerHasProgram(career, selectedProgram);
      
      const matchesSchool =
        !selectedSchool ||
        getProgramsForCareer(career).some(program => 
          schoolPrograms.some(
            (sp) =>
              sp && sp.program && sp.school &&
              sp.program.programId === program.programId &&
              sp.school.schoolId === Number(selectedSchool)
          )
        );
        
      const matchesJobTrend = !selectedJobTrend || career.jobTrend === selectedJobTrend;
      
      const matchesSearch = !searchTerm || 
        (career.careerTitle && career.careerTitle.toLowerCase().includes(searchTerm.toLowerCase()));
        
      return matchesIndustry && matchesProgram && matchesSchool && matchesJobTrend && matchesSearch;
    });
  }, [careers, selectedIndustry, selectedProgram, selectedSchool, selectedJobTrend, searchTerm, schoolPrograms, careerPrograms]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCareers.length / PAGE_SIZE);
  const paginatedCareers = filteredCareers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedIndustry, selectedProgram, selectedSchool, selectedJobTrend, searchTerm]);

  function getPaginationRange(current, total) {
    const visiblePages = 5;
    let start = Math.max(1, current - Math.floor(visiblePages / 2));
    let end = start + visiblePages - 1;
    if (end > total) {
      end = total;
      start = Math.max(1, end - visiblePages + 1);
    }
    const range = [];
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  // Get schools offering the selected career's programs
  const getSchoolsForCareer = (career) => {
    if (!career) return [];
    
    const careerProgs = getProgramsForCareer(career);
    const programIds = careerProgs.map(p => p.programId);
    
    return schoolPrograms
      .filter((sp) => sp && sp.program && sp.school && programIds.includes(sp.program.programId))
      .map((sp) => sp.school)
      // Remove duplicates
      .filter((school, index, self) => 
        index === self.findIndex((s) => s.schoolId === school.schoolId)
      );
  };

  // Helper to get a school background (reuse logic from AcademicExplorer)
  const schoolBackgroundMap = {
    "Cebu Institute of Technology": "path/to/citBackground.jpg",
    // ...add your mappings here...
  };
  
  const getSchoolBackground = (schoolName) => {
    if (!schoolName) return null;
    const normalizedName = schoolName.toLowerCase();
    for (const [key, background] of Object.entries(schoolBackgroundMap)) {
      if (normalizedName.includes(key.toLowerCase())) {
        return background;
      }
    }
    return null;
  };

  // Format program names with commas
  const formatProgramsDisplay = (career) => {
    const programs = getProgramsForCareer(career);
    if (!programs || programs.length === 0) return "N/A";
    
    if (programs.length === 1) {
      return programs[0].programName;
    }
    
    return `${programs[0].programName} + ${programs.length - 1} more`;
  };
  
  // Format program names preview - shows the full first program name
  const formatProgramsPreview = (career) => {
    const programs = getProgramsForCareer(career);
    if (!programs || programs.length === 0) return "N/A";
    
    // Return full name without truncation
    return programs[0].programName;
  };
  
  // Helper function to display the +X more correctly
  const formatMoreProgramsText = (career) => {
    const programCount = getProgramsForCareer(career).length;
    if (programCount <= 1) return null;
    return `+${programCount - 1} more`;
  };

  // Helper function to determine trend style
  const getTrendStyle = (trend) => {
    if (trend === 'Growing') return "bg-green-100 text-green-800";
    if (trend === 'Stable') return "bg-blue-100 text-blue-800";
    if (trend === 'Declining') return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-600";
  };
  
  // Helper function to get trend icon
  const getTrendIcon = (trend) => {
    if (trend === 'Growing') return <TrendingUp className="h-3 w-3 mr-1" />;
    if (trend === 'Stable') return <Minus className="h-3 w-3 mr-1" />;
    if (trend === 'Declining') return <TrendingDown className="h-3 w-3 mr-1" />;
    return null;
  };

  // Get all program names as a comma-separated string (for modal display)
  const getAllProgramNames = (career) => {
    const programs = getProgramsForCareer(career);
    if (!programs || programs.length === 0) return "N/A";
    
    return programs.map(p => p.programName).join(", ");
  };

  // Handler for clicking on the programs cell
  const handleProgramsClick = (career) => {
    setSelectedProgramsCareer(career);
    setShowProgramsModal(true);
  };

  // Handle error display if needed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-500 text-black py-2 px-4 rounded-lg hover:bg-yellow-400 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Career Pathways</h1>
          <p className="mt-1 text-sm text-gray-600">
            Explore career opportunities, filter by industry, program, school, or job trend, and discover your future path.
          </p>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:w-1/4 w-full space-y-6">
            {/* Industry */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Industry</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedIndustry === "" ? "bg-yellow-100 text-yellow-800" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedIndustry("")}
                >
                  All Industries
                </button>
                {industries.map((industry) => (
                  <button
                    key={industry}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                      selectedIndustry === industry ? "bg-yellow-100 text-yellow-800" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedIndustry(industry)}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Program */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Program</h2>
              <div className="relative mb-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Search programs..."
                  value={programSearch}
                  onChange={(e) => setProgramSearch(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedProgram === "" ? "bg-yellow-100 text-yellow-800" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedProgram("")}
                >
                  All Programs
                </button>
                {filteredPrograms
                  .filter((program) =>
                    program.programName.toLowerCase().includes(programSearch.toLowerCase())
                  )
                  .map((program) => (
                    <button
                      key={program.programId}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                        selectedProgram === String(program.programId)
                          ? "bg-yellow-100 text-yellow-800"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedProgram(String(program.programId))}
                    >
                      {program.programName}
                    </button>
                  ))}
              </div>
            </div>
            
            {/* Job Trend */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Job Trend</h2>
              <select
                className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
                value={selectedJobTrend}
                onChange={(e) => setSelectedJobTrend(e.target.value)}
              >
                <option value="">All Trends</option>
                {jobTrends.map((trend) => (
                  <option key={trend} value={trend}>
                    {trend}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Clear Filters */}
            <button
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded mt-2"
              onClick={() => {
                setSelectedIndustry("");
                setSelectedProgram("");
                setSelectedSchool("");
                setSelectedJobTrend("");
                setSearchTerm("");
                setProgramSearch("");
                setSchoolSearch("");
              }}
            >
              Clear Filters
            </button>
          </aside>

          {/* Main Content */}
          <section className="lg:w-3/4 w-full flex flex-col gap-8">
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white rounded-lg shadow p-4">
              <div className="relative w-full md:w-2/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm"
                  placeholder="Search career title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between w-full md:w-1/3">
                <span className="text-gray-500 text-sm font-medium">
                  Found: <span className="text-yellow-600 font-bold">{filteredCareers.length}</span> careers
                </span>
              </div>
            </div>
            
            {/* Table - FIXED: removed duplicate search bar, improved column display */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="loader"></div>
                  </div>
                ) : (
                  <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <colgroup>
                      <col style={{ width: "20%" }} /> {/* CAREER */}
                      <col style={{ width: "20%" }} /> {/* INDUSTRY */}
                      <col style={{ width: "35%" }} /> {/* PROGRAM */}
                      <col style={{ width: "15%" }} /> {/* SALARY */}
                      <col style={{ width: "10%" }} /> {/* JOB TREND */}
                    </colgroup>
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Career
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Industry
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salary
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedCareers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-500">
                            No careers found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedCareers.map((career) => (
                          <tr
                            key={career.careerId}
                            className="hover:bg-yellow-100 cursor-pointer transition duration-200"
                            onClick={(e) => {
                              if (!e.target.closest('td.programs-cell')) {
                                setSelectedCareer(career);
                                setShowCareerModal(true);
                              }
                            }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#2B3E4E]/10 flex items-center justify-center mr-3">
                                  <Briefcase className="h-4 w-4 text-[#2B3E4E]" />
                                </div>
                                <div className="text-sm font-medium text-gray-900">{career.careerTitle}</div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-700">{career.industry}</div>
                            </td>
                            
                            {/* Program Cell - FIXED: Better alignment and showing "more" correctly */}
                            <td 
                              className="px-6 py-4 programs-cell"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProgramsClick(career);
                              }}
                            >
                              <div className="flex flex-col cursor-pointer group">
                                <div className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                                  {formatProgramsPreview(career)}
                                </div>
                                
                                {/* Show more indicator with right alignment */}
                                {getProgramsForCareer(career).length > 1 && (
                                  <div className="flex justify-end mt-1">
                                    <span className="text-xs text-blue-600 flex items-center">
                                      +{getProgramsForCareer(career).length - 1} more
                                      <ChevronRight className="w-3 h-3 ml-0.5 mt-px group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 text-center">
                              <div className="text-sm text-yellow-600 font-bold">
                                {career.salary ? `₱${career.salary.toLocaleString()}` : 'N/A'}
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                {career.jobTrend ? (
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTrendStyle(career.jobTrend)}`}>
                                    {getTrendIcon(career.jobTrend)}
                                    {career.jobTrend}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    Not specified
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-4">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {getPaginationRange(currentPage, totalPages).map((page) => (
                    <button
                      key={page}
                      className={`px-3 py-1 rounded font-bold transition border-2 ${
                        currentPage === page
                          ? "bg-yellow-500 text-black border-yellow-600 shadow-lg scale-110"
                          : "bg-gray-100 text-gray-700 border-transparent hover:bg-yellow-100"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </button>
                </div>
              )}
            </div>

            {/* Career Details Modal */}
            {showCareerModal && selectedCareer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative border border-gray-200 overflow-hidden animate-fade-in-up">
                  {/* Gradient header with improved design */}
                  <div className="bg-gradient-to-r from-[#2B3E4E] to-[#1a2530] h-32 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 opacity-10"></div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center border border-white/20 shadow-lg">
                      <div className="text-xs uppercase tracking-wider text-yellow-300 font-semibold mb-1">
                        Career Path
                      </div>
                      <h2 className="text-2xl font-bold text-white">{selectedCareer.careerTitle}</h2>
                    </div>
                    <button
                      className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
                      onClick={() => setShowCareerModal(false)}
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="px-8 py-6">
                    {/* Info Grid with improved styling */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start">
                          <div className="bg-[#2B3E4E]/10 p-2 rounded-lg mr-3 flex-shrink-0">
                            <Building className="h-5 w-5 text-[#2B3E4E]" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold mb-1">Industry</div>
                            <div className="text-base text-gray-800">{selectedCareer.industry}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start">
                          <div className="bg-yellow-100 p-2 rounded-lg mr-3 flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-yellow-700" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold mb-1">Salary</div>
                            <div className="text-base text-yellow-600 font-bold">
                              {selectedCareer.salary ? `₱${selectedCareer.salary.toLocaleString()}` : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3 flex-shrink-0">
                            {selectedCareer.jobTrend === 'Growing' && <TrendingUp className="h-5 w-5 text-green-600" />}
                            {selectedCareer.jobTrend === 'Stable' && <Minus className="h-5 w-5 text-blue-600" />}
                            {selectedCareer.jobTrend === 'Declining' && <TrendingDown className="h-5 w-5 text-red-600" />}
                            {!selectedCareer.jobTrend && <Info className="h-5 w-5 text-gray-500" />}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold mb-1">Job Trend</div>
                            <div className="text-base text-gray-800">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                selectedCareer.jobTrend === 'Growing' ? 'bg-green-100 text-green-800' :
                                selectedCareer.jobTrend === 'Stable' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {selectedCareer.jobTrend || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    {selectedCareer.careerDescription && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                        <div className="flex items-start">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-3 flex-shrink-0">
                            <Info className="h-5 w-5 text-indigo-700" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-semibold mb-1">Description</div>
                            <div className="text-sm text-gray-800 leading-relaxed">
                              {selectedCareer.careerDescription}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Programs Section - IMPROVED DESIGN */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-700 font-medium">Associated Programs</h3>
                        <div className="text-sm text-gray-500">
                          {getProgramsForCareer(selectedCareer).length} program{getProgramsForCareer(selectedCareer).length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 mb-4">
                        {getProgramsForCareer(selectedCareer).length === 0 ? (
                          <div className="text-center py-4 bg-gray-50 rounded-xl text-gray-500 text-sm">
                            No programs associated with this career.
                          </div>
                        ) : (
                          getProgramsForCareer(selectedCareer).slice(0, 3).map((program) => (
                            <div 
                              key={program.programId}
                              className="bg-gray-50 hover:bg-gray-100 rounded-xl p-3 transition-colors border border-gray-100 flex items-start"
                            >
                              <div className="bg-yellow-100 p-1.5 rounded-lg mr-2.5 flex-shrink-0">
                                <BookOpen className="h-4 w-4 text-yellow-700" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">{program.programName}</div>
                                {program.description && (
                                  <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">{program.description}</div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                        
                        {getProgramsForCareer(selectedCareer).length > 3 && (
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                            <span className="text-sm text-gray-500">
                              +{getProgramsForCareer(selectedCareer).length - 3} more programs
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* View all programs button - Now at bottom, better UI */}
                      {getProgramsForCareer(selectedCareer).length > 0 && (
                        <button
                          onClick={() => {
                            setShowCareerModal(false);
                            setSelectedProgramsCareer(selectedCareer);
                            setShowProgramsModal(true);
                          }}
                          className="w-full py-2.5 px-4 bg-[#2B3E4E]/10 hover:bg-[#2B3E4E]/20 text-[#2B3E4E] rounded-lg transition-colors flex items-center justify-center group"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          View All Programs
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <div className="mt-6 border-t border-gray-200 pt-6 flex justify-end">
                      <button
                        className="bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] font-medium px-6 py-3 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center"
                        onClick={() => {
                          setShowCareerModal(false);
                          setShowSchoolsModal(true);
                        }}
                      >
                        <Building className="w-5 h-5 mr-2" />
                        View Schools Offering Programs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Programs Modal */}
            {showProgramsModal && selectedProgramsCareer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative border border-gray-200 animate-fade-in-up overflow-hidden">
                  {/* Header with gradient - enhanced with pattern */}
                  <div className="bg-gradient-to-r from-[#2B3E4E] to-[#1a2530] h-24 flex items-center px-8 relative">
                    <div className="absolute inset-0 opacity-10"></div>
                    <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 inline-flex items-center border border-white/10">
                      <div className="bg-yellow-500 rounded-full p-2 mr-3">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-yellow-300 font-semibold uppercase tracking-wider">Career Programs</div>
                        <h3 className="text-white font-bold text-lg">{selectedProgramsCareer.careerTitle}</h3>
                      </div>
                    </div>
                    <button
                      className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
                      onClick={() => setShowProgramsModal(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Programs list - enhanced design */}
                  <div className="px-8 py-6">
                    <div className="mb-6">
                      <div className="text-sm text-gray-500 mb-1">These academic programs can lead to careers in:</div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-medium text-[#2B3E4E] flex items-center">
                          <span className="mr-2">{selectedProgramsCareer.industry}</span>
                        </div>
                        <span className={`text-xs px-2.5 py-1.5 rounded-full flex items-center ${
                          selectedProgramsCareer.jobTrend === 'Growing' ? 'bg-green-100 text-green-800' :
                          selectedProgramsCareer.jobTrend === 'Stable' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedProgramsCareer.jobTrend === 'Growing' && <TrendingUp className="h-3 w-3 mr-1" />}
                          {selectedProgramsCareer.jobTrend === 'Stable' && <Minus className="h-3 w-3 mr-1" />}
                          {selectedProgramsCareer.jobTrend === 'Declining' && <TrendingDown className="h-3 w-3 mr-1" />}
                          {selectedProgramsCareer.jobTrend}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6">
                      {getProgramsForCareer(selectedProgramsCareer).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No programs associated with this career.</div>
                      ) : (
                        getProgramsForCareer(selectedProgramsCareer).map((program) => (
                          <div 
                            key={program.programId}
                            className="bg-gray-50 hover:bg-gray-100 rounded-xl p-5 transition-colors border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                          >
                            <div className="flex items-start">
                              <div className="bg-[#2B3E4E]/10 p-2.5 rounded-lg mr-3 flex-shrink-0">
                                <BookOpen className="w-6 h-6 text-[#2B3E4E]" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 text-lg mb-1">{program.programName}</h4>
                                {program.description && (
                                  <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">{program.description}</p>
                                )}
                                
                                {/* Program stats */}
                                <div className="flex flex-wrap gap-2 mt-1 items-center">
                                  <div className="bg-blue-50 rounded-md px-3 py-1.5 text-xs text-blue-700 font-medium flex items-center">
                                    <Building className="w-3.5 h-3.5 mr-1.5" />
                                    {schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length} Schools
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Schools that offer this program - improved layout */}
                            <div className="mt-4 pl-12 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500 font-medium">Available at:</span>
                                <span className="text-xs text-blue-600">
                                  {schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length} schools
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {schoolPrograms
                                  .filter(sp => sp.program?.programId === program.programId && sp.school)
                                  .slice(0, 5)
                                  .map((sp, i) => (
                                    <div 
                                      key={`${sp.school.schoolId}-${i}`} 
                                      className="bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-md text-xs font-medium text-yellow-800 max-w-[150px] truncate"
                                      title={sp.school.name}
                                    >
                                      {sp.school.name}
                                    </div>
                                  ))
                                }
                                {schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length > 5 && (
                                  <div className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 flex items-center">
                                    +{schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length - 5} more
                                  </div>
                                )}
                                {schoolPrograms.filter(sp => sp.program?.programId === program.programId && sp.school).length === 0 && (
                                  <div className="text-xs text-gray-500 italic">No schools available</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-6 flex justify-end">
                      <button
                        className="bg-[#2B3E4E] hover:bg-[#1a2530] text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm hover:shadow flex items-center"
                        onClick={() => {
                          setShowProgramsModal(false);
                          // Navigate to Academic Explorer
                          const firstProgram = getProgramsForCareer(selectedProgramsCareer)[0];
                          if (firstProgram) {
                            window.location.href = `/academic-explorer?programId=${firstProgram.programId}`;
                          }
                        }}
                      >
                        Explore Programs
                        <ChevronRight className="w-4 h-4 ml-1.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Schools Modal */}
            {showSchoolsModal && selectedCareer && (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full relative border border-gray-200 animate-fade-in-up overflow-hidden">
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full shadow"
                    onClick={() => setShowSchoolsModal(false)}
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                  <div className="h-52 bg-[#2B3E4E] relative overflow-hidden w-full">
                    {getSchoolsForCareer(selectedCareer)[0]?.name && getSchoolBackground(getSchoolsForCareer(selectedCareer)[0]?.name) ? (
                      <img
                        src={getSchoolBackground(getSchoolsForCareer(selectedCareer)[0]?.name)}
                        alt="School background"
                        className="w-full h-full object-cover object-center opacity-40"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#2B3E4E] opacity-90"></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="px-6 py-3 text-center">
                        <h2 className="text-white text-3xl font-bold text-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.4)' }}>
                          Schools Offering {selectedCareer.careerPrograms && selectedCareer.careerPrograms.length > 0 ? 
                            getProgramsForCareer(selectedCareer).map(p => p.programName).join(", ") : 
                            "Related Programs"}
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 pb-8 relative">
                    <ul className="space-y-8 max-h-[420px] overflow-y-auto pt-12">
                      {getSchoolsForCareer(selectedCareer).length === 0 ? (
                        <li className="text-gray-500">No schools found for this program.</li>
                      ) : (
                        getSchoolsForCareer(selectedCareer).map((school) => (
                          <li key={school.schoolId} className="relative bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row gap-6 mb-4">
                            <div className="absolute -top-12 left-8 w-24 h-24">
                              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white overflow-hidden p-1">
                                <span className="text-4xl font-bold text-[#2B3E4E]">{school.name[0]}</span>
                              </div>
                            </div>
                            <div className="flex-1 pt-8 md:pt-0 md:pl-32">
                              <h3 className="font-bold text-xl text-[#2B3E4E] mb-2">{school.name}</h3>
                              <div className="flex flex-wrap gap-4 mb-2">
                                <div className="flex items-center text-gray-600">
                                  <Globe className="w-5 h-5 mr-2 text-[#FFB71B]" />
                                  {school.location}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Building className="w-5 h-5 mr-2 text-[#FFB71B]" />
                                  {school.type}
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                  <Star className="w-5 h-5 mr-2 text-[#FFB71B]" />
                                  About the School
                                </h4>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {school.description || 'No description available for this school.'}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                    {/* View All Button */}
                    <div className="mt-8 flex justify-end gap-4">
                      <button
                        className="py-3 px-6 bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] rounded-lg transition shadow-md hover:shadow-lg font-medium flex items-center justify-center"
                        onClick={() => {
                          const programId = selectedCareer.careerPrograms && 
                                           selectedCareer.careerPrograms.length > 0 ? 
                                           selectedCareer.careerPrograms[0].program.programId : null;
                          if (programId) {
                            window.location.href = `/academic-explorer?programId=${programId}`;
                          }
                        }}
                      >
                        <ChevronRight className="w-5 h-5 mr-2" />
                        View All in Academic Explorer
                      </button>
                      <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded"
                        onClick={() => setShowSchoolsModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legend Section */}
            <div className="lg:w-full bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Legend</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-2">
                    Job Trend
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-600 text-white text-xs mr-2">
                        High Demand
                      </span>
                      <span className="text-sm text-gray-600">
                        Careers with strong job market growth
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs mr-2">
                        Growing
                      </span>
                      <span className="text-sm text-gray-600">
                        Careers with steady growth
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-white text-xs mr-2">
                        Stable
                      </span>
                      <span className="text-sm text-gray-600">
                        Careers with consistent opportunities
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-2">
                    Salary
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-white text-xs mr-2">
                        ₱
                      </span>
                      <span className="text-sm text-gray-600">
                        Estimated monthly salary (PHP)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CareerPathways;