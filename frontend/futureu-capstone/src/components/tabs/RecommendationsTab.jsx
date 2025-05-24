import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as recommendationService from '../../services/recommendationService';
import userAssessmentService from '../../services/userAssessmentService';
import programRecommendationService from '../../services/programRecommendationService';
import schoolProgramService from '../../services/schoolProgramService';
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
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkedExisting, setCheckedExisting] = useState(false);
  const [programRecommendations, setProgramRecommendations] = useState(null);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [programError, setProgramError] = useState(null);
  const [expandedPrograms, setExpandedPrograms] = useState([]); // Track expanded accordions
  const [schoolsByProgram, setSchoolsByProgram] = useState({}); // Cache schools per program
  const [loadingSchools, setLoadingSchools] = useState({}); // Track loading state per program
  const [showTip, setShowTip] = useState(true); // State to show/hide tip

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
        const overallScore = assessmentData.assessmentResult?.overallScore || 0;
        if (!resultId) throw new Error('No assessment result found');
        const existingRecommendations = await recommendationService.fetchRecommendationsByResult(resultId);
        let recommendationsArr = [];
        if (existingRecommendations.data && (Array.isArray(existingRecommendations.data) ? existingRecommendations.data.length > 0 : true)) {
          recommendationsArr = Array.isArray(existingRecommendations.data) ? existingRecommendations.data : [existingRecommendations.data];
          // Sort and format
          const sortedRecommendations = [...recommendationsArr]
            .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
            .slice(0, 5);
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
            programId: p.program.programId,
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
      const overallScore = assessmentData.assessmentResult?.overallScore || 0;
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

  // Accordion toggle handler (only one open at a time)
  const handleToggleProgram = (program, idx) => {
    setExpandedPrograms((prev) => (prev[0] === idx ? [] : [idx]));
    // Only fetch if not already loaded
    const programId = program.programId || (program.program && program.program.programId);
    if (!programId) {
      setSchoolsByProgram((prev) => ({ ...prev, [program.programName]: [] }));
      setLoadingSchools((prev) => ({ ...prev, [program.programName]: false }));
      return;
    }
    if (!schoolsByProgram[program.programName]) {
      setLoadingSchools((prev) => ({ ...prev, [program.programName]: true }));
      schoolProgramService.getSchoolProgramsByProgram(programId)
        .then((schoolPrograms) => {
          const schools = (schoolPrograms || [])
            .map((sp) => sp.school)
            .filter((s, i, arr) => s && arr.findIndex(ss => ss.schoolId === s.schoolId) === i);
          setSchoolsByProgram((prev) => ({ ...prev, [program.programName]: schools }));
        })
        .catch(() => {
          setSchoolsByProgram((prev) => ({ ...prev, [program.programName]: [] }));
        })
        .finally(() => {
          setLoadingSchools((prev) => ({ ...prev, [program.programName]: false }));
        });
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
          <div className="relative">
            {/* Overlapping tip container */}
            {showTip && (
              <div className="absolute -top-8 -left-15 z-20 w-90 h-28 flex flex-row items-center px-2 py-4 rounded-3xl shadow-lg bg-white animate-fade-in-up">
                <img src="/src/assets/characters/ohMy.svg" alt="Oh My character" className="w-28 h-28 mr-6" />
                <div className="flex-1 flex flex-col">
                <span className="text-left text-xs font-semibold text-[#2B3E4E] text-center flex-1 pr-2">
                  <p className='text-lg'><b>Tip</b></p> Click the Program to expand and see the list of schools offering it.
                </span>
                <div className='text-right pr-6'>
                  <span
                    className="text-xs font-bold text-[#FFB71B] cursor-pointer hover:underline"
                    onClick={() => setShowTip(false)}
                  >
                    Okay
                  </span>
                </div>
                </div>
              </div>
            )}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-xl p-6 animate-card-pop mt-8">
              <h3 className="text-xl font-bold text-[#232D35] mb-2">Recommended College Programs</h3>
              <p className="text-sm text-gray-600 mb-2">
                These programs are matched to your top career recommendations and assessment profile.
              </p>
              <div className="space-y-6">
                {programRecommendations.map((program, idx) => (
                  <motion.div key={idx} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all animate-card-pop">
                    <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => handleToggleProgram(program, idx)}>
                      <h4 className="text-lg font-semibold text-[#232D35]">{program.programName}</h4>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-[#FFB71B]/10 text-[#FFB71B] rounded-full text-sm font-bold">
                          {program.confidenceScore?.toFixed(1)}% Match
                        </span>
                        {expandedPrograms.includes(idx) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
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
                    {/* Accordion content: Schools offering this program */}
                    <AccordionContent expanded={expandedPrograms.includes(idx)}>
                      <h5 className="font-semibold text-[#1D63A1] mb-3 flex items-center gap-2">
                        Schools offering this program
                      </h5>
                      {loadingSchools[program.programName] ? (
                        <div className="flex items-center justify-center h-12">
                          <div className="loader"></div>
                          <div className="text-gray-500 text-sm">Loading schools...</div>
                        </div>
                      ) : (schoolsByProgram[program.programName]?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          {schoolsByProgram[program.programName].map((school) => {
                            const schoolLogo = schoolLogos[school.schoolId];
                            const schoolBackground = getSchoolBackground(school.name);
                            return (
                              <div key={school.schoolId} className="relative bg-white dark:bg-gray-700 rounded-lg transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 animate-card-pop text-xs">
                                <div className="flex flex-col h-full">
                                  {/* Top half with image and logo (scaled down) */}
                                  <div className="relative w-full h-28 bg-blue-100 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-blue-500/10"></div>
                                    {schoolBackground ? (
                                      <img src={schoolBackground} alt={`${school.name} campus`} className="w-full h-full object-cover object-center" />
                                    ) : (
                                      <img src={`https://source.unsplash.com/800x450/?university,school,campus,college&${school.schoolId}`} alt={`${school.name} campus`} className="w-full h-full object-cover object-center" />
                                    )}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                      {schoolLogo ? (
                                        <img src={schoolLogo} alt={`${school.name} logo`} className="w-14 h-14 object-cover rounded-full shadow-md" />
                                      ) : (
                                        <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full shadow">
                                          <School className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* Bottom half with school information (scaled down) */}
                                  <div className="p-3 flex flex-col flex-1">
                                    <h3 className="text-xs font-bold text-base text-gray-900 dark:text-white text-left mb-2">{school.name}</h3>
                                    <div className="space-y-2 bg-white dark:bg-gray-700/60 p-3 rounded-md mb-2 border border-gray-200 dark:border-gray-700 shadow-sm mt-auto">
                                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                        <MapPin className="w-4 h-4 mr-2 text-[#FFB71B] flex-shrink-0" />
                                        <span className="text-left text-xs">{school.location}</span>
                                      </div>
                                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                        <Globe className="w-4 h-4 mr-2 text-[#FFB71B] flex-shrink-0" />
                                        <span>{school.type}</span>
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
                      ))}
                    </AccordionContent>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
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
