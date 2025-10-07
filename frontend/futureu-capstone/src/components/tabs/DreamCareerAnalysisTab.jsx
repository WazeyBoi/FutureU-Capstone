import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as recommendationService from '../../services/recommendationService';

const DreamCareerAnalysisTab = ({ userAssessmentId }) => {
  const [dreamInsight, setDreamInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDreamCareerRefreshing, setIsDreamCareerRefreshing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [dreamCareerError, setDreamCareerError] = useState(null);

  // Fetch comprehensive recommendations to get dream career insight
  const fetchDreamCareerInsight = useCallback(async (options = {}) => {
    if (!userAssessmentId) {
      setError('No assessment ID provided');
      setLoading(false);
      return;
    }

    try {
      if (!options.forceRefresh) {
        setLoading(true);
      }
      setError(null);

      console.log('Fetching dream career insight...');
      const response = await recommendationService.fetchRecommendations(userAssessmentId);

      if (response?.data?.recommendations) {
        setDreamInsight(response.data.recommendations.dreamCareerInsight || null);
        console.log('Dream career insight loaded successfully');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching dream career insight:', err);
      let errorMessage = 'Failed to load dream career analysis. Please try again.';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'The analysis is taking longer than expected. Please wait a moment and try again.';
      } else {
        const backendMessage = err?.response?.data?.error || err?.response?.data?.message;
        errorMessage = backendMessage || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userAssessmentId]);

  // Separate refresh function for dream career analysis
  const handleRefreshDreamCareerAnalysis = useCallback(async () => {
    setIsDreamCareerRefreshing(true);
    setDreamCareerError(null);
    try {
      console.log('Refreshing dream career analysis...');
      await fetchDreamCareerInsight({ forceRefresh: true });
      console.log('Dream career analysis refreshed successfully');
    } catch (err) {
      console.error('Dream career analysis refresh failed:', err);
      let errorMessage = 'Failed to refresh dream career analysis. Please try again.';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'The analysis is taking longer than expected. Please wait a moment and try again.';
      } else {
        const backendMessage = err?.response?.data?.error || err?.response?.data?.message;
        errorMessage = backendMessage || errorMessage;
      }
      
      setDreamCareerError(errorMessage);
    } finally {
      setIsDreamCareerRefreshing(false);
    }
  }, [fetchDreamCareerInsight]);

  // Regenerate dream career analysis specifically
  const handleRegenerateDreamCareerAnalysis = useCallback(async () => {
    if (!userAssessmentId || isRegenerating) return;

    setIsRegenerating(true);
    setDreamCareerError(null);

    try {
      console.log('Regenerating dream career analysis...');
      // Call a specific regenerate endpoint that forces new AI analysis
      const response = await recommendationService.regenerateDreamCareerAnalysis(userAssessmentId);
      
      if (response?.data?.dreamCareerInsight) {
        setDreamInsight(response.data.dreamCareerInsight);
        console.log('Dream career analysis regenerated successfully');
        
        // Clear any existing error and show success feedback
        setDreamCareerError(null);
        
        // Optional: Show a brief success message
        const successMessage = 'Dream career analysis regenerated with fresh insights!';
        setDreamCareerError(null); // Make sure no error is shown
        
        // You could add a success toast here if you have a toast system
        console.log(successMessage);
      } else {
        throw new Error('Failed to regenerate analysis');
      }
    } catch (err) {
      console.error('Dream career analysis regeneration failed:', err);
      let errorMessage = 'Failed to regenerate dream career analysis. Please try again.';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'The regeneration is taking longer than expected. Please wait a moment and try again.';
      } else {
        const backendMessage = err?.response?.data?.error || err?.response?.data?.message;
        errorMessage = backendMessage || errorMessage;
      }
      
      setDreamCareerError(errorMessage);
    } finally {
      setIsRegenerating(false);
    }
  }, [userAssessmentId, isRegenerating]);

  useEffect(() => {
    fetchDreamCareerInsight();
  }, [fetchDreamCareerInsight]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="bg-white rounded-3xl shadow-xl p-8 text-center border-2 border-[#FFB71B]/10 animate-card-pop"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FFB71B]"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#232D35]">Analyzing Your Dream Career</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Our AI is conducting a comprehensive analysis of your dream career alignment with your assessment results.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="bg-white rounded-3xl shadow-xl p-8 text-center border-2 border-red-200 animate-card-pop"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-red-600">Analysis Unavailable</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={() => fetchDreamCareerInsight()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (!dreamInsight || !dreamInsight.dreamCareer) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="bg-white rounded-3xl shadow-xl p-8 text-center border-2 border-[#1D63A1]/10 animate-card-pop"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-[#1D63A1]/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#1D63A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#232D35]">Set Your Dream Career</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Visit your profile to set a dream career and unlock personalized AI-driven alignment analysis.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/profile'}
            className="px-6 py-2 bg-[#1D63A1] text-white rounded-lg hover:bg-[#1D63A1]/90 transition-colors"
          >
            Update Profile
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }} 
      className="space-y-8 bg-[#F8F9FA] rounded-3xl relative z-10"
    >
      {/* Dream Career Analysis Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }} 
        className="bg-white rounded-3xl shadow-xl p-6 animate-card-pop"
      >
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-[#232D35]">Dream Career Alignment Analysis</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefreshDreamCareerAnalysis}
                    disabled={isDreamCareerRefreshing || isRegenerating}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isDreamCareerRefreshing || isRegenerating
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-[#1D63A1] bg-[#1D63A1]/10 hover:bg-[#1D63A1]/20'
                    }`}
                    title="Refresh AI analysis"
                  >
                    {isDreamCareerRefreshing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-gray-400"></div>
                        <span>Refreshing...</span>
                      </div>
                    ) : (
                      'Refresh Analysis'
                    )}
                  </button>
                  <button
                    onClick={handleRegenerateDreamCareerAnalysis}
                    disabled={isDreamCareerRefreshing || isRegenerating}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isDreamCareerRefreshing || isRegenerating
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-[#FFB71B] bg-[#FFB71B]/10 hover:bg-[#FFB71B]/20'
                    }`}
                    title="Generate new AI analysis with fresh insights"
                  >
                    {isRegenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-[#FFB71B]"></div>
                        <span>Regenerating...</span>
                      </div>
                    ) : (
                      'Regenerate Analysis'
                    )}
                  </button>
                </div>
              </div>
              <p className="text-left text-lg text-gray-700 mb-4">
                Your said <span className="font-bold text-[#1D63A1]">"{dreamInsight.dreamCareer}"</span>.
              </p>
              <p className="text-left text-sm text-gray-600">
                Our AI analyzes how your dream career aligns with the personalized career recommendations generated 
                specifically for you. This comparison reveals whether your subjective career aspirations match the 
                objective career paths our AI has identified based on your assessment profile.
              </p>
              {dreamCareerError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{dreamCareerError}</p>
                </div>
              )}
            </div>
            <div className="md:w-64 flex-shrink-0">
              {typeof dreamInsight.closenessScore === 'number' && (
                <div className="p-6 bg-gradient-to-br from-[#FFB71B]/10 to-[#FFB71B]/20 rounded-2xl text-center border border-[#FFB71B]/30">
                  <p className="text-sm uppercase tracking-wide text-gray-600 mb-2">Alignment Score</p>
                  <p className="text-4xl font-bold text-[#FFB71B] mb-2">{dreamInsight.closenessScore.toFixed(1)}%</p>
                  <p className="text-xs text-gray-600">
                    {dreamInsight.closenessScore >= 80 ? 'Excellent Match' :
                     dreamInsight.closenessScore >= 60 ? 'Good Match' :
                     dreamInsight.closenessScore >= 40 ? 'Fair Match' : 'Needs Development'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Comprehensive AI Analysis Sections */}
          {(dreamInsight.fieldAlignment || dreamInsight.strengthsAlignment || dreamInsight.misalignmentInsights || dreamInsight.personalizedFocusAreas) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Field Alignment */}
              {dreamInsight.fieldAlignment && (
                <div className="p-6 bg-gradient-to-br from-[#1D63A1]/5 to-[#1D63A1]/10 rounded-2xl border border-[#1D63A1]/20">
                  <h4 className="text-xl font-semibold text-[#1D63A1] mb-4 flex items-center">
                    <span className="w-3 h-3 bg-[#1D63A1] rounded-full mr-3"></span>
                    Field Alignment
                  </h4>
                  <p className="text-left text-sm text-gray-700 leading-relaxed">{dreamInsight.fieldAlignment}</p>
                </div>
              )}

              {/* Strengths Alignment */}
              {dreamInsight.strengthsAlignment && (
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                  <h4 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    Strengths Alignment
                  </h4>
                  <p className="text-left text-sm text-gray-700 leading-relaxed">{dreamInsight.strengthsAlignment}</p>
                </div>
              )}

              {/* Misalignment Insights */}
              {dreamInsight.misalignmentInsights && (
                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                  <h4 className="text-xl font-semibold text-orange-700 mb-4 flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                    Growth Opportunities
                  </h4>
                  <p className="text-left text-sm text-gray-700 leading-relaxed">{dreamInsight.misalignmentInsights}</p>
                </div>
              )}

              {/* Personalized Focus Areas */}
              {dreamInsight.personalizedFocusAreas && (
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                  <h4 className="text-xl font-semibold text-purple-700 mb-4 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                    Focus Areas
                  </h4>
                  <p className="text-left text-sm text-gray-700 leading-relaxed">{dreamInsight.personalizedFocusAreas}</p>
                </div>
              )}
            </div>
          )}

          {/* Encouragement Section */}
          {dreamInsight.encouragement && (
            <div className="p-6 bg-gradient-to-br from-[#FFB71B]/5 to-[#FFB71B]/10 rounded-2xl border border-[#FFB71B]/20">
              <h4 className="text-xl font-semibold text-[#FFB71B] mb-4 flex items-center">
                <span className="w-3 h-3 bg-[#FFB71B] rounded-full mr-3"></span>
                Personalized Encouragement
              </h4>
              <p className="text-left text-sm text-gray-700 leading-relaxed">{dreamInsight.encouragement}</p>
            </div>
          )}

          {/* Legacy Content for Backward Compatibility */}
          {(dreamInsight.guidance || dreamInsight.riasecGap || dreamInsight.aptitudeGap) && 
           !dreamInsight.personalizedFocusAreas && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Additional Insights</h4>
              <div className="space-y-4">
                {dreamInsight.guidance && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-2">General Guidance</h5>
                    <p className="text-sm text-gray-700">{dreamInsight.guidance}</p>
                  </div>
                )}
                {dreamInsight.riasecGap && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Interest Profile Gap</h5>
                    <div className="text-sm text-gray-700">
                      {typeof dreamInsight.riasecGap === 'string' ? (
                        <p>{dreamInsight.riasecGap}</p>
                      ) : typeof dreamInsight.riasecGap === 'object' ? (
                        <div>
                          <p className="mb-2">RIASEC Score Differences:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(dreamInsight.riasecGap).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="font-medium">{key}:</span>
                                <span>{typeof value === 'number' ? value.toFixed(1) : value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p>{String(dreamInsight.riasecGap)}</p>
                      )}
                    </div>
                  </div>
                )}
                {dreamInsight.aptitudeGap && (
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h5 className="font-medium text-indigo-800 mb-2">Aptitude Gap</h5>
                    <div className="text-sm text-gray-700">
                      {typeof dreamInsight.aptitudeGap === 'string' ? (
                        <p>{dreamInsight.aptitudeGap}</p>
                      ) : typeof dreamInsight.aptitudeGap === 'object' ? (
                        <div>
                          <p className="mb-2">Aptitude Score Differences:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(dreamInsight.aptitudeGap).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="font-medium">{key}:</span>
                                <span>{typeof value === 'number' ? value.toFixed(1) : value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p>{String(dreamInsight.aptitudeGap)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DreamCareerAnalysisTab;