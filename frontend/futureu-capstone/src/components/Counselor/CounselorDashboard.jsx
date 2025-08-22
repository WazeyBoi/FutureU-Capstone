import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import adminUserService from '../../services/adminServices/adminUserService';
import adminAssessmentService from '../../services/adminServices/adminAssessmentService';
import userAssessmentService from '../../services/userAssessmentService';
import { fetchAllCareerRecommendations } from '../../services/recommendationService';
import programRecommendationService from '../../services/programRecommendationService';
import {
  Heart, Users, FileText, Search, Clock,
  BookOpen, User, LogOut, MessageSquare,
  BarChart2, Calendar, UserCheck
} from 'lucide-react';
import SearchFilterBar from './SearchFilterBar';
import AssessmentResultsInsights from './AssessmentResultsInsights';
import AssessmentResultsGrid from './AssessmentResultsGrid';
import StudentReportPage from './StudentReportPage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Change component name to match the file name
const CounselorDashboard = () => {
  const navigate = useNavigate();
  const [counselorUser, setCounselorUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // States for storing data counts
  const [studentCount, setStudentCount] = useState(0);
  const [assessmentCount, setAssessmentCount] = useState(0);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch counselor user info
  useEffect(() => {
    const fetchCounselorUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCounselorUser(user);
      } catch (error) {
        console.error('Error fetching counselor user:', error);
        setCounselorUser(null);
      }
    };
    
    fetchCounselorUser();
  }, []);

  // Add state for assessment results, search/filter, and modal
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchStudent, setSearchStudent] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [allCareerRecommendations, setAllCareerRecommendations] = useState([]);
  const [allProgramRecommendations, setAllProgramRecommendations] = useState([]);

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

  // Fetch all career recommendations for dashboard summary
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await fetchAllCareerRecommendations();
        setAllCareerRecommendations(res.data || []);
      } catch (err) {
        // Optionally handle error
        setAllCareerRecommendations([]);
      }
    };
    fetchCareers();
  }, []);

  // Fetch all program recommendations for dashboard summary
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await programRecommendationService.fetchAllProgramRecommendations();
        setAllProgramRecommendations(res.data || []);
      } catch (err) {
        setAllProgramRecommendations([]);
      }
    };
    fetchPrograms();
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

  // View summary handler for navigation
  const handleViewSummary = (result) => {
    navigate('/counselor/student-report', { state: { result } });
  };

  // Calculate average time spent (in minutes) for all completed assessments
  const getAverageTimeSpent = (results) => {
    // Use timeSpentSeconds from userAssessment if available
    const times = results
      .map(r => {
        const seconds = Number(r.userAssessment?.timeSpentSeconds);
        return (!isNaN(seconds) && seconds > 0) ? seconds : null;
      })
      .filter(v => v !== null);
    if (!times.length) return 0;
    // Average in minutes
    return times.reduce((a, b) => a + b, 0) / times.length / 60;
  };
  const averageTimeSpent = getAverageTimeSpent(assessmentResults);

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
    {
      name: "Avg Time",
      value: <>{averageTimeSpent.toFixed(1)}<span className="text-xs front-light ml-1">min</span></>,
      icon: <Clock className="h-6 w-6" />,
      color: "bg-gradient-to-br from-green-400 to-green-600",
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
    navigate('/counselor/student-report', { state: { result } });
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

  // RIASEC and Career/Program aggregation logic
  const getRiasecTopCode = (result) => {
    const scores = [
      { code: 'R', value: result.realisticScore },
      { code: 'I', value: result.investigativeScore },
      { code: 'A', value: result.artisticScore },
      { code: 'S', value: result.socialScore },
      { code: 'E', value: result.enterprisingScore },
      { code: 'C', value: result.conventionalScore },
    ];
    return scores
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(s => s.code)
      .join('');
  };

  // Only include these fields in the vertical bar chart:
  const nonRiasecFields = [
    { key: 'scientificAbilityScore', label: 'Scientific' },
    { key: 'readingComprehensionScore', label: 'Reading' },
    { key: 'verbalAbilityScore', label: 'Verbal' },
    { key: 'mathematicalAbilityScore', label: 'Math' },
    { key: 'logicalReasoningScore', label: 'Logic' },
    { key: 'stemScore', label: 'STEM' },
    { key: 'abmScore', label: 'ABM' },
    { key: 'humssScore', label: 'HUMSS' },
    { key: 'tvlScore', label: 'TVL' },
    { key: 'sportsTrackScore', label: 'Sports' },
    { key: 'artsDesignTrackScore', label: 'Arts & Design' },
  ];

  const aggregateDashboardInsights = (results, allCareers, allPrograms) => {
    // RIASEC aggregation (new algorithm)
    const riasecCodeCounts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    results.forEach(r => {
      const scores = [
        { code: 'R', value: r.realisticScore },
        { code: 'I', value: r.investigativeScore },
        { code: 'A', value: r.artisticScore },
        { code: 'S', value: r.socialScore },
        { code: 'E', value: r.enterprisingScore },
        { code: 'C', value: r.conventionalScore },
      ];
      const max = Math.max(...scores.map(s => s.value));
      scores.filter(s => s.value === max).forEach(s => {
        if (s.value !== undefined && s.value !== null && !isNaN(s.value)) {
          riasecCodeCounts[s.code] = (riasecCodeCounts[s.code] || 0) + 1;
        }
      });
    });
    // Find the most common code(s)
    const maxCount = Math.max(...Object.values(riasecCodeCounts));
    const mostCommonCodes = Object.entries(riasecCodeCounts)
      .filter(([code, count]) => count === maxCount && count > 0)
      .map(([code]) => code);
    // For display, join with comma if tie
    const mostCommonRiasec = mostCommonCodes.length > 0 ? mostCommonCodes.join(', ') : 'N/A';

    // Non-RIASEC averages (from assessmentResults)
    const nonRiasecAverages = {};
    nonRiasecFields.forEach(f => {
      const vals = results.map(r => Number(r[f.key]) || 0).filter(v => !isNaN(v));
      nonRiasecAverages[f.key] = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '0.00';
    });

    // Career recommendations aggregation (from allCareerRecommendations)
    const careerCounts = {};
    allCareers.forEach(rec => {
      const title = rec.careerPath?.careerTitle || rec.careerTitle || rec.name || rec.title;
      if (title) careerCounts[title] = (careerCounts[title] || 0) + 1;
    });
    const topCareers = Object.entries(careerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([title, count]) => ({ title, count }));

    // Program recommendations aggregation (from allProgramRecommendations)
    const programCounts = {};
    allPrograms.forEach(rec => {
      const name = rec.program?.programName || rec.programName || rec.name || rec.title;
      if (name) programCounts[name] = (programCounts[name] || 0) + 1;
    });
    const topPrograms = Object.entries(programCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return { mostCommonRiasec, nonRiasecAverages, topCareers, topPrograms, riasecCodeCounts, mostCommonCodes };
  };

  // Aggregate insights for dashboard summary
  const dashboardInsights = aggregateDashboardInsights(assessmentResults, allCareerRecommendations, allProgramRecommendations);

  // Define grouped fields for the chart (must be after dashboardInsights)
  const gsaFields = [
    { key: 'scientificAbilityScore', label: 'Scientific' },
    { key: 'readingComprehensionScore', label: 'Reading' },
    { key: 'verbalAbilityScore', label: 'Verbal' },
    { key: 'mathematicalAbilityScore', label: 'Math' },
    { key: 'logicalReasoningScore', label: 'Logic' },
  ];
  const academicFields = [
    { key: 'stemScore', label: 'STEM' },
    { key: 'abmScore', label: 'ABM' },
    { key: 'humssScore', label: 'HUMSS' },
  ];
  const nonAcademicFields = [
    { key: 'tvlScore', label: 'TVL' },
    { key: 'sportsTrackScore', label: 'Sports' },
    { key: 'artsDesignTrackScore', label: 'Arts & Design' },
  ];
  // For chart rendering, combine with section info
  const chartSections = [
    { name: 'General Scholastic Aptitude', color: '#1D63A1', fields: gsaFields },
    { name: 'Academic Track', color: '#FFB71B', fields: academicFields },
    { name: 'Non-Academic Track', color: '#4CAF50', fields: nonAcademicFields },
  ];
  // Flatten for chart, but keep section info for custom rendering
  const chartData = chartSections.flatMap(section =>
    section.fields.map(f => ({
      ...f,
      value: Number(dashboardInsights.nonRiasecAverages[f.key]),
      section: section.name,
      sectionColor: section.color,
    }))
  );

  // Custom XAxis tick to add section labels and dividers
  const CustomXAxisTick = (props) => {
    const { x, y, payload, index } = props;
    // Section label positions
    const sectionLabels = [
      { idx: 2, label: 'General Scholastic Aptitude', color: '#1D63A1' },
      { idx: 6, label: 'Academic Track', color: '#FFB71B' },
      { idx: 9, label: 'Non-Academic Track', color: '#4CAF50' },
    ];
    const label = sectionLabels.find(l => l.idx === index);
    return (
      <g>
        <text x={x} y={y + 15} textAnchor="middle" fontSize="11" fill="#333">{payload.value}</text>
        {label && (
          <text x={x} y={y + 50} textAnchor="middle" fontSize="12" fontWeight="bold" fill={label.color}>{label.label}</text>
        )}
      </g>
    );
  };

  // --- REAL DATA for students ---
  const [students, setStudents] = useState([]);

  // Fetch all students on mount (replace mockStudents)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const users = await adminUserService.getAllUsers();
        const studentUsers = users.filter(user => user.role === 'STUDENT');
        setStudents(studentUsers);
      } catch (err) {
        setStudents([]); // fallback to empty
      }
    };
    fetchStudents();
  }, []);

  // Normalize user id for matching (id or userId)
  const getUserId = user => user?.id || user?.userId;

  // Assessment Completion Rate (real data, robust id matching)
  const studentsWithResultsIds = new Set(
    assessmentResults.map(r => getUserId(r.userAssessment?.user)).filter(Boolean)
  );
  const studentsWithNoResults = students.filter(s => !studentsWithResultsIds.has(getUserId(s)));
  const completionRate = students.length > 0 ? ((students.length - studentsWithNoResults.length) / students.length * 100).toFixed(1) : '0.0';

  // Students Needing Attention (not started, not completed, or low scores)
  // Only include students whose most recent attempt is < 50 in any nonRiasecFields, or have no results
  const userIdMap = user => user?.id || user?.userId;

  // Map: userId -> all their results (sorted by dateCompleted or dateComputed desc)
  const userResultsMap = {};
  assessmentResults.forEach(r => {
    const user = r.userAssessment?.user;
    const id = userIdMap(user);
    if (!id) return;
    if (!userResultsMap[id]) userResultsMap[id] = [];
    userResultsMap[id].push(r);
  });
  // Sort each user's results by dateCompleted or dateComputed desc
  Object.values(userResultsMap).forEach(arr => arr.sort((a, b) => {
    const aDate = new Date(b.userAssessment?.dateCompleted || b.dateComputed || 0);
    const bDate = new Date(a.userAssessment?.dateCompleted || a.dateComputed || 0);
    return aDate - bDate;
  }));

  // Students with low most recent score
  const studentsWithLowRecentScores = students.filter(s => {
    const id = userIdMap(s);
    const results = userResultsMap[id];
    if (!results || results.length === 0) return false; // skip, handled by studentsWithNoResults
    const mostRecent = results[0];
    // Low score is < 50 in any nonRiasecFields
    return nonRiasecFields.some(f => Number(mostRecent[f.key]) < 50);
  });

  const studentsNeedingAttention = [
    ...studentsWithNoResults,
    ...studentsWithLowRecentScores
  ];

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
    <div className="min-h-screen bg-gray-50 pb-5">
      <div className="px-15 pt-10 flex flex-col items-start">
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
      {/* Insights Summary Section */}
      <section className="w-full px-15 pt-6 pb-2">
        {/* Average Scores (Non-RIASEC) at the top, full width, styled as a card */}
        <div className="flex flex-row gap-2 mb-8 items-start">
          {/* Chart container */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center w-full max-w-[calc(100%-280px)]">
            <div className="flex items-center w-full mb-4">
              <div className="flex-1 text-2xl font-bold text-[#1D63A1] tracking-tight">Average Scoring for each Category</div>
              {/* Optionally add a small legend or icon here */}
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} layout="horizontal" margin={{ left: 10, right: 10, top: 10, bottom: 30 }}>
                <XAxis dataKey="label" tick={CustomXAxisTick} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.sectionColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Small Quick Stats - now fully independent */}
          <div className='flex flex-col gap-2 w-[235px]'>
            <div className="flex flex-wrap gap-2 w-[248px] h-auto self-start" style={{ minWidth: '240px' }}>
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100 w-28 h-28 justify-center transition-all duration-200 hover:shadow-lg"
                  style={{ aspectRatio: '1 / 1' }}
                >
                  <div className={`p-2 rounded-lg ${stat.color} mb-1 shadow-sm`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">{stat.name}</div>
                  <div className="text-lg font-bold text-[#2B3E4E] text-center">{stat.value}</div>
                </div>
              ))}
            </div>
            {/* Most Common RIASEC */}
            <div className="bg-white rounded-xl shadow border border-gray-100 flex flex-col items-center py-4 px-4 min-h-0 hover:shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-2">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs uppercase text-gray-400 font-semibold mb-0.5 tracking-wider text-center">Most Common Personality</div>
              <div className="text-2xl font-bold text-[#1D63A1] mb-0.5 text-center">{dashboardInsights.mostCommonRiasec}</div>
              <div className="text-xs text-gray-400 mb-0.5 text-center">(Top RIASEC code{dashboardInsights.mostCommonCodes && dashboardInsights.mostCommonCodes.length > 1 ? 's' : ''})</div>
              <div className="text-xs text-gray-500 text-center mb-0.5">
                {/* Show code descriptions for all most common codes */}
                {dashboardInsights.mostCommonCodes && dashboardInsights.mostCommonCodes.map((code, idx) => {
                  const descMap = {
                    R: 'Realistic',
                    I: 'Investigative',
                    A: 'Artistic',
                    S: 'Social',
                    E: 'Enterprising',
                    C: 'Conventional',
                  };
                  return <span key={code}>{descMap[code]}{idx < dashboardInsights.mostCommonCodes.length - 1 ? ', ' : ''}</span>;
                })}
              </div>
              <div className="text-xs text-blue-500 font-semibold text-center">
                {(() => {
                  // Count how many assessments had each of the most common codes as their highest (including ties)
                  const total = assessmentResults.length;
                  const codeCount = assessmentResults.reduce((acc, r) => {
                    const scores = [
                      { code: 'R', value: r.realisticScore },
                      { code: 'I', value: r.investigativeScore },
                      { code: 'A', value: r.artisticScore },
                      { code: 'S', value: r.socialScore },
                      { code: 'E', value: r.enterprisingScore },
                      { code: 'C', value: r.conventionalScore },
                    ];
                    const max = Math.max(...scores.map(s => s.value));
                    const topCodes = scores.filter(s => s.value === max).map(s => s.code);
                    // If any of the most common codes is in this assessment's top codes, count it
                    if (dashboardInsights.mostCommonCodes && dashboardInsights.mostCommonCodes.some(code => topCodes.includes(code))) {
                      return acc + 1;
                    }
                    return acc;
                  }, 0);
                  return total > 0 ? `${codeCount} students • ${(codeCount / total * 100).toFixed(1)}%` : '';
                })()}
              </div>
            </div>
          </div>
        </div>
        {/* Divider for visual separation */}
        <div className="w-full h-2" />
        {/* The 4 summary cards below in a row, modern dashboard style */}
        <div className="flex flex-row gap-4">
          {/* Most Recommended Careers */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center py-6 px-8 min-h-[170px]">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 mb-3">
              <BarChart2 className="w-7 h-7 text-white" />
            </div>
            <div className="text-xs uppercase text-gray-400 font-semibold mb-1 tracking-wider">Most Recommended Careers</div>
            {dashboardInsights.topCareers.length === 0 ? (
              <div className="text-gray-400 text-xs">No data</div>
            ) : dashboardInsights.topCareers.map((c, i) => {
              const total = allCareerRecommendations.length;
              const percent = total > 0 ? ((c.count / total) * 100).toFixed(1) : '0.0';
              return (
                <div key={i} className="text-left flex justify-between w-full text-sm font-semibold text-cyan-700 items-center mb-1">
                  <span className="flex items-center gap-2">
                    <span className="text-base font-bold">{i + 1}.</span> {c.title}
                  </span>
                  <span className="text-xs text-gray-400">{c.count} ({percent}%)</span>
                </div>
              );
            })}
          </div>
          {/* Most Recommended Programs */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center py-6 px-8 min-h-[170px]">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mb-3">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="text-xs uppercase text-gray-400 font-semibold mb-1 tracking-wider">Most Recommended Programs</div>
            {dashboardInsights.topPrograms.length === 0 ? (
              <div className="text-gray-400 text-xs">No data</div>
            ) : dashboardInsights.topPrograms.map((p, i) => {
              const total = allProgramRecommendations.length;
              const percent = total > 0 ? ((p.count / total) * 100).toFixed(1) : '0.0';
              let desc = '';
              const found = allProgramRecommendations.find(rec => (rec.program?.programName || rec.programName) === p.name);
              if (found && (found.program?.description || found.description)) {
                desc = found.program?.description || found.description;
              }
              return (
                <div key={i} className="flex flex-col w-full mb-1">
                  <div className="flex justify-between items-center text-sm font-semibold text-yellow-700">
                    <span className="text-left flex items-center gap-2">
                      <span className="text-base font-bold">{i + 1}.</span> {p.name}
                    </span>
                    <span className="text-xs text-gray-400">{p.count} ({percent}%)</span>
                  </div>
                  {desc && <div className="text-left text-xs text-gray-500 ml-6">{desc}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Header */}
      <header>
        <div className="px-15 py-4">
          <div className="flex items-center justify-between">
            {/* Selected Assessment Heading */}
            <div className="text-left my-5">
              <h2 className="text-1xl font-medium text-[#2B3E4E]">
                Showing results for: <br/><span className="text-[#FFB71B] text-3xl font-bold">{selectedAssessmentLabel}</span>
              </h2>
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

          {/* Assessment Results Grid */}
          <AssessmentResultsGrid
            results={filteredResults}
            onViewReport={handleViewSummary}
            page={page}
            pageSize={pageSize}
            totalResults={totalResults}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />

          {/* Student Report Modal */}
          {/* <StudentReportModal open={modalOpen} onClose={handleCloseModal} result={selectedResult} /> */}
        </div>

        {/* Sidebar: Quick Stats + Recent Activity */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          {/* Assessment Completion Rate */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-4 animate-fade-in">
            <h3 className="text-base font-bold text-[#2B3E4E] mb-1">Assessment Completion Rate</h3>
            <div className="text-2xl font-bold text-green-600 mb-1">{completionRate}%</div>
            <div className="text-xs text-gray-500 mb-2">{students.length - studentsWithNoResults.length} of {students.length} students completed at least one assessment</div>
            {studentsWithNoResults.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Students with no results:</div>
                <ul className="max-h-20 overflow-y-auto text-xs text-gray-700">
                  {studentsWithNoResults.map((student, idx) => (
                    <li key={getUserId(student) || idx} className="mb-1 truncate">{student.firstName} {student.lastName || student.lastname}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Students Needing Attention */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-4 animate-fade-in">
            <h3 className="text-base font-bold text-[#B91C1C] mb-1">Students Needing Attention</h3>
            {studentsNeedingAttention.length === 0 ? (
              <div className="text-gray-400 text-xs">No students need attention!</div>
            ) : (
              <ul className="max-h-20 overflow-y-auto text-xs text-gray-700">
                {studentsNeedingAttention.map((student, idx) => (
                  <li key={userIdMap(student) || idx} className="mb-1 truncate">{student.firstName} {student.lastName || student.lastname}</li>
                ))}
              </ul>
            )}
            <div className="text-[10px] text-gray-400 mt-1">Includes students with no results or low scores (&lt; 50)</div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 animate-fade-in max-h-[340px] overflow-y-auto">
            <h3 className="text-base font-bold text-[#2B3E4E] mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentActivities.length === 0 ? (
                <div className="flex flex-col items-center py-4">
                  <img src="/src/assets/characters/lazy.svg" alt="No activity" className="w-12 mb-1 opacity-80 animate-fade-in" />
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
                    <div className="flext-start flex-1 min-w-0">
                      <div className="text-left truncate font-medium text-xs text-gray-800">{user.firstName} {user.lastName}</div>
                      <div className="text-left truncate text-[11px] text-gray-500">{assessment.title}</div>
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