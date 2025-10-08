import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as recommendationService from '../../services/recommendationService';
import { MapPin, Globe, ChevronDown, ChevronUp, School } from 'lucide-react';
import '../../styles/animations.css'; // Import the animations CSS

// Import school logos and images for parity with AcademicExplorer
import cdu_school_logo from '../../assets/school_logos/cdu_school_logo.png';
import citu_school_logo from '../../assets/school_logos/citu_school_logo.png';
import cnu_school_logo from '../../assets/school_logos/cnu_school_logo.png';
import ctu_school_logo from '../../assets/school_logos/ctu_school_logo.png';
import iau_school_logo from '../../assets/school_logos/iau_school_logo.png';
import swu_school_logo from '../../assets/school_logos/swu_school_logo.png';
import uc_school_logo from '../../assets/school_logos/uc_school_logo.png';
import usc_school_logo from '../../assets/school_logos/usc_school_logo.png';
import usjr_school_logo from '../../assets/school_logos/usjr_school_logo.png';
import up_school_logo from '../../assets/school_logos/up_school_logo.png';
import uv_school_logo from '../../assets/school_logos/uv_school_logo.png';

import citu_school_image from '../../assets/school_images/citu_school_image.jpg';
import cdu_school_image from '../../assets/school_images/cdu_school_image.jpg';
import cnu_school_image from '../../assets/school_images/cnu_school_image.jpg';
import ctu_school_image from '../../assets/school_images/ctu_school_image.jpg';
import swu_school_image from '../../assets/school_images/swu_school_image.jpg';
import usc_school_image from '../../assets/school_images/usc_school_image.jpg';
import usjr_school_image from '../../assets/school_images/usjr_school_image.jpg';
import up_school_image from '../../assets/school_images/up_school_image.jpg';
import uc_school_image from '../../assets/school_images/uc_school_image.jpg';
import uv_school_image from '../../assets/school_images/uv_school_image.jpg';
import iau_school_image from '../../assets/school_images/iau_school_image.jpg';

// School logo and background mappings (copied from AcademicExplorer)
const schoolLogos = {
  1: cdu_school_logo,
  2: citu_school_logo,
  3: cnu_school_logo,
  4: ctu_school_logo,
  5: iau_school_logo,
  6: swu_school_logo,
  7: uc_school_logo,
  8: usc_school_logo,
  9: usjr_school_logo,
  10: up_school_logo,
  11: uv_school_logo,
};
const schoolBackgroundMap = {
  "Cebu Institute of Technology": citu_school_image,
  "Cebu Doctors' University": cdu_school_image,
  "Cebu Normal University": cnu_school_image,
  "Cebu Technological University": ctu_school_image,
  "Southwestern University": swu_school_image,
  "University of San Carlos": usc_school_image,
  "University of San Jose-Recoletos": usjr_school_image,
  "University of the Philippines Cebu": up_school_image,
  "University of Cebu": uc_school_image,
  "University of the Visayas": uv_school_image,
  "Indiana Aerospace University": iau_school_image,
};
function getSchoolBackground(schoolName) {
  if (!schoolName) return null;
  const normalizedName = schoolName.toLowerCase();
  for (const [key, background] of Object.entries(schoolBackgroundMap)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return background;
    }
  }
  return null;
}

const AccordionContent = ({ expanded, children }) => {
  const ref = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (expanded && ref.current) {
      setMaxHeight(ref.current.scrollHeight);
    } else {
      setMaxHeight(0);
    }
  }, [expanded, children]);

  return (
    <div
      className="overflow-hidden transition-all duration-500"
      style={{ maxHeight: expanded ? maxHeight : 0 }}
      aria-hidden={!expanded}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
};

const RecommendationsTab = ({ getTopRecommendations, userAssessmentId }) => {
  const [recommendationPacket, setRecommendationPacket] = useState(null);
  const [structuredRecommendations, setStructuredRecommendations] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [careerPathDetails, setCareerPathDetails] = useState([]);
  const [careerPathDescriptions, setCareerPathDescriptions] = useState({}); // Store descriptions by pathId
  const [pathTabs, setPathTabs] = useState({}); // { [pathId]: 'careers' | 'programs' | 'description' }
  const [expandedPathPrograms, setExpandedPathPrograms] = useState({}); // { [pathId]: programId }
  const [loading, setLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [checkedExisting, setCheckedExisting] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0, width: 0, arrowX: 0 });
  const tooltipRef = useRef(null);

  const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const processStructuredResponse = useCallback((payload) => {
    if (!payload || !payload.recommendations) {
      setStructuredRecommendations(null);
      setAiRecommendations(null);
      setCareerPathDetails([]);
      setPathTabs({});
      setExpandedPathPrograms({});
      return;
    }

    const advanced = payload.recommendations;
    setStructuredRecommendations(advanced);

    const paths = Array.isArray(advanced.careerPaths) ? advanced.careerPaths : [];
    setCareerPathDetails(paths);
    setPathTabs((prev) => {
      if (paths.length === 0) return {};
      const updated = { ...prev };
      paths.forEach((path, idx) => {
        const key = path?.careerPathId ?? idx;
        if (!updated[key]) {
          updated[key] = 'careers';
        }
      });
      return updated;
    });
    setExpandedPathPrograms({});

    const allCareers = [];

    paths.forEach((path) => {
      const pathName = path?.careerPathName || 'Career Path';
      if (Array.isArray(path?.careers)) {
        path.careers.forEach((career) => {
          allCareers.push({
            ...career,
            pathName,
          });
        });
      }
    });

    allCareers.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    const topCareerDetails = allCareers.slice(0, 5).map((careerDetail) => {
      const summary = careerDetail.summary || 'This career aligns with your strengths.';
      const pathSuffix = careerDetail.pathName ? ` | Pathway: ${careerDetail.pathName}` : '';
      return {
        name: careerDetail.careerTitle || 'Career Recommendation',
        confidenceScore: careerDetail.matchPercentage,
        description: `${summary}${pathSuffix}`,
      };
    });

    setAiRecommendations({
      assessmentId: payload.assessmentId,
      overallScore: payload.overallScore,
      recommendations: {
        careers: topCareerDetails,
      },
    });

  }, []);

  const fetchComprehensiveRecommendations = useCallback(async (options = {}) => {
    const storageKey = `futureu_comprehensive_recommendations_${userAssessmentId}`;
    const forceRefresh = options.forceRefresh || false;

    if (!forceRefresh) {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setRecommendationPacket(parsed);
          processStructuredResponse(parsed);
          setError(null);
          setCheckedExisting(true);
          return;
        } catch (parseError) {
          localStorage.removeItem(storageKey);
        }
      }
    }

    setLoading(true);
    try {
      const response = await recommendationService.fetchRecommendations(userAssessmentId);
      const payload = response.data;
      setRecommendationPacket(payload);
      processStructuredResponse(payload);
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setError(null);
    } catch (err) {
      const status = err?.response?.status;
      const backendMessage = err?.response?.data?.error || err?.response?.data?.message;
      let message = 'Failed to load recommendations.';
      if (status === 404) {
        message = 'No recommendations found yet. Generate new recommendations to get started.';
      } else if (status === 400) {
        message = backendMessage || 'Complete your assessment to unlock recommendations.';
      } else if (backendMessage) {
        message = backendMessage;
      }
      setError(message);
      setRecommendationPacket(null);
      processStructuredResponse(null);
      localStorage.removeItem(storageKey);
    } finally {
      setCheckedExisting(true);
      setLoading(false);
    }
  }, [processStructuredResponse, userAssessmentId]);

  // Helper to show tooltip
  const showTooltip = (e, content) => {
    const iconRect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 320; // px, matches w-72
    const tooltipHeight = 80; // estimate, will adjust after render
    let x = iconRect.left + iconRect.width / 2 - tooltipWidth / 2;
    let y = iconRect.bottom + 10; // 10px below icon
    let arrowX = tooltipWidth / 2;
    // Clamp to viewport
    const padding = 8;
    if (x < padding) {
      arrowX = arrowX + x - padding;
      x = padding;
    }
    if (x + tooltipWidth > window.innerWidth - padding) {
      const over = x + tooltipWidth - (window.innerWidth - padding);
      arrowX = arrowX - over;
      x = x - over;
    }
    // If too low, flip above
    if (y + tooltipHeight > window.innerHeight - padding) {
      y = iconRect.top - tooltipHeight - 10;
    }
    setTooltip({ visible: true, content, x, y, width: tooltipWidth, arrowX });
  };
  const hideTooltip = () => setTooltip(t => ({ ...t, visible: false }));

  useEffect(() => {
    fetchComprehensiveRecommendations();
  }, [fetchComprehensiveRecommendations]);

  const handleGenerateRecommendations = async () => {
    const storageKey = `futureu_comprehensive_recommendations_${userAssessmentId}`;
    setLoading(true);
    setIsRegenerating(true);
    setError(null);
    try {
      console.log('Starting AI recommendation regeneration...');
      await recommendationService.generateRecommendations(userAssessmentId);
      console.log('AI recommendation regeneration completed, fetching results...');
      localStorage.removeItem(storageKey);
      await fetchComprehensiveRecommendations({ forceRefresh: true });
      console.log('New recommendations loaded successfully');
    } catch (err) {
      console.error('Regeneration failed:', err);
      let errorMessage = 'Failed to generate recommendations. Please try again later.';
      
      // Check if it's a timeout error
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'The AI generation process is taking longer than expected. The system may still be processing in the background. Please wait a moment and try refreshing the page.';
      } else {
        const backendMessage = err?.response?.data?.error || err?.response?.data?.message;
        errorMessage = backendMessage || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsRegenerating(false);
    }
  };

  const handleRefreshRecommendations = useCallback(() => {
    fetchComprehensiveRecommendations({ forceRefresh: true });
  }, [fetchComprehensiveRecommendations]);

  const handlePathTabChange = useCallback((pathKey, tab) => {
    setPathTabs((prev) => ({ ...prev, [pathKey]: tab }));
    
    // Fetch career path description if switching to description tab and not already loaded
    if (tab === 'description') {
      const path = careerPathDetails.find(p => (p.careerPathId ?? careerPathDetails.indexOf(p)) === pathKey);
      if (path && path.careerPathId && !careerPathDescriptions[path.careerPathId]) {
        fetchCareerPathDescription(path.careerPathId);
      }
    }
  }, [careerPathDetails, careerPathDescriptions]);

  const fetchCareerPathDescription = useCallback(async (careerPathId) => {
    try {
      const response = await recommendationService.fetchCareerPathDetails(careerPathId);
      const careerPath = response.data;
      
      setCareerPathDescriptions(prev => ({
        ...prev,
        [careerPathId]: {
          description: careerPath.careerPathDescription || 'No description available.',
          name: careerPath.careerPathName || 'Career Path'
        }
      }));
    } catch (error) {
      console.error(`Failed to fetch career path description for ID ${careerPathId}:`, error);
      setCareerPathDescriptions(prev => ({
        ...prev,
        [careerPathId]: {
          description: 'Unable to load description at this time.',
          name: 'Career Path'
        }
      }));
    }
  }, []);

  const handleTogglePathProgram = useCallback((pathKey, programId) => {
    setExpandedPathPrograms((prev) => ({
      ...prev,
      [pathKey]: prev[pathKey] === programId ? null : programId,
    }));
  }, []);

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
          <h3 className="text-xl font-bold text-[#232D35] mb-3">Personalized Career Path Options</h3>
          <p className="text-sm text-gray-600">
            Based on your assessment results, we've identified careers and academic paths that align with your skills, 
            interests, and strengths. Explore these options to find the best fit for your future.
          </p>
          {recommendationPacket?.dateCompleted && (
            <p className="text-xs text-gray-500 mt-3">
              Assessment completed on {formatDate(recommendationPacket.dateCompleted)}
            </p>
          )}
          {checkedExisting && !loading && !error && (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleRefreshRecommendations}
                disabled={isRegenerating}
                className={`px-4 py-2 text-sm font-semibold border rounded-xl transition-colors ${
                  isRegenerating 
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                    : 'text-[#1D63A1] border-[#1D63A1]/40 hover:bg-[#1D63A1]/10'
                }`}
              >
                Refresh Outputs
              </button>
              <button
                onClick={handleGenerateRecommendations}
                disabled={isRegenerating}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  isRegenerating
                    ? 'text-gray-400 bg-gray-300 cursor-not-allowed'
                    : 'text-white bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#232D35] hover:to-[#232D35]'
                }`}
              >
                {isRegenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Regenerate Matches'
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* Dream Career Analysis Notice */}
        {checkedExisting && !loading && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-gradient-to-r from-[#1D63A1]/5 to-[#FFB71B]/5 rounded-2xl p-4 border border-[#1D63A1]/20 animate-card-pop">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#1D63A1]/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1D63A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-left text-sm font-semibold text-[#232D35] mb-1">Dream Career AI Analysis Available!</h4>
                <p className="text-left text-xs text-gray-600">
                  Get comprehensive AI-driven insights about your dream career alignment in the dedicated 
                  <span className="font-medium text-[#1D63A1]"> "Dream Career Analysis" </span>tab.
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
            {isRegenerating ? (
              <div className="mt-4">
                <p className="text-lg font-semibold text-[#1D63A1] mb-2">🤖 Generating AI Recommendations</p>
                <p className="text-sm text-gray-600 mb-3">
                  Our AI is analyzing your profile and creating personalized career path explanations. 
                  This may take 2-3 minutes due to advanced processing...
                </p>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1D63A1]"></div>
                  <span className="text-sm text-[#1D63A1] font-medium">Please wait, this is worth it!</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-3 mt-4">Loading your personalized recommendations...</p>
            )}
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
        {careerPathDetails.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="bg-white rounded-2xl shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#232D35]">Your Career Pathways</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Top {careerPathDetails.length} matches
              </span>
            </div>
            <div className="space-y-8">
              {careerPathDetails.map((path, idx) => {
                const breakdown = path.componentBreakdown || {};
                const pathKey = path.careerPathId ?? idx;
                const activeTab = pathTabs[pathKey] || 'careers';
                const careers = Array.isArray(path.careers) ? path.careers.slice(0, 5) : [];
                const programs = Array.isArray(path.programs) ? path.programs : [];
                const expandedProgramId = expandedPathPrograms[pathKey] ?? null;
                return (
                  <div key={pathKey} className="border border-gray-200 rounded-xl p-6 hover:border-[#1D63A1]/30 transition-colors">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-medium text-[#1D63A1] bg-[#1D63A1]/10 px-2 py-1 rounded">
                            #{idx + 1} Match
                          </span>
                          <span className="text-lg font-bold text-[#1D63A1]">
                            {(path.matchPercentage || 0).toFixed(1)}%
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-[#232D35] mb-2">{path.careerPathName}</h4>
                      </div>
                    </div>

                    {/* AI Summary */}
                    {path.summary && (
                      <div className="mb-6 p-4 bg-[#F8F9FA] rounded-lg border-l-4 border-[#1D63A1]">
                        <h5 className="text-left text-sm font-semibold text-[#232D35] mb-2">Why This Path Fits You</h5>
                        <p className="text-sm text-left text-gray-700 leading-relaxed">{path.summary}</p>
                      </div>
                    )}

                    {/* Component Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {Object.entries(breakdown).map(([key, value]) => (
                        <div key={key} className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{key}</p>
                          <p className="text-lg font-bold text-[#1D63A1]">{(value || 0).toFixed(1)}%</p>
                        </div>
                      ))}
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                      <nav className="flex space-x-8">
                        <button
                          type="button"
                          onClick={() => handlePathTabChange(pathKey, 'careers')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'careers' 
                              ? 'border-[#1D63A1] text-[#1D63A1]' 
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Related Careers
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePathTabChange(pathKey, 'programs')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'programs' 
                              ? 'border-[#FFB71B] text-[#FFB71B]' 
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Study Programs
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePathTabChange(pathKey, 'description')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'description' 
                              ? 'border-[#232D35] text-[#232D35]' 
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Description
                        </button>
                      </nav>
                    </div>
                    {/* Tab Content */}
                    {activeTab === 'careers' && (
                      <motion.div 
                        key="careers"
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {careers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {careers.map((career, careerIdx) => (
                              <motion.div 
                                key={career.careerId || career.careerTitle}
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ duration: 0.3, delay: careerIdx * 0.1 }}
                                className="p-4 border border-gray-200 rounded-lg hover:border-[#1D63A1]/30 transition-colors"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-semibold text-[#232D35] text-sm">{career.careerTitle}</h5>
                                  <span className="text-xs font-medium text-[#1D63A1] bg-[#1D63A1]/10 px-2 py-1 rounded ml-2">
                                    {(career.matchPercentage || 0).toFixed(1)}%
                                  </span>
                                </div>
                                <p className="text-xs text-left text-gray-600 leading-relaxed">{career.summary || 'This career aligns with your strengths.'}</p>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.3 }}
                            className="text-center py-8 text-gray-500"
                          >
                            <p className="text-sm">No specific careers found for this pathway.</p>
                            <p className="text-xs mt-1">This pathway may include diverse career options.</p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                    {activeTab === 'programs' && (
                      <motion.div 
                        key="programs"
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {programs.length > 0 ? (
                          programs.map((program, programIdx) => {
                            const programId = program.programId ?? `${pathKey}-${programIdx}`;
                            const schools = Array.isArray(program.recommendedSchools) ? program.recommendedSchools : [];
                            const expanded = expandedProgramId === programId;
                            return (
                              <motion.div 
                                key={programId} 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ duration: 0.3, delay: programIdx * 0.1 }}
                                className="border border-gray-200 rounded-lg p-5 hover:border-[#FFB71B]/30 transition-colors"
                              >
                                <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => handleTogglePathProgram(pathKey, programId)}>
                                  <div className="flex-1">
                                    <h5 className="text-left font-semibold text-[#232D35] mb-1">{program.programName}</h5>
                                    <p className="text-sm text-left text-gray-600">{program.summary || 'This program supports your career goals.'}</p>
                                  </div>
                                  <div className="flex items-center gap-3 ml-4">
                                    <span className="text-xs font-medium text-[#FFB71B] bg-[#FFB71B]/10 px-2 py-1 rounded">
                                      {(program.matchPercentage || 0).toFixed(1)}% Match
                                    </span>
                                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                  </div>
                                </div>
                                <AccordionContent expanded={expanded}>
                                  <div className="pt-4 border-t border-gray-100">
                                    <h6 className="font-medium text-[#232D35] mb-3">Available at these schools:</h6>
                                    {schools.length > 0 ? (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {schools.map((schoolObj, schoolIdx) => {
                                          const { schoolProgram, reason } = schoolObj;
                                          const school = schoolProgram?.school || schoolObj?.school;
                                          const schoolLogo = schoolLogos[school?.schoolId];
                                          const schoolBackground = getSchoolBackground(school?.name);
                                          const programSchoolKey = schoolProgram?.schoolProgramId || `${programId}-${schoolIdx}`;
                                          const isTopChoice = reason && reason.toLowerCase().includes('best');
                                          
                                          return (
                                            <motion.div 
                                              key={programSchoolKey} 
                                              initial={{ opacity: 0, scale: 0.95 }} 
                                              animate={{ opacity: 1, scale: 1 }} 
                                              transition={{ duration: 0.2, delay: schoolIdx * 0.05 }}
                                              className="relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                                            >
                                              {isTopChoice && (
                                                <span className="absolute top-2 right-2 text-xs font-medium bg-[#FFB71B] text-white px-2 py-1 rounded">
                                                  Top Choice
                                                </span>
                                              )}
                                              
                                              <div className="flex items-start gap-3">
                                                {schoolLogo ? (
                                                  <img src={schoolLogo} alt={`${school?.name} logo`} className="w-10 h-10 object-cover rounded" />
                                                ) : (
                                                  <div className="w-10 h-10 bg-[#1D63A1]/10 rounded flex items-center justify-center">
                                                    <School className="w-5 h-5 text-[#1D63A1]" />
                                                  </div>
                                                )}
                                                
                                                <div className="flex-1 min-w-0">
                                                  <h6 className="font-medium text-[#232D35] text-sm truncate">{school?.name}</h6>
                                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    <span className="truncate">{school?.location || 'Location not available'}</span>
                                                  </div>
                                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                                    <Globe className="w-3 h-3 mr-1" />
                                                    <span>{school?.type || 'School type unavailable'}</span>
                                                  </div>
                                                  {reason && (
                                                    <p className="text-xs text-[#1D63A1] mt-2 line-clamp-2">{reason}</p>
                                                  )}
                                                </div>
                                              </div>
                                            </motion.div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500 text-center py-4">No schools found for this program.</p>
                                    )}
                                  </div>
                                </AccordionContent>
                              </motion.div>
                            );
                          })
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.3 }}
                            className="text-center py-8 text-gray-500"
                          >
                            <p className="text-sm">No specific programs found for this pathway.</p>
                            <p className="text-xs mt-1">This pathway may include diverse program options.</p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                    {activeTab === 'description' && (
                      <motion.div 
                        key="description"
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {(() => {
                          const pathData = careerPathDetails.find(p => (p.careerPathId ?? careerPathDetails.indexOf(p)) === pathKey);
                          const pathId = pathData?.careerPathId;
                          const descriptionData = pathId ? careerPathDescriptions[pathId] : null;
                          
                          if (!pathId) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">Unable to load pathway information.</p>
                              </div>
                            );
                          }
                          
                          if (!descriptionData) {
                            return (
                              <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#232D35] mx-auto mb-3"></div>
                                <p className="text-sm text-gray-600">Loading pathway description...</p>
                              </div>
                            );
                          }
                          
                          return (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              transition={{ duration: 0.3 }}
                              className="bg-gradient-to-r from-[#232D35]/5 to-[#232D35]/10 rounded-lg p-6 border border-[#232D35]/20"
                            >
                              <div className="flex items-center gap-3 mb-4">
                                <div>
                                  <h4 className="text-left font-semibold text-[#232D35] text-lg">About This Career Pathway</h4>
                                  <p className="text-sm text-gray-600">Detailed information about {pathData.careerPathName}</p>
                                </div>
                              </div>
                              
                              <div className="prose prose-gray max-w-none">
                                <p className="text-sm text-left text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {descriptionData.description}
                                </p>
                              </div>
                              
                              <div className="mt-6 p-4 bg-white/50 rounded-lg border border-[#232D35]/10">
                                <h5 className="font-medium text-[#232D35] mb-2">Why This Pathway Matches You</h5>
                                <p className="text-sm text-gray-600 text-left">
                                  This pathway achieved a <span className="font-semibold text-[#232D35]">{(pathData.matchPercentage || 0).toFixed(1)}%</span> match 
                                  with your assessment results, indicating strong alignment with your demonstrated strengths and interests.
                                </p>
                              </div>
                            </motion.div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
        {/* Career recommendations - only show if recommendations exist */}
        {aiRecommendations && aiRecommendations.recommendations && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-2xl shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#232D35]">Recommended Careers</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Based on {aiRecommendations.overallScore?.toFixed(1)}% match
              </span>
            </div>
            <p className="text-gray-600 mb-8">
              These specific career roles align well with your assessment results and personality profile.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiRecommendations.recommendations.careers
                ?.slice(0, 5)
                .map((career, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-5 hover:border-[#1D63A1]/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#1D63A1] bg-[#1D63A1]/10 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        {index === 0 && (
                          <span className="text-xs font-medium text-[#FFB71B] bg-[#FFB71B]/10 px-2 py-1 rounded">
                            Top Pick
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-[#1D63A1]">
                        {career.confidenceScore?.toFixed(1)}%
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-[#232D35] mb-2">{career.name}</h4>
                    <p className="text-sm text-left text-gray-600 leading-relaxed">{career.description}</p>
                  </div>
                ))
              }
            </div>
            {aiRecommendations.recommendations.personalized && (
              <div className="mt-8 p-5 bg-[#F8F9FA] rounded-lg border-l-4 border-[#1D63A1]">
                <h4 className="font-semibold text-[#232D35] mb-2">Personal Insight</h4>
                <p className="text-sm text-gray-700">{aiRecommendations.recommendations.personalized}</p>
              </div>
            )}
          </motion.div>
        )}
        {/* Academic Track Recommendations - only show if recommendations exist */}
        {aiRecommendations && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white rounded-3xl shadow-xl p-6 animate-card-pop">
            <h3 className="text-xl font-bold text-[#232D35] mb-2">Track Recommendations</h3>
            <p className="text-sm text-gray-600 mb-6">
              Based on your assessment performance
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
                <h3 className="text-center text-xl font-bold text-[#232D35] mb-2">Your Path Forward</h3>
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
              disabled={isRegenerating}
              className={`px-6 py-3 font-bold rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#1D63A1] ${
                isRegenerating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] text-white hover:from-[#232D35] hover:to-[#232D35] animate-bounce-short'
              }`}
            >
              {isRegenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                'See My Results'
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
      {tooltip.visible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            width: tooltip.width,
            zIndex: 9999,
            pointerEvents: 'auto',
            minWidth: '16rem',
            maxWidth: '20rem',
            transition: 'opacity 0.2s',
          }}
          className="bg-[#eae7de] dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs rounded-lg shadow-lg p-3 border border-[#eae7de]/30 animate-fade-in text-left"
        >
          <div
            className="absolute w-0 h-0"
            style={{
              left: tooltip.arrowX - 8, // 8px is half the arrow width
              top: -8,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid',
              borderBottomColor: 'var(--tw-bg-opacity, 1) #fff',
              // For dark mode
              background: 'none',
            }}
          ></div>
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

// Utility to clear recommendations from localStorage for a given assessmentId
export function clearRecommendationsFromLocalStorage(userAssessmentId) {
  if (!userAssessmentId) return;
  localStorage.removeItem(`futureu_recommendations_${userAssessmentId}`);
  localStorage.removeItem(`futureu_program_recommendations_${userAssessmentId}`);
  localStorage.removeItem(`futureu_comprehensive_recommendations_${userAssessmentId}`);
}

export default RecommendationsTab;
