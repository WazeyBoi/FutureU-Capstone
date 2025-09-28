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
          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-[#1D63A1] to-[#2B3E4E] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full transform translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full transform -translate-x-24 translate-y-24"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col justify-between items-start">
                <div className="flex-1">
                  {/* Discover FutureU Header */}
                  <div className="flex items-center mb-3">
                    <Navigation className="w-6 h-6 mr-2 text-[#FFB71B]" />
                    <span className="text-[#FFB71B] font-semibold text-sm">Your Path to Purpose</span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    {getGreeting()}, {currentUser?.firstName || 'Future Leader'}! 👋
                  </h1>
                  
                  {/* Assessment Status */}
                  {!hasCompletedAssessment ? (
                    <div className="bg-white/15 rounded-lg p-4 mb-4 backdrop-blur-sm">
                      <div className="flex items-center mb-2">
                        <BookOpen className="w-5 h-5 mr-2 text-[#FFB71B]" />
                        <span className="font-semibold text-sm">Ready to Discover Your Future?</span>
                      </div>
                      <div className="text-sm text-blue-100 mb-3">
                        Take our comprehensive "Discover the FutureU" assessment to unlock your potential
                      </div>
                      <button 
                        onClick={() => navigate('/take-assessment/1')}
                        className="bg-[#FFB71B] text-[#2B3E4E] text-sm font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
                      >
                        🚀 Take Assessment Now
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white/15 rounded-lg p-4 mb-4 backdrop-blur-sm">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 mr-2 text-[#FFB71B]" />
                        <span className="font-semibold text-sm">Assessment Completed!</span>
                      </div>
                      <div className="text-sm text-blue-100 mb-3">
                        Great job! You've completed the FutureU assessment. View your results below.
                      </div>
                      <button 
                        onClick={handleViewResults}
                        className="bg-[#FFB71B] text-[#2B3E4E] text-sm font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
                      >
                        📊 View My Results
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center text-blue-200 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2B3E4E] flex items-center">
              <Zap className="w-6 h-6 mr-2 text-[#FFB71B]" />
              Your Next Actions
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Personalized for you
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 relative ${
                  action.priority ? 'ring-2 ring-[#FFB71B] ring-opacity-50' : ''
                } ${!action.enabled && action.enabled !== undefined ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={action.enabled !== false ? action.action : undefined}
              >
                {action.priority && (
                  <div className="absolute -top-2 -right-2 bg-[#FFB71B] text-white text-xs font-bold px-2 py-1 rounded-full">
                    Priority
                  </div>
                )}
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 text-white`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-[#2B3E4E] mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{action.desc}</p>
                <div className="flex items-center text-[#1D63A1] text-sm font-medium">
                  {action.enabled !== false ? 'Get Started' : 'Complete Assessments'} 
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#2B3E4E] flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-[#1D63A1]" />
                    Your Assessment Overview
                  </h3>
                  <button 
                    onClick={handleViewResults}
                    className="text-[#1D63A1] text-sm font-medium hover:underline"
                  >
                    View Full Report
                  </button>
                </div>
                
                {/* Assessment Sections */}
                {latestAssessmentResult && (
                  <div className="space-y-4">
                    {/* GSA Overview */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-[#2B3E4E] mb-2 flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-blue-600" />
                        General Scholastic Ability (GSA)
                      </h4>
                      <div className="text-sm text-gray-600">
                        Overall Score: <span className="font-bold text-blue-600">{latestAssessmentResult.overallScore || 'N/A'}</span>
                      </div>
                    </div>

                    {/* RIASEC Personality */}
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-[#2B3E4E] mb-2 flex items-center">
                        <User className="w-4 h-4 mr-2 text-purple-600" />
                        RIASEC Personality Profile
                      </h4>
                      <div className="text-sm text-gray-600">
                        Personality Type: <span className="font-bold text-purple-600">{latestAssessmentResult.riasecCode || 'View Results'}</span>
                      </div>
                    </div>

                    {/* Career Options */}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-[#2B3E4E] mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-green-600" />
                        Career Options
                      </h4>
                      <div className="text-sm text-gray-600">
                        Top matches available in your detailed results
                      </div>
                    </div>

                    {/* Program Options */}
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-[#2B3E4E] mb-2 flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2 text-orange-600" />
                        Program Options
                      </h4>
                      <div className="text-sm text-gray-600">
                        Recommended academic programs based on your assessment
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
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#2B3E4E] flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-[#1D63A1]" />
                  Exploration Tools
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Discover More
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentData.explorationTools.map((tool, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                    onClick={tool.action}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 bg-gradient-to-r ${tool.color} rounded-lg mr-3 text-white`}>
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-[#2B3E4E]">{tool.title}</div>
                        <div className="text-xs text-gray-600">{tool.desc}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
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

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Keep only Exploration Tools in sidebar for now */}
          </div>
        </div>
      </main>
      </>
      )}
    </div>
  );
};

export default StudentHomepage;