import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SectionNavigator = ({ sections, currentSection, onSectionChange, sectionCompletion }) => {
  // Group sections by type
  const [openGroup, setOpenGroup] = useState(null);

  // Organize sections into groups based on their IDs
  const sectionGroups = useMemo(() => {
    const groups = {
      gsa: {
        title: "General Scholastic Aptitude",
        icon: "📚",
        sections: [],
        completion: 0
      },
      academic: {
        title: "Academic Tracks",
        icon: "🎓",
        sections: [],
        completion: 0
      },
      other: {
        title: "Other Tracks",
        icon: "🛠️",
        sections: [],
        completion: 0
      },
      interest: {
        title: "RIASEC",
        icon: "🌟",
        sections: [],
        completion: 0
      }
    };
    
    // Sort sections into groups
    sections.forEach(section => {
      const id = section.id;
      if (id.startsWith('gsa-')) {
        groups.gsa.sections.push(section);
      } else if (id.startsWith('at-')) {
        groups.academic.sections.push(section);
      } else if (id.startsWith('track-')) {
        groups.other.sections.push(section);
      } else if (id.startsWith('interest-')) {
        groups.interest.sections.push(section);
      }
    });
    
    // Calculate completion for each group
    Object.keys(groups).forEach(key => {
      if (groups[key].sections.length === 0) return;
      
      let totalCompletion = 0;
      groups[key].sections.forEach(section => {
        totalCompletion += (sectionCompletion[section.id] || 0);
      });
      
      groups[key].completion = Math.round(totalCompletion / groups[key].sections.length);
    });
    
    return groups;
  }, [sections, sectionCompletion, currentSection]);

  // Detect section group changes and automatically open the correct accordion
  useEffect(() => {
    if (sections[currentSection]) {
      const id = sections[currentSection].id;
      let groupToOpen = null;
      
      if (id.startsWith('gsa-')) {
        groupToOpen = 'gsa';
      } else if (id.startsWith('at-')) {
        groupToOpen = 'academic';
      } else if (id.startsWith('track-')) {
        groupToOpen = 'other';
      } else if (id.startsWith('interest-')) {
        groupToOpen = 'interest';
      }
      
      if (groupToOpen) {
        setOpenGroup(groupToOpen);
      }
    }
  }, [currentSection, sections]);

  // Toggle accordion group
  const toggleGroup = (groupName) => {
    setOpenGroup(prevGroup => prevGroup === groupName ? null : groupName);
  };
  
  // Render section list item
  const renderSection = (section, index) => {
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
        className={`border w-full text-left px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-lg flex items-center justify-between border ${
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
          {completion === 100 ? (
            <span className="text-green-600">
              <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {/* <path d="M5 13l4 4L19 7"></path> */}
              </svg>
            </span>
          ) : (
            <>
              <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${completion}%` }} 
                  className="h-full rounded-full bg-yellow-500"
                ></div>
              </div>
              <span className="ml-1 text-xs font-medium text-yellow-600">{completion}%</span>
            </>
          )}
        </div>
      </motion.button>
    );
  };

  // Update the colors in the section navigator component
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md p-3 sm:p-5 mb-4 border border-[#1D63A1]/20 flex flex-col"
    >
      <div className="mb-3 text-sm font-medium text-[#232D35] flex items-center">
        <svg className="w-5 h-5 mr-2 text-[#1D63A1] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span className="truncate">Assessment Sections</span>
      </div>
      
      <div className="text-xs space-y-2 flex-grow overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Map through section groups as accordions */}
        {Object.keys(sectionGroups).map(groupKey => {
          const group = sectionGroups[groupKey];
          if (group.sections.length === 0) return null;
          
          const isOpen = openGroup === groupKey;
          
          return (
            <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className={`w-full px-3 py-2 flex justify-between items-center ${
                  isOpen 
                    ? 'bg-[#232D35] text-gray-800' 
                    : 'bg-gray-50 text-gray-700 hover:bg-[#232D35]/10'
                } transition-colors duration-200`}
                onClick={() => toggleGroup(groupKey)}
              >
                <div className=" flex items-center">
                  <span className="text-start font-medium">{group.title}</span>
                </div>
                
                <div className="flex items-center mr-2">
                  {group.completion === 100 ? (
                    <span className="text-green-600">
                      <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </span>
                  ) : (
                    <>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${group.completion}%` }} 
                          className="h-full rounded-full bg-[#1D63A1]"
                        ></div>
                      </div>
                      <span className="ml-1 text-xs">{group.completion}%</span>
                    </>
                  )}
                </div>
                <svg 
                  className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Animated accordion content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 space-y-1.5 bg-white">
                      {group.sections.map((section, globalIndex) => {
                        const index = sections.findIndex(s => s.id === section.id);
                        return renderSection(section, index);
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SectionNavigator;
