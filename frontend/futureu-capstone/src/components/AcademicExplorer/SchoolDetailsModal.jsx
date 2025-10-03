import React from 'react';
import { X, MapPin, School, Info, BookOpen } from 'lucide-react';
import { schoolLogos } from './constants';
import { getSchoolBackground } from './utils';

const SchoolDetailsModal = ({ 
  show, 
  onClose, 
  school, 
  selectedProgramDetails, 
  programs, 
  selectedProgram 
}) => {
  if (!show || !school) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/40 dark:bg-gray-900/60 flex items-center justify-center z-[100] p-2">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full relative border border-gray-200 dark:border-gray-700 animate-fade-in-up overflow-hidden h-[80vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 p-1.5 rounded-full hover:bg-white dark:hover:bg-gray-700 z-10 shadow"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Banner */}
        <div className="h-32 bg-[#2B3E4E] relative overflow-hidden w-full">
          {getSchoolBackground(school.name) ? (
            <img 
              src={getSchoolBackground(school.name)} 
              alt={`${school.name} campus`}
              className="w-full h-full object-cover object-center opacity-40"
            />
          ) : (
            <div className="absolute inset-0 bg-[#2B3E4E] opacity-90"></div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-4 py-2 text-center">
              <h2 className="text-white text-2xl font-bold text-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {school.name}
              </h2>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-4 pb-4 relative">
          {/* Logo */}
          <div className="absolute -top-10 right-4">
            {schoolLogos[school.schoolId] ? (
              <img 
                src={schoolLogos[school.schoolId]} 
                alt={`${school.name} logo`}
                className="w-25 h-25 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
              />
            ) : (
              <div className="w-25 h-25 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full shadow-lg">
                <School className="w-24 h-24 text-[#2B3E4E]" />
              </div>
            )}
          </div>
          
          {/* Location */}
          <div className="pt-10 pb-2 flex items-center text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 mr-1 text-[#FFB71B]" />
              {school.location}
            </div>
            {school.type && (
              <div className="flex items-center text-gray-600 dark:text-gray-300 ml-4">
                <School className="w-4 h-4 mr-1 text-[#FFB71B]" />
                {school.type}
              </div>
            )}
          </div>
          
          {/* About */}
          <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg mb-4 h-[20vh] flex flex-col justify-center">
            <h3 className="text-base font-semibold text-[#2B3E4E] dark:text-[#FFB71B] mb-2 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              About the School
            </h3>
            <div className="flex-1 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {school.description || 'No description available for this school.'}
              </p>
            </div>
          </div>
          
          {/* Program Description */}
          <div className="bg-[#2B3E4E]/5 dark:bg-[#2B3E4E]/20 p-3 h-[27vh] rounded-lg border border-[#2B3E4E]/10 dark:border-[#2B3E4E]/30 mb-4 shadow relative overflow-hidden flex flex-col justify-center items-center">
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-[#FFB71B]/40 to-[#2B3E4E]/10 rounded-full blur-xl opacity-60 pointer-events-none"></div>
            
            {/* Left-aligned heading */}
            <div className="w-full">
              <h3 className="text-base font-extrabold text-[#2B3E4E] dark:text-[#FFB71B] flex gap-2 tracking-tight mb-3">
                <BookOpen className="w-5 h-5 mr-1 text-[#FFB71B] drop-shadow" />
                Program Description
              </h3>
            </div>
            
            {/* Top: badges and program name */}
            <div className="flex flex-col items-center w-full">
              <span className="uppercase text-[10px] font-semibold tracking-wider text-[#2B3E4E]/70 dark:text-[#FFB71B]/80 bg-white/60 dark:bg-gray-800/60 px-1.5 py-0.5 rounded mb-2">
                Selected Program
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#FFB71B]/90 to-[#FFB71B]/60 text-[#2B3E4E] dark:text-[#2B3E4E] font-bold shadow text-sm border border-[#FFB71B] mb-2">
                <BookOpen className="w-4 h-4 mr-1 text-[#2B3E4E]" />
                {selectedProgramDetails?.programName ||
                  programs.find(p => p.programId === selectedProgram)?.programName ||
                  "N/A"}
              </span>
              <hr className="border-t border-[#FFB71B]/30 mb-2 w-full" />
            </div>

            {/* Center only the description vertically */}
            <div className="flex-1 flex items-center w-full">
              <p className="text-gray-800 dark:text-gray-200 text-base leading-snug font-medium drop-shadow-sm line-clamp-4 text-center w-full">
                {selectedProgramDetails?.description ||
                  selectedProgramDetails?.programDescription ||
                  "Select a program from the dropdown menu to see its description."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailsModal;