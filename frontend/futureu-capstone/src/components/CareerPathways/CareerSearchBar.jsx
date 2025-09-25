import React from 'react';
import { Search } from "lucide-react";

const CareerSearchBar = ({ searchTerm, setSearchTerm, filteredCareersLength }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-colors"
                        placeholder="Search career title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center">
                    <span className="text-gray-600 text-sm font-medium">
                        Found: <span className="text-[#2B3E4E] font-bold">{filteredCareersLength}</span> careers
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CareerSearchBar;