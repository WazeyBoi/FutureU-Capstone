// src/components/CareerPathways/CareerPathways.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import apiClient from "../../services/api";
import careerService from "../../services/careerService";// Assuming apiClient is in services/api.js
import CareerHeader from "./CareerHeader";
import CareerSidebarFilters from "./CareerSidebarFilters";
import CareerSearchBar from "./CareerSearchBar";
import CareerResultsTable from "./CareerResultsTable";
import CareerDetailsModal from "./CareerDetailsModal";
import CareerProgramsModal from "./CareerProgramsModal";
import CareerSchoolsModal from "./CareerSchoolsModal";
import CareerLegend from "./CareerLegend";

const PAGE_SIZE = 10;

const CareerPathways = () => {
    const [careers, setCareers] = useState([]);
    const [schoolPrograms, setSchoolPrograms] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [careerPrograms, setCareerPrograms] = useState({}); // Store programs by career ID

    // Filter states
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedSchool, setSelectedSchool] = useState(""); // Though not directly used in filter panel, it's a filter criteria
    const [selectedJobTrend, setSelectedJobTrend] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [programSearch, setProgramSearch] = useState("");

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [showCareerModal, setShowCareerModal] = useState(false);
    const [showProgramsModal, setShowProgramsModal] = useState(false);
    const [selectedProgramsCareer, setSelectedProgramsCareer] = useState(null);
    const [showSchoolsModal, setShowSchoolsModal] = useState(false);


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

    // Helper function to get programs for a career (memoized)
    const getProgramsForCareer = useCallback((career) => {
        if (!career || !career.careerId) return [];
        return careerPrograms[career.careerId] || [];
    }, [careerPrograms]);

    // Helper function to check if career has a specific program (memoized)
    const careerHasProgram = useCallback((career, programId) => {
        if (!career || !career.careerId) return false;
        const programsForCurrCareer = careerPrograms[career.careerId] || [];
        return programsForCurrCareer.some(p => p.programId === parseInt(programId));
    }, [careerPrograms]);

    // Derive unique programs from all careers and the programs endpoint (memoized)
    const allPrograms = useMemo(() => {
        const programMap = new Map();
        programs.forEach(program => {
            if (program && program.programId) {
                programMap.set(program.programId, program);
            }
        });
        Object.values(careerPrograms).forEach(programList => {
            programList.forEach(program => {
                if (program && program.programId) {
                    programMap.set(program.programId, program);
                }
            });
        });
        return Array.from(programMap.values());
    }, [programs, careerPrograms]);

    // Derive unique schools from schoolPrograms (memoized)
    const allSchools = useMemo(() => {
        return Array.from(
            new Map(
                schoolPrograms
                    .filter(sp => sp && sp.school)
                    .map((sp) => [sp.school.schoolId, sp.school])
            ).values()
        );
    }, [schoolPrograms]);

    // Filter programs based on selected school and search term (memoized)
    const filteredProgramsOptions = useMemo(() => {
        let currentPrograms = allPrograms;
        if (selectedSchool) {
            currentPrograms = currentPrograms.filter((program) =>
                schoolPrograms.some(
                    (sp) =>
                        sp && sp.program && sp.school &&
                        sp.program.programId === program.programId &&
                        sp.school.schoolId === Number(selectedSchool)
                )
            );
        }
        if (programSearch) {
            currentPrograms = currentPrograms.filter((p) =>
                p.programName.toLowerCase().includes(programSearch.toLowerCase())
            );
        }
        return currentPrograms;
    }, [selectedSchool, programSearch, allPrograms, schoolPrograms]);

    // Helper functions for industry filtering (memoized)
    const matchesIndustryFilter = useCallback((careerIndustry, filterIndustry) => {
        if (!filterIndustry) return true;
        if (careerIndustry === filterIndustry) return true;
        if (careerIndustry.includes('/')) {
            const parts = careerIndustry.split('/').map(part => part.trim());
            return parts.includes(filterIndustry);
        }
        if (careerIndustry.includes('(')) {
            const mainCategory = careerIndustry.split('(')[0].trim();
            return mainCategory === filterIndustry;
        }
        return false;
    }, []);

    // Update the industries array generation to correctly extract and display industries (memoized)
    const industries = useMemo(() => {
        if (!careers || careers.length === 0) return [];
        const allIndustries = careers.map((c) => c.industry).filter(Boolean);
        const uniqueIndustries = new Set();
        allIndustries.forEach(industry => {
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

    // Filtering logic for careers (memoized)
    const filteredCareers = useMemo(() => {
        return careers.filter((career) => {
            const matchesIndustry = matchesIndustryFilter(career.industry, selectedIndustry);
            const matchesProgram = !selectedProgram || careerHasProgram(career, selectedProgram);
            const matchesJobTrend = !selectedJobTrend || career.jobTrend === selectedJobTrend;
            const matchesSearch = !searchTerm ||
                (career.careerTitle && career.careerTitle.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchesIndustry && matchesProgram && matchesJobTrend && matchesSearch;
        });
    }, [careers, selectedIndustry, selectedProgram, selectedJobTrend, searchTerm, careerHasProgram, matchesIndustryFilter]);

    // Pagination logic (memoized)
    const totalPages = useMemo(() => Math.ceil(filteredCareers.length / PAGE_SIZE), [filteredCareers.length]);
    const paginatedCareers = useMemo(() =>
        filteredCareers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [filteredCareers, currentPage]
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedIndustry, selectedProgram, selectedJobTrend, searchTerm]);

    // Memoized pagination range helper
    const getPaginationRange = useCallback((current, total) => {
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
    }, []);

    // Get schools offering the selected career's programs (memoized)
    const getSchoolsForCareer = useCallback((career) => {
        if (!career) return [];
        const careerProgs = getProgramsForCareer(career);
        const programIds = careerProgs.map(p => p.programId);

        return schoolPrograms
            .filter((sp) => sp && sp.program && sp.school && programIds.includes(sp.program.programId))
            .map((sp) => sp.school)
            .filter((school, index, self) =>
                index === self.findIndex((s) => s.schoolId === school.schoolId)
            );
    }, [getProgramsForCareer, schoolPrograms]);

    // Helper to get a school background (memoized)
    const schoolBackgroundMap = useMemo(() => ({
        "Cebu Institute of Technology": "path/to/citBackground.jpg",
        // ...add your mappings here...
    }), []);

    const getSchoolBackground = useCallback((schoolName) => {
        if (!schoolName) return null;
        const normalizedName = schoolName.toLowerCase();
        for (const [key, background] of Object.entries(schoolBackgroundMap)) {
            if (normalizedName.includes(key.toLowerCase())) {
                return background;
            }
        }
        return null;
    }, [schoolBackgroundMap]);

    // Format program names preview (memoized)
    const formatProgramsPreview = useCallback((career) => {
        const programsForCurrCareer = getProgramsForCareer(career);
        if (!programsForCurrCareer || programsForCurrCareer.length === 0) return "N/A";
        return programsForCurrCareer[0].programName;
    }, [getProgramsForCareer]);

    // Helper function to display the +X more correctly (memoized)
    const formatMoreProgramsText = useCallback((career) => {
        const programCount = getProgramsForCareer(career).length;
        if (programCount <= 1) return null;
        return `+${programCount - 1} more`;
    }, [getProgramsForCareer]);

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

    // Handler for clicking on the programs cell (memoized)
    const handleProgramsClick = useCallback((career) => {
        setSelectedProgramsCareer(career);
        setShowProgramsModal(true);
    }, []);

    // Handle error display
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
            <CareerHeader />

            <main className="max-w-[1600px] mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-1/4 w-full">
                        <div className="sticky top-4">
                            <CareerSidebarFilters
                                industries={industries}
                                selectedIndustry={selectedIndustry}
                                setSelectedIndustry={setSelectedIndustry}
                                filteredProgramsOptions={filteredProgramsOptions}
                                programSearch={programSearch}
                                setProgramSearch={setProgramSearch}
                                selectedProgram={selectedProgram}
                                setSelectedProgram={setSelectedProgram}
                                jobTrends={jobTrends}
                                selectedJobTrend={selectedJobTrend}
                                setSelectedJobTrend={setSelectedJobTrend}
                                selectedFilters={{ selectedIndustry, selectedProgram, selectedJobTrend, searchTerm }}
                                clearAllFilters={() => {
                                    setSelectedIndustry("");
                                    setSelectedProgram("");
                                    setSelectedSchool("");
                                    setSelectedJobTrend("");
                                    setSearchTerm("");
                                    setProgramSearch("");
                                }}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <section className="lg:w-3/4 w-full flex flex-col gap-6">
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
                                formatProgramsPreview={formatProgramsPreview}
                                getProgramsForCareer={getProgramsForCareer}
                                formatMoreProgramsText={formatMoreProgramsText}
                                getTrendStyle={getTrendStyle}
                                getTrendIcon={getTrendIcon}
                            />
                        </div>

                        <CareerLegend
                            getTrendStyle={getTrendStyle}
                            getTrendIcon={getTrendIcon}
                        />
                    </section>
                </div>
            </main>

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

            {showProgramsModal && selectedProgramsCareer && (
                <CareerProgramsModal
                    selectedProgramsCareer={selectedProgramsCareer}
                    setShowProgramsModal={setShowProgramsModal}
                    getProgramsForCareer={getProgramsForCareer}
                    getSchoolsForCareer={getSchoolsForCareer} // Passed for schools within programs
                    schoolPrograms={schoolPrograms} // For counting schools per program
                    getTrendStyle={getTrendStyle}
                    getTrendIcon={getTrendIcon}
                />
            )}

            {showSchoolsModal && selectedCareer && (
                <CareerSchoolsModal
                    selectedCareer={selectedCareer}
                    setShowSchoolsModal={setShowSchoolsModal}
                    getSchoolsForCareer={getSchoolsForCareer}
                    getSchoolBackground={getSchoolBackground}
                />
            )}
        </div>
    );
};

export default CareerPathways;