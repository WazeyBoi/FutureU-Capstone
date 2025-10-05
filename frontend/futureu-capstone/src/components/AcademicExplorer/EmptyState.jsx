import React from 'react';
import { Search, BookOpen, School } from 'lucide-react';
import ohMy from '../../assets/characters/ohMy.svg';
import ohMyLeft from '../../assets/characters/ohMyLeft.svg';

// Empty state for when no programs/schools are selected
export const EmptyStateWithMascots = ({ mascotWiggle }) => (
  <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full h-full min-h-[500px] animate-fade-in-up">
    {/* Left: Program search info */}
    <div className="flex flex-col items-center justify-center w-full md:w-1/2 h-full animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
      <div
        className={`w-48 h-48 mb-6 transition-all duration-300 ${mascotWiggle ? 'mascot-wiggle' : ''}`}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={ohMy}
          alt="Program search mascot"
          className="w-full h-full"
          draggable={false}
        />
      </div>
      <div className="flex flex-row items-center bg-[#FFB71B] text-[#1B2836] px-6 py-4 rounded-lg shadow font-medium text-base max-w-xs min-h-[90px] hover:scale-105 transition-transform duration-300">
        <BookOpen className="w-7 h-7 mr-3 text-[#2B3E4E] flex-shrink-0" />
        <span className="text-left">
          Use the program search bar to browse or search for programs. Selecting a program will display all the schools that offer it.
        </span>
      </div>
    </div>
    {/* Right: School search info */}
    <div className="flex flex-col items-center justify-center w-full md:w-1/2 h-full animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
      <div
        className={`w-48 h-48 mb-6 transition-all duration-300 ${mascotWiggle ? 'mascot-wiggle' : ''}`}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={ohMyLeft}
          alt="School search mascot"
          className="w-full h-full"
          draggable={false}
        />
      </div>
      <div className="flex flex-row items-center bg-[#FFB71B] text-[#1B2836] px-6 py-4 rounded-lg shadow font-medium text-base max-w-xs min-h-[90px] hover:scale-105 transition-transform duration-300">
        <School className="w-7 h-7 mr-3 text-[#2B3E4E] flex-shrink-0" />
        <span className="text-left">
          Use the school search bar to browse or search for schools. Selecting a school will display all the programs it offers.
        </span>
      </div>
    </div>
  </div>
);

// Empty state for no schools found
export const NoSchoolsFound = ({ searchTerm, filterOptions }) => (
  <div className="text-center py-16 animate-fade-in-up">
    <div className="bg-gray-100 dark:bg-gray-700 p-5 rounded-full inline-block mb-5 hover:scale-110 transition-transform duration-300">
      <Search className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No schools found</h3>
    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
      {searchTerm ? 'Try adjusting your search term or filters'
        : filterOptions.locationSearch 
          ? `No schools found matching location "${filterOptions.locationSearch}"`
          : 'Select a program to view available schools'}
    </p>
  </div>
);

// Empty state for no programs found
export const NoProgramsFound = ({ programsOfferedSearchTerm }) => (
  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg animate-fade-in-up">
    <div className="hover:scale-110 transition-transform duration-300 inline-block">
      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-3" />
    </div>
    <p className="text-gray-600 dark:text-gray-400 text-lg">
      {programsOfferedSearchTerm
        ? 'No programs found matching your search.'
        : 'No programs available for this school'}
    </p>
  </div>
);