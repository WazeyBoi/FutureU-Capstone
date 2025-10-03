import React from 'react';
import { X, School, Compass, Building, Globe, ChevronRight } from 'lucide-react';

const WelcomeModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full relative border border-gray-200 dark:border-gray-700 p-0 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 p-2 rounded-full z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-8 sm:p-10">
          <div className="flex items-center mb-4 pr-10">
            <div className="w-12 h-12 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-4">
              <School className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#2B3E4E] dark:text-white">Welcome to Academic Explorer</h2>
          </div>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-8 pl-16 text-left">
            Discover the perfect educational path for your future. Explore programs, compare schools, and find your ideal academic fit.
          </p>
          <div className="space-y-6 mb-8">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-4">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-[#2B3E4E] dark:text-white mb-1">Explore Programs</h3>
                <p className="text-base text-gray-700 dark:text-gray-300">
                  Browse through various academic programs offered by top schools.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-4">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-[#2B3E4E] dark:text-white mb-1">Compare Schools</h3>
                <p className="text-base text-gray-700 dark:text-gray-300">
                  Select up to 3 schools to compare facilities, programs, and more.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-[#2B3E4E] dark:text-white mb-1">Virtual Tours</h3>
                <p className="text-base text-gray-700 dark:text-gray-300">
                  Experience campuses virtually before making your decision.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] font-bold rounded-md transition-colors flex items-center justify-center shadow-md"
          >
            <span className="text-lg mr-2">Start Exploring</span>
            <div className="w-7 h-7 rounded-full bg-[#2B3E4E] flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;