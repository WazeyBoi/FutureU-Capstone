import React, { useState } from "react";

const AssessmentResultsInsights = ({ results }) => {
  const [activeTab, setActiveTab] = useState("gsa");

  if (!results || results.length === 0) return null;

  // Grouped fields
  const gsaFields = [
    { key: "gsaScore", label: "General Scholastic Aptitude" },
    { key: "scientificAbilityScore", label: "Scientific Ability" },
    { key: "readingComprehensionScore", label: "Reading Comprehension" },
    { key: "verbalAbilityScore", label: "Verbal Ability" },
    { key: "mathematicalAbilityScore", label: "Mathematical Ability" },
    { key: "logicalReasoningScore", label: "Logical Reasoning Ability" },
  ];
  const academicTrackFields = [
    { key: "stemScore", label: "STEM" },
    { key: "humssScore", label: "HUMSS" },
    { key: "abmScore", label: "ABM" },
  ];
  const nonAcademicTrackFields = [
    { key: "sportsTrackScore", label: "Sports Track" },
    { key: "artsDesignTrackScore", label: "Arts & Design Track" },
    { key: "tvlScore", label: "TVL" },
  ];
  const riasecFields = [
    { key: "realisticScore", label: "Realistic (R)" },
    { key: "investigativeScore", label: "Investigative (I)" },
    { key: "artisticScore", label: "Artistic (A)" },
    { key: "socialScore", label: "Social (S)" },
    { key: "enterprisingScore", label: "Enterprising (E)" },
    { key: "conventionalScore", label: "Conventional (C)" },
  ];
  const otherFields = [
    { key: "overallScore", label: "Overall" },
    { key: "academicTrackScore", label: "Academic Track" },
    { key: "otherTrackScore", label: "Other Track" },
    { key: "interestAreaScore", label: "Interest Area" },
  ];

  // Calculate averages
  const averages = {};
  [
    ...gsaFields,
    ...academicTrackFields,
    ...nonAcademicTrackFields,
    ...riasecFields,
    ...otherFields,
  ].forEach(({ key }) => {
    const sum = results.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
    averages[key] = Number((sum / results.length).toFixed(1));
  });

  const tabSections = [
    { key: "gsa", label: "GSA", fields: gsaFields },
    { key: "academic", label: "Academic Track", fields: academicTrackFields },
    { key: "nonAcademic", label: "Non-Academic Track", fields: nonAcademicTrackFields },
    { key: "riasec", label: "RIASEC", fields: riasecFields },
    { key: "other", label: "Other", fields: otherFields },
  ];

  // Helper: Generate detailed summary/insight for each tab
  const getTabSummary = (tabKey) => {
    switch (tabKey) {
      case "gsa": {
        const scores = gsaFields.map(f => ({ label: f.label, value: averages[f.key] }));
        const best = scores.reduce((a, b) => (a.value > b.value ? a : b));
        const worst = scores.reduce((a, b) => (a.value < b.value ? a : b));
        return (
          <>
            <p>
              The General Scholastic Aptitude (GSA) results provide a comprehensive overview of students' core academic strengths and areas for growth. On average, students excel most in <b>{best.label}</b> with a mean score of <b>{best.value}</b>, indicating a strong foundation in this area. This suggests that instructional strategies and learning environments are effectively supporting students' abilities here. Conversely, the lowest average is observed in <b>{worst.label}</b> (<b>{worst.value}</b>), highlighting a potential area where additional resources, targeted interventions, or curriculum adjustments may be beneficial.
            </p>
            <p>
              These insights can help guidance counselors and educators tailor support programs and enrichment activities. By focusing on both the highest and lowest performing domains, schools can celebrate academic strengths while also proactively addressing learning gaps, ensuring a balanced and holistic approach to student development.
            </p>
          </>
        );
      }
      case "academic": {
        const scores = academicTrackFields.map(f => ({ label: f.label, value: averages[f.key] }));
        const best = scores.reduce((a, b) => (a.value > b.value ? a : b));
        const min = scores.reduce((a, b) => (a.value < b.value ? a : b));
        return (
          <>
            <p>
              Academic Track preferences reveal that most students gravitate toward the <b>{best.label}</b> track, with an average score of <b>{best.value}</b>. This trend may reflect current interests, perceived career opportunities, or the effectiveness of related school programs. The <b>{min.label}</b> track, with a lower average of <b>{min.value}</b>, may benefit from increased awareness or enhanced program offerings to attract more student interest.
            </p>
            <p>
              Understanding these patterns allows counselors to provide more personalized academic guidance and to collaborate with faculty in strengthening underrepresented tracks. Encouraging exploration and providing resources for all tracks can help students make more informed decisions about their educational and career pathways.
            </p>
          </>
        );
      }
      case "nonAcademic": {
        const scores = nonAcademicTrackFields.map(f => ({ label: f.label, value: averages[f.key] }));
        const best = scores.reduce((a, b) => (a.value > b.value ? a : b));
        const min = scores.reduce((a, b) => (a.value < b.value ? a : b));
        return (
          <>
            <p>
              Non-Academic Track results show that students are most interested in <b>{best.label}</b> (<b>{best.value}</b>), suggesting a vibrant culture or strong extracurricular offerings in this area. The lower average in <b>{min.label}</b> (<b>{min.value}</b>) may indicate either less exposure or fewer opportunities for engagement, which could be addressed through new clubs, workshops, or awareness campaigns.
            </p>
            <p>
              These insights empower counselors to advocate for a diverse range of non-academic programs, ensuring that all students have the chance to discover and develop their unique talents and interests beyond the classroom. A well-rounded student experience supports both personal growth and future success.
            </p>
          </>
        );
      }
      case "riasec": {
        const mostCommon = getMostCommonRiasec();
        return (
          <>
            <p>
              The RIASEC personality assessment shows that most students are <b>{mostCommon.label}</b> (average agreed items: <b>{mostCommon.avg}</b>). This suggests a dominant interest in this area, which can inform career guidance and enrichment activities.
            </p>
            <p>
              Counselors can use this information to align programs and opportunities with students' natural preferences, while also encouraging exploration of less common types for a well-rounded perspective.
            </p>
          </>
        );
      }
      case "other": {
        return (
          <>
            <p>
              The overall average score across all assessments is <b>{averages.overallScore}</b>, providing a snapshot of general student performance. Academic Track and Other Track scores are <b>{averages.academicTrackScore}</b> and <b>{averages.otherTrackScore}</b> respectively, reflecting the balance between academic and alternative pathways.
            </p>
            <p>
              These metrics help counselors and administrators monitor trends over time, identify shifts in student interests, and ensure that both academic and non-academic opportunities are equitably supported. Regular review of these insights can inform strategic planning and resource allocation for continuous improvement.
            </p>
          </>
        );
      }
      default:
        return "";
    }
  };

  // Helper: Get most common RIASEC type (by max average agreed items)
  const getMostCommonRiasec = () => {
    const riasecAverages = riasecFields.map(f => ({
      key: f.key,
      label: f.label,
      avg: averages[f.key]
    }));
    // Find the RIASEC type with the highest average agreed items
    return riasecAverages.reduce((a, b) => (a.avg > b.avg ? a : b));
  };

  // Helper: Get sorted fields by average (descending)
  const getSortedFields = (fields) => {
    return [...fields].sort((a, b) => averages[b.key] - averages[a.key]);
  };

  // Helper: Get Top 3 and Bottom 3 (no overlap, special case for 3 fields)
  const getTopBottomFields = (fields) => {
    const sorted = getSortedFields(fields);
    if (fields.length === 3) {
      return { top: [sorted[0]], bottom: [sorted[1], sorted[2]] };
    }
    if (fields.length < 3) {
      return { top: sorted, bottom: [] };
    }
    // Avoid overlap
    return {
      top: sorted.slice(0, 3),
      bottom: sorted.slice(-3).filter(f => !sorted.slice(0, 3).includes(f)).reverse(),
    };
  };

  // Color for rank: green for top, red for bottom, default blue
  const getRankColor = (idx, total, section = "main") => {
    if (section === "top") {
      if (idx === 0) return 'border-green-500';
      if (idx === 1) return 'border-green-400';
      if (idx === 2) return 'border-green-300';
    }
    if (section === "bottom") {
      if (idx === 0) return 'border-red-500';
      if (idx === 1) return 'border-red-400';
      if (idx === 2) return 'border-red-300';
    }
    // Main list coloring
    if (idx === 0) return 'border-green-500';
    if (idx === 1) return 'border-green-400';
    if (idx === 2) return 'border-green-300';
    if (idx === total - 1) return 'border-red-500';
    if (idx === total - 2) return 'border-red-400';
    if (idx === total - 3) return 'border-red-300';
    return 'border-blue-200';
  };

  return (
    <div className="mb-10">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-blue-100">
        {tabSections.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors duration-200 focus:outline-none ${activeTab === tab.key ? "bg-blue-100 text-blue-800 border-b-2 border-blue-500" : "text-gray-500 hover:text-blue-700"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content as Table + Summary Side by Side */}
      <div className="flex flex-col md:flex-row gap-4 items-start w-full">
        <div className="flex-1 overflow-x-auto">
          <table className="text-left min-w-[320px] w-full border-collapse rounded-xl shadow bg-white overflow-hidden">
            <thead>
              <tr className="bg-blue-50 text-blue-900 text-xs">
                <th className="pl-15 px-3 py-2 text-left font-semibold">Rank</th>
                <th className="px-3 py-2 text-left font-semibold">Assessment Area</th>
                <th className="px-3 py-2 text-left font-semibold">Average Score</th>
              </tr>
            </thead>
            <tbody>
              {getSortedFields(tabSections.find((t) => t.key === activeTab).fields).map((f, idx, arr) => (
                <tr key={f.key} className={
                  idx === 0 ? "bg-green-50" :
                  idx === arr.length - 1 ? "bg-red-50" :
                  idx < 3 ? "bg-green-25" :
                  idx >= arr.length - 3 ? "bg-red-25" :
                  ""
                }>
                  <td className={`pl-15  py-2 border-l-4 ${getRankColor(idx, arr.length)} font-bold text-xs`}>{idx + 1}</td>
                  <td className="px-3 py-2 text-sm">{f.label}</td>
                  <td className="px-3 py-2 text-sm font-semibold">{averages[f.key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:w-2/5 w-full md:ml-4 mt-4 md:mt-0">
          <div className="text-xs text-blue-900 bg-blue-50 rounded px-3 py-2 font-medium shadow-sm text-left">
            {getTabSummary(activeTab)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResultsInsights;
