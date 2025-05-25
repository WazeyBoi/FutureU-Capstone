import React from 'react';
import excitedSVG from '../../assets/characters/excited.svg';

const ResumeAssessmentModal = ({ onResume, onStartNew, onClose }) => (
  <div className="fixed inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center pt-45">
    {/* Excited character overlapping the modal */}
    <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto p-8 flex flex-col items-center relative">
      {/* Close button */}
      <img
        src={excitedSVG}
        alt="Excited character"
        className="absolute -top-80 left-1/2 -translate-x-1/2 w-100 h-100 drop-shadow-xl z-50 pointer-events-none"
        style={{ zIndex: 60 }}
      />
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute bg-white top-4 right-4 text-gray-400 hover:text-[#FFB71B] transition-colors p-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 className="text-2xl font-bold text-[#232D35] mb-2">Resume Assessment?</h2>
      <p className="text-left text-gray-700 mb-6 text-center">
        You have a saved progress for this assessment.<br />
        Would you like to continue from where you left off?
      </p>
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={onResume}
          className="bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] text-white py-2.5 px-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 animate-bounce-short" 
        >
          Continue Last Saved Assessment
        </button>
        <button
          onClick={onStartNew}
            className="text-center items-center px-6 py-3 bg-gradient-to-r from-white to-white text-[#2B3E4E] font-bold rounded-xl shadow-md hover:from-[#2B3E4E] hover:to-[#2B3E4E] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#FFB71B] animate-bounce-short"
        >
          Start New Attempt
        </button>
      </div>
    </div>
  </div>
);

export default ResumeAssessmentModal;
