import React, { useState } from "react";

const getInitials = (user) => {
  if (!user) return "?";
  const first = user.firstName ? user.firstName[0] : "";
  const last = user.lastName ? user.lastName[0] : "";
  return (first + last).toUpperCase() || "?";
};

const AssessmentResultsGrid = ({ results, onViewReport, page = 1, pageSize = 16, totalResults = 0, onPageChange, onPageSizeChange }) => {
  const [groupByUser, setGroupByUser] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState({});

  // Pagination controls
  const totalPages = Math.ceil(totalResults / pageSize);
  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center py-12">
        <img src="/src/assets/characters/lazy.svg" alt="No results" className="w-50 mb-4 opacity-80 animate-fade-in" />
        <div className="text-gray-500 text-center text-lg font-semibold">No assessment results found.<br/>Try adjusting your search or filters!</div>
      </div>
    );
  }

  // Group results by user if enabled
  let grouped = {};
  if (groupByUser) {
    results.forEach((result) => {
      const user = result.userAssessment?.user;
      if (!user) return;
      const key = user.userId || user.email || user.firstName + user.lastName;
      if (!grouped[key]) grouped[key] = { user, attempts: [] };
      grouped[key].attempts.push(result);
    });
  }

  // Toggle expand/collapse for a user
  const toggleExpand = (userKey) => {
    setExpandedUsers((prev) => ({ ...prev, [userKey]: !prev[userKey] }));
  };

  return (
    <>
      {/* Grouping toggle */}
      <div className="my-8 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={groupByUser}
            onChange={() => setGroupByUser((v) => !v)}
            className="accent-[#1D63A1]"
          />
          Group by student
        </label>
      </div>
      {groupByUser ? (
        <div className="flex flex-col gap-6 animate-fade-in">
          {Object.entries(grouped).map(([userKey, { user, attempts }]) => {
            // Sort attempts by date descending
            const sorted = [...attempts].sort((a, b) => new Date(b.userAssessment?.dateCompleted) - new Date(a.userAssessment?.dateCompleted));
            const mostRecent = sorted[0];
            return (
              <div key={userKey} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(userKey)}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1D63A1] to-[#FFB71B] flex items-center justify-center text-white text-xl font-bold shadow">
                    {getInitials(user)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-[#2B3E4E]">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <div className="text-xs text-[#1D63A1] font-semibold">{sorted.length} attempt{sorted.length > 1 ? 's' : ''}</div>
                  <button className="ml-2 text-xs px-2 py-1 rounded bg-[#FFB71B]/20 text-[#1D63A1] font-bold">
                    {expandedUsers[userKey] ? 'Hide' : 'Show'}
                  </button>
                </div>
                {/* Attempts list */}
                {expandedUsers[userKey] && (
                  <div className="mt-4 flex flex-wrap gap-4">
                    {sorted.map((result, idx) => {
                      const assessment = result.userAssessment?.assessment || {};
                      const isMostRecent = idx === 0;
                      return (
                        <div
                          key={result.userAssessment?.userQuizAssessment || idx}
                          className={`bg-white rounded-lg border border-gray-200 p-4 flex flex-col items-center w-64 relative ${isMostRecent ? 'ring-2 ring-[#FFB71B]' : ''}`}
                        >
                          <div className="text-xs font-bold text-[#1D63A1] mb-1">{assessment.title}</div>
                          <div className="text-xs text-gray-500 mb-1">{result.userAssessment?.dateCompleted?.split('T')[0]}</div>
                          <div className="flex flex-wrap gap-1 mb-2 justify-center">
                            <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold animate-badge">Overall: {result.overallScore}</span>
                            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold animate-badge">RIASEC: {result.realisticScore}/{result.investigativeScore}/{result.artisticScore}/{result.socialScore}/{result.enterprisingScore}/{result.conventionalScore}</span>
                          </div>
                          <button
                            className="mt-2 px-3 py-1 rounded-lg bg-[#1D63A1] text-white text-xs font-bold hover:bg-[#FFB71B] hover:text-[#2B3E4E] transition-colors shadow"
                            onClick={() => onViewReport(result)}
                          >
                            View Report
                          </button>
                          {isMostRecent && <div className="absolute top-2 right-2 text-[10px] bg-[#FFB71B] text-[#2B3E4E] px-2 py-0.5 rounded font-bold">Most Recent</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 animate-fade-in">
          {results.map((result, idx) => {
            const user = result.userAssessment?.user || {};
            const assessment = result.userAssessment?.assessment || {};
            return (
              <div
                key={result.userAssessment?.userQuizAssessment || idx}
                className="relative flex flex-col items-stretch w-full max-w-xs min-w-[260px] bg-gradient-to-br from-[#f8fafc] to-[#e8f1fa] rounded-2xl shadow-lg p-0 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 group animate-pop-in overflow-hidden"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Header: Avatar and Name */}
                <div className="flex flex-col items-center pt-6 pb-3 px-6 bg-gradient-to-r from-[#FFB71B]/10 to-[#1D63A1]/5 border-b border-[#FFB71B]/20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1D63A1] to-[#FFB71B] flex items-center justify-center text-white text-3xl font-extrabold shadow mb-2 animate-bounce-in">
                    {getInitials(user)}
                  </div>
                  <h3 className="font-bold text-xl text-[#1D63A1] mb-0.5 text-center tracking-tight">{user.firstName} {user.lastName}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <svg className="w-4 h-4 text-[#FFB71B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12A4 4 0 1 1 8 12a4 4 0 0 1 8 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v2m0 4h.01"/></svg>
                    {user.email}
                  </div>
                </div>
                {/* Details */}
                <div className="flex-1 flex flex-col justify-between px-6 py-4 gap-2 items-start text-left">
                  {/* Assessment Title & Date */}
                  <div className="flex flex-wrap gap-2 mb-1 justify-start w-full">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold shadow-sm border border-blue-200 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 0 1 8 0v2"/><circle cx="12" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 21v-2a4 4 0 0 1 8 0v2"/></svg>
                      {assessment.title}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold shadow-sm border border-green-200 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>
                      {result.userAssessment?.dateCompleted?.split('T')[0]}
                    </span>
                  </div>
                  {/* Scores */}
                  <div className="flex flex-col gap-2 mb-1 w-full">
                    {/* Time Spent Row */}
                    {typeof result.userAssessment?.timeSpentSeconds === 'number' && (
                      <div className="flex items-center w-full justify-between">
                        <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-semibold shadow-sm border border-purple-200 flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>
                          Time Spent:
                        </span>
                        <span className="text-lg font-extrabold align-middle text-purple-700">{Math.round(result.userAssessment.timeSpentSeconds / 60)} min</span>
                      </div>
                    )}
                    {/* Overall Row */}
                    <div className="flex items-center w-full justify-between">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold shadow-sm border border-emerald-200 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 12V4"/></svg>
                        Overall:
                      </span>
                      <span className="text-lg font-extrabold align-middle text-emerald-700">{typeof result.overallScore === 'number' ? result.overallScore.toFixed(2) : result.overallScore}</span>
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
                          <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-sm font-semibold shadow-sm border border-yellow-200 flex items-center gap-2">
                            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 15h8M8 11h8M8 7h8"/></svg>
                            RIASEC:
                          </span>
                          <span className="font-bold text-yellow-700 flex items-center gap-1">
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
      )}
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalResults)} of {totalResults} results
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
            >
              First
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="mx-2 font-bold">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
            >
              Last
            </button>
            <select
              className="ml-4 px-2 py-1 rounded border border-gray-300"
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
