import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const OverviewTab = ({ results, getScoreColor, getScoreBgColor }) => {
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('gsa');
  
  // Tooltip functions
  const showTooltip = (e, content) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      content,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10
    });
  };
  
  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Function to group sections by type
  const getSectionsByType = () => {
    const filteredSections = results.sectionResults?.filter(section => 
      !section.sectionType?.toLowerCase().includes('interest') && 
      !section.sectionName?.toLowerCase().includes('interest')
    ) || [];

    const groups = {
      gsa: filteredSections.filter(section => 
        section.sectionType?.toLowerCase().includes('gsa') ||
        section.sectionType?.toLowerCase().includes('cognitive') ||
        section.sectionType?.toLowerCase().includes('aptitude')
      ),
      academic: filteredSections.filter(section => 
        section.sectionType?.toLowerCase().includes('academic') ||
        section.sectionType?.toLowerCase().includes('stem') ||
        section.sectionType?.toLowerCase().includes('abm') ||
        section.sectionType?.toLowerCase().includes('humss')
      ),
      others: filteredSections.filter(section => 
        section.sectionType?.toLowerCase().includes('others') ||
        section.sectionType?.toLowerCase().includes('other') ||
        section.sectionType?.toLowerCase().includes('tvl') ||
        section.sectionType?.toLowerCase().includes('sports') ||
        section.sectionType?.toLowerCase().includes('arts') ||
        section.sectionType?.toLowerCase().includes('practical') ||
        section.sectionType?.toLowerCase().includes('non-academic') ||
        (!section.sectionType?.toLowerCase().includes('gsa') && 
         !section.sectionType?.toLowerCase().includes('cognitive') &&
         !section.sectionType?.toLowerCase().includes('aptitude') &&
         !section.sectionType?.toLowerCase().includes('academic') &&
         !section.sectionType?.toLowerCase().includes('stem') &&
         !section.sectionType?.toLowerCase().includes('abm') &&
         !section.sectionType?.toLowerCase().includes('humss'))
      )
    };

    // Sort each group by score (highest to lowest)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => (b.percentageScore || 0) - (a.percentageScore || 0));
    });

    return groups;
  };

  const sectionGroups = getSectionsByType();

  const tabs = [
    { id: 'gsa', label: 'Cognitive Abilities', count: sectionGroups.gsa.length },
    { id: 'academic', label: 'Academic Tracks', count: sectionGroups.academic.length },
    { id: 'others', label: 'Non-Academic Tracks', count: sectionGroups.others.length }
  ];
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
    <div className="relative">
      {/* Playful floating accent shapes background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#FFB71B]/30 to-[#1D63A1]/20 rounded-full blur-2xl animate-bounce-slow" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-tr from-[#1D63A1]/20 to-[#FFB71B]/30 rounded-full blur-2xl animate-bounce-slower" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-[#232D35]/10 to-[#1D63A1]/10 rounded-full blur-2xl animate-bounce-slowest" />
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 bg-[#F8F9FA] rounded-3xl relative z-10"
      >
        {/* Top summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Top Cognitive Strength */}
          <motion.div whileHover={{ scale: 1.04}} className="rounded-3xl shadow-xl bg-gradient-to-br from-[#F8F9FA] to-[#FFB71B]/10 flex flex-col h-[200px] hover:shadow-2xl transition-all duration-300 animate-card-pop">
            <div className="flex items-center justify-between p-5 pb-0">
              <h3 className="text-lg font-semibold text-[#232D35] mb-1">Top Cognitive Strength</h3>
              <HelpCircle 
                className="w-4 h-4 text-gray-400 hover:text-[#1D63A1] cursor-help transition-colors"
                onMouseEnter={(e) => showTooltip(e, "Your strongest cognitive ability area based on aptitude test performance. This represents your natural intellectual strength.")}
                onMouseLeave={hideTooltip}
              />
            </div>
            <div className="text-3xl font-extrabold text-[#1D63A1] px-5 pt-1 animate-pop">
              {(() => {
                // Find the highest aptitude score
                const aptitudes = [
                  { name: 'Scientific', score: results.assessmentResult?.scientificAbilityScore || 0 },
                  { name: 'Mathematical', score: results.assessmentResult?.mathematicalAbilityScore || 0 },
                  { name: 'Verbal', score: results.assessmentResult?.verbalAbilityScore || 0 },
                  { name: 'Reading', score: results.assessmentResult?.readingComprehensionScore || 0 },
                  { name: 'Logical', score: results.assessmentResult?.logicalReasoningScore || 0 }
                ];
                const topAptitude = aptitudes.sort((a, b) => b.score - a.score)[0];
                return topAptitude.name;
              })()}
            </div>
            <div className="text-xl font-semibold text-[#FFB71B] px-5 animate-pop">
              {(() => {
                const aptitudes = [
                  { name: 'Scientific', score: results.assessmentResult?.scientificAbilityScore || 0 },
                  { name: 'Mathematical', score: results.assessmentResult?.mathematicalAbilityScore || 0 },
                  { name: 'Verbal', score: results.assessmentResult?.verbalAbilityScore || 0 },
                  { name: 'Reading', score: results.assessmentResult?.readingComprehensionScore || 0 },
                  { name: 'Logical', score: results.assessmentResult?.logicalReasoningScore || 0 }
                ];
                const topAptitude = aptitudes.sort((a, b) => b.score - a.score)[0];
                return `${topAptitude.score.toFixed(1)}%`;
              })()}
            </div>
            <div className="mt-auto p-5 pt-2">
              <p className="text-xs text-gray-600">Your highest-scoring cognitive ability area</p>
              <p className="text-xs font-medium text-[#1D63A1] mt-1">
                {(() => {
                  const aptitudes = [
                    { name: 'Scientific', score: results.assessmentResult?.scientificAbilityScore || 0 },
                    { name: 'Mathematical', score: results.assessmentResult?.mathematicalAbilityScore || 0 },
                    { name: 'Verbal', score: results.assessmentResult?.verbalAbilityScore || 0 },
                    { name: 'Reading', score: results.assessmentResult?.readingComprehensionScore || 0 },
                    { name: 'Logical', score: results.assessmentResult?.logicalReasoningScore || 0 }
                  ];
                  const topScore = aptitudes.sort((a, b) => b.score - a.score)[0].score;
                  return topScore >= 85 ? 'Exceptional strength' :
                         topScore >= 70 ? 'Strong ability' :
                         topScore >= 55 ? 'Good ability' :
                         'Developing skill';
                })()}
              </p>
            </div>
          </motion.div>
          {/* Academic Track Fit */}
          <motion.div whileHover={{ scale: 1.04}} className="rounded-3xl shadow-xl bg-gradient-to-br from-[#F8F9FA] to-[#1D63A1]/10 flex flex-col h-[200px] hover:shadow-2xl transition-all duration-300 animate-card-pop">
            <div className="flex items-center justify-between p-5 pb-0">
              <h3 className="text-lg font-semibold text-[#232D35] mb-1">Academic Track Fit</h3>
              <HelpCircle 
                className="w-4 h-4 text-gray-400 hover:text-[#1D63A1] cursor-help transition-colors"
                onMouseEnter={(e) => showTooltip(e, "How well your abilities match academic tracks (STEM, ABM, HUMSS). Higher percentages mean better compatibility with these tracks.")}
                onMouseLeave={hideTooltip}
              />
            </div>
            <div className="text-3xl font-extrabold text-[#FFB71B] px-5 pt-1 animate-pop">{results.assessmentResult?.academicTrackScore?.toFixed(1)}%</div>
            <div className="mt-auto p-5 pt-2">
              <p className="text-xs text-gray-600">Compatibility with STEM, ABM, and HUMSS tracks</p>
              <p className="text-xs font-medium text-[#FFB71B] mt-1">
                {results.assessmentResult?.academicTrackScore >= 80 ? 'Excellent academic track fit' :
                 results.assessmentResult?.academicTrackScore >= 65 ? 'Good academic track fit' :
                 results.assessmentResult?.academicTrackScore >= 50 ? 'Moderate academic track fit' :
                 'Consider exploring alternatives'}
              </p>
            </div>
          </motion.div>
          {/* Other Tracks Fit */}
          <motion.div whileHover={{ scale: 1.04}} className="rounded-3xl shadow-xl bg-gradient-to-br from-[#F8F9FA] to-[#FFB71B]/10 flex flex-col h-[200px] hover:shadow-2xl transition-all duration-300 animate-card-pop">
            <div className="flex items-center justify-between p-5 pb-0">
              <h3 className="text-lg font-semibold text-[#232D35] mb-1">Non-Academic Track Fit</h3>
              <HelpCircle 
                className="w-4 h-4 text-gray-400 hover:text-[#1D63A1] cursor-help transition-colors"
                onMouseEnter={(e) => showTooltip(e, "How well your abilities match practical tracks (TVL, Sports, Arts & Design). Higher percentages indicate better suitability for hands-on careers.")}
                onMouseLeave={hideTooltip}
              />
            </div>
            <div className="text-3xl font-extrabold text-[#1D63A1] px-5 pt-1 animate-pop">{results.assessmentResult?.otherTrackScore?.toFixed(1)}%</div>
            <div className="mt-auto p-5 pt-2">
              <p className="text-xs text-gray-600">Compatibility with TVL, Sports, and Arts & Design</p>
              <p className="text-xs font-medium text-[#1D63A1] mt-1">
                {results.assessmentResult?.otherTrackScore >= 80 ? 'Excellent practical track fit' :
                 results.assessmentResult?.otherTrackScore >= 65 ? 'Good practical track fit' :
                 results.assessmentResult?.otherTrackScore >= 50 ? 'Moderate practical track fit' :
                 'Consider academic alternatives'}
              </p>
            </div>
          </motion.div>
          {/* Interest Assessment */}
          <motion.div whileHover={{ scale: 1.04}} className="rounded-3xl shadow-xl bg-gradient-to-br from-[#F8F9FA] to-[#1D63A1]/10 flex flex-col h-[200px] hover:shadow-2xl transition-all duration-300 animate-card-pop">
            <div className="flex items-center justify-between p-5 pb-0">
              <h3 className="text-lg font-semibold text-[#232D35] mb-1">your RIASEC</h3>
              <HelpCircle 
                className="w-4 h-4 text-gray-400 hover:text-[#1D63A1] cursor-help transition-colors"
                onMouseEnter={(e) => showTooltip(e, "Your personality type based on career interests. This shows what types of work environments and activities you prefer, not your performance.")}
                onMouseLeave={hideTooltip}
              />
            </div>
            <div className="text-3xl font-extrabold text-[#FFB71B] px-5 pt-1 animate-pop">{getRiasecCode()}</div>
            <div className="mt-auto p-5 pt-2">
              <p className="text-xs text-gray-600">Your personality type and career interests</p>
              <p className="text-xs font-medium text-[#FFB71B] mt-1">{getRiasecFullNames(getRiasecCode())}</p>
            </div>
          </motion.div>
        </div>
        {/* Section Results with Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }} 
          className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-[#1D63A1]/10 animate-card-pop"
        >
          <div className="p-4 bg-[#F8F9FA] border-b border-[#1D63A1]/20">
            <h3 className="text-lg font-semibold text-[#232D35] mb-4">Section Score Results</h3>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#1D63A1] text-white shadow-md'
                      : 'bg-white text-[#1D63A1] hover:bg-[#1D63A1]/5 border border-[#1D63A1]/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Container - Fixed Height */}
          <div className="min-h-[400px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 overflow-x-auto"
              >
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-[#F8F9FA]">
                    <tr>
                      <th scope="col" className="w-1/2 px-6 py-3 text-left text-xs font-bold text-[#1D63A1] uppercase tracking-wider">Section</th>
                      <th scope="col" className="w-1/4 px-6 py-3 text-left text-xs font-bold text-[#1D63A1] uppercase tracking-wider">Score</th>
                      <th scope="col" className="w-1/4 px-6 py-3 text-left text-xs font-bold text-[#1D63A1] uppercase tracking-wider">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sectionGroups[activeTab]?.length > 0 ? (
                      sectionGroups[activeTab].map((section, index) => (
                        <motion.tr 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'}
                        >
                          <td className="w-1/2 text-left px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-[#232D35] truncate">{section.sectionName}</div>
                              <div className="text-xs text-gray-500">
                                {section.correctAnswers}/{section.totalQuestions} correct
                              </div>
                            </div>
                          </td>
                          <td className="w-1/4 text-left px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-[#232D35]">
                              {section.percentageScore?.toFixed(1)}%
                            </div>
                          </td>
                          <td className="w-1/4 px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-[#F8F9FA] rounded-full h-3 max-w-[120px] border border-[#1D63A1]/10">
                                <div 
                                  className="h-3 rounded-full transition-all duration-500" 
                                  style={{ 
                                    width: `${section.percentageScore}%`,
                                    background: 'linear-gradient(90deg, #1D63A1 0%, #4A90E2 25%, #7BB3F0 50%, #FFB71B 75%, #FFC947 100%)'
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-8 text-gray-500">
                          No {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} sections available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg p-3 max-w-xs shadow-lg pointer-events-none"
          style={{
            left: tooltip.x - 150, // Center the tooltip
            top: tooltip.y,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
