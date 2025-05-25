import React from "react";

const AssessmentResultsGrid = ({ results, onViewReport }) => {
  if (!results || results.length === 0) {
    return <div className="text-gray-500 text-center py-8">No assessment results found.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {results.map((result, idx) => {
        const user = result.userAssessment?.user || {};
        const assessment = result.userAssessment?.assessment || {};
        return (
          <div
            key={result.userAssessment?.userQuizAssessment || idx}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 flex flex-col hover:shadow-xl transition-all duration-300 relative overflow-hidden"
          >
            {/* Accent shape */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-[#FFB71B]/60 to-[#1D63A1]/60 rounded-full blur-2xl opacity-30 z-0"></div>
            <div className="z-10 relative">
              <h3 className="font-bold text-lg text-[#2B3E4E] mb-1">{user.firstName} {user.lastName}</h3>
              <p className="text-sm text-gray-500 mb-2">{user.email}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">{assessment.title}</span>
                <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">{result.userAssessment?.dateCompleted?.split('T')[0]}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold">Overall: {result.overallScore}</span>
                <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">RIASEC: {result.realisticScore}/{result.investigativeScore}/{result.artisticScore}/{result.socialScore}/{result.enterprisingScore}/{result.conventionalScore}</span>
              </div>
              <button
                className="mt-2 px-4 py-2 rounded-lg bg-[#1D63A1] text-white font-bold hover:bg-[#FFB71B] hover:text-[#2B3E4E] transition-colors"
                onClick={() => onViewReport(result)}
              >
                View Report
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssessmentResultsGrid;
