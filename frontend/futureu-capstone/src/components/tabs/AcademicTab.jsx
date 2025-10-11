import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';

const AcademicTab = ({ results, generateAcademicTracksData, getScoreColor, getScoreBgColor }) => {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'academic', 'other'
  
  // Create filtered data for the chart based on activeFilter
  const getFilteredChartData = () => {
    const baseData = generateAcademicTracksData();
    
    if (!baseData || activeFilter === 'all') {
      return baseData;
    }
    
    // Create a filtered version of the data
    const filteredData = {
      ...baseData,
      labels: [],
      datasets: baseData.datasets.map(dataset => ({
        ...dataset,
        data: []
      }))
    };
    
    // Identify indices from original data to keep
    baseData.labels.forEach((label, index) => {
      // Check if this label belongs to the selected category
      const isAcademic = ['STEM', 'ABM', 'HUMSS'].includes(label);
      const shouldInclude = (activeFilter === 'academic' && isAcademic) || 
                           (activeFilter === 'other' && !isAcademic);
      
      if (shouldInclude) {
        filteredData.labels.push(label);
        // For each dataset, include the corresponding data point
        filteredData.datasets.forEach((dataset, datasetIndex) => {
          dataset.data.push(baseData.datasets[datasetIndex].data[index]);
        });
      }
    });
    
    return filteredData;
  };

  // Function to create and sort track cards by score
  const getSortedTracks = () => {
    // Academic tracks
    const academicTracks = [
      {
        id: 'stem',
        name: 'STEM',
        score: results.assessmentResult?.stemScore || 0,
        description: 'The Science, Technology, Engineering, and Mathematics strand prepares students for college courses like Engineering, Computer Studies, Natural Sciences, and Mathematics.',
        strengths: 'Strong analytical skills, mathematical aptitude, scientific reasoning',
        careers: 'Engineer, Scientist, Programmer, Mathematician, Researcher'
      },
      {
        id: 'abm',
        name: 'ABM',
        score: results.assessmentResult?.abmScore || 0,
        description: 'The Accountancy, Business, and Management strand prepares students for college courses like Business Administration, Accountancy, Management, and Finance.',
        strengths: 'Financial literacy, analytical thinking, organizational skills',
        careers: 'Accountant, Entrepreneur, Manager, Financial Analyst, Marketing Professional'
      },
      {
        id: 'humss',
        name: 'HUMSS',
        score: results.assessmentResult?.humssScore || 0,
        description: 'The Humanities and Social Sciences strand prepares students for college courses like Language, Liberal Arts, Communication, Social Sciences, Education, and Law.',
        strengths: 'Strong communication skills, critical thinking, cultural awareness',
        careers: 'Lawyer, Psychologist, Teacher, Writer, Social Worker, Journalist'
      }
    ].sort((a, b) => b.score - a.score);
    
    // Other tracks (non-academic)
    const otherTracks = [
      {
        id: 'tvl',
        name: 'TVL',
        score: results.assessmentResult?.tvlScore || 0,
        description: 'The Technical-Vocational-Livelihood track prepares students for post-secondary courses or employment in fields of technology and vocational work.',
        strengths: 'Technical skills, practical knowledge, hands-on abilities',
        careers: 'Technician, Chef, Automotive Specialist, Electronics Expert, IT Support'
      },
      {
        id: 'sports',
        name: 'Sports Track',
        score: results.assessmentResult?.sportsTrackScore || 0,
        description: 'The Sports track prepares students for careers in fitness, sports coaching, athletic training, and physical education.',
        strengths: 'Physical aptitude, leadership, team coordination',
        careers: 'Athlete, Coach, Sports Scientist, Physical Therapist, Fitness Trainer'
      },
      {
        id: 'arts',
        name: 'Arts & Design',
        score: results.assessmentResult?.artsDesignTrackScore || 0,
        description: 'The Arts and Design track prepares students for careers in visual arts, performing arts, animation, fashion design, and other creative fields.',
        strengths: 'Creativity, artistic vision, aesthetic sensibility',
        careers: 'Artist, Designer, Animator, Photographer, Musician, Architect'
      }
    ].sort((a, b) => b.score - a.score);
    
    return { academicTracks, otherTracks };
  };
  
  const { academicTracks, otherTracks } = getSortedTracks();
  
  return (
    <div className="relative">
      {/* Decorative background blobs matching DreamCareerAnalysisTab */}
      <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-gradient-to-bl from-[#1D63A1]/20 to-[#1D63A1]/10 rounded-full opacity-30 pointer-events-none transform rotate-6"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 bg-[#F8F9FA] rounded-3xl relative z-10"
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-[#FFB71B]/10 animate-card-pop relative overflow-hidden">
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-gradient-to-tr from-[#FFB71B]/30 to-[#FFB71B]/10 rounded-full opacity-40 pointer-events-none transform -rotate-12"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
            <div>
              <h3 className="text-2xl font-extrabold text-[#232D35]">Track Comparison</h3>
              <p className="text-sm text-gray-500">See how you match different academic and vocational paths</p>
            </div>
            <div className="flex gap-2" role="group">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all focus:outline-none ${
                  activeFilter === 'all' 
                    ? 'bg-[#232D35] text-white' 
                    : 'bg-[#1D63A1]/10 text-[#1D63A1] hover:bg-[#1D63A1]/20'
                }`}
                onClick={() => setActiveFilter('all')}
              >
                All Tracks
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all focus:outline-none ${
                  activeFilter === 'academic' 
                    ? 'bg-[#232D35] text-white' 
                    : 'bg-[#1D63A1]/10 text-[#1D63A1] hover:bg-[#1D63A1]/20'
                }`}
                onClick={() => setActiveFilter('academic')}
              >
                Academic
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all focus:outline-none ${
                  activeFilter === 'other' 
                    ? 'bg-[#232D35] text-white' 
                    : 'bg-[#1D63A1]/10 text-[#1D63A1] hover:bg-[#1D63A1]/20'
                }`}
                onClick={() => setActiveFilter('other')}
              >
                Non-Academic
              </button>
            </div>
          </div>
          <div className="h-[400px]">
            {getFilteredChartData() && <Bar 
              data={getFilteredChartData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Score (%)',
                      color: '#1D63A1',
                      font: { weight: 'bold' }
                    },
                    ticks: { color: '#232D35' },
                    grid: { color: '#F8F9FA' }
                  },
                  x: {
                    title: {
                      display: true,
                      text: activeFilter === 'academic' ? 'Academic Tracks' : 
                            activeFilter === 'other' ? 'Non-Academic Tracks' : 'All Tracks',
                      color: '#1D63A1',
                      font: { weight: 'bold' }
                    },
                    ticks: { color: '#232D35' },
                    grid: { color: '#F8F9FA' }
                  }
                }
              }}
            />}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }} 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Left column - Academic Tracks */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-[#232D35] pb-2 border-b-2 border-[#1D63A1]/20">Academic Tracks</h3>
            {academicTracks.map(track => (
              <motion.div 
                key={track.id} 
                whileHover={{ scale: 1.02 }} 
                className="bg-white rounded-2xl p-6 transition-transform transform hover:-translate-y-0.5"
                style={{ boxShadow: '0 10px 26px rgba(29,99,161,0.15)' }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-extrabold text-[#232D35]">{track.name}</h4>
                  <span className="px-3 py-1.5 bg-[#1D63A1]/10 text-[#1D63A1] rounded-full text-sm font-bold">
                    {track.score.toFixed(1)}%
                  </span>
                </div>
                <p className="text-left text-sm text-gray-700 leading-relaxed mb-4">
                  {track.description}
                </p>
                <div className="text-left text-xs text-gray-600 space-y-1">
                  <p><span className="font-bold text-[#1D63A1]">Strengths needed:</span> {track.strengths}</p>
                  <p><span className="font-bold text-[#1D63A1]">Career paths:</span> {track.careers}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Right column - Non-Academic Tracks */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-[#232D35] pb-2 border-b-2 border-[#FFB71B]/20">Non-Academic Tracks</h3>
            {otherTracks.map(track => (
              <motion.div 
                key={track.id} 
                whileHover={{ scale: 1.02 }} 
                className="bg-white rounded-2xl p-6 transition-transform transform hover:-translate-y-0.5"
                style={{ boxShadow: '0 10px 26px rgba(255,183,27,0.15)' }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-extrabold text-[#232D35]">{track.name}</h4>
                  <span className="px-3 py-1.5 bg-[#FFB71B]/10 text-[#FFB71B] rounded-full text-sm font-bold">
                    {track.score.toFixed(1)}%
                  </span>
                </div>
                <p className="text-left text-sm text-gray-700 leading-relaxed mb-4">
                  {track.description}
                </p>
                <div className="text-left text-xs text-gray-600 space-y-1">
                  <p><span className="font-bold text-[#FFB71B]">Strengths needed:</span> {track.strengths}</p>
                  <p><span className="font-bold text-[#FFB71B]">Career paths:</span> {track.careers}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AcademicTab;
