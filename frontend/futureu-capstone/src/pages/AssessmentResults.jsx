import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import userAssessmentService from '../services/userAssessmentService';

const AssessmentResults = () => {
  const { userAssessmentId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // Fetch the assessment results using the userAssessmentId from params
        const resultsData = await userAssessmentService.getAssessmentResults(userAssessmentId);
        setResults(resultsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load assessment results. Please try again later.');
        setLoading(false);
        console.error('Error loading results:', err);
      }
    };
    
    fetchResults();
  }, [userAssessmentId]);
  
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md"
        >
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
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#232D35]/10 to-white min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#1D63A1] to-[#232D35] bg-clip-text text-transparent">
          Your Assessment Results
        </h1>
        <p className="mt-4 text-lg text-[#232D35]/70">
          Here's a detailed breakdown of your assessment performance
        </p>
      </div>
      
      {/* Basic results placeholder - expand this with actual result visualization */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-[#1D63A1]/20">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#232D35]">
            Assessment Result #{userAssessmentId}
          </h2>
          {results && (
            <p className="text-gray-600 mt-2">
              Completed on {new Date(results.userAssessment?.dateCompleted || new Date()).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {results ? (
          <div className="space-y-6">
            {/* Overall score */}
            <div className="bg-[#1D63A1]/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-[#1D63A1]">Overall Score</h3>
              <div className="text-4xl font-bold mt-2 text-[#232D35]">
                {results.assessmentResult?.overallScore?.toFixed(1)}%
              </div>
            </div>
            
            {/* Add sections for different categories here */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/assessment-dashboard')}
                className="bg-[#1D63A1] text-white px-6 py-2 rounded-lg hover:bg-[#1D63A1]/90 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No result data available
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentResults;
