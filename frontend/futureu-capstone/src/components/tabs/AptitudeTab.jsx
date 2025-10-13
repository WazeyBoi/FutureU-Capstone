import React from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AptitudeTab = ({ results, getScoreColor, getScoreBgColor }) => {
  if (!results || !results.assessmentResult) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No aptitude data available.</p>
      </div>
    );
  }

  const aptitudeData = [
    {
      id: 'scientific',
      name: 'Scientific Ability',
      score: results.assessmentResult?.scientificAbilityScore || 0,
      description: 'Percentage of science and analytical reasoning questions answered correctly, including physics, chemistry, biology, and scientific methodology problems.',
      color: '#1D63A1',
      bgColor: '#1D63A1/10',
      insights: 'Strong scientific ability indicates excellent potential for STEM careers including research scientist, medical doctor, engineer, data analyst, laboratory technician, environmental scientist, and academic researcher. This score reflects your capacity for systematic thinking, hypothesis testing, and understanding complex scientific concepts.'
    },
    {
      id: 'reading',
      name: 'Reading Comprehension',
      score: results.assessmentResult?.readingComprehensionScore || 0,
      description: 'Percentage of reading comprehension and text analysis questions answered correctly, measuring ability to understand, interpret, and analyze written material across various contexts.',
      color: '#FFB71B',
      bgColor: '#FFB71B/10',
      insights: 'Excellent reading comprehension supports success in careers requiring strong communication and analytical skills such as journalism, law, education, literature, psychology, social work, marketing, and business analysis. This ability is crucial for academic success and professional advancement in virtually all fields.'
    },
    {
      id: 'verbal',
      name: 'Verbal Ability',
      score: results.assessmentResult?.verbalAbilityScore || 0,
      description: 'Percentage of vocabulary, grammar, and verbal reasoning questions answered correctly, assessing language proficiency, word relationships, and linguistic pattern recognition.',
      color: '#1D63A1',
      bgColor: '#1D63A1/10',
      insights: 'Strong verbal ability is essential for careers in writing, teaching, law, public relations, sales, counseling, and leadership roles. This skill indicates your capacity for clear communication, persuasive argumentation, and effective expression of complex ideas both verbally and in writing.'
    },
    {
      id: 'mathematical',
      name: 'Mathematical Ability',
      score: results.assessmentResult?.mathematicalAbilityScore || 0,
      description: 'Percentage of mathematical problem-solving and quantitative reasoning questions answered correctly, including arithmetic, algebra, geometry, statistics, and logical mathematical thinking.',
      color: '#FFB71B',
      bgColor: '#FFB71B/10',
      insights: 'High mathematical ability opens doors to careers in engineering, finance, data science, actuarial science, computer programming, architecture, economics, and research. This skill demonstrates your capacity for logical reasoning, pattern recognition, and systematic problem-solving approaches.'
    },
    {
      id: 'logical',
      name: 'Logical Reasoning',
      score: results.assessmentResult?.logicalReasoningScore || 0,
      description: 'Percentage of logical puzzles and systematic reasoning questions answered correctly, measuring deductive reasoning, pattern analysis, and structured problem-solving abilities.',
      color: '#1D63A1',
      bgColor: '#1D63A1/10',
      insights: 'Excellent logical reasoning is highly valued in programming, law, consulting, detective work, strategic planning, game design, and analytical roles. This ability indicates your strength in breaking down complex problems, identifying patterns, and developing systematic solutions through structured thinking.'
    }
  ];

  const overallGSA = results.assessmentResult?.gsaScore || 0;

  // Sort aptitudes by score for ranking
  const sortedAptitudes = [...aptitudeData].sort((a, b) => b.score - a.score);

  // Chart data
  const chartData = {
    labels: aptitudeData.map(item => item.name),
    datasets: [
      {
        label: 'Aptitude Scores (%)',
        data: aptitudeData.map(item => item.score),
        backgroundColor: [
          'rgba(29, 99, 161, 0.8)',
          'rgba(255, 183, 27, 0.8)',
          'rgba(29, 99, 161, 0.8)',
          'rgba(255, 183, 27, 0.8)',
          'rgba(29, 99, 161, 0.8)'
        ],
        borderColor: [
          'rgba(29, 99, 161, 1)',
          'rgba(255, 183, 27, 1)',
          'rgba(29, 99, 161, 1)',
          'rgba(255, 183, 27, 1)',
          'rgba(29, 99, 161, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Aptitude Score Distribution',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    }
  };

  const getPerformanceLevel = (score) => {
    if (score >= 85) return { level: 'Exceptional', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 70) return { level: 'Strong', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 55) return { level: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (score >= 40) return { level: 'Developing', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { level: 'Needs Focus', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    // Find top 2 and bottom 1 aptitudes
    const top2 = sortedAptitudes.slice(0, 2);
    const lowest = sortedAptitudes[sortedAptitudes.length - 1];
    const highest = top2[0];

    // Strength-based recommendations
    if (highest.score >= 70) {
      recommendations.push({
        type: 'strength',
        title: `Leverage Your ${highest.name} Strength`,
        content: `Your strongest aptitude is ${highest.name} (${highest.score.toFixed(1)}%). This places you in the top performance tier. Consider pursuing academic programs and career paths that heavily utilize this cognitive strength. Focus on opportunities that allow you to apply and further develop this natural ability while building complementary skills.`
      });
    }

    // Second strength recommendation
    if (top2[1] && top2[1].score >= 60) {
      recommendations.push({
        type: 'strength',
        title: `Build on Your ${top2[1].name}`,
        content: `Your second-strongest area, ${top2[1].name} (${top2[1].score.toFixed(1)}%), represents another significant asset. Consider how you can combine this with your primary strength to create a unique skill profile that sets you apart in your chosen field.`
      });
    }

    // Improvement areas
    if (lowest.score < 60) {
      recommendations.push({
        type: 'improvement',
        title: `Develop Your ${lowest.name}`,
        content: `Your ${lowest.name} score (${lowest.score.toFixed(1)}%) represents an opportunity for growth. While this may not become your strongest area, improving this skill through targeted practice, tutoring, or specialized courses can enhance your overall cognitive toolkit and open additional career pathways.`
      });
    }

    // Overall academic potential
    if (overallGSA >= 75) {
      recommendations.push({
        type: 'academic',
        title: 'Strong Academic Foundation',
        content: `Your overall GSA score of ${overallGSA.toFixed(1)}% indicates exceptional academic potential. You should strongly consider challenging academic tracks, advanced placement courses, honors programs, and higher education opportunities. Your cognitive abilities suggest you can handle rigorous academic work and complex problem-solving scenarios.`
      });
    } else if (overallGSA >= 60) {
      recommendations.push({
        type: 'academic',
        title: 'Solid Academic Potential',
        content: `Your overall GSA score of ${overallGSA.toFixed(1)}% shows good academic ability. Focus on developing strong study habits and seek academic support in areas where you want to improve. Consider programs that align with your strongest aptitude areas while working to strengthen other skills.`
      });
    }

    // Career pathway recommendations based on aptitude patterns
    const stemStrong = (results.assessmentResult?.scientificAbilityScore >= 65) || (results.assessmentResult?.mathematicalAbilityScore >= 65);
    const verbalStrong = (results.assessmentResult?.verbalAbilityScore >= 65) || (results.assessmentResult?.readingComprehensionScore >= 65);
    
    if (stemStrong && verbalStrong) {
      recommendations.push({
        type: 'career',
        title: 'Versatile Career Options',
        content: 'Your balanced strength in both STEM and verbal abilities opens diverse career paths including science communication, technical writing, medical fields, law with technical specialization, engineering management, and interdisciplinary research roles.'
      });
    } else if (stemStrong) {
      recommendations.push({
        type: 'career',
        title: 'STEM Career Focus',
        content: 'Your strong analytical and mathematical abilities suggest excellent potential in STEM careers. Consider engineering, computer science, data science, research, or technical fields that match your interests and values.'
      });
    } else if (verbalStrong) {
      recommendations.push({
        type: 'career',
        title: 'Communication-Focused Careers',
        content: 'Your strong verbal and reading abilities indicate potential for success in careers requiring excellent communication skills such as education, journalism, law, counseling, business, and social sciences.'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="relative">
      {/* Decorative background blobs matching DreamCareerAnalysisTab */}
      <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-gradient-to-bl from-[#1D63A1]/20 to-[#1D63A1]/10 rounded-full opacity-30 pointer-events-none transform rotate-6"></div>
      
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="space-y-8 relative z-10"
      >
        {/* Visual + Recommendations: side-by-side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-[#FFB71B]/10 h-full relative overflow-hidden"
            >
              <div className="absolute -left-12 -top-12 w-48 h-48 bg-gradient-to-tr from-[#FFB71B]/30 to-[#FFB71B]/10 rounded-full opacity-40 pointer-events-none transform -rotate-12"></div>
              
              <h3 className="text-2xl font-extrabold text-[#232D35] mb-6 text-center relative z-10">Visual Analysis</h3>
              <div className="w-full h-80 relative z-10">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            {recommendations.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-3xl p-6 md:p-8 border border-[#FFB71B]/10 h-full"
              >
                <h3 className="text-2xl font-extrabold text-[#232D35] mb-6 text-center">Recommendations</h3>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className={`p-4 rounded-2xl transition-transform transform hover:-translate-y-0.5 ${
                        rec.type === 'strength' ? 'bg-white' :
                        rec.type === 'improvement' ? 'bg-white' :
                        rec.type === 'career' ? 'bg-white' :
                        'bg-white'
                      }`}
                      style={{ 
                        boxShadow: rec.type === 'strength' ? '0 10px 26px rgba(22,163,74,0.15)' :
                                  rec.type === 'improvement' ? '0 10px 26px rgba(249,115,22,0.15)' :
                                  rec.type === 'career' ? '0 10px 26px rgba(124,58,237,0.15)' :
                                  '0 10px 26px rgba(29,99,161,0.15)'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-1 h-12 rounded-full ${
                          rec.type === 'strength' ? 'bg-green-500' :
                          rec.type === 'improvement' ? 'bg-orange-500' :
                          rec.type === 'career' ? 'bg-purple-500' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <h4 className="text-left font-bold text-[#232D35] mb-1">{rec.title}</h4>
                          <p className="text-left text-xs text-gray-700 leading-relaxed">{rec.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Aptitude Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 md:p-8 "
        >
          <h3 className="text-2xl font-extrabold text-[#232D35] mb-12 text-center">Aptitude Breakdown</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {sortedAptitudes.map((aptitude, index) => {
              const performance = getPerformanceLevel(aptitude.score);
              
              return (
                <motion.div
                  key={aptitude.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className={`relative bg-white rounded-2xl transition-transform transform hover:-translate-y-0.5 hover:z-10 ${
                    index === 0 ? 'ring-2 ring-[#1D63A1]/30' :
                    index === 1 ? 'ring-2 ring-[#FFB71B]/30' :
                    'ring-1 ring-gray-200'
                  }`}
                  style={{ 
                    boxShadow: index === 0 ? '0 10px 26px rgba(29,99,161,0.15)' :
                              index === 1 ? '0 10px 26px rgba(255,183,27,0.15)' :
                              '0 8px 20px rgba(15,23,42,0.04)'
                  }}
                >
                  {/* Gradient Background */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-5 transition-opacity duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${aptitude.color}20 0%, ${aptitude.color}10 100%)` 
                    }}
                  />
                  
                  <div className="relative p-6 pb-12">
                    {/* Special Badge for Top 2 */}
                    {index < 2 && (
                      <div className="absolute -top-3 -right-3">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm shadow-lg ${
                          index === 0 ? 'bg-[#1D63A1]' : 'bg-[#FFB71B]'
                        }`}>
                          #{index + 1}
                        </div>
                      </div>
                    )}
                    
                    {/* Header with Score and Rank */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-1">
                          <div className="flex flex-col">
                            <h4 className="text-left font-extrabold text-lg text-[#232D35]">
                              {aptitude.name}
                            </h4>
                            {index >= 2 && (
                              <span className="inline-flex items-center justify-center w-16 h-6 text-xs font-bold text-[#1D63A1] bg-[#1D63A1]/10 rounded-full mt-1">
                                Rank #{index + 1}
                              </span>
                            )}
                          </div>
                          <div className="relative group/tooltip">
                            <svg className="w-4 h-4 text-gray-400 hover:text-[#1D63A1] cursor-help transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none w-72 z-50 shadow-lg">
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                              {aptitude.description}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-extrabold mb-1 ${index < 2 ? 'text-4xl' : 'text-3xl'}`} style={{ color: aptitude.color }}>
                          {aptitude.score.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Insights */}
                    <p className="text-left text-sm text-gray-700 leading-relaxed mb-4">{aptitude.insights}</p>
                  </div>
                  
                  {/* Performance Level - positioned at the card's bottom-right */}
                  <div className="absolute bottom-4 right-4">
                    <div className={`px-3 py-1 rounded-lg ${performance.bgColor}`}>
                      <span className={`text-xs font-bold ${performance.color}`}>
                        {performance.level}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AptitudeTab;