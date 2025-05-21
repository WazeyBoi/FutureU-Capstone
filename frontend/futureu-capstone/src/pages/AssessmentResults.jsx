import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import userAssessmentService from '../services/userAssessmentService';
import OverviewTab from '../components/tabs/OverviewTab';
import InterestsTab from '../components/tabs/InterestsTab';
import AcademicTab from '../components/tabs/AcademicTab';
import RecommendationsTab from '../components/tabs/RecommendationsTab';

// Import Chart.js components separately
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const AssessmentResults = () => {
  const { userAssessmentId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const resultsData = await userAssessmentService.getAssessmentResults(userAssessmentId);
        setResults(resultsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load assessment results. Please try again later.');
        setLoading(false);
        console.error('Error loading results:', err);
      }
    };
    
    fetchResults();
  }, [userAssessmentId]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-300';
    if (score >= 60) return 'bg-blue-100 border-blue-300';
    if (score >= 40) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };
  
  const generateRiasecRadarData = () => {
    if (!results || !results.assessmentResult) return null;
    
    const riasecResult = results.assessmentResult;
    
    return {
      labels: ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'],
      datasets: [
        {
          label: 'Your RIASEC Profile',
          data: [
            riasecResult.realisticScore,
            riasecResult.investigativeScore,
            riasecResult.artisticScore,
            riasecResult.socialScore,
            riasecResult.enterprisingScore,
            riasecResult.conventionalScore
          ],
          backgroundColor: 'rgba(29, 99, 161, 0.2)',
          borderColor: 'rgba(29, 99, 161, 1)',
          pointBackgroundColor: 'rgba(29, 99, 161, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(29, 99, 161, 1)'
        }
      ]
    };
  };
  
  const generateAcademicTracksData = () => {
    if (!results || !results.assessmentResult) return null;
    
    const trackResult = results.assessmentResult;
    
    return {
      labels: ['STEM', 'ABM', 'HUMSS', 'TVL', 'Sports', 'Arts & Design'],
      datasets: [
        {
          label: 'Track Scores',
          data: [
            trackResult.stemScore,
            trackResult.abmScore,
            trackResult.humssScore,
            trackResult.tvlScore,
            trackResult.sportsTrackScore,
            trackResult.artsDesignTrackScore
          ],
          backgroundColor: [
            'rgba(29, 99, 161, 0.7)',  
            'rgba(255, 183, 27, 0.7)',  
            'rgba(75, 192, 192, 0.7)',  
            'rgba(153, 102, 255, 0.7)', 
            'rgba(255, 99, 132, 0.7)',  
            'rgba(255, 159, 64, 0.7)'   
          ],
          borderColor: [
            'rgba(29, 99, 161, 1)',
            'rgba(255, 183, 27, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  const getTopRecommendations = () => {
    if (!results || !results.assessmentResult) return [];
    
    const scores = [
      { name: 'STEM', score: results.assessmentResult.stemScore, 
        description: 'Science, Technology, Engineering, and Mathematics track is ideal for students interested in scientific research, technological innovation, engineering design, or mathematical analysis.' },
      { name: 'ABM', score: results.assessmentResult.abmScore, 
        description: 'Accountancy, Business, and Management track is suitable for students who want to pursue careers in business management, accounting, finance, entrepreneurship, or economics.' },
      { name: 'HUMSS', score: results.assessmentResult.humssScore, 
        description: 'Humanities and Social Sciences track is perfect for students interested in social studies, communication, education, liberal arts, or careers in law, teaching, or public service.' },
      { name: 'TVL', score: results.assessmentResult.tvlScore, 
        description: 'Technical-Vocational-Livelihood track prepares students for skilled work and practical careers in various technical and vocational fields.' },
      { name: 'Sports', score: results.assessmentResult.sportsTrackScore, 
        description: 'Sports track is designed for students who excel in athletics and want to pursue careers in sports science, coaching, fitness training, or professional athletics.' },
      { name: 'Arts & Design', score: results.assessmentResult.artsDesignTrackScore, 
        description: 'Arts and Design track is tailored for creative students who want to develop skills in visual arts, performing arts, media arts, or design for careers in creative industries.' }
    ];
    
    return scores.sort((a, b) => b.score - a.score).slice(0, 3);
  };
  
  const getRiasecDescription = () => {
    if (!results || !results.assessmentResult) return null;
    
    const riasec = results.assessmentResult;
    const types = [
      { code: 'R', name: 'Realistic', score: riasec.realisticScore, 
        description: 'You enjoy working with tools, machines, and physical objects. You likely prefer practical, hands-on problems and solutions.' },
      { code: 'I', name: 'Investigative', score: riasec.investigativeScore, 
        description: 'You enjoy investigating and analyzing, solving complex problems, and working with ideas rather than people or things.' },
      { code: 'A', name: 'Artistic', score: riasec.artisticScore, 
        description: 'You value self-expression and enjoy creating art, music, drama, or writing. You prefer unstructured environments for creative expression.' },
      { code: 'S', name: 'Social', score: riasec.socialScore, 
        description: 'You enjoy helping, teaching, counseling, or otherwise providing service to others. You value relationships and helping people solve problems.' },
      { code: 'E', name: 'Enterprising', score: riasec.enterprisingScore, 
        description: 'You enjoy leading, persuading, and managing others. You value status, power, and recognition and enjoy taking risks for profit.' },
      { code: 'C', name: 'Conventional', score: riasec.conventionalScore, 
        description: 'You enjoy working with data, numbers, and details. You value accuracy, stability, and efficiency, and prefer structured environments with clear rules.' }
    ];
    
    return types.sort((a, b) => b.score - a.score).slice(0, 2);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <div className="loader"></div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[#1D63A1] font-medium mt-4"
        >
          Analyzing your assessment results...
        </motion.p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#232D35]/10 to-white min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#1D63A1] to-[#232D35] bg-clip-text text-transparent">
          Your Assessment Results
        </h1>
        <p className="mt-4 text-lg text-[#232D35]/70">
          Discover your academic strengths and potential career paths
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-md p-6 border border-[#1D63A1]/20 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="col-span-2">
            <h2 className="text-left text-xl font-bold text-[#232D35] mb-2">
              {results?.userAssessment?.assessment?.title || 'FutureU Assessment'}
            </h2>
            <p className="text-left text-gray-600 mb-4">
              {results?.userAssessment?.assessment?.description || 'Comprehensive assessment to help guide your academic and career choices'}
            </p>
            <div className="flex gap-10 text-sm">
              <div>
                <p className="text-gray-500">Completed on:</p>
                <p className="font-medium text-[#232D35]">{formatDate(results?.userAssessment?.dateCompleted)}</p>
              </div>
              <div>
                <p className="text-gray-500">Time spent:</p>
                <p className="font-medium text-[#232D35]">{results?.userAssessment?.timeSpentSeconds ? 
                  `${Math.floor(results.userAssessment.timeSpentSeconds / 60)} minutes` : 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1D63A1]/10 to-[#232D35]/10 rounded-xl p-6 text-center">
            <p className="text-sm font-medium text-[#1D63A1] mb-1">Overall Score</p>
            <div className="text-5xl font-bold text-[#232D35]">
              {results?.assessmentResult?.overallScore?.toFixed(1)}%
            </div>
            <div className={`text-sm font-medium mt-2 ${getScoreColor(results?.assessmentResult?.overallScore || 0)}`}>
              {results?.assessmentResult?.overallScore >= 80 ? 'Excellent' : 
               results?.assessmentResult?.overallScore >= 60 ? 'Good' : 
               results?.assessmentResult?.overallScore >= 40 ? 'Average' : 'Needs Improvement'}
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 font-medium text-sm ${
              activeTab === 'overview' ? 
              'border-b-2 border-[#1D63A1] text-[#1D63A1]' : 
              'text-gray-500 hover:text-[#1D63A1] hover:border-b-2 hover:border-[#1D63A1]/40'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('interests')}
            className={`pb-4 px-1 font-medium text-sm ${
              activeTab === 'interests' ? 
              'border-b-2 border-[#1D63A1] text-[#1D63A1]' : 
              'text-gray-500 hover:text-[#1D63A1] hover:border-b-2 hover:border-[#1D63A1]/40'
            }`}
          >
            Interest Profile
          </button>
          <button 
            onClick={() => setActiveTab('academic')}
            className={`pb-4 px-1 font-medium text-sm ${
              activeTab === 'academic' ? 
              'border-b-2 border-[#1D63A1] text-[#1D63A1]' : 
              'text-gray-500 hover:text-[#1D63A1] hover:border-b-2 hover:border-[#1D63A1]/40'
            }`}
          >
            Academic Tracks
          </button>
          <button 
            onClick={() => setActiveTab('recommendations')}
            className={`pb-4 px-1 font-medium text-sm ${
              activeTab === 'recommendations' ? 
              'border-b-2 border-[#1D63A1] text-[#1D63A1]' : 
              'text-gray-500 hover:text-[#1D63A1] hover:border-b-2 hover:border-[#1D63A1]/40'
            }`}
          >
            Recommendations
          </button>
        </nav>
      </div>
      
      {results ? (
        <div className="min-h-[500px]">
          {activeTab === 'overview' && (
            <OverviewTab 
              results={results} 
              getScoreColor={getScoreColor} 
              getScoreBgColor={getScoreBgColor} 
            />
          )}
          
          {activeTab === 'interests' && (
            <InterestsTab 
              results={results} 
              generateRiasecRadarData={generateRiasecRadarData} 
              getRiasecDescription={getRiasecDescription} 
            />
          )}
          
          {activeTab === 'academic' && (
            <AcademicTab 
              results={results} 
              generateAcademicTracksData={generateAcademicTracksData} 
              getScoreColor={getScoreColor} 
              getScoreBgColor={getScoreBgColor} 
            />
          )}
          
          {activeTab === 'recommendations' && (
            <RecommendationsTab 
              getTopRecommendations={getTopRecommendations} 
              userAssessmentId={userAssessmentId}
            />
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8 bg-white rounded-xl shadow-md p-6 border border-[#1D63A1]/20">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No result data available</h3>
          <p className="mt-1 text-sm text-gray-500">There was an issue retrieving your assessment results.</p>
        </div>
      )}
      
      <div className="mt-10 flex justify-between">
        <button
          onClick={() => navigate('/assessment-dashboard')}
          className="inline-flex items-center px-5 py-2.5 border border-[#1D63A1] text-[#1D63A1] bg-white rounded-lg hover:bg-[#1D63A1]/5 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Dashboard
        </button>
        
        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/80 text-[#232D35] rounded-lg hover:from-[#FFB71B]/90 hover:to-[#FFB71B]/70 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          Print Results
        </button>
      </div>
    </div>
  );
};

export default AssessmentResults;
