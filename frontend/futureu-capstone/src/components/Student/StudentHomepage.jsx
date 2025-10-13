import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import userAssessmentService from "../../services/userAssessmentService";
import assessmentTakingService from "../../services/assessmentTakingService";
import programService from "../../services/programService";
import schoolService from "../../services/schoolService";
import careerService from "../../services/careerService";
import * as recommendationService from "../../services/recommendationService";
// Add Career Interest Profile imports
import { useCareerInterestProfile } from "../../hooks/useCareerInterestProfile";
import CareerInterestProfileWizard from "../CareerInterestProfile/CareerInterestProfileWizard";
import ProfilePrompt from "../CareerInterestProfile/ProfilePrompt";
// Import mascot
import raiseHandMascot from "../../assets/characters/raiseHand.svg";
import {
  BookOpen,
  User,
  BarChart3,
  Target,
  Calendar,
  Bell,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  Star,
  Play,
  Users,
  MessageSquare,
  Search,
  Menu,
  X,
  GraduationCap,
  Briefcase,
  Heart,
  Settings,
  Compass,
  Navigation,
  CheckCircle,
  Circle,
  AlertCircle,
  ArrowRight,
  Zap,
  Map,
  Brain,
  Trophy,
  Lightbulb,
  TrendingDown,
  Globe,
  Eye,
  Video,
  FileText,
  UserCheck,
  MessageCircle,
  Bookmark,
  Share2,
  Building,
  MapPin,
  Phone,
} from "lucide-react";

// Animation variants (subtle/professional)
const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemFade = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
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
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [statsData, setStatsData] = useState({
    programs: 0,
    schools: 0,
    careers: 0,
    loading: true,
  });

  // Add Career Interest Profile states
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const {
    hasProfile,
    loading: profileLoading,
    refreshProfile,
  } = useCareerInterestProfile();

  // Take Assessment Confirmation
  const [showTakeAssessmentConfirmation, setShowTakeAssessmentConfirmation] =
    useState(false);

  const getCurrentUserId = () => {
    return authService.getCurrentUserId() || 1;
  };

  // Helper function to navigate and scroll to top
  const navigateAndScrollToTop = (path) => {
    navigate(path);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  // Career Interest Profile handlers
  const handleProfileComplete = () => {
    setShowProfileWizard(false);
    setShowProfilePrompt(false);
    refreshProfile();
  };

  const handleProfileSkip = () => {
    setShowProfileWizard(false);
    setShowProfilePrompt(false);
  };

  const handleSetupNow = () => {
    setShowProfilePrompt(false);
    setShowProfileWizard(true);
  };

  const handleSetupLater = () => {
    setShowProfilePrompt(false);
  };

  // Take Assessment Confirmation handlers
  const handleTakeAssessmentClick = () => {
    setShowTakeAssessmentConfirmation(true);
  };

  const handleConfirmTakeAssessment = () => {
    setShowTakeAssessmentConfirmation(false);
    navigateAndScrollToTop("/take-assessment/1");
  };

  const handleCancelTakeAssessment = () => {
    setShowTakeAssessmentConfirmation(false);
  };

  // Session-based profile prompt logic (same as landing page)
  useEffect(() => {
    if (currentUser && !profileLoading && hasProfile === false) {
      // Create session-specific key for this user
      const sessionKey = `futureu_profile_prompt_shown_${currentUser.userId}`;
      const promptShown = sessionStorage.getItem(sessionKey);

      // Only show prompt if it hasn't been shown this session
      if (!promptShown) {
        const timer = setTimeout(() => {
          setShowProfilePrompt(true);
          // Mark prompt as shown for this session
          sessionStorage.setItem(sessionKey, "true");
        }, 3000); // Show after 3 seconds

        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, hasProfile, profileLoading]);

  // Mock data - replace with real API calls
  const [studentData, setStudentData] = useState({
    // Feature 5: Exploration Tools
    explorationTools: [
      {
        title: "Academic Exploration",
        desc: "Search for a program and find the schools that offer it",
        icon: <BookOpen className="w-5 h-5" />,
        action: () => navigateAndScrollToTop("/academic-explorer"),
        color: "from-blue-500 to-blue-600",
      },
      {
        title: "Programs Accreditation",
        desc: "View programs' accreditation level in every school",
        icon: <Award className="w-5 h-5" />,
        action: () => navigateAndScrollToTop("/accreditation"),
        color: "from-green-500 to-green-600",
      },
      {
        title: "Virtual Campus Tours",
        desc: "Explore universities from home",
        icon: <Video className="w-5 h-5" />,
        action: () => navigateAndScrollToTop("/virtual-campus-tours"),
        color: "from-purple-500 to-purple-600",
      },
      {
        title: "Testimonials",
        desc: "View students, alumni, or educators testimonies towards their school",
        icon: <MessageSquare className="w-5 h-5" />,
        action: () => navigateAndScrollToTop("/testimonials"),
        color: "from-orange-500 to-orange-600",
      },
      {
        title: "Career Deep Dives",
        desc: "View detailed information of different careers",
        icon: <Briefcase className="w-5 h-5" />,
        action: () => navigateAndScrollToTop("/career-pathways"),
        color: "from-indigo-500 to-indigo-600",
      },
    ],
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
        const completed = await userAssessmentService.getCompletedAssessments(
          userId
        );
        setCompletedAssessments(completed);
        setHasCompletedAssessment(completed.length > 0);

        // Fetch in-progress assessments
        const inProgress =
          await assessmentTakingService.getInProgressAssessments(userId);
        const validInProgressAssessments = inProgress.filter(
          (assessment) => assessment.user.userId === userId
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
              const resultData =
                await userAssessmentService.getAssessmentResults(
                  latest.userQuizAssessment
                );
              setLatestAssessmentResult(resultData.assessmentResult);
            } catch (err) {
              console.error("Error fetching assessment results:", err);
            }
          }

          // Fetch recommendations data if assessment is completed
          try {
            const recommendationsResponse = await recommendationService.fetchRecommendations(
              latest.userQuizAssessment
            );
            setRecommendationsData(recommendationsResponse.data);
          } catch (err) {
            console.error("Error fetching recommendations:", err);
            // Don't show error to user, recommendations are optional for homepage
          }
        }

        // Fetch stats data for quick stats section
        try {
          const [programsData, schoolsData, careersData] = await Promise.all([
            programService.getAllPrograms().catch(() => []),
            schoolService.getAllSchools().catch(() => []),
            careerService.getAllCareers().catch(() => []),
          ]);

          setStatsData({
            programs: Array.isArray(programsData) ? programsData.length : 0,
            schools: Array.isArray(schoolsData) ? schoolsData.length : 0,
            careers: Array.isArray(careersData) ? careersData.length : 0,
            loading: false,
          });
        } catch (error) {
          console.error("Error fetching stats data:", error);
          setStatsData((prev) => ({ ...prev, loading: false }));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching assessment data:", error);
        setLoading(false);
        setStatsData((prev) => ({ ...prev, loading: false }));
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
      navigateAndScrollToTop(
        `/assessment-results/${latest.userQuizAssessment}`
      );
    }
  };

  const handleViewRecommendations = () => {
    if (completedAssessments.length > 0) {
      const latest = completedAssessments[completedAssessments.length - 1];
      navigateAndScrollToTop(
        `/assessment-results/${latest.userQuizAssessment}?tab=recommendations`
      );
    }
  };

  const quickActions = [
    {
      title: hasCompletedAssessment
        ? "Take Assessment Again"
        : "Take Assessment",
      desc: "Discover the FutureU - Take our comprehensive assessment",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      action: handleTakeAssessmentClick,
      priority: !hasCompletedAssessment,
    },
    {
      title: "View My Results",
      desc: "See your assessment results and insights",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      action: handleViewResults,
      enabled: hasCompletedAssessment,
    },
    {
      title: "Explore Careers",
      desc: "Find purpose-aligned career paths",
      icon: <Target className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      action: () => navigateAndScrollToTop("/career-pathways"),
    },
    {
      title: "Find Programs",
      desc: "Connect to your educational journey",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      action: () => navigateAndScrollToTop("/academic-explorer"),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Career Interest Profile Wizard */}
      <AnimatePresence>
        {showProfileWizard && (
          <CareerInterestProfileWizard
            onComplete={handleProfileComplete}
            onSkip={handleProfileSkip}
          />
        )}
      </AnimatePresence>

      {/* Profile Setup Prompt */}
      <AnimatePresence>
        {showProfilePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <ProfilePrompt
                onSetupNow={handleSetupNow}
                onSetupLater={handleSetupLater}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen h-full">
          <div>
            <img
              src="/src/assets/characters/quirky.svg"
              alt="FutureU mascot"
              className="quirky-bounce h-50 mx-auto"
            />
          </div>
          <p className="text-lg font-bold text-gray-600">
            Loading your dashboard...
          </p>
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
              <div className="relative px-8 overflow-hidden bg-[radial-gradient(1200px_600px_at_100%_-20%,#2B3E4E_0%,#1D3A53_45%,#1B3348_70%,#1B3448_100%)]">
                <div className="w-full px-6 py-14 md:py-20 lg:py-24 text-white text-left">
                  {/* Eyebrow label */}
                  <motion.div
                    className="flex items-center mb-4"
                    variants={itemFade}
                  >
                    <Navigation className="w-5 h-5 mr-2 text-[#FFB71B]" />
                    <span className="text-[#FFB71B] font-semibold text-sm">
                      Your Path to Purpose
                    </span>
                  </motion.div>
                  {/* Greeting */}
                  <motion.h1
                    className="text-5xl md:text-6xl font-bold mb-8 leading-tight tracking-tight"
                    variants={itemFade}
                  >
                    {getGreeting()}, {currentUser?.firstName || "Future Leader"}
                    !
                  </motion.h1>
                  {/* Status card (glassy) */}
                  <motion.div
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 md:p-6 mb-6 text-left max-w-5xl"
                    variants={scaleIn}
                  >
                    {!hasCompletedAssessment ? (
                      <div className="flex items-center">
                        {/* <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFB71B] text-[#2B3E4E] mr-4">
                          <BookOpen className="w-5 h-5" />
                        </div> */}
                        <div className="flex-1">
                          <div className="font-semibold mb-1">
                            Ready to Discover Your Future?
                          </div>
                          <div className="text-sm text-blue-100/90 mb-4">
                            Take our comprehensive "Discover the FutureU"
                            assessment to unlock your potential.
                          </div>
                          <button
                            onClick={handleTakeAssessmentClick}
                            className="cursor-pointer inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg border border-white/30 text-white/90 hover:bg-white/10 transition-colors"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Take Assessment Now
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {/* <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFB71B] text-[#2B3E4E] mr-4">
                          <CheckCircle className="w-5 h-5" />
                        </div> */}
                        <div className="flex-1">
                          <div className="font-semibold mb-1">
                            Assessment Completed!
                          </div>
                          <div className="text-sm text-blue-100/90 mb-4">
                            Great job! You've completed the FutureU assessment.
                            View your results below.
                          </div>
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

                  {/* Profile Status Badge - Similar to Landing Page */}
                  {!profileLoading && hasProfile === false && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4"
                    ></motion.div>
                  )}

                  {/* Profile Complete Badge */}
                  {!profileLoading && hasProfile === true && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4"
                    ></motion.div>
                  )}

                  {/* Date row */}
                  <motion.div
                    className="flex items-center text-blue-100/80 text-sm mt-4"
                    variants={itemFade}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Main Content */}
          <main className="max-w-full mx-auto pt-6">
            {/* Dashboard Sections - expanded width */}
            <motion.div
              className="w-full"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              <div className="px-grid grid-cols-1 gap-8">
                {/* Main Content */}
                <div className="space-y-8">
                  {/* Assessment Results Overview or Prompt */}
                  {!hasCompletedAssessment ? (
                    <motion.div
                      variants={itemFade}
                      className="bg-white rounded-xl px-8 py-6"
                    >
                      <div className="flex items-center justify-center mb-3">
                        <h3 className="text-3xl font-bold text-[#2B3E4E] flex items-center">
                          {/* <BookOpen className="w-8 h-8 mr-2 text-[#FFB71B]" /> */}
                          Get Started with FutureU
                        </h3>
                      </div>

                      <div className="text-center">
                        <div className="mb-3">
                          {/* <motion.div
                            className="w-16 h-16 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] rounded-full flex items-center justify-center mx-auto mb-4"
                            initial={{ scale: 0.95, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35 }}
                          >
                            <Target className="w-8 h-8 text-[#2B3E4E]" />
                          </motion.div> */}
                        </div>
                        <h4 className="text-lg font-semibold text-[#2B3E4E] mb-3">
                          Please take the assessment first
                        </h4>
                        <p className="text-gray-600 mb-9">
                          Complete the "Discover the FutureU" assessment to
                          <br/> unlock your personalized insights, career
                          <br/> recommendations, and academic pathways.
                        </p>
                        <button
                          onClick={handleTakeAssessmentClick}
                          className="bg-[#FFB71B] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#2B3E4E] transition-opacity flex items-center justify-center mx-auto"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Take Assessment Now
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={itemFade}
                      className="px-13 overflow-visible w-full text-left"
                    >
                      {/* Header bar */}
                      <div className="flex items-center justify-between py-3">
                        <h3 className="text-3xl font-bold text-[#2B3E4E] flex items-center">
                          {/* <Brain className="w-5 h-5 mr-2 text-[#FFB71B]" /> */}
                          Your Assessment Overview
                        </h3>
                        <button
                          onClick={handleViewResults}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-[#FFB71B] hover:bg-[#2B3E4E]"
                        >
                          View Full Report
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Assessment Sections */}
                      {latestAssessmentResult && (
                        <motion.div
                          className="py-6 space-y-6 overflow-visible"
                          variants={staggerContainer}
                        >
                          {/* Row 1: Aptitude Score and RIASEC Personality Profile (2 columns) */}
                          <motion.div
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                            variants={staggerContainer}
                          >
                            {/* Aptitude Score Section */}
                            <motion.div
                              className="bg-white rounded-xl p-6 shadow-[0_8px_24px_rgba(219,234,254,0.6)]"
                              variants={itemFade}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                                    <Trophy className="w-8 h-8" />
                                  </div>
                                  <div>
                                    <h4 className="text-xl font-bold text-[#2B3E4E] mb-1">
                                      Aptitude Score
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Your overall academic ability assessment
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-4xl font-bold text-blue-600 mb-2">
                                    {latestAssessmentResult.overallScore
                                      ? `${latestAssessmentResult.overallScore.toFixed(
                                          1
                                        )}%`
                                      : "N/A"}
                                  </div>
                                  <div className="text-base font-bold text-red-600 mt-2">
                                    {latestAssessmentResult.overallScore >= 80
                                      ? "Excellent"
                                      : latestAssessmentResult.overallScore >=
                                        60
                                      ? "Good"
                                      : latestAssessmentResult.overallScore >=
                                        40
                                      ? "Average"
                                      : "Needs Improvement"}
                                  </div>
                                </div>
                              </div>

                              {/* Score Explanation */}
                              <div className="mt-4 p-4 bg-white/70 rounded-xl shadow-inner">
                                <h5 className="font-semibold text-[#2B3E4E] mb-2">
                                  What does this score mean?
                                </h5>
                                <div className="text-sm text-gray-700 text-justify leading-relaxed">
                                  {(() => {
                                    const score =
                                      latestAssessmentResult.overallScore || 0;
                                    if (score >= 80) {
                                      return (
                                        <p>
                                          You demonstrate strong academic
                                          abilities across multiple areas. Your
                                          high aptitude suggests you're
                                          well-prepared for challenging academic
                                          programs and have the potential to
                                          excel in rigorous educational
                                          environments. Consider exploring
                                          advanced or specialized programs that
                                          match your interests.
                                        </p>
                                      );
                                    } else if (score >= 60) {
                                      return (
                                        <p>
                                          You show solid academic capabilities
                                          with room for growth. Your aptitude
                                          indicates you can handle most academic
                                          challenges effectively. Focus on areas
                                          where you can strengthen your skills
                                          while building on your existing
                                          strengths to reach your full
                                          potential.
                                        </p>
                                      );
                                    } else if (score >= 40) {
                                      return (
                                        <p>
                                          You demonstrate baseline academic
                                          abilities with significant potential
                                          for improvement. Consider focusing on
                                          developing foundational skills and
                                          seeking additional support in areas
                                          that challenge you. With dedicated
                                          effort and the right resources, you
                                          can substantially improve your
                                          academic performance.
                                        </p>
                                      );
                                    } else {
                                      return (
                                        <p>
                                          Your current performance suggests you
                                          may benefit from additional academic
                                          support and focused skill development.
                                          Don't be discouraged - everyone learns
                                          at their own pace. Consider working
                                          with educators, tutors, or counselors
                                          to identify specific areas for growth
                                          and develop a personalized learning
                                          plan.
                                        </p>
                                      );
                                    }
                                  })()}
                                </div>
                              </div>
                            </motion.div>

                            {/* RIASEC Personality Profile Section */}
                            <motion.div
                              className="bg-white rounded-xl p-6 shadow-[0_8px_24px_rgba(250,232,255,0.6)]"
                              variants={itemFade}
                            >
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white flex items-center justify-center">
                                  <User className="w-6 h-6" />
                                </div>
                                <div>
                                  <h4 className="text-xl font-bold text-[#2B3E4E]">
                                    RIASEC Personality Profile
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Your top personality matches
                                  </p>
                                </div>
                              </div>

                              {/* RIASEC Images Display */}
                              <motion.div
                                className="grid grid-cols-3 gap-3 mt-4"
                                variants={staggerContainer}
                              >
                                {(() => {
                                  const riasecTypes = [
                                    {
                                      key: "realisticScore",
                                      name: "Realistic",
                                      image: "Realistic.png",
                                      score:
                                        latestAssessmentResult.realisticScore,
                                    },
                                    {
                                      key: "investigativeScore",
                                      name: "Investigative",
                                      image: "Investigative.png",
                                      score:
                                        latestAssessmentResult.investigativeScore,
                                    },
                                    {
                                      key: "artisticScore",
                                      name: "Artistic",
                                      image: "Artistic.png",
                                      score:
                                        latestAssessmentResult.artisticScore,
                                    },
                                    {
                                      key: "socialScore",
                                      name: "Social",
                                      image: "Social.png",
                                      score: latestAssessmentResult.socialScore,
                                    },
                                    {
                                      key: "enterprisingScore",
                                      name: "Enterprising",
                                      image: "Enterprising.png",
                                      score:
                                        latestAssessmentResult.enterprisingScore,
                                    },
                                    {
                                      key: "conventionalScore",
                                      name: "Conventional",
                                      image: "Conventional.png",
                                      score:
                                        latestAssessmentResult.conventionalScore,
                                    },
                                  ];

                                  // Sort by score and take top 3
                                  const topTypes = riasecTypes
                                    .sort(
                                      (a, b) => (b.score || 0) - (a.score || 0)
                                    )
                                    .slice(0, 3);

                                  return topTypes.map((type, index) => (
                                    <motion.div
                                      key={type.key}
                                      className="relative group"
                                      variants={itemFade}
                                    >
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
                                          <h5 className="font-semibold text-[#2B3E4E] text-sm mb-1">
                                            {type.name}
                                          </h5>
                                          <div className="text-sm text-[#FFB71B] font-bold">
                                            {typeof type.score === "number" &&
                                            !Number.isNaN(type.score)
                                              ? `${(
                                                  (type.score / 40) *
                                                  100
                                                ).toFixed(1)}%`
                                              : "N/A"}
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
                          <motion.div
                            className="grid grid-cols-1 gap-6"
                            variants={staggerContainer}
                          >
                            <motion.div
                              className="bg-white rounded-xl p-6 shadow-xl"
                              variants={itemFade}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center">
                                    <Target className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <h4 className="text-xl font-bold text-[#2B3E4E] mb-1">
                                      Career Pathways & Top Careers
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Your recommended career directions based on assessment
                                    </p>
                                  </div>
                                </div>
                                {recommendationsData?.recommendations?.careerPaths && (
                                  <button
                                    onClick={handleViewRecommendations}
                                    className="cursor-pointer text-xs font-semibold text-[#2B3E4E] hover:text-[#FFB71B] transition-colors flex items-center gap-1"
                                  >
                                    View All
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              {recommendationsData?.recommendations?.careerPaths && 
                               recommendationsData.recommendations.careerPaths.length > 0 ? (
                                <div className="space-y-4">
                                  {recommendationsData.recommendations.careerPaths.slice(0, 3).map((pathway, index) => {
                                    // Get top 3 careers from this pathway
                                    const topCareers = pathway.careers?.slice(0, 3) || [];
                                    
                                    return (
                                      <motion.div
                                        key={pathway.careerPathId || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100"
                                      >
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white bg-green-600 px-2 py-1 rounded-lg">
                                              #{index + 1}
                                            </span>
                                            <h5 className="font-bold text-[#2B3E4E] text-base">
                                              {pathway.careerPathName}
                                            </h5>
                                          </div>
                                          <span className="text-sm font-bold text-green-600">
                                            {(pathway.matchPercentage || 0).toFixed(1)}% Match
                                          </span>
                                        </div>
                                        
                                        {topCareers.length > 0 && (
                                          <div className="mt-3 space-y-2">
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                              Top Careers in this Path:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                              {topCareers.map((career, careerIdx) => (
                                                <div
                                                  key={career.careerId || careerIdx}
                                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-green-200 text-sm"
                                                >
                                                  <Briefcase className="w-3 h-3 text-green-600" />
                                                  <span className="font-medium text-[#2B3E4E]">
                                                    {career.careerTitle}
                                                  </span>
                                                  <span className="text-xs text-green-600 font-semibold">
                                                    {(career.matchPercentage || 0).toFixed(1)}%
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-white/50 rounded-lg border-2 border-dashed border-green-200">
                                  <div className="text-gray-400 mb-2">
                                    <Compass className="w-8 h-8 mx-auto" />
                                  </div>
                                  <p className="text-gray-500 text-sm">
                                    Career recommendations will appear here after generating results
                                  </p>
                                  <button
                                    onClick={handleViewRecommendations}
                                    className="cursor-pointer mt-3 text-sm font-semibold text-[#2B3E4E] hover:text-[#FFB71B] transition-colors"
                                  >
                                    Go to Results Tab →
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          </motion.div>

                          {/* Row 3: Academic Programs (Full Width) */}
                          <motion.div
                            className="grid grid-cols-1 gap-6"
                            variants={staggerContainer}
                          >
                            <motion.div
                              className="bg-white rounded-xl p-6 shadow-xl"
                              variants={itemFade}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <h4 className="text-xl font-bold text-[#2B3E4E] mb-1">
                                      Academic Programs
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Recommended degree programs from your career pathways
                                    </p>
                                  </div>
                                </div>
                                {recommendationsData?.recommendations?.careerPaths && (
                                  <button
                                    onClick={handleViewRecommendations}
                                    className="cursor-pointer text-xs font-semibold text-[#2B3E4E] hover:text-[#FFB71B] transition-colors flex items-center gap-1"
                                  >
                                    View All
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              {recommendationsData?.recommendations?.careerPaths && 
                               recommendationsData.recommendations.careerPaths.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {(() => {
                                    // Collect all programs from all pathways
                                    const allPrograms = [];
                                    recommendationsData.recommendations.careerPaths.forEach((pathway) => {
                                      if (pathway.programs && Array.isArray(pathway.programs)) {
                                        pathway.programs.forEach((program) => {
                                          allPrograms.push({
                                            ...program,
                                            pathwayName: pathway.careerPathName,
                                            pathwayMatch: pathway.matchPercentage
                                          });
                                        });
                                      }
                                    });

                                    // Remove duplicates by programId and take top 4
                                    const uniquePrograms = allPrograms
                                      .filter((program, index, self) => 
                                        index === self.findIndex((p) => p.programId === program.programId)
                                      )
                                      .slice(0, 4);

                                    return uniquePrograms.map((program, index) => {
                                      const schoolCount = program.recommendedSchools?.length || 0;
                                      
                                      return (
                                        <motion.div
                                          key={program.programId || index}
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ delay: index * 0.1 }}
                                          className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 hover:border-amber-300 transition-all cursor-pointer"
                                          onClick={handleViewRecommendations}
                                        >
                                          <div className="flex items-start justify-between mb-2">
                                            <h5 className="font-bold text-[#2B3E4E] text-sm flex-1 pr-2">
                                              {program.programName}
                                            </h5>
                                            <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                          </div>
                                          
                                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                            {program.summary || 'Recommended based on your assessment profile'}
                                          </p>

                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs">
                                              <div className="flex items-center gap-1 text-amber-600">
                                                <Building className="w-3 h-3" />
                                                <span className="font-semibold">{schoolCount}</span>
                                                <span className="text-gray-500">
                                                  {schoolCount === 1 ? 'school' : 'schools'}
                                                </span>
                                              </div>
                                            </div>
                                            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                                              {program.pathwayName}
                                            </span>
                                          </div>
                                        </motion.div>
                                      );
                                    });
                                  })()}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-white/50 rounded-lg border-2 border-dashed border-amber-200">
                                  <div className="text-gray-400 mb-2">
                                    <GraduationCap className="w-8 h-8 mx-auto" />
                                  </div>
                                  <p className="text-gray-500 text-sm">
                                    Academic program recommendations will appear here after generating results
                                  </p>
                                  <button
                                    onClick={handleViewRecommendations}
                                    className="cursor-pointer mt-3 text-sm font-semibold text-[#2B3E4E] hover:text-[#FFB71B] transition-colors"
                                  >
                                    Go to Results Tab →
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Feature 5: Exploration Tools Quick Access */}
                  <motion.div 
                    variants={itemFade} 
                    className="text-left relative overflow-hidden bg-[radial-gradient(1200px_600px_at_100%_-20%,#2B3E4E_0%,#1D3A53_45%,#1B3348_70%,#1B3448_100%)] px-8"
                  >
                    {/* Section Header */}
                    <div className="flex mb-8 pt-10">
                      {/* <motion.div className="flex items-center mb-3" variants={itemFade}>
                        <Globe className="w-5 h-5 mr-2 text-[#FFB71B]" />
                        <span className="text-[#FFB71B] font-semibold text-sm"></span>
                      </motion.div> */}
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">
                          Exploration Tools
                        </h3>
                        <p className="text-white/70 text-sm">
                          Access comprehensive resources to guide your educational and career journey
                        </p>
                      </div>
                    </div>

                    {/* Exploration Tool Cards */}
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 mb-10"
                      variants={staggerContainer}
                    >
                      {studentData.explorationTools.map((tool, index) => (
                        <motion.div
                          key={index}
                          variants={itemFade}
                          whileHover={{
                            y: -5,
                            boxShadow: "0 12px 30px rgba(255,183,27,0.15)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#FFB71B]/50 rounded-2xl px-6 py-5 cursor-pointer transition-all group"
                          onClick={tool.action}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-left">
                              <div
                                className={`w-12 h-12 mr-4 rounded-xl bg-gradient-to-r ${tool.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                              >
                                {tool.icon}
                              </div>
                              <div className="text-left">
                                <div className="text-base font-bold text-white group-hover:text-[#FFB71B] transition-colors">
                                  {tool.title}
                                </div>
                                <div className="text-sm text-white/70">
                                  {tool.desc}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-[#FFB71B] group-hover:translate-x-1 transition-all" />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Quick Stats */}
                    {/* <motion.div
                      className="border border-white grid grid-cols-3 gap-6 mb-10"
                      variants={staggerContainer}
                    >
                      <motion.div 
                        className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/15 transition-all"
                        variants={itemFade}
                      >
                        <motion.div
                          className="text-2xl font-bold text-[#FFB71B] mb-1"
                          variants={scaleIn}
                        >
                          {statsData.loading ? "..." : `${statsData.programs}`}
                        </motion.div>
                        <div className="text-xs text-white/70 font-medium">Programs Available</div>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/15 transition-all"
                        variants={itemFade}
                      >
                        <motion.div
                          className="text-2xl font-bold text-[#FFB71B] mb-1"
                          variants={scaleIn}
                        >
                          {statsData.loading ? "..." : `${statsData.schools}`}
                        </motion.div>
                        <div className="text-xs text-white/70 font-medium">
                          Universities
                        </div>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/15 transition-all"
                        variants={itemFade}
                      >
                        <motion.div
                          className="text-2xl font-bold text-[#FFB71B] mb-1"
                          variants={scaleIn}
                        >
                          {statsData.loading ? "..." : `${statsData.careers}`}
                        </motion.div>
                        <div className="text-xs text-white/70 font-medium">Career Paths</div>
                      </motion.div>
                    </motion.div> */}
                  </motion.div>
                </div>

                {/* (Optional sidebar area removed to allow full-width cards) */}
              </div>
            </motion.div>
          </main>

          {/* Take Assessment Confirmation Modal */}
          <AnimatePresence>
            {showTakeAssessmentConfirmation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center pt-45"
                onClick={handleCancelTakeAssessment}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                  className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto px-6 pb-5 py-15 flex flex-col items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.img
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    src={raiseHandMascot}
                    alt="Raise hand mascot"
                    className="absolute -top-67 left-1/2 -translate-x-1/2 w-100 h-100 drop-shadow-xl z-50 pointer-events-none"
                    style={{ zIndex: 60 }}
                    draggable="false"
                  />

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="text-lg font-medium text-gray-900 mb-3"
                  >
                    Ready to Begin?
                  </motion.h3>

                  {/* Message */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="text-gray-600 mb-4 text-center"
                  >
                    You're about to start the comprehensive{" "}
                    <span className="font-semibold">Discover the FutureU</span>{" "}
                    assessment. This typically takes{" "}
                    <span className="font-semibold">60-90 minutes</span> to
                    complete and will help identify your career path and
                    interests.
                  </motion.p>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.3 }}
                    className="flex justify-end gap-3 w-full mt-5"
                  >
                    <button
                      onClick={handleCancelTakeAssessment}
                      className="cursor-pointer w-full px-4 py-2 text-sm font-medium text-white hover:text-white bg-[#2B3E4E] rounded-md hover:bg-[#FFB71B] focus:outline-none"
                    >
                      Not Yet
                    </button>
                    <button
                      onClick={handleConfirmTakeAssessment}
                      className="cursor-pointer w-full bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] text-white py-2 px-4 rounded-md font-bold shadow-md transition-all"
                    >
                      Yes, Start Assessment
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default StudentHomepage;