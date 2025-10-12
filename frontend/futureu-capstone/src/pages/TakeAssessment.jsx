import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Need to install: npm install framer-motion
import { BarChart2, Info, AlertTriangle } from 'lucide-react';

import assessmentTakingService from '../services/assessmentTakingService';
import assessmentService from '../services/assessmentService';
import userAssessmentService from '../services/userAssessmentService';
import authService from '../services/authService';
import AssessmentSection from '../components/Assessment/AssessmentSection';
import SectionNavigator from '../components/assessment/SectionNavigator';
import ResumeAssessmentModal from '../components/Assessment/ResumeAssessmentModal';
import SaveExitConfirmationModal from '../components/assessment/SaveExitConfirmationModal';
import ohMySVG from '../assets/characters/ohMy.svg';
import diplomaSVG from '../assets/characters/diploma.svg';
import lazySVG from '../assets/characters/lazy.svg';

// Replace the getCurrentUserId function
const getCurrentUserId = () => {
  const userId = authService.getCurrentUserId();
  if (!userId) {
    // If no user ID found, redirect to login page
    window.location.href = '/login';
    return null;
  }
  return userId;
};

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
  
  // Quiz timer state (countdown timer for quiz sections only)
  const [quizTimeRemaining, setQuizTimeRemaining] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [isInQuizSection, setIsInQuizSection] = useState(false);
  const [quizTimerActive, setQuizTimerActive] = useState(false);
  
  // Overall assessment timer state (tracks total time spent)
  const [assessmentStartTime, setAssessmentStartTime] = useState(null);
  
  // Reference to the assessment section container
  const sectionRef = useRef(null);
  const assessmentSectionRef = useRef(null); // Add a ref to AssessmentSection to control page navigation
  
  // Add states for saving progress
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  
  // Add state to track the attempt number
  const [attemptNo, setAttemptNo] = useState(0);
  
  // Add state for resume modal
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  
  // Add state to control which page to show in AssessmentSection
  const [sectionPageOverrides, setSectionPageOverrides] = useState({}); // { sectionIndex: pageNumber }
  
  // Add state to track which question to scroll to after navigation
  const [pendingScroll, setPendingScroll] = useState(null); // { sectionIndex, questionIndex }

  // Add state to control showing the assessment tips/instructions
  const [showAssessmentTips, setShowAssessmentTips] = useState(true);

  // Add state for leave page confirmation modal
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const shouldBlockNavigation = useRef(false);
  const isLeavingConfirmed = useRef(false);

  // Add state to store the last submitted userAssessmentId
  const [lastUserAssessmentId, setLastUserAssessmentId] = useState(null);

  // Add state to control progress header visibility
  const [showProgressHeader, setShowProgressHeader] = useState(true);

  // Helper function to check if a section is a quiz section (not Interest Assessment)
  const isQuizSection = (sectionId) => {
    return sectionId !== 'interest-combined' && !sectionId.includes('interest');
  };

  // Quiz timer logic - countdown timer for quiz sections only
  useEffect(() => {
    let timer = null;
    
    if (quizTimerActive && quizTimeRemaining !== null && quizTimeRemaining > 0 && !completed) {
      timer = setInterval(() => {
        setQuizTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up! Auto-submit the assessment
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizTimerActive, quizTimeRemaining, completed]);

  // Original timer logic for overall assessment (if endTime exists)
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
  
  // Effect to handle quiz timer start/stop based on current section
  useEffect(() => {
    if (sectionList.length > 0 && currentSection < sectionList.length) {
      const currentSectionData = sectionList[currentSection];
      const isCurrentlyInQuizSection = isQuizSection(currentSectionData?.id);
      
      setIsInQuizSection(isCurrentlyInQuizSection);
      
      // Start quiz timer when entering first quiz section
      if (isCurrentlyInQuizSection && !quizTimerActive && quizTimeRemaining === null) {
        // Set quiz time limit (example: 90 minutes = 5400 seconds for all quiz sections combined)
        const QUIZ_TIME_LIMIT = 90 * 60; // 90 minutes in seconds
        setQuizTimeRemaining(QUIZ_TIME_LIMIT);
        setQuizStartTime(Date.now());
        setQuizTimerActive(true);
        console.log(`Quiz timer started - ${QUIZ_TIME_LIMIT} seconds (90 minutes) for all quiz sections`);
      }
      
      // Stop quiz timer when entering Interest Assessment
      if (!isCurrentlyInQuizSection && quizTimerActive) {
        setQuizTimerActive(false);
        console.log('Quiz timer paused - entered Interest Assessment');
      }
      
      // Resume quiz timer when returning to quiz sections
      if (isCurrentlyInQuizSection && !quizTimerActive && quizTimeRemaining !== null) {
        setQuizTimerActive(true);
        console.log('Quiz timer resumed - returned to quiz section');
      }
    }
  }, [currentSection, sectionList, quizTimerActive, quizTimeRemaining]);

  // Format time as mm:ss for countdown timers
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format quiz time with hours if needed
  const formatQuizTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Load assessment data with a check for existing progress first
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        
        // Get the current authenticated user ID
        const userId = getCurrentUserId();
        if (!userId) return; // Stop if no valid user
        
        // First, fetch just the assessment details
        const assessmentData = await assessmentService.getAssessmentById(parseInt(assessmentId));
        setAssessment(assessmentData);
        
        // SECURITY CHECK: Prevent retaking completed assessments (one-to-one relationship)
        const completedAssessments = await userAssessmentService.getCompletedAssessments(userId);
        const isAlreadyCompleted = completedAssessments.some(
          a => a.assessment.assessmentId.toString() === assessmentId
        );
        
        if (isAlreadyCompleted) {
          setError("You have already completed this assessment. Each assessment can only be taken once.");
          setLoading(false);
          return;
        }
        
        // Check for existing progress BEFORE fetching/randomizing questions
        const inProgressAssessments = await userAssessmentService.getInProgressAssessments(userId);
        
        // Find if there's an in-progress assessment matching current assessment ID
        const existingProgress = inProgressAssessments.find(
          a => a.assessment.assessmentId.toString() === assessmentId
        );
        
        let shouldLoadNewQuestions = true;
        
        if (existingProgress) {
          // Double security check: Verify that this assessment belongs to the current user
          if (existingProgress.user.userId !== userId) {
            console.error("Security violation: Attempt to access another user's assessment");
            setError("You cannot access another user's assessment progress.");
            setLoading(false);
            return;
          }
          
          // Show pretty modal instead of window.confirm
          setResumeData(existingProgress);
          setShowResumeModal(true);
          setLoading(false);
          return; // Wait for user action
        }
        
        // If this is a new assessment or user declined to resume, get attempt number
        if (shouldLoadNewQuestions) {
          try {
            // Check how many times this user has completed this assessment before
            const completedAssessments = await userAssessmentService.getCompletedAssessments(userId);
            const previousAttempts = completedAssessments.filter(
              a => a.assessment.assessmentId.toString() === assessmentId
            ).length;
            
            // Set attempt number to previous attempts + 1
            setAttemptNo(previousAttempts + 1);
          } catch (err) {
            console.error("Error checking previous attempts:", err);
            setAttemptNo(1); // Default to 1 if we can't determine
          }
          
          // Fetch and organize questions - this involves randomization
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
              questions: questionsData.gsa.scientificAbility,
              isQuizSection: true
            });
            initialIndices['gsa-scientific'] = 0;
          }
          
          if (questionsData.gsa.readingComprehension.length) {
            initialSections.push({
              id: 'gsa-reading',
              title: 'Reading Comprehension',
              description: 'Assess your ability to understand and interpret written materials',
              questions: questionsData.gsa.readingComprehension,
              isQuizSection: true
            });
            initialIndices['gsa-reading'] = 0;
          }
          
          if (questionsData.gsa.verbalAbility.length) {
            initialSections.push({
              id: 'gsa-verbal',
              title: 'Verbal Ability',
              description: 'Evaluate your command of language and verbal reasoning',
              questions: questionsData.gsa.verbalAbility,
              isQuizSection: true
            });
            initialIndices['gsa-verbal'] = 0;
          }
          
          if (questionsData.gsa.mathematicalAbility.length) {
            initialSections.push({
              id: 'gsa-math',
              title: 'Mathematical Ability',
              description: 'Test your mathematical skills and numerical reasoning',
              questions: questionsData.gsa.mathematicalAbility,
              isQuizSection: true
            });
            initialIndices['gsa-math'] = 0;
          }
          
          if (questionsData.gsa.logicalReasoning.length) {
            initialSections.push({
              id: 'gsa-logical',
              title: 'Logical Reasoning',
              description: 'Assess your ability to analyze and solve logical problems',
              questions: questionsData.gsa.logicalReasoning,
              isQuizSection: true
            });
            initialIndices['gsa-logical'] = 0;
          }
          
          // Academic Track Sections
          if (questionsData.academicTrack.stem.length) {
            initialSections.push({
              id: 'at-stem',
              title: 'STEM',
              description: 'Science, Technology, Engineering, and Mathematics aptitude assessment',
              questions: questionsData.academicTrack.stem,
              isQuizSection: true
            });
            initialIndices['at-stem'] = 0;
          }
          
          if (questionsData.academicTrack.abm.length) {
            initialSections.push({
              id: 'at-abm',
              title: 'ABM',
              description: 'Accountancy, Business, and Management aptitude assessment',
              questions: questionsData.academicTrack.abm,
              isQuizSection: true
            });
            initialIndices['at-abm'] = 0;
          }
          
          if (questionsData.academicTrack.humss.length) {
            initialSections.push({
              id: 'at-humss',
              title: 'HUMSS',
              description: 'Humanities and Social Sciences aptitude assessment',
              questions: questionsData.academicTrack.humss,
              isQuizSection: true
            });
            initialIndices['at-humss'] = 0;
          }
          
          // Other Track Sections
          if (questionsData.otherTracks.techVoc.length) {
            initialSections.push({
              id: 'track-tech',
              title: 'Techno-Vocational Livelihood',
              description: 'Assess your aptitude for technical and vocational fields',
              questions: questionsData.otherTracks.techVoc,
              isQuizSection: true
            });
            initialIndices['track-tech'] = 0;
          }
          
          if (questionsData.otherTracks.sports.length) {
            initialSections.push({
              id: 'track-sports',
              title: 'Sports Track',
              description: 'Evaluate your sports aptitude and interests',
              questions: questionsData.otherTracks.sports,
              isQuizSection: true
            });
            initialIndices['track-sports'] = 0;
          }
          
          if (questionsData.otherTracks.artsDesign.length) {
            initialSections.push({
              id: 'track-arts',
              title: 'Arts & Design Track',
              description: 'Assess your creative abilities and artistic aptitude',
              questions: questionsData.otherTracks.artsDesign,
              isQuizSection: true
            });
            initialIndices['track-arts'] = 0;
          }
          
          // RIASEC Combined Section - Now as a single section instead of individual subsections
          if (questionsData.interestAreas && questionsData.interestAreas.length > 0) {
            initialSections.push({
              id: 'interest-combined',
              title: 'Career Assessment',
              description: 'How much do you like each activity?',
              questions: questionsData.interestAreas,
              questionsPerPage: 10, // Set to display 10 questions per page for RIASEC
              isRiasecSection: true // Marker that this is a RIASEC section
            });
            initialIndices['interest-combined'] = 0;
          }
          
          setSectionList(initialSections);
          setCurrentQuestionIndices(initialIndices);
          
          // Initialize section completion rates
          const initialCompletion = {};
          initialSections.forEach(section => {
            initialCompletion[section.id] = 0;
          });
          setSectionCompletion(initialCompletion);
        }
        
        setLoading(false);
        
        // Set assessment start time once loading is complete and we have questions
        const startTime = Date.now();
        setAssessmentStartTime(startTime);
        
        // Also store in localStorage as backup
        localStorage.setItem(`assessment_start_time_${assessmentId}`, startTime.toString());
        
      } catch (err) {
        setError('Failed to load assessment. Please try again later.');
        setLoading(false);
        console.error('Error loading assessment:', err);
      }
    };

    fetchAssessment();
  }, [assessmentId]);
  
  // Handler for resuming saved progress from modal
  const handleResumeAssessment = () => {
    const existingProgress = resumeData;

    // If we have saved sections with questions, use those instead of fetching new ones
    if (existingProgress.savedSections) {
      const savedSectionList = JSON.parse(existingProgress.savedSections);
      setSectionList(savedSectionList);

      // Initialize section completion rates
      const initialCompletion = {};
      savedSectionList.forEach(section => {
        initialCompletion[section.id] = 0;
      });
      setSectionCompletion(initialCompletion);
    }

    // Set user answers
    if (existingProgress.savedAnswers) {
      setUserAnswers(JSON.parse(existingProgress.savedAnswers));
    }

    // Set current section
    if (existingProgress.currentSectionIndex !== null) {
      setCurrentSection(existingProgress.currentSectionIndex);
    }

    // Restore quiz timer state if it was active
    if (existingProgress.quizTimeRemaining && existingProgress.quizTimeRemaining > 0) {
      setQuizTimeRemaining(existingProgress.quizTimeRemaining);
      setQuizStartTime(Date.now() - ((90 * 60) - existingProgress.quizTimeRemaining) * 1000); // Calculate original start time
      
      // Check if current section is a quiz section to determine if timer should be active
      const savedSectionList = JSON.parse(existingProgress.savedSections);
      const currentSectionData = savedSectionList[existingProgress.currentSectionIndex];
      if (currentSectionData && isQuizSection(currentSectionData.id)) {
        setQuizTimerActive(true);
        setIsInQuizSection(true);
      }
    }

    // Set the attempt number from the existing progress
    if (existingProgress.attemptNo) {
      setAttemptNo(existingProgress.attemptNo);
    }

    // Resume assessment timing from when it was originally started
    // If we don't have a saved start time, set it to now (fallback)
    setAssessmentStartTime(existingProgress.assessmentStartTime || Date.now());

    setShowResumeModal(false);
    setResumeData(null);
    setLoading(false);
  };

  // Handler for starting new assessment (ignore saved progress)
  const handleStartNewAssessment = async () => {
    setShowResumeModal(false);
    setResumeData(null);
    setLoading(true);

    try {
      // Get the current authenticated user ID
      const userId = getCurrentUserId();
      // Check how many times this user has completed this assessment before
      const completedAssessments = await userAssessmentService.getCompletedAssessments(userId);
      const previousAttempts = completedAssessments.filter(
        a => a.assessment.assessmentId.toString() === assessmentId
      ).length;
      setAttemptNo(previousAttempts + 1);

      // Fetch and organize questions - this involves randomization
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
          questions: questionsData.gsa.scientificAbility,
          isQuizSection: true
        });
        initialIndices['gsa-scientific'] = 0;
      }
      
      if (questionsData.gsa.readingComprehension.length) {
        initialSections.push({
          id: 'gsa-reading',
          title: 'Reading Comprehension',
          description: 'Assess your ability to understand and interpret written materials',
          questions: questionsData.gsa.readingComprehension,
          isQuizSection: true
        });
        initialIndices['gsa-reading'] = 0;
      }
      
      if (questionsData.gsa.verbalAbility.length) {
        initialSections.push({
          id: 'gsa-verbal',
          title: 'Verbal Ability',
          description: 'Evaluate your command of language and verbal reasoning',
          questions: questionsData.gsa.verbalAbility,
          isQuizSection: true
        });
        initialIndices['gsa-verbal'] = 0;
      }
      
      if (questionsData.gsa.mathematicalAbility.length) {
        initialSections.push({
          id: 'gsa-math',
          title: 'Mathematical Ability',
          description: 'Test your mathematical skills and numerical reasoning',
          questions: questionsData.gsa.mathematicalAbility,
          isQuizSection: true
        });
        initialIndices['gsa-math'] = 0;
      }
      
      if (questionsData.gsa.logicalReasoning.length) {
        initialSections.push({
          id: 'gsa-logical',
          title: 'Logical Reasoning',
          description: 'Assess your ability to analyze and solve logical problems',
          questions: questionsData.gsa.logicalReasoning,
          isQuizSection: true
        });
        initialIndices['gsa-logical'] = 0;
      }
      
      // Academic Track Sections
      if (questionsData.academicTrack.stem.length) {
        initialSections.push({
          id: 'at-stem',
          title: 'STEM',
          description: 'Science, Technology, Engineering, and Mathematics aptitude assessment',
          questions: questionsData.academicTrack.stem,
          isQuizSection: true
        });
        initialIndices['at-stem'] = 0;
      }
      
      if (questionsData.academicTrack.abm.length) {
        initialSections.push({
          id: 'at-abm',
          title: 'ABM',
          description: 'Accountancy, Business, and Management aptitude assessment',
          questions: questionsData.academicTrack.abm,
          isQuizSection: true
        });
        initialIndices['at-abm'] = 0;
      }
      
      if (questionsData.academicTrack.humss.length) {
        initialSections.push({
          id: 'at-humss',
          title: 'HUMSS',
          description: 'Humanities and Social Sciences aptitude assessment',
          questions: questionsData.academicTrack.humss,
          isQuizSection: true
        });
        initialIndices['at-humss'] = 0;
      }
      
      // Other Track Sections
      if (questionsData.otherTracks.techVoc.length) {
        initialSections.push({
          id: 'track-tech',
          title: 'Techno-Vocational Livelihood',
          description: 'Assess your aptitude for technical and vocational fields',
          questions: questionsData.otherTracks.techVoc,
          isQuizSection: true
        });
        initialIndices['track-tech'] = 0;
      }
      
      if (questionsData.otherTracks.sports.length) {
        initialSections.push({
          id: 'track-sports',
          title: 'Sports Track',
          description: 'Evaluate your sports aptitude and interests',
          questions: questionsData.otherTracks.sports,
          isQuizSection: true
        });
        initialIndices['track-sports'] = 0;
      }
      
      if (questionsData.otherTracks.artsDesign.length) {
        initialSections.push({
          id: 'track-arts',
          title: 'Arts & Design Track',
          description: 'Assess your creative abilities and artistic aptitude',
          questions: questionsData.otherTracks.artsDesign,
          isQuizSection: true
        });
        initialIndices['track-arts'] = 0;
      }
      
      // RIASEC Combined Section - Now as a single section instead of individual subsections
      if (questionsData.interestAreas && questionsData.interestAreas.length > 0) {
        initialSections.push({
          id: 'interest-combined',
          title: 'Career Assessment',
          description: 'How much do you like each activity?',
          questionsPerPage: 10, // Set to display 10 questions per page for RIASEC
          isRiasecSection: true // Marker that this is a RIASEC section
        });
        initialIndices['interest-combined'] = 0;
      }

      setSectionList(initialSections);
      setCurrentQuestionIndices(initialIndices);

      // Initialize section completion rates
      const initialCompletion = {};
      initialSections.forEach(section => {
        initialCompletion[section.id] = 0;
      });
      setSectionCompletion(initialCompletion);

      setUserAnswers({});
      setCurrentSection(0);
      
      // Reset quiz timer states
      setQuizTimeRemaining(null);
      setQuizStartTime(null);
      setIsInQuizSection(false);
      setQuizTimerActive(false);

      setLoading(false);
    } catch (err) {
      setError('Failed to load assessment. Please try again later.');
      setLoading(false);
      console.error('Error loading assessment:', err);
    }
  };

  // Handler for closing the resume modal and navigating back
  const handleCloseResumeModal = () => {
    setShowResumeModal(false);
    navigate(-1);
  };

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
  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };
  
  const handleNextSection = () => {
    if (currentSection < sectionList.length - 1) {
      // Get current and next section's group identifiers
      const currentId = sectionList[currentSection].id;
      const nextId = sectionList[currentSection + 1].id;
      
      // Move to the next section
      setCurrentSection(currentSection + 1);
      
      // No need to explicitly handle accordion opening here as the 
      // SectionNavigator component will handle it through the useEffect
      // when currentSection changes
    }
  };
  
  const handleSectionChange = (sectionIndex) => {
    setCurrentSection(sectionIndex);
    
    // Add scrolling behavior when changing sections
    setTimeout(() => {
      if (sectionRef.current) {
        const yOffset = -20;
        const y = sectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Handler for number navigation from SectionNavigator
  const handleNavigateToQuestion = (sectionIndex, questionIndex) => {
    setCurrentSection(sectionIndex);

    const section = sectionList[sectionIndex];
    const questionsPerPage = section.questionsPerPage || (section.questions.length > 0 && section.questions[0].isRiasecQuestion ? 10 : 5);
    const page = Math.floor(questionIndex / questionsPerPage) + 1;

    // If already on the correct section and page, scroll immediately
    if (
      sectionIndex === currentSection &&
      assessmentSectionRef.current &&
      assessmentSectionRef.current.getCurrentPage &&
      assessmentSectionRef.current.getCurrentPage() === page
    ) {
      const question = section.questions[questionIndex];
      if (question) {
        setTimeout(() => {
          const questionElem = document.getElementById(`question-${question.questionId}`);
          if (questionElem) {
            questionElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
      return;
    }

    // Otherwise, set page override and pending scroll
    setSectionPageOverrides(prev => ({
      ...prev,
      [sectionIndex]: page
    }));
    setPendingScroll({ sectionIndex, questionIndex });
  };

  // After page override is handled and AssessmentSection is rendered, scroll to the question
  useEffect(() => {
    if (
      pendingScroll &&
      pendingScroll.sectionIndex === currentSection &&
      !sectionPageOverrides[currentSection]
    ) {
      const section = sectionList[currentSection];
      const question = section?.questions?.[pendingScroll.questionIndex];
      if (question) {
        setTimeout(() => {
          const questionElem = document.getElementById(`question-${question.questionId}`);
          if (questionElem) {
            questionElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          setPendingScroll(null);
        }, 100); // Slight delay to ensure DOM is updated
      } else {
        setPendingScroll(null);
      }
    }
  }, [pendingScroll, currentSection, sectionList, sectionPageOverrides]);

  // Assessment completion
  const handleComplete = async () => {
    try {
      setSubmitting(true);
      
      console.log('Assessment completed');
      
      // Transform answers into the format expected by the backend
      const formattedAnswers = Object.keys(userAnswers).map(questionId => ({
        questionId: parseInt(questionId),
        answer: userAnswers[questionId]
      }));
      
      // Get the current logged-in user ID
      const userId = getCurrentUserId();
      
      // Calculate total time spent on assessment (in seconds)
      let timeSpentSeconds = 0;
      let startTime = assessmentStartTime;
      
      // If assessmentStartTime is null, try to get it from localStorage
      if (!startTime) {
        const storedStartTime = localStorage.getItem(`assessment_start_time_${assessmentId}`);
        if (storedStartTime) {
          startTime = parseInt(storedStartTime);
          console.log('Retrieved start time from localStorage:', startTime);
        }
      }
      
      if (startTime) {
        timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
      } else {
        // Fallback: if no start time available, set a default time (e.g., 1 minute)
        timeSpentSeconds = 60; // 1 minute as fallback
        console.warn('No start time available, using fallback time');
      }
      
      console.log('Assessment completion time tracking:', {
        assessmentStartTime,
        startTimeUsed: startTime,
        currentTime: Date.now(),
        timeSpentSeconds
      });
      
      // Create submission payload including sections, attempt number, and time spent
      const payload = {
        userId: userId,
        assessmentId: parseInt(assessmentId),
        answers: formattedAnswers,
        sections: JSON.stringify(sectionList),
        attemptNo: attemptNo,
        timeSpentSeconds: timeSpentSeconds
      };
      
      console.log('Submitting assessment with payload:', payload);
      
      // Submit the complete assessment for scoring
      const result = await userAssessmentService.submitCompletedAssessment(payload);
      
      // Clean up localStorage
      localStorage.removeItem(`assessment_start_time_${assessmentId}`);
      
      // Show completion state
      setCompleted(true);
      setSubmitting(false);
      
      // Store the userAssessmentId for navigation after completion
      setLastUserAssessmentId(result.userAssessmentId);
      
      // Poll for results before redirecting
      // REMOVE this block to prevent auto-redirect
      // const pollResults = async (userAssessmentId, maxAttempts = 10, delayMs = 1000) => {
      //   for (let i = 0; i < maxAttempts; i++) {
      //     try {
      //       const res = await userAssessmentService.getAssessmentResults(userAssessmentId);
      //       if (res && res.assessmentResult) {
      //         return true;
      //       }
      //     } catch (e) {}
      //     await new Promise(r => setTimeout(r, delayMs));
      //   }
      //   return false;
      // };
      // pollResults(result.userAssessmentId).then(() => {
      //   navigate(`/assessment-results/${result.userAssessmentId}`);
      // });
      
    } catch (err) {
      setSubmitting(false);
      setError('Failed to submit assessment. Please try again.');
      console.error('Error submitting assessment:', err);
    }
  };
  
  // Add function to save progress and exit
  const handleSaveAndExit = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Calculate progress percentage
      const progress = calculateProgress();
      const progressPercentage = Math.round((progress.completed / progress.total) * 100);
      
      // Get the current logged-in user ID
      const userId = getCurrentUserId();
      
      // Create payload with current state, including quiz timer state
      const payload = {
        userId: userId,
        assessmentId: parseInt(assessmentId),
        currentSectionIndex: currentSection,
        progressPercentage: progressPercentage,
        savedAnswers: JSON.stringify(userAnswers),
        // Add the complete section list with questions to ensure the same questions 
        // and order are presented when the user resumes
        savedSections: JSON.stringify(sectionList),
        // Save quiz timer state if active
        quizTimeRemaining: quizTimeRemaining,
        attemptNo: attemptNo,
        // Save assessment start time for accurate time tracking
        assessmentStartTime: assessmentStartTime
      };
      
      console.log('Saving progress with payload:', payload);
      
      // Call API to save progress using the service
      const response = await userAssessmentService.saveProgress(payload);
      
      setIsSaving(false);
      setShowSaveConfirmation(true);
      
      // Redirect after confirmation is closed or automatically after a delay
      setTimeout(() => {
        navigate('/assessment-dashboard');
      }, 3000);
      
    } catch (err) {
      setIsSaving(false);
      setSaveError('Failed to save progress. Please try again.');
      console.error('Error saving progress:', err);
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

  // Handle navigation blocking for in-app navigation (back button)
  // This approach works for Edge, Chrome, Firefox, and Safari
  useEffect(() => {
    // Update the ref based on current state
    shouldBlockNavigation.current = !completed && Object.keys(userAnswers).length > 0;
    
    if (!shouldBlockNavigation.current) return;

    let historyLength = window.history.length;
    
    // Push initial state
    window.history.pushState({ page: 'assessment' }, '', window.location.href);

    const handlePopState = (event) => {
      console.log('Back button pressed, shouldBlock:', shouldBlockNavigation.current);
      
      if (shouldBlockNavigation.current && !isLeavingConfirmed.current) {
        // Stop the navigation immediately
        event.preventDefault();
        event.stopPropagation();
        
        // Push state again to stay on current page
        window.history.pushState({ page: 'assessment' }, '', window.location.href);
        
        // Show the confirmation modal
        setShowLeaveConfirmation(true);
        
        return false;
      }
    };

    // Use both capture and bubble phase to catch the event early
    window.addEventListener('popstate', handlePopState, true);
    window.addEventListener('popstate', handlePopState, false);

    return () => {
      window.removeEventListener('popstate', handlePopState, true);
      window.removeEventListener('popstate', handlePopState, false);
    };
  }, [completed, userAnswers]);

  // Handle leave confirmation
  const handleConfirmLeave = () => {
    console.log('User confirmed leave');
    setShowLeaveConfirmation(false);
    isLeavingConfirmed.current = true;
    shouldBlockNavigation.current = false;
    
    // Navigate to student home page
    navigate('/student-home');
  };

  const handleCancelLeave = () => {
    console.log('User cancelled leave');
    setShowLeaveConfirmation(false);
    // User chose to stay, modal closes and they remain on page
  };
  
  // Insert this modal before the main return
  if (showResumeModal) {
    return (
      <ResumeAssessmentModal
        onResume={handleResumeAssessment}
        onStartNew={handleStartNewAssessment}
        onClose={handleCloseResumeModal}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen h-full'>
        <div className="relative flex items-center justify-center">
          <img 
            src="/src/assets/characters/quirky.svg" 
            alt="Quirky mascot" 
            className="quirky-bounce h-50 mx-auto animate-bounce-slow"
            style={{ zIndex: 2, position: 'relative' }}
          />
          {/* <img
            src="/src/assets/characters/ohmy.svg"
            alt="OhMy mascot"
            className="animate-bounce-updown absolute left-[290px] bottom-[-70px] h-20 w-20"
            style={{ zIndex: 1 }}
          /> */}
          {/* <img
            src="/src/assets/characters/lazy.svg"
            alt="Lazy mascot"
            className="absolute right-[120px] bottom-[-85px] h-32 w-32"
            style={{ zIndex: 1 }}
          /> */}
        </div>
        {/* Animated message with bouncing letters */}
        <p className="text-lg font-bold text-gray-600 mt-8 flex gap-1 justify-center">
          {"Setting up assessment...".split("").map((char, i, arr) => {
            // Delay the first character until the last finishes
            let delay = i * 0.04;
            if (i === 0) delay = arr.length * 0.10;
            return (
              <span
                key={i}
                className="inline-block animate-bounce-letter"
                style={{ animationDelay: `${delay}s` }}
              >
                {char === " " ? '\u00A0' : char}
              </span>
            );
          })}
        </p>
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
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-medium text-red-800">Something went wrong</h3>
              <div className="mt-2 text-md text-red-700">{error}</div>
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // If error is about assessment already completed, go to dashboard
                    // Otherwise, try reloading
                    if (error && error.includes("already completed")) {
                      navigate('/assessment-dashboard');
                    } else {
                      window.location.reload();
                    }
                  }}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {error && error.includes("already completed") ? "Go to Dashboard" : "Try Again"}
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#2B3E4E] via-white to-[#FFB71B] py-10 pt-40 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="text-center py-10 px-10 bg-white rounded-2xl shadow-xl max-w-md w-full relative overflow-visible"
        >
          <img
            src={diplomaSVG}
            alt="Diploma"
            className="absolute -top-70 left-1/2 -translate-x-1/2 w-100 h-100 drop-shadow-xl pointer-events-none"
            style={{ zIndex: 60 }}
          />
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-5xl font-bold text-[#FFB71B] mb-10 pt-10"
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
            className="text-gray-500 mb-8 "
          >
            Your answers have been submitted successfully. Click on Continue to see assessment summry.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="inline-block"
          >
            <button
              onClick={() => navigate(`/assessment-results/${lastUserAssessmentId || ''}`)}
              className="px-6 py-2 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] text-white rounded-lg font-semibold shadow transition-colors"
              disabled={!lastUserAssessmentId}
            >
              Continue
            </button>
          </motion.div>
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
              <Info className="h-6 w-6 text-yellow-400" />
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
  const sectionProgress = sectionCompletion[currentSectionData.id] || 0;
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
    <div className="max-w-8xl mx-auto py-6 px-2 sm:px-6 lg:px-8 min-h-screen flex flex-col">
      {/* Toggle button for progress header */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowProgressHeader(!showProgressHeader)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title={showProgressHeader ? "Hide progress header" : "Show progress header"}
        >
          {showProgressHeader ? (
            <>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-sm font-medium text-white">Hide Progress</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-white">Show Progress</span>
            </>
          )}
        </button>
      </div>

      {/* Assessment Header - Better height utilization */}
      <AnimatePresence>
      {showProgressHeader && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
      <div className="flex flex-col lg:flex-row gap-5 mb-5 h-auto ">
        {/* Assessment Info Card - Making sure it fills available height */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-4 sm:p-6 rounded-xl shadow-xl grow h-full flex flex-col"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start h-auto">
            <div className="flex-1">
              <div className='w-100 mb-4'>
                <h1 className="text-start text-2xl font-bold bg-gradient-to-r from-[#1D63A1] to-[#232D35] bg-clip-text text-transparent">
                  {assessment?.title || 'Assessment'}
                </h1>              
              </div>

              <div className="text-start mb-4 w-100">
                <p className="text-sm text-gray-500 mt-1">
                  {assessment?.description || 'Complete all sections to finish the assessment'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              {/* Save & Exit button - New element */}
              {/* HIDDEN FOR NOW */}
              {/* <button
                onClick={handleSaveAndExit}
                disabled={isSaving}
                className="text-center mt-2 sm:mt-0 px-4 py-2 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] hover:text-white text-white rounded-full flex items-center font-medium shadow-sm hover:bg-[#FFB71B]/90 transition-colors"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#232D35]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                    </svg>
                    Save & Exit
                  </>
                )}
              </button> */}
              
              {/* Overall assessment time limit (if applicable) */}
              {timeRemaining && (
                <div className="mt-2 sm:mt-0 bg-[#232D35] px-4 py-2 rounded-full text-[#FFB71B] flex shadow-sm">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">
                    Total time: {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-grow flex flex-col justify-between">
            {/* Motivational message */}
            <div className="text-start text-sm text-[#1D63A1] font-medium mb-4">
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
                  className={`h-2.5 rounded-full ${
                    totalQuestions.completed === totalQuestions.total 
                      ? 'bg-green-500'  // Green when all questions are completed
                      : 'progress-bar-futureu' // Default brand gradient
                  }`}
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
          className="rounded-xl p-4 sm:p-5 lg:w-1/3 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-[#232D35] text-sm flex items-center">
              <BarChart2 className="w-5 h-5 mr-1 text-[#1D63A1] flex-shrink-0" />
              <span className="truncate">Your Assessment Progress</span>
            </h4>
            {/* Quiz timer countdown beside the heading */}
            {isInQuizSection && quizTimeRemaining !== null && (
              <div className={`px-3 py-1 rounded-lg flex items-center ${
                quizTimeRemaining <= 300 ? 'text-red-700' : 
                quizTimeRemaining <= 900 ? 'text-yellow-700' : 
                'text-[#232D35]'
              }`}>
                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-bold">
                  {formatQuizTime(quizTimeRemaining)}
                  {!quizTimerActive && ' (paused)'}
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-grow">
            <div className="bg-white p-3 rounded-lg flex flex-col justify-center shadow-[0_4px_12px_rgba(29,99,161,0.25)]">
              <div className="text-2xl font-bold text-[#1D63A1]">{totalQuestions.completed}</div>
              <div className="text-xs text-[#1D63A1]/80">Questions Answered</div>
            </div>
            <div className="bg-white p-3 rounded-lg flex flex-col justify-center shadow-[0_4px_12px_rgba(107,114,128,0.2)]">
              <div className="text-2xl font-bold text-[#232D35]">{totalQuestions.total - totalQuestions.completed}</div>
              <div className="text-xs text-[#232D35]/80">Questions Remaining</div>
            </div>
            <div className="bg-white p-3 rounded-lg flex flex-col justify-center shadow-[0_4px_12px_rgba(255,183,27,0.25)]">
              <div className="text-2xl font-bold text-[#FFB71B]">
                {Object.keys(sectionCompletion).filter(id => sectionCompletion[id] === 100).length}
              </div>
              <div className="text-xs text-[#FFB71B]/80">Sections Completed</div>
            </div>
            <div className="bg-white p-3 rounded-lg flex flex-col justify-center shadow-[0_4px_12px_rgba(255,183,27,0.15)]">
              <div className="text-2xl font-bold text-[#232D35]">
                {sectionList.length - Object.keys(sectionCompletion).filter(id => sectionCompletion[id] === 100).length}
              </div>
              <div className="text-xs text-[#232D35]/80">Sections Remaining</div>
            </div>
          </div>
        </motion.div>
      </div>
        </motion.div>
      )}
      </AnimatePresence>
      
      {/* Updated lower section with better height utilization */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-grow">
        {/* Section Navigator (sidebar) - Adjusted width to accommodate text */}
        <div className="lg:w-80 lg:h-[calc(100vh-16rem)] lg:sticky lg:top-4">
          <SectionNavigator 
            sections={sectionList} 
            currentSection={currentSection} 
            onSectionChange={handleSectionChange}
            sectionCompletion={sectionCompletion}
            onNavigateToQuestion={handleNavigateToQuestion}
            userAnswers={userAnswers} // <-- Pass userAnswers here
          />
        </div>
        
        {/* Main content - Section and Questions */}
        <div className="lg:flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              ref={sectionRef}
              key={`section-${currentSection}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-grow"
            >
              <AssessmentSection
                ref={assessmentSectionRef}
                title={currentSectionData.title}
                description={currentSectionData.description}
                questions={currentSectionData.questions}
                answers={userAnswers}
                onAnswerChange={handleAnswerChange}
                onPrevious={handlePreviousSection}
                onNext={handleNextSection}
                onComplete={handleComplete}
                isFirstSection={currentSection === 0}
                isLastSection={currentSection === sectionList.length - 1}
                totalQuestions={totalQuestions}
                sectionProgress={sectionProgress}
                remainingTime={timeRemaining}
                currentSection={currentSection}
                // Pass page override if set
                pageOverride={sectionPageOverrides[currentSection]}
                onPageOverrideHandled={() => {
                  setSectionPageOverrides(prev => {
                    const copy = { ...prev };
                    delete copy[currentSection];
                    return copy;
                  });
                }}
                getCurrentPage={() => assessmentSectionRef.current?._currentPage || 1}
                isInQuizSection={isInQuizSection}
                quizTimeRemaining={quizTimeRemaining}
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Instructions and information */}
          {showAssessmentTips && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/10 pt-40">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-2xl border border-[#1D63A1]/20 shadow-2xl max-w-md w-full relative overflow-visible"
              >
                {/* OhMy mascot SVG, overflowing the top of the modal */}
                <img
                  src={ohMySVG}
                  alt="OhMy mascot"
                  className="absolute -top-70 left-1/2 -translate-x-1/2 w-100 h-100 drop-shadow-xl pointer-events-none select-none"
                  style={{ zIndex: 61 }}
                />
                <button
                  onClick={() => setShowAssessmentTips(false)}
                  aria-label="Close instructions"
                  className="absolute bg-gradient-to-r from-white to-white top-3 right-3 text-gray-400 hover:text-[#FFB71B] transition-colors p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#FFB71B]">
                    {/* Replaced invalid path with valid Heroicons X (close) icon */}
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h3 className="text-lg font-bold text-[#232D35] mb-4 flex items-center mt-8">
                  <svg className="w-6 h-6 mr-2 text-[#FFB71B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {/* Replaced invalid path with valid Heroicons info icon */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Assessment Instructions
                </h3>
                <ul className="text-start text-xs text-gray-700 space-y-1 pl-6 list-disc mb-6">
                  <li>Answer all questions honestly with the best of your ability.</li>
                  <li>You can navigate between sections using the panel on the left.</li>
                  <li>Use the "Save & Exit" button to save your progress and return later.</li>
                  <li>Click "Complete Assessment" on the final question to submit all your answers.</li>
                  <li><strong>Quiz sections have a 90-minute time limit</strong> - manage your time wisely!</li>
                  <li>Interest Assessment section is untimed - take your time to reflect on your preferences.</li>
                </ul>
                <button
                  onClick={() => setShowAssessmentTips(false)}
                  className="text-center sm:mt-0 px-4 py-2 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] hover:text-white text-white rounded-full flex items-center font-medium shadow-sm hover:bg-[#FFB71B]/90 transition-colors block mx-auto mt-6"
                >
                  Got it!
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      
      {/* Save Confirmation Dialog */}
      {showSaveConfirmation && (
        <SaveExitConfirmationModal
          saveError={saveError}
          isSaving={isSaving}
          onClose={() => setShowSaveConfirmation(false)}
          onGoToDashboard={() => navigate('/assessment-dashboard')}
        />
      )}

      {/* Leave Page Confirmation Dialog */}
      <AnimatePresence>
        {showLeaveConfirmation && (
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
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto py-15 flex flex-col items-center"
            >
              <motion.img
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                src={lazySVG}
                alt="Lazy mascot"
                className="absolute -top-75 left-1/2 -translate-x-1/2 w-100 h-100 drop-shadow-xl z-50 pointer-events-none"
                style={{ zIndex: 60 }}
                draggable="false"
              />
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="text-2xl font-bold mb-3"
              >
                Leave Assessment?
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-gray-600 mb-4 text-center"
              >
                You're about to leave this page. Your progress will be <span className="font-semibold text-red-600">lost</span> unless you save it first.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="flex gap-3 justify-center w-full mt-5"
              >
                <button
                  onClick={handleCancelLeave}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] text-white rounded-xl font-bold shadow-md transition-all"
                >
                  Stay & Continue
                </button>
                <button
                  onClick={handleConfirmLeave}
                  className="px-6 py-2.5 bg-[#2B3E4E] hover:bg-red-700 text-white rounded-xl font-bold shadow-md transition-all"
                >
                  Leave Anyway
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TakeAssessment;