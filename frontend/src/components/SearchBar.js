import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  // REMOVED: suggestions state (was unused)
  const [showFromSuggest, setShowFromSuggest] = useState(false);
  const [showToSuggest, setShowToSuggest] = useState(false);
  const [allStations, setAllStations] = useState([]);

  // Fetch unique stations from your backend
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/trains');
        const stations = new Set();
        res.data.forEach(train => {
          stations.add(train.from.toUpperCase());
          stations.add(train.to.toUpperCase());
        });
        setAllStations(Array.from(stations));
      } catch (e) { console.error("Error fetching stations", e); }
    };
    fetchStations();
  }, []);

  const getFilteredStations = (input) => {
    if (!input) return [];
    return allStations.filter(s => s.toLowerCase().includes(input.toLowerCase())).slice(0, 5);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-4xl mx-auto -mt-10 relative z-[100] border-t-4 border-irctcOrange">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        {/* FROM Station with Suggestions */}
        <div className="relative">
          <label className="block text-xs font-bold text-gray-500 mb-1">FROM</label>
          <input 
            type="text" 
            placeholder="Enter Station" 
            className="w-full border-b-2 border-gray-300 p-2 focus:border-irctcBlue outline-none text-black font-semibold" 
            value={from}
            onChange={(e) => { setFrom(e.target.value); setShowFromSuggest(true); }}
            onFocus={() => setShowFromSuggest(true)}
          />
          {showFromSuggest && from && (
            <div className="absolute left-0 right-0 bg-white shadow-2xl rounded-b-lg mt-1 border border-gray-100 overflow-hidden z-[110]">
              {getFilteredStations(from).map(s => (
                <div key={s} 
                  onMouseDown={() => { // Use onMouseDown to trigger before onBlur
                    setFrom(s); 
                    setShowFromSuggest(false); 
                  }}
                  className="p-3 hover:bg-blue-50 cursor-pointer text-sm font-bold text-gray-700 border-b last:border-0">
                  🚆 {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TO Station with Suggestions */}
        <div className="relative">
          <label className="block text-xs font-bold text-gray-500 mb-1">TO</label>
          <input 
            type="text" 
            placeholder="Enter Station" 
            className="w-full border-b-2 border-gray-300 p-2 focus:border-irctcBlue outline-none text-black font-semibold" 
            value={to}
            onChange={(e) => { setTo(e.target.value); setShowToSuggest(true); }}
            onFocus={() => setShowToSuggest(true)}
          />
          {showToSuggest && to && (
            <div className="absolute left-0 right-0 bg-white shadow-2xl rounded-b-lg mt-1 border border-gray-100 overflow-hidden z-[110]">
              {getFilteredStations(to).map(s => (
                <div key={s} 
                  onMouseDown={() => { 
                    setTo(s); 
                    setShowToSuggest(false); 
                  }}
                  className="p-3 hover:bg-blue-50 cursor-pointer text-sm font-bold text-gray-700 border-b last:border-0">
                  📍 {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">DATE</label>
          <input type="date" className="w-full border-b-2 border-gray-300 p-2 outline-none text-black font-semibold" defaultValue="2026-03-20" />
        </div>

        {/* Search Button */}
        <button 
          onClick={() => {
            setShowFromSuggest(false);
            setShowToSuggest(false);
            onSearch({ from, to });
          }} 
          className="bg-irctcBlue text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all uppercase tracking-widest"
        >
          SEARCH
        </button>

      </div>
    </div>
  );
};

export default SearchBar;