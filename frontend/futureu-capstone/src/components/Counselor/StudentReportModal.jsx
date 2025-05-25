import React from "react";

const highlightScore = (score, max = 100) => {
  if (score >= 0.85 * max) return "text-green-600 font-bold";
  if (score >= 0.7 * max) return "text-yellow-600 font-semibold";
  if (score) return "text-red-500 font-semibold";
  return "text-gray-500";
};

const StudentReportModal = ({ open, onClose, result }) => {
  if (!open || !result) return null;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative animate-pop-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-[#FFB71B] text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1D63A1] to-[#FFB71B] flex items-center justify-center text-white text-2xl font-bold shadow">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1D63A1]">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-500">
              {assessment.title} |{" "}
              {result.userAssessment?.dateCompleted?.split("T")[0]}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold text-[#2B3E4E] mb-2">Scores</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <b>Overall:</b>{" "}
              <span className={highlightScore(result.overallScore)}>
                {result.overallScore}
              </span>
            </div>
            <div>
              <b>GSA:</b>{" "}
              <span className={highlightScore(result.gsaScore)}>
                {result.gsaScore}
              </span>
            </div>
            <div>
              <b>Scientific:</b>{" "}
              <span className={highlightScore(result.scientificAbilityScore)}>
                {result.scientificAbilityScore}
              </span>
            </div>
            <div>
              <b>Reading:</b>{" "}
              <span className={highlightScore(result.readingComprehensionScore)}>
                {result.readingComprehensionScore}
              </span>
            </div>
            <div>
              <b>Verbal:</b>{" "}
              <span className={highlightScore(result.verbalAbilityScore)}>
                {result.verbalAbilityScore}
              </span>
            </div>
            <div>
              <b>Math:</b>{" "}
              <span className={highlightScore(result.mathematicalAbilityScore)}>
                {result.mathematicalAbilityScore}
              </span>
            </div>
            <div>
              <b>Logic:</b>{" "}
              <span className={highlightScore(result.logicalReasoningScore)}>
                {result.logicalReasoningScore}
              </span>
            </div>
            <div>
              <b>Academic:</b>{" "}
              <span className={highlightScore(result.academicTrackScore)}>
                {result.academicTrackScore}
              </span>
            </div>
            <div>
              <b>STEM:</b>{" "}
              <span className={highlightScore(result.stemScore)}>
                {result.stemScore}
              </span>
            </div>
            <div>
              <b>ABM:</b>{" "}
              <span className={highlightScore(result.abmScore)}>
                {result.abmScore}
              </span>
            </div>
            <div>
              <b>HUMSS:</b>{" "}
              <span className={highlightScore(result.humssScore)}>
                {result.humssScore}
              </span>
            </div>
            <div>
              <b>Other Track:</b>{" "}
              <span className={highlightScore(result.otherTrackScore)}>
                {result.otherTrackScore}
              </span>
            </div>
            <div>
              <b>TVL:</b>{" "}
              <span className={highlightScore(result.tvlScore)}>
                {result.tvlScore}
              </span>
            </div>
            <div>
              <b>Sports:</b>{" "}
              <span className={highlightScore(result.sportsTrackScore)}>
                {result.sportsTrackScore}
              </span>
            </div>
            <div>
              <b>Arts & Design:</b>{" "}
              <span className={highlightScore(result.artsDesignTrackScore)}>
                {result.artsDesignTrackScore}
              </span>
            </div>
            <div>
              <b>Interest:</b>{" "}
              <span className={highlightScore(result.interestAreaScore)}>
                {result.interestAreaScore}
              </span>
            </div>
            <div className="col-span-2">
              <b>RIASEC:</b>{" "}
              <span className="font-semibold text-[#1D63A1]">
                {result.realisticScore}/
                {result.investigativeScore}/
                {result.artisticScore}/
                {result.socialScore}/
                {result.enterprisingScore}/
                {result.conventionalScore}
              </span>
            </div>
          </div>
        </div>
        {recommendations.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-[#FFB71B] mb-2">
              Recommendations
            </h3>
            <ul className="list-disc pl-6 text-sm text-[#2B3E4E]">
              {recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="text-right">
          <button
            className="px-4 py-2 rounded-lg bg-[#FFB71B] text-[#2B3E4E] font-bold hover:bg-[#1D63A1] hover:text-white transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentReportModal;
