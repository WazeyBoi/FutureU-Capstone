import React from 'react';
import lazyMascot from '../../assets/characters/lazy.svg';

const SaveExitConfirmationModal = ({ saveError, isSaving, onClose, onGoToDashboard }) => (
  <div className="fixed inset-0 bg-white bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center pt-45">
    <div className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto p-6 flex flex-col items-center">
      <img
        src={lazyMascot}
        alt="Lazy mascot"
        className="absolute -top-75 left-1/2 -translate-x-1/2 w-100 h-100 drop-shadow-xl z-50 pointer-events-none"
        style={{ zIndex: 60 }}
        draggable="false"
      />
      {saveError ? (
        <>
          <h3 className="text-lg font-medium text-red-700 mb-3">Error Saving Progress</h3>
          <p className="text-gray-600 mb-4">{saveError}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
            >
              Close
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Save Progress & Exit</h3>
          <p className="text-gray-600 mb-4">
            {isSaving
              ? 'Saving your progress...'
              : 'Your progress has been saved successfully! You can resume this assessment later.'}
          </p>
          <div className="flex justify-end">
            <button
              onClick={onGoToDashboard}
              className="bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] text-white py-2.5 px-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 animate-bounce-short" 
            >
              Go to Dashboard
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);

export default SaveExitConfirmationModal;
