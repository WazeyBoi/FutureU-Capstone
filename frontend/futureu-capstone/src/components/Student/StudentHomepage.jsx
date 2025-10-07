import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import userAssessmentService from '../../services/userAssessmentService';
import assessmentTakingService from '../../services/assessmentTakingService';
import programService from '../../services/programService';
import schoolService from '../../services/schoolService';
import careerService from '../../services/careerService';
import {
  BookOpen, User, BarChart3, Target, Calendar, Bell, 
  TrendingUp, Award, Clock, ChevronRight, Star, 
  Play, Users, MessageSquare, Search, Menu, X,
  GraduationCap, Briefcase, Heart, Settings,
  Compass, Navigation, CheckCircle, Circle, 
  AlertCircle, ArrowRight, Zap, Map, Brain,
  Trophy, Lightbulb, TrendingDown, Globe, Eye,
  Video, FileText, UserCheck, MessageCircle,
  Bookmark, Share2, Building, MapPin, Phone
} from 'lucide-react';

// Animation variants (subtle/professional)
const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const itemFade = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } }
};

const StudentHomepage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [inProgressAssessments, setInProgressAssessments] = useState([]);
  const [latestAssessmentResult, setLatestAssessmentResult] = useState(null);
  const [statsData, setStatsData] = useState({
    programs: 0,
    schools: 0,
    careers: 0,
    loading: true
  });

  const getCurrentUserId = () => {
    return authService.getCurrentUserId() || 1; // Fallback to 1 during development
  };

  // Helper function to navigate and scroll to top
  const navigateAndScrollToTop = (path) => {
    navigate(path);
    // Use setTimeout to ensure navigation completes before scrolling
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  // Mock data - replace with real API calls
  const [studentData, setStudentData] = useState({
    // Feature 5: Exploration Tools
    explorationTools: [
      { 
        title: "Academic Exploration", 
        desc: "Search for a program and find the schools that offer it",
        icon: <BookOpen className="w-5 h-5" />,
        action: () => navigateAndScrollToTop('/academic-explorer'),
        color: "from-blue-500 to-blue-600"
      },
      { 
        title: "Programs Accreditation", 
        desc: "View programs' accreditation level in every school",
        icon: <Award className="w-5 h-5" />,
        action: () => navigateAndScrollToTop('/accreditation'),
        color: "from-green-500 to-green-600"
      },
      { 
        title: "Virtual Campus Tours", 
        desc: "Explore universities from home",
        icon: <Video className="w-5 h-5" />,
        action: () => navigateAndScrollToTop('/virtual-campus-tours'),
        color: "from-purple-500 to-purple-600"
      },
      { 
        title: "Testimonials", 
        desc: "View students, alumni, or educators testimonies towards their school",
        icon: <MessageSquare className="w-5 h-5" />,
        action: () => navigateAndScrollToTop('/testimonials'),
        color: "from-orange-500 to-orange-600"
      },
      { 
        title: "Career Deep Dives", 
        desc: "View detailed information of different careers",
        icon: <Briefcase className="w-5 h-5" />,
        action: () => navigateAndScrollToTop('/career-pathways'),
        color: "from-indigo-500 to-indigo-600"
      }
    ]
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    // Fetch assessment data and stats data
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        
        // Fetch completed assessments
        const completed = await userAssessmentService.getCompletedAssessments(userId);
        setCompletedAssessments(completed);
        setHasCompletedAssessment(completed.length > 0);
        
        // Fetch in-progress assessments
        const inProgress = await assessmentTakingService.getInProgressAssessments(userId);
        const validInProgressAssessments = inProgress.filter(
          assessment => assessment.user.userId === userId
        );
        setInProgressAssessments(validInProgressAssessments);
        
        // Get latest assessment result if available
        if (completed.length > 0) {
          const latest = completed[completed.length - 1];
          if (latest.result) {
            setLatestAssessmentResult(latest.result);
          } else {
            // Fetch result if not included
            try {
              const resultData = await userAssessmentService.getAssessmentResults(latest.userQuizAssessment);
              setLatestAssessmentResult(resultData.assessmentResult);
            } catch (err) {
              console.error('Error fetching assessment results:', err);
            }
          }
        }
        
        // Fetch stats data for quick stats section
        try {
          const [programsData, schoolsData, careersData] = await Promise.all([
            programService.getAllPrograms().catch(() => []),
            schoolService.getAllSchools().catch(() => []),
            careerService.getAllCareers().catch(() => [])
          ]);
          
          setStatsData({
            programs: Array.isArray(programsData) ? programsData.length : 0,
            schools: Array.isArray(schoolsData) ? schoolsData.length : 0,
            careers: Array.isArray(careersData) ? careersData.length : 0,
            loading: false
          });
        } catch (error) {
          console.error('Error fetching stats data:', error);
          setStatsData(prev => ({ ...prev, loading: false }));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setLoading(false);
        setStatsData(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchAllData();
    
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleViewResults = () => {
    if (completedAssessments.length > 0) {
      const latest = completedAssessments[completedAssessments.length - 1];
      navigateAndScrollToTop(`/assessment-results/${latest.userQuizAssessment}`);
    }
  };

  const quickActions = [
    {
      title: hasCompletedAssessment ? "Take Assessment Again" : "Take Assessment",
      desc: "Discover the FutureU - Take our comprehensive assessment",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      action: () => navigateAndScrollToTop('/take-assessment/1'), // Assessment ID 1 for "Discover the FutureU"
      priority: !hasCompletedAssessment
    },
    {
      title: "View My Results",
      desc: "See your assessment results and insights",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      action: handleViewResults,
      enabled: hasCompletedAssessment
    },
    {
      title: "Explore Careers",
      desc: "Find purpose-aligned career paths",
      icon: <Target className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      action: () => navigateAndScrollToTop('/career-pathways')
    },
    {
      title: "Find Programs",
      desc: "Connect to your educational journey",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      action: () => navigateAndScrollToTop('/academic-explorer')
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen h-full">
          <div>
            <img 
              src="/src/assets/characters/quirky.svg" 
              alt="FutureU mascot" 
              className="quirky-bounce h-50 mx-auto"
            />
          </div>
          <p className="text-lg font-bold text-gray-600">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* Full-width hero */}
          <section className="w-full">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
            >
              <div className="relative overflow-hidden bg-[radial-gradient(1200px_600px_at_100%_-20%,#2B3E4E_0%,#1D3A53_45%,#1B3348_70%,#1B3448_100%)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-24 text-white text-left">
                  {/* Eyebrow label */}
                  <motion.div className="flex items-center mb-4" variants={itemFade}>
                    <Navigation className="w-5 h-5 mr-2 text-[#FFB71B]" />
                    <span className="text-[#FFB71B] font-semibold text-sm">Your Path to Purpose</span>
                  </motion.div>
                  {/* Greeting */}
                  <motion.h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight tracking-tight" variants={itemFade}>
                    {getGreeting()}, {currentUser?.firstName || 'Future Leader'}!
                  </motion.h1>
                  {/* Status card (glassy) */}
                  <motion.div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 md:p-6 mb-6 text-left max-w-5xl" variants={scaleIn}>
                  {!hasCompletedAssessment ? (
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFB71B] text-[#2B3E4E] mr-4">
                          <BookOpen className="w-5 h-5" />
                      </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">Ready to Discover Your Future?</div>
                          <div className="text-sm text-blue-100/90 mb-4">Take our comprehensive "Discover the FutureU" assessment to unlock your potential.</div>
                      <button 
                        onClick={() => navigateAndScrollToTop('/take-assessment/1')}
                            className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg border border-white/30 text-white/90 hover:bg-white/10 transition-colors"
                      >
                            <Play className="w-4 h-4 mr-2" />
                            Take Assessment Now
                      </button>
                        </div>
                    </div>
                  ) : (
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFB71B] text-[#2B3E4E] mr-4">
                          <CheckCircle className="w-5 h-5" />
                      </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">Assessment Completed!</div>
                          <div className="text-sm text-blue-100/90 mb-4">Great job! You've completed the FutureU assessment. View your results below.</div>
                      <button 
                        onClick={handleViewResults}
                            className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg border border-white/30 text-white/90 hover:bg-white/10 transition-colors"
                      >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View My Results
                      </button>
                        </div>
                    </div>
                  )}
                  </motion.div>
                  {/* Date row */}
                  <motion.div className="flex items-center text-blue-100/80 text-sm mt-4" variants={itemFade}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </motion.div>
            </div>
          </div>
        </motion.div>
          </section>

          {/* Main Content */}
          <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Dashboard Sections - expanded width */}
        <motion.div className="max-w-[95vw] mx-auto" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Assessment Results Overview or Prompt */}
            {!hasCompletedAssessment ? (
              <motion.div variants={itemFade} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-center mb-6">
                  <h3 className="text-xl font-bold text-[#2B3E4E] flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-[#1D63A1]" />
                    Get Started with FutureU
                  </h3>
                </div>
                
                <div className="text-center py-8">
                  <div className="mb-4">
                    <motion.div className="w-16 h-16 bg-gradient-to-r from-[#1D63A1] to-[#FFB71B] rounded-full flex items-center justify-center mx-auto mb-4" initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
                      <Target className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                  <h4 className="text-lg font-semibold text-[#2B3E4E] mb-3">
                    Please take the assessment first
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Complete the "Discover the FutureU" assessment to unlock your personalized insights, 
                    career recommendations, and academic pathways.
                  </p>
                  <button 
                    onClick={() => navigateAndScrollToTop('/take-assessment/1')}
                    className="bg-gradient-to-r from-[#1D63A1] to-[#2B3E4E] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center mx-auto"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Take Assessment Now
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div variants={itemFade} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden w-full text-left">
                {/* Header bar */}
                <div className="flex items-center justify-between bg-amber-50 px-6 py-3 border-b border-amber-100">
                  <h3 className="text-xl font-bold text-[#2B3E4E] flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-[#FFB71B]" />
                    Your Assessment Overview
                  </h3>
                  <button 
                    onClick={handleViewResults}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-blue-200 text-[#1D63A1] bg-white hover:bg-blue-50"
                  >
                    View Full Report
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Assessment Sections */}
                {latestAssessmentResult && (
                  <motion.div className="p-6 space-y-6" variants={staggerContainer}>
                    {/* Row 1: Aptitude Score and RIASEC Personality Profile (2 columns) */}
                    <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={staggerContainer}>
                      {/* Aptitude Score Section */}
                      <motion.div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100" variants={itemFade}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                              <Trophy className="w-8 h-8" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-[#2B3E4E] mb-1">Aptitude Score</h4>
                              <p className="text-sm text-gray-600">Your overall academic ability assessment</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                              {latestAssessmentResult.overallScore ? `${latestAssessmentResult.overallScore.toFixed(1)}%` : 'N/A'}
                            </div>
                            <div className="text-base font-bold text-red-600 mt-2">
                              {latestAssessmentResult.overallScore >= 80 ? 'Excellent' : 
                               latestAssessmentResult.overallScore >= 60 ? 'Good' : 
                               latestAssessmentResult.overallScore >= 40 ? 'Average' : 'Needs Improvement'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Score Explanation */}
                        <div className="mt-4 p-4 bg-white/70 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-[#2B3E4E] mb-2">What does this score mean?</h5>
                          <div className="text-sm text-gray-700 text-justify leading-relaxed">
                            {(() => {
                              const score = latestAssessmentResult.overallScore || 0;
                              if (score >= 80) {
                                return (
                                  <p>
                                    You demonstrate strong academic abilities across multiple areas. 
                                    Your high aptitude suggests you're well-prepared for challenging academic programs and have the potential 
                                    to excel in rigorous educational environments. Consider exploring advanced or specialized programs that 
                                    match your interests.
                                  </p>
                                );
                              } else if (score >= 60) {
                                return (
                                  <p>
                                    You show solid academic capabilities 
                                    with room for growth. Your aptitude indicates you can handle most academic challenges effectively. 
                                    Focus on areas where you can strengthen your skills while building on your existing strengths 
                                    to reach your full potential.
                                  </p>
                                );
                              } else if (score >= 40) {
                                return (
                                  <p>
                                    You demonstrate baseline academic 
                                    abilities with significant potential for improvement. Consider focusing on developing foundational skills 
                                    and seeking additional support in areas that challenge you. With dedicated effort and the right resources, 
                                    you can substantially improve your academic performance.
                                  </p>
                                );
                              } else {
                                return (
                                  <p>
                                    Your current performance suggests 
                                    you may benefit from additional academic support and focused skill development. Don't be discouraged - 
                                    everyone learns at their own pace. Consider working with educators, tutors, or counselors to identify 
                                    specific areas for growth and develop a personalized learning plan.
                                  </p>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      </motion.div>

                      {/* RIASEC Personality Profile Section */}
                      <motion.div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100" variants={itemFade}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white flex items-center justify-center">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-[#2B3E4E]">RIASEC Personality Profile</h4>
                            <p className="text-sm text-gray-600">Your top personality matches</p>
                          </div>
                        </div>
                        
                        {/* RIASEC Images Display */}
                        <motion.div className="grid grid-cols-3 gap-3 mt-4" variants={staggerContainer}>
                          {(() => {
                            const riasecTypes = [
                              { key: 'realisticScore', name: 'Realistic', image: 'Realistic.png', score: latestAssessmentResult.realisticScore },
                              { key: 'investigativeScore', name: 'Investigative', image: 'Investigative.png', score: latestAssessmentResult.investigativeScore },
                              { key: 'artisticScore', name: 'Artistic', image: 'Artistic.png', score: latestAssessmentResult.artisticScore },
                              { key: 'socialScore', name: 'Social', image: 'Social.png', score: latestAssessmentResult.socialScore },
                              { key: 'enterprisingScore', name: 'Enterprising', image: 'Enterprising.png', score: latestAssessmentResult.enterprisingScore },
                              { key: 'conventionalScore', name: 'Conventional', image: 'Conventional.png', score: latestAssessmentResult.conventionalScore }
                            ];
                            
                            // Sort by score and take top 3
                            const topTypes = riasecTypes.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3);
                            
                            return topTypes.map((type, index) => (
                              <motion.div key={type.key} className="relative group" variants={itemFade}>
                                {/* Top Match Badge - positioned outside the main content area */}
                                {index === 0 && (
                                  <div className="absolute -top-2 -right-2 bg-[#FFB71B] text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
                                    Top Match
                                  </div>
                                )}
                                
                                {/* Content */}
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-[#FFB71B]/20 hover:shadow-lg transition-all duration-300">
                                  <div className="flex flex-col items-center text-center">
                                    <img 
                                      src={`/src/assets/characters/${type.image}`} 
                                      alt={type.name}
                                      className="w-28 h-28 object-contain mb-3 group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <h5 className="font-semibold text-[#2B3E4E] text-sm mb-1">{type.name}</h5>
                                    <div className="text-sm text-[#FFB71B] font-bold">
                                      {type.score ? `${type.score.toFixed(1)}%` : 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ));
                          })()}
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    {/* Row 2: Career Pathways & Sample Careers (Full Width) */}
                    <motion.div className="grid grid-cols-1 gap-6" variants={staggerContainer}>
                      <motion.div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100" variants={itemFade}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center">
                              <Target className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-[#2B3E4E] mb-1">Career Pathways & Sample Careers</h4>
                              <p className="text-sm text-gray-600">Recommended career directions and specific job examples</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                              Coming Soon
                            </div>
                          </div>
                        </div>
                        <div className="text-center py-8 bg-white/50 rounded-lg border-2 border-dashed border-green-200">
                          <div className="text-gray-400 mb-2">
                            <Compass className="w-8 h-8 mx-auto" />
                          </div>
                          <p className="text-gray-500 text-sm">Career pathway and sample career recommendations will be available soon</p>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Row 3: Academic Programs (Full Width) */}
                    <motion.div className="grid grid-cols-1 gap-6" variants={staggerContainer}>
                      <motion.div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100" variants={itemFade}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white flex items-center justify-center">
                              <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-[#2B3E4E] mb-1">Academic Programs</h4>
                              <p className="text-sm text-gray-600">Recommended degree programs and courses based on your profile</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                              Coming Soon
                            </div>
                          </div>
                        </div>
                        <div className="text-center py-8 bg-white/50 rounded-lg border-2 border-dashed border-amber-200">
                          <div className="text-gray-400 mb-2">
                            <GraduationCap className="w-8 h-8 mx-auto" />
                          </div>
                          <p className="text-gray-500 text-sm">Academic program recommendations will be available soon</p>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Feature 5: Exploration Tools Quick Access */}
            <motion.div variants={itemFade} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#2B3E4E] flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-[#2B3E4E]" />
                  Exploration Tools
                </h3>
              </div>
              
              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5" variants={staggerContainer}>
                {studentData.explorationTools.map((tool, index) => (
                  <motion.div
                    key={index}
                    variants={itemFade}
                    whileHover={{ y: -3, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                    whileTap={{ scale: 0.99 }}
                    className="bg-white border border-gray-200 rounded-2xl px-6 py-5 cursor-pointer transition-all"
                    onClick={tool.action}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-left">
                        <div className={`w-12 h-12 mr-4 rounded-xl bg-gradient-to-r ${tool.color} text-white flex items-center justify-center`}>
                          {tool.icon}
                        </div>
                        <div className="text-left">
                          <div className="text-base font-semibold text-[#2B3E4E]">{tool.title}</div>
                          <div className="text-sm text-gray-600">{tool.desc}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Quick Stats */}
              <motion.div className="mt-6 grid grid-cols-3 gap-4" variants={staggerContainer}>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <motion.div className="text-lg font-bold text-[#1D63A1]" variants={scaleIn}>
                    {statsData.loading ? '...' : `${statsData.programs}`}
                  </motion.div>
                  <div className="text-xs text-gray-600">Programs</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <motion.div className="text-lg font-bold text-purple-600" variants={scaleIn}>
                    {statsData.loading ? '...' : `${statsData.schools}`}
                  </motion.div>
                  <div className="text-xs text-gray-600">Universities</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <motion.div className="text-lg font-bold text-green-600" variants={scaleIn}>
                    {statsData.loading ? '...' : `${statsData.careers}`}
                  </motion.div>
                  <div className="text-xs text-gray-600">Careers</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* (Optional sidebar area removed to allow full-width cards) */}
        </div>
        </motion.div>
      </main>
      </>
      )}
    </div>
  );
};

export default StudentHomepage;