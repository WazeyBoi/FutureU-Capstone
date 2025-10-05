import React from 'react';
import { BookOpen, Info, School, ChevronRight } from 'lucide-react';
import { LoadingSkeleton } from './LoadingState';

const ProgramSidePanel = ({ 
  onHide, 
  selectedProgramDetails, 
  programs, 
  selectedProgram, 
  loadingProgramDetails, 
  filteredSchoolsCount 
}) => {
  return (
    <div className="h-full w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md animate-slide-in">
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-[#2B3E4E] dark:text-white">Program Details</h3>
          <button
            onClick={onHide}
            className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="Hide program panel"
          >
            <ChevronRight className="w-4 h-4 transform rotate-180" />
          </button>
        </div>
        
        {loadingProgramDetails ? (
          <LoadingSkeleton />
        ) : selectedProgramDetails ? (
          <div className="flex flex-col h-full">
            {/* Program Header */}
            <div className="mb-6 text-center border-b border-gray-200 dark:border-gray-700 pb-5">
              <div className="w-20 h-20 rounded-full bg-[#2B3E4E] flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-10 h-10 text-[#FFB71B]" />
              </div>
              <div className="text-sm uppercase tracking-wider text-[#2B3E4E] dark:text-[#FFB71B] font-semibold">
                Academic Program
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-2">
                {selectedProgramDetails?.programName ||
                  programs.find(p => p.programId === selectedProgram)?.programName ||
                  "Loading..."}
              </h2>
            </div>

            {/* Program Content */}
            <div className="flex-grow flex flex-col gap-5">
              {/* Program Description Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center mb-2">
                  <Info className="w-4 h-4 mr-1.5 text-[#FFB71B]" />
                  Program Description
                </h4>
                <div className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pr-2 text-justify whitespace-pre-line">
                    {selectedProgramDetails?.description ||
                      selectedProgramDetails?.programDescription ||
                      "This program prepares students for careers in this field."}
                  </p>
                </div>
              </div>

              {/* Available Schools Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-md mt-auto">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-[#FFB71B]/10 dark:bg-[#FFB71B]/20 flex items-center justify-center mr-3">
                      <School className="w-8 h-8 text-[#FFB71B]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Available Schools</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">offering this program</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-[#FFB71B] block">{filteredSchoolsCount}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">schools</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 flex-grow flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center mb-3">
              <BookOpen className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No program selected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramSidePanel;