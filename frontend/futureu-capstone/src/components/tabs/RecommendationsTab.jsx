import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as recommendationService from '../../services/recommendationService';
import userAssessmentService from '../../services/userAssessmentService';

const RecommendationsTab = ({ getTopRecommendations, userAssessmentId }) => {
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userAssessmentId) return;
      
      setLoading(true);
      try {
        // Get assessment result data using the service instead of direct fetch
        const assessmentData = await userAssessmentService.getAssessmentResults(userAssessmentId);
        
        // Extract the resultId from the assessmentResult in the response
        const resultId = assessmentData.assessmentResult?.resultId;
        
        if (!resultId) {
          throw new Error('No assessment result found');
        }
        
        console.log("Found assessment result ID:", resultId);
        
        // Now use the resultId to fetch recommendations
        const existingRecommendations = await recommendationService.fetchRecommendationsByResult(resultId);
        
        // Check if we received recommendations
        if (existingRecommendations.data && 
            (Array.isArray(existingRecommendations.data) ? existingRecommendations.data.length > 0 : true)) {
          
          console.log("Using existing recommendations from database");
          
          // Format the recommendations to match the expected structure
          const recommendations = Array.isArray(existingRecommendations.data) ? 
            existingRecommendations.data : [existingRecommendations.data];
          
          // Get assessment result data for score - might need to fetch separately if not included
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
          // If no recommendations exist, fetch comprehensive recommendations
          console.log("Fetching comprehensive recommendations");
          const response = await recommendationService.fetchRecommendations(userAssessmentId);
          setAiRecommendations(response.data);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        // Fallback to comprehensive recommendations
        try {
          console.log("Falling back to comprehensive recommendations");
          const response = await recommendationService.fetchRecommendations(userAssessmentId);
          setAiRecommendations(response.data);
          setError(null);
        } catch (fallbackErr) {
          console.error('Error with fallback recommendations:', fallbackErr);
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
      // Generate new recommendations
      await recommendationService.generateRecommendations(userAssessmentId);
      
      // Then fetch the comprehensive data
      const response = await recommendationService.fetchRecommendations(userAssessmentId);
      setAiRecommendations(response.data);
      setError(null);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Failed to generate recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to render the confidence score indicator
  const renderConfidenceIndicator = (score) => {
    if (!score) return null;
    
    let color = '';
    if (score >= 85) color = 'bg-green-500';
    else if (score >= 70) color = 'bg-blue-500';
    else if (score >= 55) color = 'bg-yellow-500';
    else color = 'bg-orange-500';
    
    return (
      <div className="flex items-center">
        <div className="w-full h-2 bg-gray-200 rounded-full mr-2">
          <div 
            className={`h-2 rounded-full ${color}`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium whitespace-nowrap">{score}%</span>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header section */}
      <div className="bg-gradient-to-r from-[#1D63A1]/10 to-white rounded-xl p-5 border border-[#1D63A1]/20 shadow-sm">
        <h2 className="text-xl font-bold text-[#232D35] mb-2">Your Personalized Recommendations</h2>
        <p className="text-gray-600">
          Based on your assessment results, we've identified programs and academic paths that align with your skills, 
          interests, and strengths. Explore these recommendations to find the best fit for your future.
        </p>
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-md border border-[#1D63A1]/20 p-8 flex flex-col items-center justify-center text-center"
          >
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1D63A1]/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-[#1D63A1] rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-[#1D63A1] mb-2">Analyzing Your Profile</h3>
            <p className="text-gray-600">
              Our AI is processing your assessment data to generate personalized recommendations...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-md"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Recommendations</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium flex items-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI-generated recommendations section */}
      <AnimatePresence>
        {aiRecommendations && aiRecommendations.recommendations && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-md border border-[#1D63A1]/20 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#1D63A1]/10 to-white p-5 border-b border-[#1D63A1]/20">
              <h3 className="text-lg font-semibold text-[#232D35]">Program Recommendations</h3>
              <p className="text-sm text-gray-600 mt-1">
                Tailored to your assessment profile with {aiRecommendations.overallScore?.toFixed(1)}% overall score
              </p>
            </div>
            
            <div className="p-5">
              {aiRecommendations.recommendations.suggestedPrograms && (
                <div className="space-y-5">
                  {aiRecommendations.recommendations.suggestedPrograms.map((program, index) => (
                    <div 
                      key={index} 
                      className={`p-5 rounded-lg transition-all duration-200 ${
                        selectedProgram === index 
                          ? 'bg-[#1D63A1]/10 border border-[#1D63A1]/30 shadow-md' 
                          : 'bg-white border border-gray-200 hover:border-[#1D63A1]/30 hover:shadow-sm cursor-pointer'
                      }`}
                      onClick={() => setSelectedProgram(selectedProgram === index ? null : index)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-xl font-bold text-[#232D35] flex items-center">
                            {index === 0 && (
                              <span className="inline-flex items-center justify-center mr-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Top Pick
                              </span>
                            )}
                            {program.name}
                          </h4>
                          <div className="flex gap-2 flex-wrap mt-2">
                            {program.tags && program.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tag}
                              </span>
                            ))}
                            {!program.tags && (
                              <>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Recommended
                                </span>
                                {program.name.toLowerCase().includes('stem') && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    STEM
                                  </span>
                                )}
                                {program.name.toLowerCase().includes('business') && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Business
                                  </span>
                                )}
                                {program.name.toLowerCase().includes('art') && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Creative
                                  </span>
                                )}
                                {index === 0 && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    Best Match
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="w-28">
                          <div className="text-right mb-1 text-xs text-gray-500">Match Score</div>
                          {renderConfidenceIndicator(program.confidenceScore)}
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {(selectedProgram === index || index === 0) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="text-left text-gray-700 my-3">{program.description}</p>
                            <div className="mt-4 flex flex-wrap gap-3">
                              <button className="inline-flex items-center px-3 py-1.5 border border-[#1D63A1] text-[#1D63A1] text-sm font-medium rounded-md hover:bg-[#1D63A1]/5 transition-colors">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Learn More
                              </button>
                              <button className="inline-flex items-center px-3 py-1.5 border border-[#1D63A1] bg-[#1D63A1] text-black text-sm font-medium rounded-md hover:bg-[#1D63A1]/90 transition-colors">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                                </svg>
                                Save Program
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
              
              {aiRecommendations.recommendations.personalized && (
                <div className="p-5 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200 mt-6">
                  <h4 className="flex items-center text-lg font-semibold text-[#1D63A1] mb-3">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Personalized Insights
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{aiRecommendations.recommendations.personalized}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track recommendations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-md border border-[#1D63A1]/20 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#1D63A1]/10 to-white p-5 border-b border-[#1D63A1]/20">
          <h3 className="text-lg font-semibold text-[#232D35]">Academic Track Recommendations</h3>
          <p className="text-sm text-gray-600 mt-1">
            Based on your assessment performance and interest profile
          </p>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {getTopRecommendations().map((rec, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
                className={`rounded-lg border ${index === 0 ? 'border-[#1D63A1] ring-2 ring-[#1D63A1]/20' : 'border-gray-200'} overflow-hidden`}
              >
                <div className={`h-2 ${
                  index === 0 ? 'bg-[#1D63A1]' : 
                  index === 1 ? 'bg-blue-500' : 'bg-blue-400'
                }`}></div>
                <div className="p-5 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-left text-lg font-bold text-[#232D35]">{rec.name}</h4>
                    <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                      rec.score >= 80 ? 'bg-green-100 text-green-800' : 
                      rec.score >= 60 ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rec.score.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-left text-gray-600 text-sm mb-4 line-clamp-4">{rec.description}</p>
                  <div className="mt-auto flex justify-between items-center pt-3">
                    <span className="text-xs font-medium text-gray-500">
                      {index === 0 ? 'Best Match' : index === 1 ? 'Strong Match' : 'Good Match'}
                    </span>
                    <button className="text-[#1D63A1] text-sm font-medium hover:text-[#1D63A1]/80 transition-colors">
                      Explore Track
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Next steps section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md border border-[#1D63A1]/20 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#1D63A1]/10 to-white p-5 border-b border-[#1D63A1]/20">
          <h3 className="text-lg font-semibold text-[#232D35]">Your Path Forward</h3>
          <p className="text-sm text-gray-600 mt-1">
            Recommended next steps to help you make informed decisions
          </p>
        </div>
        
        <div className="p-5">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#1D63A1]/20"></div>
            <div className="text-left space-y-8">
              <div className="relative flex items-start">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-[#1D63A1]/10 flex items-center justify-center z-10 border-4 border-white shadow">
                  <span className="text-[#1D63A1] font-bold text-lg">1</span>
                </div>
                <div className="ml-6 pt-3">
                  <h4 className="text-md font-semibold text-[#232D35]">Explore Your Top Tracks</h4>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    Research the curriculums, required skills, and career pathways for your recommended tracks. 
                    <a href="#" className="text-[#1D63A1] ml-1 hover:underline">
                      Check our Academic Explorer section
                    </a> for detailed information about each track.
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-[#1D63A1]/10 flex items-center justify-center z-10 border-4 border-white shadow">
                  <span className="text-[#1D63A1] font-bold text-lg">2</span>
                </div>
                <div className="ml-6 pt-3">
                  <h4 className="text-md font-semibold text-[#232D35]">Connect with Advisors</h4>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    Schedule a meeting with your school guidance counselor to discuss your assessment results 
                    and get personalized advice on your educational path.
                    <button className="ml-2 text-[#1D63A1] hover:underline">
                      Book an appointment
                    </button>
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-[#1D63A1]/10 flex items-center justify-center z-10 border-4 border-white shadow">
                  <span className="text-[#1D63A1] font-bold text-lg">3</span>
                </div>
                <div className="ml-6 pt-3">
                  <h4 className="text-md font-semibold text-[#232D35]">Strengthen Weak Areas</h4>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    Review the sections where you scored lower and consider ways to improve those skills. 
                    This can help you be better prepared for your chosen academic track.
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-[#1D63A1]/10 flex items-center justify-center z-10 border-4 border-white shadow">
                  <span className="text-[#1D63A1] font-bold text-lg">4</span>
                </div>
                <div className="ml-6 pt-3">
                  <h4 className="text-md font-semibold text-[#232D35]">Explore Career Pathways</h4>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    Visit our Career Pathways section to learn about the various careers associated with your 
                    interests and academic strengths.
                    <a href="#" className="text-[#1D63A1] ml-1 hover:underline">
                      Browse career options
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Button to generate recommendations if none exist */}
      {!loading && !aiRecommendations && !error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-8 border border-[#1D63A1]/20 text-center"
        >
          <div className="mx-auto w-20 h-20 bg-[#1D63A1]/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-[#1D63A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#232D35] mb-2">Personalized AI Recommendations</h3>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Get detailed program and career recommendations tailored specifically to your assessment results. 
            Our AI analyzes your strengths, preferences, and abilities to suggest the best paths forward.
          </p>
          <button 
            onClick={handleGenerateRecommendations}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1D63A1] to-[#1D63A1]/90 text-white text-base font-medium rounded-lg shadow hover:shadow-lg transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Personalized Recommendations
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RecommendationsTab;
