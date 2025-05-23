import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import assessmentTakingService from '../services/assessmentTakingService';
import assessmentService from '../services/assessmentService';
import userAssessmentService from '../services/userAssessmentService';
import authService from '../services/authService';

// Import Chart.js components at the top of the file
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AssessmentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inProgressAssessments, setInProgressAssessments] = useState([]);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [completedByAssessment, setCompletedByAssessment] = useState({});
  const [availableAssessments, setAvailableAssessments] = useState([]);
  const [assessmentStats, setAssessmentStats] = useState({});

  const navigate = useNavigate();

  const getCurrentUserId = () => {
    return authService.getCurrentUserId() || 1; // Fallback to 1 during development
  };

  const userId = getCurrentUserId();

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Helper function to get score color class
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Helper function to get score background class
  const getScoreBgClass = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);

        // Fetch in-progress assessments
        const inProgressData = await assessmentTakingService.getInProgressAssessments(userId);
        const validInProgressAssessments = inProgressData.filter(
          assessment => assessment.user.userId === userId
        );
        setInProgressAssessments(validInProgressAssessments);

        // Fetch all available assessments
        const allAssessments = await assessmentService.getAllAssessments();
        
        // Fetch completed assessments with their results
        const completedData = await userAssessmentService.getCompletedAssessments(userId);
        console.log('Completed assessments data:', completedData); // Debug log
        setCompletedAssessments(completedData);
        
        // For each completed assessment, fetch its results if not already included
        const completedWithResults = await Promise.all(completedData.map(async assessment => {
          if (!assessment.result) {
            try {
              const resultData = await userAssessmentService.getAssessmentResults(assessment.userQuizAssessment);
              return {
                ...assessment,
                result: resultData.assessmentResult,
                sectionResults: resultData.sectionResults
              };
            } catch (err) {
              console.error(`Error fetching results for assessment ${assessment.userQuizAssessment}:`, err);
              return assessment;
            }
          }
          return assessment;
        }));
        
        setCompletedAssessments(completedWithResults);
        
        // Calculate assessment stats
        const statsMap = {};
        const groupedAssessments = {};
        
        // Group completed assessments by assessment ID
        completedWithResults.forEach(assessment => {
          const assessmentId = assessment.assessment.assessmentId;
          
          if (!groupedAssessments[assessmentId]) {
            groupedAssessments[assessmentId] = [];
          }
          
          groupedAssessments[assessmentId].push(assessment);
          
          // Count total attempts
          if (!statsMap[assessmentId]) {
            statsMap[assessmentId] = {
              attempts: 0,
              highestScore: 0,
              averageScore: 0,
              totalScore: 0,
              lastCompletedDate: null
            };
          }
          
          // Update statistics
          statsMap[assessmentId].attempts++;
          
          const score = assessment.result?.overallScore || 0;
          statsMap[assessmentId].totalScore += score;
          statsMap[assessmentId].averageScore = statsMap[assessmentId].totalScore / statsMap[assessmentId].attempts;
          
          if (score > statsMap[assessmentId].highestScore) {
            statsMap[assessmentId].highestScore = score;
          }
          
          const completedDate = new Date(assessment.dateCompleted);
          if (!statsMap[assessmentId].lastCompletedDate || 
              completedDate > new Date(statsMap[assessmentId].lastCompletedDate)) {
            statsMap[assessmentId].lastCompletedDate = assessment.dateCompleted;
          }
        });
        
        console.log('Processed assessment stats:', statsMap); // Debug log
        setCompletedByAssessment(groupedAssessments);
        setAssessmentStats(statsMap);

        // Filter out assessments that are in progress from available assessments
        const inProgressIds = validInProgressAssessments.map(a => a.assessment.assessmentId);
        const availableData = allAssessments.filter(assessment =>
          !inProgressIds.includes(assessment.assessmentId)
        );
        setAvailableAssessments(availableData);

        setLoading(false);
      } catch (err) {
        setError('Failed to load assessments. Please try again later.');
        setLoading(false);
        console.error('Error fetching assessments:', err);
      }
    };

    fetchAssessments();
  }, [userId]);

  const handleContinueAssessment = (assessmentId) => {
    navigate(`/take-assessment/${assessmentId}`);
  };

  const handleStartAssessment = (assessmentId) => {
    navigate(`/take-assessment/${assessmentId}`);
  };

  const handleViewResults = (userQuizAssessmentId) => {
    navigate(`/assessment-results/${userQuizAssessmentId}`);
  };

  // Replace the generateScoreTrendData function with this updated version that formats data for a radar chart
  const generateScoreTrendData = (assessmentStats) => {
    // Get unique section types to use as labels (e.g., GSA, Academic Track, Interest, etc.)
    const sectionTypes = new Set();
    
    // For each assessment, collect all sections from all attempts
    Object.entries(completedByAssessment).forEach(([assessmentId, attempts]) => {
      attempts.forEach(attempt => {
        const sectionResults = attempt.sectionResults || attempt.result?.sectionResults;
        if (sectionResults && Array.isArray(sectionResults)) {
          sectionResults.forEach(section => {
            if (section.sectionType) {
              sectionTypes.add(section.sectionType);
            }
          });
        }
      });
    });
    
    // If no section types were found, use placeholder categories
    const sectionTypesList = Array.from(sectionTypes).length > 0 
      ? Array.from(sectionTypes) 
      : ['Academic', 'Interest', 'GSA', 'Other'];
  
    // Colors for different assessments - extended palette with more colors
    const colors = [
      { bg: 'rgba(29, 99, 161, 0.2)', border: 'rgba(29, 99, 161, 1)' },
      { bg: 'rgba(255, 183, 27, 0.2)', border: 'rgba(255, 183, 27, 1)' },
      { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' },
      { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' },
      { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },
      { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' },
      { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' },
      { bg: 'rgba(255, 206, 86, 0.2)', border: 'rgba(255, 206, 86, 1)' },
      { bg: 'rgba(231, 233, 237, 0.2)', border: 'rgba(231, 233, 237, 1)' }
    ];
    
    // Create datasets - one for EACH ATTEMPT (not just each assessment type)
    const datasets = [];
    let colorIndex = 0;
    
    Object.entries(completedByAssessment).forEach(([assessmentId, attempts]) => {
      const assessment = attempts[0].assessment;
      const title = assessment.title;
      
      // Process all attempts instead of just the latest one
      attempts.forEach((attempt, attemptIndex) => {
        const color = colors[colorIndex % colors.length];
        colorIndex++;
        
        // Calculate scores per section type for this attempt
        const sectionScores = {};
        
        const attemptDate = new Date(attempt.dateCompleted);
        const formattedDate = attemptDate.toLocaleDateString();
        
        const sectionResults = attempt.sectionResults || attempt.result?.sectionResults;
        
        if (sectionResults && Array.isArray(sectionResults)) {
          sectionResults.forEach(section => {
            const sectionType = section.sectionType || 'Other';
            if (!sectionScores[sectionType]) {
              sectionScores[sectionType] = 0;
            }
            sectionScores[sectionType] = section.percentageScore || section.sectionScore || 0;
          });
        }
        
        // If we have an overall score but no section breakdowns, use the overall score
        if (Object.keys(sectionScores).length === 0 && attempt.result?.overallScore) {
          sectionScores['Overall'] = attempt.result.overallScore;
          if (!sectionTypesList.includes('Overall')) {
            sectionTypesList.push('Overall');
          }
        }
        
        // Create data array with scores for each section type (fill with 0 for missing sections)
        const data = sectionTypesList.map(sectionType => sectionScores[sectionType] || 0);
        
        datasets.push({
          label: `${title} (Attempt ${attemptIndex + 1} - ${formattedDate})`,
          data: data,
          backgroundColor: color.bg,
          borderColor: color.border,
          pointBackgroundColor: color.border,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: color.border,
          borderWidth: 2,
          fill: true
        });
      });
    });
    
    return {
      labels: sectionTypesList,
      datasets: datasets
    };
  };

  const generateImprovementData = (completedByAssessment) => {
    const improvements = Object.entries(completedByAssessment).map(([assessmentId, attempts]) => {
      if (attempts.length < 2) return { id: assessmentId, name: attempts[0].assessment.title, improvement: 0 };
      
      // Sort attempts by date
      const sortedAttempts = [...attempts].sort((a, b) => 
        new Date(a.dateCompleted) - new Date(b.dateCompleted));
      
      const firstScore = sortedAttempts[0].result?.overallScore || 0;
      const lastScore = sortedAttempts[sortedAttempts.length - 1].result?.overallScore || 0;
      const improvement = lastScore - firstScore;
      
      return {
        id: assessmentId,
        name: attempts[0].assessment.title,
        improvement,
        firstScore,
        lastScore
      };
    });
    
    // Sort by improvement (highest first)
    const sortedImprovements = improvements
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 5); // Take top 5
    
    return {
      labels: sortedImprovements.map(item => item.name),
      datasets: [
        {
          label: 'Score Improvement',
          data: sortedImprovements.map(item => item.improvement),
          backgroundColor: sortedImprovements.map(item => 
            item.improvement >= 0 ? 'rgba(72, 187, 120, 0.7)' : 'rgba(237, 100, 100, 0.7)'),
          borderColor: sortedImprovements.map(item => 
            item.improvement >= 0 ? 'rgba(72, 187, 120, 1)' : 'rgba(237, 100, 100, 1)'),
          borderWidth: 1
        }
      ]
    };
  };

  const generateSectionAveragesData = (completedAssessments, completedByAssessment) => {
    // Get all unique section types across all assessments
    const allSectionTypes = new Set();
    completedAssessments.forEach(assessment => {
      const sectionResults = assessment.sectionResults || assessment.result?.sectionResults;
      if (sectionResults && Array.isArray(sectionResults)) {
        sectionResults.forEach(section => {
          if (section.sectionType) {
            allSectionTypes.add(section.sectionType);
          }
        });
      }
    });
    
    const sectionTypesList = Array.from(allSectionTypes);
    
    // If no section types were found, add placeholder
    if (sectionTypesList.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'No Assessment Data',
          data: [0],
          backgroundColor: 'rgba(200, 200, 200, 0.2)',
          borderColor: 'rgba(200, 200, 200, 1)',
          pointBackgroundColor: 'rgba(200, 200, 200, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(200, 200, 200, 1)'
        }]
      };
    }
    
    // Create datasets for each assessment
    const datasets = [];
    
    // Colors for different assessments
    const colors = [
      { bg: 'rgba(29, 99, 161, 0.2)', border: 'rgba(29, 99, 161, 1)' },
      { bg: 'rgba(255, 183, 27, 0.2)', border: 'rgba(255, 183, 27, 1)' },
      { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' },
      { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' },
      { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },
      { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' }
    ];
    
    // Group assessments by their title
    const assessmentsByTitle = {};
    Object.entries(completedByAssessment).forEach(([assessmentId, attempts]) => {
      const assessment = attempts[0].assessment;
      const title = assessment.title;
      
      if (!assessmentsByTitle[title]) {
        assessmentsByTitle[title] = [];
      }
      
      attempts.forEach(attempt => {
        if (attempt.result?.sectionResults || attempt.sectionResults) {
          assessmentsByTitle[title].push(attempt);
        }
      });
    });
    
    // Create a dataset for each assessment type
    let colorIndex = 0;
    Object.entries(assessmentsByTitle).forEach(([title, attempts]) => {
      const color = colors[colorIndex % colors.length];
      colorIndex++;
      
      // Calculate average scores per section for this assessment
      const sectionScores = {};
      let totalAttempts = 0;
      
      // Collect all section scores from all attempts
      attempts.forEach(attempt => {
        const sectionResults = attempt.sectionResults || attempt.result?.sectionResults;
        if (sectionResults && Array.isArray(sectionResults)) {
          totalAttempts++;
          sectionResults.forEach(section => {
            const sectionType = section.sectionType || 'Other';
            if (!sectionScores[sectionType]) {
              sectionScores[sectionType] = 0;
            }
            sectionScores[sectionType] += section.percentageScore || section.sectionScore || 0;
          });
        }
      });
      
      // Calculate averages
      Object.keys(sectionScores).forEach(sectionType => {
        if (totalAttempts > 0) {
          sectionScores[sectionType] /= totalAttempts;
        }
      });
      
      // Create data array with all section types (fill with 0 for missing sections)
      const data = sectionTypesList.map(sectionType => sectionScores[sectionType] || 0);
      
      datasets.push({
        label: title,
        data: data,
        backgroundColor: color.bg,
        borderColor: color.border,
        pointBackgroundColor: color.border,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color.border,
        borderWidth: 2
      });
    });
    
    return {
      labels: sectionTypesList,
      datasets: datasets
    };
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen h-full'>
        <div>
          <img 
            src="/src/assets/characters/quirky.svg" 
            alt="Quirky mascot" 
            className="quirky-bounce h-50 mx-auto"
          />
        </div>
        <p className="text-lg font-bold text-gray-600">Please wait for a moment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-8 bg-[#F8F9FA] min-h-screen relative overflow-visible">
      {/* Playful floating shapes background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#FFB71B]/30 to-[#1D63A1]/20 rounded-full blur-2xl animate-bounce-slow" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-tr from-[#1D63A1]/20 to-[#FFB71B]/30 rounded-full blur-2xl animate-bounce-slower" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-[#232D35]/10 to-[#1D63A1]/10 rounded-full blur-2xl animate-bounce-slowest" />
      </div>
      <div className="relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#1D63A1] to-[#2B3E4E] bg-clip-text text-transparent drop-shadow-lg tracking-tight animate-pop">
            Assessment Dashboard
          </h1>
          <p className="mt-4 text-lg text-[#232D35]/70 font-medium animate-fade-in">
            Continue your educational journey or start something new!
          </p>
        </div>
        {/* Playful mascot image, overlapping container on the right */}
        <div className="relative">
          <img 
            src="/src/assets/characters/ohMyLeft.svg" 
            alt="Oh My Charcter" 
            className="hidden md:block absolute -top-10 -right-30 h-[320px] w-auto z-20 drop-shadow-xl animate-float pointer-events-none"
            style={{ maxWidth: '40vw', minWidth: '220px' }}
          />
          {/* For mobile, show at the bottom, centered */}
          <img 
            src="/src/assets/characters/ohMy.svg" 
            alt="Oh My Charcter" 
            className="block md:hidden mx-auto mb-4 h-40 w-auto z-10 animate-float"
          />
        </div>

        {/* In Progress Assessments */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-[#232D35] mb-4 pb-2 border-b border-[#1D63A1]/20 flex items-center gap-2 animate-slide-in">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFB71B]/30 text-[#1D63A1] mr-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            </span>
            Continue Your Progress
          </h2>
          {inProgressAssessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {inProgressAssessments.map((assessment, idx) => (
                <motion.div
                  key={assessment.userQuizAssessment}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-3xl shadow-xl border-2 border-[#FFB71B]/30 hover:border-[#1D63A1]/40 transition-all duration-300 overflow-hidden relative group animate-card-pop"
                >
                  <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#FFB71B] to-[#1D63A1] w-12 h-12 rounded-full opacity-20 group-hover:opacity-40 transition" />
                  <div className="p-6 border-b border-[#FFB71B]/20 bg-gradient-to-r from-[#FFB71B]/10 to-[#FFB71B]/5">
                    <h3 className="text-left text-lg font-bold text-[#232D35] flex items-center gap-2">
                      {/* <svg className="w-5 h-5 text-[#1D63A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg> */}
                      {assessment.assessment.title}
                    </h3>
                    <p className="text-left text-sm text-[#232D35]/70 mt-1">{assessment.assessment.description}</p>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-[#232D35]/80">Progress</span>
                        <span className="text-xs font-bold text-[#1D63A1]">{assessment.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-[#F8F9FA] rounded-full h-3 overflow-hidden">
                        <div className="h-3 rounded-full bg-gradient-to-r from-[#1D63A1] to-[#FFB71B] animate-progress-bar" style={{ width: `${assessment.progressPercentage}%` }}></div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-[#232D35]/60 mb-5">
                      <svg className="mr-1.5 h-4 w-4 text-[#1D63A1]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Last saved: {new Date(assessment.lastSavedTime).toLocaleString()
                    }</div>
                    <div className="flex-1 flex flex-col items-end">
                      <button
                        onClick={() => handleContinueAssessment(assessment.assessment.assessmentId)}
                        className="bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] text-white py-2.5 px-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 animate-bounce-short"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Continue Assessment
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#232D35]/5 rounded-2xl border border-[#232D35]/10 animate-fade-in">
              <svg className="mx-auto h-12 w-12 text-[#232D35]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <h3 className="mt-2 text-base font-semibold text-[#232D35]/80">No in-progress assessments</h3>
              <p className="mt-1 text-sm text-[#232D35]/60">Start a new assessment to begin your journey!</p>
            </div>
          )}
        </div>

        {/* Available Assessments */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-[#232D35] mb-4 pb-2 border-b border-[#1D63A1]/20 flex items-center gap-2 animate-slide-in">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1D63A1]/20 text-[#FFB71B] mr-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </span>
            Available Assessments
          </h2>
          {availableAssessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableAssessments.map((assessment, idx) => (
                <motion.div
                  key={assessment.assessmentId}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-3xl shadow-xl hover:border-[#FFB71B]/40 transition-all duration-300 overflow-hidden relative group animate-card-pop"
                >
                  <div className="absolute -top-4 -left-4 bg-gradient-to-br from-[#1D63A1] to-[#FFB71B] w-12 h-12 rounded-full opacity-20 group-hover:opacity-40 transition" />
                  <div className="p-6 border-b border-[#1D63A1]/20 bg-gradient-to-r from-[#1D63A1]/10 to-[#1D63A1]/5">
                    <h3 className="text-lg font-bold text-[#232D35] flex items-center gap-2">
                      {/* <svg className="w-5 h-5 text-[#FFB71B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg> */}
                      {assessment.title}
                    </h3>
                    <p className="text-left text-sm text-[#232D35]/70 mt-1">{assessment.description}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-end p-6">
                    <button
                      onClick={() => handleStartAssessment(assessment.assessmentId)}
                      className="bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] text-white py-2.5 px-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 animate-bounce-short"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      Start Assessment
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#232D35]/5 rounded-2xl border border-[#232D35]/10 animate-fade-in">
              <p className="text-base text-[#232D35]/60">No assessments available at this time.</p>
            </div>
          )}
        </div>

        {/* Performance Summary Dashboard - MOVED BEFORE ASSESSMENT HISTORY */}
        {Object.keys(completedByAssessment).length > 0 && (
          <div className="mb-14">
            <h2 className="text-xl font-bold text-[#232D35] mb-4 pb-2 border-b border-[#1D63A1]/20 flex items-center gap-2 animate-slide-in">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1D63A1]/20 text-[#FFB71B] mr-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </span>
              Performance Summary
            </h2>
            
            {/* Key metrics */}
            <div className="bg-white rounded-3xl shadow-xl p-7 mb-8 animate-card-pop">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
                <div className="bg-[#1D63A1]/10 rounded-xl p-5 border border-[#1D63A1]/30 flex flex-col items-center">
                  <h3 className="text-sm font-medium text-[#1D63A1] mb-1">Total Assessments Completed</h3>
                  <p className="text-3xl font-extrabold text-[#232D35] animate-pop">{completedAssessments.length}</p>
                </div>
                <div className="bg-[#FFB71B]/10 rounded-xl p-5 border border-[#FFB71B]/30 flex flex-col items-center">
                  <h3 className="text-sm font-medium text-[#232D35] mb-1">Assessment Types</h3>
                  <p className="text-3xl font-extrabold text-[#232D35] animate-pop">{Object.keys(completedByAssessment).length}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-5 border border-green-200 flex flex-col items-center">
                  <h3 className="text-sm font-medium text-green-700 mb-1">Highest Score</h3>
                  <p className="text-3xl font-extrabold text-[#232D35] animate-pop">
                    {Object.values(assessmentStats).length > 0 ?
                      Math.max(...Object.values(assessmentStats).map(stat => stat.highestScore)).toFixed(1) + '%' :
                      'N/A'}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-200 flex flex-col items-center">
                  <h3 className="text-sm font-medium text-purple-700 mb-1">Average Performance</h3>
                  <p className="text-3xl font-extrabold text-[#232D35] animate-pop">
                    {Object.values(assessmentStats).length > 0 ?
                      (Object.values(assessmentStats).reduce((acc, stat) => acc + stat.averageScore, 0) /
                        Object.keys(assessmentStats).length).toFixed(1) + '%' :
                      'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance by Assessment - Radar Chart with Multiple Datasets */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl p-5 animate-card-pop border-2 border-[#1D63A1]/10"
              >
                <h3 className="text-lg font-semibold text-[#232D35] mb-4 text-center">Performance by Assessment</h3>
                <div className="h-[450px]">  {/* Increased from 300px to 450px */}
                  {Object.keys(assessmentStats).length > 0 && (
                    <Radar
                      data={generateScoreTrendData(assessmentStats)}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        elements: {
                          line: {
                            borderWidth: 2
                          }
                        },
                        scales: {
                          r: {
                            angleLines: {
                              display: true
                            },
                            suggestedMin: 0,
                            suggestedMax: 100,
                            pointLabels: {
                              font: {
                                weight: 'bold',
                                size: 12  // Added slightly larger font for better visibility
                              }
                            },
                            ticks: {
                              stepSize: 20,
                              backdropColor: 'transparent'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 12,
                              padding: 15,
                              usePointStyle: true
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </motion.div>
              
              {/* Score Improvement Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-xl p-5 animate-card-pop border-2 border-[#1D63A1]/10"
              >
                <h3 className="text-lg font-semibold text-[#232D35] mb-4 text-center">Score Improvement</h3>
                <div className="h-[300px]">
                  {Object.values(completedByAssessment).some(attempts => attempts.length > 1) ? (
                    <Bar
                      data={generateImprovementData(completedByAssessment)}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const item = context.raw;
                                return item >= 0 ? `Improved by ${item.toFixed(1)}%` : `Decreased by ${Math.abs(item).toFixed(1)}%`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Score Change (%)'
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="mt-2 text-gray-500">Complete more attempts to see improvement data</p>
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Section Performance Radar Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl p-5 animate-card-pop border-2 border-[#1D63A1]/10 lg:col-span-2"
              >
                <h3 className="text-lg font-semibold text-[#232D35] mb-4 text-center">Performance by Section Type</h3>
                <div className="h-[500px]">  {/* Increased from 350px to 500px */}
                  {completedAssessments.some(a => {
                    const hasResults = a.result?.sectionResults?.length > 0;
                    const hasSectionResults = a.sectionResults && a.sectionResults.length > 0;
                    return hasResults || hasSectionResults;
                  }) ? (
                    <Radar
                      data={generateSectionAveragesData(completedAssessments, completedByAssessment)}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        elements: {
                          line: {
                            borderWidth: 2
                          }
                        },
                        scales: {
                          r: {
                            angleLines: {
                              display: true
                            },
                            suggestedMin: 0,
                            suggestedMax: 100,
                            pointLabels: {
                              font: {
                                weight: 'bold',
                                size: 12  // Added slightly larger font for better visibility
                              }
                            },
                            ticks: {
                              stepSize: 20,
                              backdropColor: 'transparent'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 12,
                              padding: 15,
                              usePointStyle: true
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="mt-2 text-gray-500">No section data available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Your Assessment History - MOVED AFTER PERFORMANCE SUMMARY */}
        {Object.keys(completedByAssessment).length > 0 ? (
          <div className="mb-14">
            <h2 className="text-xl font-bold text-[#232D35] mb-6 pb-2 border-b border-[#1D63A1]/20 flex items-center gap-2 animate-slide-in">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFB71B]/30 text-[#1D63A1] mr-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </span>
              Your Assessment History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
              {Object.entries(completedByAssessment).map(([assessmentId, attempts], idx) => {
                const stats = assessmentStats[assessmentId];
                const assessment = attempts[0].assessment;
                return (
                  <motion.div
                    key={assessmentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white rounded-3xl shadow-xl hover:border-[#FFB71B]/40 transition-all duration-300 flex flex-col overflow-hidden animate-card-pop relative"
                  >
                    <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#FFB71B] to-[#1D63A1] w-12 h-12 rounded-full opacity-20 group-hover:opacity-40 transition" />
                    <div className="p-6 border-b border-[#1D63A1]/20 bg-gradient-to-r from-[#1D63A1]/10 to-[#1D63A1]/5 flex justify-between items-center">
                      <div className='w-2/3'>
                        <h3 className="text-xl font-bold text-[#232D35] flex items-center gap-2">
                          {/* <svg className="w-5 h-5 text-[#FFB71B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg> */}
                          {assessment.title}
                        </h3>
                        <p className="text-left text-sm text-[#232D35]/70 mt-1">{assessment.description}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="bg-[#2B3E4E]/20 px-4 py-2 rounded-lg">
                          <span className="text-xs text-[#2B3E4E] block">Attempts</span>
                          <span className="text-2xl font-bold text-[#2B3E4E]">{stats.attempts}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {attempts.map((attempt, i) => (
                          <div
                            key={attempt.userQuizAssessment}
                            className={`rounded-xl border-2 p-4 flex flex-col gap-2 shadow-sm transition-all duration-200 bg-[#F8F9FA] hover:bg-[#FFB71B]/10 border-[#1D63A1]/10 animate-attempt-pop`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[#2B3E4E] text-base">Attempt #{attempt.attemptNo || i + 1}</span>
                              {/* <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-bold border ${getScoreBgClass(attempt.result?.overallScore || 0)} ${getScoreColorClass(attempt.result?.overallScore || 0)}`}>
                                {attempt.result?.overallScore?.toFixed(1) || 0}%
                              </span> */}
                            </div>
                            <div className="text-left text-xs text-[#232D35]/70 mb-1">
                              <span className="font-semibold">Date:</span> {formatDate(attempt.dateCompleted)}
                            </div>
                            <div className="text-left text-xs text-[#232D35]/70 mb-1">
                              <span className="font-semibold">Duration:</span> {attempt.timeSpentSeconds ? `${Math.floor(attempt.timeSpentSeconds / 60)} mins ${attempt.timeSpentSeconds % 60} secs` : 'N/A'}
                            </div>
                            <div className="mt-2 flex justify-end">
                              <span
                                onClick={() => handleViewResults(attempt.userQuizAssessment)}
                                className="text-[#FFB71B] font-bold cursor-pointer inline-flex items-center gap-1 hover:underline hover:text-[#2B3E4E] transition-colors"
                                role="button"
                                tabIndex={0}
                                onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') handleViewResults(attempt.userQuizAssessment); }}
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                View Results
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.07 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleStartAssessment(assessment.assessmentId)}
                          className="bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] text-white py-2.5 px-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 animate-bounce-short"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                          Retake Assessment
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-14">
            <h2 className="text-xl font-bold text-[#232D35] mb-4 pb-2 border-b border-[#1D63A1]/20 flex items-center gap-2 animate-slide-in">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFB71B]/30 text-[#1D63A1] mr-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </span>
              Your Assessment History
            </h2>
            <div className="text-center py-12 bg-[#232D35]/5 rounded-2xl border border-[#232D35]/10 animate-fade-in">
              <svg className="mx-auto h-12 w-12 text-[#232D35]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <h3 className="mt-2 text-base font-semibold text-[#232D35]/80">No completed assessments</h3>
              <p className="mt-1 text-sm text-[#232D35]/60">Complete an assessment to see your history and performance statistics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentDashboard;
