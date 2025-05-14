import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
            title: 'GSA - Scientific Ability',
            description: 'Test your scientific knowledge and reasoning abilities',
            questions: questionsData.gsa.scientificAbility
          });
          initialIndices['gsa-scientific'] = 0;
        }
        
        if (questionsData.gsa.readingComprehension.length) {
          initialSections.push({
            id: 'gsa-reading',
            title: 'GSA - Reading Comprehension',
            description: 'Assess your ability to understand and interpret written materials',
            questions: questionsData.gsa.readingComprehension
          });
          initialIndices['gsa-reading'] = 0;
        }
        
        if (questionsData.gsa.verbalAbility.length) {
          initialSections.push({
            id: 'gsa-verbal',
            title: 'GSA - Verbal Ability',
            description: 'Evaluate your command of language and verbal reasoning',
            questions: questionsData.gsa.verbalAbility
          });
          initialIndices['gsa-verbal'] = 0;
        }
        
        if (questionsData.gsa.mathematicalAbility.length) {
          initialSections.push({
            id: 'gsa-math',
            title: 'GSA - Mathematical Ability',
            description: 'Test your mathematical skills and numerical reasoning',
            questions: questionsData.gsa.mathematicalAbility
          });
          initialIndices['gsa-math'] = 0;
        }
        
        if (questionsData.gsa.logicalReasoning.length) {
          initialSections.push({
            id: 'gsa-logical',
            title: 'GSA - Logical Reasoning',
            description: 'Assess your ability to analyze and solve logical problems',
            questions: questionsData.gsa.logicalReasoning
          });
          initialIndices['gsa-logical'] = 0;
        }
        
        // Academic Track Sections
        if (questionsData.academicTrack.stem.length) {
          initialSections.push({
            id: 'at-stem',
            title: 'Academic Track - STEM',
            description: 'Science, Technology, Engineering, and Mathematics aptitude assessment',
            questions: questionsData.academicTrack.stem
          });
          initialIndices['at-stem'] = 0;
        }
        
        if (questionsData.academicTrack.abm.length) {
          initialSections.push({
            id: 'at-abm',
            title: 'Academic Track - ABM',
            description: 'Accountancy, Business, and Management aptitude assessment',
            questions: questionsData.academicTrack.abm
          });
          initialIndices['at-abm'] = 0;
        }
        
        if (questionsData.academicTrack.humss.length) {
          initialSections.push({
            id: 'at-humss',
            title: 'Academic Track - HUMSS',
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
            title: 'Interest Area - Realistic',
            description: 'Evaluate your interest in practical, hands-on activities',
            questions: questionsData.interestAreas.realistic
          });
          initialIndices['interest-realistic'] = 0;
        }
        
        if (questionsData.interestAreas.investigative.length) {
          initialSections.push({
            id: 'interest-investigative',
            title: 'Interest Area - Investigative',
            description: 'Assess your analytical and intellectual interests',
            questions: questionsData.interestAreas.investigative
          });
          initialIndices['interest-investigative'] = 0;
        }
        
        if (questionsData.interestAreas.artistic.length) {
          initialSections.push({
            id: 'interest-artistic',
            title: 'Interest Area - Artistic',
            description: 'Evaluate your creative and artistic interests',
            questions: questionsData.interestAreas.artistic
          });
          initialIndices['interest-artistic'] = 0;
        }
        
        if (questionsData.interestAreas.social.length) {
          initialSections.push({
            id: 'interest-social',
            title: 'Interest Area - Social',
            description: 'Assess your interest in helping and working with people',
            questions: questionsData.interestAreas.social
          });
          initialIndices['interest-social'] = 0;
        }
        
        if (questionsData.interestAreas.enterprising.length) {
          initialSections.push({
            id: 'interest-enterprising',
            title: 'Interest Area - Enterprising',
            description: 'Evaluate your leadership and persuasive abilities',
            questions: questionsData.interestAreas.enterprising
          });
          initialIndices['interest-enterprising'] = 0;
        }
        
        if (questionsData.interestAreas.conventional.length) {
          initialSections.push({
            id: 'interest-conventional',
            title: 'Interest Area - Conventional',
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
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading assessment...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Completed state
  if (completed) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Completed!</h2>
          <p className="text-gray-600 mb-6">Thank you for completing the assessment. Your answers have been submitted successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to results page in a few seconds...</p>
        </div>
      </div>
    );
  }
  
  // Main assessment UI
  if (!sectionList.length) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
        </div>
      </div>
    );
  }
  
  const currentSectionData = sectionList[currentSection];
  const currentSectionId = currentSectionData.id;
  const currentQuestionIndex = currentQuestionIndices[currentSectionId] || 0;
  const sectionProgress = Math.round((currentQuestionIndex + 1) / currentSectionData.questions.length * 100);
  const totalQuestions = calculateProgress();
  
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Assessment Header */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assessment?.title || 'Assessment'}</h1>
            <p className="text-sm text-gray-500 mt-1">{assessment?.description || 'Complete all sections to finish the assessment'}</p>
          </div>
          
          <div className="mt-2 sm:mt-0 bg-blue-50 px-3 py-1 rounded-full text-blue-700 flex items-center">
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">
              {timeRemaining ? `Time Remaining: ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}` : 'No time limit'}
            </span>
          </div>
        </div>
        
        {/* Overall progress */}
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>Overall Progress</span>
          <span>{Math.round((totalQuestions.completed / totalQuestions.total) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${Math.round((totalQuestions.completed / totalQuestions.total) * 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigator (sidebar) */}
        <div className="lg:col-span-1">
          <SectionNavigator 
            sections={sectionList} 
            currentSection={currentSection} 
            onSectionChange={handleSectionChange}
            sectionCompletion={sectionCompletion}
          />
          
          {/* Quick stats */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h4 className="font-medium text-gray-700 mb-2 text-sm">Assessment Progress</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{totalQuestions.completed}</div>
                <div className="text-xs text-blue-600">Answered</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">{totalQuestions.total - totalQuestions.completed}</div>
                <div className="text-xs text-gray-600">Remaining</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{Object.keys(sectionCompletion).filter(id => sectionCompletion[id] === 100).length}</div>
                <div className="text-xs text-green-600">Sections Done</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{sectionList.length - Object.keys(sectionCompletion).filter(id => sectionCompletion[id] === 100).length}</div>
                <div className="text-xs text-yellow-600">Sections Left</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content - Section and Questions */}
        <div className="lg:col-span-3">
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
          />
          
          {/* Buttons for submit/navigation */}
          {currentQuestionIndex === currentSectionData.questions.length - 1 && (
            <div className="mt-4 flex justify-end">
              {currentSection < sectionList.length - 1 ? (
                <button
                  onClick={() => {
                    const nextSectionId = sectionList[currentSection + 1].id;
                    setCurrentSection(currentSection + 1);
                    setCurrentQuestionIndices({
                      ...currentQuestionIndices,
                      [nextSectionId]: 0
                    });
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next Section
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={submitting}
                  className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Submitting...' : 'Complete Assessment'}
                </button>
              )}
            </div>
          )}
          
          {/* Instructions and information */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Assessment Instructions:</h3>
            <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
              <li>Answer all questions to the best of your ability.</li>
              <li>You can navigate between sections using the section panel on the left.</li>
              <li>Your progress is automatically saved as you answer questions.</li>
              <li>Click "Complete Assessment" on the final question to submit all your answers.</li>
              <li>Some questions may have time limits indicated at the top of the screen.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAssessment;
