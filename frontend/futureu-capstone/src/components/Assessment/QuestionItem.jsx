import React from 'react';

const QuestionItem = ({ question, answer, onAnswerChange }) => {
  // Fix question type check - using "Multiple Choice" with space instead of underscore version
  const isMultipleChoice = question.questionType === 'Multiple Choice';
  // Check for Likert type questions
  const isLikert = question.questionType === 'Likert' || question.isRiasecQuestion;

  // Define the 1-5 scale options for RIASEC questions (Likert scale)
  const scaleOptions = [
    { value: "1", label: "Strongly Dislike" },
    { value: "2", label: "Dislike" },
    { value: "3", label: "Neutral" },
    { value: "4", label: "Like" },
    { value: "5", label: "Strongly Like" }
  ];

  // Check if multiple choice question has choices
  const hasChoices = isMultipleChoice && question.choices && question.choices.length > 0;

  return (
    <div className="question-container">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">{question.questionText}</h3>
        
        {/* Question meta info - hide for RIASEC/Likert questions */}
        {!isLikert && (
          <div className="flex flex-wrap gap-2 mb-4">
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
      {hasChoices ? (
        <div className="space-y-3">
          {question.choices.map(choice => (
            <label key={choice.choiceId} className="flex items-start p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="radio"
                name={`question-${question.questionId}`}
                value={choice.choiceId.toString()}
                checked={answer === choice.choiceId.toString()}
                onChange={() => onAnswerChange(choice.choiceId.toString())}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700">{choice.choiceText}</span>
            </label>
          ))}
        </div>
      ) : isMultipleChoice ? (
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
      ) : null}

      {/* RIASEC Scale question (1-5 rating) - Likert scale */}
      {isLikert && (
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mt-2 bg-purple-50 p-4 rounded-lg">
            <div className="flex justify-between w-full">
              {scaleOptions.map(option => (
                <div key={option.value} className="text-center">
                  <label 
                    className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-colors ${
                      answer === option.value ? 'bg-purple-100 border-2 border-purple-500' : 'hover:bg-purple-100'
                    }`}
                  >
                    <span className="text-2xl font-bold mb-1 text-purple-800">{option.value}</span>
                    <span className="text-xs text-purple-700">{option.label}</span>
                    <input
                      type="radio"
                      name={`question-${question.questionId}`}
                      value={option.value}
                      checked={answer === option.value}
                      onChange={() => onAnswerChange(option.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Short answer / essay questions - for any other question types */}
      {!isMultipleChoice && !isLikert && (
        <div className="mt-2">
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
