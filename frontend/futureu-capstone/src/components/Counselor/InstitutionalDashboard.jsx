import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import counselorService from '../../services/counselorService';
import authService from '../../services/authService';
import userAssessmentService from '../../services/userAssessmentService';
import profileService from '../../services/profileService';
import institutionService from '../../services/institutionService';
import { fetchRecommendations } from '../../services/recommendationService';
import {
  Heart, Users, FileText, Search, Clock,
  BookOpen, User, LogOut, MessageSquare,
  BarChart2, Calendar, UserCheck, GraduationCap, BarChart3, Download, School, Mail, Hash, ArrowLeft, X, Save
} from 'lucide-react';
import SearchFilterBar from './SearchFilterBar';
import AssessmentResultsGrid from './AssessmentResultsGrid';
import TopCareersModal from './TopCareersModal';
import TopCareerPathsModal from './TopCareerPathsModal';
import TopProgramsModal from './TopProgramsModal';
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
  
  // Show more/less state for top lists
  const [showMoreCareers, setShowMoreCareers] = useState(false);
  const [showMorePrograms, setShowMorePrograms] = useState(false);
  const [showCareersModal, setShowCareersModal] = useState(false);
  const [showProgramsModal, setShowProgramsModal] = useState(false);
  const [showCareerPathsModal, setShowCareerPathsModal] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalResults, setTotalResults] = useState(0);
  
  // Time and stats
  const [currentTime, setCurrentTime] = useState(new Date());
  const [assessmentStats, setAssessmentStats] = useState({});
  
  // School code setup modal
  const [showSchoolCodeModal, setShowSchoolCodeModal] = useState(false);
  const [schoolCodeInput, setSchoolCodeInput] = useState('');
  const [schoolCodeLoading, setSchoolCodeLoading] = useState(false);
  const [schoolCodeError, setSchoolCodeError] = useState(null);

  // Fetch institution data and filtered results
  useEffect(() => {
    const fetchInstitutionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch counselor's institution info
        const institution = await counselorService.getCounselorInstitution(counselorId);
        
        // Check if counselor has institutional access
        if (!institution || (!institution.emailDomain && !institution.schoolCode)) {
          // Show school code setup modal instead of error
          setShowSchoolCodeModal(true);
          setLoading(false);
          return;
        }
        
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

  // Fetch career AND program recommendations from comprehensive endpoint (proper structure)
  useEffect(() => {
    const fetchInstitutionRecommendations = async () => {
      if (institutionAssessmentResults.length === 0) {
        setInstitutionCareerRecommendations([]);
        setInstitutionProgramRecommendations([]);
        return;
      }

      try {
        // console.log('Fetching comprehensive recommendations for', institutionAssessmentResults.length, 'students');
        
        // Fetch comprehensive recommendations for each assessment result
        // This gives us the proper structure: careerPaths[] -> careers[] and programs[]
        const comprehensivePromises = institutionAssessmentResults.map(result => {
          const userAssessmentId = result.userAssessment?.userQuizAssessment;
          if (!userAssessmentId) {
            console.warn('No userAssessmentId found for result:', result.resultId);
            return Promise.resolve({ resultId: result.resultId, careerPaths: [] });
          }
          
          return fetchRecommendations(userAssessmentId).then(response => ({
            resultId: result.resultId,
            userAssessmentId: userAssessmentId,
            careerPaths: response.data?.recommendations?.careerPaths || []
          })).catch(err => {
            console.error(`Error fetching comprehensive recommendations for userAssessment ${userAssessmentId}:`, err);
            return { resultId: result.resultId, userAssessmentId, careerPaths: [] };
          });
        });
        
        const comprehensiveResults = await Promise.all(comprehensivePromises);
        
        // Extract careers from all career paths across all students
        const allInstitutionCareers = [];
        comprehensiveResults.forEach(({ resultId, userAssessmentId, careerPaths }) => {
          careerPaths.forEach(path => {
            if (Array.isArray(path.careers)) {
              path.careers.forEach(career => {
                allInstitutionCareers.push({
                  ...career,
                  associatedResultId: resultId,
                  userAssessmentId: userAssessmentId,
                  careerPathId: path.careerPathId,
                  careerPathName: path.careerPathName
                });
              });
            }
          });
        });
        
        // Extract programs from all career paths across all students  
        const allInstitutionPrograms = [];
        comprehensiveResults.forEach(({ resultId, userAssessmentId, careerPaths }) => {
          careerPaths.forEach(path => {
            if (Array.isArray(path.programs)) {
              path.programs.forEach(program => {
                allInstitutionPrograms.push({
                  ...program,
                  associatedResultId: resultId,
                  userAssessmentId: userAssessmentId,
                  careerPathId: path.careerPathId,
                  careerPathName: path.careerPathName
                });
              });
            }
          });
        });
        
        // console.log('Total career recommendations from career paths:', allInstitutionCareers.length);
        // console.log('Total program recommendations from career paths:', allInstitutionPrograms.length);
        // console.log('Sample career:', allInstitutionCareers[0]);
        // console.log('Sample program:', allInstitutionPrograms[0]);
        
        setInstitutionCareerRecommendations(allInstitutionCareers);
        setInstitutionProgramRecommendations(allInstitutionPrograms);
      } catch (err) {
        console.error('Error fetching institution recommendations:', err);
        setInstitutionCareerRecommendations([]);
        setInstitutionProgramRecommendations([]);
      }
    };

    fetchInstitutionRecommendations();
  }, [institutionAssessmentResults]);

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
      // Show loading state
      const exportButton = document.activeElement;
      const originalText = exportButton.innerHTML;
      exportButton.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mx-auto"></div>';
      exportButton.disabled = true;

      if (format === 'csv') {
        // CSV Export - Generate locally from current data
        const csvData = generateCSVData();
        downloadCSV(csvData, 'institution-results.csv');
      } else if (format === 'pdf') {
        // Try backend PDF export first, fallback to local generation
        try {
          const blob = await counselorService.exportInstitutionResults(counselorId, 'pdf');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `institution-results.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        } catch (backendError) {
          console.warn('Backend PDF export failed, generating basic summary:', backendError);
          // Generate a simple text summary for PDF
          generatePDFSummary();
        }
      }

      // Reset button state
      setTimeout(() => {
        exportButton.innerHTML = originalText;
        exportButton.disabled = false;
      }, 1000);
    } catch (error) {
      console.error('Error exporting results:', error);
      alert(`Export failed: ${error.message || 'Unknown error occurred'}`);
      
      // Reset button state on error
      const exportButton = document.activeElement;
      exportButton.disabled = false;
    }
  };

  // Generate CSV data from current dashboard data
  const generateCSVData = () => {
    const headers = [
      'Student Name',
      'Email',
      'Assessment',
      'Date Completed',
      'Scientific Ability',
      'Reading Comprehension',
      'Verbal Ability',
      'Mathematical Ability',
      'Logical Reasoning',
      'STEM Score',
      'ABM Score',
      'HUMSS Score',
      'TVL Score',
      'Sports Track',
      'Arts & Design',
      'RIASEC Code',
      'Top Career 1',
      'Top Career 2', 
      'Top Career 3',
      'Top Career 4',
      'Top Career 5',
      'Least Career 1',
      'Least Career 2',
      'Least Career 3', 
      'Least Career 4',
      'Least Career 5',
      'Top Program 1',
      'Top Program 2',
      'Top Program 3',
      'Top Program 4', 
      'Top Program 5',
      'Least Program 1',
      'Least Program 2',
      'Least Program 3',
      'Least Program 4',
      'Least Program 5'
    ];

    // Remove duplicates by result ID first
    const uniqueResults = institutionAssessmentResults.filter((result, index, arr) => 
      arr.findIndex(r => r.resultId === result.resultId) === index
    );

    // console.log('Unique results for CSV:', uniqueResults.length);
    // console.log('Sample career recommendations:', institutionCareerRecommendations.slice(0, 3));
    // console.log('Sample program recommendations:', institutionProgramRecommendations.slice(0, 3));
    
    // Debug: Show structure of first recommendation
    // if (institutionCareerRecommendations.length > 0) {
    //   console.log('Career recommendation structure:', institutionCareerRecommendations[0]);
    //   console.log('Career recommendation keys:', Object.keys(institutionCareerRecommendations[0]));
    // }
    // if (institutionProgramRecommendations.length > 0) {
    //   console.log('Program recommendation structure:', institutionProgramRecommendations[0]);
    //   console.log('Program recommendation keys:', Object.keys(institutionProgramRecommendations[0]));
    // }
    
    // Debug: Show structure of first result
    // if (uniqueResults.length > 0) {
    //   console.log('Result structure:', uniqueResults[0]);
    //   console.log('Result keys:', Object.keys(uniqueResults[0]));
    //   console.log('User from result:', uniqueResults[0].userAssessment?.user);
    // }

    const rows = uniqueResults.map((result, index) => {
      const user = result.userAssessment?.user || {};
      const assessment = result.userAssessment?.assessment || {};
      
      // Get RIASEC code - Top 3 like in StudentReportPage
      const riasecScores = [
        { code: 'R', value: result.realisticScore },
        { code: 'I', value: result.investigativeScore },
        { code: 'A', value: result.artisticScore },
        { code: 'S', value: result.socialScore },
        { code: 'E', value: result.enterprisingScore },
        { code: 'C', value: result.conventionalScore },
      ].filter(s => s.value != null && !isNaN(s.value));
      
      // Get top 3 RIASEC codes like in StudentReportPage
      const topRiasec = riasecScores.length > 0 ? 
        riasecScores
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .map(s => s.code)
          .join('') : 'N/A';

      // Get top career and program for this student - use the new associatedResultId
      let studentCareers = institutionCareerRecommendations.filter(c => 
        c.associatedResultId === result.resultId
      );

      let studentPrograms = institutionProgramRecommendations.filter(p => 
        p.associatedResultId === result.resultId
      );

      // If no matches found, also try the old matching approaches as fallback
      if (studentCareers.length === 0) {
        studentCareers = institutionCareerRecommendations.filter(c => 
          c.userAssessmentResult?.resultId === result.resultId ||
          c.resultId === result.resultId ||
          c.userAssessmentResultId === result.resultId
        );
      }

      if (studentPrograms.length === 0) {
        studentPrograms = institutionProgramRecommendations.filter(p => 
          p.userAssessmentResult?.resultId === result.resultId ||
          p.resultId === result.resultId ||
          p.userAssessmentResultId === result.resultId
        );
      }

      // Final fallback: try matching by user ID
      if (studentCareers.length === 0 && user.userId) {
        studentCareers = institutionCareerRecommendations.filter(c => 
          c.userAssessmentResult?.userAssessment?.user?.userId === user.userId ||
          c.user?.userId === user.userId ||
          c.userId === user.userId
        );
      }

      if (studentPrograms.length === 0 && user.userId) {
        studentPrograms = institutionProgramRecommendations.filter(p => 
          p.userAssessmentResult?.userAssessment?.user?.userId === user.userId ||
          p.user?.userId === user.userId ||
          p.userId === user.userId
        );
      }

      // Extract career and program names with multiple fallback attempts
      const getCareerTitle = (career) => career?.careerPath?.careerTitle || 
                                        career?.careerTitle || 
                                        career?.career?.careerTitle ||
                                        career?.career?.title ||
                                        career?.name || 
                                        career?.title || 'N/A';

      const getProgramTitle = (program) => program?.program?.programName || 
                                          program?.programName || 
                                          program?.program?.name ||
                                          program?.program?.title ||
                                          program?.name || 
                                          program?.title || 'N/A';

      // Sort careers by confidence score (highest to lowest for top, lowest to highest for least)
      const sortedCareers = [...studentCareers].sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
      const sortedPrograms = [...studentPrograms].sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));

      // Get top 5 careers and programs
      const top5Careers = Array.from({length: 5}, (_, i) => 
        sortedCareers[i] ? getCareerTitle(sortedCareers[i]) : 'N/A'
      );
      
      const top5Programs = Array.from({length: 5}, (_, i) => 
        sortedPrograms[i] ? getProgramTitle(sortedPrograms[i]) : 'N/A'
      );

      // Get least 5 careers and programs (reverse order for lowest confidence scores)
      const least5Careers = Array.from({length: 5}, (_, i) => {
        const index = sortedCareers.length - 1 - i;
        return index >= 0 && sortedCareers[index] ? getCareerTitle(sortedCareers[index]) : 'N/A';
      });
      
      const least5Programs = Array.from({length: 5}, (_, i) => {
        const index = sortedPrograms.length - 1 - i;
        return index >= 0 && sortedPrograms[index] ? getProgramTitle(sortedPrograms[index]) : 'N/A';
      });

      // Debug logging for first few students
      // if (index < 3) {
      //   console.log(`Student ${user.firstName} ${user.lastName}:`, {
      //     resultId: result.resultId,
      //     careerMatches: studentCareers.length,
      //     programMatches: studentPrograms.length,
      //     top5Careers,
      //     least5Careers,
      //     top5Programs,
      //     least5Programs,
      //     sampleCareer: studentCareers[0],
      //     sampleProgram: studentPrograms[0]
      //   });
      // }

      return [
        `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        user.email || 'N/A',
        assessment.title || 'N/A',
        result.userAssessment?.dateCompleted ? 
          new Date(result.userAssessment.dateCompleted).toLocaleDateString() : 'N/A',
        result.scientificAbilityScore || 0,
        result.readingComprehensionScore || 0,
        result.verbalAbilityScore || 0,
        result.mathematicalAbilityScore || 0,
        result.logicalReasoningScore || 0,
        result.stemScore || 0,
        result.abmScore || 0,
        result.humssScore || 0,
        result.tvlScore || 0,
        result.sportsTrackScore || 0,
        result.artsDesignTrackScore || 0,
        topRiasec,
        ...top5Careers,           // Top 5 career recommendations
        ...least5Careers,         // Least 5 career recommendations  
        ...top5Programs,          // Top 5 program recommendations
        ...least5Programs         // Least 5 program recommendations
      ];
    });

    // console.log(`Generated CSV with ${rows.length} unique student records`);
    return [headers, ...rows];
  };

  // Download CSV file
  const downloadCSV = (data, filename) => {
    const csvContent = data.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Generate PDF summary (simple version)
  const generatePDFSummary = () => {
    const summaryText = `
INSTITUTIONAL DASHBOARD SUMMARY
Institution: ${institutionInfo?.name || 'Unknown'}
Generated: ${new Date().toLocaleString()}

OVERVIEW:
- Total Students: ${institutionStudents.length}
- Completed Assessments: ${institutionAssessmentResults.length}
- Completion Rate: ${completionRate}%
- Average Time: ${averageTimeSpent.toFixed(1)} minutes

PERFORMANCE ANALYSIS:
${Object.values(institutionInsights.performanceAnalysis || {}).map(p => p ? `
${p.field}:
- Institution Average: ${p.institutionAverage}
- Distribution: ${p.performanceLevel}
- Status: ${p.status}
- Well Above: ${p.distribution?.wellAbovePeer?.percent}%
- Above: ${p.distribution?.abovePeer?.percent}%
- At Average: ${p.distribution?.atPeerLevel?.percent}%
- Below: ${p.distribution?.belowPeer?.percent}%
- Well Below: ${p.distribution?.wellBelowPeer?.percent}%
` : '').join('\n')}

TOP CAREERS:
${institutionInsights.topCareers?.slice(0, 10).map((c, i) => `${i+1}. ${c.title} (${c.count} students)`).join('\n')}

TOP PROGRAMS:
${institutionInsights.topPrograms?.slice(0, 10).map((p, i) => `${i+1}. ${p.name} (${p.count} students)`).join('\n')}
    `.trim();

    // Create a simple text file for PDF summary
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'institution-summary.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert('PDF export not available yet. Downloaded summary as text file instead.');
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

  // School code setup handlers
  const handleSchoolCodeSave = async () => {
    if (!schoolCodeInput.trim()) {
      setSchoolCodeError('Please enter a school code');
      return;
    }

    setSchoolCodeLoading(true);
    setSchoolCodeError(null);

    try {
      // Validate school code
      const isValidCode = await institutionService.validateSchoolCode(schoolCodeInput.trim());
      if (!isValidCode) {
        setSchoolCodeError('Invalid school code. Please verify with your institution.');
        return;
      }

      // Update user profile with school code
      const currentUser = authService.getCurrentUser();
      await profileService.updateUserProfile(currentUser.id, { schoolCode: schoolCodeInput.trim() });

      // Close modal and refresh data
      setShowSchoolCodeModal(false);
      setSchoolCodeInput('');
      
      // Refresh the page to load institutional data
      window.location.reload();
    } catch (error) {
      setSchoolCodeError('Failed to save school code. Please try again.');
    } finally {
      setSchoolCodeLoading(false);
    }
  };

  const handleSchoolCodeCancel = () => {
    setShowSchoolCodeModal(false);
    setSchoolCodeInput('');
    setSchoolCodeError(null);
    // Redirect to general counselor dashboard
    navigate('/counselor-general-dashboard');
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

  // Performance distribution analysis with peer-relative insights within the same institution
  const calculatePerformanceDistribution = (values, field) => {
    const validValues = values.filter(v => v >= 0 && !isNaN(v)); // Include zeros!
    if (validValues.length === 0) return null;
    
    const institutionAverage = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    const sorted = [...validValues].sort((a, b) => a - b);
    
    // Use institution average as the peer comparison baseline
    const peerAverage = institutionAverage; // Peers = classmates in same institution
    
    // Calculate quartiles
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    
    // Fixed performance categories - MUTUALLY EXCLUSIVE approach
    const total = validValues.length;
    
    // Define clear, NON-OVERLAPPING categories with reasonable thresholds
    const wellAboveAvg = validValues.filter(v => v >= institutionAverage + 15).length; // +15 points above avg
    const aboveAvg = validValues.filter(v => v > institutionAverage + 5 && v < institutionAverage + 15).length; // +5 to +15
    const atAvg = validValues.filter(v => v >= institutionAverage - 5 && v <= institutionAverage + 5).length; // Within 5 points
    const belowAvg = validValues.filter(v => v < institutionAverage - 5 && v > institutionAverage - 15).length; // -5 to -15
    const wellBelowAvg = validValues.filter(v => v <= institutionAverage - 15).length; // -15+ points below avg
    
    // Verify totals add up correctly
    const categorySum = wellAboveAvg + aboveAvg + atAvg + belowAvg + wellBelowAvg;
    
    // Optional: Enable for debugging specific fields
    // console.log(`Debug: Field=${field}, Total=${total}, Categories=${categorySum}, Avg=${institutionAverage.toFixed(1)}`);
    // console.log(`  WellAbove=${wellAboveAvg}, Above=${aboveAvg}, At=${atAvg}, Below=${belowAvg}, WellBelow=${wellBelowAvg}`);
    
    // If categories don't add up to total, we have a logic error - fix it
    let finalAtAvg = atAvg;
    if (categorySum !== total) {
      // console.warn(`Category sum mismatch! Expected: ${total}, Got: ${categorySum}`);
      finalAtAvg = Math.max(0, total - (wellAboveAvg + aboveAvg + belowAvg + wellBelowAvg));
      // console.log(`Adjusted atAvg from ${atAvg} to ${finalAtAvg}`);
    }
    
    // Educational performance levels based on actual distribution categories
    const getInstitutionalPerformanceLevel = () => {
      const wellAbovePercent = (wellAboveAvg / total) * 100;
      const abovePercent = (aboveAvg / total) * 100;
      const atPercent = (finalAtAvg / total) * 100;
      const belowPercent = (belowAvg / total) * 100;
      const wellBelowPercent = (wellBelowAvg / total) * 100;
      
      const strugglingPercent = wellBelowPercent + belowPercent;
      const excellingPercent = wellAbovePercent + abovePercent;
      
      // Bimodal distribution: high performers + high strugglers with few in middle
      if (excellingPercent > 25 && strugglingPercent > 25 && atPercent < 30) {
        return { level: 'Bimodal Distribution', description: 'Students either excel or struggle - few at average' };
      }
      
      // Strong overall performance
      if (excellingPercent > 50 && strugglingPercent < 20) {
        return { level: 'Strong Performance', description: 'Most students above school average' };
      }
      
      // Needs institutional support
      if (strugglingPercent > 50 && excellingPercent < 20) {
        return { level: 'Needs Support', description: 'Most students below school average' };
      }
      
      // Balanced normal distribution
      if (atPercent > 40) {
        return { level: 'Balanced Distribution', description: 'Normal spread around school average' };
      }
      
      // Default case
      return { level: 'Mixed Performance', description: 'Varied performance levels across students' };
    };

    const performanceLevel = getInstitutionalPerformanceLevel();
    
    return {
      field,
      institutionAverage: institutionAverage.toFixed(1),
      peerAverage: peerAverage.toFixed(1), // Same as institution average
      institutionVsPeers: "0.0", // Always 0 since we're comparing to self
      total,
      distribution: {
        wellAbovePeer: { count: wellAboveAvg, percent: (wellAboveAvg / total * 100).toFixed(1) },
        abovePeer: { count: aboveAvg, percent: (aboveAvg / total * 100).toFixed(1) },
        atPeerLevel: { count: finalAtAvg, percent: (finalAtAvg / total * 100).toFixed(1) },
        belowPeer: { count: belowAvg, percent: (belowAvg / total * 100).toFixed(1) },
        wellBelowPeer: { count: wellBelowAvg, percent: (wellBelowAvg / total * 100).toFixed(1) },
        needsSupport: { count: wellBelowAvg, percent: (wellBelowAvg / total * 100).toFixed(1) }
      },
      aboveAveragePercent: ((wellAboveAvg + aboveAvg) / total * 100).toFixed(1),
      topQuartilePercent: (validValues.filter(v => v >= q3).length / total * 100).toFixed(1),
      bottomQuartilePercent: (validValues.filter(v => v <= q1).length / total * 100).toFixed(1),
      // School-relative counselor insights
      performanceLevel: performanceLevel.level,
      performanceDescription: performanceLevel.description,
      status: performanceLevel.level === 'Strong Performance' ? 'strength' :
              performanceLevel.level === 'Needs Support' ? 'concern' :
              performanceLevel.level === 'Bimodal Distribution' ? 'concern' :  // Bimodal is concerning, not strength
              'average',
      insight: wellBelowAvg / total > 0.25 ? `${(wellBelowAvg / total * 100).toFixed(0)}% students significantly below school average - needs intervention` :
               wellAboveAvg / total > 0.25 ? `${(wellAboveAvg / total * 100).toFixed(0)}% students well above school average - school strength` : 
               `Balanced performance distribution around school average`
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

    // Get all 6 RIASEC codes sorted by count (show all with percentages)
    const totalStudents = results.length;
    const topRiasecCodes = Object.entries(riasecCodeCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count (highest first)
      .map(([code, count]) => ({
        code,
        count,
        percent: totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : '0.0'
      }));
    
    const mostCommonRiasec = topRiasecCodes.filter(r => r.count > 0).map(r => r.code).join(', ') || 'N/A';
    const mostCommonCodes = topRiasecCodes; // Now includes count and percent

    // Performance distribution analysis for each field
    const performanceAnalysis = {};
    nonRiasecFields.forEach(field => {
      const values = results.map(r => Number(r[field.key])).filter(v => v >= 0 && !isNaN(v)); // Include zeros!
      performanceAnalysis[field.key] = calculatePerformanceDistribution(values, field.label);
    });

    // Career recommendations aggregation
    // Data comes from CareerRecommendationDetailEntity via career_path_recommendation
    const careerCounts = {};
    careers.forEach(rec => {
      // Structure from comprehensive endpoint: rec.careerTitle, rec.careerId, rec.matchPercentage, etc.
      const title = rec.careerTitle || rec.career?.careerTitle || rec.title || rec.name;
      if (title) careerCounts[title] = (careerCounts[title] || 0) + 1;
    });
    const topCareers = Object.entries(careerCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([title, count]) => ({ title, count }));

    // Career Path aggregation (from careerPathName in the recommendations)
    const careerPathCounts = {};
    careers.forEach(rec => {
      const pathName = rec.careerPathName;
      if (pathName) careerPathCounts[pathName] = (careerPathCounts[pathName] || 0) + 1;
    });
    const topCareerPaths = Object.entries(careerPathCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // Program recommendations aggregation
    // Data comes from ProgramRecommendationDetailEntity via career_path_recommendation
    const programCounts = {};
    programs.forEach(rec => {
      // Structure from comprehensive endpoint: rec.programName, rec.programId, rec.matchPercentage, etc.
      const name = rec.programName || rec.program?.programName || rec.name || rec.title;
      if (name) programCounts[name] = (programCounts[name] || 0) + 1;
    });
    const topPrograms = Object.entries(programCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // Identify strengths and areas of concern based on peer-relative performance
    const strengths = Object.values(performanceAnalysis)
      .filter(p => p && p.status === 'strength')
      .map(p => `${p.field} (${p.performanceLevel})`);
    
    const concerns = Object.values(performanceAnalysis)
      .filter(p => p && p.status === 'concern')
      .map(p => `${p.field} (${p.performanceLevel})`);

    return { 
      mostCommonRiasec, 
      performanceAnalysis, 
      topCareers,
      topCareerPaths, 
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

  // Debug logging for career and program counts
  // console.log('Institution insights:', {
  //   totalCareers: institutionInsights.topCareers.length,
  //   totalPrograms: institutionInsights.topPrograms.length,
  //   topCareers: institutionInsights.topCareers,
  //   topPrograms: institutionInsights.topPrograms
  // });

  // Enhanced tooltip component with within-school peer comparison information
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Find the performance data for this field
      const fieldData = institutionInsights.performanceAnalysis && institutionInsights.performanceAnalysis[
        Object.keys(institutionInsights.performanceAnalysis).find(key => 
          institutionInsights.performanceAnalysis[key] && institutionInsights.performanceAnalysis[key].field === label
        )
      ];
      
      const getStatusInfo = (fieldData) => {
        if (!fieldData) return { status: 'N/A', icon: '❓', reason: 'No data' };
        
        const institutionAvg = parseFloat(fieldData.institutionAverage);
        const wellBelowPercent = parseFloat(fieldData.distribution.wellBelowPeer.percent);
        const wellAbovePercent = parseFloat(fieldData.distribution.wellAbovePeer.percent);
        
        if (fieldData.status === 'concern') {
          return { 
            status: 'NEEDS ATTENTION', 
            icon: '⚠️', 
            reason: `${wellBelowPercent}% students well below school avg (${institutionAvg})`
          };
        } else if (fieldData.status === 'strength') {
          return { 
            status: 'SCHOOL STRENGTH', 
            icon: '✅', 
            reason: `${wellAbovePercent}% students well above school avg (${institutionAvg})`
          };
        } else {
          return { 
            status: 'BALANCED', 
            icon: '➖', 
            reason: `Normal distribution around school avg (${institutionAvg})`
          };
        }
      };

      const statusInfo = getStatusInfo(fieldData);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}%
            </p>
          ))}
          {fieldData && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Distribution: {fieldData.performanceLevel}
              </p>
              <p className="text-xs text-gray-600 mb-1">
                {fieldData.performanceDescription}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Status:</span> {statusInfo.icon} {statusInfo.status}
              </p>
              <p className="text-xs text-gray-500">
                {statusInfo.reason}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Quick stats for institution dashboard
  const quickStats = [
    {
      name: "Students",
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
    const isInstitutionalAccessError = error.includes('No institutional access configured');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md">
          <div className={`mb-4 ${isInstitutionalAccessError ? 'text-amber-500' : 'text-red-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isInstitutionalAccessError ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">
            {isInstitutionalAccessError ? 'Setup Required' : 'Dashboard Error'}
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          
          {isInstitutionalAccessError ? (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-full py-2 px-4 bg-[#1D63A1] text-white rounded-lg hover:bg-[#1D63A1]/90 transition-colors"
              >
                Go to Profile Settings
              </button>
              <button
                onClick={() => navigate('/counselor-general-dashboard')}
                className="w-full py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                View General Dashboard
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-[#1D63A1] text-white rounded-lg hover:bg-[#1D63A1]/90 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFB71B]/5 to-[#2B3E4E]/5 pb-5 relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#FFB71B]/20 to-[#2B3E4E]/10 rounded-full blur-2xl animate-bounce-slow" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-tr from-[#2B3E4E]/15 to-[#FFB71B]/20 rounded-full blur-2xl animate-bounce-slower" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[#FFB71B]/15 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-[#2B3E4E]/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Header Section */}
      <div className="px-15 pt-10 flex flex-col items-start relative z-10">
        <p className="text-3xl font-bold text-[#2B3E4E]">
          Institutional Dashboard - <span className="text-[#FFB71B]">
            {institutionInfo?.name || "Institution"}
          </span>
        </p>
        <div className="flex items-center text-[#2B3E4E]/70 mt-1">
          <Clock className="h-4 w-4 mr-1.5 text-[#FFB71B]" />
          <span className="text-xs">{formattedTime}</span>
          <span className="mx-1.5">•</span>
          <span className="text-xs">{formattedDate}</span>
        </div>
        {institutionInfo && (
          <div className="flex items-center gap-4 text-sm text-[#2B3E4E]/70 mt-2">
            {institutionInfo.emailDomain && (
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-[#FFB71B]" />
                @{institutionInfo.emailDomain}
              </span>
            )}
            {institutionInfo.schoolCode && (
              <span className="flex items-center gap-1">
                <Hash className="h-4 w-4 text-[#FFB71B]" />
                {institutionInfo.schoolCode}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend Section - Moved outside chart */}
      <section className="w-full px-15 pt-6 pb-2 relative z-10">
        {/* Legend */}
        <div className="flex items-center justify-left gap-6 mb-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-[#FFB71B]/20">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded shadow-sm"></div>
              <span className="text-[#2B3E4E]">Well Above School Avg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded shadow-sm"></div>
              <span className="text-[#2B3E4E]">Above School Avg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded shadow-sm"></div>
              <span className="text-[#2B3E4E]">Below School Avg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div>
              <span className="text-[#2B3E4E]">Well Below School Avg</span>
            </div>
            <div className="text-xs text-[#2B3E4E]/60 ml-2 font-medium">
              Relative to schoolmates
            </div>
          </div>
        </div>

        {/* Institution Insights Summary Section */}
        <div className="flex flex-row gap-2 mb-8 items-start">
          {/* Performance Distribution Charts */}
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(255,183,27,0.15)] p-6 flex flex-col w-full max-w-[calc(100%-280px)] relative overflow-hidden group">
            {/* Decorative gradient orbs */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-bl from-[#FFB71B]/10 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-[#2B3E4E]/10 to-transparent rounded-full blur-2xl"></div>
            
            <div className="flex items-center justify-between w-full mb-6 relative z-10">
              <div className="ml-14 mt-5 text-3xl font-bold text-[#2B3E4E] tracking-tight">
                Performance Distribution Analysis
              </div>
              <div className="flex items-center gap-6">
                {/* Export Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportResults('csv')}
                    className="bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/90 hover:from-[#2B3E4E] hover:to-[#2B3E4E]/90 text-white py-2 px-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group/btn"
                  >
                    <Download className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExportResults('pdf')}
                    className="bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 hover:from-[#FFB71B] hover:to-[#FFB71B]/90 text-white py-2 px-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group/btn"
                  >
                    <FileText className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                    PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Three Charts Horizontally Aligned - GSA gets more space */}
            <div className="flex flex-row w-full">
              {/* General Scholastic Aptitude Chart - Takes more space due to more fields */}
              <div className="flex-2" style={{ flex: '1.5' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gsaPerformance.filter(Boolean)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="field" 
                      fontSize={10}
                      height={50}
                    />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="distribution.wellAbovePeer.percent" fill="#059669" name="Well Above School Avg" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.abovePeer.percent" fill="#3B82F6" name="Above School Avg" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.belowPeer.percent" fill="#F59E0B" name="Below School Avg" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.wellBelowPeer.percent" fill="#EF4444" name="Well Below School Avg" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <h3 className="text-lg font-bold text-[#FFB71B] text-center">General Scholastic Aptitude</h3>
              </div>

              {/* Academic Tracks Chart - Standard size */}
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={academicPerformance.filter(Boolean)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="field" 
                      fontSize={10}
                      height={50}
                    />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="distribution.wellAbovePeer.percent" fill="#059669" name="Well Above School Avg" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.abovePeer.percent" fill="#3B82F6" name="Above School Avg" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.belowPeer.percent" fill="#F59E0B" name="Below School Avg" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.wellBelowPeer.percent" fill="#EF4444" name="Well Below School Avg" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <h3 className="text-lg font-bold text-[#FFB71B] text-center">Academic Track</h3>
              </div>

              {/* Non-Academic Tracks Chart - Standard size */}
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={nonAcademicPerformance.filter(Boolean)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="field" 
                      fontSize={10}
                      height={50}
                    />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="distribution.wellAbovePeer.percent" fill="#059669" name="Well Above School Avg" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.abovePeer.percent" fill="#3B82F6" name="Above School Avg" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.belowPeer.percent" fill="#F59E0B" name="Below School Avg" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="distribution.wellBelowPeer.percent" fill="#EF4444" name="Well Below School Avg" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <h3 className="text-lg font-bold text-[#FFB71B] text-center">Non-Academic Track</h3>
              </div>
            </div>
          </div>
          <div className='flex-grow'></div>

          {/* Quick Stats Sidebar */}
          <div className='flex flex-col gap-2 w-[260px]'>
            <div className="flex gap-2 w-full">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-2 flex flex-col items-center border-2 border-[#FFB71B]/20 flex-1 transition-all duration-200 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFB71B]/5 to-[#2B3E4E]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`p-1.5 rounded-lg ${stat.color} mb-1 shadow-md group-hover:scale-110 transition-transform relative z-10`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <div className="text-[10px] text-[#2B3E4E]/70 text-center relative z-10 leading-tight">{stat.name}</div>
                  <div className="text-sm font-bold text-[#2B3E4E] text-center relative z-10">{stat.value}</div>
                </div>
              ))}
            </div>
            
            {/* Most Common RIASEC for Institution */}
            <div className="rounded-xl flex flex-col gap-3 py-4 min-h-0 transition-all duration-200 relative overflow-visible group">
              {/* <div className="absolute inset-0 bg-gradient-to-br from-[#2B3E4E]/5 to-[#FFB71B]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div> */}
              <div className='flex-1 flex flex-row gap-3 items-center'>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FFB71B] mb-2 shadow-lg relative z-10 group-hover:scale-110 transition-transform">
                  <School className="w-6 h-6 text-white" />
                </div>
              <div className="text-xs uppercase text-[#2B3E4E]/60 font-semibold mb-2 tracking-wider text-center relative z-10">Institution Personality</div>
              </div>
              {/* Display all 6 personality types with percentages */}
              <div className="space-y-1 w-full relative z-10 mb-2">
                {institutionInsights.mostCommonCodes && institutionInsights.mostCommonCodes.map((item, idx) => {
                  const descMap = {
                    R: 'Realistic',
                    I: 'Investigative',
                    A: 'Artistic',
                    S: 'Social',
                    E: 'Enterprising',
                    C: 'Conventional',
                  };
                  const colorMap = {
                    R: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
                    I: { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
                    A: { bg: 'bg-pink-50', text: 'text-pink-600', badge: 'bg-pink-100 text-pink-700' },
                    S: { bg: 'bg-green-50', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
                    E: { bg: 'bg-orange-50', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
                    C: { bg: 'bg-gray-50', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' },
                  };
                  const colors = colorMap[item.code];
                  return (
                    <div key={item.code} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} shadow-sm transition-transform hover:shadow-md`}>
                      <span className={`text-xs font-bold ${colors.text}`}>#{idx + 1}</span>
                      <span className={`text-sm font-bold ${colors.text} flex-1 text-left`}>{descMap[item.code]}</span>
                      <span className={`text-xs ${colors.badge} px-2 py-0.5 rounded-full font-medium`}>({item.code})</span>
                      <span className={`text-xs font-bold ${colors.text}`}>{item.percent}%</span>
                    </div>
                  );
                })}
              </div>
              {/* <div className="text-xs text-[#2B3E4E]/50 text-center relative z-10 italic">
                Top 3 personality types
              </div> */}
            </div>
          </div>
        </div>

        {/* Compact Summary Cards */}
        <div className="flex flex-row gap-4 mb-6">
          {/* Strengths & Concerns Combined */}
          <div className="bg-white rounded-xl shadow-md flex flex-col py-4 px-6 min-h-[140px] flex-1">
            <div className="text-left  mb-3">
              <span className="text-sm font-bold text-gray-700">Performance Overview</span>
                <span className="text-xs text-gray-400 ml-2">within school distribution</span>
              <div className="flex justify-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
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
                <div className="text-xs text-gray-500 mb-2">Strong Distribution Areas</div>
                {institutionInsights.strengths.slice(0, 4).map((strength, i) => (
                  <div key={i} className="text-xs text-green-700 truncate">• {strength}</div>
                ))}
                {institutionInsights.strengths.length > 4 && (
                  <div className="text-xs text-gray-400 mt-1">+{institutionInsights.strengths.length - 4} more</div>
                )}
              </div>
              <div>
                <div className="text-lg font-bold text-red-600 mb-1">{institutionInsights.concerns.length}</div>
                <div className="text-xs text-gray-500 mb-2">Areas Needing Support</div>
                {institutionInsights.concerns.slice(0, 4).map((concern, i) => (
                  <div key={i} className="text-xs text-red-700 truncate">• {concern}</div>
                ))}
                {institutionInsights.concerns.length > 4 && (
                  <div className="text-xs text-gray-400 mt-1">+{institutionInsights.concerns.length - 4} more</div>
                )}
              </div>
            </div>
          </div>

          {/* Top Career Paths - Compact */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl flex flex-col py-4 px-6 min-h-[140px] flex-1 transition-all duration-200 relative overflow-hidden group">
            {/* Decorative gradient orb */}
            {/* <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-bl from-[#2B3E4E]/10 via-[#FFB71B]/10 to-transparent rounded-full blur-2xl transition-opacity"></div> */}
            
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FFB71B] mb-2 mx-auto shadow-lg relative z-10 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-[#2B3E4E] text-center mb-2 relative z-10">Top Career Paths</div>
            {institutionInsights.topCareerPaths.length === 0 ? (
              <div className="text-center py-2 relative z-10 flex-1">
                {institutionStudents.length === 0 ? (
                  <div className="text-[#2B3E4E]/40 text-xs">No students found</div>
                ) : (
                  <>
                    <div className="text-[#2B3E4E]/40 text-xs mb-2">No career path data yet</div>
                    <div className="text-[#2B3E4E]/60 text-xs">
                      Encourage students to complete assessments
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex-1">
                  {institutionInsights.topCareerPaths
                    .slice(0, 3)
                    .map((cp, i) => {
                      const total = institutionCareerRecommendations.length;
                      const percent = total > 0 ? ((cp.count / total) * 100).toFixed(0) : '0';
                      return (
                        <div key={i} className="flex justify-between items-center text-xs mb-1 relative z-10">
                          <span className="truncate pr-2 text-[#2B3E4E] font-medium">{i + 1}. {cp.name}</span>
                          <span className="text-[#FFB71B] font-semibold text-right">{percent}%</span>
                        </div>
                      );
                    })}
                </div>
                {/* Show button if more than 3 items exist */}
                {institutionInsights.topCareerPaths.length > 3 && (
                  <button
                    onClick={() => setShowCareerPathsModal(true)}
                    className="w-full text-xs text-white bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 hover:from-[#FFB71B] hover:to-[#FFB71B]/90 py-1 px-2 rounded mt-2 font-medium transition-all duration-200 shadow-md hover:shadow-lg relative z-10"
                  >
                    View All ({institutionInsights.topCareerPaths.length}) →
                  </button>
                )}
              </>
            )}
          </div>

          {/* Top Careers - Compact */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl flex flex-col py-4 px-6 min-h-[140px] flex-1 transition-all duration-200 relative overflow-hidden group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500 mb-2 mx-auto group-hover:scale-110 transition-transform">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-700 text-center mb-2">Top Careers</div>
            {institutionInsights.topCareers.length === 0 ? (
              <div className="text-center py-2 relative z-10 flex-1">
                {institutionStudents.length === 0 ? (
                  <div className="text-[#2B3E4E]/40 text-xs">No students found</div>
                ) : (
                  <>
                    <div className="text-[#2B3E4E]/40 text-xs mb-2">No career data yet</div>
                    <div className="text-[#2B3E4E]/60 text-xs">
                      Encourage students to complete assessments
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex-1">
                  {institutionInsights.topCareers
                    .slice(0, 3)
                    .map((c, i) => {
                      const total = institutionCareerRecommendations.length;
                      const percent = total > 0 ? ((c.count / total) * 100).toFixed(0) : '0';
                      return (
                        <div key={i} className="flex justify-between items-center text-xs mb-1 relative z-10">
                          <span className="truncate pr-2 text-[#2B3E4E]">{i + 1}. {c.title}</span>
                          <span className="text-[#FFB71B] font-semibold text-right">{percent}%</span>
                        </div>
                      );
                    })}
                </div>
                {/* Show button if more than 3 items exist */}
                {institutionInsights.topCareers.length > 3 && (
                  <button
                    onClick={() => setShowCareersModal(true)}
                    className="w-full text-xs text-white bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/90 hover:from-[#2B3E4E] hover:to-[#2B3E4E]/90 py-1 px-2 rounded mt-2 font-medium transition-all duration-200 shadow-md hover:shadow-lg relative z-10"
                  >
                    View All ({institutionInsights.topCareers.length}) →
                  </button>
                )}
              </>
            )}
          </div>

          {/* Top Programs - Compact */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl flex flex-col py-4 px-6 min-h-[140px] flex-1 transition-all duration-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2B3E4E]/5 to-transparent transition-opacity"></div>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2B3E4E] mb-2 mx-auto shadow-lg relative z-10 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-[#2B3E4E] text-center mb-2 relative z-10">Top Programs</div>
            {institutionInsights.topPrograms.length === 0 ? (
              <div className="text-center py-2 relative z-10 flex-1">
                {institutionStudents.length === 0 ? (
                  <div className="text-[#2B3E4E]/40 text-xs">No students found</div>
                ) : (
                  <>
                    <div className="text-[#2B3E4E]/40 text-xs mb-2">No program data yet</div>
                    <div className="text-[#2B3E4E]/60 text-xs">
                      Encourage students to complete assessments
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex-1">
                  {institutionInsights.topPrograms
                    .slice(0, 3)
                    .map((p, i) => {
                      const total = institutionProgramRecommendations.length;
                      const percent = total > 0 ? ((p.count / total) * 100).toFixed(0) : '0';
                      return (
                        <div key={i} className="flex justify-between items-center text-xs mb-1 relative z-10">
                          <span className="truncate pr-2 text-[#2B3E4E]">{i + 1}. {p.name}</span>
                          <span className="text-[#FFB71B] font-semibold text-right">{percent}%</span>
                        </div>
                      );
                    })}
                </div>
                {/* Show button if more than 3 items exist */}
                {institutionInsights.topPrograms.length > 3 && (
                  <button
                    onClick={() => setShowProgramsModal(true)}
                    className="w-full text-xs text-white bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/90 hover:from-[#FFB71B] hover:to-[#FFB71B]/90 py-1 px-2 rounded mt-2 font-medium transition-all duration-200 shadow-md hover:shadow-lg relative z-10"
                  >
                    View All ({institutionInsights.topPrograms.length}) →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Search and Filter Header */}
      <header className="relative z-10">
        <div className="px-15 py-4">
          <div className="flex items-center justify-between gap-4 pt6 rounded-xl">
            {/* Pagination Controls on Left */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className="px-2 py-1 rounded bg-[#2B3E4E]/10 text-[#2B3E4E] text-xs font-semibold disabled:opacity-50 hover:bg-[#FFB71B] hover:text-white transition-colors border border-[#2B3E4E]/20"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                ←
              </button>
              <span className="text-xs font-bold text-[#2B3E4E] whitespace-nowrap">
                Page {page} of {Math.ceil(totalResults / pageSize)}
              </span>
              <button
                className="px-2 py-1 rounded bg-[#2B3E4E]/10 text-[#2B3E4E] text-xs font-semibold disabled:opacity-50 hover:bg-[#FFB71B] hover:text-white transition-colors border border-[#2B3E4E]/20"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === Math.ceil(totalResults / pageSize)}
              >
                →
              </button>
              <select
                className="px-2 py-1 rounded border-2 border-[#2B3E4E]/30 text-[#2B3E4E] text-xs font-semibold focus:border-[#FFB71B] focus:outline-none"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                {[4, 8, 12, 16, 24].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Search and Filter Bar on Right */}
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
      <main className="w-full flex flex-col lg:flex-row px-15 relative z-10">
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
        <aside className="w-full lg:w-80 flex-shrink-0">
          {/* Institution Completion Rate */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl border-2 border-[#FFB71B]/20 hover:border-[#2B3E4E]/40 p-4 mb-4 animate-fade-in transition-all duration-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFB71B]/5 to-[#2B3E4E]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-base font-bold text-[#2B3E4E] mb-1 relative z-10">Institution Completion Rate</h3>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-1 relative z-10">{completionRate}%</div>
            <div className="text-xs text-[#2B3E4E]/70 mb-2 relative z-10">
              {institutionStudents.length - studentsWithNoResults.length} of {institutionStudents.length} institution students completed assessments
            </div>
            {studentsWithNoResults.length > 0 && (
              <div className="relative z-10">
                <div className="text-xs text-[#2B3E4E]/60 mb-1">Students with no results:</div>
                <ul className="max-h-20 overflow-y-auto text-xs text-[#2B3E4E]/80">
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
                    {/* User Avatar with Profile Picture */}
                    {user.profilePictureUrl ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#FFB71B]/50 flex-shrink-0">
                        <img
                          src={user.profilePictureUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            e.target.parentElement.innerHTML = `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D63A1] to-[#FFB71B] flex items-center justify-center text-white text-sm font-bold">${user.firstName?.[0]}${user.lastName?.[0]}</div>`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D63A1] to-[#FFB71B] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                    )}
                    <div className="flex-start flex-1 min-w-0">
                      <div className="text-left truncate font-medium text-xs text-gray-800 flex items-center gap-1">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-left truncate text-[11px] text-gray-500">{assessment.title}</div>
                    </div>
                    <div className="text-[10px] text-gray-400 whitespace-nowrap">
                      <div className="flex justify-end items-center mb-0.5">
                        {student && getStudentSourceIcon(student)}
                      </div>
                      {activity.userAssessment?.dateCompleted ? new Date(activity.userAssessment.dateCompleted).toLocaleDateString() : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </main>
      
      {/* School Code Setup Modal */}
      {showSchoolCodeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E] p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-[#FFB71B] w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                    <Hash className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Setup School Code</h3>
                </div>
                <button
                  onClick={handleSchoolCodeCancel}
                  className="cursor-pointer p-2 hover:bg-white/10 text-[#FFB71B] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  To access the institutional dashboard, please enter your school code. 
                  This will link your account to your institution and allow you to view student assessment data.
                </p>
                
                {schoolCodeError && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg mb-4">
                    <p className="text-sm font-medium">{schoolCodeError}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">School Code</label>
                  <input
                    type="text"
                    value={schoolCodeInput}
                    onChange={(e) => setSchoolCodeInput(e.target.value)}
                    className="w-full p-3 border-2 border-[#2B3E4E]/50 rounded-xl focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                    placeholder="Enter your school code"
                    disabled={schoolCodeLoading}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSchoolCodeCancel}
                  className="cursor-pointer flex-1 py-3 px-4 bg-[#2B3E4E] text-white rounded-xl hover:bg-[#FFB71B] transition-colors font-medium"
                  disabled={schoolCodeLoading}
                >
                  Use General Dashboard
                </button>
                <button
                  onClick={handleSchoolCodeSave}
                  disabled={schoolCodeLoading || !schoolCodeInput.trim()}
                  className="cursor-pointer flex-1 py-3 px-4 bg-[#FFB71B] text-[#2B3E4E] rounded-xl hover:bg-[#2B3E4E] hover:text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {schoolCodeLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save & Continue
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Modals */}
      <TopCareersModal 
        isOpen={showCareersModal}
        onClose={() => setShowCareersModal(false)}
        topCareers={institutionInsights.topCareers}
        totalRecommendations={institutionCareerRecommendations.length}
      />

      <TopCareerPathsModal 
        isOpen={showCareerPathsModal}
        onClose={() => setShowCareerPathsModal(false)}
        topCareerPaths={institutionInsights.topCareerPaths}
        totalRecommendations={institutionCareerRecommendations.length}
      />

      <TopProgramsModal 
        isOpen={showProgramsModal}
        onClose={() => setShowProgramsModal(false)}
        topPrograms={institutionInsights.topPrograms}
        totalRecommendations={institutionProgramRecommendations.length}
      />
    </div>
  );
};

export default InstitutionalDashboard;