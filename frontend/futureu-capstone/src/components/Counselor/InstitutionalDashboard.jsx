import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import counselorService from '../../services/counselorService';
import authService from '../../services/authService';
import userAssessmentService from '../../services/userAssessmentService';
import { fetchAllCareerRecommendations } from '../../services/recommendationService';
import programRecommendationService from '../../services/programRecommendationService';
import {
  Heart, Users, FileText, Search, Clock,
  BookOpen, User, LogOut, MessageSquare,
  BarChart2, Calendar, UserCheck, GraduationCap, BarChart3, Download, School, Mail, Hash, ArrowLeft
} from 'lucide-react';
import SearchFilterBar from './SearchFilterBar';
import AssessmentResultsGrid from './AssessmentResultsGrid';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const InstitutionalDashboard = () => {
  const navigate = useNavigate();
  const counselorUser = authService.getCurrentUser();
  const counselorId = authService.getCurrentUserId();
  
  // Institution and filtering states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [institutionInfo, setInstitutionInfo] = useState(null);
  const [institutionStudents, setInstitutionStudents] = useState([]);
  
  // Assessment data states - filtered for institution
  const [allAssessmentResults, setAllAssessmentResults] = useState([]);
  const [institutionAssessmentResults, setInstitutionAssessmentResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  
  // Search and filter states
  const [searchStudent, setSearchStudent] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  
  // Career and program recommendations for institution students
  const [institutionCareerRecommendations, setInstitutionCareerRecommendations] = useState([]);
  const [institutionProgramRecommendations, setInstitutionProgramRecommendations] = useState([]);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);
  const [totalResults, setTotalResults] = useState(0);
  
  // Time and stats
  const [currentTime, setCurrentTime] = useState(new Date());
  const [assessmentStats, setAssessmentStats] = useState({});

  // Fetch institution data and filtered results
  useEffect(() => {
    const fetchInstitutionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch counselor's institution info
        const institution = await counselorService.getCounselorInstitution(counselorId);
        setInstitutionInfo(institution);

        // Fetch filtered student results for the institution
        const institutionStudentData = await counselorService.getInstitutionStudentResults(counselorId);
        setInstitutionStudents(institutionStudentData);

        // Fetch all assessment results and filter for institution students
        const allResults = await userAssessmentService.getAllAssessmentResults();
        setAllAssessmentResults(allResults);
        
        // Filter results for institution students only
        const institutionUserIds = new Set(
          institutionStudentData.map(student => student.userId || student.id)
        );
        
        const filteredAssessmentResults = allResults.filter(result => {
          const userId = result.userAssessment?.user?.id || result.userAssessment?.user?.userId;
          return institutionUserIds.has(userId);
        });
        
        setInstitutionAssessmentResults(filteredAssessmentResults);
        setTotalResults(filteredAssessmentResults.length);

        // Fetch assessment statistics for institution
        const stats = await counselorService.getInstitutionAssessmentStats(counselorId);
        setAssessmentStats(stats);

        setLoading(false);
      } catch (err) {
        setError('Failed to load institutional dashboard data. Please try again later.');
        setLoading(false);
        console.error('Error fetching institution data:', err);
      }
    };

    if (counselorId) {
      fetchInstitutionData();
    }
  }, [counselorId]);

  // Fetch career recommendations for institution students
  useEffect(() => {
    const fetchInstitutionCareers = async () => {
      try {
        const allCareers = await fetchAllCareerRecommendations();
        
        // Filter career recommendations for institution students only
        const institutionUserIds = new Set(
          institutionStudents.map(student => student.userId || student.id)
        );
        
        const filteredCareers = (allCareers.data || []).filter(career => {
          const userId = career.user?.id || career.user?.userId;
          return institutionUserIds.has(userId);
        });
        
        setInstitutionCareerRecommendations(filteredCareers);
      } catch (err) {
        setInstitutionCareerRecommendations([]);
      }
    };
    
    if (institutionStudents.length > 0) {
      fetchInstitutionCareers();
    }
  }, [institutionStudents]);

  // Fetch program recommendations for institution students
  useEffect(() => {
    const fetchInstitutionPrograms = async () => {
      try {
        const allPrograms = await programRecommendationService.fetchAllProgramRecommendations();
        
        // Filter program recommendations for institution students only
        const institutionUserIds = new Set(
          institutionStudents.map(student => student.userId || student.id)
        );
        
        const filteredPrograms = (allPrograms.data || []).filter(program => {
          const userId = program.user?.id || program.user?.userId;
          return institutionUserIds.has(userId);
        });
        
        setInstitutionProgramRecommendations(filteredPrograms);
      } catch (err) {
        setInstitutionProgramRecommendations([]);
      }
    };
    
    if (institutionStudents.length > 0) {
      fetchInstitutionPrograms();
    }
  }, [institutionStudents]);

  // Filter and paginate results based on search and filter criteria
  useEffect(() => {
    let results = [...institutionAssessmentResults];
    
    // Apply search filter
    if (searchStudent) {
      results = results.filter(r => {
        const user = r.userAssessment?.user || {};
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        return fullName.includes(searchStudent.toLowerCase()) || 
               (user.email || '').toLowerCase().includes(searchStudent.toLowerCase());
      });
    }
    
    // Apply assessment filter
    if (selectedAssessment) {
      results = results.filter(r => 
        (r.userAssessment?.assessment?.title || '') === selectedAssessment
      );
    }
    
    setTotalResults(results.length);
    
    // Paginate results
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    setFilteredResults(results.slice(startIdx, endIdx));
  }, [searchStudent, selectedAssessment, institutionAssessmentResults, page, pageSize]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Format time helpers
  const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  // Handle export functionality
  const handleExportResults = async (format) => {
    try {
      const blob = await counselorService.exportInstitutionResults(counselorId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `institution-results.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  // Student connection type helpers
  const getStudentSourceIcon = (student) => {
    if (student.email && student.email.includes('@') && institutionInfo?.emailDomain) {
      const domain = student.email.split('@')[1];
      if (domain === institutionInfo.emailDomain) {
        return <Mail className="h-4 w-4 text-blue-600" title="Linked via institutional email" />;
      }
    }
    if (student.schoolCode) {
      return <Hash className="h-4 w-4 text-green-600" title="Linked via school code" />;
    }
    return null;
  };

  // Navigation handlers
  const handleViewSummary = (result) => {
    navigate('/counselor/student-report', { state: { result } });
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  // Calculate average time spent for institution students
  const getAverageTimeSpent = (results) => {
    const times = results
      .map(r => {
        const seconds = Number(r.userAssessment?.timeSpentSeconds);
        return (!isNaN(seconds) && seconds > 0) ? seconds : null;
      })
      .filter(v => v !== null);
    if (!times.length) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length / 60;
  };

  const averageTimeSpent = getAverageTimeSpent(institutionAssessmentResults);

  // Assessment completion tracking for institution students
  const getUserId = user => user?.id || user?.userId;
  
  const studentsWithResultsIds = new Set(
    institutionAssessmentResults.map(r => getUserId(r.userAssessment?.user)).filter(Boolean)
  );
  
  const studentsWithNoResults = institutionStudents.filter(s => !studentsWithResultsIds.has(getUserId(s)));
  const completionRate = institutionStudents.length > 0 ? 
    ((institutionStudents.length - studentsWithNoResults.length) / institutionStudents.length * 100).toFixed(1) : '0.0';

  // Get unique assessment titles for filter dropdown
  const assessmentTitles = Array.from(
    new Set(institutionAssessmentResults.map(r => r.userAssessment?.assessment?.title).filter(Boolean))
  );
  const selectedAssessmentLabel = selectedAssessment || 'All Assessments';

  // Define scoring fields for dashboard insights
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

  // Chart data for institution insights
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

  // Performance distribution analysis for meaningful counselor insights
  const calculatePerformanceDistribution = (values, field) => {
    const validValues = values.filter(v => v > 0 && !isNaN(v));
    if (validValues.length === 0) return null;
    
    const average = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    const sorted = [...validValues].sort((a, b) => a - b);
    
    // Calculate quartiles
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    
    // Performance categories
    const excellent = validValues.filter(v => v >= 85).length;
    const strong = validValues.filter(v => v >= 70 && v < 85).length;
    const average_range = validValues.filter(v => v >= 50 && v < 70).length;
    const needsSupport = validValues.filter(v => v < 50).length;
    
    const total = validValues.length;
    
    return {
      field,
      average: average.toFixed(1),
      total,
      distribution: {
        excellent: { count: excellent, percent: (excellent / total * 100).toFixed(1) },
        strong: { count: strong, percent: (strong / total * 100).toFixed(1) },
        average: { count: average_range, percent: (average_range / total * 100).toFixed(1) },
        needsSupport: { count: needsSupport, percent: (needsSupport / total * 100).toFixed(1) }
      },
      aboveAverage: validValues.filter(v => v > average).length,
      aboveAveragePercent: (validValues.filter(v => v > average).length / total * 100).toFixed(1),
      topQuartilePercent: (validValues.filter(v => v >= q3).length / total * 100).toFixed(1),
      bottomQuartilePercent: (validValues.filter(v => v <= q1).length / total * 100).toFixed(1),
      // Counselor insights
      status: needsSupport / total > 0.3 ? 'attention' : 
              excellent / total > 0.4 ? 'strength' : 'average',
      insight: needsSupport / total > 0.3 ? 'High intervention needed' :
               excellent / total > 0.4 ? 'Institution strength' : 'Balanced performance'
    };
  };

  // Dashboard insights calculation for institution data
  const aggregateInstitutionInsights = (results, careers, programs) => {
    // RIASEC aggregation
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

    const maxCount = Math.max(...Object.values(riasecCodeCounts));
    const mostCommonCodes = Object.entries(riasecCodeCounts)
      .filter(([code, count]) => count === maxCount && count > 0)
      .map(([code]) => code);
    const mostCommonRiasec = mostCommonCodes.length > 0 ? mostCommonCodes.join(', ') : 'N/A';

    // Performance distribution analysis for each field
    const performanceAnalysis = {};
    nonRiasecFields.forEach(field => {
      const values = results.map(r => Number(r[field.key])).filter(v => v > 0);
      performanceAnalysis[field.key] = calculatePerformanceDistribution(values, field.label);
    });

    // Career recommendations aggregation
    const careerCounts = {};
    careers.forEach(rec => {
      const title = rec.careerPath?.careerTitle || rec.careerTitle || rec.name || rec.title;
      if (title) careerCounts[title] = (careerCounts[title] || 0) + 1;
    });
    const topCareers = Object.entries(careerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([title, count]) => ({ title, count }));

    // Program recommendations aggregation
    const programCounts = {};
    programs.forEach(rec => {
      const name = rec.program?.programName || rec.programName || rec.name || rec.title;
      if (name) programCounts[name] = (programCounts[name] || 0) + 1;
    });
    const topPrograms = Object.entries(programCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Identify strengths and areas of concern
    const strengths = Object.values(performanceAnalysis)
      .filter(p => p && p.status === 'strength')
      .map(p => p.field);
    
    const concerns = Object.values(performanceAnalysis)
      .filter(p => p && p.status === 'attention')
      .map(p => p.field);

    return { 
      mostCommonRiasec, 
      performanceAnalysis, 
      topCareers, 
      topPrograms, 
      riasecCodeCounts, 
      mostCommonCodes,
      strengths,
      concerns
    };
  };

  // Calculate institution dashboard insights
  const institutionInsights = aggregateInstitutionInsights(
    institutionAssessmentResults, 
    institutionCareerRecommendations, 
    institutionProgramRecommendations
  );

  // Quick stats for institution dashboard
  const quickStats = [
    {
      name: "Institution Students",
      value: institutionStudents.length.toString(),
      icon: <Users className="h-6 w-6" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      name: "Assessments",
      value: institutionAssessmentResults.length.toString(),
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

  // Recent activities for institution students
  const recentActivities = institutionAssessmentResults
    .filter(r => r.userAssessment?.dateCompleted)
    .sort((a, b) => new Date(b.userAssessment.dateCompleted) - new Date(a.userAssessment.dateCompleted))
    .slice(0, 5);

  // Performance insight cards data
  const getStatusColor = (status) => {
    switch(status) {
      case 'strength': return 'bg-gradient-to-br from-green-500 to-green-600';
      case 'attention': return 'bg-gradient-to-br from-red-500 to-red-600';
      default: return 'bg-gradient-to-br from-blue-500 to-blue-600';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'strength': return '🟢';
      case 'attention': return '🔴';
      default: return '🟡';
    }
  };

  // Group performance data for display
  const gsaPerformance = gsaFields.map(field => institutionInsights.performanceAnalysis[field.key]).filter(Boolean);
  const academicPerformance = academicFields.map(field => institutionInsights.performanceAnalysis[field.key]).filter(Boolean);
  const nonAcademicPerformance = nonAcademicFields.map(field => institutionInsights.performanceAnalysis[field.key]).filter(Boolean);

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="loader"></div>
          <p className="mt-4 text-gray-600">Loading institutional dashboard...</p>
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
      {/* Header Section */}
      <div className="px-15 pt-10 flex flex-col items-start">
        <p className="text-2xl font-bold text-[#2B3E4E]">
          Institutional Dashboard - <span className="text-[#1D63A1]">
            {institutionInfo?.name || "Institution"}
          </span>
        </p>
        <div className="flex items-center text-gray-500 mt-1">
          <Clock className="h-4 w-4 mr-1.5" />
          <span className="text-xs">{formattedTime}</span>
          <span className="mx-1.5">•</span>
          <span className="text-xs">{formattedDate}</span>
        </div>
        {institutionInfo && (
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            {institutionInfo.emailDomain && (
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                @{institutionInfo.emailDomain}
              </span>
            )}
            {institutionInfo.schoolCode && (
              <span className="flex items-center gap-1">
                <Hash className="h-4 w-4" />
                {institutionInfo.schoolCode}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Institution Insights Summary Section */}
      <section className="w-full px-15 pt-6 pb-2">
        <div className="flex flex-row gap-2 mb-8 items-start">
          {/* Performance Distribution Charts */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col w-full max-w-[calc(100%-280px)]">
            <div className="flex items-center justify-between w-full mb-6">
              <div className="flex-1 text-2xl font-bold text-[#1D63A1] tracking-tight">
                Performance Distribution Analysis
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportResults('csv')}
                  className="bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] text-white py-2 px-3 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </button>
                <button
                  onClick={() => handleExportResults('pdf')}
                  className="bg-gradient-to-r from-[#1D63A1] to-[#2B3E4E] hover:from-[#FFB71B] hover:to-[#FFB71B] text-white py-2 px-3 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </button>
              </div>
            </div>

            {/* Three Charts Horizontally Aligned - GSA gets more space */}
            <div className="flex flex-row gap-4 w-full">
              {/* General Scholastic Aptitude Chart - Takes more space due to more fields */}
              <div className="flex-2" style={{ flex: '2' }}>
                <h3 className="text-lg font-bold text-[#1D63A1] mb-3">General Scholastic Aptitude</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gsaPerformance.filter(Boolean)} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <XAxis 
                      dataKey="field" 
                      fontSize={10}
                      height={50}
                    />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      labelStyle={{ color: '#333' }}
                    />
                    <Bar dataKey="aboveAveragePercent" fill="#10B981" name="Above Average" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.needsSupport.percent" fill="#EF4444" name="Needs Support" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Academic Tracks Chart - Standard size */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#FFB71B] mb-3">Academic Track Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={academicPerformance.filter(Boolean)} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <XAxis 
                      dataKey="field" 
                      fontSize={10}
                      height={50}
                    />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      labelStyle={{ color: '#333' }}
                    />
                    <Bar dataKey="aboveAveragePercent" fill="#F59E0B" name="Above Average" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.needsSupport.percent" fill="#EF4444" name="Needs Support" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Non-Academic Tracks Chart - Standard size */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#4CAF50] mb-3">Non-Academic Track Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={nonAcademicPerformance.filter(Boolean)} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <XAxis 
                      dataKey="field" 
                      fontSize={10}
                      height={50}
                    />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      labelStyle={{ color: '#333' }}
                    />
                    <Bar dataKey="aboveAveragePercent" fill="#10B981" name="Above Average" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.needsSupport.percent" fill="#EF4444" name="Needs Support" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
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
            
            {/* Most Common RIASEC for Institution */}
            <div className="bg-white rounded-xl shadow border border-gray-100 flex flex-col items-center py-4 px-4 min-h-0 hover:shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-2">
                <School className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs uppercase text-gray-400 font-semibold mb-0.5 tracking-wider text-center">Institution Personality</div>
              <div className="text-2xl font-bold text-[#1D63A1] mb-0.5 text-center">{institutionInsights.mostCommonRiasec}</div>
              <div className="text-xs text-gray-400 mb-0.5 text-center">(Top RIASEC code{institutionInsights.mostCommonCodes && institutionInsights.mostCommonCodes.length > 1 ? 's' : ''})</div>
              <div className="text-xs text-gray-500 text-center mb-0.5">
                {institutionInsights.mostCommonCodes && institutionInsights.mostCommonCodes.map((code, idx) => {
                  const descMap = {
                    R: 'Realistic',
                    I: 'Investigative',
                    A: 'Artistic',
                    S: 'Social',
                    E: 'Enterprising',
                    C: 'Conventional',
                  };
                  return <span key={code}>{descMap[code]}{idx < institutionInsights.mostCommonCodes.length - 1 ? ', ' : ''}</span>;
                })}
              </div>
              <div className="text-xs text-blue-500 font-semibold text-center">
                {(() => {
                  const total = institutionAssessmentResults.length;
                  const codeCount = institutionAssessmentResults.reduce((acc, r) => {
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
                    if (institutionInsights.mostCommonCodes && institutionInsights.mostCommonCodes.some(code => topCodes.includes(code))) {
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

        {/* Compact Summary Cards */}
        <div className="flex flex-row gap-4 mb-6">
          {/* Strengths & Concerns Combined */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col py-4 px-6 min-h-[140px] flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-gray-700">Performance Overview</div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Strengths</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Concerns</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div>
                <div className="text-lg font-bold text-green-600 mb-1">{institutionInsights.strengths.length}</div>
                <div className="text-xs text-gray-500 mb-2">Strong Areas</div>
                {institutionInsights.strengths.slice(0, 4).map((strength, i) => (
                  <div key={i} className="text-xs text-green-700 truncate">• {strength}</div>
                ))}
                {institutionInsights.strengths.length > 4 && (
                  <div className="text-xs text-gray-400 mt-1">+{institutionInsights.strengths.length - 4} more</div>
                )}
              </div>
              <div>
                <div className="text-lg font-bold text-red-600 mb-1">{institutionInsights.concerns.length}</div>
                <div className="text-xs text-gray-500 mb-2">Need Attention</div>
                {institutionInsights.concerns.slice(0, 4).map((concern, i) => (
                  <div key={i} className="text-xs text-red-700 truncate">• {concern}</div>
                ))}
                {institutionInsights.concerns.length > 4 && (
                  <div className="text-xs text-gray-400 mt-1">+{institutionInsights.concerns.length - 4} more</div>
                )}
              </div>
            </div>
          </div>

          {/* Top Careers - Compact */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col py-4 px-6 min-h-[140px] flex-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 mb-2 mx-auto">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-bold text-gray-700 text-center mb-2">Top Careers</div>
            {institutionInsights.topCareers.length === 0 ? (
              <div className="text-gray-400 text-xs text-center">No data</div>
            ) : institutionInsights.topCareers.slice(0, 3).map((c, i) => {
              const total = institutionCareerRecommendations.length;
              const percent = total > 0 ? ((c.count / total) * 100).toFixed(0) : '0';
              return (
                <div key={i} className="flex justify-between items-center text-xs mb-1">
                  <span className="truncate pr-2">{i + 1}. {c.title}</span>
                  <span className="text-gray-500 text-right">{percent}%</span>
                </div>
              );
            })}
          </div>

          {/* Top Programs - Compact */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col py-4 px-6 min-h-[140px] flex-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mb-2 mx-auto">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-bold text-gray-700 text-center mb-2">Top Programs</div>
            {institutionInsights.topPrograms.length === 0 ? (
              <div className="text-gray-400 text-xs text-center">No data</div>
            ) : institutionInsights.topPrograms.slice(0, 3).map((p, i) => {
              const total = institutionProgramRecommendations.length;
              const percent = total > 0 ? ((p.count / total) * 100).toFixed(0) : '0';
              return (
                <div key={i} className="flex justify-between items-center text-xs mb-1">
                  <span className="truncate pr-2">{i + 1}. {p.name}</span>
                  <span className="text-gray-500 text-right">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search and Filter Header */}
      <header>
        <div className="px-15 py-4">
          <div className="flex items-center justify-between">
            <div className="text-left my-5">
              <h2 className="text-1xl font-medium text-[#2B3E4E]">
                Institution assessment results for: <br/>
                <span className="text-[#FFB71B] text-3xl font-bold">{selectedAssessmentLabel}</span>
              </h2>
            </div>

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
          <AssessmentResultsGrid
            results={filteredResults}
            onViewReport={handleViewSummary}
            page={page}
            pageSize={pageSize}
            totalResults={totalResults}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>

        {/* Sidebar: Institution Stats + Recent Activity */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          {/* Institution Completion Rate */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-4 animate-fade-in">
            <h3 className="text-base font-bold text-[#2B3E4E] mb-1">Institution Completion Rate</h3>
            <div className="text-2xl font-bold text-green-600 mb-1">{completionRate}%</div>
            <div className="text-xs text-gray-500 mb-2">
              {institutionStudents.length - studentsWithNoResults.length} of {institutionStudents.length} institution students completed assessments
            </div>
            {studentsWithNoResults.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Students with no results:</div>
                <ul className="max-h-20 overflow-y-auto text-xs text-gray-700">
                  {studentsWithNoResults.slice(0, 5).map((student, idx) => (
                    <li key={getUserId(student) || idx} className="mb-1 truncate flex items-center gap-2">
                      {getStudentSourceIcon(student)}
                      {student.firstName} {student.lastName || student.lastname}
                    </li>
                  ))}
                  {studentsWithNoResults.length > 5 && (
                    <li className="text-gray-400">+ {studentsWithNoResults.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Institution Connection Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-4 animate-fade-in">
            <h3 className="text-base font-bold text-[#1D63A1] mb-1">Connection Types</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email Domain
                </span>
                <span className="text-sm font-semibold">
                  {institutionStudents.filter(s => s.email && institutionInfo?.emailDomain && 
                    s.email.includes(`@${institutionInfo.emailDomain}`)).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-green-600" />
                  School Code
                </span>
                <span className="text-sm font-semibold">
                  {institutionStudents.filter(s => s.schoolCode === institutionInfo?.schoolCode).length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 animate-fade-in max-h-[340px] overflow-y-auto">
            <h3 className="text-base font-bold text-[#2B3E4E] mb-3">Recent Institution Activity</h3>
            <div className="space-y-2">
              {recentActivities.length === 0 ? (
                <div className="flex flex-col items-center py-4">
                  <School className="w-12 h-12 text-gray-300 mb-2" />
                  <div className="text-gray-400 text-xs text-center">No recent activity yet.</div>
                </div>
              ) : recentActivities.map((activity, idx) => {
                const user = activity.userAssessment?.user || {};
                const assessment = activity.userAssessment?.assessment || {};
                const student = institutionStudents.find(s => getUserId(s) === getUserId(user));
                return (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors animate-pop-in" style={{ animationDelay: `${idx * 60}ms` }}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D63A1] to-[#FFB71B] flex items-center justify-center text-white text-sm font-bold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="flex-start flex-1 min-w-0">
                      <div className="text-left truncate font-medium text-xs text-gray-800 flex items-center gap-1">
                        {user.firstName} {user.lastName}
                        {student && getStudentSourceIcon(student)}
                      </div>
                      <div className="text-left truncate text-[11px] text-gray-500">{assessment.title}</div>
                    </div>
                    <div className="text-[10px] text-gray-400 whitespace-nowrap">
                      {activity.userAssessment?.dateCompleted ? new Date(activity.userAssessment.dateCompleted).toLocaleDateString() : ''}
                    </div>
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

export default InstitutionalDashboard;