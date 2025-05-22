import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as recommendationService from '../../services/recommendationService';
import userAssessmentService from '../../services/userAssessmentService';

const RecommendationsTab = ({ getTopRecommendations, userAssessmentId }) => {
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userAssessmentId) return;
      
      setLoading(true);
      try {
        const assessmentData = await userAssessmentService.getAssessmentResults(userAssessmentId);
        const resultId = assessmentData.assessmentResult?.resultId;
        
        if (!resultId) {
          throw new Error('No assessment result found');
        }
        
        const existingRecommendations = await recommendationService.fetchRecommendationsByResult(resultId);
        
        if (existingRecommendations.data && 
            (Array.isArray(existingRecommendations.data) ? existingRecommendations.data.length > 0 : true)) {
          const recommendations = Array.isArray(existingRecommendations.data) ? 
            existingRecommendations.data : [existingRecommendations.data];
          
          let overallScore = 0;
          if (recommendations.length > 0 && recommendations[0].assessmentResult) {
            overallScore = recommendations[0].assessmentResult.overallScore || 0;
          }
          
          const formattedData = {
            assessmentId: userAssessmentId,
            overallScore: overallScore,
            recommendations: {
              suggestedPrograms: recommendations.map(rec => ({
                name: rec.suggestedProgram,
                confidenceScore: rec.confidenceScore,
                description: rec.description
              }))
            }
          };
          
          setAiRecommendations(formattedData);
        } else {
          const response = await recommendationService.fetchRecommendations(userAssessmentId);
          setAiRecommendations(response.data);
        }
        setError(null);
      } catch (err) {
        try {
          const response = await recommendationService.fetchRecommendations(userAssessmentId);
          setAiRecommendations(response.data);
          setError(null);
        } catch (fallbackErr) {
          setError('Failed to load recommendations. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userAssessmentId]);

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    try {
      await recommendationService.generateRecommendations(userAssessmentId);
      const response = await recommendationService.fetchRecommendations(userAssessmentId);
      setAiRecommendations(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to generate recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header section - simplified */}
      <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
        <h3 className="text-lg font-semibold text-[#232D35] mb-2">Personalized Recommendations</h3>
        <p className="text-sm text-gray-600">
          Based on your assessment results, we've identified programs and academic paths that align with your skills, 
          interests, and strengths. Explore these recommendations to find the best fit for your future.
        </p>
      </div>

      {/* Loading state - simplified */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1D63A1] border-r-transparent mb-4"></div>
          <p className="text-sm text-gray-600">Loading your personalized recommendations...</p>
        </div>
      )}

      {/* Error state - simplified */}
      {error && (
        <div className="bg-white rounded-xl shadow-md p-5 border border-red-200 text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-[#1D63A1] hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Program recommendations - simplified */}
      {aiRecommendations && aiRecommendations.recommendations && (
        <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
          <h3 className="text-lg font-semibold text-[#232D35] mb-4">Program Recommendations</h3>
          <p className="text-sm text-gray-600 mb-4">
            Based on your assessment profile with {aiRecommendations.overallScore?.toFixed(1)}% overall score
          </p>
          
          <div className="space-y-4">
            {aiRecommendations.recommendations.suggestedPrograms?.map((program, index) => (
              <div key={index} className="bg-[#1D63A1]/5 rounded-lg p-4 border border-[#1D63A1]/20">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-semibold text-[#232D35]">{program.name}</h4>
                  <span className="text-sm font-semibold text-[#1D63A1]">
                    {program.confidenceScore?.toFixed(1)}% Match
                  </span>
                </div>
                <p className="text-left text-sm text-gray-600 mb-3">{program.description}</p>
                <div className="flex gap-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    Recommended
                  </span>
                  {index === 0 && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                      Best Match
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {aiRecommendations.recommendations.personalized && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-md font-semibold text-[#232D35] mb-2">Personalized Insight</h4>
              <p className="text-sm text-gray-700">{aiRecommendations.recommendations.personalized}</p>
            </div>
          )}
        </div>
      )}

      {/* Track recommendations - simplified */}
      <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
        <h3 className="text-lg font-semibold text-[#232D35] mb-4">Academic Track Recommendations</h3>
        <p className="text-sm text-gray-600 mb-4">
          Based on your assessment performance and interest profile
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getTopRecommendations().map((rec, index) => (
            <div key={index} className="bg-[#1D63A1]/5 rounded-lg p-4 border border-[#1D63A1]/20 flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold text-[#232D35]">{rec.name}</h4>
                <span className="text-sm font-semibold text-[#1D63A1]">
                  {rec.score.toFixed(1)}%
                </span>
              </div>
              <p className="text-left text-sm text-gray-600 mb-2">{rec.description}</p>
              <span className="inline-block text-xs text-gray-500 mt-auto pt-2">
                {index === 0 ? 'Best Match' : index === 1 ? 'Strong Match' : 'Good Match'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Next steps - simplified */}
      <div className="bg-white borderrounded-xl shadow-md p-5 border border-[#1D63A1]/20">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image on the left side */}
          <div className="flex items-center justify-center md:w-1/4">
            <img 
              src="/src/assets/characters/excited.svg" 
              alt="Excited student" 
              className="h-40 md:h-48 lg:h-56 object-contain"
            />
          </div>
          
          {/* Content on the right side */}
          <div className="text-left space-y-4 flex-1 flex flex-col justify-center">
            <h3 className="text-center text-lg font-semibold text-[#232D35] mb-4">Your Path Forward</h3>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1D63A1] text-white flex items-center justify-center">
                <span className="text-xs font-bold">1</span>
              </div>
              <div>
                <h4 className="text-md font-semibold text-[#232D35]">Explore Your Top Tracks</h4>
                <p className="text-sm text-gray-600">
                  Research the curriculums and career pathways for your recommended tracks. <br/>
                  <Link to="/academic-explorer" className="text-[#1D63A1] ml-1 hover:underline">
                    Check Academic Explorer
                  </Link> for more information.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1D63A1] text-white flex items-center justify-center">
                <span className="text-xs font-bold">2</span>
              </div>
              <div>
                <h4 className="text-md font-semibold text-[#232D35]">Connect with Advisors</h4>
                <p className="text-sm text-gray-600">
                  Schedule a meeting with your school guidance counselor to discuss your assessment results.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1D63A1] text-white flex items-center justify-center">
                <span className="text-xs font-bold">3</span>
              </div>
              <div>
                <h4 className="text-md font-semibold text-[#232D35]">Strengthen Weak Areas</h4>
                <p className="text-sm text-gray-600">
                  Review sections where you scored lower and consider ways to improve those skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button to generate recommendations - simplified */}
      {!loading && !aiRecommendations && !error && (
        <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20 text-center">
          <h3 className="text-lg font-semibold text-[#232D35] mb-2">Generate AI Recommendations</h3>
          <p className="text-sm text-gray-600 mb-4">
            Get detailed program and career recommendations tailored to your assessment results.
          </p>
          <button 
            onClick={handleGenerateRecommendations}
            className="px-4 py-2 bg-[#1D63A1] text-white text-sm font-medium rounded hover:bg-[#1D63A1]/90"
          >
            Generate Recommendations
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationsTab;
