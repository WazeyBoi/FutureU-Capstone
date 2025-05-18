import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import assessmentTakingService from '../services/assessmentTakingService';
import assessmentService from '../services/assessmentService';
import authService from '../services/authService';

const AssessmentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inProgressAssessments, setInProgressAssessments] = useState([]);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [availableAssessments, setAvailableAssessments] = useState([]);

  const navigate = useNavigate();

  const getCurrentUserId = () => {
    return authService.getCurrentUserId() || 1; // Fallback to 1 during development
  };

  const userId = getCurrentUserId();

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);

        const inProgressData = await assessmentTakingService.getInProgressAssessments(userId);

        const validInProgressAssessments = inProgressData.filter(
          assessment => assessment.user.userId === userId
        );

        setInProgressAssessments(validInProgressAssessments);

        const allAssessments = await assessmentService.getAllAssessments();

        const completedData = allAssessments.filter(assessment => {
          return false; // Replace with actual logic
        });
        setCompletedAssessments(completedData);

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

  const handleViewResults = (assessmentId) => {
    navigate(`/assessment-results/${assessmentId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1D63A1]"></div>
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#232D35]/5 to-white min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#1D63A1] to-[#232D35] bg-clip-text text-transparent">
          Assessment Dashboard
        </h1>
        <p className="mt-4 text-lg text-[#232D35]/70">
          Continue your educational journey or start something new
        </p>
      </div>

      {/* In Progress Assessments */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-[#232D35] mb-4 pb-2 border-b border-[#1D63A1]/20 flex items-center">
          <svg className="w-5 h-5 mr-2 text-[#1D63A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
          </svg>
          Continue Your Progress
        </h2>

        {inProgressAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressAssessments.map((assessment) => (
              <motion.div
                key={assessment.userQuizAssessment}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-[#FFB71B]/30"
              >
                <div className="p-5 border-b border-[#FFB71B]/20 bg-gradient-to-r from-[#FFB71B]/10 to-[#FFB71B]/5">
                  <h3 className="text-lg font-semibold text-[#232D35]">{assessment.assessment.title}</h3>
                  <p className="text-sm text-[#232D35]/70 mt-1">{assessment.assessment.description}</p>
                </div>

                <div className="p-5">
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-[#232D35]/80">Progress</span>
                      <span className="text-xs font-bold text-[#1D63A1]">{assessment.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-[#1D63A1] to-[#1D63A1]/80"
                        style={{ width: `${assessment.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-[#232D35]/60 mb-5">
                    <svg className="mr-1.5 h-4 w-4 text-[#1D63A1]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Last saved: {new Date(assessment.lastSavedTime).toLocaleString()}
                  </div>

                  <button
                    onClick={() => handleContinueAssessment(assessment.assessment.assessmentId)}
                    className="w-full bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#232D35] py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Continue Assessment
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#232D35]/5 rounded-xl border border-[#232D35]/10">
            <svg className="mx-auto h-12 w-12 text-[#232D35]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-[#232D35]/80">No in-progress assessments</h3>
            <p className="mt-1 text-sm text-[#232D35]/60">Start a new assessment to begin your journey!</p>
          </div>
        )}
      </div>

      {/* Available Assessments */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-[#232D35] mb-4 pb-2 border-b border-[#1D63A1]/20 flex items-center">
          <svg className="w-5 h-5 mr-2 text-[#1D63A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Available Assessments
        </h2>

        {availableAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableAssessments.map((assessment) => (
              <motion.div
                key={assessment.assessmentId}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-[#1D63A1]/20"
              >
                <div className="p-5 border-b border-[#1D63A1]/20 bg-gradient-to-r from-[#1D63A1]/10 to-[#1D63A1]/5">
                  <h3 className="text-lg font-semibold text-[#232D35]">{assessment.title}</h3>
                  <p className="text-sm text-[#232D35]/70 mt-1">{assessment.description}</p>
                </div>

                <div className="p-5">
                  <button
                    onClick={() => handleStartAssessment(assessment.assessmentId)}
                    className="w-full bg-gradient-to-r from-[#1D63A1] to-[#232D35] hover:from-[#1D63A1]/90 hover:to-[#232D35]/90 text-white py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    Start Assessment
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#232D35]/5 rounded-xl border border-[#232D35]/10">
            <p className="text-sm text-[#232D35]/60">No assessments available at this time.</p>
          </div>
        )}
      </div>

      {/* Completed Assessments */}
      {completedAssessments.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[#232D35] mb-4 pb-2 border-b border-[#1D63A1]/20 flex items-center">
            <svg className="w-5 h-5 mr-2 text-[#1D63A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Completed Assessments
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedAssessments.map((assessment) => (
              <motion.div
                key={assessment.assessmentId}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-green-300"
              >
                <div className="p-5 border-b border-green-200 bg-gradient-to-r from-green-50 to-green-100/50">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-[#232D35]">{assessment.title}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Completed</span>
                  </div>
                  <p className="text-sm text-[#232D35]/70 mt-1">{assessment.description}</p>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-[#232D35]/80">Overall Score:</span>
                    <span className="text-sm font-bold text-green-600">85%</span>
                  </div>

                  <button
                    onClick={() => handleViewResults(assessment.assessmentId)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    View Results
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentDashboard;
