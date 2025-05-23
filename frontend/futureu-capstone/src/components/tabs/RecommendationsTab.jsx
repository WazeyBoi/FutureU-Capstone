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
              careers: sortedRecommendations.map(rec => ({
                name: rec.careerPath?.careerTitle || 'Unknown Career',
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
                careers: sortedRecommendations.map(rec => ({
                  name: rec.careerPath?.careerTitle || 'Unknown Career',
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
                  careers: recommendations.map(rec => ({
                    name: rec.careerPath?.careerTitle || 'Unknown Career',
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
    <div className="relative">
      {/* Playful floating accent shapes background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#FFB71B]/30 to-[#1D63A1]/20 rounded-full blur-2xl animate-bounce-slow" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-tr from-[#1D63A1]/20 to-[#FFB71B]/30 rounded-full blur-2xl animate-bounce-slower" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-[#232D35]/10 to-[#1D63A1]/10 rounded-full blur-2xl animate-bounce-slowest" />
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 bg-[#F8F9FA] rounded-3xl relative z-10"
      >
        {/* Header section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-xl p-6 animate-card-pop">
          <h3 className="text-xl font-bold text-[#232D35] mb-3">Personalized Recommendations</h3>
          <p className="text-sm text-gray-600">
            Based on your assessment results, we've identified careers and academic paths that align with your skills, 
            interests, and strengths. Explore these recommendations to find the best fit for your future.
          </p>
        </motion.div>
        {/* Loading state */}
        {loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-xl p-6 text-center border-2 border-[#FFB71B]/10 animate-card-pop">
            <div>
              <img 
                src="/src/assets/characters/quirky.svg" 
                alt="Quirky mascot" 
                className="quirky-bounce h-32 mx-auto"
              />
            </div>
            <p className="text-sm text-gray-600 mb-3 mt-4">Loading your personalized recommendations...</p>
          </motion.div>
        )}
        {/* Error state */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-xl p-6 border-2 border-red-300 text-center animate-card-pop">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm text-[#1D63A1] hover:text-[#FFB71B] hover:underline font-semibold transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}
        {/* Career recommendations */}
        {aiRecommendations && aiRecommendations.recommendations && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-xl p-6 animate-card-pop">
            <h3 className="text-xl font-bold text-[#232D35] mb-2">Career Recommendations</h3>
            <p className="text-sm text-gray-600 mb-6">
              Based on your assessment profile with <span className="text-[#1D63A1] font-semibold">{aiRecommendations.overallScore?.toFixed(1)}%</span> overall score
            </p>
            <div className="space-y-6">
              {aiRecommendations.recommendations.careers
                ?.slice(0, 5)
                .map((career, index) => (
                  <motion.div key={index} whileHover={{ scale: 1.01 }} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all animate-card-pop">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-lg font-semibold text-[#232D35]">{career.name}</h4>
                      <span className="px-3 py-1 bg-[#FFB71B]/10 text-[#FFB71B] rounded-full text-sm font-bold">
                        {career.confidenceScore?.toFixed(1)}% Match
                      </span>
                    </div>
                    <p className="text-left text-sm text-gray-600 mb-4">{career.description}</p>
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
                  </motion.div>
                ))
              }
            </div>
            {aiRecommendations.recommendations.personalized && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-6 p-5 bg-[#1D63A1]/10 rounded-2xl border border-[#1D63A1]/20 animate-card-pop">
                <h4 className="text-md font-semibold text-[#232D35] mb-2">Personalized Insight</h4>
                <p className="text-sm text-gray-700">{aiRecommendations.recommendations.personalized}</p>
              </motion.div>
            )}
          </motion.div>
        )}
        {/* Track recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white rounded-3xl shadow-xl p-6 animate-card-pop">
          <h3 className="text-xl font-bold text-[#232D35] mb-2">Academic Track Recommendations</h3>
          <p className="text-sm text-gray-600 mb-6">
            Based on your assessment performance and interest profile
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {getTopRecommendations().map((rec, index) => (
              <motion.div key={index} whileHover={{ scale: 1.02 }} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-2xl p-5 flex flex-col h-full shadow-xl hover:shadow-2xl transition-all animate-card-pop">
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
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* Next steps */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white rounded-3xl shadow-xl p-6 overflow-hidden animate-card-pop">
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
        </motion.div>
        {/* Button to generate recommendations */}
        {!loading && !aiRecommendations && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white rounded-3xl shadow-xl p-6 border-2 border-[#1D63A1]/20 text-center animate-card-pop">
            <h3 className="text-xl font-bold text-[#232D35] mb-2">Generate AI Recommendations</h3>
            <p className="text-sm text-gray-600 mb-6">
              Get detailed career and academic recommendations tailored to your assessment results.
            </p>
            <button 
              onClick={handleGenerateRecommendations}
              className="px-6 py-3 bg-gradient-to-r from-[#FFB71B] to-[#1D63A1] text-white font-bold rounded-xl hover:from-[#1D63A1] hover:to-[#232D35] transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] animate-bounce-short"
            >
              Generate Recommendations
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default RecommendationsTab;
