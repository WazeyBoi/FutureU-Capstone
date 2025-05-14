import React from 'react';
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
  remainingTime
}) => {
  const currentQuestion = questions[currentQuestionIndex];

  // Format remaining time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Section header */}
      <div className="mb-6 border-b pb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {remainingTime && (
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-mono font-medium text-gray-700">{formatTime(remainingTime)}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        
        {/* Progress indicators */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="text-sm text-gray-500">
            Section progress: {sectionProgress}%
          </div>
          <div className="text-sm text-gray-500">
            Total progress: {Math.round((totalQuestions.completed / totalQuestions.total) * 100)}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${sectionProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Question display */}
      {currentQuestion && (
        <QuestionItem 
          question={currentQuestion} 
          answer={answers[currentQuestion.questionId]} 
          onAnswerChange={(value) => onAnswerChange(currentQuestion.questionId, value)} 
        />
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrevious}
          disabled={currentQuestionIndex === 0 && isFirstSection}
          className={`px-4 py-2 rounded ${
            currentQuestionIndex === 0 && isFirstSection
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>
        
        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={onNext}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={isLastSection ? onComplete : onNext}
            className={`px-4 py-2 rounded ${
              isLastSection 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLastSection ? 'Complete Assessment' : 'Next Section'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentSection;
