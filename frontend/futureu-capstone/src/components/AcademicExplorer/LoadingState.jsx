import React from 'react';

export const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
    ))}
  </div>
);

export const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-3 flex-grow">
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
  </div>
);