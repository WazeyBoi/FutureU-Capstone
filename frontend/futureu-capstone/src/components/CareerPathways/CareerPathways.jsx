// src/components/CareerPathways/CareerPathways.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import apiClient from "../../services/api";
import careerService from "../../services/careerService";
import dataCacheService from "../../services/dataCache";
import CareerHeader from "./CareerHeader";
import CareerSidebarFilters from "./CareerSidebarFilters";
import CareerSearchBar from "./CareerSearchBar";
import CareerResultsTable from "./CareerResultsTable";
import CareerDetailsModal from "./CareerDetailsModal";
import CareerLegend from "./CareerLegend";

const PAGE_SIZE = 10;

const CareerPathways = () => {
    const [careers, setCareers] = useState([]);
    const [schoolPrograms, setSchoolPrograms] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [careerPaths, setCareerPaths] = useState([]);

    // Filter states
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [selectedCareerPath, setSelectedCareerPath] = useState("");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [selectedJobTrend, setSelectedJobTrend] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    
    // Add missing state for program filter
    const [selectedProgram, setSelectedProgram] = useState("");
    const [programSearch, setProgramSearch] = useState("");

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [showCareerModal, setShowCareerModal] = useState(false);
    
    // Add missing modal states for programs and schools
    const [showProgramsModal, setShowProgramsModal] = useState(false);
    const [selectedProgramsCareer, setSelectedProgramsCareer] = useState(null);
    const [showSchoolsModal, setShowSchoolsModal] = useState(false);

    // Helper function to get cached data or fetch from API
    const getCachedData = useCallback(async (cacheKey, apiUrl) => {
        // Check cache first
        const cached = dataCacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Check if already loading
        if (dataCacheService.isLoading(cacheKey)) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!dataCacheService.isLoading(cacheKey)) {
                        clearInterval(checkInterval);
                        resolve(dataCacheService.get(cacheKey));
                    }
                }, 100);
            });
        }

        try {
            dataCacheService.setLoading(cacheKey, true);
            
            const response = await apiClient.get(apiUrl);
            const data = response.data || [];
            
            // Cache the result
            dataCacheService.set(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error(`Error fetching ${cacheKey}:`, error);
            throw error;
        } finally {
            dataCacheService.setLoading(cacheKey, false);
        }
    }, []);

    // Enhanced data fetching with caching
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Use cached service for careers and cached data helper for others
                const [careersData, programsData, schoolProgramsData, careerPathsData] = await Promise.all([
                    careerService.getAllCareers(), // This already uses caching
                    getCachedData('programs', '/program/getAllPrograms'),
                    getCachedData('schoolPrograms', '/schoolprogram/getAllSchoolPrograms'),
                    getCachedData('careerPaths', '/careerpath/getAll'),
                ]);

                setCareers(careersData);
                setPrograms(programsData);
                setSchoolPrograms(schoolProgramsData);
                setCareerPaths(careerPathsData);
                
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [getCachedData]);

    // Add a force refresh function for testing
    const handleForceRefresh = useCallback(async () => {
        setLoading(true);
        try {
            // Clear all caches
            dataCacheService.clear('careers');
            dataCacheService.clear('programs');
            dataCacheService.clear('schoolPrograms');
            dataCacheService.clear('careerPaths');
            
            // Force refresh all data
            const [careersData, programsData, schoolProgramsData, careerPathsData] = await Promise.all([
                careerService.getAllCareers(true), // Force refresh
                getCachedData('programs', '/program/getAllPrograms'),
                getCachedData('schoolPrograms', '/schoolprogram/getAllSchoolPrograms'),
                getCachedData('careerPaths', '/careerpath/getAll'),
            ]);

            setCareers(careersData);
            setPrograms(programsData);
            setSchoolPrograms(schoolProgramsData);
            setCareerPaths(careerPathsData);
            
        } catch (err) {
            console.error("Error refreshing data:", err);
            setError("Failed to refresh data. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [getCachedData]);

    // Helper function to check if career has a specific career path (memoized)
    const careerHasCareerPath = useCallback((career, careerPathId) => {
        if (!career || !career.careerPaths) return false;
        return career.careerPaths.some(cp => cp.careerPathId === parseInt(careerPathId));
    }, []);

    // Helper function to get programs for a career (memoized)
    const getProgramsForCareer = useCallback((career) => {
        if (!career || !schoolPrograms || !programs) return [];
        
        // Get programs associated with this career through school programs
        const careerPrograms = schoolPrograms
            .filter(sp => sp.program && sp.school)
            .map(sp => sp.program)
            .filter((program, index, self) => 
                self.findIndex(p => p.programId === program.programId) === index
            );
        
        return careerPrograms;
    }, [schoolPrograms, programs]);

    // Helper function to format programs preview (memoized)
    const formatProgramsPreview = useCallback((career) => {
        const programs = getProgramsForCareer(career);
        if (programs.length === 0) return "No associated programs";
        if (programs.length === 1) return programs[0].programName;
        if (programs.length === 2) return `${programs[0].programName}, ${programs[1].programName}`;
        return `${programs[0].programName}, ${programs[1].programName}...`;
    }, [getProgramsForCareer]);

    // Helper function to format more programs text (memoized)
    const formatMoreProgramsText = useCallback((career) => {
        const programs = getProgramsForCareer(career);
        const count = programs.length;
        if (count <= 1) return "";
        if (count === 2) return "1 more program";
        return `${count - 1} more programs`;
    }, [getProgramsForCareer]);

    // Get unique industries (memoized)
    const industries = useMemo(() => {
        const uniqueIndustries = new Set();
        careers.forEach(career => {
            const industry = career.industry;
            if (!industry) return;
            if (industry.includes('(')) {
                const mainCategory = industry.split('(')[0].trim();
                uniqueIndustries.add(mainCategory);
            } else if (industry.includes('/')) {
                industry.split('/').forEach(part => {
                    uniqueIndustries.add(part.trim());
                });
            } else {
                uniqueIndustries.add(industry);
            }
        });
        return Array.from(uniqueIndustries).sort();
    }, [careers]);

    // Get unique job trends (memoized)
    const jobTrends = useMemo(() => Array.from(new Set(careers.map((c) => c.jobTrend).filter(Boolean))), [careers]);

    // Filter programs based on search
    const filteredProgramsOptions = useMemo(() => {
        if (!programs) return [];
        return programs.filter(program => 
            program.programName?.toLowerCase().includes(programSearch.toLowerCase())
        );
    }, [programs, programSearch]);

    // Create selectedFilters object
    const selectedFilters = useMemo(() => ({
        selectedIndustry,
        selectedProgram,
        selectedJobTrend,
        searchTerm
    }), [selectedIndustry, selectedProgram, selectedJobTrend, searchTerm]);

    // Clear all filters function
    const clearAllFilters = useCallback(() => {
        setSelectedIndustry("");
        setSelectedProgram("");
        setSelectedCareerPath("");
        setSelectedJobTrend("");
        setSearchTerm("");
        setProgramSearch("");
    }, []);

    // Filtering logic for careers (memoized)
    const filteredCareers = useMemo(() => {
        return careers.filter((career) => {
            const matchesIndustry = !selectedIndustry || career.industry?.toLowerCase().includes(selectedIndustry.toLowerCase());
            const matchesCareerPath = !selectedCareerPath || careerHasCareerPath(career, selectedCareerPath);
            const matchesJobTrend = !selectedJobTrend || career.jobTrend === selectedJobTrend;
            const matchesSearch = !searchTerm || 
                career.careerTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                career.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                career.careerDescription?.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesIndustry && matchesCareerPath && matchesJobTrend && matchesSearch;
        });
    }, [careers, selectedIndustry, selectedCareerPath, selectedJobTrend, searchTerm, careerHasCareerPath]);

    // Pagination logic (memoized)
    const totalPages = useMemo(() => Math.ceil(filteredCareers.length / PAGE_SIZE), [filteredCareers.length]);

    const paginatedCareers = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredCareers.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredCareers, currentPage]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedIndustry, selectedCareerPath, selectedJobTrend, searchTerm]);

    // Helper function to get pagination range (memoized)
    const getPaginationRange = useCallback(() => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots.filter((item, index, array) => array.indexOf(item) === index);
    }, [currentPage, totalPages]);

    // Helper function to determine trend style (memoized)
    const getTrendStyle = useCallback((trend) => {
        if (trend === 'Growing') return "bg-green-100 text-green-800";
        if (trend === 'Stable') return "bg-blue-100 text-blue-800";
        if (trend === 'Declining') return "bg-red-100 text-red-800";
        return "bg-gray-100 text-gray-600";
    }, []);

    // Helper function to get trend icon (memoized)
    const getTrendIcon = useCallback((trend) => {
        if (trend === 'Growing') return <TrendingUp className="w-3.5 h-3.5 text-green-600 mr-1.5" />;
        if (trend === 'Stable') return <Minus className="w-3.5 h-3.5 text-blue-600 mr-1.5" />;
        if (trend === 'Declining') return <TrendingDown className="w-3.5 h-3.5 text-red-600 mr-1.5" />;
        return null;
    }, []);

    // Handle error display
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1D63A1]/5 via-white to-[#FFB71B]/5 pt-20 pb-10 px-6 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="text-red-800 font-semibold mb-2">Error Loading Career Data</h3>
                    <p className="text-red-600">{error}</p>
                    <div className="flex gap-2 mt-4">
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                        <button 
                            onClick={handleForceRefresh} 
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Force Refresh
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1D63A1]/5 via-white to-[#FFB71B]/5 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <CareerHeader />
                
                <main className="flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-80 flex-shrink-0">
                        <CareerSidebarFilters
                            industries={industries}
                            careerPaths={careerPaths}
                            jobTrends={jobTrends}
                            selectedIndustry={selectedIndustry}
                            setSelectedIndustry={setSelectedIndustry}
                            selectedCareerPath={selectedCareerPath}
                            setSelectedCareerPath={setSelectedCareerPath}
                            selectedJobTrend={selectedJobTrend}
                            setSelectedJobTrend={setSelectedJobTrend}
                            filteredProgramsOptions={filteredProgramsOptions}
                            programSearch={programSearch}
                            setProgramSearch={setProgramSearch}
                            selectedProgram={selectedProgram}
                            setSelectedProgram={setSelectedProgram}
                            selectedFilters={selectedFilters}
                            clearAllFilters={clearAllFilters}
                        />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <CareerSearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filteredCareersLength={filteredCareers.length}
                        />

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-[#2B3E4E] mb-4">Career Listings</h2>
                            <CareerResultsTable
                                loading={loading}
                                paginatedCareers={paginatedCareers}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                getPaginationRange={getPaginationRange}
                                handleItemClick={(career) => { setSelectedCareer(career); setShowCareerModal(true); }}
                                getTrendStyle={getTrendStyle}
                                getTrendIcon={getTrendIcon}
                                formatProgramsPreview={formatProgramsPreview}
                                getProgramsForCareer={getProgramsForCareer}
                                formatMoreProgramsText={formatMoreProgramsText}
                            />
                        </div>

                        <CareerLegend />
                    </div>
                </main>
            </div>

            {/* Modals */}
            {showCareerModal && selectedCareer && (
                <CareerDetailsModal
                    selectedCareer={selectedCareer}
                    setShowCareerModal={setShowCareerModal}
                    setShowProgramsModal={setShowProgramsModal}
                    setSelectedProgramsCareer={setSelectedProgramsCareer}
                    setShowSchoolsModal={setShowSchoolsModal}
                    getProgramsForCareer={getProgramsForCareer}
                    getTrendStyle={getTrendStyle}
                    getTrendIcon={getTrendIcon}
                />
            )}
        </div>
    );
};

export default CareerPathways;