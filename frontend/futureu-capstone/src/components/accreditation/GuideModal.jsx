import React from "react";

const GuideModal = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 backdrop-blur-md bg-black/20 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-lg max-w-5xl w-full relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#2B3E4E] p-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="text-xl font-semibold text-white">Accreditation Guide</h2>
          </div>
          
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* First row */}
            <div className="flex flex-col bg-white rounded-lg shadow-md p-6 h-full">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#2B3E4E] text-left">About Accreditation</h3>
              </div>
              <p className="text-gray-600 text-left">
                Accreditation is a voluntary process of quality review by non-governmental organizations to ensure educational quality and improvement in higher education institutions.
              </p>
            </div>

            <div className="flex flex-col bg-white rounded-lg shadow-md p-6 h-full">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#2B3E4E] text-left">Recognition Types</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#2B3E4E]">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#2B3E4E] text-white flex items-center justify-center text-xs font-bold mr-3">COE</div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-[#2B3E4E]">Center of Excellence</p>
                    <p className="text-xs text-gray-500">Programs with highest standards</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#2B3E4E]/70">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#2B3E4E]/70 text-white flex items-center justify-center text-xs font-bold mr-3">COD</div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-[#2B3E4E]">Center of Development</p>
                    <p className="text-xs text-gray-500">Programs with potential to become COE</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Second row */}
            <div className="flex flex-col bg-white rounded-lg shadow-md p-6 h-full">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-[#FFB71B] flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#2B3E4E] text-left">Accreditation Levels</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#FFB71B]">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#FFB71B] text-white flex items-center justify-center font-bold text-sm mr-3">I</div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-[#2B3E4E]">Level I</p>
                    <p className="text-xs text-gray-500">Initial accreditation</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#FFB71B]">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#FFB71B] text-white flex items-center justify-center font-bold text-sm mr-3">II</div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-[#2B3E4E]">Level II</p>
                    <p className="text-xs text-gray-500">Formal quality</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#FFB71B]">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#FFB71B] text-white flex items-center justify-center font-bold text-sm mr-3">III</div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-[#2B3E4E]">Level III</p>
                    <p className="text-xs text-gray-500">High quality</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#FFB71B]">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#FFB71B] text-white flex items-center justify-center font-bold text-sm mr-3">IV</div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-[#2B3E4E]">Level IV</p>
                    <p className="text-xs text-gray-500">International standards</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col bg-white rounded-lg shadow-md p-6 h-full">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-[#FFB71B] flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#2B3E4E] text-left">Accrediting Bodies</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#FFB71B]">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#FFB71B] text-white flex items-center justify-center text-xs font-bold mr-2">P</div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-[#2B3E4E]">PACUCOA</p>
                    <p className="text-xs text-gray-500">Philippine Association of Colleges and Universities Commission on Accreditation</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#FFB71B]">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#FFB71B] text-white flex items-center justify-center text-xs font-bold mr-2">P</div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-[#2B3E4E]">PAASCU</p>
                    <p className="text-xs text-gray-500">Philippine Accrediting Association of Schools, Colleges and Universities</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#FFB71B]">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#FFB71B] text-white flex items-center justify-center text-xs font-bold mr-2">A</div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-[#2B3E4E]">AACCUP</p>
                    <p className="text-xs text-gray-500">Accrediting Agency of Chartered Colleges and Universities in the Philippines</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideModal; 