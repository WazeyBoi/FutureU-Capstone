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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-xl shadow-md p-5 border border-[#1D63A1]/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#232D35]">Tracks Comparison</h3>
          
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                activeFilter === 'all' 
                  ? 'bg-[#1D63A1] text-[#1D63A1] border-[#1D63A1]' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All Tracks
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                activeFilter === 'academic' 
                  ? 'bg-[#1D63A1] text-[#1D63A1] border-[#1D63A1]' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter('academic')}
            >
              Academic
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                activeFilter === 'other' 
                  ? 'bg-[#1D63A1] text-[#1D63A1] border-[#1D63A1]' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
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
                  display: false, // Remove the legend
                },
              },
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
                    text: activeFilter === 'academic' ? 'Academic Tracks' : 
                          activeFilter === 'other' ? 'Non-Academic Tracks' : 'All Tracks'
                  }
                }
              }
            }}
          />}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Academic Tracks */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#232D35] pb-2 border-b border-gray-200">Academic Tracks</h3>
          {academicTracks.map(track => (
            <div key={track.id} className={`rounded-xl shadow-md p-5 border ${getScoreBgColor(track.score)}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-[#232D35]">{track.name}</h3>
                <span className={`text-xl font-bold ${getScoreColor(track.score)}`}>
                  {track.score.toFixed(1)}%
                </span>
              </div>
              <p className="text-left text-sm text-gray-600 mb-4">
                {track.description}
              </p>
              <div className="text-left text-xs text-gray-500">
                <p><span className="font-semibold">Strengths needed:</span> {track.strengths}</p>
                <p><span className="font-semibold">Career paths:</span> {track.careers}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Right column - Non-Academic Tracks */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#232D35] pb-2 border-b border-gray-200">Non-Academic Tracks</h3>
          {otherTracks.map(track => (
            <div key={track.id} className={`rounded-xl shadow-md p-5 border ${getScoreBgColor(track.score)}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-[#232D35]">{track.name}</h3>
                <span className={`text-xl font-bold ${getScoreColor(track.score)}`}>
                  {track.score.toFixed(1)}%
                </span>
              </div>
              <p className="text-left text-sm text-gray-600 mb-4">
                {track.description}
              </p>
              <div className="text-left text-xs text-gray-500">
                <p><span className="font-semibold">Strengths needed:</span> {track.strengths}</p>
                <p><span className="font-semibold">Career paths:</span> {track.careers}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AcademicTab;
