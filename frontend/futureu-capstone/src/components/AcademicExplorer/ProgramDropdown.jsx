import React from 'react';
import { BookOpen } from 'lucide-react';

const ProgramDropdown = ({ 
  show, 
  programs, 
  programSearchTerm, 
  selectedProgram, 
  onProgramChange, 
  onClose 
}) => {
  if (!show) return null;

  const filteredPrograms = programs
    .filter(program =>
      program.programName.toLowerCase().includes(programSearchTerm.toLowerCase())
    )
    .sort((a, b) => a.programName.localeCompare(b.programName));

  return (
    <div
      className="absolute mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 border border-gray-100 dark:border-gray-700 w-full animate-slide-down"
      style={{
        maxHeight: '20rem',
        overflowY: 'auto',
        minHeight: '6rem',
      }}
    >
      {filteredPrograms.map((program) => (
        <button
          key={program.programId}
          onMouseDown={() => {
            onProgramChange(program.programId);
            onClose();
          }}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 mb-1 transition-colors ${
            selectedProgram === program.programId
              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500'
              : ''
          }`}
        >
          <BookOpen
            className={`w-5 h-5 mr-3 flex-shrink-0 ${
              selectedProgram === program.programId
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          />
          <span
            className={`${
              selectedProgram === program.programId
                ? 'font-medium text-indigo-700 dark:text-indigo-300'
                : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            {program.programName}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ProgramDropdown;