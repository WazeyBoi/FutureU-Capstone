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
        title: "Career Assessment",
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
    if (progress === 100) {
      progressBarColor = "bg-[#FFB71B]";
    } else if (progress > 0) {
      progressBarColor = "bg-[#2B3E4E]";
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
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: numItems }).map((_, idx) => {
            const question = section.questions[idx];
            const isAnswered = userAnswers && question && userAnswers[question.questionId] !== undefined && userAnswers[question.questionId] !== null && userAnswers[question.questionId] !== "";
            const isCurrent = currentSection === sectionIndex && section.currentQuestionIndex === idx;
            return (
              <button
                key={idx}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all relative
                  ${isCurrent
                    ? 'text-white shadow-md'
                    : isAnswered
                      ? 'bg-[#FFB71B]/20 text-[#2B3E4E] shadow-md'
                      : 'shadow-md'
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
    let sectionClass = "w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ";
    if (isActive) {
      // Active: dark blue background with white text
      sectionClass += "bg-[#2B3E4E] text-white shadow-lg";
    } else if (completion === 100) {
      // Completed: subtle badge instead of bold color
      sectionClass += "bg-gray-100 text-gray-700 hover:bg-gray-200";
    } else if (completion > 0) {
      // In progress: light dark blue background
      sectionClass += "bg-[#2B3E4E]/20 text-[#2B3E4E]";
    } else {
      // Default: light gray background
      sectionClass += "bg-gray-100 text-gray-600 hover:bg-gray-200";
    }

    return (
      <div key={section.id} className="bordermb-1.5">
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
            <span className="text-xs leading-tight" title={section.title}>{section.title}</span>
          </div>
          <div className="flex items-center ml-auto">
            {/* Completion badge for completed sections */}
            {completion === 100 && (
              <span className="mr-2 text-xs px-1.5 py-0.5 font-bold text-white bg-[#FFB71B] rounded-md">
                ✓
              </span>
            )}
            {/* <span className="ml-2 text-xs">{section.questions ? section.questions.length : 0} items</span> */}
            <svg
              className={`h-4 w-4 ml-2 transition-transform duration-300 ${isSectionOpen ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              {/* Replaced invalid path with valid Heroicons chevron-down */}
              <path fillRule="evenodd" d="M6.293 8.293a1 1 0 011.414 0L10 10.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414z" clipRule="evenodd" />
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
      className="bg-white rounded-xl shadow-xl p-2 sm:p-3 mb-4 flex flex-col"
    >
      <div className="mb-3 text-xs font-medium text-[#232D35] flex items-center border-b border-gray-200 pb-2">
        {/* Replaced invalid SVG with Lucide ClipboardList icon */}
        <ClipboardList className="w-6 h-6 mr-1 text-[#232D35] flex-shrink-0" />
        <span className="truncate text-sm p-2">Assessment Sections</span>
      </div>
      
      <div className="text-xs space-y-2 flex-grow overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Map through section groups as accordions */}
        {Object.keys(sectionGroups).map(groupKey => {
          const group = sectionGroups[groupKey];
          if (group.sections.length === 0) return null;
          
          const isOpen = openGroup === groupKey;
          const isCompleted = group.completion === 100;
          
          return (
            <div key={groupKey} className={`rounded-lg overflow-hidden ${
              isCompleted 
                ? 'bg-white shadow-lg' 
                : isOpen
                  ? 'bg-white shadow-md'
                  : 'bg-white shadow-sm'
            } transition-all duration-300`}>
              <button 
                className={`w-full px-3 py-2 flex items-center transition-all duration-200 ${
                  isOpen 
                    ? 'bg-[#2B3E4E] text-white'
                    : isCompleted
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => toggleGroup(groupKey)}
              >
                {/* Icon and title on the left */}
                <div className="flex items-center">
                  <span className={`mr-2 p-1.5 rounded-full ${isOpen ? 'bg-white/20' : 'bg-white'}`}>
                    <div className={isOpen ? 'brightness-0 invert' : ''}>
                      {group.icon}
                    </div>
                  </span>
                  <span className={`text-start font-medium text-xs leading-tight ${isOpen ? 'text-white' : 'text-black'}`}>{group.title}</span>
                </div>
                
                {/* Flex spacer to push the remaining elements to the right */}
                <div className="flex-grow"></div>
                
                {/* Completion badge on the right */}
                {isCompleted && (
                  <span className="mr-2 text-xs px-2 py-0.5 font-bold text-white bg-[#FFB71B] rounded-md">
                    ✓
                  </span>
                )}
                
                {/* Progress indicator (if not completed) */}
                {!isCompleted && (
                  <div className="flex items-center mr-2">
                    <div className={`w-12 h-1.5 rounded-full overflow-hidden mr-2 ${isOpen ? 'bg-white/20' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full rounded-full transition-all ${isOpen ? 'bg-white' : 'bg-[#2B3E4E]'}`}
                        style={{ width: `${group.completion}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-bold ${isOpen ? 'text-white' : 'text-gray-700'}`}>
                      {group.completion}%
                    </span>
                  </div>
                )}
                
                {/* Dropdown arrow */}
                <svg 
                  className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'text-white' : 'text-gray-700'}`}
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  aria-hidden="true"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  {/* Replaced invalid path with valid Heroicons chevron-down */}
                  <path fillRule="evenodd" d="M6.293 8.293a1 1 0 011.414 0L10 10.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414z" clipRule="evenodd" />
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
                    <div className={`p-2 space-y-1 ${isCompleted ? 'bg-gray-50' : 'bg-white'}`}>
                      {group.sections.map((section, globalIndex) => {
                        const index = sections.findIndex(s => s.id === section.id);
                        // If group has only one section, just render the items directly without section accordion
                        if (group.sections.length === 1) {
                          return renderSectionItems(section, index);
                        }
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
