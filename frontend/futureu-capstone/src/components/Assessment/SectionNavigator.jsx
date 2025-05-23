import React, { useState, useMemo, useEffect } from 'react';
import { Brain, GraduationCap, Compass, FileSpreadsheet, Wrench, Microscope, Palette, Users, TrendingUp, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const SectionNavigator = ({ sections, currentSection, onSectionChange, sectionCompletion, onNavigateToQuestion, userAnswers, currentSectionPage = 1, currentSectionTotalPages = 1 }) => {
  // Group sections by type
  const [openGroup, setOpenGroup] = useState(null);
  const [openSection, setOpenSection] = useState({}); // { groupKey: sectionId }

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
        title: "Interest Assessment",
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
        // Open the subsection for the current section
        setOpenSection(prev => ({
          ...prev,
          [groupToOpen]: id
        }));
      }
    }
  }, [currentSection, currentSectionPage, sections]);

  // Toggle accordion group
  const toggleGroup = (groupName) => {
    setOpenGroup(prevGroup => prevGroup === groupName ? null : groupName);
  };

  // Toggle section accordion within group
  const toggleSection = (groupKey, sectionId) => {
    setOpenSection(prev => ({
      ...prev,
      [groupKey]: prev[groupKey] === sectionId ? null : sectionId
    }));
  };

  // Render item numbers for a section
  const renderSectionItems = (section, sectionIndex) => {
    const numItems = section.questions ? section.questions.length : 0;
    if (!numItems) return null;
    // Calculate how many are answered for this section
    const answeredCount = section.questions.filter(
      q => userAnswers && userAnswers[q.questionId] !== undefined && userAnswers[q.questionId] !== null && userAnswers[q.questionId] !== ""
    ).length;
    const progress = numItems === 0 ? 0 : Math.round((answeredCount / numItems) * 100);
    // Determine progress bar color
    let progressBarColor = "bg-gray-300";
    if (progress > 75) {
      progressBarColor = "bg-green-500";
    } else if (progress > 50) {
      progressBarColor = "bg-blue-500";
    } else if (progress > 0) {
      progressBarColor = "bg-yellow-500";
    }
    return (
      <div className="mt-2 px-2">
        {/* Progress bar for answered questions */}
        <div className="w-full h-2 mb-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${progressBarColor}`}
            style={{
              width: `${progress}%`
            }}
          ></div>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: numItems }).map((_, idx) => {
            const question = section.questions[idx];
            const isAnswered = userAnswers && question && userAnswers[question.questionId] !== undefined && userAnswers[question.questionId] !== null && userAnswers[question.questionId] !== "";
            const isCurrent = currentSection === sectionIndex && section.currentQuestionIndex === idx;
            return (
              <button
                key={idx}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all relative
                  ${isCurrent
                    ? 'bg-[#1D63A1] text-white border-[#1D63A1]'
                    : isAnswered
                      ? 'bg-gradient-to-r from-green-50 to-green-50 text-green-700'
                      : 'bg-white text-[#232D35] border-[#1D63A1]/30 hover:bg-[#1D63A1]/10'
                  }`}
                onClick={() => {
                  if (onNavigateToQuestion) {
                    onNavigateToQuestion(sectionIndex, idx);
                  } else {
                    onSectionChange(sectionIndex);
                  }
                }}
                title={
                  isCurrent
                    ? `Currently on item ${idx + 1}`
                    : isAnswered
                      ? `Answered item ${idx + 1}`
                      : `Go to item ${idx + 1}`
                }
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render section as an accordion inside group
  const renderSectionAccordion = (section, sectionIndex, groupKey) => {
    const isSectionOpen = openSection[groupKey] === section.id;
    const completion = sectionCompletion[section.id] || 0;
    const isActive = sectionIndex === currentSection;

    // Color refinement for section states
    let sectionClass = "w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ";
    if (isActive) {
      // Active: blue border, blue bg, white text, subtle shadow
      sectionClass += "border-2 border-[#2563eb] bg-gradient-to-r from-[#2563eb]/60 to-[#1D63A1]/60 text-white shadow-lg";
    } else if (completion === 100) {
      // Completed: green border, green bg, dark green text
      sectionClass += "border-2 border-green-500 bg-gradient-to-r from-green-100 to-green-200 text-green-900 shadow";
    } else if (completion > 0) {
      // In progress: yellow border, yellow bg, dark yellow text
      sectionClass += "border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800";
    } else {
      // Default: gray border, white bg, dark text
      sectionClass += "border border-gray-200 bg-white text-[#232D35] hover:bg-gray-50 hover:border-[#1D63A1]/30";
    }

    return (
      <div key={section.id} className="mb-1.5">
        <button
          className={sectionClass}
          onClick={() => {
            toggleSection(groupKey, section.id);
            if (typeof onSectionChange === "function") {
              onSectionChange(sectionIndex);
            }
          }}
        >
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="truncate" title={section.title}>{section.title}</span>
          </div>
          <div className="flex items-center ml-auto">
            {/* <span className="ml-2 text-xs">{section.questions ? section.questions.length : 0} items</span> */}
            <svg
              className={`h-4 w-4 ml-2 transition-transform duration-300 ${isSectionOpen ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
        <AnimatePresence>
          {isSectionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {renderSectionItems(section, sectionIndex)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
        <svg className="w-5 h-5 mr-2 text-[#232D35] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                    ? 'bg-gradient-to-r from-[#1D63A1]/5 to-[#1D63A1]/5 text-[#232D35] shadow-md'
                    : isCompleted
                      ? 'bg-gradient-to-r from-green-50 to-green-50 text-green-800 hover:bg-green-200'
                      : 'bg-gradient-to-r from-[#232D35]/5 to-[#1D63A1]/10 text-gray-700 hover:bg-[#232D35]/15'
                }`}
                onClick={() => toggleGroup(groupKey)}
              >
                {/* Icon and title on the left */}
                <div className="flex items-center">
                  <span className={`mr-3 p-2 rounded-full ${isOpen ? 'bg-white' : 'bg-white'}`}>
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
                    <span className={`ml-1 text-xs font-bold ${
                        group.completion > 75 ? 'text-green-500' : 
                        group.completion > 50 ? 'text-blue-500' : 
                        group.completion > 0 ? 'text-yellow-500' : 'text-gray-800'
                    }`}>{group.completion}%</span>
                  </div>
                )}
                
                {/* Dropdown arrow */}
                <svg 
                  className={`h-4 w-4 transition-transform duration-300 text-black ${isOpen ? 'transform rotate-180' : ''}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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
                        return renderSectionAccordion(section, index, groupKey);
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
