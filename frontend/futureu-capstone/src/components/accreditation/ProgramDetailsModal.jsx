import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const ProgramDetailsModal = ({ program, isOpen, onClose }) => {
  if (!isOpen || !program) return null;
  
  // Keep the improved scroll-locking mechanism
  useEffect(() => {
    // Store original body style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Add a class to body instead of directly modifying the style
    document.body.classList.add('modal-open');
    
    return () => {
      // Remove the class when modal closes
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Create modal content
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-white rounded-xl w-full max-w-2xl shadow-2xl"
        style={{ 
          animation: 'modalSlideIn 0.3s ease-out'
        }}
      >
        {/* Simple Navy Header Bar */}
        <div className="bg-[#2B3E4E] p-4">
          <div className="relative">
            {/* Enhanced X button with stronger colors */}
            <button
              onClick={onClose}
              className="absolute right-2 top-0 !bg-[#FFB71B] !text-white hover:!bg-[#e69c00] p-2 rounded-lg shadow-md transition-all duration-200"
              style={{ backgroundColor: '#FFB71B', color: 'white' }}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* White Content Area */}
        <div className="p-5">
          {/* Program Title Section - Clean and centered */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#2B3E4E] rounded-full mb-3">
              <svg className="w-7 h-7 text-[#FFB71B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#2B3E4E]">{program.name}</h2>
            
            {/* Enhanced School Name Display */}
            <div className="mt-2">
              <p className="text-base font-medium text-[#2B3E4E] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#FFB71B] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{program.schoolName}</span>
              </p>
            </div>
          </div>

          {/* Accreditation Title Section - Navy box like screenshot */}
          {program.accreditation?.title && (
            <div className="bg-[#2B3E4E] rounded-lg p-4 mb-5 text-center">
              <h4 className="text-xs font-medium text-[#FFB71B] uppercase tracking-wider mb-1">
                ACCREDITATION TITLE
              </h4>
              <p className="text-lg font-semibold text-white">{program.accreditation.title}</p>
            </div>
          )}

          {/* Status Grid - Side by side like screenshot */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-[#FFB71B] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-[#2B3E4E]">Recognition Status</span>
              </div>
              <p className="text-base font-semibold text-[#2B3E4E]">
                {program.recognition || 'Not Available'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-[#FFB71B] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium text-[#2B3E4E]">Accreditation Level</span>
              </div>
              <p className="text-base font-semibold text-[#2B3E4E]">
                Level {program.level || 'Not Available'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-[#FFB71B] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm font-medium text-[#2B3E4E]">Accrediting Body</span>
              </div>
              <p className="text-base font-semibold text-[#2B3E4E]">
                {program.accreditingBody || 'Not Available'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-[#FFB71B] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-[#2B3E4E]">Status</span>
              </div>
              <p className="text-base font-semibold text-[#2B3E4E]">
                {program.status || 'Not Available'}
              </p>
            </div>
          </div>

          {/* Description Section */}
          {program.accreditation?.description && (
            <div className="mb-5">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-[#FFB71B] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span className="text-sm font-medium text-[#2B3E4E]">Description</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-[#2B3E4E] leading-relaxed">
                  {program.accreditation.description}
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end">
            {/* Enhanced Close button with stronger colors */}
            <button
              onClick={onClose}
              className="!bg-[#FFB71B] !text-white hover:!bg-[#e69c00] px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-all duration-200"
              style={{ backgroundColor: '#FFB71B', color: 'white' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Add animation and scrolling styles */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        /* Add a global style for the modal-open class */
        :global(.modal-open) {
          overflow: hidden;
          padding-right: 15px; /* Prevent layout shift when scrollbar disappears */
        }
      `}</style>
    </div>
  );

  // Use portal to render directly to body
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default ProgramDetailsModal;