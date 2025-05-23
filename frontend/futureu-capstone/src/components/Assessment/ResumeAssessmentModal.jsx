import React from 'react';

const ResumeAssessmentModal = ({ onResume, onStartNew }) => (
  <div className="fixed inset-0 bg-gray-700 bg-opacity-60 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#1D63A1] mb-2">Resume Assessment?</h2>
      <p className="text-gray-700 mb-6 text-center">
        You have a saved progress for this assessment.<br />
        Would you like to continue from where you left off?
      </p>
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={onResume}
          className="w-full px-4 py-2 bg-[#1D63A1] text-white rounded-lg font-semibold hover:bg-[#174a7c] transition"
        >
          Continue Last Saved Assessment
        </button>
        <button
          onClick={onStartNew}
          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Start New Attempt
        </button>
      </div>
    </div>
  </div>
);

export default ResumeAssessmentModal;
