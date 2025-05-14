import React from 'react';
import { motion } from 'framer-motion'; // Need to install: npm install framer-motion
import QuestionItem from './QuestionItem';

const AssessmentSection = ({ 
  title, 
  description, 
  questions, 
  currentQuestionIndex, 
  answers, 
  onAnswerChange, 
  onPrevious, 
  onNext,
  onComplete,
  isLastSection,
  isFirstSection,
  totalQuestions,
  sectionProgress,
  remainingTime,
  currentSection = 0 // Add default value to avoid the error
}) => {
  const currentQuestion = questions[currentQuestionIndex];

  // Format remaining time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get random positive feedback message
  const getFeedbackMessage = () => {
    const messages = [
      "You're doing great!",
      "Keep up the good work!",
      "You're making excellent progress!",
      "You've got this!",
      "Amazing job so far!",
      "You're rocking this assessment!",
      "Keep going, you're doing fantastic!",
      "Your dedication shows!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 border border-indigo-100 overflow-hidden flex flex-col h-full"
    >
      {/* Section header with improved responsiveness */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 flex-shrink-0">
              {currentSection + 1}
            </span>
            <span className="line-clamp-1">{title}</span>
          </h2>
          {remainingTime && (
            <div className="flex items-center bg-red-50 px-3 py-1 rounded-full self-start sm:self-auto">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono font-medium text-red-700 text-sm">{formatTime(remainingTime)}</span>
            </div>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:ml-10 line-clamp-2">{description}</p>
        
        {/* Progress indicators with improved responsive layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-2">
          <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 sm:px-3 py-1 rounded-full inline-flex">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-2xs sm:text-xs text-gray-500">
            <div className="flex items-center">
              <span className="font-medium text-indigo-700 whitespace-nowrap">Section:</span>
              <div className="ml-1 w-16 sm:w-24 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full" 
                  style={{ width: `${sectionProgress}%` }}
                ></div>
              </div>
              <span className="ml-1">{sectionProgress}%</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-indigo-700 whitespace-nowrap">Overall:</span>
              <div className="ml-1 w-16 sm:w-24 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${Math.round((totalQuestions.completed / totalQuestions.total) * 100)}%` }}
                ></div>
              </div>
              <span className="ml-1">{Math.round((totalQuestions.completed / totalQuestions.total) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question display with overflow handling - Utilize flex-grow for height */}
      <div className="flex-grow">
        {currentQuestion && (
          <div className="relative h-full">
            <div className="absolute -top-1 -right-1">
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: answers[currentQuestion.questionId] ? 1 : 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="bg-green-100 text-green-700 text-xs font-medium py-1 px-2 rounded shadow"
              >
                {answers[currentQuestion.questionId] ? (
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Answered
                  </span>
                ) : null}
              </motion.div>
            </div>
            
            <motion.div
              key={currentQuestion.questionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <QuestionItem 
                question={currentQuestion} 
                answer={answers[currentQuestion.questionId]} 
                onAnswerChange={(value) => onAnswerChange(currentQuestion.questionId, value)} 
              />
            </motion.div>
          </div>
        )}

        {/* Encouraging feedback when user answers */}
        {currentQuestion && answers[currentQuestion.questionId] && (
          <motion.div
            key={`feedback-${currentQuestion.questionId}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-indigo-600 font-medium">{getFeedbackMessage()}</p>
          </motion.div>
        )}
      </div>

      {/* Navigation buttons with improved responsiveness */}
      <div className="flex justify-between mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevious}
          disabled={currentQuestionIndex === 0 && isFirstSection}
          className={`px-3 sm:px-5 py-2 rounded-lg flex items-center space-x-1 text-sm ${
            currentQuestionIndex === 0 && isFirstSection
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
          }`}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </motion.button>
        
        {currentQuestionIndex < questions.length - 1 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-3 sm:px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-sm hover:shadow flex items-center font-medium text-sm"
          >
            <span>Next</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isLastSection ? onComplete : onNext}
            className={`px-3 sm:px-5 py-2 rounded-lg shadow-sm hover:shadow flex items-center font-medium text-sm ${
              isLastSection 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
            }`}
          >
            {isLastSection ? (
              <>
                <span className="hidden sm:inline">Complete</span>
                <span className="inline sm:hidden">Done</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Next Section</span>
                <span className="inline sm:hidden">Next</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
                </svg>
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default AssessmentSection;
