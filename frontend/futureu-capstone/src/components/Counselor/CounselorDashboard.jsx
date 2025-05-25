import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import adminUserService from '../../services/adminUserService';
import adminAssessmentService from '../../services/adminAssessmentService';
import userAssessmentService from '../../services/userAssessmentService';
import {
  Heart, Users, FileText, Search, Clock,
  BookOpen, User, LogOut, MessageSquare,
  BarChart2, Calendar, UserCheck
} from 'lucide-react';
import SearchFilterBar from './SearchFilterBar';
import AssessmentResultsInsights from './AssessmentResultsInsights';
import AssessmentResultsGrid from './AssessmentResultsGrid';
import StudentReportModal from './StudentReportModal';

// Change component name to match the file name
const CounselorDashboard = () => {
  const navigate = useNavigate();
  const counselorUser = authService.getCurrentUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // States for storing data counts
  const [studentCount, setStudentCount] = useState(0);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0); // For future use
  const [counselingSessionCount, setCounselingSessionCount] = useState(0); // For future use

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add state for assessment results, search/filter, and modal
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchStudent, setSearchStudent] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Fetch counts on component mount
  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch data in parallel
        const [users, assessments] = await Promise.all([
          adminUserService.getAllUsers(),
          adminAssessmentService.getAllAssessments()
        ]);

        // Filter only student users
        const students = users.filter(user => user.role === 'STUDENT');

        // Update state with actual counts
        setStudentCount(students.length);
        setAssessmentCount(assessments.length);

        // Placeholder values for features that might be implemented later
        setAppointmentCount(0);
        setCounselingSessionCount(0);
      } catch (err) {
        console.error("Error fetching counts:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Fetch assessment results on mount
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const results = await userAssessmentService.getAllAssessmentResults();
        setAssessmentResults(results);
        setFilteredResults(results);
      } catch (err) {
        setError("Failed to load assessment results. Please try again later.");
      }
    };
    fetchResults();
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Format time
  const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  // Update this function
  const handleLogout = () => {
    authService.signout();
    navigate('/counselor/login'); // Updated path
  };

  // Handle tool click
  const handleToolClick = (toolName) => {
    switch(toolName) {
      case 'Students':
        navigate('/counselor/students');
        break;
      case 'Assessments':
        navigate('/counselor/assessments');
        break;
      case 'Reports':
        navigate('/counselor/reports');
        break;
      default:
        alert(`${toolName} management coming soon!`);
    }
  };

  // Quick stats for the dashboard
  const quickStats = [
    {
      name: "Total Students",
      value: studentCount.toString(),
      icon: <Users className="h-6 w-6" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      increase: "+12%", // Placeholder
      isUp: true,
    },
    {
      name: "Assessments",
      value: assessmentCount.toString(),
      icon: <FileText className="h-6 w-6" />,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      increase: "+8%",
      isUp: true,
    },
    {
      name: "Appointments",
      value: appointmentCount.toString(),
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      increase: "+5%",
      isUp: true,
    },
    {
      name: "Counseling Sessions",
      value: counselingSessionCount.toString(),
      icon: <MessageSquare className="h-6 w-6" />,
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      increase: "+15%",
      isUp: true,
    },
  ];

  // Counselor tools
  const counselorTools = [
    { name: 'Students', icon: <Users className="h-8 w-8 mb-3" />, count: studentCount },
    { name: 'Assessments', icon: <FileText className="h-8 w-8 mb-3" />, count: assessmentCount },
    { name: 'Appointments', icon: <Calendar className="h-8 w-8 mb-3" />, count: appointmentCount },
    { name: 'Counseling Sessions', icon: <MessageSquare className="h-8 w-8 mb-3" />, count: counselingSessionCount },
    { name: 'Reports', icon: <BarChart2 className="h-8 w-8 mb-3" />, count: 0 },
    { name: 'Career Guidance', icon: <BookOpen className="h-8 w-8 mb-3" />, count: 0 }
  ];

  // Filter tools based on search term
  const filteredTools = counselorTools.filter((tool) => {
    return tool.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter logic
  useEffect(() => {
    let results = [...assessmentResults];
    if (searchStudent) {
      results = results.filter(r => {
        const user = r.userAssessment?.user || {};
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        return fullName.includes(searchStudent.toLowerCase()) || (user.email || '').toLowerCase().includes(searchStudent.toLowerCase());
      });
    }
    if (selectedAssessment) {
      results = results.filter(r => (r.userAssessment?.assessment?.title || '') === selectedAssessment);
    }
    setFilteredResults(results);
  }, [searchStudent, selectedAssessment, assessmentResults]);

  // Get unique assessment titles for filter dropdown
  const assessmentTitles = Array.from(new Set(assessmentResults.map(r => r.userAssessment?.assessment?.title).filter(Boolean)));

  // Modal handlers
  const handleViewReport = (result) => {
    setSelectedResult(result);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedResult(null);
  };

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="loader"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">Dashboard Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-[#1D63A1] text-white rounded-lg hover:bg-[#1D63A1]/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <p className="text-lg font-bold text-[#2B3E4E]">
                Welcome back, <span className="text-[#1D63A1]">
                  {counselorUser && counselorUser.firstName ? counselorUser.firstName : "Career Guide"}
                </span>
              </p>
              <div className="flex items-center text-gray-500 mt-1">
                <Clock className="h-4 w-4 mr-1.5" />
                <span className="text-xs">{formattedTime}</span>
                <span className="mx-1.5">•</span>
                <span className="text-xs">{formattedDate}</span>
              </div>
            </div>

            <div className="relative w-2/5 mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tools..."
                className="pl-12 pr-4 py-3 rounded-xl border border-gray-200 w-full bg-white text-gray-900 shadow-lg focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${stat.color} mr-4 shadow-lg`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <h3 className="text-2xl font-bold text-[#2B3E4E]">{stat.value}</h3>
                  </div>
                </div>
                {stat.increase && (
                  <div className={`text-sm font-medium ${stat.isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.increase}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Aggregated Insights */}
        <AssessmentResultsInsights results={filteredResults} />

        {/* Search & Filter Bar */}
        <SearchFilterBar
          searchTerm={searchStudent}
          onSearchChange={setSearchStudent}
          filterOptions={assessmentTitles}
          selectedFilter={selectedAssessment}
          onFilterChange={setSelectedAssessment}
        />

        {/* Assessment Results Grid */}
        <AssessmentResultsGrid results={filteredResults} onViewReport={handleViewReport} />

        {/* Student Report Modal */}
        <StudentReportModal open={modalOpen} onClose={handleCloseModal} result={selectedResult} />

        {/* Career Guidance Tools Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            {/* Update the section title */}
            <h2 className="text-xl font-bold text-[#2B3E4E]">Career Guidance Tools</h2>
            <div className="text-sm text-gray-500">
              {filteredTools.length} tools available
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredTools.map((tool, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#FFB71B] cursor-pointer group overflow-hidden transform hover:-translate-y-1"
                onClick={() => handleToolClick(tool.name)}
              >
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-xl bg-[#2B3E4E]/5 group-hover:bg-[#FFB71B]/10 mb-4 transition-colors">
                      <div className="text-[#2B3E4E] group-hover:text-[#FFB71B] transition-colors">
                        {tool.icon}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 group-hover:text-[#2B3E4E]">
                      {tool.name}
                    </h3>
                    <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tool.count} items
                    </span>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-[#2B3E4E] to-[#FFB71B] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// Change the export to match component name
export default CounselorDashboard;