import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import userAssessmentService from "../../services/userAssessmentService";
import * as recommendationService from "../../services/recommendationService";
import programRecommendationService from '../../services/programRecommendationService';
import { Radar, Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import CounselorTabs from "./CounselorTabs";

const highlightScore = (score, max = 100) => {
  if (score >= 0.85 * max) return "text-green-600 font-bold";
  if (score >= 0.7 * max) return "text-yellow-600 font-semibold";
  if (score) return "text-red-500 font-semibold";
  return "text-gray-500";
};

// Helper function to get performance level description
const getPerformanceLevel = (score, max = 100) => {
  const percentage = (score / max) * 100;
  if (percentage >= 85) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-100" };
  if (percentage >= 70) return { level: "Above Average", color: "text-green-600", bgColor: "bg-green-50" };
  if (percentage >= 50) return { level: "Average", color: "text-yellow-600", bgColor: "bg-yellow-50" };
  if (percentage >= 30) return { level: "Below Average", color: "text-orange-600", bgColor: "bg-orange-50" };
  return { level: "Needs Support", color: "text-red-600", bgColor: "bg-red-50" };
};

// Helper function to get performance insights for GSA scores
const getGSAInsights = (result) => {
  return [
    { 
      name: "Scientific Ability", 
      score: result.scientificAbilityScore, 
      performance: getPerformanceLevel(result.scientificAbilityScore),
      description: "Problem-solving and analytical thinking in scientific contexts"
    },
    { 
      name: "Reading Comprehension", 
      score: result.readingComprehensionScore, 
      performance: getPerformanceLevel(result.readingComprehensionScore),
      description: "Understanding and interpreting written texts"
    },
    { 
      name: "Verbal Ability", 
      score: result.verbalAbilityScore, 
      performance: getPerformanceLevel(result.verbalAbilityScore),
      description: "Language skills and vocabulary usage"
    },
    { 
      name: "Mathematical Ability", 
      score: result.mathematicalAbilityScore, 
      performance: getPerformanceLevel(result.mathematicalAbilityScore),
      description: "Numerical reasoning and mathematical problem-solving"
    },
    { 
      name: "Logical Reasoning", 
      score: result.logicalReasoningScore, 
      performance: getPerformanceLevel(result.logicalReasoningScore),
      description: "Abstract thinking and logical problem-solving"
    }
  ];
};

// Helper function to get RIASEC insights with top 3 personality types
const getRIASECInsights = (result) => {
  const riasecTypes = [
    { name: "Realistic", score: result.realisticScore, description: "Hands-on, practical, mechanical interests" },
    { name: "Investigative", score: result.investigativeScore, description: "Scientific, analytical, research-oriented" },
    { name: "Artistic", score: result.artisticScore, description: "Creative, expressive, innovative thinking" },
    { name: "Social", score: result.socialScore, description: "People-oriented, helping, teaching interests" },
    { name: "Enterprising", score: result.enterprisingScore, description: "Leadership, persuasive, business-minded" },
    { name: "Conventional", score: result.conventionalScore, description: "Organized, detail-oriented, structured work" }
  ];
  
  // Sort by score (no performance levels for personality types)
  return riasecTypes
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Show only top 3
};

// Helper function to get Track Performance insights and recommendations
const getTrackInsights = (result) => {
  const tracks = [
    { 
      name: "STEM", 
      score: result.stemScore, 
      description: "Science, Technology, Engineering, Mathematics",
      careers: ["Engineer", "Data Scientist", "Medical Doctor", "Research Scientist"],
      fullName: "Science, Technology, Engineering & Mathematics"
    },
    { 
      name: "ABM", 
      score: result.abmScore, 
      description: "Accountancy, Business & Management",
      careers: ["Business Manager", "Accountant", "Entrepreneur", "Marketing Manager"],
      fullName: "Accountancy, Business & Management"
    },
    { 
      name: "HUMSS", 
      score: result.humssScore, 
      description: "Humanities & Social Sciences",
      careers: ["Teacher", "Lawyer", "Psychologist", "Social Worker"],
      fullName: "Humanities & Social Sciences"
    },
    { 
      name: "TVL", 
      score: result.tvlScore, 
      description: "Technical-Vocational-Livelihood",
      careers: ["Chef", "IT Technician", "Electrician", "Graphic Designer"],
      fullName: "Technical-Vocational-Livelihood"
    },
    { 
      name: "Sports", 
      score: result.sportsTrackScore, 
      description: "Sports & Physical Education Track",
      careers: ["Sports Coach", "Physical Therapist", "Fitness Trainer", "Sports Analyst"],
      fullName: "Sports & Physical Education"
    },
    { 
      name: "Arts & Design", 
      score: result.artsDesignTrackScore, 
      description: "Creative Arts & Design Track",
      careers: ["Graphic Designer", "Architect", "Fine Artist", "Interior Designer"],
      fullName: "Arts & Design"
    }
  ];

  // Sort by score and add performance levels
  const rankedTracks = tracks
    .map(track => ({
      ...track,
      performance: getPerformanceLevel(track.score, 100)
    }))
    .sort((a, b) => b.score - a.score);

  return {
    topTrack: rankedTracks[0],
    topThree: rankedTracks.slice(0, 3),
    allTracks: rankedTracks
  };
};

const StudentReportPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // New state for active tab
  const [careerRecs, setCareerRecs] = useState([]);
  const [careerRecsLoading, setCareerRecsLoading] = useState(false);
  const [careerRecsError, setCareerRecsError] = useState(null);
  const [programRecs, setProgramRecs] = useState([]);
  const [programRecsLoading, setProgramRecsLoading] = useState(false);
  const [programRecsError, setProgramRecsError] = useState(null);

  useEffect(() => {
    if (!result) {
      // Try to get id from query string
      const id = searchParams.get("id");
      if (id) {
        setLoading(true);
        userAssessmentService
          .getAssessmentResults(id)
          .then((data) => {
            setResult(data);
            setLoading(false);
          })
          .catch((err) => {
            setError("Failed to load assessment result.");
            setLoading(false);
          });
      }
    }
  }, [result, searchParams]);

  useEffect(() => {
    if (activeTab === 1 && result?.resultId) {
      setCareerRecsLoading(true);
      setCareerRecsError(null);
      recommendationService
        .fetchRecommendationsByResult(result.resultId)
        .then((res) => {
          setCareerRecs(res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : []);
          setCareerRecsLoading(false);
        })
        .catch((err) => {
          setCareerRecsError("Failed to fetch career recommendations.");
          setCareerRecsLoading(false);
        });
    }
  }, [activeTab, result?.resultId]);

  useEffect(() => {
    if (activeTab === 2 && result?.resultId) {
      setProgramRecsLoading(true);
      setProgramRecsError(null);
      programRecommendationService
        .fetchProgramRecommendationsByResult(result.resultId)
        .then((res) => {
          setProgramRecs(res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : []);
          setProgramRecsLoading(false);
        })
        .catch((err) => {
          setProgramRecsError("Failed to fetch program recommendations.");
          setProgramRecsLoading(false);
        });
    }
  }, [activeTab, result?.resultId]);

  // Helper: Generate GSA Bar Chart Data
  function getGsaBarData(result) {
    return {
      labels: ["Scientific", "Reading", "Verbal", "Math", "Logic"],
      datasets: [
        {
          label: "Score",
          data: [
            result.scientificAbilityScore,
            result.readingComprehensionScore,
            result.verbalAbilityScore,
            result.mathematicalAbilityScore,
            result.logicalReasoningScore,
          ],
          backgroundColor: [
            "#1D63A1",
            "#FFB71B",
            "#1D63A1",
            "#FFB71B",
            "#1D63A1",
          ],
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    };
  }

  // Helper: Generate RIASEC Radar Data
  function getRiasecRadarData(result) {
    const riasecValues = [
      result.realisticScore,
      result.investigativeScore,
      result.artisticScore,
      result.socialScore,
      result.enterprisingScore,
      result.conventionalScore,
    ];
    const maxValue = Math.max(...riasecValues, 1); // avoid 0 max
    return {
      labels: [
        "Realistic",
        "Investigative",
        "Artistic",
        "Social",
        "Enterprising",
        "Conventional",
      ],
      datasets: [
        {
          label: "RIASEC",
          data: riasecValues,
          backgroundColor: "rgba(255,183,27,0.2)",
          borderColor: "#FFB71B",
          pointBackgroundColor: "#1D63A1",
          pointBorderColor: "#FFB71B",
          borderWidth: 2,
        },
      ],
      maxValue, // pass for chart options
    };
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  if (!result)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        No report data available.
      </div>
    );

  const user = result.userAssessment?.user || {};
  const assessment = result.userAssessment?.assessment || {};

  // Example recommendations (could be dynamic)
  const recommendations = [
    result.stemScore > 80 && "Consider STEM track!",
    result.abmScore > 80 && "Great fit for ABM programs.",
    result.humssScore > 80 && "Explore HUMSS opportunities.",
    result.sportsTrackScore > 80 && "Sports track is a strong match!",
    result.artsDesignTrackScore > 80 && "Arts & Design could be your path!",
  ].filter(Boolean);

  // RIASEC Top 3 code
  const riasecScores = [
    { code: "R", value: result.realisticScore },
    { code: "I", value: result.investigativeScore },
    { code: "A", value: result.artisticScore },
    { code: "S", value: result.socialScore },
    { code: "E", value: result.enterprisingScore },
    { code: "C", value: result.conventionalScore },
  ];
  const riasecTop3 = riasecScores
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((s) => s.code)
    .join("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e8f1fa] pt-8">
      {/* Back Button */}
      <div className="mb-8 flex justify-start w-full max-w-7xl">
        <button
          className="flex items-center gap-2 text-[#2B3E4E] hover:text-white font-semibold px-4 py-2 rounded-lg transition-colors bg-gradient-to-r from-white to-white hover:from-[#FFB71B] hover:to-[#FFB71B]"
          onClick={() =>
            window.history.length > 1
              ? window.history.back()
              : window.location.assign("/counselor-dashboard")
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Main Dashboard
        </button>
      </div>
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full border border-[#FFB71B]/30 overflow-y-auto animate-fade-in">
        {/* Header with Overall & RIASEC */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between pt-10 pb-6 px-25 bg-gradient-to-r from-[#FFB71B]/10 to-[#1D63A1]/10 border-b-2 border-[#FFB71B]/20 rounded-t-3xl gap-6 relative">
          {/* Decorative playful icon */}
          <div className="flex flex-col items-center md:items-start z-10 w-full relative">
            {/* Mascot image, top right, overlapping avatar */}
            <img
              src="/src/assets/characters/quirky.svg"
              alt="Mascot"
              className="absolute right-157 -top-10 w-20 h-20 pointer-events-none select-none z-20 rotate-[25deg]"
              style={{ filter: 'drop-shadow(0 2px 8px #FFB71B33)' }}
            />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1D63A1] to-[#FFB71B] flex items-center justify-center text-white text-5xl font-extrabold shadow-lg mb-2 animate-bounce-in border-4 border-[#2B3E4E] relative z-10">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <h2 className="text-left font-bold text-3xl text-[#2B3E4E] mb-1 text-center md:text-left tracking-tight drop-shadow-sm">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex items-center gap-2 text-sm text-[#FFB71B] mb-1">
              {user.email}
            </div>
          </div>
          {/* Overall & RIASEC summary */}
          <div className="flex flex-row gap-8 items-end mt-4 md:mt-0 z-10 h-full">
            <div className="absolute right-25 top-5">
              <div className="text-2xl text-[#2B3E4E] font-bold rounded-lg py-2">
                {assessment.title} |{" "}
                {result.userAssessment?.dateCompleted?.split("T")[0]}
              </div>
            </div>
            <div className="flex flex-col items-center bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-100 min-w-[140px] shadow-md hover:scale-105 transition-transform">
              <span className="text-xs text-emerald-700 font-semibold mb-1 flex items-center gap-1">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 12V4"
                  />
                </svg>
                Overall
              </span>
              <span className="text-3xl font-extrabold text-emerald-700 text-right">
                {typeof result.overallScore === "number"
                  ? result.overallScore.toFixed(2)
                  : result.overallScore}
              </span>
            </div>
            <div className="flex flex-col items-center bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-100 min-w-[140px] shadow-md hover:scale-105 transition-transform">
              <span className="text-xs text-yellow-700 font-semibold mb-1 flex items-center gap-1">
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 15h8M8 11h8M8 7h8"
                  />
                </svg>
                RIASEC
              </span>
              <span className="font-bold text-yellow-700 text-right text-2xl tracking-widest">
                {riasecTop3}
              </span>
              <span className="text-xs text-gray-500 text-right">
                (
                {result.realisticScore}/
                {result.investigativeScore}/
                {result.artisticScore}/
                {result.socialScore}/
                {result.enterprisingScore}/
                {result.conventionalScore}
                )
              </span>
            </div>
          </div>
        </div>
        {/* Scores Section as Tabs with Graphs */}
        <div className="w-full flex flex-col items-center justify-center px-2 md:px-0">
          <div className="max-w-6xl w-full px-4 md:px-10 py-8">
            {/* Navigation Tabs */}
            <CounselorTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={["Scores Breakdown", "Career Recommendations", "Program Recommendations"]}
            />
            {/* Tab Content */}
            {activeTab === 0 && (
              <>
                <h3 className="font-semibold text-[#2B3E4E] mb-6 text-xl flex items-center gap-2">
                  Scores Breakdown
                </h3>
                <div className="flex flex-col md:flex-row gap-8 mt-8">
                  {/* GSA Bar Chart */}
                  <motion.div
                    className="flex-1 bg-gradient-to-br from-[#F8F9FA] to-[#FFB71B]/10 rounded-2xl shadow p-4 flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h4 className="font-bold text-[#2B3E4E] text-lg mb-2">
                      General Scholastic Aptitude
                    </h4>
                    <div className="w-full max-w-sm h-48">
                      <Bar
                        data={getGsaBarData(result)}
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                          scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } },
                        }}
                      />
                    </div>
                    
                    {/* Performance Indicators */}
                    <div className="w-full mt-4 space-y-2 max-w-sm">
                      <h5 className="text-sm font-semibold text-[#2B3E4E] mb-2">Performance Analysis:</h5>
                      {getGSAInsights(result).map((insight, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-white/50">
                          <div className="flex-1">
                            <div className="text-xs text-left font-medium text-[#2B3E4E]">{insight.name}</div>
                            <div className="text-xs text-left text-gray-600">{insight.description}</div>
                          </div>
                          <div className="text-right ml-2">
                            <div className={`text-xs font-bold px-2 py-1 rounded ${insight.performance.bgColor} ${insight.performance.color}`}>
                              {insight.performance.level}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Score: {insight.score}/100
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  {/* RIASEC Radar Chart */}
                  <motion.div
                    className="flex-1 bg-gradient-to-br from-[#F8F9FA] to-[#1D63A1]/10 rounded-2xl shadow p-4 flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h4 className="font-bold text-[#2B3E4E] text-lg mb-2">
                      RIASEC Profile
                    </h4>
                    <div className="w-full max-w-xs h-48 flex items-center justify-center overflow-visible">
                      <div className="w-full h-full">
                        <Radar
                          data={getRiasecRadarData(result)}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            layout: { padding: 0 },
                            scales: {
                              r: {
                                min: 0,
                                max: getRiasecRadarData(result).maxValue,
                                pointLabels: { font: { size: 12 } },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Top 3 Personality Types */}
                    <div className="w-full mt-4 space-y-2 max-w-xs">
                      <h5 className="text-sm font-semibold text-[#2B3E4E] mb-2">Student's Top Personality Types:</h5>
                      {getRIASECInsights(result).map((insight, index) => (
                        <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-white/70 border border-blue-100">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <div className="text-sm font-bold text-[#1D63A1] mr-2">#{index + 1}</div>
                              <div className="text-sm text-left font-semibold text-[#2B3E4E]">{insight.name}</div>
                            </div>
                            <div className="text-xs text-left text-gray-600 ml-6">{insight.description}</div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-lg font-bold text-[#1D63A1]">
                              {insight.score}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Strength
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700 text-center">
                          These personality traits help identify suitable career environments and work styles.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
                {/* Track Scores Bar Chart - styled like AcademicTab */}
                <motion.div
                  className="w-full bg-white rounded-3xl shadow-xl p-6 border-2 border-[#1D63A1]/10 mt-8 animate-card-pop"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                >
                  <div className="text-center mb-4">
                    <h4 className="font-bold text-[#2B3E4E] text-lg mb-2 md:mb-0">
                      Track Scores Comparison
                    </h4>
                  </div>
                  <div className="h-[320px] w-full max-w-2xl mx-auto">
                    <Bar
                      data={{
                        labels: [
                          "STEM",
                          "ABM",
                          "HUMSS",
                          "TVL",
                          "Sports",
                          "Arts & Design",
                        ],
                        datasets: [
                          {
                            label: "Score",
                            data: [
                              result.stemScore,
                              result.abmScore,
                              result.humssScore,
                              result.tvlScore,
                              result.sportsTrackScore,
                              result.artsDesignTrackScore,
                            ],
                            backgroundColor: [
                              "#1D63A1",
                              "#FFB71B",
                              "#1D63A1",
                              "#FFB71B",
                              "#1D63A1",
                              "#FFB71B",
                            ],
                            borderRadius: 12,
                            barPercentage: 0.6,
                            categoryPercentage: 0.7,
                            borderWidth: 2,
                            borderColor: [
                              "#1D63A1",
                              "#FFB71B",
                              "#1D63A1",
                              "#FFB71B",
                              "#1D63A1",
                              "#FFB71B",
                            ],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: "Score (%)",
                              color: "#1D63A1",
                              font: { weight: "bold" },
                            },
                            ticks: { color: "#232D35" },
                            grid: { color: "#F8F9FA" },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "All Tracks",
                              color: "#1D63A1",
                              font: { weight: "bold" },
                            },
                            ticks: { color: "#232D35" },
                            grid: { color: "#F8F9FA" },
                          },
                        },
                      }}
                    />
                  </div>
                  
                  {/* Track Performance Analysis & Recommendations */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Best Track Match */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                      <h5 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                        <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                        Best Track Match
                      </h5>
                      {(() => {
                        const trackInsights = getTrackInsights(result);
                        return (
                          <div>
                            <div className="mb-2">
                              <div className="text-xl font-bold text-green-800">{trackInsights.topTrack.name}</div>
                              <div className="text-sm text-green-700">{trackInsights.topTrack.fullName}</div>
                            </div>
                            <div className="mb-3">
                              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${trackInsights.topTrack.performance.bgColor} ${trackInsights.topTrack.performance.color}`}>
                                {trackInsights.topTrack.performance.level} - {trackInsights.topTrack.score}/100
                              </div>
                            </div>
                            <div className="text-sm text-green-700 mb-3">{trackInsights.topTrack.description}</div>
                            <div>
                              <div className="text-sm font-semibold text-green-800 mb-1">Suitable Careers:</div>
                              <div className="flex flex-wrap gap-1">
                                {trackInsights.topTrack.careers.map((career, idx) => (
                                  <span key={idx} className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">
                                    {career}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Track Rankings */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <h5 className="text-lg font-bold text-blue-800 mb-3">Track Performance Rankings</h5>
                      <div className="space-y-2">
                        {getTrackInsights(result).topThree.map((track, index) => (
                          <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-white/60">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                                  index === 0 ? 'bg-yellow-500 text-white' : 
                                  index === 1 ? 'bg-gray-400 text-white' : 'bg-orange-600 text-white'
                                }`}>
                                  {index + 1}
                                </span>
                                <div className="text-sm text-left font-semibold text-blue-800">{track.name}</div>
                              </div>
                              <div className="text-xs text-left text-blue-600 ml-8">{track.description}</div>
                            </div>
                            <div className="text-right ml-2">
                              <div className={`text-xs font-bold px-2 py-1 rounded ${track.performance.bgColor} ${track.performance.color}`}>
                                {track.performance.level}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {track.score}/100
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
            {activeTab === 1 && (
              <>
                <h3 className="font-semibold text-[#FFB71B] mb-6 text-xl flex items-center gap-2">
                  Career Recommendations
                </h3>
                {careerRecsLoading ? (
                  <div className="text-center text-gray-500 italic">Loading career recommendations...</div>
                ) : careerRecsError ? (
                  <div className="text-center text-red-500 italic">{careerRecsError}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {careerRecs.length > 0 ? (
                      careerRecs.map((rec, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-[#FFF9E5] to-[#FFB71B]/10 border-2 border-[#FFB71B]/30 rounded-2xl p-6 shadow-lg flex flex-col gap-2 animate-card-pop hover:scale-[1.02] transition-transform"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FFB71B]/20">
                              <svg
                                className="w-7 h-7 text-[#FFB71B]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 8v4l3 3m-3-3l-3 3m3-3V4"
                                />
                              </svg>
                            </div>
                            <span className="font-bold text-[#2B3E4E] text-lg">{
                              rec.careerPath?.careerTitle || rec.careerTitle || rec.name || "Career Match"
                            }</span>
                          </div>
                          <p className="text-[#232D35] text-base font-medium">{
                            rec.careerPath?.careerDescription || rec.description || rec.matchExplanation || rec
                          }</p>
                          {rec.confidenceScore && (
                            <span className="inline-block mt-2 px-3 py-1 bg-[#FFB71B]/10 text-[#FFB71B] rounded-full text-sm font-bold">
                              {rec.confidenceScore.toFixed(1)}% Match
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 italic col-span-2">
                        No specific career recommendations based on the current data.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {activeTab === 2 && (
              <>
                <h3 className="font-semibold text-[#1D63A1] mb-6 text-xl flex items-center gap-2">
                  Program Recommendations
                </h3>
                {programRecsLoading ? (
                  <div className="text-center text-gray-500 italic">Loading program recommendations...</div>
                ) : programRecsError ? (
                  <div className="text-center text-red-500 italic">{programRecsError}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {programRecs.length > 0 ? (
                      programRecs.map((rec, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-[#E8F1FA] to-[#1D63A1]/10 border-2 border-[#1D63A1]/30 rounded-2xl p-6 shadow-lg flex flex-col gap-2 animate-card-pop hover:scale-[1.02] transition-transform"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1D63A1]/20">
                              <svg
                                className="w-7 h-7 text-[#1D63A1]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 8v4l3 3m-3-3l-3 3m3-3V4"
                                />
                              </svg>
                            </div>
                            <span className="font-bold text-[#2B3E4E] text-lg">{
                              rec.program?.programName || rec.programName || "Recommended Program"
                            }</span>
                          </div>
                          <p className="text-[#232D35] text-base font-medium">{
                            rec.program?.description || rec.description || rec.matchExplanation || rec
                          }</p>
                          {rec.careerPath?.careerTitle && (
                            <span className="inline-block mt-2 px-3 py-1 bg-[#FFB71B]/10 text-[#FFB71B] rounded-full text-sm font-bold">
                              Related Career: {rec.careerPath.careerTitle}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 italic col-span-2">
                        No specific program recommendations based on the current data.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReportPage;
