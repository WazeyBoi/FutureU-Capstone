import React from 'react';
import { motion } from 'framer-motion'; // Need to install: npm install framer-motion

const QuestionItem = ({ question, answer, onAnswerChange }) => {
  // Check question types
  const isMultipleChoice = question.questionType === 'Multiple Choice';
  const isLikert = question.questionType === 'Likert' || question.isRiasecQuestion;

  // Define the 1-5 scale options for RIASEC questions (Likert scale)
  const scaleOptions = [
    { value: "1", label: "Strongly Dislike", emoji: "😫" },
    { value: "2", label: "Dislike", emoji: "🙁" },
    { value: "3", label: "Neutral", emoji: "😐" },
    { value: "4", label: "Like", emoji: "🙂" },
    { value: "5", label: "Strongly Like", emoji: "😄" }
  ];

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
        <h3 className="text-start text-lg font-medium text-gray-800 mb-2 bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm">
          {question.questionText}
        </h3>
        
        {/* Question meta info - hide for RIASEC/Likert questions */}
        {!isLikert && (
          <div className="flex flex-wrap gap-2 mt-3">
            {question.difficultyLevel && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                question.difficultyLevel === 'EASY' ? 'bg-green-100 text-green-800' :
                question.difficultyLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficultyLevel}
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                    ? 'bg-indigo-50 border-indigo-400 shadow-md' 
                    : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex">
                  <div 
                    className={`flex-shrink-0 h-5 w-5 mt-1 rounded-full border-2 flex items-center justify-center ${
                      answer === choice.choiceId.toString() 
                        ? 'border-indigo-500 bg-indigo-500' 
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
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">This multiple choice question is missing its choices.</p>
            </div>
          </div>
        </div>
      )}

      {/* RIASEC Scale question (1-5 rating) - Likert scale */}
      {isLikert && (
        <div className="mt-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-indigo-50 p-5 rounded-xl border border-indigo-100"
          >
            <div className="grid grid-cols-5 gap-2">
              {scaleOptions.map(option => (
                <motion.div 
                  key={option.value} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-center"
                >
                  <label 
                    className={`flex flex-col items-center cursor-pointer p-3 rounded-lg transition-all ${
                      answer === option.value 
                        ? 'bg-indigo-100 border-2 border-indigo-500 shadow-md' 
                        : 'hover:bg-indigo-100/50'
                    }`}
                  >
                    <span className="text-3xl mb-2">{option.emoji}</span>
                    <span className="text-xl font-bold mb-1 text-indigo-700">{option.value}</span>
                    <span className="text-xs text-indigo-600">{option.label}</span>
                    <input
                      type="radio"
                      name={`question-${question.questionId}`}
                      value={option.value}
                      checked={answer === option.value}
                      onChange={() => onAnswerChange(option.value)}
                      className="sr-only"
                    />
                  </label>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Short answer / essay questions - for any other question types */}
      {!isMultipleChoice && !isLikert && (
        <div className="mt-2">
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
