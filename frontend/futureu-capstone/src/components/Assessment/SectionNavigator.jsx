import React from 'react';

const SectionNavigator = ({ sections, currentSection, onSectionChange, sectionCompletion }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="mb-2 text-sm font-medium text-gray-700">Assessment Sections</div>
      <div className="space-y-1 max-h-[500px] overflow-y-auto">
        {sections.map((section, index) => {
          const isActive = index === currentSection;
          const completion = sectionCompletion[section.id] || 0;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(index)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : completion === 100
                    ? 'bg-green-50 text-green-700'
                    : completion > 0
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'hover:bg-gray-100'
              }`}
            >
              <span className="truncate">{section.title}</span>
              <span className={`text-xs font-medium ${
                completion === 100 
                  ? 'text-green-600' 
                  : completion > 0 
                    ? 'text-yellow-600' 
                    : 'text-gray-500'
              }`}>
                {completion}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SectionNavigator;
