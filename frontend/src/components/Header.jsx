import React from 'react';

const Header = () => {
  return (
    <nav className="bg-irctcBlue p-4 flex justify-between items-center text-white shadow-lg">
      <div className="flex items-center gap-4">
        {/* This is where the IRCTC Logo would go */}
        <div className="bg-white text-irctcBlue font-bold p-2 rounded">IRCTC</div>
        <h1 className="text-xl font-bold italic">Student Quota Portal</h1>
      </div>
      
      <div className="flex gap-6 text-sm font-medium">
        <button className="hover:text-irctcOrange">LOGIN</button>
        <button className="hover:text-irctcOrange">REGISTER</button>
        <button className="bg-irctcOrange px-4 py-1 rounded font-bold">HELP</button>
      </div>
    </nav>
  );
};

export default Header;