import React from 'react';
import { Search } from "lucide-react";

const CareerSearchBar = ({ searchTerm, setSearchTerm, filteredCareersLength }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white rounded-lg shadow p-4">
            <div className="relative w-full md:w-2/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm"
                    placeholder="Search career title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center justify-between w-full md:w-1/3">
                <span className="text-gray-500 text-sm font-medium">
                    Found: <span className="text-yellow-600 font-bold">{filteredCareersLength}</span> careers
                </span>
            </div>
        </div>
    );
};

export default CareerSearchBar;