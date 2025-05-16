import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import QuestionItem from './QuestionItem';

const AssessmentSection = ({ 
  title, 
  description, 
  questions, 
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
  currentSection = 0 
}) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5; // Show 5 questions per page
  
  // Reference to the questions container for scrolling
  const questionsContainerRef = useRef(null);
  // New ref for the section header - better scroll target
  const sectionHeaderRef = useRef(null);
  
  // Calculate pagination values
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  // Format remaining time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate how many questions in this section have been answered
  const answeredQuestionsCount = questions.filter(q => answers[q.questionId]).length;
  const sectionCompletionPercentage = Math.round((answeredQuestionsCount / questions.length) * 100);
  
  // Check if all questions in this section have been answered
  const allQuestionsAnswered = answeredQuestionsCount === questions.length;

  // Handle page changes with improved scroll to top
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    // More reliable scroll to top approach
    setTimeout(() => {
      if (sectionHeaderRef.current) {
        const yOffset = -20; // Add a small offset from the top
        const y = sectionHeaderRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // More reliable scroll to top approach
      setTimeout(() => {
        if (sectionHeaderRef.current) {
          const yOffset = -20; // Add a small offset from the top
          const y = sectionHeaderRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // More reliable scroll to top approach
      setTimeout(() => {
        if (sectionHeaderRef.current) {
          const yOffset = -20; // Add a small offset from the top
          const y = sectionHeaderRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Enhance the section navigation functions to scroll back to top
  const handlePrevious = () => {
    // Call the provided onPrevious function from props
    onPrevious();
    // Scroll to top of the section
    if (sectionHeaderRef.current) {
      setTimeout(() => {
        const yOffset = -20;
        const y = sectionHeaderRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleNext = () => {
    // Call the provided onNext or onComplete function from props
    isLastSection ? onComplete() : onNext();
    // Scroll to top of the section
    if (sectionHeaderRef.current) {
      setTimeout(() => {
        const yOffset = -20;
        const y = sectionHeaderRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 100);
    }
  };

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 border border-[#1D63A1]/20 overflow-hidden flex flex-col"
    >
      {/* Section header with improved responsiveness - add ref here */}
      <div ref={sectionHeaderRef} className="mb-4 border-b border-gray-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-lg sm:text-xl font-bold text-[#232D35] flex items-center mb-2 sm:mb-0">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1D63A1]/15 text-[#1D63A1] flex items-center justify-center text-xs sm:text-sm font-bold mr-2 flex-shrink-0">
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
        <p className="text-start text-xs sm:text-sm text-gray-600 mt-1 sm:ml-10 line-clamp-2">{description}</p>
        
        {/* Progress indicators */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center">
            <span className="text-xs text-[#1D63A1] bg-[#1D63A1]/10 px-3 py-1 rounded-full">
              {questions.length} Questions • {answeredQuestionsCount} Answered
            </span>
            <div className="h-2 w-24 bg-gray-200 rounded-full ml-3 overflow-hidden">
              <div 
                className={`h-full ${
                  sectionCompletionPercentage === 100 
                    ? 'bg-green-500' // Green when section is fully completed
                    : 'bg-[#1D63A1]' // Default brand blue otherwise
                }`} 
                style={{ width: `${sectionCompletionPercentage}%` }}
              ></div>
            </div>
            <span className={`text-xs font-medium ml-2 ${
              sectionCompletionPercentage === 100 
                ? 'text-green-600' 
                : 'text-gray-600'
            }`}>
              {sectionCompletionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Questions Pagination Info */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="text-sm text-gray-500">
          Showing questions {indexOfFirstQuestion + 1}-{Math.min(indexOfLastQuestion, questions.length)} of {questions.length}
        </div>
        <div className="text-sm text-[#1D63A1]">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Questions Display - keep existing ref */}
      <div ref={questionsContainerRef} className="mb-4">
        {currentQuestions.map((question, index) => (
          <motion.div
            key={question.questionId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="mb-8 pb-6 border-b border-gray-200 last:border-0 last:pb-0 last:mb-0"
          >
            <div className="flex items-center mb-2">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-[#232D35] text-xs font-medium flex items-center justify-center mr-2">
                {indexOfFirstQuestion + index + 1}
              </span>
              <div className="text-sm text-gray-500">
                Question {indexOfFirstQuestion + index + 1} of {questions.length}
              </div>
              {answers[question.questionId] && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="ml-3 bg-[#FFB71B]/20 text-[#232D35] text-xs font-medium py-1 px-2 rounded-md"
                >
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Answered
                  </span>
                </motion.div>
              )}
            </div>
            <QuestionItem
              question={question}
              answer={answers[question.questionId]}
              onAnswerChange={(value) => onAnswerChange(question.questionId, value)}
            />
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls - With Previous on left, Next on right, and counter centered */}
      <div className="flex justify-center items-center mb-6">
        <nav className="w-full flex items-center justify-between" aria-label="Pagination">
          {/* Previous page button - Left aligned */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-[#232D35] hover:bg-gray-50'
            }`}
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Previous
          </button>
          
          {/* Page indicator - Center aligned */}
          <div className="flex-grow text-center">
            <span className="text-sm text-[#1D63A1] font-medium bg-[#1D63A1]/10 px-4 py-2 rounded-md inline-block">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          {/* Next page button - Right aligned */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-[#232D35] hover:bg-gray-50'
            }`}
          >
            Next
            <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>

      {/* Section Navigation buttons - Only visible when ALL questions are answered */}
      {allQuestionsAnswered && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious} // Use our new handler
            disabled={isFirstSection}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isFirstSection
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-[#232D35] hover:bg-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous Section</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext} // Use our new handler
            className={`px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2 ${
              isLastSection 
                ? 'bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/80 text-[#232D35] hover:from-[#FFB71B] hover:to-[#FFB71B]/70' 
                : 'bg-gradient-to-r from-[#1D63A1] to-[#232D35] text-white hover:from-[#1D63A1]/90 hover:to-[#232D35]/90'
            }`}
          >
            {isLastSection ? (
              <>
                <span>Complete Assessment</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Next Section</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </motion.button>
        </div>
      )}
      
      {/* Status indicator when not all questions are answered */}
      {!allQuestionsAnswered && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-center text-sm text-[#1D63A1]">
            Please answer all {questions.length} questions in this section to proceed.
            <span className="block mt-1 font-medium">
              {answeredQuestionsCount} of {questions.length} answered
              {answeredQuestionsCount > 0 && ` (${sectionCompletionPercentage}%)`}
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AssessmentSection;
