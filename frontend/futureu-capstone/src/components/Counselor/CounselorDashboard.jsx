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

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(16); // 16 per page for grid
  const [totalResults, setTotalResults] = useState(0);

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
      } catch (err) {
        console.error("Error fetching counts:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Fetch assessment results on mount (fetch all, paginate/filter in-memory)
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const allResults = await userAssessmentService.getAllAssessmentResults();
        setAssessmentResults(allResults);
        setTotalResults(allResults.length);
      } catch (err) {
        setError("Failed to load assessment results. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Filter and paginate results in-memory
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
    setTotalResults(results.length);
    // Paginate in-memory
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    setFilteredResults(results.slice(startIdx, endIdx));
  }, [searchStudent, selectedAssessment, assessmentResults, page, pageSize]);

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
    },
    {
      name: "Assessments",
      value: assessmentCount.toString(),
      icon: <FileText className="h-6 w-6" />,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    },
  ];

  // Counselor tools (dynamic counts)
  const counselorTools = [
    { name: 'Students', icon: <Users className="h-8 w-8 mb-3" />, count: studentCount },
    { name: 'Assessments', icon: <FileText className="h-8 w-8 mb-3" />, count: assessmentCount },
    { name: 'Reports', icon: <BarChart2 className="h-8 w-8 mb-3" />, count: assessmentResults.length },
    { name: 'Career Guidance', icon: <BookOpen className="h-8 w-8 mb-3" />, count: 0 }
  ];

  // Filter tools based on search term
  const filteredTools = counselorTools.filter((tool) => {
    return tool.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get unique assessment titles for filter dropdown
  const assessmentTitles = Array.from(new Set(assessmentResults.map(r => r.userAssessment?.assessment?.title).filter(Boolean)));
  const selectedAssessmentLabel = selectedAssessment || 'All Assessments';

  // Modal handlers
  const handleViewReport = (result) => {
    setSelectedResult(result);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedResult(null);
  };

  // Replace Recent Activity section with real recent completions
  const recentActivities = assessmentResults
    .filter(r => r.userAssessment?.dateCompleted)
    .sort((a, b) => new Date(b.userAssessment.dateCompleted) - new Date(a.userAssessment.dateCompleted))
    .slice(0, 5);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
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
      <header>
        <div className="px-15 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <p className="text-2xl font-bold text-[#2B3E4E]">
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

          {/* Search & Filter Bar */}
          <SearchFilterBar
            searchTerm={searchStudent}
            onSearchChange={setSearchStudent}
            filterOptions={assessmentTitles}
            selectedFilter={selectedAssessment}
            onFilterChange={setSelectedAssessment}
          />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex flex-col lg:flex-row gap-8 px-15">
        {/* Main Content Column */}
        <div className="flex-1 min-w-0">
          {/* Selected Assessment Heading */}
          <div className="text-left my-5">
            <h2 className="text-lg font-bold text-[#1D63A1]">
              Showing results for: <span className="text-[#FFB71B]">{selectedAssessmentLabel}</span>
            </h2>
          </div>

          {/* Assessment Results Grid */}
          <AssessmentResultsGrid
            results={filteredResults}
            onViewReport={handleViewReport}
            page={page}
            pageSize={pageSize}
            totalResults={totalResults}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />

          {/* Student Report Modal */}
          <StudentReportModal open={modalOpen} onClose={handleCloseModal} result={selectedResult} />
        </div>

        {/* Sidebar: Quick Stats + Recent Activity */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          {/* Small Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-3 flex flex-col items-center border border-gray-100"
              >
                <div className={`p-2 rounded-lg ${stat.color} mb-1 shadow-sm`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="text-xs text-gray-500 text-center">{stat.name}</div>
                <div className="text-lg font-bold text-[#2B3E4E] text-center">{stat.value}</div>
              </div>
            ))}
          </div>
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 animate-fade-in max-h-[340px] overflow-y-auto">
            <h3 className="text-base font-bold text-[#2B3E4E] mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentActivities.length === 0 ? (
                <div className="flex flex-col items-center py-4">
                  <img src="/src/assets/Students.png" alt="No activity" className="w-12 mb-1 opacity-80 animate-fade-in" />
                  <div className="text-gray-400 text-xs text-center">No recent activity yet.</div>
                </div>
              ) : recentActivities.map((activity, idx) => {
                const user = activity.userAssessment?.user || {};
                const assessment = activity.userAssessment?.assessment || {};
                return (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors animate-pop-in" style={{ animationDelay: `${idx * 60}ms` }}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D63A1] to-[#FFB71B] flex items-center justify-center text-white text-sm font-bold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium text-xs text-gray-800">{user.firstName} {user.lastName}</div>
                      <div className="truncate text-[11px] text-gray-500">{assessment.title}</div>
                    </div>
                    <div className="text-[10px] text-gray-400 whitespace-nowrap">{activity.userAssessment?.dateCompleted ? new Date(activity.userAssessment.dateCompleted).toLocaleDateString() : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

// Change the export to match component name
export default CounselorDashboard;