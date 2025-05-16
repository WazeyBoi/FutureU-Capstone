import React from 'react';
import { motion } from 'framer-motion';

const SchoolFilter = ({ schools, selectedSchool, setSelectedSchool }) => {
  return (
    <div className="p-2">
      <h3 className="text-lg font-semibold mb-4">Filter by School</h3>
      
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`py-2 px-4 rounded-full text-sm transition-colors ${
            selectedSchool === 'all'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
          onClick={() => setSelectedSchool('all')}
        >
          All Schools
        </motion.button>
        
        {schools.map((school) => (
          <motion.button
            key={school.schoolId}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`py-2 px-4 rounded-full text-sm transition-colors ${
              selectedSchool === school.schoolId.toString()
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedSchool(school.schoolId.toString())}
          >
            {school.schoolName || school.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SchoolFilter; 