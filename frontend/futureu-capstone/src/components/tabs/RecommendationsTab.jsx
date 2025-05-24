import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as recommendationService from '../../services/recommendationService';
import userAssessmentService from '../../services/userAssessmentService';
import programRecommendationService from '../../services/programRecommendationService';
import '../../styles/animations.css'; // Import the animations CSS

const RecommendationsTab = ({ getTopRecommendations, userAssessmentId }) => {
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkedExisting, setCheckedExisting] = useState(false);
  const [programRecommendations, setProgramRecommendations] = useState(null);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [programError, setProgramError] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const localKey = `futureu_recommendations_${userAssessmentId}`;
    const saved = localStorage.getItem(localKey);
    if (saved) {
      setAiRecommendations(JSON.parse(saved));
      setCheckedExisting(true);
      return;
    }
    // On mount, check if recommendations exist in the database
    const fetchExistingRecommendations = async () => {
      setLoading(true);
      try {
        const assessmentData = await userAssessmentService.getAssessmentResults(userAssessmentId);
        const resultId = assessmentData.assessmentResult?.resultId;
        if (!resultId) throw new Error('No assessment result found');
        const existingRecommendations = await recommendationService.fetchRecommendationsByResult(resultId);
        let recommendationsArr = [];
        if (existingRecommendations.data && (Array.isArray(existingRecommendations.data) ? existingRecommendations.data.length > 0 : true)) {
          recommendationsArr = Array.isArray(existingRecommendations.data) ? existingRecommendations.data : [existingRecommendations.data];
          // Sort and format
          const sortedRecommendations = [...recommendationsArr]
            .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
            .slice(0, 5);
          let overallScore = 0;
          if (recommendationsArr.length > 0 && recommendationsArr[0].assessmentResult) {
            overallScore = recommendationsArr[0].assessmentResult.overallScore || 0;
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
          localStorage.setItem(localKey, JSON.stringify(formattedData));
        }
      } catch (err) {
        // Do not set error here, just allow button to show
      } finally {
        setCheckedExisting(true);
        setLoading(false);
      }
    };
    fetchExistingRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAssessmentId]);

  // Fetch program recommendations when career recommendations are loaded
  useEffect(() => {
    if (!aiRecommendations || !aiRecommendations.assessmentId) return;
    const localKey = `futureu_program_recommendations_${userAssessmentId}`;
    const saved = localStorage.getItem(localKey);
    if (saved) {
      setProgramRecommendations(JSON.parse(saved));
      return;
    }
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const assessmentData = await userAssessmentService.getAssessmentResults(userAssessmentId);
        const resultId = assessmentData.assessmentResult?.resultId;
        if (!resultId) throw new Error('No assessment result found');
        const res = await programRecommendationService.fetchProgramRecommendationsByResult(resultId);
        let arr = Array.isArray(res.data) ? res.data : [res.data];
        // Map to flatten the nested program object for UI
        arr = arr
          .filter(p => p && p.program && p.program.programName)
          .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
          .slice(0, 5)
          .map(p => ({
            programName: p.program.programName,
            description: p.program.description,
            confidenceScore: p.confidenceScore,
            explanation: p.explanation
          }));
        setProgramRecommendations(arr);
        localStorage.setItem(localKey, JSON.stringify(arr));
        setProgramError(null);
      } catch (err) {
        setProgramError('Failed to load program recommendations.');
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiRecommendations, userAssessmentId]);

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    try {
      // Fetch assessment resultId
      const assessmentData = await userAssessmentService.getAssessmentResults(userAssessmentId);
      const resultId = assessmentData.assessmentResult?.resultId;
      if (!resultId) throw new Error('No assessment result found');
      // Try to fetch existing recommendations
      const existingRecommendations = await recommendationService.fetchRecommendationsByResult(resultId);
      let recommendationsArr = [];
      if (existingRecommendations.data && (Array.isArray(existingRecommendations.data) ? existingRecommendations.data.length > 0 : true)) {
        recommendationsArr = Array.isArray(existingRecommendations.data) ? existingRecommendations.data : [existingRecommendations.data];
      } else {
        // Generate and save recommendations if not found
        const generated = await recommendationService.generateRecommendations(userAssessmentId);
        recommendationsArr = Array.isArray(generated.data) ? generated.data : [generated.data];
      }
      // Sort and format
      const sortedRecommendations = [...recommendationsArr]
        .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
        .slice(0, 5);
      let overallScore = 0;
      if (recommendationsArr.length > 0 && recommendationsArr[0].assessmentResult) {
        overallScore = recommendationsArr[0].assessmentResult.overallScore || 0;
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
      localStorage.setItem(`futureu_recommendations_${userAssessmentId}`, JSON.stringify(formattedData));
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
        {/* Career recommendations - only show if recommendations exist */}
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
        {/* Program recommendations - only show if loaded and not loading */}
        {aiRecommendations && programRecommendations && !loadingPrograms && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-xl p-6 animate-card-pop mt-8">
            <h3 className="text-xl font-bold text-[#232D35] mb-2">Recommended College Programs</h3>
            <p className="text-sm text-gray-600 mb-6">
              These programs are matched to your top career recommendations and assessment profile.
            </p>
            <div className="space-y-6">
              {programRecommendations.map((program, idx) => (
                <motion.div key={idx} whileHover={{ scale: 1.01 }} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all animate-card-pop">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-[#232D35]">{program.programName}</h4>
                    <span className="px-3 py-1 bg-[#FFB71B]/10 text-[#FFB71B] rounded-full text-sm font-bold">
                      {program.confidenceScore?.toFixed(1)}% Match
                    </span>
                  </div>
                  <p className="text-left text-sm text-gray-600 mb-4">{program.description}</p>
                  <div className="flex gap-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-[#1D63A1]/10 text-[#1D63A1] rounded">
                      Recommended Program
                    </span>
                    {idx === 0 && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-[#FFB71B]/10 text-[#FFB71B] rounded">
                        Best Match
                      </span>
                    )}
                  </div>
                  {program.explanation && (
                    <div className="mt-3 p-3 bg-[#F8F9FA] rounded-xl shadow-inner">
                      <span className="block text-xs text-[#1D63A1] font-semibold mb-1">Why this program?</span>
                      <span className="block text-xs text-gray-700 text-left">{program.explanation}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {loadingPrograms && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-xl p-6 text-center border-2 border-[#FFB71B]/10 animate-card-pop mt-8">
            <p className="text-sm text-gray-600 mb-3 mt-4">Loading your recommended programs...</p>
          </motion.div>
        )}
        {programError && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-xl p-6 border-2 border-red-300 text-center animate-card-pop mt-8">
            <p className="text-sm text-red-600 mb-3">{programError}</p>
          </motion.div>
        )}
        {/* Academic Track Recommendations - only show if recommendations exist */}
        {aiRecommendations && (
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
        )}
        {/* Next steps - only show if recommendations exist */}
        {aiRecommendations && (
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
        )}
        {/* Button to generate recommendations - only show if not loading, not error, recommendations are not loaded, and checkedExisting is true */}
        {!loading && !aiRecommendations && !error && checkedExisting && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white rounded-3xl shadow-xl p-6 border-2 border-[#1D63A1]/20 text-center animate-card-pop">
            <h3 className="text-xl font-bold text-[#232D35] mb-2">See My Results</h3>
            <p className="text-sm text-gray-600 mb-6">
              Click below to generate and view your personalized career and academic recommendations.
            </p>
            <button 
              onClick={handleGenerateRecommendations}
              className="px-6 py-3 bg-gradient-to-r from-[#FFB71B] to-[#1D63A1] text-white font-bold rounded-xl hover:from-[#1D63A1] hover:to-[#232D35] transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] animate-bounce-short"
            >
              See My Results
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default RecommendationsTab;
