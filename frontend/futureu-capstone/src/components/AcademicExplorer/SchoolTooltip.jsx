import React from 'react';
import { School, BookOpen, ChevronRight } from 'lucide-react';
import { schoolLogos } from './constants';

const SchoolTooltip = ({ visible, school, position }) => {
  if (!visible || !school) return null;

  const schoolLogo = schoolLogos[school.schoolId];

  return (
    <div 
      className="fixed z-50 w-[400px] rounded-xl shadow-2xl p-6 transform transition-all duration-200 ease-in-out backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700"
      style={{
        top: position.y + 'px',
        left: position.x + 'px'
      }}
    >
      <div className="flex items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
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
        <div className="ml-4">
          <h4 className="font-bold text-xl text-gray-900 dark:text-white">{school.name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{school.location}</p>
        </div>
      </div>
      <div className="space-y-5">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">About</h5>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {school.description || 'No description available'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2" />
              <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">Requirements</h5>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {school.admissionRequirements || 'Not specified'}
            </p>
          </div>
          {school.tuitionFee && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 mr-2 text-yellow-500">💰</div>
                <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">Tuition</h5>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{school.tuitionFee}</p>
            </div>
          )}
        </div>
        <div className="bg-gradient-to-r from-[#2B3E4E]/5 to-[#FFB71B]/5 p-3 rounded-lg border border-[#FFB71B]/20">
          <div className="text-center">
            <span className="text-sm font-medium text-[#2B3E4E] dark:text-gray-300 block mb-1">
              🎓 Explore Available Programs
            </span>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <span>Virtual Tour</span>
              <span>•</span>
              <span>Program Guide</span>
              <span>•</span>
              <span>Contact Info</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolTooltip;