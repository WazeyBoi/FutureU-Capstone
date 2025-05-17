import React from "react";

const StatsCards = ({ totalSchools, coePrograms, codPrograms, totalPrograms, cardsAnimated }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Schools Card */}
        <div className={`bg-white rounded-xl shadow-sm p-6 flex items-center transition-all duration-700 ease-out transform ${cardsAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div>
            <p className="text-gray-700 font-medium">Schools</p>
            <p className="text-3xl font-bold text-gray-800">{totalSchools}</p>
          </div>
        </div>
        
        {/* COE Programs Card */}
        <div className={`bg-white rounded-xl shadow-sm p-6 flex items-center transition-all duration-700 ease-out transform ${cardsAnimated ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: "100ms"}}>
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
          </div>
          <div className="w-full">
            <p className="text-gray-700 font-medium text-left">Center of Excellence Programs</p>
            <p className="text-3xl font-bold text-yellow-500 text-left">{coePrograms}</p>
          </div>
        </div>
        
        {/* COD Programs Card */}
        <div className={`bg-white rounded-xl shadow-sm p-6 flex items-center transition-all duration-700 ease-out transform ${cardsAnimated ? 'opacity-100 translate-y-0 delay-200' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: "200ms"}}>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div className="w-full">
            <p className="text-gray-700 font-medium text-left">Center of Development Programs</p>
            <p className="text-3xl font-bold text-gray-800 text-left">{codPrograms}</p>
          </div>
        </div>
        
        {/* Total Programs Card */}
        <div className={`bg-white rounded-xl shadow-sm p-6 flex items-center transition-all duration-700 ease-out transform ${cardsAnimated ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: "300ms"}}>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <p className="text-gray-700 font-medium">Total Programs</p>
            <p className="text-3xl font-bold text-yellow-500">{totalPrograms}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards; 