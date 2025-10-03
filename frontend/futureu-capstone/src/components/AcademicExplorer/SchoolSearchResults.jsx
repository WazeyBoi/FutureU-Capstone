import React from 'react';
import { Info, BookOpen, MapPin, School, Search, X, ChevronRight } from 'lucide-react';
import { schoolLogos } from './constants';
import { getSchoolBackground } from './utils';
import { NoProgramsFound } from './EmptyState';

const SchoolSearchResults = ({ 
  searchedSchool, 
  schoolPrograms, 
  programsOfferedSearchTerm, 
  setProgramsOfferedSearchTerm 
}) => {
  const filteredSchoolPrograms = schoolPrograms.filter(program =>
    program.programName.toLowerCase().includes(programsOfferedSearchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-auto animate-fade-in-up">
      {/* School Header with Background */}
      <div className="relative w-full h-96 rounded-xl mb-8 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          {(() => {
            const bgImage = getSchoolBackground(searchedSchool.name);
            if (bgImage) {
              return (
                <img 
                  src={bgImage} 
                  alt={`${searchedSchool.name} campus`}
                  className="w-full h-full object-cover"
                />
              );
            } else {
              return (
                <div className="w-full h-full bg-gradient-to-r from-[#2B3E4E] to-[#1b2d3d]"></div>
              );
            }
          })()}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.7)]"></div>
        </div>

        {/* School Logo and Info - Left aligned */}
        <div className="absolute inset-0 flex flex-row items-center justify-start px-8 sm:px-12 md:px-16 z-30">
          {/* School Logo */}
          <div className="mr-6 flex-shrink-0">
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800 overflow-hidden">
              {(() => {
                const logo = schoolLogos[searchedSchool.schoolId];
                if (logo) {
                  return (
                    <img 
                      src={logo} 
                      alt={`${searchedSchool.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  );
                } else {
                  return (
                    <School className="w-24 h-24 text-[#2B3E4E]" />
                  );
                }
              })()}
            </div>
          </div>

          {/* Text Container (Name and Location) */}
          <div className="flex flex-col">
            {/* School Name */}
            <h2 className="text-2xl md:text-3xl font-bold text-white text-left text-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.4)' }}>
              {searchedSchool.name}
            </h2>
            
            {/* School Location */}
            <div className="flex items-center text-white/90 mt-2 text-sm md:text-base">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{searchedSchool.location}</span>
            </div>

            {/* School Type */}
            {searchedSchool.type && (
              <div className="flex items-center text-white/90 mt-2 text-sm md:text-base">
                <School className="w-5 h-5 mr-2" />
                <span>{searchedSchool.type}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* School Description */}
      <div className="bg-gray-50 dark:bg-gray-700/40 p-6 rounded-xl mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#2B3E4E] dark:text-[#FFB71B] mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          About {searchedSchool.name}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {searchedSchool.description || 'No description available for this school.'}
        </p>
      </div>
      
      {/* Programs Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-[#2B3E4E] dark:text-white flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-[#FFB71B]" />
          Programs Offered ({filteredSchoolPrograms.length})
        </h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search program..."
            value={programsOfferedSearchTerm}
            onChange={e => setProgramsOfferedSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-2 w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm text-sm"
          />
          {programsOfferedSearchTerm && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 dark:hover:text-[#FFB71B] rounded-full p-1 transition-colors duration-150"
              onClick={() => setProgramsOfferedSearchTerm('')}
              tabIndex={-1}
              aria-label="Clear program search"
              style={{ lineHeight: 0, background: 'transparent' }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Programs Grid */}
      {filteredSchoolPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
          {filteredSchoolPrograms.map((program) => (
            <div 
              key={program.programId}
              className="bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600 overflow-hidden transition-shadow cursor-pointer animate-fade-in-up"
            >
              <div className="p-5">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-3 flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-[#FFB71B]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{program.programName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Academic Program</p>
                  </div>
                </div>
                {program.description && (
                  <div className="mt-3 pl-3 border-l-2 border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {program.description}
                    </p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  {program.schoolProgramURL ? (
                    <a
                      href={program.schoolProgramURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2B3E4E] dark:text-[#FFB71B] text-sm font-medium flex items-center hover:underline"
                      style={{ wordBreak: 'break-all' }}
                    >
                      {program.schoolProgramURLType === "department_page"
                        ? "Visit Department Page"
                        : program.schoolProgramURLType === "general_academic_page"
                        ? "Visit Academics Page"
                        : "Visit Program Page"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </a>
                  ) : (
                    <button
                      className="text-gray-400 dark:text-gray-500 text-sm font-medium flex items-center cursor-not-allowed"
                      disabled
                      title="No online information available for this program"
                    >
                      No Online Info
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <NoProgramsFound programsOfferedSearchTerm={programsOfferedSearchTerm} />
      )}
    </div>
  );
};

export default SchoolSearchResults;