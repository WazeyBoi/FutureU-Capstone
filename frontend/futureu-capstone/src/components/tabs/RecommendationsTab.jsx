import React from 'react';
import { motion } from 'framer-motion';

const RecommendationsTab = ({ getTopRecommendations }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
        <h3 className="text-lg font-semibold text-[#232D35] mb-4">Your Top Recommended Tracks</h3>
        <div className="space-y-4">
          {getTopRecommendations().map((rec, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-[#1D63A1]/10 to-transparent rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-bold text-[#232D35]">#{index + 1}: {rec.name}</h4>
                <span className="text-lg font-bold text-[#1D63A1]">{rec.score.toFixed(1)}%</span>
              </div>
              <p className="text-gray-600">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-left bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
        <h3 className="text-center text-lg font-semibold text-[#232D35] mb-4">Next Steps</h3>
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1D63A1]/20 flex items-center justify-center">
              <span className="text-[#1D63A1] font-bold">1</span>
            </div>
            <div className="ml-4">
              <h4 className="text-md font-semibold text-[#232D35]">Explore Your Top Tracks</h4>
              <p className="text-sm text-gray-600 mt-1">
                Research the curriculums, required skills, and career pathways for your recommended tracks. 
                Check our Academic Explorer section for detailed information about each track.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1D63A1]/20 flex items-center justify-center">
              <span className="text-[#1D63A1] font-bold">2</span>
            </div>
            <div className="ml-4">
              <h4 className="text-md font-semibold text-[#232D35]">Connect with Advisors</h4>
              <p className="text-sm text-gray-600 mt-1">
                Schedule a meeting with your school guidance counselor to discuss your assessment results 
                and get personalized advice on your educational path.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1D63A1]/20 flex items-center justify-center">
              <span className="text-[#1D63A1] font-bold">3</span>
            </div>
            <div className="ml-4">
              <h4 className="text-md font-semibold text-[#232D35]">Strengthen Weak Areas</h4>
              <p className="text-sm text-gray-600 mt-1">
                Review the sections where you scored lower and consider ways to improve those skills. 
                This can help you be better prepared for your chosen academic track.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1D63A1]/20 flex items-center justify-center">
              <span className="text-[#1D63A1] font-bold">4</span>
            </div>
            <div className="ml-4">
              <h4 className="text-md font-semibold text-[#232D35]">Explore Career Pathways</h4>
              <p className="text-sm text-gray-600 mt-1">
                Visit our Career Pathways section to learn about the various careers associated with your 
                interests and academic strengths.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationsTab;
