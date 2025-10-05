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
  const [dreamInsight, setDreamInsight] = useState(null);
  const [pathTabs, setPathTabs] = useState({}); // { [pathId]: 'careers' | 'programs' }
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
      setDreamInsight(null);
      setPathTabs({});
      setExpandedPathPrograms({});
      return;
    }

    const advanced = payload.recommendations;
    setStructuredRecommendations(advanced);
    setDreamInsight(advanced.dreamCareerInsight || null);

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="bg-white rounded-3xl shadow-xl p-6 animate-card-pop">
            <h3 className="text-xl font-bold text-[#232D35] mb-4">Top Career Pathways</h3>
            <div className="space-y-6">
              {careerPathDetails.map((path, idx) => {
                const breakdown = path.componentBreakdown || {};
                const pathKey = path.careerPathId ?? idx;
                const activeTab = pathTabs[pathKey] || 'careers';
                const careers = Array.isArray(path.careers) ? path.careers.slice(0, 5) : [];
                const programs = Array.isArray(path.programs) ? path.programs : [];
                const expandedProgramId = expandedPathPrograms[pathKey] ?? null;
                return (
                  <div key={pathKey} className="border border-[#1D63A1]/15 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-[#232D35]">{path.careerPathName}</h4>
                        <p className="text-xs text-left text-gray-500">Option #{idx + 1}</p>
                      </div>
                      <span className="px-3 py-1 bg-[#1D63A1]/10 text-[#1D63A1] rounded-l text-sm font-bold self-start sm:self-auto">
                        {(path.matchPercentage || 0).toFixed(1)}% Match
                      </span>
                    </div>
                    {path.summary && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-[#1D63A1]/5 to-[#FFB71B]/5 rounded-xl border border-[#1D63A1]/10">
                        <h5 className="text-sm font-semibold text-[#232D35] mb-2">Why This Path Fits You</h5>
                        <p className="text-sm text-left text-gray-700 leading-relaxed">{path.summary}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      {Object.entries(breakdown).map(([key, value]) => (
                        <div key={key} className="bg-[#F8F9FA] rounded-xl p-3">
                          <p className="text-xs uppercase tracking-wide text-gray-500">{key}</p>
                          <p className="text-sm font-semibold text-[#1D63A1]">{(value || 0).toFixed(1)}%</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => handlePathTabChange(pathKey, 'careers')}
                        className={`px-4 py-2 text-xs font-semibold rounded-l border transition-colors ${activeTab === 'careers' ? 'bg-[#1D63A1] text-white border-[#1D63A1]' : 'bg-white text-[#1D63A1] border-[#1D63A1]/30 hover:bg-[#1D63A1]/10'}`}
                      >
                        Careers
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePathTabChange(pathKey, 'programs')}
                        className={`px-4 py-2 text-xs font-semibold rounded-l border transition-colors ${activeTab === 'programs' ? 'bg-[#FFB71B] text-white border-[#FFB71B]' : 'bg-white text-[#FFB71B] border-[#FFB71B]/30 hover:bg-[#FFB71B]/10'}`}
                      >
                        Programs
                      </button>
                    </div>
                    {activeTab === 'careers' && (
                      <div>
                        {careers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {careers.map((career) => (
                              <div key={career.careerId || career.careerTitle} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-xl p-4 shadow-inner">
                                <p className="text-sm font-semibold text-[#232D35] mb-1">{career.careerTitle}</p>
                                <p className="text-xs text-left text-gray-600 mb-2">{career.summary || 'This career aligns with your strengths.'}</p>
                                <span className="inline-block px-2 py-1 text-xs font-medium bg-white text-[#1D63A1] rounded-l">
                                  {(career.matchPercentage || 0).toFixed(1)}% Match
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No linked careers found for this pathway.</p>
                        )}
                      </div>
                    )}
                    {activeTab === 'programs' && (
                      <div className="space-y-4">
                        {programs.length > 0 ? (
                          programs.map((program, programIdx) => {
                            const programId = program.programId ?? `${pathKey}-${programIdx}`;
                            const schools = Array.isArray(program.recommendedSchools) ? program.recommendedSchools : [];
                            const expanded = expandedProgramId === programId;
                            return (
                              <div key={programId} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all animate-card-pop">
                                <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => handleTogglePathProgram(pathKey, programId)}>
                                  <h4 className="text-lg font-semibold text-[#232D35]">{program.programName}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-white text-[#1D63A1] rounded-full text-sm font-bold border border-[#1D63A1]/20">
                                      {(program.matchPercentage || 0).toFixed(1)}% Match
                                    </span>
                                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                  </div>
                                </div>
                                <p className="text-left text-sm text-gray-600 mb-4">{program.summary || 'This program supports your career goals.'}</p>
                                <AccordionContent expanded={expanded}>
                                  <h5 className="font-semibold text-[#1D63A1] mb-3 flex items-center gap-2">
                                    Schools offering this program
                                  </h5>
                                  {schools.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-1">
                                      {schools.map((schoolObj, schoolIdx) => {
                                        const { schoolProgram, reason } = schoolObj;
                                        const school = schoolProgram?.school || schoolObj?.school;
                                        const schoolLogo = schoolLogos[school?.schoolId];
                                        const schoolBackground = getSchoolBackground(school?.name);
                                        const programSchoolKey = schoolProgram?.schoolProgramId || `${programId}-${schoolIdx}`;
                                        let rankLabel = `#${schoolIdx + 1}`;
                                        if (reason && reason.toLowerCase().includes('best')) {
                                          rankLabel = 'Best School';
                                        }
                                        return (
                                          <div key={programSchoolKey} className="relative bg-white dark:bg-gray-700 rounded-lg transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 animate-card-pop text-xs group">
                                            <div className="absolute top-2 right-2 z-10">
                                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold shadow ${rankLabel === 'Best School' ? 'bg-[#FFB71B] text-white' : 'bg-[#232D35] text-white'}`}>{rankLabel}</span>
                                            </div>
                                            <div className="absolute top-2 left-2 z-10">
                                              <span
                                                className="cursor-pointer text-[#FFB71B]"
                                                onMouseEnter={(e) => showTooltip(e, reason)}
                                                onMouseLeave={hideTooltip}
                                                onFocus={(e) => showTooltip(e, reason)}
                                                onBlur={hideTooltip}
                                                tabIndex={0}
                                                aria-label="Show reason for ranking"
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" /></svg>
                                              </span>
                                            </div>
                                            <div className="flex flex-col h-full">
                                              <div className="relative w-full h-28 bg-blue-100 overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-blue-500/10" />
                                                {schoolBackground ? (
                                                  <img src={schoolBackground} alt={`${school?.name} campus`} className="w-full h-full object-cover object-center" />
                                                ) : (
                                                  <img src={`https://source.unsplash.com/800x450/?university,school,campus,college&${school?.schoolId}`} alt={`${school?.name} campus`} className="w-full h-full object-cover object-center" />
                                                )}
                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                  {schoolLogo ? (
                                                    <img src={schoolLogo} alt={`${school?.name} logo`} className="w-14 h-14 object-cover rounded-full shadow-md" />
                                                  ) : (
                                                    <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full shadow">
                                                      <School className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="p-3 flex flex-col flex-1">
                                                <h3 className="text-xs font-bold text-base text-gray-900 dark:text-white text-left mb-2">{school?.name}</h3>
                                                <div className="space-y-2 bg-white dark:bg-gray-700/60 p-3 rounded-md mb-2 border border-gray-200 dark:border-gray-700 shadow-sm mt-auto">
                                                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                                    <MapPin className="w-4 h-4 mr-2 text-[#FFB71B] flex-shrink-0" />
                                                    <span className="text-left text-xs">{school?.location || 'Location not available'}</span>
                                                  </div>
                                                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                                    <Globe className="w-4 h-4 mr-2 text-[#FFB71B] flex-shrink-0" />
                                                    <span>{school?.type || 'School type unavailable'}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 text-sm italic">No schools found for this program.</div>
                                  )}
                                </AccordionContent>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-gray-500">No linked programs found for this pathway.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
        {/* Career recommendations - only show if recommendations exist */}
        {aiRecommendations && aiRecommendations.recommendations && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-xl p-6 animate-card-pop">
            <h3 className="text-xl font-bold text-[#232D35] mb-2">Top Career Options</h3>
            <p className="text-sm text-gray-600 mb-6">
              Based on your assessment profile with <span className="text-[#1D63A1] font-semibold">{aiRecommendations.overallScore?.toFixed(1)}%</span> overall score and your Personality
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
                        #{index+1} Career Option
                      </span>
                      {index === 0 && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-[#FFB71B]/10 text-[#FFB71B] rounded">
                          Best Option
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
        {dreamInsight && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white rounded-3xl shadow-xl p-6 animate-card-pop">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#232D35] mb-2">Dream Career Alignment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {dreamInsight.dreamCareer
                    ? <>Your dream career is <span className="font-semibold text-[#1D63A1]">{dreamInsight.dreamCareer}</span>.</>
                    : 'Set a dream career in your profile to see a personalized alignment check.'}
                </p>
                {dreamInsight.guidance && (
                  <div className="p-4 bg-[#F8F9FA] rounded-2xl mb-3">
                    <h4 className="text-sm font-semibold text-[#232D35] mb-1">Focus Areas</h4>
                    <p className="text-xs text-gray-700">{dreamInsight.guidance}</p>
                  </div>
                )}
                {dreamInsight.encouragement && (
                  <div className="p-4 bg-[#1D63A1]/10 rounded-2xl">
                    <h4 className="text-sm font-semibold text-[#232D35] mb-1">Encouragement</h4>
                    <p className="text-xs text-gray-700">{dreamInsight.encouragement}</p>
                  </div>
                )}
              </div>
              <div className="md:w-64 flex-shrink-0">
                {typeof dreamInsight.closenessScore === 'number' && (
                  <div className="p-4 bg-[#FFB71B]/10 rounded-2xl mb-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">Closeness Score</p>
                    <p className="text-3xl font-bold text-[#FFB71B]">{dreamInsight.closenessScore.toFixed(1)}%</p>
                  </div>
                )}
                {(dreamInsight.riasecGap || dreamInsight.aptitudeGap) && (
                  <div className="p-4 bg-[#F8F9FA] rounded-2xl">
                    <h4 className="text-sm font-semibold text-[#232D35] mb-2">Gap Snapshot</h4>
                    <div className="space-y-2">
                      {dreamInsight.riasecGap && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">RIASEC</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(dreamInsight.riasecGap)
                              .sort((a, b) => (b[1] || 0) - (a[1] || 0))
                              .slice(0, 3)
                              .map(([key, value]) => (
                                <span key={key} className="px-2 py-1 text-xs bg-white rounded-full text-[#1D63A1] border border-[#1D63A1]/20">
                                  {key}: {value.toFixed(1)}%
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                      {dreamInsight.aptitudeGap && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Aptitude</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(dreamInsight.aptitudeGap)
                              .sort((a, b) => (b[1] || 0) - (a[1] || 0))
                              .slice(0, 3)
                              .map(([key, value]) => (
                                <span key={key} className="px-2 py-1 text-xs bg-white rounded-full text-[#232D35] border border-[#232D35]/15">
                                  {key}: {value.toFixed(1)}%
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
