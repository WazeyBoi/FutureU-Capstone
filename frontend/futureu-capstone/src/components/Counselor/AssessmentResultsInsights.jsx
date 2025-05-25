import React from "react";

const AssessmentResultsInsights = ({ results }) => {
  if (!results || results.length === 0) return null;

  // List of score fields to average
  const scoreFields = [
    { key: "overallScore", label: "Overall" },
    { key: "gsaScore", label: "GSA" },
    { key: "scientificAbilityScore", label: "Scientific" },
    { key: "readingComprehensionScore", label: "Reading" },
    { key: "verbalAbilityScore", label: "Verbal" },
    { key: "mathematicalAbilityScore", label: "Math" },
    { key: "logicalReasoningScore", label: "Logic" },
    { key: "academicTrackScore", label: "Academic" },
    { key: "stemScore", label: "STEM" },
    { key: "abmScore", label: "ABM" },
    { key: "humssScore", label: "HUMSS" },
    { key: "otherTrackScore", label: "Other Track" },
    { key: "tvlScore", label: "TVL" },
    { key: "sportsTrackScore", label: "Sports" },
    { key: "artsDesignTrackScore", label: "Arts & Design" },
    { key: "interestAreaScore", label: "Interest" },
    { key: "realisticScore", label: "R" },
    { key: "investigativeScore", label: "I" },
    { key: "artisticScore", label: "A" },
    { key: "socialScore", label: "S" },
    { key: "enterprisingScore", label: "E" },
    { key: "conventionalScore", label: "C" },
  ];

  // Calculate averages
  const averages = {};
  scoreFields.forEach(({ key }) => {
    const sum = results.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
    averages[key] = (sum / results.length).toFixed(1);
  });

  // Color palette for badges
  const badgeColors = [
    "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
    "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
    "bg-gradient-to-br from-pink-400 to-pink-600 text-white",
    "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white",
    "bg-gradient-to-br from-purple-400 to-purple-600 text-white",
    "bg-gradient-to-br from-orange-400 to-orange-600 text-white",
    "bg-gradient-to-br from-teal-400 to-teal-600 text-white",
    "bg-gradient-to-br from-red-400 to-red-600 text-white",
    "bg-gradient-to-br from-green-400 to-green-600 text-white",
    "bg-gradient-to-br from-indigo-400 to-indigo-600 text-white",
    "bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 text-white",
    "bg-gradient-to-br from-cyan-400 to-cyan-600 text-white",
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {scoreFields.map(({ key, label }, idx) => (
        <span
          key={key}
          className={`px-4 py-2 rounded-full font-bold shadow text-sm animate-pulse ${badgeColors[idx % badgeColors.length]}`}
        >
          {label}: {averages[key]}
        </span>
      ))}
    </div>
  );
};

export default AssessmentResultsInsights;
