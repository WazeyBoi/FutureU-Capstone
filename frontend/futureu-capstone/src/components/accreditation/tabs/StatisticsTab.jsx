import React from "react";

const StatisticsTab = ({ filteredPrograms, statsVisible }) => {
  // Calculate statistics
  const level4Programs = filteredPrograms.filter(p => p.level === 4).length;
  const level3Programs = filteredPrograms.filter(p => p.level === 3).length;
  const level2Programs = filteredPrograms.filter(p => p.level === 2).length;
  const level1Programs = filteredPrograms.filter(p => p.level === 1).length;
  const coePrograms = filteredPrograms.filter(p => p.recognition === "COE").length;
  const codPrograms = filteredPrograms.filter(p => p.recognition === "COD").length;
  const noRecognitionPrograms = filteredPrograms.filter(p => !p.recognition).length;
  const totalPrograms = filteredPrograms.length;

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Accreditation Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accreditation Level Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Accreditation Level Distribution</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs mr-3">4</div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Level 4</span>
                  <span className="text-sm text-gray-700">{level4Programs} programs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`bg-amber-500 h-2.5 rounded-full transition-all duration-1000 ease-out ${statsVisible ? '' : 'w-0'}`} 
                    style={{ width: statsVisible ? `${(level4Programs / totalPrograms) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs mr-3">3</div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Level 3</span>
                  <span className="text-sm text-gray-700">{level3Programs} programs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`bg-amber-500 h-2.5 rounded-full transition-all duration-1000 ease-out delay-100 ${statsVisible ? '' : 'w-0'}`} 
                    style={{ width: statsVisible ? `${(level3Programs / totalPrograms) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs mr-3">2</div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Level 2</span>
                  <span className="text-sm text-gray-700">{level2Programs} programs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`bg-amber-500 h-2.5 rounded-full transition-all duration-1000 ease-out delay-200 ${statsVisible ? '' : 'w-0'}`} 
                    style={{ width: statsVisible ? `${(level2Programs / totalPrograms) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs mr-3">1</div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Level 1</span>
                  <span className="text-sm text-gray-700">{level1Programs} programs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`bg-amber-500 h-2.5 rounded-full transition-all duration-1000 ease-out delay-300 ${statsVisible ? '' : 'w-0'}`} 
                    style={{ width: statsVisible ? `${(level1Programs / totalPrograms) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recognition Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Recognition Distribution</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 px-3 py-1 rounded-full bg-indigo-700 text-white text-xs font-medium mr-3">COE</div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Center of Excellence</span>
                  <span className="text-sm text-gray-700">{coePrograms} programs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`bg-indigo-700 h-2.5 rounded-full transition-all duration-1000 ease-out ${statsVisible ? '' : 'w-0'}`} 
                    style={{ width: statsVisible ? `${(coePrograms / totalPrograms) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium mr-3">COD</div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Center of Development</span>
                  <span className="text-sm text-gray-700">{codPrograms} programs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out delay-100 ${statsVisible ? '' : 'w-0'}`} 
                    style={{ width: statsVisible ? `${(codPrograms / totalPrograms) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 px-3 py-1 rounded-full bg-gray-500 text-white text-xs font-medium mr-3">None</div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">No Special Recognition</span>
                  <span className="text-sm text-gray-700">{noRecognitionPrograms} programs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`bg-gray-500 h-2.5 rounded-full transition-all duration-1000 ease-out delay-200 ${statsVisible ? '' : 'w-0'}`} 
                    style={{ width: statsVisible ? `${(noRecognitionPrograms / totalPrograms) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab; 