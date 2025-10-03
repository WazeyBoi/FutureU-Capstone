import React from 'react';
import { BookOpen, School } from 'lucide-react';

const HeroHeader = ({ totalPrograms, totalSchools }) => {
  return (
    <div className="relative bg-[#2B3E4E] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/src/assets/pattern-bg.png')] opacity-10 pointer-events-none"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center animate-fade-in-up">
          <span className="text-[#FFB71B]">Academic Explorer</span>
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 text-center text-white/90 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          Discover, compare, and explore top schools and programs in Cebu. Find your perfect academic path with powerful search and insights.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <div className="bg-[#1B2836]/80 bg-opacity-95 backdrop-blur-sm rounded-lg p-6 shadow-lg flex flex-col items-center transition-colors duration-200 hover:scale-105">
            <BookOpen className="text-[#FFB71B] w-10 h-10 mb-2" />
            <div className="text-3xl font-bold text-white">{totalPrograms}</div>
            <div className="text-lg text-gray-100">Programs</div>
          </div>
          <div className="bg-[#1B2836]/80 bg-opacity-95 backdrop-blur-sm rounded-lg p-6 shadow-lg flex flex-col items-center transition-colors duration-200 hover:scale-105">
            <School className="text-[#FFB71B] w-10 h-10 mb-2" />
            <div className="text-3xl font-bold text-white">{totalSchools}</div>
            <div className="text-lg text-gray-100">Schools</div>
          </div>
        </div>
      </div>
      {/* Decorative wave divider */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#f9fafb"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroHeader;