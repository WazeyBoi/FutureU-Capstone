import React from 'react';

const SaveExitConfirmationModal = ({ saveError, isSaving, onClose, onGoToDashboard }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
    <div className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto p-6">
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
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none"
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
