import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as recommendationService from '../../services/recommendationService';

const RecommendationsTab = ({ getTopRecommendations, userAssessmentId }) => {
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userAssessmentId) return;
      
      setLoading(true);
      try {
        const response = await recommendationService.fetchRecommendations(userAssessmentId);
        setAiRecommendations(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
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
      console.error('Error generating recommendations:', err);
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
      {/* AI-generated recommendations section */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D63A1]"></div>
          <span className="ml-2 text-[#1D63A1]">Loading recommendations...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {aiRecommendations && aiRecommendations.recommendations && (
        <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
          <h3 className="text-lg font-semibold text-[#232D35] mb-4">AI-Generated Recommendations</h3>
          
          {aiRecommendations.recommendations.suggestedPrograms && (
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-[#1D63A1]">Suggested Programs</h4>
              {aiRecommendations.recommendations.suggestedPrograms.map((program, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-[#1D63A1]/10 to-transparent rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xl font-bold text-[#232D35]">{program.name}</h4>
                    <span className="text-sm font-medium px-2 py-1 bg-[#1D63A1]/20 rounded-full text-[#1D63A1]">
                      {program.confidenceScore ? `${program.confidenceScore}% match` : 'Recommended'}
                    </span>
                  </div>
                  <p className="text-gray-600">{program.description}</p>
                </div>
              ))}
            </div>
          )}
          
          {aiRecommendations.recommendations.personalized && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
              <h4 className="font-medium text-[#1D63A1] mb-2">Personalized Insights</h4>
              <p className="text-gray-700">{aiRecommendations.recommendations.personalized}</p>
            </div>
          )}
        </div>
      )}

      {/* Track recommendations */}
      <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
        <h3 className="text-lg font-semibold text-[#232D35] mb-4">Your Top Recommended Tracks</h3>
        <div className="space-y-4">
          {getTopRecommendations().map((rec, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-[#1D63A1]/10 to-transparent rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-bold text-[#232D35]">#{index + 1}: {rec.name}</h4>
                <span className="text-lg font-bold text-[#1D63A1]">{rec.score.toFixed(1)}%</span>
              </div>
              <p className="text-gray-600">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Next steps section */}
      <div className="text-left bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
        <h3 className="text-center text-lg font-semibold text-[#232D35] mb-4">Next Steps</h3>
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1D63A1]/20 flex items-center justify-center">
              <span className="text-[#1D63A1] font-bold">1</span>
            </div>
            <div className="ml-4">
              <h4 className="text-md font-semibold text-[#232D35]">Explore Your Top Tracks</h4>
              <p className="text-sm text-gray-600 mt-1">
                Research the curriculums, required skills, and career pathways for your recommended tracks. 
                Check our Academic Explorer section for detailed information about each track.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1D63A1]/20 flex items-center justify-center">
              <span className="text-[#1D63A1] font-bold">2</span>
            </div>
            <div className="ml-4">
              <h4 className="text-md font-semibold text-[#232D35]">Connect with Advisors</h4>
              <p className="text-sm text-gray-600 mt-1">
                Schedule a meeting with your school guidance counselor to discuss your assessment results 
                and get personalized advice on your educational path.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1D63A1]/20 flex items-center justify-center">
              <span className="text-[#1D63A1] font-bold">3</span>
            </div>
            <div className="ml-4">
              <h4 className="text-md font-semibold text-[#232D35]">Strengthen Weak Areas</h4>
              <p className="text-sm text-gray-600 mt-1">
                Review the sections where you scored lower and consider ways to improve those skills. 
                This can help you be better prepared for your chosen academic track.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1D63A1]/20 flex items-center justify-center">
              <span className="text-[#1D63A1] font-bold">4</span>
            </div>
            <div className="ml-4">
              <h4 className="text-md font-semibold text-[#232D35]">Explore Career Pathways</h4>
              <p className="text-sm text-gray-600 mt-1">
                Visit our Career Pathways section to learn about the various careers associated with your 
                interests and academic strengths.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Button to generate recommendations if none exist */}
      {!loading && !aiRecommendations && !error && (
        <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20 text-center">
          <h3 className="font-medium text-[#232D35] mb-4">Get AI-Powered Recommendations</h3>
          <p className="text-gray-600 mb-4">Generate detailed program and career recommendations based on your assessment results.</p>
          <button 
            onClick={handleGenerateRecommendations}
            className="px-4 py-2 bg-[#1D63A1] text-white rounded-lg hover:bg-[#1D63A1]/90 transition-colors"
          >
            Generate Recommendations
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationsTab;
