import React from 'react';
import { motion } from 'framer-motion';
import { Radar } from 'react-chartjs-2';

// Add a helper function to get the top 3 RIASEC types
const getTop3RiasecTypes = (results) => {
  if (!results || !results.assessmentResult) return [];
  
  const riasecScores = [
    { type: 'R', name: 'Realistic', score: results.assessmentResult.realisticScore || 0 },
    { type: 'I', name: 'Investigative', score: results.assessmentResult.investigativeScore || 0 },
    { type: 'A', name: 'Artistic', score: results.assessmentResult.artisticScore || 0 },
    { type: 'S', name: 'Social', score: results.assessmentResult.socialScore || 0 },
    { type: 'E', name: 'Enterprising', score: results.assessmentResult.enterprisingScore || 0 },
    { type: 'C', name: 'Conventional', score: results.assessmentResult.conventionalScore || 0 }
  ];
  
  // Sort by score (highest first) and take top 3
  return riasecScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter(type => type.score > 0);
};

// Helper function to provide descriptions if missing from the original function
const getRiasecTypeDescription = (typeCode) => {
  const descriptions = {
    'R': 'Realistic types are "doers" who enjoy working with tools, machines, and objects. They typically prefer practical, hands-on problems and solutions.',
    'I': 'Investigative types are "thinkers" who enjoy analytical, intellectual, and scientific activities. They tend to be curious and precise.',
    'A': 'Artistic types are "creators" who value self-expression, aesthetics, and independence. They tend to be creative, original, and unconventional.',
    'S': 'Social types are "helpers" who enjoy working with people and helping others. They tend to be friendly, cooperative, and supportive.',
    'E': 'Enterprising types are "persuaders" who enjoy leading, selling, and influencing others. They tend to be assertive, ambitious, and energetic.',
    'C': 'Conventional types are "organizers" who enjoy working with data, numbers, and details. They tend to be orderly, careful, and efficient.'
  };
  
  return descriptions[typeCode] || 'No description available.';
};

const InterestsTab = ({ results, generateRiasecRadarData, getRiasecDescription }) => {
  // Ensure we get all top 3 types
  const top3Types = getTop3RiasecTypes(results);
  
  // Use the explicit top3Types if the descriptions are missing or fewer than 3
  const descriptions = getRiasecDescription?.() || [];
  const displayDescriptions = descriptions.length >= 3 ? descriptions : top3Types;
  
  return (
    <div className="relative">
      {/* Decorative background blobs matching DreamCareerAnalysisTab */}
      <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-gradient-to-bl from-[#1D63A1]/20 to-[#1D63A1]/10 rounded-full opacity-30 pointer-events-none transform rotate-6"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 relative z-10"
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-6 md:p-8 animate-card-pop relative overflow-visible">
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-gradient-to-tr from-[#FFB71B]/30 to-[#FFB71B]/10 rounded-full opacity-40 pointer-events-none transform -rotate-12"></div>
          
          <h3 className="text-left text-2xl font-extrabold text-[#232D35] mb-4 relative z-10">What is RIASEC</h3>
          <p className="text-left text-sm text-gray-700 leading-relaxed mb-3 relative z-10">
            The RIASEC model, developed by psychologist John Holland, categorizes people and work environments into six types: 
            Realistic, Investigative, Artistic, Social, Enterprising, and Conventional. Your results indicate which types align most 
            closely with your interests and preferences, which can help guide career and educational choices.
          </p>
          <p className="text-left text-xs text-gray-600 relative z-10">
            <strong>Scoring:</strong> The numbers shown represent how many interest statements you agreed with in each category, 
            out of 60 total interest questions distributed across all six RIASEC types.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-[#FFB71B]/10 flex flex-col items-center justify-center animate-card-pop">
            {/* <h4 className="font-bold text-[#232D35] text-lg mb-4 text-center">
              RIASEC Profile
            </h4> */}
            <div className='flex justify-center items-center w-full h-80'>
              <div className="w-full h-full max-w-md">
                {generateRiasecRadarData() && (
                  <Radar 
                    data={generateRiasecRadarData()} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { display: false } 
                      },
                      layout: { 
                        padding: 20 
                      },
                      scales: {
                        r: {
                          min: 0,
                          max: generateRiasecRadarData().datasets[0].data.length > 0 
                            ? Math.max(...generateRiasecRadarData().datasets[0].data, 1) 
                            : 40,
                          pointLabels: { 
                            font: { 
                              size: 14, 
                              weight: "bold" 
                            } 
                          },
                          grid: { 
                            color: "#E5E7EB" 
                          },
                          angleLines: { 
                            color: "#D1D5DB" 
                          },
                          ticks: { 
                            display: false 
                          }
                        },
                      },
                    }} 
                  />
                )}
              </div>
            </div>
          </motion.div>
          <motion.div className="p-6 md:p-8 animate-card-pop">
            <h3 className="text-xl font-extrabold text-[#232D35] mb-4">Your Dominant Interest Types</h3>
            {displayDescriptions.map((type, index) => (
              <motion.div 
                key={index} 
                whileHover={{ scale: 1.02 }} 
                className="mb-4 p-4 bg-white rounded-2xl transition-transform transform hover:-translate-y-0.5"
                style={{ boxShadow: '0 8px 20px rgba(15,23,42,0.04)' }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-extrabold text-[#232D35]">{type.name} ({type.code || type.type})</h4>
                  <span className="text-sm font-bold text-[#FFB71B]">{((type.score / 40) * 100).toFixed(1)}%</span>
                </div>
                <p className="text-left text-sm text-gray-700 leading-relaxed">{type.description || getRiasecTypeDescription(type.type || type.code)}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="p-6 md:p-8 animate-card-pop">
          <h3 className="text-xl font-extrabold text-[#232D35] mb-12">RIASEC Type Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Realistic */}
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              className="bg-white rounded-2xl p-5 transition-transform transform hover:-translate-y-0.5"
              style={{ boxShadow: '0 10px 26px rgba(29,99,161,0.15)' }}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-extrabold text-[#232D35]">Realistic</h4>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-[#1D63A1]">{((results.assessmentResult?.realisticScore / 40) * 100).toFixed(1)}%</span>
                  <div className="text-xs text-gray-600 font-semibold">{results.assessmentResult?.realisticScore}/40</div>
                </div>
              </div>
              <p className="text-left text-sm text-gray-700 leading-relaxed">
                These are "doers" who enjoy working with tools, machines, and objects. They typically prefer practical, hands-on problems and solutions.
              </p>
            </motion.div>
            {/* Investigative */}
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              className="bg-white rounded-2xl p-5 transition-transform transform hover:-translate-y-0.5"
              style={{ boxShadow: '0 10px 26px rgba(255,183,27,0.15)' }}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-extrabold text-[#232D35]">Investigative</h4>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-[#FFB71B]">{((results.assessmentResult?.investigativeScore / 40) * 100).toFixed(1)}%</span>
                  <div className="text-xs text-gray-600 font-semibold">{results.assessmentResult?.investigativeScore}/40</div>
                </div>
              </div>
              <p className="text-left text-sm text-gray-700 leading-relaxed">
                These are "thinkers" who enjoy analytical, intellectual, and scientific activities. They tend to be curious and precise.
              </p>
            </motion.div>
            {/* Artistic */}
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              className="bg-white rounded-2xl p-5 transition-transform transform hover:-translate-y-0.5"
              style={{ boxShadow: '0 10px 26px rgba(29,99,161,0.15)' }}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-extrabold text-[#232D35]">Artistic</h4>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-[#1D63A1]">{((results.assessmentResult?.artisticScore / 40) * 100).toFixed(1)}%</span>
                  <div className="text-xs text-gray-600 font-semibold">{results.assessmentResult?.artisticScore}/40</div>
                </div>
              </div>
              <p className="text-left text-sm text-gray-700 leading-relaxed">
                These are "creators" who value self-expression, aesthetics, and independence. They tend to be creative, original, and unconventional.
              </p>
            </motion.div>
            {/* Social */}
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              className="bg-white rounded-2xl p-5 transition-transform transform hover:-translate-y-0.5"
              style={{ boxShadow: '0 10px 26px rgba(255,183,27,0.15)' }}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-extrabold text-[#232D35]">Social</h4>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-[#FFB71B]">{((results.assessmentResult?.socialScore / 40) * 100).toFixed(1)}%</span>
                  <div className="text-xs text-gray-600 font-semibold">{results.assessmentResult?.socialScore}/40</div>
                </div>
              </div>
              <p className="text-left text-sm text-gray-700 leading-relaxed">
                These are "helpers" who enjoy working with people and helping others. They tend to be friendly, cooperative, and supportive.
              </p>
            </motion.div>
            {/* Enterprising */}
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              className="bg-white rounded-2xl p-5 transition-transform transform hover:-translate-y-0.5"
              style={{ boxShadow: '0 10px 26px rgba(29,99,161,0.15)' }}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-extrabold text-[#232D35]">Enterprising</h4>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-[#1D63A1]">{((results.assessmentResult?.enterprisingScore / 40) * 100).toFixed(1)}%</span>
                  <div className="text-xs text-gray-600 font-semibold">{results.assessmentResult?.enterprisingScore}/40</div>
                </div>
              </div>
              <p className="text-left text-sm text-gray-700 leading-relaxed">
                These are "persuaders" who enjoy leading, selling, and influencing others. They tend to be assertive, ambitious, and energetic.
              </p>
            </motion.div>
            {/* Conventional */}
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              className="bg-white rounded-2xl p-5 transition-transform transform hover:-translate-y-0.5"
              style={{ boxShadow: '0 10px 26px rgba(255,183,27,0.15)' }}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-extrabold text-[#232D35]">Conventional</h4>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-[#FFB71B]">{((results.assessmentResult?.conventionalScore / 40) * 100).toFixed(1)}%</span>
                  <div className="text-xs text-gray-600 font-semibold">{results.assessmentResult?.conventionalScore}/40</div>
                </div>
              </div>
              <p className="text-left text-sm text-gray-700 leading-relaxed">
                These are "organizers" who enjoy working with data, numbers, and details. They tend to be orderly, careful, and efficient.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InterestsTab;
