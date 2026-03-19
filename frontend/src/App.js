import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import SearchBar from './components/SearchBar';

// --- HELPER: INDIAN PRICE FORMATTING ---
const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0, 
  }).format(amount);
};

function App() {
  const [trains, setTrains] = useState([
    { id: 1, trainName: "Rajdhani Express", trainNumber: "12430", from: "New Delhi", to: "Mumbai Central", baseFare: 2150 },
    { id: 2, trainName: "Shatabdi Express", trainNumber: "12002", from: "New Delhi", to: "Bhopal Jn", baseFare: 1450 },
    { id: 3, trainName: "Vande Bharat", trainNumber: "22436", from: "New Delhi", to: "Varanasi", baseFare: 1750 },
    { id: 4, trainName: "Duronto Express", trainNumber: "12260", from: "Sealdah", to: "New Delhi", baseFare: 1900 },
    { id: 5, trainName: "Gatimaan Express", trainNumber: "12050", from: "Hazrat Nizamuddin", to: "Agra Cantt", baseFare: 850 },
    { id: 6, trainName: "Chennai Mail", trainNumber: "12624", from: "Chennai Central", to: "Mumbai Central", baseFare: 1280 },
    { id: 7, trainName: "TamilNadu Exp", trainNumber: "12622", from: "New Delhi", to: "Chennai Central", baseFare: 1600 },
    { id: 8, trainName: "Deccan Queen", trainNumber: "12124", from: "Pune Jn", to: "Mumbai CSMT", baseFare: 550 },
    { id: 9, trainName: "Coromandel Exp", trainNumber: "12841", from: "Howrah", to: "Chennai Central", baseFare: 1400 },
    { id: 10, trainName: "Grand Trunk Exp", trainNumber: "12616", from: "New Delhi", to: "Chennai Central", baseFare: 1850 }
  ]);

  const [filteredTrains, setFilteredTrains] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedQuota, setSelectedQuota] = useState("General");
  const [darkMode, setDarkMode] = useState(true);
  
  // Auth & Profile States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "", mobile: "", password: "" });
  const [pastBookings, setPastBookings] = useState([]);
  const [authForm, setAuthForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [showHistory, setShowHistory] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Persistence Logic
  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    const savedHistory = localStorage.getItem('saved_history');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUserData(parsedUser);
      setIsLoggedIn(true);
      setPassenger(prev => ({ ...prev, email: parsedUser.email, mobile: parsedUser.mobile, name: parsedUser.name }));
    }
    if (savedHistory) setPastBookings(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('saved_history', JSON.stringify(pastBookings));
  }, [pastBookings]);

  // --- PROFILE FUNCTIONS ---
  const handleProfileUpdate = () => {
    localStorage.setItem('user_session', JSON.stringify(userData));
    alert("Profile Updated Successfully!");
    setShowProfile(false);
  };

  const deleteAccount = () => {
    if(window.confirm("Are you sure you want to delete your account? This will clear all history.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const [showStudentVerify, setShowStudentVerify] = useState(false);
  const [tempStudentEmail, setTempStudentEmail] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [pnrData, setPnrData] = useState(null);
  const [passenger, setPassenger] = useState({ name: "", age: "", berth: "No Preference", mobile: "", email: "" });

  const handleSearch = (searchData) => {
    setHasSearched(true);
    const filtered = trains.filter(t => 
      t.from.toLowerCase().includes(searchData.from.toLowerCase()) && 
      t.to.toLowerCase().includes(searchData.to.toLowerCase())
    );
    setFilteredTrains(filtered);
  };

  const handleClassSelection = (train, className) => {
    if (!isLoggedIn) { setShowLogin(true); return; }
    setSelectedTrain(train);
    setSelectedClass(className);
    if (selectedQuota === "Student") {
      const email = userData?.email?.toLowerCase() || "";
      if (!email.includes('.edu') && !email.includes('.ac.in')) {
        setShowStudentVerify(true);
        return;
      }
    }
    setShowBooking(true);
  };

  const verifyStudentEmail = () => {
    const lowerEmail = tempStudentEmail.toLowerCase();
    if (lowerEmail.includes('.edu') || lowerEmail.includes('.ac.in')) {
      setShowStudentVerify(false);
      setShowBooking(true);
    } else {
      alert("Invalid Institutional Email.");
    }
  };

  const handleAuth = () => {
    if (!authForm.email || !authForm.password) { alert("Enter credentials"); return; }
    const user = { ...authForm, name: authForm.name || "User" };
    localStorage.setItem('user_session', JSON.stringify(user));
    setUserData(user);
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    setIsLoggedIn(false);
    setUserData({ name: "", email: "", mobile: "", password: "" });
    setShowHistory(false);
    setShowProfile(false);
  };

  const calculateFare = (base, className) => {
    const classMultipliers = { "SL": 1, "3A": 2.2, "2A": 3.5, "1A": 5 };
    let qm = 1;
    if (selectedQuota === "Student") qm = 0.5; 
    if (selectedQuota === "Tatkal") qm = 1.3;
    return Math.round(base * classMultipliers[className] * qm);
  };

  const finalizeBooking = () => {
    if (!passenger.name) { alert("Enter Name"); return; }
    const coachPrefix = { "SL": "S", "3A": "B", "2A": "A", "1A": "H" };
    const finalCalculatedFare = calculateFare(selectedTrain.baseFare, selectedClass);
    
    const newTicket = {
      pnr: Math.floor(1000000000 + Math.random() * 9000000000),
      train: selectedTrain.trainName,
      trainNo: selectedTrain.trainNumber,
      from: selectedTrain.from,
      to: selectedTrain.to,
      class: selectedClass,
      quota: selectedQuota,
      coach: `${coachPrefix[selectedClass]}${Math.floor(Math.random() * 10) + 1}`,
      seat: Math.floor(Math.random() * 72) + 1,
      berth: passenger.berth.toUpperCase(),
      baseFare: finalCalculatedFare,
      tax: 17.70,
      totalFare: finalCalculatedFare + 17.70,
      date: new Date().toLocaleDateString('en-GB'),
      passengerName: passenger.name.toUpperCase(),
      passengerAge: passenger.age,
      paymentMode: "Digital Payment"
    };
    setPnrData(newTicket);
    setPastBookings([newTicket, ...pastBookings]);
    setBookingSuccess(true);
    setShowBooking(false);
  };

  const viewOldTicket = (ticket) => {
    setPnrData(ticket);
    setBookingSuccess(true);
    setShowHistory(false);
  };

  return (
    <div className={`${darkMode ? 'bg-slate-900 text-white' : 'bg-[#f0f2f5] text-gray-900'} min-h-screen transition-colors duration-300`}>
      <Header className="no-print" />
      
      {/* Top Nav */}
      <div className="px-10 py-3 flex justify-between items-center border-b border-white/10 no-print">
        <button onClick={() => setDarkMode(!darkMode)} className="text-[10px] font-bold opacity-50 uppercase">{darkMode ? "☀️ LIGHT" : "🌙 DARK"}</button>
        {!isLoggedIn ? (
          <button onClick={() => setShowLogin(true)} className="bg-irctcBlue text-white px-6 py-1.5 rounded font-bold text-xs uppercase">Login / Sign Up</button>
        ) : (
          <div className="flex items-center gap-6">
            <button onClick={() => setShowHistory(true)} className="text-[10px] font-black text-irctcOrange uppercase hover:opacity-80">History</button>
            <button onClick={() => setShowProfile(true)} className="text-[10px] font-black text-irctcBlue uppercase hover:opacity-80">Profile</button>
            <span className="text-xs font-bold text-green-500 uppercase">● {userData?.name}</span>
            <button onClick={handleLogout} className="text-[10px] opacity-40 uppercase font-bold">LOGOUT</button>
          </div>
        )}
      </div>

      {/* --- PROFILE MODAL (FIXED) --- */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[800] flex items-center justify-center p-6 no-print">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white text-black'} w-full max-w-md rounded-3xl p-8 shadow-2xl border-t-[10px] border-irctcBlue`}>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-black uppercase italic">User Settings</h2>
               <button onClick={() => setShowProfile(false)} className="text-xs font-bold opacity-50">CLOSE</button>
            </div>
            <div className="space-y-4">
               <div><label className="text-[9px] font-black opacity-40 uppercase block mb-1">Full Name</label><input className="w-full bg-black/5 border-b-2 p-2 outline-none font-bold" value={userData?.name} onChange={e => setUserData({...userData, name: e.target.value})} /></div>
               <div><label className="text-[9px] font-black opacity-40 uppercase block mb-1">Email</label><input className="w-full bg-black/5 border-b-2 p-2 outline-none font-bold" value={userData?.email} onChange={e => setUserData({...userData, email: e.target.value})} /></div>
               <div><label className="text-[9px] font-black opacity-40 uppercase block mb-1">New Password</label><input type="password" placeholder="••••••" className="w-full bg-black/5 border-b-2 p-2 outline-none font-bold" value={userData?.password} onChange={e => setUserData({...userData, password: e.target.value})} /></div>
               <button onClick={handleProfileUpdate} className="w-full bg-irctcBlue text-white py-4 rounded-xl font-black uppercase text-xs mt-4">Save Changes</button>
               <button onClick={deleteAccount} className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest mt-2 border border-red-500/20">Delete Account Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOOKING HISTORY MODAL (FIXED) --- */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[700] flex items-center justify-center p-6 no-print">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white text-black'} w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]`}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20 text-white">
              <h2 className="text-xl font-black uppercase italic">My Transactions</h2>
              <button onClick={() => setShowHistory(false)} className="text-xs font-bold opacity-50">Close ✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {pastBookings.length === 0 ? <p className="text-center py-10 opacity-30 font-bold uppercase tracking-widest text-xs">No Bookings Found</p> : 
                pastBookings.map((b, idx) => (
                <div key={idx} onClick={() => viewOldTicket(b)} className="p-5 border border-white/10 rounded-2xl flex justify-between items-center cursor-pointer hover:border-irctcOrange bg-black/5 group">
                  <div><p className="text-[10px] font-black text-irctcBlue uppercase">{b.train}</p><p className="font-bold uppercase">{b.from} → {b.to}</p></div>
                  <div className="text-right"><p className="text-xl font-black text-green-500">{formatPrice(b.totalFare)}</p><span className="text-[8px] font-bold bg-irctcBlue/10 px-2 py-1 rounded">RE-PRINT E-TICKET</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- DASHBOARD & SEARCH --- */}
      {!showBooking && !bookingSuccess && (
        <main className="max-w-6xl mx-auto px-4 mt-10 no-print pb-20">
          <div className="relative w-full h-64 rounded-3xl overflow-hidden mb-10 shadow-2xl bg-slate-800">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/45/IRCTC_Logo.svg/1280px-IRCTC_Logo.svg.png" className="w-auto h-[150%] scale-150" alt="bg" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10">
                <h1 className="text-6xl font-black italic tracking-tighter text-white drop-shadow-2xl">INDIAN RAILWAYS</h1>
                <p className="text-irctcOrange font-bold tracking-[0.4em] uppercase text-sm mt-2">Safety | Security | Punctuality</p>
            </div>
          </div>
          <SearchBar onSearch={handleSearch} />
          {hasSearched && (
            <div className="mt-8 space-y-4">
                <div className="flex justify-center gap-2 mb-4">
                  {["General", "Ladies", "Student", "Tatkal", "Divyangjan"].map(q => (
                    <button key={q} onClick={() => setSelectedQuota(q)} className={`px-4 py-2 rounded text-[10px] font-black border ${selectedQuota === q ? 'bg-irctcOrange border-irctcOrange text-white' : 'border-slate-700 opacity-60'}`}>{q.toUpperCase()}</button>
                  ))}
                </div>
                {filteredTrains.map((train) => (
                  <div key={train.id} className={`${darkMode ? 'bg-slate-800' : 'bg-white'} border rounded-lg overflow-hidden`}>
                    <div className="p-4 flex justify-between bg-black/5 font-bold uppercase text-xs">{train.trainName} ({train.trainNumber}) <span className="opacity-50">{train.from} → {train.to}</span></div>
                    <div className="p-4 grid grid-cols-4 gap-2">
                      {["SL", "3A", "2A", "1A"].map(c => (
                        <div key={c} onClick={() => handleClassSelection(train, c)} className="p-3 border rounded cursor-pointer hover:border-irctcOrange transition-all text-center">
                          <p className="text-[10px] font-bold opacity-50 mb-1">{c}</p>
                          <p className="text-lg font-black">{formatPrice(calculateFare(train.baseFare, c))}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </main>
      )}

      {/* --- BOOKING SCREEN (FIXED BERTH SELECTION) --- */}
      {showBooking && (
        <div className={`fixed inset-0 ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#f8f9fa] text-slate-900'} z-[400] flex flex-col no-print`}>
          <div className="p-4 border-b border-white/10 bg-black/10 flex justify-between items-center text-xs font-black uppercase">
            <button onClick={() => setShowBooking(false)} className="text-irctcBlue tracking-widest">← Back</button>
            <span>{selectedTrain?.trainName} ({selectedClass})</span>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="w-[70%] overflow-y-auto p-12 space-y-12">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase">Passenger Info</h2>
               <div className="grid grid-cols-2 gap-8 max-w-2xl">
                 <div><label className="text-[9px] font-black opacity-40 uppercase block mb-2">Name</label><input className="w-full bg-transparent border-b-2 border-white/10 p-2 text-xl font-bold uppercase focus:border-irctcBlue outline-none" value={passenger.name} onChange={e => setPassenger({...passenger, name: e.target.value})} /></div>
                 <div><label className="text-[9px] font-black opacity-40 uppercase block mb-2">Age</label><input className="w-full bg-transparent border-b-2 border-white/10 p-2 text-xl font-bold focus:border-irctcBlue outline-none" type="number" value={passenger.age} onChange={e => setPassenger({...passenger, age: e.target.value})} /></div>
               </div>
               <div>
                  <p className="text-[10px] font-black opacity-40 uppercase mb-4">Select Berth</p>
                  <div className="flex flex-wrap gap-2">
                    {["No Preference", "Lower", "Middle", "Upper", "Side Lower"].map(b => (
                      <button key={b} onClick={() => setPassenger({...passenger, berth: b})} className={`px-6 py-3 rounded-xl text-[10px] font-black border ${passenger.berth === b ? 'bg-irctcBlue border-irctcBlue text-white shadow-xl' : 'border-white/10 opacity-40'}`}>{b.toUpperCase()}</button>
                    ))}
                  </div>
               </div>
            </div>
            <div className={`w-[30%] ${darkMode ? 'bg-black/40' : 'bg-white'} p-10 flex flex-col justify-between border-l border-white/10`}>
              <div className="space-y-4">
                <h3 className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-6">Fare Summary</h3>
                <div className="flex justify-between text-sm opacity-60"><span>Base Fare</span><span>{formatPrice(calculateFare(selectedTrain?.baseFare, selectedClass))}</span></div>
                <div className="flex justify-between text-sm opacity-60"><span>Booking Fees</span><span>₹17.70</span></div>
                <div className="h-[1px] bg-white/10 my-4"></div>
                <div className="flex flex-col"><span className="text-[9px] opacity-40 uppercase font-black">Total Amount</span><span className="text-6xl font-black tracking-tighter">{formatPrice(calculateFare(selectedTrain?.baseFare, selectedClass) + 17.70)}</span></div>
              </div>
              <button onClick={finalizeBooking} className="w-full bg-irctcOrange text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-orange-500/30 uppercase tracking-widest">Pay & Book</button>
            </div>
          </div>
        </div>
      )}

      {/* --- FINAL ERS TICKET (ALL DETAILS FIXED) --- */}
      {bookingSuccess && pnrData && (
        <div className="fixed inset-0 bg-black/95 z-[900] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-black w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border-[10px] border-white my-10">
            <div className="p-6 bg-slate-100 border-b-2 border-dashed border-gray-300 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/45/IRCTC_Logo.svg/1280px-IRCTC_Logo.svg.png" className="w-14" alt="logo" />
                <div><h1 className="text-2xl font-black italic text-irctcBlue">E - ticket</h1><p className="text-[9px] font-black opacity-40">INDIAN RAILWAYS - IRCTC</p></div>
              </div>
              <div className="text-right"><p className="text-[10px] font-black text-gray-400 uppercase">PNR Number</p><p className="text-3xl font-black tracking-widest">{pnrData.pnr}</p></div>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div><p className="text-[9px] font-black text-irctcBlue uppercase">Train</p><p className="text-lg font-black">{pnrData.train} ({pnrData.trainNo})</p><p className="text-xs opacity-50 uppercase font-bold">{pnrData.class} | {pnrData.quota}</p></div>
                <div className="text-right"><p className="text-[9px] font-black text-irctcBlue uppercase">Journey Info</p><p className="text-sm font-black uppercase">{pnrData.from} → {pnrData.to}</p><p className="text-xs font-bold opacity-50 italic">Date: {pnrData.date}</p></div>
              </div>
              <div>
                <table className="w-full text-left">
                  <thead><tr className="border-b text-[10px] font-black text-gray-400 uppercase"><th className="py-2">Name</th><th>Age</th><th>Coach/Seat</th><th className="text-right">Status</th></tr></thead>
                  <tbody className="text-sm font-bold">
                    <tr><td className="py-4 uppercase">{pnrData.passengerName}</td><td>{pnrData.passengerAge}</td><td>{pnrData.coach} / {pnrData.seat} ({pnrData.berth})</td><td className="text-right text-green-600">CONFIRMED</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-3xl flex justify-between items-center"><p className="text-xs opacity-50 uppercase font-bold">Total Paid</p><h2 className="text-3xl font-black text-green-400">{formatPrice(pnrData.totalFare)}</h2></div>
            </div>
            <div className="p-4 flex gap-2 no-print bg-gray-50 border-t">
              <button onClick={() => window.print()} className="flex-1 bg-irctcBlue text-white py-4 font-black rounded-xl uppercase text-xs">Print e-Ticket</button>
              <button onClick={() => {setBookingSuccess(false); setPnrData(null);}} className="flex-1 bg-black text-white py-4 font-black rounded-xl uppercase text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS (Student & Auth) --- */}
      {showStudentVerify && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white text-black p-8 rounded-2xl max-w-sm w-full border-t-[12px] border-slate-800">
             <h2 className="text-2xl font-black mb-1 uppercase tracking-tighter text-center">Verification</h2>
             <input className="w-full border-b-2 p-2 outline-none mb-6 font-bold text-center" placeholder="College Email (.edu / .ac.in)" onChange={e => setTempStudentEmail(e.target.value)} />
             <button onClick={verifyStudentEmail} className="w-full bg-slate-800 text-white py-4 font-black rounded-xl uppercase text-xs">Verify & Book</button>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 bg-black/90 z-[500] flex items-center justify-center p-6 no-print">
          <div className="bg-white text-black p-8 rounded-2xl max-w-sm w-full border-t-[12px] border-irctcBlue shadow-2xl">
             <h2 className="text-3xl font-black mb-6 italic italic uppercase">Login</h2>
             <div className="space-y-4">
                <input className="w-full border-b-2 p-2 outline-none font-bold" placeholder="Email" onChange={e => setAuthForm({...authForm, email: e.target.value})} />
                <input className="w-full border-b-2 p-2 outline-none font-bold" type="password" placeholder="Password" onChange={e => setAuthForm({...authForm, password: e.target.value})} />
             </div>
             <button onClick={handleAuth} className="w-full bg-irctcBlue text-white py-4 font-bold mt-10 rounded-xl uppercase text-xs">Sign In</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;