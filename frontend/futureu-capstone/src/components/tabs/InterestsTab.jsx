import React from 'react';
import { motion } from 'framer-motion';
import { Radar } from 'react-chartjs-2';

const InterestsTab = ({ results, generateRiasecRadarData, getRiasecDescription }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
        {/* <h3 className="text-lg font-semibold text-[#232D35] mb-4">Your RIASEC Profile</h3> */}
        <div className='flex justify-center items-center'>
          <div className="w-[400px] h-[400px]">
            {generateRiasecRadarData() && <Radar data={generateRiasecRadarData()} options={{ responsive: true, maintainAspectRatio: true }} />}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
        <h3 className="text-lg font-semibold text-[#232D35] mb-4">Your Dominant Interest Types</h3>
        {getRiasecDescription()?.map((type, index) => (
          <div key={index} className="mb-4 p-4 bg-[#1D63A1]/5 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-[#232D35]">{type.name} ({type.code})</h4>
              <span className="text-lefttext-sm font-semibold text-[#1D63A1]">{type.score.toFixed(1)}%</span>
            </div>
            <p className="text-left text-sm text-gray-600">{type.description}</p>
          </div>
        ))}
        
        <div className="mt-6">
          <h4 className="font-semibold text-[#232D35] mb-2">What is RIASEC?</h4>
          <p className="text-left text-sm text-gray-600">
            The RIASEC model, developed by psychologist John Holland, categorizes people and work environments into six types: 
            Realistic, Investigative, Artistic, Social, Enterprising, and Conventional. Your results indicate which types align most 
            closely with your interests and preferences, which can help guide career and educational choices.
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20 lg:col-span-2">
        <h3 className="text-lg font-semibold text-[#232D35] mb-4">RIASEC Type Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#1D63A1]/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-[#232D35]">Realistic</h4>
              <span className="text-sm font-bold text-[#1D63A1]">{results.assessmentResult?.realisticScore}/7</span>
            </div>
            <p className="text-left text-xs text-gray-600">
              These are "doers" who enjoy working with tools, machines, and objects. They typically prefer practical, hands-on problems and solutions.
            </p>
          </div>
          <div className="bg-[#1D63A1]/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-[#232D35]">Investigative</h4>
              <span className="text-sm font-bold text-[#1D63A1]">{results.assessmentResult?.investigativeScore}/7</span>
            </div>
            <p className="text-left text-xs text-gray-600">
              These are "thinkers" who enjoy analytical, intellectual, and scientific activities. They tend to be curious and precise.
            </p>
          </div>
          <div className="bg-[#1D63A1]/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-[#232D35]">Artistic</h4>
              <span className="text-sm font-bold text-[#1D63A1]">{results.assessmentResult?.artisticScore}/7</span>
            </div>
            <p className="text-left text-xs text-gray-600">
              These are "creators" who value self-expression, aesthetics, and independence. They tend to be creative, original, and unconventional.
            </p>
          </div>
          <div className="bg-[#1D63A1]/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-[#232D35]">Social</h4>
              <span className="text-sm font-bold text-[#1D63A1]">{results.assessmentResult?.socialScore}/7</span>
            </div>
            <p className="text-left text-xs text-gray-600">
              These are "helpers" who enjoy working with people and helping others. They tend to be friendly, cooperative, and supportive.
            </p>
          </div>
          <div className="bg-[#1D63A1]/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-[#232D35]">Enterprising</h4>
              <span className="text-sm font-bold text-[#1D63A1]">{results.assessmentResult?.enterprisingScore}/7</span>
            </div>
            <p className="text-left text-xs text-gray-600">
              These are "persuaders" who enjoy leading, selling, and influencing others. They tend to be assertive, ambitious, and energetic.
            </p>
          </div>
          <div className="bg-[#1D63A1]/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-[#232D35]">Conventional</h4>
              <span className="text-sm font-bold text-[#1D63A1]">{results.assessmentResult?.conventionalScore}/7</span>
            </div>
            <p className="text-left text-xs text-gray-600">
              These are "organizers" who enjoy working with data, numbers, and details. They tend to be orderly, careful, and efficient.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InterestsTab;
