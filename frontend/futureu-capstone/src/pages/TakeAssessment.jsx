import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Need to install: npm install framer-motion
import assessmentTakingService from '../services/assessmentTakingService';
import assessmentService from '../services/assessmentService';
import AssessmentSection from '../components/assessment/AssessmentSection';
import SectionNavigator from '../components/assessment/SectionNavigator';

const TakeAssessment = () => {
  const { assessmentId = "1" } = useParams();
  const navigate = useNavigate();
  
  // Assessment data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState({});
  
  // User progress states
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestionIndices, setCurrentQuestionIndices] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [sectionCompletion, setSectionCompletion] = useState({});
  
  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [sectionList, setSectionList] = useState([]);
  
  // Timer logic
  useEffect(() => {
    let timer = null;
    
    if (assessment && assessment.endTime && !completed) {
      const endTime = new Date(assessment.endTime).getTime();
      
      const updateTime = () => {
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0 && !completed) {
          handleComplete();
        }
      };
      
      updateTime();
      timer = setInterval(updateTime, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [assessment, completed]);
  
  // Load assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        
        // Fetch the assessment details
        const assessmentData = await assessmentService.getAssessmentById(parseInt(assessmentId));
        setAssessment(assessmentData);
        
        // Fetch and organize questions
        const questionsData = await assessmentTakingService.loadAssessmentQuestions(parseInt(assessmentId));
        setQuestions(questionsData);
        
        // Setup section list and initial question indices
        const initialSections = [];
        const initialIndices = {};
        
        // GSA Sections
        if (questionsData.gsa.scientificAbility.length) {
          initialSections.push({
            id: 'gsa-scientific',
            title: 'Scientific Ability',
            description: 'Test your scientific knowledge and reasoning abilities',
            questions: questionsData.gsa.scientificAbility
          });
          initialIndices['gsa-scientific'] = 0;
        }
        
        if (questionsData.gsa.readingComprehension.length) {
          initialSections.push({
            id: 'gsa-reading',
            title: 'Reading Comprehension',
            description: 'Assess your ability to understand and interpret written materials',
            questions: questionsData.gsa.readingComprehension
          });
          initialIndices['gsa-reading'] = 0;
        }
        
        if (questionsData.gsa.verbalAbility.length) {
          initialSections.push({
            id: 'gsa-verbal',
            title: 'Verbal Ability',
            description: 'Evaluate your command of language and verbal reasoning',
            questions: questionsData.gsa.verbalAbility
          });
          initialIndices['gsa-verbal'] = 0;
        }
        
        if (questionsData.gsa.mathematicalAbility.length) {
          initialSections.push({
            id: 'gsa-math',
            title: 'Mathematical Ability',
            description: 'Test your mathematical skills and numerical reasoning',
            questions: questionsData.gsa.mathematicalAbility
          });
          initialIndices['gsa-math'] = 0;
        }
        
        if (questionsData.gsa.logicalReasoning.length) {
          initialSections.push({
            id: 'gsa-logical',
            title: 'Logical Reasoning',
            description: 'Assess your ability to analyze and solve logical problems',
            questions: questionsData.gsa.logicalReasoning
          });
          initialIndices['gsa-logical'] = 0;
        }
        
        // Academic Track Sections
        if (questionsData.academicTrack.stem.length) {
          initialSections.push({
            id: 'at-stem',
            title: 'STEM',
            description: 'Science, Technology, Engineering, and Mathematics aptitude assessment',
            questions: questionsData.academicTrack.stem
          });
          initialIndices['at-stem'] = 0;
        }
        
        if (questionsData.academicTrack.abm.length) {
          initialSections.push({
            id: 'at-abm',
            title: 'ABM',
            description: 'Accountancy, Business, and Management aptitude assessment',
            questions: questionsData.academicTrack.abm
          });
          initialIndices['at-abm'] = 0;
        }
        
        if (questionsData.academicTrack.humss.length) {
          initialSections.push({
            id: 'at-humss',
            title: 'HUMSS',
            description: 'Humanities and Social Sciences aptitude assessment',
            questions: questionsData.academicTrack.humss
          });
          initialIndices['at-humss'] = 0;
        }
        
        // Other Track Sections
        if (questionsData.otherTracks.techVoc.length) {
          initialSections.push({
            id: 'track-tech',
            title: 'Techno-Vocational Livelihood',
            description: 'Assess your aptitude for technical and vocational fields',
            questions: questionsData.otherTracks.techVoc
          });
          initialIndices['track-tech'] = 0;
        }
        
        if (questionsData.otherTracks.sports.length) {
          initialSections.push({
            id: 'track-sports',
            title: 'Sports Track',
            description: 'Evaluate your sports aptitude and interests',
            questions: questionsData.otherTracks.sports
          });
          initialIndices['track-sports'] = 0;
        }
        
        if (questionsData.otherTracks.artsDesign.length) {
          initialSections.push({
            id: 'track-arts',
            title: 'Arts & Design Track',
            description: 'Assess your creative abilities and artistic aptitude',
            questions: questionsData.otherTracks.artsDesign
          });
          initialIndices['track-arts'] = 0;
        }
        
        // Interest Areas Sections
        if (questionsData.interestAreas.realistic.length) {
          initialSections.push({
            id: 'interest-realistic',
            title: 'Realistic',
            description: 'Evaluate your interest in practical, hands-on activities',
            questions: questionsData.interestAreas.realistic
          });
          initialIndices['interest-realistic'] = 0;
        }
        
        if (questionsData.interestAreas.investigative.length) {
          initialSections.push({
            id: 'interest-investigative',
            title: 'Investigative',
            description: 'Assess your analytical and intellectual interests',
            questions: questionsData.interestAreas.investigative
          });
          initialIndices['interest-investigative'] = 0;
        }
        
        if (questionsData.interestAreas.artistic.length) {
          initialSections.push({
            id: 'interest-artistic',
            title: 'Artistic',
            description: 'Evaluate your creative and artistic interests',
            questions: questionsData.interestAreas.artistic
          });
          initialIndices['interest-artistic'] = 0;
        }
        
        if (questionsData.interestAreas.social.length) {
          initialSections.push({
            id: 'interest-social',
            title: 'Social',
            description: 'Assess your interest in helping and working with people',
            questions: questionsData.interestAreas.social
          });
          initialIndices['interest-social'] = 0;
        }
        
        if (questionsData.interestAreas.enterprising.length) {
          initialSections.push({
            id: 'interest-enterprising',
            title: 'Enterprising',
            description: 'Evaluate your leadership and persuasive abilities',
            questions: questionsData.interestAreas.enterprising
          });
          initialIndices['interest-enterprising'] = 0;
        }
        
        if (questionsData.interestAreas.conventional.length) {
          initialSections.push({
            id: 'interest-conventional',
            title: 'Conventional',
            description: 'Assess your interest in structured and organized activities',
            questions: questionsData.interestAreas.conventional
          });
          initialIndices['interest-conventional'] = 0;
        }
        
        setSectionList(initialSections);
        setCurrentQuestionIndices(initialIndices);
        
        // Initialize section completion rates
        const initialCompletion = {};
        initialSections.forEach(section => {
          initialCompletion[section.id] = 0;
        });
        setSectionCompletion(initialCompletion);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load assessment. Please try again later.');
        setLoading(false);
        console.error('Error loading assessment:', err);
      }
    };

    fetchAssessment();
  }, [assessmentId]);
  
  // Calculate overall progress
  const calculateProgress = useCallback(() => {
    if (!sectionList.length) return { completed: 0, total: 0 };
    
    let totalQuestions = 0;
    let completedQuestions = 0;
    
    sectionList.forEach(section => {
      if (!section.questions) return;
      
      totalQuestions += section.questions.length;
      
      section.questions.forEach(question => {
        if (userAnswers[question.questionId]) {
          completedQuestions++;
        }
      });
    });
    
    return { completed: completedQuestions, total: totalQuestions };
  }, [sectionList, userAnswers]);
  
  // Update section completion percentages
  useEffect(() => {
    const newCompletion = {};
    
    sectionList.forEach(section => {
      if (!section.questions.length) {
        newCompletion[section.id] = 100;
        return;
      }
      
      let answered = 0;
      section.questions.forEach(question => {
        if (userAnswers[question.questionId]) {
          answered++;
        }
      });
      
      newCompletion[section.id] = Math.round((answered / section.questions.length) * 100);
    });
    
    setSectionCompletion(newCompletion);
  }, [sectionList, userAnswers]);
  
  // Handle answer changes
  const handleAnswerChange = (questionId, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Navigation handlers
  const handlePrevious = () => {
    const currentSectionId = sectionList[currentSection].id;
    const currentIndex = currentQuestionIndices[currentSectionId];
    
    if (currentIndex > 0) {
      // Go to previous question in current section
      setCurrentQuestionIndices({
        ...currentQuestionIndices,
        [currentSectionId]: currentIndex - 1
      });
    } else if (currentSection > 0) {
      // Go to last question of previous section
      const prevSectionId = sectionList[currentSection - 1].id;
      const prevSectionLastIndex = sectionList[currentSection - 1].questions.length - 1;
      
      setCurrentSection(currentSection - 1);
      setCurrentQuestionIndices({
        ...currentQuestionIndices,
        [prevSectionId]: prevSectionLastIndex
      });
    }
  };
  
  const handleNext = () => {
    const currentSectionId = sectionList[currentSection].id;
    const currentIndex = currentQuestionIndices[currentSectionId];
    const sectionQuestions = sectionList[currentSection].questions;
    
    if (currentIndex < sectionQuestions.length - 1) {
      // Go to next question in current section
      setCurrentQuestionIndices({
        ...currentQuestionIndices,
        [currentSectionId]: currentIndex + 1
      });
    } else if (currentSection < sectionList.length - 1) {
      // Go to first question of next section
      const nextSectionId = sectionList[currentSection + 1].id;
      
      setCurrentSection(currentSection + 1);
      setCurrentQuestionIndices({
        ...currentQuestionIndices,
        [nextSectionId]: 0
      });
    }
  };
  
  const handleSectionChange = (sectionIndex) => {
    setCurrentSection(sectionIndex);
  };
  
  // Assessment completion
  const handleComplete = async () => {
    try {
      setSubmitting(true);
      
      // Transform answers into the format expected by the backend
      const formattedAnswers = Object.keys(userAnswers).map(questionId => ({
        questionId: parseInt(questionId),
        answer: userAnswers[questionId]
      }));
      
      // Submit answers
      await assessmentTakingService.submitAnswers(parseInt(assessmentId), formattedAnswers);
      
      // Show completion state
      setCompleted(true);
      setSubmitting(false);
      
      // Redirect to results after 5 seconds
      setTimeout(() => {
        navigate(`/assessment-results/${assessmentId}`);
      }, 5000);
      
    } catch (err) {
      setSubmitting(false);
      setError('Failed to submit assessment. Please try again.');
      console.error('Error submitting assessment:', err);
    }
  };
  
  // Safety confirmation before leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!completed && Object.keys(userAnswers).length > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [completed, userAnswers]);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="loader"></div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-blue-600 font-medium mt-4"
        >
          Preparing your assessment journey...
        </motion.p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-medium text-red-800">Something went wrong</h3>
              <div className="mt-2 text-md text-red-700">{error}</div>
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Completed state
  if (completed) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 py-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="text-center p-10 bg-white rounded-2xl shadow-xl max-w-md w-full relative overflow-hidden"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative"
          >
            <svg className="w-12 h-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            
            {/* Animated circles */}
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping" style={{ animationDuration: '2s' }}></div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 mb-2"
          >
            Congratulations!
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-xl text-gray-600 mb-6"
          >
            You've completed the assessment!
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-gray-500 mb-8"
          >
            Your answers have been submitted successfully. We're analyzing your responses to provide personalized recommendations.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="inline-block"
          >
            <div className="text-sm bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-lg">
              Redirecting to your results in a few seconds...
              <span className="inline-block ml-2">
                <span className="animate-bounce inline-block h-2 w-2 rounded-full bg-blue-600 mr-1"></span>
                <span className="animate-bounce inline-block h-2 w-2 rounded-full bg-blue-600 mr-1" style={{ animationDelay: '0.2s' }}></span>
                <span className="animate-bounce inline-block h-2 w-2 rounded-full bg-blue-600" style={{ animationDelay: '0.4s' }}></span>
              </span>
            </div>
          </motion.div>
          
          {/* Confetti effect */}
          <div className="absolute -top-10 left-0 w-full">
            <div className="absolute left-1/4 animate-float" style={{animationDuration: '3s'}}><span className="text-4xl">🎉</span></div>
            <div className="absolute left-1/2 animate-float" style={{animationDuration: '2.5s', animationDelay: '0.5s'}}><span className="text-3xl">🎊</span></div>
            <div className="absolute left-3/4 animate-float" style={{animationDuration: '3.5s', animationDelay: '1s'}}><span className="text-4xl">🏆</span></div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Main assessment UI
  if (!sectionList.length) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No Questions Available</h3>
              <div className="mt-2 text-sm text-yellow-700">
                There are no questions available for this assessment. Please contact the administrator.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  const currentSectionData = sectionList[currentSection];
  const currentSectionId = currentSectionData.id;
  const currentQuestionIndex = currentQuestionIndices[currentSectionId] || 0;
  const sectionProgress = Math.round((currentQuestionIndex + 1) / currentSectionData.questions.length * 100);
  const totalQuestions = calculateProgress();
  
  // Generate encouraging message based on progress
  const getEncouragingMessage = () => {
    const progress = Math.round((totalQuestions.completed / totalQuestions.total) * 100);
    if (progress === 0) return "Let's get started!";
    if (progress < 25) return "You're making great progress!";
    if (progress < 50) return "Keep going, you're doing great!";
    if (progress < 75) return "More than halfway there!";
    if (progress < 100) return "Almost there, keep it up!";
    return "You did it! Completing the assessment now...";
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6 px-2 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col">
      {/* Assessment Header - Better height utilization */}
      <div className="flex flex-col lg:flex-row gap-5 mb-5 h-auto">
        {/* Assessment Info Card - Making sure it fills available height */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-indigo-100 grow h-full flex flex-col"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start h-auto">
            <div className="flex-1">
              <div className='w-100 mb-4'>
                <h1 className="text-start text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {assessment?.title || 'Assessment'}
                </h1>              
              </div>

              <div className="text-start mb-4 w-100">
                <p className="text-sm text-gray-500 mt-1">
                  {assessment?.description || 'Complete all sections to finish the assessment'}
                </p>
              </div>
            </div>
            
            <div className="mt-2 sm:mt-0 bg-indigo-50 px-4 py-2 rounded-full text-indigo-700 flex shadow-sm">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium ">
                {timeRemaining 
                  ? `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}` 
                  : 'No time limit'
                }
              </span>
            </div>
          </div>
          
          <div className="flex-grow flex flex-col justify-between">
            {/* Motivational message */}
            <div className="text-start text-sm text-indigo-600 font-medium mb-4">
              {getEncouragingMessage()}
            </div>
            
            {/* Overall progress - Moved to bottom of flex container */}
            <div className="mt-auto">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total Progress</span>
                <span className="font-semibold">{Math.round((totalQuestions.completed / totalQuestions.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((totalQuestions.completed / totalQuestions.total) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      
        {/* Quick stats - Made to match height of first card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-5 border border-indigo-100 lg:w-1/3 flex flex-col"
        >
          <h4 className="font-medium text-gray-800 mb-3 text-sm flex items-center">
            <svg className="w-5 h-5 mr-1 text-indigo-500 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span className="truncate">Your Assessment Progress</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-grow">
            <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-100 flex flex-col justify-center">
              <div className="text-2xl font-bold text-blue-700">{totalQuestions.completed}</div>
              <div className="text-xs text-blue-600">Questions Answered</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-100 flex flex-col justify-center">
              <div className="text-2xl font-bold text-gray-700">{totalQuestions.total - totalQuestions.completed}</div>
              <div className="text-xs text-gray-600">Questions Remaining</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border-2 border-green-100 flex flex-col justify-center">
              <div className="text-2xl font-bold text-green-700">
                {Object.keys(sectionCompletion).filter(id => sectionCompletion[id] === 100).length}
              </div>
              <div className="text-xs text-green-600">Sections Completed</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-100 flex flex-col justify-center">
              <div className="text-2xl font-bold text-yellow-700">
                {sectionList.length - Object.keys(sectionCompletion).filter(id => sectionCompletion[id] === 100).length}
              </div>
              <div className="text-xs text-yellow-600">Sections Remaining</div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Updated lower section with better height utilization */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-grow">
        {/* Section Navigator (sidebar) */}
        <div className="lg:w-1/4 lg:h-[calc(100vh-16rem)] lg:sticky lg:top-4">
          <SectionNavigator 
            sections={sectionList} 
            currentSection={currentSection} 
            onSectionChange={handleSectionChange}
            sectionCompletion={sectionCompletion}
          />
        </div>
        
        {/* Main content - Section and Questions */}
        <div className="lg:w-3/4 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={`section-${currentSection}-question-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-grow"
            >
              <AssessmentSection
                title={currentSectionData.title}
                description={currentSectionData.description}
                questions={currentSectionData.questions}
                currentQuestionIndex={currentQuestionIndex}
                answers={userAnswers}
                onAnswerChange={handleAnswerChange}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onComplete={handleComplete}
                isFirstSection={currentSection === 0}
                isLastSection={currentSection === sectionList.length - 1}
                totalQuestions={totalQuestions}
                sectionProgress={sectionProgress}
                remainingTime={timeRemaining}
                currentSection={currentSection}
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Buttons for submit/navigation */}
          {currentQuestionIndex === currentSectionData.questions.length - 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 flex justify-end"
            >
              {currentSection < sectionList.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const nextSectionId = sectionList[currentSection + 1].id;
                    setCurrentSection(currentSection + 1);
                    setCurrentQuestionIndices({
                      ...currentQuestionIndices,
                      [nextSectionId]: 0
                    });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 shadow-md flex items-center space-x-2 font-medium"
                >
                  <span>Next Section</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComplete}
                  disabled={submitting}
                  className={`px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-md flex items-center space-x-2 font-medium ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-600 hover:to-emerald-700'}`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Assessment</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          )}
          
          {/* Instructions and information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white p-5 rounded-xl border border-indigo-100 shadow-md"
          >
            <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Assessment Tips
            </h3>
            <ul className="text-start text-xs text-gray-600 space-y-2 pl-6 list-disc">
              <li>Answer all questions to the best of your ability.</li>
              <li>You can navigate between sections using the panel on the left.</li>
              <li>Your progress is automatically saved as you answer questions.</li>
              <li>Click "Complete Assessment" on the final question to submit all your answers.</li>
              <li>Time limits, if applicable, are shown at the top of the screen.</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TakeAssessment;
