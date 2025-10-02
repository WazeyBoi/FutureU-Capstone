import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import userAssessmentService from '../../services/userAssessmentService';
import assessmentTakingService from '../../services/assessmentTakingService';
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

  const getCurrentUserId = () => {
    return authService.getCurrentUserId() || 1; // Fallback to 1 during development
  };

  // Mock data - replace with real API calls
  const [studentData, setStudentData] = useState({
    // Feature 5: Exploration Tools
    explorationTools: [
      { 
        title: "Virtual Campus Tours", 
        desc: "Explore university campuses from home",
        icon: <Video className="w-5 h-5" />,
        action: () => navigate('/virtual-campus-tours'),
        color: "from-green-500 to-green-600"
      },
      { 
        title: "Industry Insights", 
        desc: "Real-world career information",
        icon: <Globe className="w-5 h-5" />,
        action: () => navigate('/career-pathways'),
        color: "from-blue-500 to-blue-600"
      },
      { 
        title: "Career Deep Dives", 
        desc: "Detailed exploration of careers",
        icon: <Eye className="w-5 h-5" />,
        action: () => navigate('/career-pathways'),
        color: "from-purple-500 to-purple-600"
      },
      { 
        title: "Resource Library", 
        desc: "Articles, videos, and guides",
        icon: <FileText className="w-5 h-5" />,
        action: () => navigate('/academic-explorer'),
        color: "from-orange-500 to-orange-600"
      }
    ]
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    // Fetch assessment data
    const fetchAssessmentData = async () => {
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
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setLoading(false);
      }
    };
    
    fetchAssessmentData();
    
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
      navigate(`/assessment-results/${latest.userQuizAssessment}`);
    }
  };

  const quickActions = [
    {
      title: hasCompletedAssessment ? "Take Assessment Again" : "Take Assessment",
      desc: "Discover the FutureU - Take our comprehensive assessment",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      action: () => navigate('/take-assessment/1'), // Assessment ID 1 for "Discover the FutureU"
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
      action: () => navigate('/career-pathways')
    },
    {
      title: "Find Programs",
      desc: "Connect to your educational journey",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      action: () => navigate('/academic-explorer')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D63A1] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Full-width hero */}
          <section className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative overflow-hidden bg-[radial-gradient(1200px_600px_at_100%_-20%,#2B3E4E_0%,#1D3A53_45%,#1B3348_70%,#1B3448_100%)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-24 text-white text-left">
                  {/* Eyebrow label */}
                  <div className="flex items-center mb-4">
                    <Navigation className="w-5 h-5 mr-2 text-[#FFB71B]" />
                    <span className="text-[#FFB71B] font-semibold text-sm">Your Path to Purpose</span>
                  </div>
                  {/* Greeting */}
                  <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">
                    {getGreeting()}, {currentUser?.firstName || 'Future Leader'}!
                  </h1>
                  {/* Status card (glassy) */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 md:p-6 mb-6 text-left max-w-5xl">
                    {!hasCompletedAssessment ? (
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFB71B] text-[#2B3E4E] mr-4">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">Ready to Discover Your Future?</div>
                          <div className="text-sm text-blue-100/90 mb-4">Take our comprehensive "Discover the FutureU" assessment to unlock your potential.</div>
                          <button
                            onClick={() => navigate('/take-assessment/1')}
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
                  </div>
                  {/* Date row */}
                  <div className="flex items-center text-blue-100/80 text-sm mt-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2B3E4E] flex items-center">
              <Zap className="w-6 h-6 mr-2 text-[#FFB71B]" />
              Your Next Actions
            </h2>
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Personalized for you
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -3, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                whileTap={{ scale: 0.99 }}
                className={`bg-white rounded-2xl p-7 shadow-sm transition-all cursor-pointer border border-gray-100 relative text-left ${
                  action.priority ? 'ring-2 ring-[#FFB71B] ring-opacity-50' : ''
                } ${!action.enabled && action.enabled !== undefined ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={action.enabled !== false ? action.action : undefined}
              >
                {action.priority && (
                  <div className="absolute -top-2 -right-2 bg-[#FFB71B] text-white text-xs font-bold px-2 py-1 rounded-full">
                    Priority
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#2B3E4E] text-[#FFB71B]">
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#2B3E4E] mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{action.desc}</p>
                <div className="flex items-center text-[#1D63A1] text-sm font-semibold">
                  {action.enabled !== false ? 'Get Started' : 'Complete Assessments'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Sections - full width */}
        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Assessment Results Overview or Prompt */}
            {!hasCompletedAssessment ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-center mb-6">
                  <h3 className="text-xl font-bold text-[#2B3E4E] flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-[#1D63A1]" />
                    Get Started with FutureU
                  </h3>
                </div>
                
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#1D63A1] to-[#FFB71B] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-[#2B3E4E] mb-3">
                    Please take the assessment first
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Complete the "Discover the FutureU" assessment to unlock your personalized insights, 
                    career recommendations, and academic pathways.
                  </p>
                  <button 
                    onClick={() => navigate('/take-assessment/1')}
                    className="bg-gradient-to-r from-[#1D63A1] to-[#2B3E4E] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center mx-auto"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Take Assessment Now
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden w-full text-left"
              >
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
                  <div className="space-y-4 p-6">
                    {/* GSA Overview */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-[#2B3E4E]">General Scholastic Ability (GSA)</div>
                        <div className="text-sm text-gray-600">Overall Score: <span className="font-bold text-blue-600">{latestAssessmentResult.overallScore || 'N/A'}</span></div>
                      </div>
                    </div>

                    {/* RIASEC Personality */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-50">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-[#2B3E4E]">RIASEC Personality Profile</div>
                        <div className="text-sm text-gray-600">View Results</div>
                      </div>
                    </div>

                    {/* Career Options */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50">
                      <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-[#2B3E4E]">Career Options</div>
                        <div className="text-sm text-gray-600">Top matches available in your detailed results</div>
                      </div>
                    </div>

                    {/* Program Options */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-[#2B3E4E]">Program Options</div>
                        <div className="text-sm text-gray-600">Recommended academic programs based on your assessment</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Feature 5: Exploration Tools Quick Access */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#2B3E4E] flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-[#2B3E4E]" />
                  Exploration Tools
                </h3>
                <button
                  onClick={() => navigate('/academic-explorer')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-blue-200 text-[#1D63A1] bg-white hover:bg-blue-50"
                >
                  Discover More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {studentData.explorationTools.map((tool, index) => (
                  <motion.div
                    key={index}
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
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-[#1D63A1]">50+</div>
                  <div className="text-xs text-gray-600">Universities</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">200+</div>
                  <div className="text-xs text-gray-600">Careers</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">1000+</div>
                  <div className="text-xs text-gray-600">Resources</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* (Optional sidebar area removed to allow full-width cards) */}
        </div>
      </main>
      </>
      )}
    </div>
  );
};

export default StudentHomepage;