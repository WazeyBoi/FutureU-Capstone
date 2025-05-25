import React from "react";

const StudentReportModal = ({ open, onClose, result }) => {
  if (!open || !result) return null;
  const user = result.userAssessment?.user || {};
  const assessment = result.userAssessment?.assessment || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-[#FFB71B] text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-[#1D63A1] mb-2">{user.firstName} {user.lastName}</h2>
        <p className="text-gray-500 mb-4">{assessment.title} | {result.userAssessment?.dateCompleted?.split('T')[0]}</p>
        <div className="mb-4">
          <h3 className="font-semibold text-[#2B3E4E] mb-2">Scores</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <li><b>Overall:</b> {result.overallScore}</li>
            <li><b>GSA:</b> {result.gsaScore}</li>
            <li><b>Scientific:</b> {result.scientificAbilityScore}</li>
            <li><b>Reading:</b> {result.readingComprehensionScore}</li>
            <li><b>Verbal:</b> {result.verbalAbilityScore}</li>
            <li><b>Math:</b> {result.mathematicalAbilityScore}</li>
            <li><b>Logic:</b> {result.logicalReasoningScore}</li>
            <li><b>Academic:</b> {result.academicTrackScore}</li>
            <li><b>STEM:</b> {result.stemScore}</li>
            <li><b>ABM:</b> {result.abmScore}</li>
            <li><b>HUMSS:</b> {result.humssScore}</li>
            <li><b>Other Track:</b> {result.otherTrackScore}</li>
            <li><b>TVL:</b> {result.tvlScore}</li>
            <li><b>Sports:</b> {result.sportsTrackScore}</li>
            <li><b>Arts & Design:</b> {result.artsDesignTrackScore}</li>
            <li><b>Interest:</b> {result.interestAreaScore}</li>
            <li><b>RIASEC:</b> {result.realisticScore}/{result.investigativeScore}/{result.artisticScore}/{result.socialScore}/{result.enterprisingScore}/{result.conventionalScore}</li>
          </ul>
        </div>
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
