import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as recommendationService from '../../services/recommendationService';

const DreamCareerAnalysisTab = ({ userAssessmentId }) => {
  const [dreamInsight, setDreamInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDreamCareerRefreshing, setIsDreamCareerRefreshing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [dreamCareerError, setDreamCareerError] = useState(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Helper: extract up to `n` short action sentences from a long text block
  const extractActions = (text, n = 3) => {
    if (!text || typeof text !== 'string') return [];
    // Split on sentence boundaries and filter short fragments
    const parts = text
      .split(/(?<=[.!?])\s+/)
      .map(p => p.trim())
      .filter(p => p.length > 10);
    return parts.slice(0, n);
  };

  // Build an actionable alignment summary based on closenessScore and AI fields
  const buildAlignmentSummary = (insight) => {
    if (!insight) return null;
    const score = typeof insight.closenessScore === 'number' ? insight.closenessScore : null;
    const focusText = insight.personalizedFocusAreas || insight.strengthsAlignment || '';
    const misalignmentText = insight.misalignmentInsights || insight.guidance || '';
    const encouragement = insight.encouragement || '';

    const actionsFromFocus = extractActions(focusText);
    const actionsFromMis = extractActions(misalignmentText);

    if (score === null) {
      return {
        title: 'Alignment',
        message: focusText || misalignmentText || encouragement || 'No detailed alignment information is available.',
        actions: actionsFromFocus.length ? actionsFromFocus : (actionsFromMis.length ? actionsFromMis : [])
      };
    }

    if (score >= 80) {
      return {
        title: 'Strong alignment',
        message: 'Your assessment strongly supports this dream. Here are suggested next steps to pursue it with confidence.',
        actions: actionsFromFocus.length ? actionsFromFocus : ['Explore the recommended career path(s) in the Recommendations tab.', 'Discuss next steps with a counselor or mentor.']
      };
    }

    if (score >= 60) {
      return {
        title: 'Good alignment',
        message: 'Your profile aligns fairly well. Strengthening a few areas can make this an even better fit.',
        actions: actionsFromFocus.length ? actionsFromFocus : (actionsFromMis.length ? actionsFromMis : ['Review the suggested focus areas above.', 'Try short courses or projects to build relevant skills.'])
      };
    }

    if (score >= 40) {
      return {
        title: 'Partial alignment',
        message: 'You have some relevant strengths, but there are meaningful gaps to address before this becomes a top-fit.',
        actions: actionsFromMis.length ? actionsFromMis : (actionsFromFocus.length ? actionsFromFocus : ['Work on the priority gaps listed above.', 'Consider related career paths that leverage your strengths.'])
      };
    }

    // score < 40
    return {
      title: 'Low alignment',
      message: 'Your assessment suggests this dream is not currently well matched. That does not mean it’s impossible — it highlights where to focus growth.',
      actions: actionsFromMis.length ? actionsFromMis : (actionsFromFocus.length ? actionsFromFocus : [encouragement || 'Explore recommended alternatives while pursuing targeted development steps.'])
    };
  };

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

      // console.log('Fetching dream career insight...');
      const response = await recommendationService.fetchRecommendations(userAssessmentId);

      if (response?.data?.recommendations) {
        setDreamInsight(response.data.recommendations.dreamCareerInsight || null);
        // console.log('Dream career insight loaded successfully');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      // console.error('Error fetching dream career insight:', err);
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
      // console.log('Refreshing dream career analysis...');
      await fetchDreamCareerInsight({ forceRefresh: true });
      // console.log('Dream career analysis refreshed successfully');
    } catch (err) {
      // console.error('Dream career analysis refresh failed:', err);
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
      // console.log('Regenerating dream career analysis...');
      // Call a specific regenerate endpoint that forces new AI analysis
      const response = await recommendationService.regenerateDreamCareerAnalysis(userAssessmentId);
      
      if (response?.data?.dreamCareerInsight) {
        setDreamInsight(response.data.dreamCareerInsight);
        // console.log('Dream career analysis regenerated successfully');
        
        // Clear any existing error and show success feedback
        setDreamCareerError(null);
        
        // Optional: Show a brief success message
        const successMessage = 'Dream career analysis regenerated with fresh insights!';
        setDreamCareerError(null); // Make sure no error is shown
        
        // You could add a success toast here if you have a toast system
        // console.log(successMessage);
      } else {
        throw new Error('Failed to regenerate analysis');
      }
    } catch (err) {
      // console.error('Dream career analysis regeneration failed:', err);
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

  // Precompute the alignment summary for layout use
  const summary = buildAlignmentSummary(dreamInsight);

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
      className="space-y-8 bg-[#F8F9FA] rounded-3xl relative"
    >
      {/* Decorative playful background blobs (no icons) */}
      <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-gradient-to-bl from-[#1D63A1]/20 to-[#1D63A1]/10 rounded-full opacity-30 pointer-events-none transform rotate-6"></div>
      {/* Dream Career Analysis Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }} 
        className="rounded-3xl shadow-lg p-6 animate-card-pop relative overflow-hidden bg-white border border-[#FFB71B]/10"
      >
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-gradient-to-tr from-[#FFB71B]/30 to-[#FFB71B]/10 rounded-full opacity-40 pointer-events-none transform -rotate-12"></div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Header + Description + Alignment card below */}
          <div className="flex-1">
            <div className="text-left flex items-start justify-between mb-2 gap-4">
              <div>
                <h3 className="text-2xl font-extrabold text-[#232D35] leading-tight">Dream Career Alignment</h3>
                <p className="text-sm text-gray-500">A friendly breakdown of how your dream stacks against your assessment.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefreshDreamCareerAnalysis}
                  disabled={isDreamCareerRefreshing || isRegenerating}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                    isDreamCareerRefreshing || isRegenerating
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                      : 'text-[#1D63A1] bg-[#1D63A1]/10 hover:bg-[#1D63A1]/20'
                  }`}
                  title="Refresh AI analysis"
                >
                  {isDreamCareerRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={() => setShowRegenerateConfirm(true)}
                  disabled={isDreamCareerRefreshing || isRegenerating}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                    isDreamCareerRefreshing || isRegenerating
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                      : 'text-[#FFB71B] bg-[#FFB71B]/10 hover:bg-[#FFB71B]/20'
                  }`}
                  title="Generate new AI analysis with fresh insights"
                >
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>
            </div>

            <div className='w-200 max-w-full'>
              <p className="text-left mt-3 text-lg text-gray-700 mb-2">
                You said <span className="font-semibold text-[#1D63A1]">"{dreamInsight.dreamCareer}"</span>
              </p>
              <p className="text-left text-sm text-gray-600 mb-4">Our AI compares your subjective dream to the objective recommendations created from your assessment and gives clear focus areas to help you move forward.</p>
              {dreamCareerError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{dreamCareerError}</p>
                </div>
              )}
            </div>

            {/* Alignment card with action chips to its right (stack on small screens, row on lg+) */}
            <div className="text-left mt-10 flex flex-col lg:flex-row items-start lg:items-start gap-3">
              <div className="flex-1">
                <div className="p-6 bg-gradient-to-br from-[#FFFBF1] to-white rounded-3xl text-left border border-[#FFB71B]/20 transition-shadow w-full"
                     style={{ boxShadow: '0 12px 30px rgba(255,183,27,0.12)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-gray-800 mt-2">{summary.title}</p>
                    {typeof dreamInsight.closenessScore === 'number' && (
                      <p className="text-3xl font-extrabold text-[#FFB71B]">{dreamInsight.closenessScore.toFixed(1)}%</p>
                    )}
                  </div>
                  {summary && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 mb-3">{summary.message}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center justify-end w-auto">
                {summary && summary.actions && summary.actions.length > 0 && (
                  <div className="flex flex-row flex-nowrap gap-3 max-w-full overflow-x-auto">
                    {summary.actions.map((a, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 bg-white rounded-2xl border border-gray-100 w-56 flex-shrink-0 break-words whitespace-normal"
                        style={{ boxShadow: '0 8px 20px rgba(15,23,42,0.04)' }}
                      >
                        <p className="text-xs text-gray-800 leading-relaxed">{a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Separate container for Comprehensive AI Analysis Sections */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl animate-card-pop overflow-visible"
      >
          {/* Comprehensive AI Analysis Sections */}
          {(dreamInsight.fieldAlignment || dreamInsight.strengthsAlignment || dreamInsight.misalignmentInsights || dreamInsight.personalizedFocusAreas) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Field Alignment */}
              {dreamInsight.fieldAlignment && (
       <div className="p-6 bg-white rounded-2xl border-[#1D63A1] transition-transform transform hover:-translate-y-0.5"
         style={{ boxShadow: '0 10px 26px rgba(29,99,161,0.15)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block text-xl font-semibold text-[#1D63A1] rounded-full">Field Alignment</span>
                    <span className="text-xs text-gray-400">What this means</span>
                  </div>
                  <p className="text-left text-sm text-gray-700 leading-relaxed">{dreamInsight.fieldAlignment}</p>
                </div>
              )}

              {/* Strengths Alignment */}
              {dreamInsight.strengthsAlignment && (
       <div className="p-6 bg-white rounded-2xl border-green-400 transition-transform transform hover:-translate-y-0.5"
         style={{ boxShadow: '0 10px 26px rgba(22,163,74,0.15)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block text-xl font-semibold text-green-700 rounded-full">Strengths Alignment</span>
                    <span className="text-xs text-gray-400">How your skills help</span>
                  </div>
                  <p className="text-left text-sm text-gray-700 leading-relaxed">{dreamInsight.strengthsAlignment}</p>
                </div>
              )}

              {/* Misalignment Insights / Growth Opportunities */}
              {dreamInsight.misalignmentInsights && (
       <div className="p-6 bg-white rounded-2xl border-orange-400 transition-transform transform hover:-translate-y-0.5"
         style={{ boxShadow: '0 10px 26px rgba(249,115,22,0.15)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block text-xl font-semibold text-orange-700 rounded-full">Growth Opportunities</span>
                    <span className="text-xs text-gray-400">Steps to improve</span>
                  </div>
                  <p className="text-left text-sm text-gray-700 leading-relaxed">{dreamInsight.misalignmentInsights}</p>
                </div>
              )}

              {/* Personalized Focus Areas */}
              {dreamInsight.personalizedFocusAreas && (
       <div className="p-6 bg-white rounded-2xl border-purple-500 transition-transform transform hover:-translate-y-0.5"
         style={{ boxShadow: '0 10px 26px rgba(124,58,237,0.15)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block text-xl font-semibold text-purple-700 rounded-full">Focus Areas</span>
                    <span className="text-xs text-gray-400">Priority actions</span>
                  </div>
                  <p className="text-left text-sm text-gray-700 leading-relaxed">{dreamInsight.personalizedFocusAreas}</p>
                </div>
              )}
            </div>
          )}

          {/* Encouragement Section */}
          {dreamInsight.encouragement && (
            <div className="mt-7 p-6 bg-white rounded-2xl border-[#FFB71B] transition-transform transform hover:-translate-y-0.5"
                 style={{ boxShadow: '0 10px 26px rgba(255,183,27,0.15)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block text-xl font-semibold text-[#FFB71B] rounded-full">Personalized Encouragement</span>
                <span className="text-xs text-gray-400">You're making progress</span>
              </div>
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
         <div className="p-4 bg-white rounded-lg border-l-4 border-gray-300"
           style={{ boxShadow: '0 8px 20px rgba(16,24,40,0.04)' }}>
                    <h5 className="font-medium text-gray-800 mb-2">General Guidance</h5>
                    <p className="text-sm text-gray-700">{dreamInsight.guidance}</p>
                  </div>
                )}
                {dreamInsight.riasecGap && (
         <div className="p-4 bg-white rounded-lg border-l-4 border-blue-300"
           style={{ boxShadow: '0 8px 20px rgba(29,99,161,0.06)' }}>
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
         <div className="p-4 bg-white rounded-lg border-l-4 border-indigo-300"
           style={{ boxShadow: '0 8px 20px rgba(99,102,241,0.06)' }}>
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
      </motion.div>

      {/* Regenerating Loading Modal */}
      <AnimatePresence>
        {isRegenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-[70] flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md mx-auto p-8 flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#FFB71B] border-t-transparent rounded-full mb-6"
              />

              <h3 className="text-2xl font-bold mb-3 text-[#232D35]">
                Regenerating Analysis...
              </h3>

              <p className="text-gray-600 text-center mb-4">
                Creating a fresh analysis of your dream career alignment. This may take a few minutes.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full">
                <p className="text-xs text-amber-800 text-center">
                  ⏳ Please wait while we generate new insights for you.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regeneration Confirmation Dialog */}
      <AnimatePresence>
        {showRegenerateConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-[70] flex items-center justify-center pt-45"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
              className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto py-15 flex flex-col items-center px-8"
            >
              <motion.img
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                src="/src/assets/characters/raiseHand.svg"
                alt="Raise hand mascot"
                className="absolute -top-75 left-1/2 -translate-x-1/2 w-100 h-100 drop-shadow-xl z-50 pointer-events-none"
                style={{ zIndex: 60 }}
                draggable="false"
              />

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="text-2xl font-bold mb-3 text-[#232D35]"
              >
                Regenerate Dream Career Analysis?
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-gray-600 mb-2 text-center"
              >
                This will generate a completely new AI-driven analysis of your dream career alignment with fresh insights and perspectives.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 w-full"
              >
                <p className="text-xs text-amber-800 text-center">
                  ⚠️ This process may take a few minutes. The new analysis may provide different focus areas and recommendations.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex gap-3 justify-center w-full"
              >
                <button
                  onClick={() => setShowRegenerateConfirm(false)}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold shadow-md transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowRegenerateConfirm(false);
                    handleRegenerateDreamCareerAnalysis();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] text-white rounded-xl font-bold shadow-md transition-all"
                >
                  Yes, Regenerate
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DreamCareerAnalysisTab;