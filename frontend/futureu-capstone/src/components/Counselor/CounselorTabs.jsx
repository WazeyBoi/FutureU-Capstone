import React from "react";

const CounselorTabs = ({ activeTab, setActiveTab, tabs }) => (
  <div className="flex gap-4 mb-8">
    {tabs.map((tab, idx) => (
      <button
        key={tab}
        onClick={() => setActiveTab(idx)}
        className={`cursor-pointer px-5 py-2 rounded-lg font-semibold text-base transition-colors duration-150 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-[#FFB71B] animate-bounce-short ${
          activeTab === idx
            ? 'bg-gradient-to-r from-[#FFB71B] to-[#FFB71B] text-white border-[#FFB71B] shadow-md'
            : 'bg-white text-[#1D63A1] border-[#1D63A1]/40 hover:bg-[#FFB71B]/10 hover:text-[#232D35]'
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default CounselorTabs;
