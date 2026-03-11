import React from 'react';

const SearchBar = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-4xl mx-auto -mt-10 relative z-10 border-t-4 border-irctcOrange">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        {/* From Station */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">FROM</label>
          <input type="text" placeholder="Enter Station" className="w-full border-b-2 border-gray-300 p-2 focus:border-irctcBlue outline-none" defaultValue="NEW DELHI - NDLS" />
        </div>

        {/* To Station */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">TO</label>
          <input type="text" placeholder="Enter Station" className="w-full border-b-2 border-gray-300 p-2 focus:border-irctcBlue outline-none" defaultValue="CHENNAI - MAS" />
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">DATE</label>
          <input type="date" className="w-full border-b-2 border-gray-300 p-2 outline-none" defaultValue="2026-03-20" />
        </div>

        {/* Search Button */}
        <button className="bg-irctcBlue text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all">
          SEARCH
        </button>
      </div>

      {/* The Special Quota Selection */}
      <div className="mt-6 flex flex-wrap gap-4 border-t pt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-irctcBlue" />
          <span className="text-sm text-gray-700">Ladies</span>
        </label>
        
        {/* This is your unique feature! */}
        <label className="flex items-center gap-2 cursor-pointer bg-purple-100 px-3 py-1 rounded-full border border-studentPurple">
          <input type="checkbox" className="w-4 h-4 accent-studentPurple" defaultChecked />
          <span className="text-sm font-bold text-studentPurple">Student Quota</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-irctcBlue" />
          <span className="text-sm text-gray-700">Divyaang</span>
        </label>
      </div>
    </div>
  );
};

export default SearchBar;
