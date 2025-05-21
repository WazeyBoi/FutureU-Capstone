import React from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';

const AcademicTab = ({ results, generateAcademicTracksData, getScoreColor, getScoreBgColor }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
        <h3 className="text-lg font-semibold text-[#232D35] mb-4">Tracks Comparison</h3>
        <div className="h-[400px]">
          {generateAcademicTracksData() && <Bar 
            data={generateAcademicTracksData()} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Score (%)'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Tracks'
                  }
                }
              }
            }}
          />}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-xl shadow-md p-5 border ${getScoreBgColor(results.assessmentResult?.stemScore || 0)}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#232D35]">STEM</h3>
            <span className={`text-xl font-bold ${getScoreColor(results.assessmentResult?.stemScore || 0)}`}>
              {results.assessmentResult?.stemScore?.toFixed(1)}%
            </span>
          </div>
          <p className="text-left text-sm text-gray-600 mb-4">
            The Science, Technology, Engineering, and Mathematics strand prepares students for college courses like Engineering, Computer Studies, Natural Sciences, and Mathematics.
          </p>
          <div className="text-left text-xs text-gray-500">
            <p><span className="font-semibold">Strengths needed:</span> Strong analytical skills, mathematical aptitude, scientific reasoning</p>
            <p><span className="font-semibold">Career paths:</span> Engineer, Scientist, Programmer, Mathematician, Researcher</p>
          </div>
        </div>
        
        <div className={`rounded-xl shadow-md p-5 border ${getScoreBgColor(results.assessmentResult?.abmScore || 0)}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#232D35]">ABM</h3>
            <span className={`text-xl font-bold ${getScoreColor(results.assessmentResult?.abmScore || 0)}`}>
              {results.assessmentResult?.abmScore?.toFixed(1)}%
            </span>
          </div>
          <p className="text-left text-sm text-gray-600 mb-4">
            The Accountancy, Business, and Management strand prepares students for college courses like Business Administration, Accountancy, Management, and Finance.
          </p>
          <div className="text-left text-xs text-gray-500">
            <p><span className="font-semibold">Strengths needed:</span> Financial literacy, analytical thinking, organizational skills</p>
            <p><span className="font-semibold">Career paths:</span> Accountant, Entrepreneur, Manager, Financial Analyst, Marketing Professional</p>
          </div>
        </div>
        
        <div className={`rounded-xl shadow-md p-5 border ${getScoreBgColor(results.assessmentResult?.humssScore || 0)}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#232D35]">HUMSS</h3>
            <span className={`text-xl font-bold ${getScoreColor(results.assessmentResult?.humssScore || 0)}`}>
              {results.assessmentResult?.humssScore?.toFixed(1)}%
            </span>
          </div>
          <p className="text-left text-sm text-gray-600 mb-4">
            The Humanities and Social Sciences strand prepares students for college courses like Language, Liberal Arts, Communication, Social Sciences, Education, and Law.
          </p>
          <div className="text-left text-xs text-gray-500">
            <p><span className="font-semibold">Strengths needed:</span> Strong communication skills, critical thinking, cultural awareness</p>
            <p><span className="font-semibold">Career paths:</span> Lawyer, Psychologist, Teacher, Writer, Social Worker, Journalist</p>
          </div>
        </div>
        
        <div className={`rounded-xl shadow-md p-5 border ${getScoreBgColor(results.assessmentResult?.tvlScore || 0)}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#232D35]">TVL</h3>
            <span className={`text-xl font-bold ${getScoreColor(results.assessmentResult?.tvlScore || 0)}`}>
              {results.assessmentResult?.tvlScore?.toFixed(1)}%
            </span>
          </div>
          <p className="text-left text-sm text-gray-600 mb-4">
            The Technical-Vocational-Livelihood track prepares students for post-secondary courses or employment in fields of technology and vocational work.
          </p>
          <div className="text-left text-xs text-gray-500">
            <p><span className="font-semibold">Strengths needed:</span> Technical skills, practical knowledge, hands-on abilities</p>
            <p><span className="font-semibold">Career paths:</span> Technician, Chef, Automotive Specialist, Electronics Expert, IT Support</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-xl shadow-md p-5 border ${getScoreBgColor(results.assessmentResult?.sportsTrackScore || 0)}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#232D35]">Sports Track</h3>
            <span className={`text-xl font-bold ${getScoreColor(results.assessmentResult?.sportsTrackScore || 0)}`}>
              {results.assessmentResult?.sportsTrackScore?.toFixed(1)}%
            </span>
          </div>
          <p className="text-left text-sm text-gray-600 mb-4">
            The Sports track prepares students for careers in fitness, sports coaching, athletic training, and physical education.
          </p>
          <div className="text-left text-xs text-gray-500">
            <p><span className="font-semibold">Strengths needed:</span> Physical aptitude, leadership, team coordination</p>
            <p><span className="font-semibold">Career paths:</span> Athlete, Coach, Sports Scientist, Physical Therapist, Fitness Trainer</p>
          </div>
        </div>
        
        <div className={`rounded-xl shadow-md p-5 border ${getScoreBgColor(results.assessmentResult?.artsDesignTrackScore || 0)}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#232D35]">Arts & Design</h3>
            <span className={`text-xl font-bold ${getScoreColor(results.assessmentResult?.artsDesignTrackScore || 0)}`}>
              {results.assessmentResult?.artsDesignTrackScore?.toFixed(1)}%
            </span>
          </div>
          <p className="text-left text-sm text-gray-600 mb-4">
            The Arts and Design track prepares students for careers in visual arts, performing arts, animation, fashion design, and other creative fields.
          </p>
          <div className="text-left text-xs text-gray-500">
            <p><span className="font-semibold">Strengths needed:</span> Creativity, artistic vision, aesthetic sensibility</p>
            <p><span className="font-semibold">Career paths:</span> Artist, Designer, Animator, Photographer, Musician, Architect</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AcademicTab;
