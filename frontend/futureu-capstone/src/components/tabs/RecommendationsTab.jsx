import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as recommendationService from '../../services/recommendationService';
import userAssessmentService from '../../services/userAssessmentService';
import '../../styles/animations.css'; // Import the animations CSS

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
          
          // Sort by confidence score (highest first) and take only top 5
          const sortedRecommendations = [...recommendations]
            .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
            .slice(0, 5);
          
          let overallScore = 0;
          if (recommendations.length > 0 && recommendations[0].assessmentResult) {
            overallScore = recommendations[0].assessmentResult.overallScore || 0;
          }
          
          const formattedData = {
            assessmentId: userAssessmentId,
            overallScore: overallScore,
            recommendations: {
              suggestedPrograms: sortedRecommendations.map(rec => ({
                name: rec.suggestedProgram,
                confidenceScore: rec.confidenceScore,
                description: rec.description
              }))
            }
          };
          
          setAiRecommendations(formattedData);
        } else {
          // Generate and save recommendations to database instead of just fetching
          await recommendationService.generateRecommendations(userAssessmentId);
          
          // After generating, fetch the newly created recommendations
          const newRecommendations = await recommendationService.fetchRecommendationsByResult(resultId);
          
          if (newRecommendations.data && newRecommendations.data.length > 0) {
            const recommendations = Array.isArray(newRecommendations.data) ? 
              newRecommendations.data : [newRecommendations.data];
            
            // Sort by confidence score (highest first) and take only top 5
            const sortedRecommendations = [...recommendations]
              .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
              .slice(0, 5);
            
            let overallScore = 0;
            if (recommendations.length > 0 && recommendations[0].assessmentResult) {
              overallScore = recommendations[0].assessmentResult.overallScore || 0;
            }
            
            const formattedData = {
              assessmentId: userAssessmentId,
              overallScore: overallScore,
              recommendations: {
                suggestedPrograms: sortedRecommendations.map(rec => ({
                  name: rec.suggestedProgram,
                  confidenceScore: rec.confidenceScore,
                  description: rec.description
                }))
              }
            };
            
            setAiRecommendations(formattedData);
          }
        }
        setError(null);
      } catch (err) {
        console.error('Error in primary recommendation flow:', err);
        try {
          // Also use generateRecommendations in the fallback path
          await recommendationService.generateRecommendations(userAssessmentId);
          
          // Get assessment data to access resultId
          const assessmentData = await userAssessmentService.getAssessmentResults(userAssessmentId);
          const resultId = assessmentData.assessmentResult?.resultId;
          
          if (resultId) {
            const newRecommendations = await recommendationService.fetchRecommendationsByResult(resultId);
            
            if (newRecommendations.data && newRecommendations.data.length > 0) {
              // Format and set the recommendations
              const recommendations = Array.isArray(newRecommendations.data) ? 
                newRecommendations.data : [newRecommendations.data];
              
              const formattedData = {
                assessmentId: userAssessmentId,
                overallScore: assessmentData.assessmentResult?.overallScore || 0,
                recommendations: {
                  suggestedPrograms: recommendations.map(rec => ({
                    name: rec.suggestedProgram,
                    confidenceScore: rec.confidenceScore,
                    description: rec.description
                  }))
                }
              };
              
              setAiRecommendations(formattedData);
              setError(null);
            }
          }
        } catch (fallbackErr) {
          console.error('Error in fallback recommendation flow:', fallbackErr);
          setError('Failed to generate recommendations. Please try again later.');
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
      className="space-y-8 bg-[#F8F9FA]rounded-xl"
    >
      {/* Header section */}
      <div className="bg-white rounded-xl shadow-md p-6 ">
        <h3 className="text-xl font-bold text-[#232D35] mb-3">Personalized Recommendations</h3>
        <p className="text-sm text-gray-600">
          Based on your assessment results, we've identified programs and academic paths that align with your skills, 
          interests, and strengths. Explore these recommendations to find the best fit for your future.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div>
            <img 
              src="/src/assets/characters/quirky.svg" 
              alt="Quirky mascot" 
              className="quirky-bounce h-32 mx-auto"
            />
          </div>
          <p className="text-sm text-gray-600 mb-3 mt-4">Loading your personalized recommendations...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-300 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-[#1D63A1] hover:text-[#FFB71B] hover:underline font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Program recommendations */}
      {aiRecommendations && aiRecommendations.recommendations && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-[#232D35] mb-2">Program Recommendations</h3>
          <p className="text-sm text-gray-600 mb-6">
            Based on your assessment profile with <span className="text-[#1D63A1] font-semibold">{aiRecommendations.overallScore?.toFixed(1)}%</span> overall score
          </p>
          <div className="space-y-6">
            {aiRecommendations.recommendations.suggestedPrograms
              ?.slice(0, 5)
              .map((program, index) => (
                <div key={index} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-lg p-5 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-[#232D35]">{program.name}</h4>
                    <span className="px-3 py-1 bg-[#FFB71B]/10 text-[#FFB71B] rounded-full text-sm font-bold">
                      {program.confidenceScore?.toFixed(1)}% Match
                    </span>
                  </div>
                  <p className="text-left text-sm text-gray-600 mb-4">{program.description}</p>
                  <div className="flex gap-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-[#1D63A1]/10 text-[#1D63A1] rounded">
                      Recommended
                    </span>
                    {index === 0 && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-[#FFB71B]/10 text-[#FFB71B] rounded">
                        Best Match
                      </span>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
          {aiRecommendations.recommendations.personalized && (
            <div className="mt-6 p-5 bg-[#1D63A1]/10 rounded-lg border border-[#1D63A1]/20">
              <h4 className="text-md font-semibold text-[#232D35] mb-2">Personalized Insight</h4>
              <p className="text-sm text-gray-700">{aiRecommendations.recommendations.personalized}</p>
            </div>
          )}
        </div>
      )}

      {/* Track recommendations */}
      <div className="bg-white rounded-xl shadow-md p-6 ">
        <h3 className="text-xl font-bold text-[#232D35] mb-2">Academic Track Recommendations</h3>
        <p className="text-sm text-gray-600 mb-6">
          Based on your assessment performance and interest profile
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {getTopRecommendations().map((rec, index) => (
            <div key={index} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-lg p-5 flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold text-[#232D35]">{rec.name}</h4>
                <span className="px-3 py-1 bg-[#FFB71B]/10 text-[#FFB71B] rounded-full text-sm font-bold">
                  {rec.score.toFixed(1)}%
                </span>
              </div>
              <p className="text-left text-sm text-gray-600 mb-3 flex-grow">{rec.description}</p>
              <span className="inline-block text-xs font-medium px-2 py-1 bg-[#1D63A1]/10 text-[#1D63A1] rounded self-start mt-2">
                {index === 0 ? 'Best Match' : index === 1 ? 'Strong Match' : 'Good Match'}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Next steps */}
      <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
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
          <div className="text-left space-y-5 flex-1 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-[#232D35] mb-2">Your Path Forward</h3>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1D63A1] text-white flex items-center justify-center">
                <span className="text-xs font-bold">1</span>
              </div>
              <div>
                <h4 className="text-md font-semibold text-[#232D35]">Explore Your Top Tracks</h4>
                <p className="text-sm text-gray-600">
                  Research the curriculums and career pathways for your recommended tracks.
                  <Link to="/academic-explorer" className="text-[#1D63A1] ml-1 hover:text-[#FFB71B] hover:underline font-semibold transition-colors">
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
      {/* Button to generate recommendations */}
      {!loading && !aiRecommendations && !error && (
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-[#1D63A1]/20 text-center">
          <h3 className="text-xl font-bold text-[#232D35] mb-2">Generate AI Recommendations</h3>
          <p className="text-sm text-gray-600 mb-6">
            Get detailed program and career recommendations tailored to your assessment results.
          </p>
          <button 
            onClick={handleGenerateRecommendations}
            className="px-6 py-3 bg-[#FFB71B] text-[#232D35] font-bold rounded-lg hover:bg-[#FFB71B]/90 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1]"
          >
            Generate Recommendations
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationsTab;
