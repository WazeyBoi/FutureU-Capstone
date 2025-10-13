import React from "react";

const getInitials = (user) => {
  if (!user) return "?";
  const first = user.firstName ? user.firstName[0] : "";
  const last = user.lastName ? user.lastName[0] : "";
  return (first + last).toUpperCase() || "?";
};

const AssessmentResultsGrid = ({ results, onViewReport, page = 1, pageSize = 16, totalResults = 0, onPageChange, onPageSizeChange }) => {
  // Pagination controls
  const totalPages = Math.ceil(totalResults / pageSize);
  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center py-12">
        <img src="/src/assets/characters/lazy.svg" alt="No results" className="w-50 mb-4 animate-fade-in" />
        <div className="text-gray-500 text-center text-lg font-semibold">No Users found.<br/>No User Assessments Found!</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-6 animate-fade-in">
        {results.map((result, idx) => {
            const user = result.userAssessment?.user || {};
            const assessment = result.userAssessment?.assessment || {};
            return (
              <div
                key={result.userAssessment?.userQuizAssessment || idx}
                className="relative flex flex-col items-stretch w-full max-w-xs min-w-[260px] bg-gradient-to-br from-[#FFB71B]/5 to-[#2B3E4E]/5 rounded-2xl shadow-lg p-0 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 group animate-pop-in overflow-hidden"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Header: Avatar and Name */}
                <div className="flex flex-col items-center pt-6 pb-3 px-6 bg-[#2B3E4E] border-b border-[#FFB71B]/20">
                  <div className="w-16 h-16 rounded-full bg-[#FFB71B] flex items-center justify-center text-text-[#2B3E4E] text-3xl font-extrabold shadow mb-2 animate-bounce-in">
                    {getInitials(user)}
                  </div>
                  <h3 className="font-bold text-xl text-white mb-0.5 text-center tracking-tight">{user.firstName} {user.lastName}</h3>
                  <div className="flex items-center gap-1 text-xs text-white mb-1">
                    <svg className="w-4 h-4 text-[#FFB71B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12A4 4 0 1 1 8 12a4 4 0 0 1 8 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v2m0 4h.01"/></svg>
                    {user.email}
                  </div>
                </div>
                {/* Details */}
                <div className="flex-1 flex flex-col justify-between px-6 py-4 gap-2 items-start text-left">
                  {/* Assessment Title & Date */}
                  <div className="flex flex-wrap gap-2 mb-1 justify-start w-full">
                    <span className="px-3 py-1 rounded-full bg-[#2B3E4E]/10 text-[#2B3E4E] text-sm font-semibold shadow-sm border border-[#2B3E4E]/30 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#FFB71B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 0 1 8 0v2"/><circle cx="12" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 21v-2a4 4 0 0 1 8 0v2"/></svg>
                      {assessment.title}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#FFB71B]/10 text-[#2B3E4E] text-sm font-semibold shadow-sm border border-[#FFB71B]/30 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#FFB71B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>
                      {result.userAssessment?.dateCompleted?.split('T')[0]}
                    </span>
                  </div>
                  {/* Scores */}
                  <div className="flex flex-col gap-2 mb-1 w-full">
                    {/* Time Spent Row */}
                    {typeof result.userAssessment?.timeSpentSeconds === 'number' && (
                      <div className="flex items-center w-full justify-between">
                        <span className="px-3 py-1 rounded-full bg-[#FFB71B]/10 text-[#2B3E4E] text-sm font-semibold shadow-sm border border-[#FFB71B]/30 flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#FFB71B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>
                          Time Spent:
                        </span>
                        <span className="text-lg font-extrabold align-middle text-[#2B3E4E]">{Math.round(result.userAssessment.timeSpentSeconds / 60)} min</span>
                      </div>
                    )}
                    {/* Overall Row */}
                    <div className="flex items-center w-full justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#FFB71B]/20 text-[#2B3E4E] text-sm font-bold shadow-sm border border-[#FFB71B]/40 flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#FFB71B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 12V4"/></svg>
                        Overall:
                      </span>
                      <span className="text-lg font-extrabold align-middle text-[#2B3E4E]">{typeof result.overallScore === 'number' ? result.overallScore.toFixed(2) : result.overallScore}</span>
                    </div>
                    {/* RIASEC Row */}
                    {(() => {
                      const scores = [
                        { code: 'R', value: result.realisticScore },
                        { code: 'I', value: result.investigativeScore },
                        { code: 'A', value: result.artisticScore },
                        { code: 'S', value: result.socialScore },
                        { code: 'E', value: result.enterprisingScore },
                        { code: 'C', value: result.conventionalScore },
                      ];
                      const top3 = scores
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 3)
                        .map(s => s.code)
                        .join('');
                      return (
                        <div className="flex items-center w-full justify-between">
                          <span className="px-3 py-1 rounded-full bg-[#2B3E4E]/10 text-[#2B3E4E] text-sm font-semibold shadow-sm border border-[#2B3E4E]/30 flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#FFB71B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 15h8M8 11h8M8 7h8"/></svg>
                            RIASEC:
                          </span>
                          <span className="font-bold text-[#2B3E4E] flex items-center gap-1">
                            {top3}
                            <span className="text-xs text-gray-500 ml-1">(
                              {result.realisticScore}/{result.investigativeScore}/{result.artisticScore}/{result.socialScore}/{result.enterprisingScore}/{result.conventionalScore}
                            )</span>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                {/* Action Button */}
                <div className="px-6 pb-5 pt-2 flex justify-center">
                  <button
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] hover:from-[#2B3E4E] hover:to-[#2B3E4E] text-white font-bold hover:bg-[#FFB71B] transition-colors shadow group-hover:scale-105 group-hover:shadow-xl text-sm tracking-wide"
                    onClick={() => onViewReport(result)}
                  >
                    View Summary
                  </button>
                </div>
              </div>
            );
          })}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
          <div className="text-sm text-[#2B3E4E] font-semibold">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalResults)} of {totalResults} results
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded bg-[#2B3E4E]/10 text-[#2B3E4E] font-semibold disabled:opacity-50 hover:bg-[#FFB71B] hover:text-white transition-colors border border-[#2B3E4E]/20"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
            >
              First
            </button>
            <button
              className="px-3 py-1 rounded bg-[#2B3E4E]/10 text-[#2B3E4E] font-semibold disabled:opacity-50 hover:bg-[#FFB71B] hover:text-white transition-colors border border-[#2B3E4E]/20"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="mx-2 font-bold text-[#2B3E4E]">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded bg-[#2B3E4E]/10 text-[#2B3E4E] font-semibold disabled:opacity-50 hover:bg-[#FFB71B] hover:text-white transition-colors border border-[#2B3E4E]/20"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
            <button
              className="px-3 py-1 rounded bg-[#2B3E4E]/10 text-[#2B3E4E] font-semibold disabled:opacity-50 hover:bg-[#FFB71B] hover:text-white transition-colors border border-[#2B3E4E]/20"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
            >
              Last
            </button>
            <select
              className="ml-4 px-2 py-1 rounded border-2 border-[#2B3E4E]/30 text-[#2B3E4E] font-semibold focus:border-[#FFB71B] focus:outline-none"
              value={pageSize}
              onChange={onPageSizeChange}
            >
              {[8, 16, 32, 64].map(size => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
};

export default AssessmentResultsGrid;
