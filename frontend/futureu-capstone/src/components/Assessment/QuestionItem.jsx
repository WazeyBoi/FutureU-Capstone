import React from 'react';
import { motion } from 'framer-motion'; // Need to install: npm install framer-motion

const QuestionItem = ({ question, answer, onAnswerChange }) => {
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
        <h3 className="text-start text-lg font-medium text-[#232D35] mb-2 bg-gray-50 p-4 rounded-lg border-l-4 border-[#1D63A1] shadow-sm">
          {question.questionText}
        </h3>
        
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

      {/* RIASEC Binary Agree/Disagree question (replacing 5-point scale) */}
      {isLikert && (
        <div className="mt-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1D63A1]/10 p-5 rounded-xl border border-[#1D63A1]/30"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Agree Option */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <label 
                  className={`flex flex-col items-center justify-center cursor-pointer p-4 h-24 rounded-lg transition-all ${
                    answer === "agree" 
                      ? 'bg-green-100 border-2 border-green-500 shadow-md' 
                      : 'bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <div 
                      className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center mr-2 ${
                        answer === "agree" 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-300'
                      }`}
                    >
                      {answer === "agree" && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          className="h-2 w-2 rounded-full bg-white"
                        />
                      )}
                    </div>
                    <span className="text-xl font-bold">Agree</span>
                  </div>
                  <span className="text-green-700 text-center text-sm">I agree with this statement</span>
                  <input
                    type="radio"
                    name={`question-${question.questionId}`}
                    value="agree"
                    checked={answer === "agree"}
                    onChange={() => onAnswerChange("agree")}
                    className="sr-only"
                  />
                </label>
              </motion.div>
              
              {/* Disagree Option */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <label 
                  className={`flex flex-col items-center justify-center cursor-pointer p-4 h-24 rounded-lg transition-all ${
                    answer === "disagree" 
                      ? 'bg-red-100 border-2 border-red-500 shadow-md' 
                      : 'bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <div 
                      className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center mr-2 ${
                        answer === "disagree" 
                          ? 'border-red-500 bg-red-500' 
                          : 'border-gray-300'
                      }`}
                    >
                      {answer === "disagree" && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          className="h-2 w-2 rounded-full bg-white"
                        />
                      )}
                    </div>
                    <span className="text-xl font-bold">Disagree</span>
                  </div>
                  <span className="text-red-700 text-center text-sm">I disagree with this statement</span>
                  <input
                    type="radio"
                    name={`question-${question.questionId}`}
                    value="disagree"
                    checked={answer === "disagree"}
                    onChange={() => onAnswerChange("disagree")}
                    className="sr-only"
                  />
                </label>
              </motion.div>
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
