import React from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar'; // 1. Add this import

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {/* Background Hero Section */}
      <div className="h-48 bg-irctcBlue w-full flex items-center justify-center">
        <h2 className="text-white text-2xl font-light">Book Ticket</h2>
      </div>

      <main className="px-4">
        <SearchBar /> {/* 2. Add the Search Bar here */}
        
        <div className="mt-12 text-center text-gray-500 italic">
          Select the "Student Quota" to see exclusive berth availability.
        </div>
      </main>
    </div>
  );
}

export default App;