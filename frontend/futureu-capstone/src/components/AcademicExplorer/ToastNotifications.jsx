import React from 'react';
import { School, AlertCircle } from 'lucide-react';

export const SchoolsFoundToast = ({ count, visible }) => {
  if (!visible || count === 0) return null;
  
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-4 rounded-lg shadow-xl z-50 animate-fade-in-up backdrop-blur-sm">
      <div className="flex items-center">
        <School className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400" />
        <p className="font-medium">{count} {count === 1 ? 'school' : 'schools'} found</p>
      </div>
    </div>
  );
};

export const ErrorToast = ({ error, visible }) => {
  if (!visible || !error) return null;
  
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-100 dark:bg-red-900/80 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-lg shadow-xl z-50 animate-fade-in-up backdrop-blur-sm">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 mr-3" />
        <p className="font-medium">{error}</p>
      </div>
    </div>
  );
};