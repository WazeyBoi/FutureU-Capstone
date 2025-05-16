import React, { useState, useMemo, useEffect } from 'react';
import { Brain, GraduationCap, Compass, FileSpreadsheet, Wrench, Microscope, Palette, Users, TrendingUp, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const SectionNavigator = ({ sections, currentSection, onSectionChange, sectionCompletion }) => {
  // Group sections by type
  const [openGroup, setOpenGroup] = useState(null);

  // Organize sections into groups based on their IDs
  const sectionGroups = useMemo(() => {
    const groups = {
      gsa: {
        title: "General Scholastic Aptitude",
        icon: <Brain className="w-5 h-5 text-[#232D35]" />,
        sections: [],
        completion: 0
      },
      academic: {
        title: "Academic Tracks",
        icon: <GraduationCap className="w-5 h-5 text-[#232D35]" />,
        sections: [],
        completion: 0
      },
      other: {
        title: "Other Tracks",
        icon: <Compass className="w-5 h-5 text-[#232D35]" />,
        sections: [],
        completion: 0
      },
      interest: {
        title: "RIASEC",
        icon: <Microscope className="w-5 h-5 text-[#232D35]" />,
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
        <span className="bg-green-200 p-1 rounded-full flex-shrink-0">
          <svg className="h-3.5 w-3.5 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      );
    } else if (completion > 0) {
      statusIcon = (
        <span className="bg-yellow-100 p-1 rounded-full flex-shrink-0 border-2 border-yellow-300">
          <svg className="h-3.5 w-3.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> */}
          </svg>
        </span>
      );
    } else {
      statusIcon = (
        <span className="bg-gray-100 p-1 rounded-full flex-shrink-0 border border-gray-200">
          <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> */}
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
        className={`w-full text-left px-2 py-2.5 text-xs sm:text-sm rounded-lg flex items-center justify-between ${
          isActive 
            ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium shadow-sm' 
            : completion === 100
              ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300'
              : completion > 0
                ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:border-yellow-300'
                : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        } transition-all duration-200 mb-1.5`}
      >
        <div className="flex items-center space-x-1.5 min-w-0">
          {statusIcon}
          <span className="truncate font-medium" title={section.title}>{section.title}</span>
        </div>
        
        <div className="flex items-center flex-shrink-0 ml-auto">
          {completion === 100 ? (
            <span className="rounded-full p-1">
              {/* <svg className="h-4 w-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg> */}
            </span>
          ) : (
            <>
              <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${completion}%` }} 
                  className={`h-full rounded-full ${completion > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}
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
      className="bg-white rounded-xl shadow-lg p-3 sm:p-5 mb-4 border border-[#1D63A1]/20 flex flex-col"
    >
      <div className="mb-4 text-sm font-medium text-[#232D35] flex items-center border-b border-gray-200 pb-3">
        <svg className="w-5 h-5 mr-2 text-[#1D63A1] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span className="truncate">Assessment Sections</span>
      </div>
      
      <div className="text-xs space-y-4 flex-grow overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Map through section groups as accordions */}
        {Object.keys(sectionGroups).map(groupKey => {
          const group = sectionGroups[groupKey];
          if (group.sections.length === 0) return null;
          
          const isOpen = openGroup === groupKey;
          const isCompleted = group.completion === 100;
          
          return (
            <div key={groupKey} className={`rounded-lg overflow-hidden ${
              isCompleted 
                ? 'border-2 border-green-400 bg-green-50/30 shadow-md' 
                : 'border border-gray-200 shadow-sm'
            } transition-all duration-300`}>
              <button 
                className={`w-full px-4 py-3 flex items-center transition-colors duration-200 ${
                  isOpen 
                    ? isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-[#1D63A1] text-white' 
                    : isCompleted
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gradient-to-r from-[#232D35]/5 to-[#1D63A1]/10 text-gray-700 hover:bg-[#232D35]/15'
                }`}
                onClick={() => toggleGroup(groupKey)}
              >
                {/* Icon and title on the left */}
                <div className="flex items-center">
                  <span className={`mr-3 p-2 rounded-full ${isOpen ? 'bg-white/20' : 'bg-white'}`}>
                    {group.icon}
                  </span>
                  <span className="text-black text-start font-medium">{group.title}</span>
                </div>
                
                {/* Flex spacer to push the remaining elements to the right */}
                <div className="flex-grow"></div>
                
                {/* Completion badge on the right */}
                {isCompleted && (
                  <span className={`mr-3 text-xs px-2 py-0.5 font-medium text-green-700 rounded-md bg-green-100`}>
                    Complete
                  </span>
                )}
                
                {/* Progress indicator (if not completed) */}
                {!isCompleted && (
                  <div className="flex items-center mr-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${group.completion}%` }} 
                        className={`h-full rounded-full ${
                          group.completion > 75 ? 'bg-green-500' : 
                          group.completion > 50 ? 'bg-blue-500' : 
                          group.completion > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}
                      ></div>
                    </div>
                    <span className={`ml-1 text-xs font-bold ${isOpen ? 'text-black' : ''}`}>{group.completion}%</span>
                  </div>
                )}
                
                {/* Dropdown arrow */}
                <svg 
                  className={`h-4 w-4 transition-transform duration-300 text-black ${isOpen ? 'transform rotate-180' : ''}`} 
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
                    <div className={`p-3 space-y-1.5 ${isCompleted ? 'bg-green-50' : 'bg-white'}`}>
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
