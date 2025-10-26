import React, { useState, useEffect } from "react";
import SchoolCard from "./SchoolCard";
import { Award } from 'lucide-react';

const SchoolsList = ({ schools, selectedSchool, setSelectedSchool, contentAnimated, onViewPrograms, onCompare }) => {
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position to show/hide floating button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100); // Show floating button after scrolling 100px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSchoolSelection = (school) => {
    setSelectedForComparison(prev => {
      if (prev.find(s => s.id === school.id)) {
        return prev.filter(s => s.id !== school.id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, school];
    });
  };

  return (
    <div className="lg:w-full">
      <div className="bg-slate-800 rounded-t-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            Schools
          </h2>
          {selectedForComparison.length >= 2 && (
            <button
              onClick={() => {
                onCompare(selectedForComparison);
                setSelectedForComparison([]);
              }}
              className="flex items-center px-6 py-2.5 bg-[#2B3E4E] hover:bg-[#1a2630] text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-base"
              style={{ 
                backgroundColor: '#2B3E4E',
                boxShadow: '0 4px 6px -1px rgba(43, 62, 78, 0.2), 0 2px 4px -1px rgba(43, 62, 78, 0.1)'
              }}
            >
              <Award className="w-5 h-5 mr-2.5 text-yellow-400" />
              Compare ({selectedForComparison.length})
            </button>
          )}
        </div>
        {selectedForComparison.length > 0 && (
          <div className="mt-2 text-white/80 text-sm">
            {selectedForComparison.length === 1 ? (
              "Click 1-2 more schools to compare"
            ) : selectedForComparison.length === 2 ? (
              "You can select 1 more school or click Compare"
            ) : (
              "Maximum schools selected"
            )}
          </div>
        )}
      </div>
      <div className="bg-gray-50 rounded-b-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school, index) => (
            <div
              key={school.id}
              className={`transition-all duration-300 ease-out transform ${
                contentAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <SchoolCard 
                school={school} 
                onViewPrograms={onViewPrograms}
                isSelected={selectedForComparison.some(s => s.id === school.id)}
                onSelect={toggleSchoolSelection}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Compare Button - Only show when scrolled and schools selected */}
      {selectedForComparison.length >= 2 && isScrolled && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out">
          <button
            onClick={() => {
              onCompare(selectedForComparison);
              setSelectedForComparison([]);
            }}
            className="flex items-center px-8 py-4 bg-[#FFB71B] hover:bg-[#E6A519] text-white rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 font-bold text-lg animate-pulse hover:animate-none"
            style={{ 
              boxShadow: '0 10px 25px -5px rgba(255, 183, 27, 0.4), 0 10px 10px -5px rgba(255, 183, 27, 0.1)'
            }}
          >
            <Award className="w-6 h-6 mr-3 text-white" />
            Compare Schools ({selectedForComparison.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default SchoolsList; 