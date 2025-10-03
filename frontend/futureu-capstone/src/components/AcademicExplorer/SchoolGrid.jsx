import React from 'react';
import { School, MapPin, ChevronRight } from 'lucide-react';
import { schoolLogos } from './constants';
import { getSchoolBackground, getAnimationClass } from './utils';

const SchoolGrid = ({ 
  schools, 
  showProgramSidePanel, 
  onViewDetails
}) => {
  return (
    <div className={`grid gap-6 auto-rows-max transition-all duration-300 ${
      showProgramSidePanel 
        ? 'grid-with-panel grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    }`}>
        {schools.map((school, index) => {
          const schoolLogo = schoolLogos[school.schoolId];
          const schoolBackground = getSchoolBackground(school.name);

          return (
            <div
              key={school.schoolId}
              className={`relative bg-white dark:bg-gray-700 border rounded-xl transition-all duration-300 overflow-hidden ${getAnimationClass(index)} ${
                showProgramSidePanel ? 'hover:scale-[1.02]' : 'hover:scale-105'
              } hover:shadow-lg cursor-pointer border-gray-200 dark:border-gray-600 shadow-sm`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both'
              }}
            >
              {/* School Background Image */}
              <div className="w-full h-48 relative overflow-hidden">
                {schoolBackground ? (
                  <img
                    src={schoolBackground} 
                    alt={`${school.name} campus`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback background for schools without images */}
                <div 
                  className="w-full h-full bg-gradient-to-br from-[#2B3E4E] via-[#1B2836] to-[#0F1419] flex items-center justify-center"
                  style={{ display: schoolBackground ? 'none' : 'flex' }}
                >
                  <School className="w-16 h-16 text-[#FFB71B] opacity-50" />
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70"></div>
                
                {/* School Logo Overlay */}
                <div className="absolute top-4 left-4">
                  {schoolLogo ? (
                    <img
                      src={schoolLogo}
                      alt={`${school.name} logo`}
                      className="w-16 h-16 object-cover rounded-full shadow-lg border-2 border-white dark:border-gray-800"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
                      <School className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                </div>
                
                {/* School name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg line-clamp-2">
                    {school.name}
                  </h3>
                </div>
              </div>

              {/* School Info Card Body */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {school.type || 'University'}
                    </span>
                  </div>
                </div>
                
                {school.location && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{school.location}</span>
                  </div>
                )}

                <div className="mt-3">
                  <button
                    className="flex items-center justify-center w-full bg-[#2B3E4E]/10 dark:bg-[#2B3E4E]/30 text-[#2B3E4E] dark:text-[#FFB71B] hover:bg-[#2B3E4E]/20 dark:hover:bg-[#2B3E4E]/40 py-2.5 px-3 rounded-md transition-colors text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(school);
                    }}
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    View More
                  </button>
                </div>
              </div>

              {/* Hover effect border */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent hover:border-[#FFB71B] transition-colors duration-300 pointer-events-none"></div>
            </div>
          );
        })}
    </div>
  );
};

export default SchoolGrid;