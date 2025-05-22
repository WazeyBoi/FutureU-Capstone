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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-xl p-6 border-2 border-[#1D63A1]/10 animate-card-pop">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h3 className="text-xl font-bold text-[#232D35]">Tracks Comparison</h3>
            <div className="inline-flex rounded-md" role="group">
              <button
                type="button"
                className={`mr-2 px-4 py-2 text-sm font-medium rounded-l-lg border-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] shadow-sm animate-bounce-short ${
                  activeFilter === 'all' 
                    ? 'bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] text-white border-[#FFB71B] shadow-md' 
                    : 'bg-white text-[#1D63A1] border-[#1D63A1]/40 hover:bg-[#FFB71B]/10 hover:text-[#232D35]'
                }`}
                onClick={() => setActiveFilter('all')}
              >
                All Tracks
              </button>
              <button
                type="button"
                className={`mr-2 px-4 py-2 text-sm font-medium border-t-2 border-b-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] shadow-sm animate-bounce-short ${
                  activeFilter === 'academic' 
                    ? 'bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] text-white border-[#1D63A1]' 
                    : 'bg-white text-[#1D63A1] border-[#1D63A1]/40 hover:bg-[#FFB71B]/10 hover:text-[#232D35]'
                }`}
                onClick={() => setActiveFilter('academic')}
              >
                Academic
              </button>
              <button
                type="button"
                className={`mr-2 px-4 py-2 text-sm font-medium rounded-r-lg border-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] shadow-sm animate-bounce-short ${
                  activeFilter === 'other' 
                    ? 'bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] text-white border-[#FFB71B]' 
                    : 'bg-white text-[#1D63A1] border-[#1D63A1]/40 hover:bg-[#FFB71B]/10 hover:text-[#232D35]'
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column - Academic Tracks */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#232D35] pb-2 border-b-2 border-[#1D63A1]/20">Academic Tracks</h3>
            {academicTracks.map(track => (
              <motion.div key={track.id} whileHover={{ scale: 1.03 }} className="bg-gradient-to-r from-[#1D63A1]/10 to-[#FFB71B]/10 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all animate-card-pop">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-[#232D35]">{track.name}</h4>
                  <span className="px-3 py-1 bg-[#1D63A1]/10 text-[#1D63A1] rounded-full text-sm font-bold">
                    {track.score.toFixed(1)}%
                  </span>
                </div>
                <p className="text-left text-sm text-gray-600 mb-4">
                  {track.description}
                </p>
                <div className="text-left text-xs text-gray-500">
                  <p className="mb-1"><span className="font-semibold">Strengths needed:</span> {track.strengths}</p>
                  <p><span className="font-semibold">Career paths:</span> {track.careers}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Right column - Non-Academic Tracks */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#232D35] pb-2 border-b-2 border-[#1D63A1]/20">Non-Academic Tracks</h3>
            {otherTracks.map(track => (
              <motion.div key={track.id} whileHover={{ scale: 1.03 }} className="bg-gradient-to-r from-[#FFB71B]/10 to-[#1D63A1]/10 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all animate-card-pop">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-[#232D35]">{track.name}</h4>
                  <span className="px-3 py-1 bg-[#FFB71B]/10 text-[#FFB71B] rounded-full text-sm font-bold">
                    {track.score.toFixed(1)}%
                  </span>
                </div>
                <p className="text-left text-sm text-gray-600 mb-4">
                  {track.description}
                </p>
                <div className="text-left text-xs text-gray-500">
                  <p className="mb-1"><span className="font-semibold">Strengths needed:</span> {track.strengths}</p>
                  <p><span className="font-semibold">Career paths:</span> {track.careers}</p>
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
