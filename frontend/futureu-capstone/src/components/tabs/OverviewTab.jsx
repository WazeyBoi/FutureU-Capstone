import React from 'react';
import { motion } from 'framer-motion';

const OverviewTab = ({ results, getScoreColor, getScoreBgColor }) => {
  // Priority sorting function for section types
  const getSectionTypePriority = (sectionType) => {
    const type = (sectionType || '').toLowerCase();
    if (type.includes('gsa')) return 1;
    if (type.includes('academic')) return 2;
    if (type.includes('others')) return 3;
    return 4; // Any other types come last
  };

  // Function to determine RIASEC code based on highest scores
  const getRiasecCode = () => {
    if (!results.assessmentResult) return 'N/A';
    
    // Create array of RIASEC types with their scores
    const riasecScores = [
      { type: 'R', score: results.assessmentResult.realisticScore || 0 },
      { type: 'I', score: results.assessmentResult.investigativeScore || 0 },
      { type: 'A', score: results.assessmentResult.artisticScore || 0 },
      { type: 'S', score: results.assessmentResult.socialScore || 0 },
      { type: 'E', score: results.assessmentResult.enterprisingScore || 0 },
      { type: 'C', score: results.assessmentResult.conventionalScore || 0 }
    ];
    
    // Sort by score in descending order
    riasecScores.sort((a, b) => b.score - a.score);
    
    // Take the highest scoring types (max 3) with scores > 0
    const topTypes = riasecScores.filter(type => type.score > 0).slice(0, 3);
    
    // Return the code (join the letters)
    return topTypes.length > 0 ? topTypes.map(t => t.type).join('') : 'N/A';
  };
  
  // Function to get the full names of RIASEC codes
  const getRiasecFullNames = (code) => {
    if (code === 'N/A') return 'No clear interest pattern';
    
    const fullNames = {
      'R': 'Realistic',
      'I': 'Investigative',
      'A': 'Artistic',
      'S': 'Social',
      'E': 'Enterprising',
      'C': 'Conventional'
    };
    
    return code.split('').map(letter => fullNames[letter]).join(' - ');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 bg-[#F8F9FA] rounded-xl"
    >
      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-xl shadow-md bg-white flex flex-col h-[180px] hover:shadow-lg transition-shadow duration-200`}>
          <h3 className="text-lg font-semibold text-[#232D35] mb-1 p-5 pb-0">General Scholastic Aptitude</h3>
          <div className="text-3xl font-extrabold text-[#1D63A1] px-5 pt-1">{results.assessmentResult?.gsaScore?.toFixed(1)}%</div>
          <p className="text-xs text-gray-600 mt-auto p-5 pt-2">Your overall academic aptitude score across various cognitive domains.</p>
        </div>
        <div className={`rounded-xl shadow-md bg-white flex flex-col h-[180px] hover:shadow-lg transition-shadow duration-200`}>
          <h3 className="text-lg font-semibold text-[#232D35] mb-1 p-5 pb-0">Academic Track Fit</h3>
          <div className="text-3xl font-extrabold text-[#FFB71B] px-5 pt-1">{results.assessmentResult?.academicTrackScore?.toFixed(1)}%</div>
          <p className="text-xs text-gray-600 mt-auto p-5 pt-2">Your alignment with academic tracks like STEM, ABM, and HUMSS.</p>
        </div>
        <div className={`rounded-xl shadow-md bg-white flex flex-col h-[180px] hover:shadow-lg transition-shadow duration-200`}>
          <h3 className="text-lg font-semibold text-[#232D35] mb-1 p-5 pb-0">Other Tracks Fit</h3>
          <div className="text-3xl font-extrabold text-[#1D63A1] px-5 pt-1">{results.assessmentResult?.otherTrackScore?.toFixed(1)}%</div>
          <p className="text-xs text-gray-600 mt-auto p-5 pt-2">Your alignment with non-academic tracks like TVL, Sports, and Arts & Design.</p>
        </div>
        <div className={`rounded-xl shadow-md bg-white flex flex-col h-[180px] hover:shadow-lg transition-shadow duration-200`}>
          <h3 className="text-lg font-semibold text-[#232D35] mb-1 p-5 pb-0">Interest Assessment</h3>
          <div className="text-3xl font-extrabold text-[#FFB71B] px-5 pt-1">{getRiasecCode()}</div>
          <p className="text-xs text-gray-600 mt-auto p-5 pt-2">You are <br/>{getRiasecFullNames(getRiasecCode())}</p>
        </div>
      </div>
      
      {/* Section Results Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden ">
        <div className="p-4 bg-[#F8F9FA] border-b border-[#1D63A1]/20">
          <h3 className="text-lg font-semibold text-[#232D35]">Section Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1D63A1] uppercase tracking-wider">Section</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1D63A1] uppercase tracking-wider">Section Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1D63A1] uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1D63A1] uppercase tracking-wider">Performance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.sectionResults
                ?.filter(section => 
                  !section.sectionType?.toLowerCase().includes('interest') && 
                  !section.sectionName?.toLowerCase().includes('interest')
                )
                .sort((a, b) => {
                  // First sort by section type priority
                  const typePriorityDiff = getSectionTypePriority(a.sectionType) - getSectionTypePriority(b.sectionType);
                  
                  // If same type, sort by performance (highest to lowest)
                  if (typePriorityDiff === 0) {
                    const scoreA = a.percentageScore || 0;
                    const scoreB = b.percentageScore || 0;
                    return scoreB - scoreA; // Descending order (highest first)
                  }
                  
                  // Otherwise sort by section type
                  return typePriorityDiff;
                })
                .map((section, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'}>
                  <td className="text-left px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#232D35]">{section.sectionName}</td>
                  <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-[#1D63A1]">{section.sectionType}</td>
                  <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-[#232D35]">
                    <span className="text-gray-500">
                      ({section.correctAnswers}/{section.totalQuestions})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-[#F8F9FA] rounded-full h-2.5 max-w-[150px] mr-2 border border-[#1D63A1]/10">
                        <div 
                          className="h-2.5 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${section.percentageScore}%`,
                            background: section.percentageScore >= 80 ? 'linear-gradient(90deg, #1D63A1 60%, #FFB71B 100%)' : 
                                        section.percentageScore >= 60 ? '#1D63A1' : 
                                        section.percentageScore >= 40 ? '#FFB71B' : '#dc2626'
                          }}
                        ></div>
                      </div>
                      <span className={`text-xs font-bold ml-1 ${getScoreColor(section.percentageScore)}`}>
                        {section.percentageScore?.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* GSA Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-5 ">
        <h3 className="text-lg font-semibold text-[#232D35] mb-4">General Scholastic Aptitude Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-[#1D63A1]/10 rounded-lg p-4 text-center ">
            <div className={`text-2xl font-extrabold text-[#1D63A1]`}>
              {results.assessmentResult?.scientificAbilityScore?.toFixed(1)}%
            </div>
            <p className="text-xs font-semibold text-[#232D35] mt-1">Scientific Ability</p>
          </div>
          <div className="bg-[#FFB71B]/10 rounded-lg p-4 text-center ">
            <div className={`text-2xl font-extrabold text-[#FFB71B]`}>
              {results.assessmentResult?.readingComprehensionScore?.toFixed(1)}%
            </div>
            <p className="text-xs font-semibold text-[#232D35] mt-1">Reading Comprehension</p>
          </div>
          <div className="bg-[#1D63A1]/10 rounded-lg p-4 text-center ">
            <div className={`text-2xl font-extrabold text-[#1D63A1]`}>
              {results.assessmentResult?.verbalAbilityScore?.toFixed(1)}%
            </div>
            <p className="text-xs font-semibold text-[#232D35] mt-1">Verbal Ability</p>
          </div>
          <div className="bg-[#FFB71B]/10 rounded-lg p-4 text-center ">
            <div className={`text-2xl font-extrabold text-[#FFB71B]`}>
              {results.assessmentResult?.mathematicalAbilityScore?.toFixed(1)}%
            </div>
            <p className="text-xs font-semibold text-[#232D35] mt-1">Mathematical Ability</p>
          </div>
          <div className="bg-[#1D63A1]/10 rounded-lg p-4 text-center ">
            <div className={`text-2xl font-extrabold text-[#1D63A1]`}>
              {results.assessmentResult?.logicalReasoningScore?.toFixed(1)}%
            </div>
            <p className="text-xs font-semibold text-[#232D35] mt-1">Logical Reasoning</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewTab;
