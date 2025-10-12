import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';
import QuestionItem from './QuestionItem';

// Tooltip component for assessment information
const AssessmentTooltip = ({ sectionType }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getTooltipContent = () => {
    if (sectionType === 'riasec') {
      return {
        title: "Assessment Source",
        content: (
          <>
              <p className="mb-3 font-normal leading-relaxed">
              Questions in this section are based on the <strong className="text-[#2B3E4E]">O*NET® Interest Profiler™</strong> from the O*NET Resource Center.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="mb-1.5">
                <strong className="text-gray-700">Source:</strong> O*NET Interest Profiler Short Form Psychometric Characteristics
              </p>
              <p>
                <strong className="text-gray-700">Reference:</strong> 
                <a 
                  href="https://www.onetcenter.org/dl_files/IPSF_Psychometric.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#FFB71B] hover:text-[#2B3E4E] underline ml-1 font-medium"
                >
                  ONET Resource Center
                </a>
              </p>
            </div>
          </>
        ),
        ariaLabel: "Information about RIASEC assessment source"
      };
    } else {
      return {
        title: "Assessment Basis",
        content: (
          <>
            <p className="mb-3 font-normal leading-relaxed">
              Questions in this section are based heavily on <strong className="text-[#2B3E4E]">Grade 9 curriculum</strong> standards and learning competencies.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="mb-1.5">
                <strong className="text-gray-700">Curriculum Level:</strong> Grade 9 (Junior High School)
              </p>
              <p>
                <strong className="text-gray-700">Basis:</strong> Department of Education (DepEd) K-12 Curriculum Standards
              </p>
            </div>
          </>
        ),
        ariaLabel: "Information about curriculum-based assessment"
      };
    }
  };

  const tooltipData = getTooltipContent();

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="ml-2 p-1.5 rounded-full hover:bg-[#FFB71B]/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] focus:ring-opacity-50"
        aria-label={tooltipData.ariaLabel}
      >
        <svg 
          className="w-4 h-4 text-[#FFB71B] hover:text-[#2B3E4E]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </button>
      
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute z-50 w-80 p-5 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="text-left">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-[#FFB71B]/10 flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="w-4 h-4 text-[#FFB71B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-[#2B3E4E]">{tooltipData.title}</h4>
            </div>
            
            <div className="text-sm">
              {tooltipData.content}
            </div>
          </div>
          
          {/* Tooltip arrow */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45"></div>
        </motion.div>
      )}
    </div>
  );
};

const AssessmentSection = forwardRef(({
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
  currentSection = 0,
  pageOverride,
  onPageOverrideHandled,
  isInQuizSection = false,
  quizTimeRemaining = null,
}, ref) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Check question type and determine pagination strategy
  const isReadingComprehension = questions.length > 0 && questions[0].passageData;
  const isRiasecSection = questions.length > 0 && questions[0].isRiasecQuestion;
  
  // Determine questions per page based on section type
  let questionsPerPage;
  let totalPages;
  let currentQuestions;
  let indexOfFirstQuestion;
  let indexOfLastQuestion;
  
  if (isReadingComprehension) {
    // For reading comprehension: 1 passage (5 questions) per page
    questionsPerPage = 5;
    totalPages = Math.ceil(questions.length / questionsPerPage);
    indexOfLastQuestion = currentPage * questionsPerPage;
    indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  } else if (isRiasecSection) {
    // For RIASEC: 10 questions per page
    questionsPerPage = 10;
    totalPages = Math.ceil(questions.length / questionsPerPage);
    indexOfLastQuestion = currentPage * questionsPerPage;
    indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  } else {
    // For other sections: 5 questions per page
    questionsPerPage = 5;
    totalPages = Math.ceil(questions.length / questionsPerPage);
    indexOfLastQuestion = currentPage * questionsPerPage;
    indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  }
  
  // Reference to the questions container for scrolling
  const questionsContainerRef = useRef(null);
  // New ref for the section header - better scroll target
  const sectionHeaderRef = useRef(null);
  
  // Track last handled page override to avoid duplicate calls
  const lastHandledPageOverride = useRef(null);

  // Expose currentPage to parent via ref
  useImperativeHandle(ref, () => ({
    getCurrentPage: () => currentPage,
    _currentPage: currentPage
  }), [currentPage]);

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

  // Handle pageOverride from parent (for number navigation)
  useEffect(() => {
    if (
      pageOverride &&
      pageOverride !== currentPage &&
      lastHandledPageOverride.current !== pageOverride
    ) {
      setCurrentPage(pageOverride);
      lastHandledPageOverride.current = pageOverride;
    }
  }, [pageOverride, currentPage]);

  // Notify parent after page is set
  useEffect(() => {
    if (
      pageOverride &&
      currentPage === pageOverride &&
      onPageOverrideHandled &&
      lastHandledPageOverride.current === pageOverride
    ) {
      onPageOverrideHandled();
      // Reset tracker so it can handle future overrides
      lastHandledPageOverride.current = null;
    }
  }, [currentPage, pageOverride, onPageOverrideHandled]);

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
      className="bg-white rounded-xl shadow-xl p-4 sm:p-6 mb-6 overflow-hidden flex flex-col"
    >
      {/* Section header with improved responsiveness - add ref here */}
      <div ref={sectionHeaderRef} className="flex justify-between mb-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-lg sm:text-xl font-bold text-[#2B3E4E] flex items-center mb-2 sm:mb-0">
              <span className="line-clamp-1">{title}</span>
              <AssessmentTooltip sectionType={isRiasecSection ? 'riasec' : 'curriculum'} />
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
          <p className="text-start text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
        </div>
        
        {/* Progress indicators */}
        {/* <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          {/* <div className="flex items-center">
            <span className="text-xs text-[#FFB71B] bg-[#FFB71B]/10 px-3 py-1 rounded-full">
              {questions.length} Questions • {answeredQuestionsCount} Answered
            </span>
            <div className="h-2 w-24 bg-gray-200 rounded-full ml-3 overflow-hidden">
              <div 
                className={`h-full ${
                  sectionCompletionPercentage === 100 
                    ? 'bg-[#FFB71B]' // Gold when section is fully completed
                    : 'bg-[#2B3E4E]' // Dark blue for in-progress
                }`}
                style={{ width: `${sectionCompletionPercentage}%` }}
              ></div>
            </div>
            <span className={`text-xs font-medium ml-2 ${
              sectionCompletionPercentage === 100 
                ? 'text-[#FFB71B]' 
                : 'text-[#2B3E4E]'
            }`}>
              {sectionCompletionPercentage}%
            </span>
          </div>
        </div> */}
        
        {/* Quiz timer indicator for quiz sections */}
        {isInQuizSection && quizTimeRemaining !== null && (
          <div className={`flex items-center px-4 py-2 ${
            quizTimeRemaining <= 300 ? '' : 
            quizTimeRemaining <= 900 ? '' : 
            ''
          }`}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-sm font-medium ${
              quizTimeRemaining <= 300 ? 'text-red-700' : 
              quizTimeRemaining <= 900 ? 'text-[#FFB71B]' : 
              'text-[#2B3E4E]'
            }`}>
              {Math.floor(quizTimeRemaining / 60)}:{(quizTimeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
        
        {/* Untimed section indicator for Interest Assessment */}
        {!isInQuizSection && title === 'Career Assessment' && (
          <div className="flex items-center px-4 py-2 ">
            <svg className="w-5 h-5 text-[#FFB71B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-[#2B3E4E] font-medium">
              Untimed - Take your time to reflect.
            </span>
          </div>
        )}
      </div>

      {/* Questions Pagination Info */}
      {/* <div className="flex justify-between items-center mb-4 px-1">
        <div className="text-sm text-gray-500">
          {isReadingComprehension ? (
            <>
              Showing passage {currentPage} of {totalPages} ({questionsPerPage} questions per passage)
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Reading Comprehension
              </span>
            </>
          ) : (
            <>
              Showing questions {indexOfFirstQuestion + 1}-{Math.min(indexOfLastQuestion, questions.length)} of {questions.length}
              {questions.length > 0 && questions[0].isRiasecQuestion && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Interest Assessment
                </span>
              )}
            </>
          )}
        </div>
        <div className="text-sm text-[#FFB71B]">
          Page {currentPage} of {totalPages}
        </div>
      </div> */}

      {/* Questions Display - keep existing ref */}
      <div ref={questionsContainerRef} className="mb-4">
        {isRiasecSection ? (
          // RIASEC Table Format - One big table for all questions
          <div className="mt-2">
            {/* Table Legend */}
            <div className="flex-1 mb-6 rounded-xl">
              
              {/* legend */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {/* Strongly Dislike */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-6 h-6 bg-[#2B3E4E] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    0
                  </div>
                  <span className="text-sm font-medium text-gray-700">Strongly Dislike</span>
                </div>
                
                {/* Dislike */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-6 h-6 bg-[#2B3E4E]/70 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  <span className="text-sm font-medium text-gray-700">Dislike</span>
                </div>
                
                {/* Unsure */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <span className="text-sm font-medium text-gray-700">Unsure</span>
                </div>
                
                {/* Like */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-6 h-6 bg-[#FFB71B]/70 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                  <span className="text-sm font-medium text-gray-700">Like</span>
                </div>
                
                {/* Strongly Like */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-6 h-6 bg-[#FFB71B] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    4
                  </div>
                  <span className="text-sm font-medium text-gray-700">Strongly Like</span>
                </div>
              </div>
            </div>
            
            {/* RIASEC Questions Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700 w-2/3">
                      Activity
                    </th>
                    <th className="border border-gray-300 px-2 py-3 text-center text-xs font-semibold text-gray-700 w-16">
                      0
                    </th>
                    <th className="border border-gray-300 px-2 py-3 text-center text-xs font-semibold text-gray-700 w-16">
                      1
                    </th>
                    <th className="border border-gray-300 px-2 py-3 text-center text-xs font-semibold text-gray-700 w-16">
                      2
                    </th>
                    <th className="border border-gray-300 px-2 py-3 text-center text-xs font-semibold text-gray-700 w-16">
                      3
                    </th>
                    <th className="border border-gray-300 px-2 py-3 text-center text-xs font-semibold text-gray-700 w-16">
                      4
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentQuestions.map((question, index) => (
                    <motion.tr
                      key={question.questionId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      {/* Statement Cell */}
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-800">
                        <div className="flex items-start">
                          <span className="w-6 h-6 rounded-full text-[#2B3E4E] text-xs font-medium flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            {indexOfFirstQuestion + index + 1}
                          </span>
                          <span className="leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: (() => {
                            const raw = question.questionText || '';
                            const underlineOneInSegment = (segment) => {
                              if (!segment) return segment;
                              const words = segment.match(/[A-Za-z]+/g) || [];
                              if (words.length === 0) return segment;
                              const preferred = words.find(w => /(?:ous|ful|less|ive|able|ible|al|ic|ish|ary|ory|ent|ant|est|er|ly|ed|ing)$/i.test(w));
                              const chosen = preferred || words[0];
                              let done = false;
                              return segment.replace(new RegExp(`\\b${chosen}\\b`), (m) => {
                                if (done) return m;
                                done = true;
                                return `<u>${m}</u>`;
                              });
                            };
                            const requiresUnderline = (fullText) => /(underlined\s+word|underlined|emphasized|bold\/?emphasized|bold)/i.test(fullText);
                            let t = raw
                              .replace(/\[u\]([\s\S]*?)\[\/u\]/g, (_, g1) => underlineOneInSegment(g1))
                              .replace(/__([^_]+?)__/g, (_, g1) => underlineOneInSegment(g1))
                              .replace(/(^|\W)_([^_]+?)_(?=\W|$)/g, (m, p1, g1) => `${p1}${underlineOneInSegment(g1)}`)
                              .replace(/(^|\W)\*([^*]+?)\*(?=\W|$)/g, (m, p1, g1) => `${p1}${underlineOneInSegment(g1)}`);
                            if (requiresUnderline(t)) {
                              t = t
                                .replace(/"([^"\n]+)"/g, (m, g1) => `<u>${g1.trim()}</u>`)
                                .replace(/“([^”\n]+)”/g, (m, g1) => `<u>${g1.trim()}</u>`);
                            }
                            // If still no underline, check approved vocabulary list
                            if (requiresUnderline(t) && !/<u>/i.test(t)) {
                              const vocab = [
                                'eloquent','resilient','meticulous','testament','unanimous','composure','innovative',
                                'modest','fragile','dilapidated','optimistic','torrent','corroborate','concise','enigmatic'
                              ];
                              for (const w of vocab) {
                                const re = new RegExp(`\\b(${w})\\b`, 'i');
                                if (re.test(t)) { t = t.replace(re, '<u>$1</u>'); break; }
                              }
                            }

                            if (requiresUnderline(t) && /underlined\s+word/i.test(t) && !/<u>/i.test(t)) {
                              const lines = t.split(/\n+/);
                              const body = lines.length > 1 ? lines[1] : lines[0];
                              const match = body && body.match(/\b([A-Za-z]+)\b/);
                              if (match) {
                                const w = match[1];
                                t = t.replace(new RegExp(`\\b${w}\\b`), `<u>${w}</u>`);
                              }
                            }
                            return t;
                          })() }} />
                          {/* {answers[question.questionId] && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200, damping: 10 }}
                              className="ml-2 bg-green-100 text-green-800 text-xs font-medium py-1 px-2 rounded-full flex-shrink-0"
                            >
                              ✓
                            </motion.div>
                          )} */}
                        </div>
                      </td>
                      
                      {/* Rating Cells */}
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <td key={rating} className="border border-gray-300 p-2 text-center">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <label className="cursor-pointer flex justify-center">
                              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                answers[question.questionId] === rating.toString()
                                  ? rating <= 1 ? 'border-[#2B3E4E] bg-[#2B3E4E]' : rating === 2 ? 'border-gray-500 bg-gray-500' : 'border-[#FFB71B] bg-[#FFB71B]'
                                  : rating <= 1 ? 'border-gray-300 hover:border-[#2B3E4E]' : rating === 2 ? 'border-gray-300 hover:border-gray-500' : 'border-gray-300 hover:border-[#FFB71B]'
                              }`}>
                                {answers[question.questionId] === rating.toString() && (
                                  <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }} 
                                    className="h-3 w-3 rounded-full bg-white" 
                                  />
                                )}
                              </div>
                              <input 
                                type="radio" 
                                name={`question-${question.questionId}`} 
                                value={rating.toString()} 
                                checked={answers[question.questionId] === rating.toString()} 
                                onChange={() => onAnswerChange(question.questionId, rating.toString())} 
                                className="sr-only" 
                              />
                            </label>
                          </motion.div>
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Regular Question Format (Multiple Choice, Reading Comprehension, etc.)
          currentQuestions.map((question, index) => (
            <motion.div
              key={question.questionId}
              id={`question-${question.questionId}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="mb-8 pb-6 border-b border-gray-200 last:border-0 last:pb-0 last:mb-0"
            >
              {/* Display passage if this is the first question of a passage */}
              {question.passageData && question.passageData.isFirstQuestionOfPassage && (
                <div className="mb-6 p-6 bg-[#FFB71B]/5 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#2B3E4E] mb-3">
                    {/* Passage {question.passageData.passageIndex + 1}:  */}
                    {question.passageData.passage.title}
                  </h3>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
                    {question.passageData.passage.passageText}
                  </div>
                  <div className="mt-4 text-xs text-[#FFB71B] px-3 py-1 rounded-full inline-block">
                    Questions {(question.passageData.passageIndex * 5) + 1}-{(question.passageData.passageIndex * 5) + 5} are based on this passage
                  </div>
                </div>
              )}
              
              {/* hidded for now */}
              {/* <div className="flex items-center mb-2">
                {answers[question.questionId] && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="ml-3 bg-[#FFB71B]/20 text-[#2B3E4E] text-xs font-medium py-1 px-2 rounded-md"
                  >
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Answered
                    </span>
                  </motion.div>
                )}
              </div> */}
              <QuestionItem
                question={question}
                answer={answers[question.questionId]}
                onAnswerChange={(value) => onAnswerChange(question.questionId, value)}
                questionNumber={indexOfFirstQuestion + index + 1}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination Controls - With Previous on left, Next on right, and counter centered */}
      <div className="flex justify-center items-center mb-6 mt-6">
        <nav className="w-full flex items-center justify-between" aria-label="Pagination">
          {/* Previous page button - Left aligned */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E] text-white hover:from-[#FFB71B] hover:to-[#FFB71B]'
            }`}
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Previous
          </button>
          
          {/* Page indicator - Center aligned */}
          <div className="flex-grow text-center">
            <span className="text-sm text-[#FFB71B] font-medium px-4 py-2 rounded-md inline-block">
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
                : 'bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] text-white hover:from-[#2B3E4E] hover:to-[#2B3E4E]'
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
                : 'bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E] text-white hover:from-[#FFB71B] hover:to-[#FFB71B]'
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
            className="px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] text-white hover:from-[#2B3E4E] hover:to-[#2B3E4E]"
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
      {/* {!allQuestionsAnswered && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-center text-sm text-[#2B3E4E]">
            Please answer all {questions.length} questions in this section to proceed.
            <span className="block mt-1 font-medium">
              {answeredQuestionsCount} of {questions.length} answered
              {answeredQuestionsCount > 0 && ` (${sectionCompletionPercentage}%)`}
            </span>
          </p>
        </div>
      )} */}
    </motion.div>
  );
});

export default AssessmentSection;
