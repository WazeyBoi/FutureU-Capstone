import React from 'react';
import { MapPin, Globe, ChevronRight, School } from 'lucide-react';
import { schoolLogos } from './constants';
import { getSchoolBackground, getAnimationClass } from './utils';

const SchoolCard = ({ 
  school, 
  index, 
  onMouseEnter, 
  onMouseLeave, 
  onViewDetails 
}) => {
  const schoolLogo = schoolLogos[school.schoolId];
  const schoolBackground = getSchoolBackground(school.name);

  return (
    <div
      className={`relative bg-white dark:bg-gray-700 border rounded-xl transition-all duration-300 overflow-hidden ${getAnimationClass(index)} ${
        'border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg hover:-translate-y-1'
      }`}
      onMouseEnter={(e) => onMouseEnter(school, e)}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex flex-col h-full">
        {/* Top half with image and logo */}
        <div className="relative w-full h-44 bg-blue-100 overflow-hidden">
          {/* Banner image - using a gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-blue-500/10"></div>
          
          {/* School background image */}
          {schoolBackground ? (
            <img 
              src={schoolBackground} 
              alt={`${school.name} campus`}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img 
              src={`https://source.unsplash.com/800x450/?university,school,campus,college&${school.schoolId}`} 
              alt={`${school.name} campus`}
              className="w-full h-full object-cover object-center"
            />
          )}

          {/* Logo positioned in the middle with no white background */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {schoolLogo ? (
              <img 
                src={schoolLogo} 
                alt={`${school.name} logo`}
                className="w-32 h-32 object-cover rounded-full shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full shadow-lg">
                <School className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom half with school information */}
        <div className="p-5 flex flex-col flex-1">
          {/* School name centered */}
          <h3 className="font-bold text-lg text-gray-900 dark:text-white text-center mb-4">{school.name}</h3>
          
          {/* All information in one container with shadow */}
          <div className="space-y-3 bg-white dark:bg-gray-700/60 p-5 rounded-lg mb-4 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="w-5 h-5 mr-3 text-[#FFB71B] flex-shrink-0" />
              <span className="truncate">{school.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Globe className="w-5 h-5 mr-3 text-[#FFB71B] flex-shrink-0" />
              <span>{school.type}</span>
            </div>
          </div>
          
          {/* View More button */}
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
      </div>
    </div>
  );
};

export default SchoolCard;