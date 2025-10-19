import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import userAssessmentService from "../../services/userAssessmentService";
import * as recommendationService from "../../services/recommendationService";
import { Radar, Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import CounselorTabs from "./CounselorTabs";

import quirkyMascot from "../../assets/characters/quirky.svg";

const highlightScore = (score, max = 100) => {
  if (score >= 0.85 * max) return "text-[#FFB71B] font-bold";
  if (score >= 0.7 * max) return "text-[#2B3E4E] font-semibold";
  if (score) return "text-gray-500 font-semibold";
  return "text-gray-400";
};

// Helper function to get performance level description
const getPerformanceLevel = (score, max = 100) => {
  const percentage = (score / max) * 100;
  if (percentage >= 85) return { level: "Excellent", color: "text-[#FFB71B]", bgColor: "bg-[#FFB71B]/20" };
  if (percentage >= 70) return { level: "Above Average", color: "text-[#FFB71B]", bgColor: "bg-[#FFB71B]/10" };
  if (percentage >= 50) return { level: "Average", color: "text-[#2B3E4E]", bgColor: "bg-[#2B3E4E]/10" };
  if (percentage >= 30) return { level: "Below Average", color: "text-[#2B3E4E]", bgColor: "bg-[#2B3E4E]/20" };
  return { level: "Needs Support", color: "text-gray-600", bgColor: "bg-gray-100" };
};

// Helper function to get relative track performance (compared to student's own scores)
const getRelativeTrackPerformance = (tracks) => {
  // Sort tracks by score to determine relative ranking
  const sortedTracks = [...tracks].sort((a, b) => b.score - a.score);
  const totalTracks = tracks.length;
  
  return tracks.map(track => {
    const rank = sortedTracks.findIndex(t => t.name === track.name) + 1;
    const percentile = ((totalTracks - rank + 1) / totalTracks) * 100;
    
    let relativeLevel, color, bgColor, description;
    
    if (rank === 1) {
      relativeLevel = "Strongest Area";
      color = "text-[#FFB71B]";
      bgColor = "bg-[#FFB71B]/20";
      description = "Your highest performing track";
    } else if (rank === 2 && totalTracks > 3) {
      relativeLevel = "Strong Area";
      color = "text-[#FFB71B]";
      bgColor = "bg-[#FFB71B]/10";
      description = "One of your stronger areas";
    } else if (rank === totalTracks) {
      relativeLevel = "Growth Area";
      color = "text-[#2B3E4E]";
      bgColor = "bg-[#2B3E4E]/20";
      description = "Area for potential development";
    } else if (rank === totalTracks - 1 && totalTracks > 3) {
      relativeLevel = "Developing Area";
      color = "text-[#2B3E4E]";
      bgColor = "bg-[#2B3E4E]/15";
      description = "Area with room for growth";
    } else {
      relativeLevel = "Moderate Area";
      color = "text-[#2B3E4E]";
      bgColor = "bg-[#2B3E4E]/10";
      description = "Balanced performance area";
    }
    
    return {
      ...track,
      relativePerformance: {
        level: relativeLevel,
        color,
        bgColor,
        rank,
        percentile: Math.round(percentile),
        description
      }
    };
  });
};

// Helper function to get performance insights for GSA scores (relative to classmates)
const getGSAInsights = (result, allStudents = []) => {
  // Calculate real school averages from all students data
  const calculateSchoolAverages = (students) => {
    if (!students || students.length === 0) {
      // Fallback to mock data if no school data available
      return {
        scientificAbility: 65,
        readingComprehension: 70,
        verbalAbility: 62,
        mathematicalAbility: 68,
        logicalReasoning: 59
      };
    }

    const fields = [
      { key: 'scientificAbilityScore', name: 'scientificAbility' },
      { key: 'readingComprehensionScore', name: 'readingComprehension' },
      { key: 'verbalAbilityScore', name: 'verbalAbility' },
      { key: 'mathematicalAbilityScore', name: 'mathematicalAbility' },
      { key: 'logicalReasoningScore', name: 'logicalReasoning' }
    ];

    const averages = {};
    fields.forEach(field => {
      const validScores = students
        .map(student => Number(student[field.key]))
        .filter(score => !isNaN(score) && score >= 0);
      
      averages[field.name] = validScores.length > 0 
        ? Number((validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(1))
        : 65; // fallback average
    });

    return averages;
  };

  const schoolAverages = calculateSchoolAverages(allStudents);

  const getSchoolRelativePerformance = (studentScore, schoolAverage) => {
    const difference = studentScore - schoolAverage;
    const percentageDiff = (difference / schoolAverage) * 100;
    
    if (percentageDiff >= 20) {
      return { 
        level: "Well Above School Avg", 
        color: "text-[#FFB71B]", 
        bgColor: "bg-[#FFB71B]/20",
        percentile: "Top 15%",
        description: "Significantly higher than classmates' average"
      };
    } else if (percentageDiff >= 10) {
      return { 
        level: "Above School Avg", 
        color: "text-[#FFB71B]", 
        bgColor: "bg-[#FFB71B]/10",
        percentile: "Top 30%",
        description: "Above classmates' average"
      };
    } else if (percentageDiff >= -10) {
      return { 
        level: "Similar to School Avg", 
        color: "text-[#2B3E4E]", 
        bgColor: "bg-[#2B3E4E]/10",
        percentile: "Average Range",
        description: "Within normal range for school"
      };
    } else if (percentageDiff >= -20) {
      return { 
        level: "Below School Avg", 
        color: "text-[#2B3E4E]", 
        bgColor: "bg-[#2B3E4E]/20",
        percentile: "Lower 30%",
        description: "Below classmates' average"
      };
    } else {
      return { 
        level: "Well Below School Avg", 
        color: "text-gray-600", 
        bgColor: "bg-gray-100",
        percentile: "Lower 15%",
        description: "Significantly below classmates' average"
      };
    }
  };

  return [
    { 
      name: "Scientific Ability", 
      score: result.scientificAbilityScore, 
      schoolAverage: schoolAverages.scientificAbility,
      performance: getSchoolRelativePerformance(result.scientificAbilityScore, schoolAverages.scientificAbility),
      description: "Problem-solving and analytical thinking in scientific contexts"
    },
    { 
      name: "Reading Comprehension", 
      score: result.readingComprehensionScore, 
      schoolAverage: schoolAverages.readingComprehension,
      performance: getSchoolRelativePerformance(result.readingComprehensionScore, schoolAverages.readingComprehension),
      description: "Understanding and interpreting written texts"
    },
    { 
      name: "Verbal Ability", 
      score: result.verbalAbilityScore, 
      schoolAverage: schoolAverages.verbalAbility,
      performance: getSchoolRelativePerformance(result.verbalAbilityScore, schoolAverages.verbalAbility),
      description: "Language skills and vocabulary usage"
    },
    { 
      name: "Mathematical Ability", 
      score: result.mathematicalAbilityScore, 
      schoolAverage: schoolAverages.mathematicalAbility,
      performance: getSchoolRelativePerformance(result.mathematicalAbilityScore, schoolAverages.mathematicalAbility),
      description: "Numerical reasoning and mathematical problem-solving"
    },
    { 
      name: "Logical Reasoning", 
      score: result.logicalReasoningScore, 
      schoolAverage: schoolAverages.logicalReasoning,
      performance: getSchoolRelativePerformance(result.logicalReasoningScore, schoolAverages.logicalReasoning),
      description: "Reasoning and critical thinking abilities"
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
  const [allStudentsData, setAllStudentsData] = useState([]); // For calculating real school averages

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

  // Fetch all students data for calculating real school averages
  useEffect(() => {
    const fetchAllStudentsData = async () => {
      try {
        // Using the same API that InstitutionalDashboard uses
        const allStudents = await userAssessmentService.getAllAssessmentResults();
        setAllStudentsData(allStudents || []);
      } catch (err) {
        console.warn('Could not fetch school averages, using fallback values:', err);
        setAllStudentsData([]); // Will use fallback averages
      }
    };

    fetchAllStudentsData();
  }, []);

  useEffect(() => {
    if (activeTab === 1 && result?.userAssessment?.userQuizAssessment) {
      setCareerRecsLoading(true);
      setCareerRecsError(null);
      recommendationService
        .fetchRecommendations(result.userAssessment.userQuizAssessment)
        .then((res) => {
          const payload = res.data;
          if (payload && payload.recommendations && payload.recommendations.careerPaths) {
            // Extract careers from all career paths
            const allCareers = [];
            payload.recommendations.careerPaths.forEach((path) => {
              if (Array.isArray(path.careers)) {
                path.careers.forEach((career) => {
                  allCareers.push({
                    ...career,
                    pathName: path.careerPathName,
                  });
                });
              }
            });
            // Sort by match percentage and take top 5
            allCareers.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
            setCareerRecs(allCareers.slice(0, 5));
          } else {
            setCareerRecs([]);
          }
          setCareerRecsLoading(false);
        })
        .catch((err) => {
          setCareerRecsError("Failed to fetch career recommendations.");
          setCareerRecsLoading(false);
        });
    }
  }, [activeTab, result?.userAssessment?.userQuizAssessment]);

  useEffect(() => {
    if (activeTab === 2 && result?.userAssessment?.userQuizAssessment) {
      setProgramRecsLoading(true);
      setProgramRecsError(null);
      recommendationService
        .fetchRecommendations(result.userAssessment.userQuizAssessment)
        .then((res) => {
          const payload = res.data;
          if (payload && payload.recommendations && payload.recommendations.careerPaths) {
            // Extract programs from all career paths
            const allPrograms = [];
            payload.recommendations.careerPaths.forEach((path) => {
              if (Array.isArray(path.programs)) {
                path.programs.forEach((program) => {
                  allPrograms.push({
                    ...program,
                    pathName: path.careerPathName,
                  });
                });
              }
            });
            // Sort by match percentage and take top 5
            allPrograms.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
            setProgramRecs(allPrograms.slice(0, 5));
          } else {
            setProgramRecs([]);
          }
          setProgramRecsLoading(false);
        })
        .catch((err) => {
          setProgramRecsError("Failed to fetch program recommendations.");
          setProgramRecsLoading(false);
        });
    }
  }, [activeTab, result?.userAssessment?.userQuizAssessment]);

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
            "#2B3E4E",
            "#FFB71B",
            "#2B3E4E",
            "#FFB71B",
            "#2B3E4E",
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
          pointBackgroundColor: "#2B3E4E",
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e8f1fa] px-13 py-10">
      {/* Back Button */}
      <div className="mb-8 flex justify-start w-full max-w-8xl">
        <button
          className="flex items-center gap-2 text-[#2B3E4E] hover:text-white font-semibold px-4 py-2 rounded-lg transition-colors bg-gradient-to-r from-white to-white hover:from-[#FFB71B] hover:to-[#FFB71B]"
          onClick={() =>
            window.history.length > 1
              ? window.history.back()
              : window.location.assign("/counselor-general-dashboard")
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
      <div className="bg-white rounded-3xl shadow-2xl w-full border border-[#FFB71B]/30 overflow-y-auto animate-fade-in">
        {/* Header with Overall & RIASEC */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between pt-10 pb-6 px-25 bg-gradient-to-r from-[#FFB71B]/10 to-[#2B3E4E]/10 border-b-2 border-[#FFB71B]/20 rounded-t-3xl gap-6 relative">
          {/* Decorative playful icon */}
          <div className="flex flex-col items-center md:items-start z-10 w-full relative">
            {/* Mascot image, top right, overlapping avatar */}
            <img
              src={quirkyMascot}
              alt="Mascot"
              className="absolute right-168 -top-10 w-20 h-20 pointer-events-none select-none z-20 rotate-[25deg]"
              style={{ filter: 'drop-shadow(0 2px 8px #FFB71B33)' }}
            />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2B3E4E] to-[#FFB71B] flex items-center justify-center text-white text-5xl font-extrabold shadow-lg mb-2 animate-bounce-in border-4 border-[#2B3E4E] relative z-10">
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
          <div className="flex flex-grow"></div>
          {/* Overall & RIASEC summary */}
          <div className="flex flex-row gap-8 items-stretch mt-4 md:mt-0 z-10">
            <div className="absolute right-25 top-5 ">
              <div className="text-2xl text-[#2B3E4E] font-bold rounded-lg py-2">
                {assessment.title} |{" "}
                {result.userAssessment?.dateCompleted?.split("T")[0]}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#FFB71B]/20 rounded-2xl p-6 border-2 border-[#FFB71B]/40 min-w-[140px] shadow-md hover:scale-105 transition-transform">
              <span className="text-xs text-[#2B3E4E] font-semibold mb-1 flex items-center gap-1">
                <svg
                  className="w-5 h-5 text-[#FFB71B]"
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
              <span className="text-3xl font-extrabold text-[#2B3E4E] text-right">
                {typeof result.overallScore === "number"
                  ? result.overallScore.toFixed(2)
                  : result.overallScore}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#2B3E4E]/10 rounded-2xl p-6 border-2 border-[#2B3E4E]/30 min-w-[140px] shadow-md hover:scale-105 transition-transform">
              <span className="text-xs text-[#2B3E4E] font-semibold mb-1 flex items-center gap-1">
                <svg
                  className="w-5 h-5 text-[#FFB71B]"
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
              <span className="font-bold text-[#2B3E4E] text-right text-2xl tracking-widest">
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
        <div className="w-full flex flex-col items-center justify-center md:px-0">
          <div className=" w-full px-4 md:px-10 py-8">
            {/* Navigation Tabs */}
            <CounselorTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={["Scores Breakdown", "Career Options", "Program Options"]}
            />
            {/* Tab Content */}
            {activeTab === 0 && (
              <>
                <h3 className="font-semibold text-[#2B3E4E] mb-6 text-xl flex items-center gap-2">
                  Scores Breakdown
                </h3>
                
                {/* GSA Bar Chart */}
                <motion.div
                  className="w-full bg-gradient-to-br from-[#F8F9FA] to-[#FFB71B]/10 rounded-2xl shadow-xl p-6 border-2 border-[#FFB71B]/10 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h4 className="font-bold text-[#2B3E4E] text-lg mb-4 text-center">
                    General Scholastic Aptitude
                  </h4>
                  <div className="flex flex-col lg:flex-row gap-6 items-center">
                    <div className="w-full lg:w-1/2 h-80">
                      <Bar
                        data={getGsaBarData(result)}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } },
                        }}
                      />
                    </div>
                    
                    {/* Performance Indicators */}
                    <div className="w-full lg:w-1/2 space-y-2">
                      <h5 className="text-sm font-semibold text-[#2B3E4E] mb-3 text-center">School Comparison Analysis:</h5>
                      <div className="space-y-2">
                        {getGSAInsights(result, allStudentsData).map((insight, index) => (
                          <div key={index} className="flex flex-col p-3 rounded-lg bg-white/60 hover:bg-white/80 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="text-xs text-left font-medium text-[#2B3E4E] mb-1">{insight.name}</div>
                                <div className="text-xs text-left text-gray-600">{insight.description}</div>
                              </div>
                              <div className="text-right ml-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">
                                  {insight.performance.percentile}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {insight.score}/100
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-600">
                                School Avg: {insight.schoolAverage}/100
                              </div>
                              <div className={`text-xs font-bold px-2 py-1 rounded-m ${insight.performance.bgColor} ${insight.performance.color}`}>
                                {insight.performance.level}
                              </div>
                            </div>
                            <div className="text-xs text-right text-gray-500 text-center mt-2 italic">
                              {insight.performance.description}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-xs text-gray-500 italic">
                          Performance compared to grade-level peers
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* RIASEC Radar Chart */}
                <motion.div
                  className="w-full bg-gradient-to-br from-[#F8F9FA] to-[#2B3E4E]/10 rounded-2xl shadow-xl p-6 border-2 border-[#2B3E4E]/10 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h4 className="font-bold text-[#2B3E4E] text-lg mb-4 text-center">
                    RIASEC Profile
                  </h4>
                  <div className="flex flex-col lg:flex-row gap-6 items-center">
                    <div className="w-full lg:w-1/2 h-80 flex items-center justify-center">
                      <div className="w-full h-full max-w-sm">
                        <Radar
                          data={getRiasecRadarData(result)}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            layout: { padding: 20 },
                            scales: {
                              r: {
                                min: 0,
                                max: getRiasecRadarData(result).maxValue,
                                pointLabels: { font: { size: 14, weight: "bold" } },
                                grid: { color: "#E5E7EB" },
                                angleLines: { color: "#D1D5DB" },
                                ticks: { display: false }
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Top 3 Personality Types */}
                    <div className="w-full lg:w-1/2 space-y-2">
                      <h5 className="text-sm font-semibold text-[#2B3E4E] mb-3 text-center">Student's Top Personality Types:</h5>
                      <div className="space-y-2">
                        {getRIASECInsights(result).map((insight, index) => (
                          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-white/70 border border-[#2B3E4E]/20 hover:bg-white/90 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <div className="text-sm font-bold text-[#FFB71B] mr-2">#{index + 1}</div>
                                <div className="text-sm text-left font-semibold text-[#2B3E4E]">{insight.name}</div>
                              </div>
                              <div className="text-xs text-left text-gray-600 ml-6">{insight.description}</div>
                            </div>
                            <div className="text-right ml-3">
                              <div className="text-lg font-bold text-[#FFB71B]">
                                {insight.score/40*100}%
                              </div>
                              <div className="text-xs text-gray-500">
                                Strength
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 p-2 bg-[#2B3E4E]/10 rounded-lg border border-[#2B3E4E]/20">
                        <p className="text-xs text-[#2B3E4E] text-center">
                          These personality traits help identify suitable career environments and work styles.
                        </p>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                
                {/* Track Scores Bar Chart - styled like AcademicTab */}
                <motion.div
                  className="w-full bg-white rounded-3xl shadow-xl p-6 border-2 border-[#2B3E4E]/10 mt-8 animate-card-pop"
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
                              "#2B3E4E",
                              "#FFB71B",
                              "#2B3E4E",
                              "#FFB71B",
                              "#2B3E4E",
                              "#FFB71B",
                            ],
                            borderRadius: 12,
                            barPercentage: 0.6,
                            categoryPercentage: 0.7,
                            borderWidth: 2,
                            borderColor: [
                              "#2B3E4E",
                              "#FFB71B",
                              "#2B3E4E",
                              "#FFB71B",
                              "#2B3E4E",
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
                              color: "#2B3E4E",
                              font: { weight: "bold" },
                            },
                            ticks: { color: "#232D35" },
                            grid: { color: "#F8F9FA" },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "All Tracks",
                              color: "#2B3E4E",
                              font: { weight: "bold" },
                            },
                            ticks: { color: "#232D35" },
                            grid: { color: "#F8F9FA" },
                          },
                        },
                      }}
                    />
                  </div>
                  
                  {/* Track Performance Analysis */}
                  <div className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                    <h5 className="text-sm font-semibold text-[#2B3E4E] mb-3 text-center">Relative Track Performance Analysis:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(() => {
                        const baseTrackData = getTrackInsights(result).allTracks;
                        const relativeTrackData = getRelativeTrackPerformance(baseTrackData);
                        return relativeTrackData.map((track, index) => (
                          <div key={index} className="flex flex-col p-3 rounded-lg bg-white/80 hover:bg-white transition-colors">
                            <div className="text-left flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-[#2B3E4E] mb-1">{track.name}</div>
                                <div className="text-xs text-gray-600">{track.fullName}</div>
                              </div>
                              <div className="text-right ml-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">
                                  #{track.relativePerformance.rank} of 6
                                </div>
                                <div className="text-xs text-gray-500">
                                  {typeof track.score === 'number'
                                    ? (Number.isInteger(track.score) ? track.score : track.score.toFixed(2))
                                    : track.score}/100
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className={`text-xs font-bold px-3 py-2 rounded-m text-center ${track.relativePerformance.bgColor} ${track.relativePerformance.color}`}>
                                {track.relativePerformance.level}
                              </div>
                              <div className="text-xs text-gray-600 text-center mt-2">
                                {track.relativePerformance.description}
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-600 italic">
                        Performance shown relative to your other track scores • Identifies your academic strengths and growth areas
                      </p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
            {activeTab === 1 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/80 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-left font-bold text-[#FFB71B] text-2xl">Career Options</h3>
                    <p className="text-gray-600 text-sm">Career paths that match your strengths and interests</p>
                  </div>
                </div>
                {careerRecsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB71B] mx-auto mb-4"></div>
                      <div className="text-gray-500">Loading your career options...</div>
                    </div>
                  </div>
                ) : careerRecsError ? (
                  <div className="text-center py-12 text-red-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="font-medium">{careerRecsError}</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    {careerRecs.length > 0 ? (
                      careerRecs.map((rec, idx) => (
                        <div
                          key={idx}
                          className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#FFB71B]/50 hover:-translate-y-1"
                        >
                          {/* Header with Icon and Title */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#FFB71B] to-[#FFB71B]/80 rounded-xl flex items-center justify-center shadow-lg">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                              </svg>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <h4 className="font-bold text-[#2B3E4E] text-lg mb-1 group-hover:text-[#FFB71B] transition-colors">
                                {rec.careerTitle || rec.name || "Career Match"}
                              </h4>
                              {rec.pathName && (
                                <div className="text-sm text-gray-500 font-medium">
                                  Pathway: {rec.pathName}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Career Description */}
                          <div className="mb-4">
                            <p className="text-left text-gray-700 text-sm leading-relaxed">
                              {rec.summary || rec.description || rec.matchExplanation || "A career path that matches your profile."}
                            </p>
                          </div>

                          {/* Additional Info */}
                          <div className="space-y-3">
                            {rec.careerPath?.jobTrend && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-5 h-5 bg-[#FFB71B]/20 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-[#FFB71B]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="text-gray-600">Job Outlook: <span className="font-semibold text-[#FFB71B]">{rec.careerPath.jobTrend}</span></span>
                              </div>
                            )}

                            {rec.careerPath?.requiredSkills && (
                              <div className="flex items-start gap-2 text-sm">
                                <div className="w-5 h-5 bg-[#2B3E4E]/20 rounded-full flex items-center justify-center mt-0.5">
                                  <svg className="w-3 h-3 text-[#2B3E4E]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-gray-600">Key Skills: </span>
                                  <span className="font-semibold text-[#2B3E4E]">{rec.careerPath.requiredSkills}</span>
                                </div>
                              </div>
                            )}

                            {rec.careerPath?.educationLevel && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-5 h-5 bg-[#FFB71B]/20 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-[#FFB71B]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                  </svg>
                                </div>
                                <span className="text-gray-600">Education: <span className="font-semibold text-[#FFB71B]">{rec.careerPath.educationLevel}</span></span>
                              </div>
                            )}
                          </div>

                          {/* Match Score */}
                          {rec.matchPercentage && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Match Score</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/80 rounded-full transition-all duration-1000"
                                      style={{ width: `${rec.matchPercentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="font-bold text-[#FFB71B] text-sm">{rec.matchPercentage.toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-medium text-gray-600 mb-2">No Career Options Available</h4>
                        <p className="text-gray-500 text-sm">Complete your assessment to discover career paths that match your profile.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {activeTab === 2 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#2B3E4E] to-[#2B3E4E]/80 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-left font-bold text-[#2B3E4E] text-2xl">Program Options</h3>
                    <p className="text-gray-600 text-sm">Academic programs that align with your career goals</p>
                  </div>
                </div>
                {programRecsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3E4E] mx-auto mb-4"></div>
                      <div className="text-gray-500">Loading your program options...</div>
                    </div>
                  </div>
                ) : programRecsError ? (
                  <div className="text-center py-12 text-red-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="font-medium">{programRecsError}</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    {programRecs.length > 0 ? (
                      programRecs.map((rec, idx) => (
                        <div
                          key={idx}
                          className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#2B3E4E]/50 hover:-translate-y-1"
                        >
                          {/* Header with Icon and Title */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#2B3E4E] to-[#2B3E4E]/80 rounded-xl flex items-center justify-center shadow-lg">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <h4 className="font-bold text-[#2B3E4E] text-lg mb-1 group-hover:text-[#FFB71B] transition-colors">
                                {rec.programName || "Program Match"}
                              </h4>
                              {rec.pathName && (
                                <div className="text-sm text-gray-500 font-medium">
                                  Pathway: {rec.pathName}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Program Description */}
                          <div className="text-left mb-4">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {rec.summary || rec.description || rec.matchExplanation || "An academic program that matches your profile."}
                            </p>
                          </div>

                          {/* Related Career */}
                          {rec.careerPath?.careerTitle && (
                            <div className="mb-4 p-3 bg-[#FFB71B]/10 border border-[#FFB71B]/30 rounded-xl">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-5 h-5 bg-[#FFB71B]/20 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-[#FFB71B]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="text-gray-600">Related Career: <span className="font-semibold text-[#FFB71B]">{rec.careerPath.careerTitle}</span></span>
                              </div>
                            </div>
                          )}

                          {/* Additional Info */}
                          <div className="space-y-3 mb-4">
                            {rec.program?.duration && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-5 h-5 bg-[#2B3E4E]/20 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-[#2B3E4E]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="text-gray-600">Duration: <span className="font-semibold text-[#2B3E4E]">{rec.program.duration}</span></span>
                              </div>
                            )}

                            {rec.program?.field && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-5 h-5 bg-[#FFB71B]/20 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-[#FFB71B]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                  </svg>
                                </div>
                                <span className="text-gray-600">Field: <span className="font-semibold text-[#FFB71B]">{rec.program.field}</span></span>
                              </div>
                            )}

                            {rec.program?.degreeType && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-5 h-5 bg-[#2B3E4E]/20 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-[#2B3E4E]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="text-gray-600">Degree: <span className="font-semibold text-[#2B3E4E]">{rec.program.degreeType}</span></span>
                              </div>
                            )}
                          </div>

                          {/* Match Score */}
                          {rec.matchPercentage && (
                            <div className="pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Match Score</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-[#FFB71B] to-[#FFB71B]/80 rounded-full transition-all duration-1000"
                                      style={{ width: `${rec.matchPercentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="font-bold text-[#FFB71B] text-sm">{rec.matchPercentage.toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-medium text-gray-600 mb-2">No Program Options Available</h4>
                        <p className="text-gray-500 text-sm">Complete your assessment to discover academic programs that match your goals.</p>
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
