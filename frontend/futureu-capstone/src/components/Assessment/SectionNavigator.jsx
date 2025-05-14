import React from 'react';
import { motion } from 'framer-motion'; // Need to install: npm install framer-motion

const SectionNavigator = ({ sections, currentSection, onSectionChange, sectionCompletion }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md p-3 sm:p-5 mb-4 border border-indigo-100 h-full flex flex-col"
    >
      <div className="mb-3 text-sm font-medium text-gray-800 flex items-center">
        <svg className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span className="truncate">Assessment Sections</span>
      </div>
      <div className="text-xs space-y-1.5 flex-grow overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {sections.map((section, index) => {
          const isActive = index === currentSection;
          const completion = sectionCompletion[section.id] || 0;
          
          let statusIcon;
          if (completion === 100) {
            statusIcon = (
              <span className="bg-green-100 p-1 rounded-full flex-shrink-0">
                <svg className="h-3.5 w-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            );
          } else if (completion > 0) {
            statusIcon = (
              <span className="bg-yellow-100 p-1 rounded-full flex-shrink-0">
                <svg className="h-3.5 w-3.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            );
          } else {
            statusIcon = (
              <span className="bg-gray-100 p-1 rounded-full flex-shrink-0">
                <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            );
          }
          
          return (
            <motion.button
              key={section.id}
              onClick={() => onSectionChange(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left px-2 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm rounded-lg flex items-center justify-between border-2 ${
                isActive 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium shadow-sm' 
                  : completion === 100
                    ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300'
                    : completion > 0
                      ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:border-yellow-300'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1.5 min-w-0">
                {statusIcon}
                <span className="truncate" title={section.title}>{section.title}</span>
              </div>
              
              <div className="flex items-center flex-shrink-0 ml-1">
                <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${completion}%` }} 
                    className={`h-full rounded-full ${
                      completion === 100 
                        ? 'bg-green-500' 
                        : completion > 0 
                          ? 'bg-yellow-500' 
                          : 'bg-gray-400'
                    }`}
                  ></div>
                </div>
                <span className={`ml-1 text-xs font-medium ${
                  completion === 100 
                    ? 'text-green-600' 
                    : completion > 0 
                      ? 'text-yellow-600' 
                      : 'text-gray-500'
                }`}>
                  {completion}%
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SectionNavigator;
