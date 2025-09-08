import React from 'react';
import { motion } from 'framer-motion'; // Need to install: npm install framer-motion

const QuestionItem = ({ question, answer, onAnswerChange, questionNumber }) => {
  // Check question types
  const isMultipleChoice = question.questionType === 'Multiple Choice';
  const isLikert = question.questionType === 'Likert' || question.isRiasecQuestion;

  // Check if multiple choice question has choices
  const hasChoices = isMultipleChoice && question.choices && question.choices.length > 0;
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="question-container">
      <div className="mb-5">
        <h5 className="text-start font-medium text-[#232D35] mb-2 bg-gray-50 p-4 rounded-lg border-l-4 border-[#1D63A1] shadow-sm flex items-start">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#1D63A1] text-white text-sm font-bold rounded-full mr-3 flex-shrink-0">
            {questionNumber}
          </span>
          {question.questionText}
        </h5>
        
        {/* Question meta info - hide for RIASEC/Likert questions */}
        {!isLikert && (
          <div className="flex flex-wrap gap-2 mt-3">
            {question.difficultyLevel && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                question.difficultyLevel === 'EASY' ? 'bg-green-100 text-green-800' :
                question.difficultyLevel === 'MEDIUM' ? 'bg-[#FFB71B]/20 text-[#FFB71B]/90' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficultyLevel}
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1D63A1]/20 text-[#1D63A1]/90">
              {question.questionType || (isLikert ? 'Likert Scale' : '')}
            </span>
          </div>
        )}
      </div>

      {/* Choices for multiple choice question */}
      {hasChoices && (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {question.choices.map((choice, index) => (
            <motion.div key={choice.choiceId} variants={item}>
              <label 
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  answer === choice.choiceId.toString() 
                    ? 'bg-[#1D63A1]/10 border-[#1D63A1] shadow-md' 
                    : 'hover:bg-gray-50 border-gray-200 hover:border-[#1D63A1]/50'
                }`}
              >
                <div className="flex">
                  <div 
                    className={`flex-shrink-0 h-5 w-5 mt-1 rounded-full border-2 flex items-center justify-center ${
                      answer === choice.choiceId.toString() 
                        ? 'border-[#1D63A1] bg-[#1D63A1]' 
                        : 'border-gray-300'
                    }`}
                  >
                    {answer === choice.choiceId.toString() && (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="h-2 w-2 rounded-full bg-white"
                      />
                    )}
                  </div>
                  <input
                    type="radio"
                    name={`question-${question.questionId}`}
                    value={choice.choiceId.toString()}
                    checked={answer === choice.choiceId.toString()}
                    onChange={() => onAnswerChange(choice.choiceId.toString())}
                    className="sr-only"
                  />
                </div>
                <div className="ml-3">
                  <span className="text-gray-800">{choice.choiceText}</span>
                </div>
              </label>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {isMultipleChoice && !hasChoices && (
        <div className="bg-[#FFB71B]/10 border-l-4 border-[#FFB71B] p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-[#FFB71B]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-[#232D35]">This multiple choice question is missing its choices.</p>
            </div>
          </div>
        </div>
      )}

      {/* RIASEC 5-Point Likert Scale */}
      {isLikert && (
        <div className="mt-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1D63A1]/10 p-6 rounded-xl border border-[#1D63A1]/30"
          >
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 font-medium">Rate how much you agree with this statement:</p>
            </div>
            
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {/* Strongly Disagree */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <label className={`flex flex-col items-center justify-center cursor-pointer p-3 h-20 sm:h-24 rounded-lg transition-all text-center ${
                  answer === "1" 
                    ? 'bg-red-100 border-2 border-red-500 shadow-md' 
                    : 'bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300'
                }`}>
                  <div className={`flex-shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center mb-1 ${
                    answer === "1" ? 'border-red-500 bg-red-500' : 'border-gray-300'
                  }`}>
                    {answer === "1" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-red-700">Strongly Disagree</span>
                  <input type="radio" name={`question-${question.questionId}`} value="1" checked={answer === "1"} onChange={() => onAnswerChange("1")} className="sr-only" />
                </label>
              </motion.div>

              {/* Disagree */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <label className={`flex flex-col items-center justify-center cursor-pointer p-3 h-20 sm:h-24 rounded-lg transition-all text-center ${
                  answer === "2" 
                    ? 'bg-orange-100 border-2 border-orange-500 shadow-md' 
                    : 'bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300'
                }`}>
                  <div className={`flex-shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center mb-1 ${
                    answer === "2" ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                  }`}>
                    {answer === "2" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-orange-700">Disagree</span>
                  <input type="radio" name={`question-${question.questionId}`} value="2" checked={answer === "2"} onChange={() => onAnswerChange("2")} className="sr-only" />
                </label>
              </motion.div>

              {/* Neutral */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <label className={`flex flex-col items-center justify-center cursor-pointer p-3 h-20 sm:h-24 rounded-lg transition-all text-center ${
                  answer === "3" 
                    ? 'bg-gray-100 border-2 border-gray-500 shadow-md' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}>
                  <div className={`flex-shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center mb-1 ${
                    answer === "3" ? 'border-gray-500 bg-gray-500' : 'border-gray-300'
                  }`}>
                    {answer === "3" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700">Neutral</span>
                  <input type="radio" name={`question-${question.questionId}`} value="3" checked={answer === "3"} onChange={() => onAnswerChange("3")} className="sr-only" />
                </label>
              </motion.div>

              {/* Agree */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <label className={`flex flex-col items-center justify-center cursor-pointer p-3 h-20 sm:h-24 rounded-lg transition-all text-center ${
                  answer === "4" 
                    ? 'bg-blue-100 border-2 border-blue-500 shadow-md' 
                    : 'bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
                }`}>
                  <div className={`flex-shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center mb-1 ${
                    answer === "4" ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {answer === "4" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-blue-700">Agree</span>
                  <input type="radio" name={`question-${question.questionId}`} value="4" checked={answer === "4"} onChange={() => onAnswerChange("4")} className="sr-only" />
                </label>
              </motion.div>

              {/* Strongly Agree */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <label className={`flex flex-col items-center justify-center cursor-pointer p-3 h-20 sm:h-24 rounded-lg transition-all text-center ${
                  answer === "5" 
                    ? 'bg-green-100 border-2 border-green-500 shadow-md' 
                    : 'bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300'
                }`}>
                  <div className={`flex-shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center mb-1 ${
                    answer === "5" ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {answer === "5" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-green-700">Strongly Agree</span>
                  <input type="radio" name={`question-${question.questionId}`} value="5" checked={answer === "5"} onChange={() => onAnswerChange("5")} className="sr-only" />
                </label>
              </motion.div>
            </div>

            {/* Optional: Visual scale indicator */}
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Low Interest</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-300"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                  <div className="w-2 h-2 rounded-full bg-green-300"></div>
                </div>
                <span>High Interest</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Short answer / essay questions - for any other question types */}
      {!isMultipleChoice && !isLikert && (
        <div className="mt-2">
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1]"
            rows="4"
            placeholder="Enter your answer here..."
            value={answer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
