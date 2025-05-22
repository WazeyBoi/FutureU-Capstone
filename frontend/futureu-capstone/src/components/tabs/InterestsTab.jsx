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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-xl p-6 animate-card-pop">
          <h3 className="text-xl font-bold text-[#232D35] mb-3">What is RIASEC</h3>
          <p className="text-left text-sm text-gray-600">
            The RIASEC model, developed by psychologist John Holland, categorizes people and work environments into six types: 
            Realistic, Investigative, Artistic, Social, Enterprising, and Conventional. Your results indicate which types align most 
            closely with your interests and preferences, which can help guide career and educational choices.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <motion.div whileHover={{ scale: 1.03 }} className="bg-gradient-to-br from-[#F8F9FA] to-[#1D63A1]/10 rounded-3xl shadow-xl p-5 flex flex-col items-center justify-center animate-card-pop">
            <div className='flex justify-center items-center'>
              <div className="w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
                {generateRiasecRadarData() && <Radar data={generateRiasecRadarData()} options={{ responsive: true, maintainAspectRatio: true }} />}
              </div>
            </div>
          </motion.div>
          <motion.div className="bg-gradient-to-br from-[#F8F9FA] to-[#FFB71B]/10 rounded-3xl shadow-xl p-5 animate-card-pop">
            <h3 className="text-lg font-semibold text-[#232D35] mb-4">Your Dominant Interest Types</h3>
            {displayDescriptions.map((type, index) => (
              <motion.div key={index} whileHover={{ scale: 1.03 }} className="mb-4 p-4 bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-xl shadow-md transition-all">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-[#232D35]">{type.name} ({type.code || type.type})</h4>
                  <span className="text-sm font-semibold text-[#FFB71B]">{type.score.toFixed(1)}%</span>
                </div>
                <p className="text-left text-sm text-gray-600">{type.description || getRiasecTypeDescription(type.type || type.code)}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-gradient-to-br from-[#F8F9FA] to-[#1D63A1]/10 rounded-3xl shadow-xl p-5 animate-card-pop">
          <h3 className="text-lg font-semibold text-[#232D35] mb-4">RIASEC Type Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Realistic */}
            <motion.div whileHover={{ scale: 1.03 }} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-xl p-4 shadow-md transition-all">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-[#232D35]">Realistic</h4>
                <span className="text-sm font-bold text-[#1D63A1]">{results.assessmentResult?.realisticScore}/7</span>
              </div>
              <p className="text-left text-xs text-gray-600">
                These are "doers" who enjoy working with tools, machines, and objects. They typically prefer practical, hands-on problems and solutions.
              </p>
            </motion.div>
            {/* Investigative */}
            <motion.div whileHover={{ scale: 1.03 }} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-xl p-4 shadow-md transition-all">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-[#232D35]">Investigative</h4>
                <span className="text-sm font-bold text-[#FFB71B]">{results.assessmentResult?.investigativeScore}/7</span>
              </div>
              <p className="text-left text-xs text-gray-600">
                These are "thinkers" who enjoy analytical, intellectual, and scientific activities. They tend to be curious and precise.
              </p>
            </motion.div>
            {/* Artistic */}
            <motion.div whileHover={{ scale: 1.03 }} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-xl p-4 shadow-md transition-all">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-[#232D35]">Artistic</h4>
                <span className="text-sm font-bold text-[#1D63A1]">{results.assessmentResult?.artisticScore}/7</span>
              </div>
              <p className="text-left text-xs text-gray-600">
                These are "creators" who value self-expression, aesthetics, and independence. They tend to be creative, original, and unconventional.
              </p>
            </motion.div>
            {/* Social */}
            <motion.div whileHover={{ scale: 1.03 }} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-xl p-4 shadow-md transition-all">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-[#232D35]">Social</h4>
                <span className="text-sm font-bold text-[#FFB71B]">{results.assessmentResult?.socialScore}/7</span>
              </div>
              <p className="text-left text-xs text-gray-600">
                These are "helpers" who enjoy working with people and helping others. They tend to be friendly, cooperative, and supportive.
              </p>
            </motion.div>
            {/* Enterprising */}
            <motion.div whileHover={{ scale: 1.03 }} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-xl p-4 shadow-md transition-all">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-[#232D35]">Enterprising</h4>
                <span className="text-sm font-bold text-[#1D63A1]">{results.assessmentResult?.enterprisingScore}/7</span>
              </div>
              <p className="text-left text-xs text-gray-600">
                These are "persuaders" who enjoy leading, selling, and influencing others. They tend to be assertive, ambitious, and energetic.
              </p>
            </motion.div>
            {/* Conventional */}
            <motion.div whileHover={{ scale: 1.03 }} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-xl p-4 shadow-md transition-all">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-[#232D35]">Conventional</h4>
                <span className="text-sm font-bold text-[#FFB71B]">{results.assessmentResult?.conventionalScore}/7</span>
              </div>
              <p className="text-left text-xs text-gray-600">
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
