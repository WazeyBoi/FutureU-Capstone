import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import assessmentTakingService from '../services/assessmentTakingService';
import assessmentService from '../services/assessmentService';

const AssessmentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inProgressAssessments, setInProgressAssessments] = useState([]);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [availableAssessments, setAvailableAssessments] = useState([]);
  
  const navigate = useNavigate();
  
  // Mock user ID - In a real app, get this from authentication context
  const userId = 1;
  
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        
        // Fetch in-progress assessments
        const inProgressData = await assessmentTakingService.getInProgressAssessments(userId);
        setInProgressAssessments(inProgressData);
        
        // Fetch all assessments
        const allAssessments = await assessmentService.getAllAssessments();
        
        // Filter for completed assessments
        const completedData = allAssessments.filter(assessment => {
          // Check if user has completed this assessment
          // This would be better with a specific API endpoint
          return false; // Replace with actual logic
        });
        setCompletedAssessments(completedData);
        
        // Filter for available (not started) assessments
        const inProgressIds = inProgressData.map(a => a.assessment.assessmentId);
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1D63A1]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Assessment Dashboard</h1>
        <p className="mt-4 text-lg text-gray-500">Continue your educational journey or start something new</p>
      </div>
      
      {/* In Progress Assessments */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Continue Your Progress</h2>
        
        {inProgressAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressAssessments.map((assessment) => (
              <motion.div 
                key={assessment.userQuizAssessment}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-yellow-200"
              >
                <div className="p-4 border-b border-yellow-100 bg-yellow-50">
                  <h3 className="text-lg font-semibold text-gray-900">{assessment.assessment.title}</h3>
                  <p className="text-sm text-gray-500">{assessment.assessment.description}</p>
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs font-medium text-blue-600">{assessment.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${assessment.progressPercentage}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Last saved: {new Date(assessment.lastSavedTime).toLocaleString()}
                  </div>
                  
                  <button
                    onClick={() => handleContinueAssessment(assessment.assessment.assessmentId)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Continue Assessment
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No in-progress assessments</h3>
            <p className="mt-1 text-sm text-gray-500">Start a new assessment to begin your journey!</p>
          </div>
        )}
      </div>
      
      {/* Available Assessments */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Available Assessments</h2>
        
        {availableAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableAssessments.map((assessment) => (
              <motion.div 
                key={assessment.assessmentId}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-blue-100"
              >
                <div className="p-4 border-b border-blue-50 bg-blue-50">
                  <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
                  <p className="text-sm text-gray-500">{assessment.description}</p>
                </div>
                
                <div className="p-4">
                  <button
                    onClick={() => handleStartAssessment(assessment.assessmentId)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Start Assessment
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">No assessments available at this time.</p>
          </div>
        )}
      </div>
      
      {/* Completed Assessments */}
      {completedAssessments.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Completed Assessments</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedAssessments.map((assessment) => (
              <motion.div 
                key={assessment.assessmentId}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-green-200"
              >
                <div className="p-4 border-b border-green-100 bg-green-50">
                  <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
                  <p className="text-sm text-gray-500">{assessment.description}</p>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Score:</span>
                    <span className="text-sm font-bold text-green-600">85%</span>
                  </div>
                  
                  <button
                    onClick={() => handleViewResults(assessment.assessmentId)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
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
