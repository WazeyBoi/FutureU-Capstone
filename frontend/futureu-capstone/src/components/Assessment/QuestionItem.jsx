import React from 'react';

const QuestionItem = ({ question, answer, onAnswerChange }) => {
  const isMultipleChoice = question.questionType === 'MULTIPLE_CHOICE';
  const isTrueFalse = question.questionType === 'TRUE_FALSE';

  return (
    <div className="question-container">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">{question.questionText}</h3>
        
        {/* Question meta info */}
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
            {question.questionType?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Choices for multiple choice question */}
      {isMultipleChoice && question.choices && question.choices.length > 0 && (
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
      )}

      {/* True/False question */}
      {isTrueFalse && (
        <div className="space-y-3">
          <label className="flex items-start p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name={`question-${question.questionId}`}
              value="true"
              checked={answer === "true"}
              onChange={() => onAnswerChange("true")}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-700">True</span>
          </label>
          <label className="flex items-start p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name={`question-${question.questionId}`}
              value="false"
              checked={answer === "false"}
              onChange={() => onAnswerChange("false")}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-700">False</span>
          </label>
        </div>
      )}

      {/* Short answer / essay questions */}
      {!isMultipleChoice && !isTrueFalse && (
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
