import React, { useState, useEffect } from "react";
// Currently using mock data from schools.js
import { schools } from "../data/schools";
import GuideModal from "./accreditation/GuideModal";
import SchoolsList from "./accreditation/SchoolsList";
import StatsCards from "./accreditation/StatsCards";
import FilterOptions from "./accreditation/FilterOptions";
import ProgramsTab from "./accreditation/tabs/ProgramsTab";
import StatisticsTab from "./accreditation/tabs/StatisticsTab";
import AboutTab from "./accreditation/tabs/AboutTab";
// Import the accreditation service
import accreditationService from "../services/accreditationService";

const AccreditationRatings = () => {
  // State declarations
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgramType, setSelectedProgramType] = useState("");
  const [selectedAccreditationLevel, setSelectedAccreditationLevel] = useState("");
  const [selectedRecognition, setSelectedRecognition] = useState("");
  const [activeTab, setActiveTab] = useState("programs");
  const [showFilters, setShowFilters] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  
  // Animation states
  const [pageLoaded, setPageLoaded] = useState(false);
  const [heroAnimated, setHeroAnimated] = useState(false);
  const [cardsAnimated, setCardsAnimated] = useState(false);
  const [contentAnimated, setContentAnimated] = useState(false);

  // NOTE: For future implementation - Replace hard-coded data with API fetch
  // Uncomment this code and remove the import { schools } when ready to use real data
  /*
  // Add these state variables at the top with the other state declarations
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccreditationData = async () => {
      try {
        setLoading(true);
        // Use accreditationService instead of raw fetch
        const data = await accreditationService.getAllAccreditationData();
        setSchools(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching accreditation data:', error);
        setError('Failed to load accreditation data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAccreditationData();
  }, []);

  // Add this conditional rendering to handle loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-800 border-r-transparent mb-4"></div>
          <p className="text-gray-700">Loading accreditation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  */

  // Trigger animations on component mount
  useEffect(() => {
    setPageLoaded(true);
    
    // Staggered animations
    setTimeout(() => setHeroAnimated(true), 100);
    setTimeout(() => setCardsAnimated(true), 400);
    setTimeout(() => setContentAnimated(true), 700);
  }, []);
  
  // Handle tab switching animation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "statistics") {
      // Reset the animation state first
      setStatsVisible(false);
      // Then trigger animation after a small delay
      setTimeout(() => {
        setStatsVisible(true);
      }, 100);
    }
  };

  // Helper function to get all programs from a school
  const getAllPrograms = (school) => {
    return school.programs.flatMap((category) =>
      category.items.map((program) => ({
        ...program,
        schoolName: school.name,
        category: category.category,
      }))
    );
  };

  // Filter programs based on selected criteria
  const filteredPrograms = schools
    .flatMap((school) => getAllPrograms(school))
    .filter((program) => {
      if (selectedSchool !== null && program.schoolName !== schools[selectedSchool].name)
        return false;
      if (searchTerm && !program.name.toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
      if (selectedProgramType && program.category !== selectedProgramType)
        return false;
      if (selectedAccreditationLevel && program.level !== parseInt(selectedAccreditationLevel))
        return false;
      if (selectedRecognition && program.recognition !== selectedRecognition)
        return false;
      return true;
    });

  // Calculate statistics
  const totalSchools = schools.length;
  const coePrograms = filteredPrograms.filter(p => p.recognition === "COE").length;
  const codPrograms = filteredPrograms.filter(p => p.recognition === "COD").length;
  const totalPrograms = filteredPrograms.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Dark blue banner with text */}
      <div className={`bg-slate-800 text-white py-12 px-6 relative overflow-hidden transition-all duration-700 ease-out transform ${heroAnimated ? 'opacity-100' : 'opacity-0 translate-y-[-20px]'}`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Accreditation & Recognition Status</h1>
          <p className="text-lg text-gray-300">Explore the quality assurance ratings of educational institutions</p>
        </div>
        
        {/* Wave shape at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* Search bar */}
      <div className={`max-w-7xl mx-auto px-4 py-6 -mt-2 relative z-10 flex gap-4 transition-all duration-700 ease-out ${heroAnimated ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-full text-sm bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 bg-white text-gray-700 px-5 py-3 rounded-full border border-gray-100 shadow-md hover:bg-gray-50 text-sm focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filter</span>
        </button>
        
        {/* Guide Button */}
        <button
          onClick={() => setShowGuideModal(true)}
          className="flex items-center space-x-2 bg-white text-[#2B3E4E] px-5 py-3 rounded-full border border-gray-100 shadow-md hover:bg-gray-50 text-sm focus:outline-none transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Guide</span>
        </button>
      </div>
        
      {/* Filter options */}
      {showFilters && (
        <FilterOptions
          selectedProgramType={selectedProgramType}
          setSelectedProgramType={setSelectedProgramType}
          selectedAccreditationLevel={selectedAccreditationLevel}
          setSelectedAccreditationLevel={setSelectedAccreditationLevel}
          selectedRecognition={selectedRecognition}
          setSelectedRecognition={setSelectedRecognition}
        />
      )}

      {/* Guide Modal */}
      {showGuideModal && <GuideModal onClose={() => setShowGuideModal(false)} />}

      {/* Stats Cards */}
      <StatsCards 
        totalSchools={totalSchools}
        coePrograms={coePrograms}
        codPrograms={codPrograms}
        totalPrograms={totalPrograms}
        cardsAnimated={cardsAnimated}
      />

      {/* Main content area with tabs */}
      <div className={`max-w-7xl mx-auto px-4 pb-16 transition-all duration-700 ease-out transform ${contentAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Schools List */}
          <SchoolsList 
            schools={schools}
            selectedSchool={selectedSchool}
            setSelectedSchool={setSelectedSchool}
            contentAnimated={contentAnimated}
          />

          {/* Right Content */}
          <div className="lg:w-3/4">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => handleTabChange("programs")}
                  className={`${activeTab === "programs" ? "border-yellow-500 text-yellow-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-300`}
                >
                  Programs
                </button>
                <button
                  onClick={() => handleTabChange("statistics")}
                  className={`${activeTab === "statistics" ? "border-yellow-500 text-yellow-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-300`}
                >
                  Statistics
                </button>
                <button
                  onClick={() => handleTabChange("about")}
                  className={`${activeTab === "about" ? "border-yellow-500 text-yellow-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-300`}
                >
                  About Accreditation
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === "programs" && (
                <ProgramsTab 
                  filteredPrograms={filteredPrograms}
                  contentAnimated={contentAnimated}
                />
              )}
              
              {activeTab === "statistics" && (
                <StatisticsTab 
                  filteredPrograms={filteredPrograms}
                  statsVisible={statsVisible}
                />
              )}
              
              {activeTab === "about" && <AboutTab />}
            </div>
          </div>
        </div>
      </div>

      {/* Animation styling */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AccreditationRatings;