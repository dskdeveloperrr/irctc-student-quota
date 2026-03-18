import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import SearchBar from './components/SearchBar';

function App() {
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedQuota, setSelectedQuota] = useState("General");
  const [darkMode, setDarkMode] = useState(true);
  
  // Auth & Profile States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // New Profile Modal State
  const [isSignUp, setIsSignUp] = useState(false);
  const [userData, setUserData] = useState(null);
  const [pastBookings, setPastBookings] = useState([]);
  const [authForm, setAuthForm] = useState({ name: "", email: "", mobile: "", age: "", password: "" });
  
  const [showHistory, setShowHistory] = useState(false);

  // Persistence Logic: Load User and History on Refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    const savedHistory = localStorage.getItem('saved_history');
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUserData(parsedUser);
      setIsLoggedIn(true);
      setPassenger(prev => ({ ...prev, email: parsedUser.email, mobile: parsedUser.mobile, name: parsedUser.name }));
    }
    
    if (savedHistory) {
      setPastBookings(JSON.parse(savedHistory));
    }
  }, []);

  // Save History to LocalStorage whenever it changes
  useEffect(() => {
    if (pastBookings.length > 0) {
      localStorage.setItem('saved_history', JSON.stringify(pastBookings));
    }
  }, [pastBookings]);

  // Handle Profile Update
  const handleProfileUpdate = () => {
    localStorage.setItem('user_session', JSON.stringify(userData));
    setPassenger(prev => ({ ...prev, email: userData.email, mobile: userData.mobile, name: userData.name }));
    alert("Profile Updated Successfully!");
    setShowProfile(false);
  };

  // Student Verification State
  const [showStudentVerify, setShowStudentVerify] = useState(false);
  const [tempStudentEmail, setTempStudentEmail] = useState("");

  // Booking States
  const [showBooking, setShowBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [pnrData, setPnrData] = useState(null);

  const [passenger, setPassenger] = useState({ 
    name: "", age: "", idCard: "", berth: "No Preference", mobile: "", email: "" 
  });

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/trains');
        setTrains(res.data);
      } catch (e) { console.error("API Error"); }
    };
    fetchTrains();
  }, []);

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
    if (selectedQuota === "Student") {
      const email = userData.email.toLowerCase();
      if (!email.endsWith('.edu') && !email.endsWith('.ac.in')) {
        setSelectedTrain(train);
        setSelectedClass(className);
        setShowStudentVerify(true);
        return;
      }
    }
    setSelectedTrain(train);
    setSelectedClass(className);
    setShowBooking(true);
  };

  const verifyStudentEmail = () => {
    if (tempStudentEmail.endsWith('.edu') || tempStudentEmail.endsWith('.ac.in')) {
      setShowStudentVerify(false);
      setShowBooking(true);
    } else {
      alert("Invalid Institutional Email. Please use a valid .edu or .ac.in address.");
    }
  };

  const handleAuth = () => {
    if (!authForm.email || !authForm.password) { alert("Enter credentials"); return; }
    const user = { ...authForm, name: authForm.name || "User" };
    localStorage.setItem('user_session', JSON.stringify(user));
    setIsLoggedIn(true);
    setUserData(user);
    setPassenger(prev => ({ ...prev, email: user.email, mobile: user.mobile, name: user.name }));
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    // localStorage.removeItem('saved_history'); // Uncomment if you want history to clear on logout
    setIsLoggedIn(false);
    setUserData(null);
    setHasSearched(false);
    setShowHistory(false);
    setShowProfile(false);
  };

  const calculateFare = (base, className) => {
    const classMultipliers = { "SL": 1, "3A": 2.2, "2A": 3.5, "1A": 5 };
    let qm = 1;
    if (selectedQuota === "Student") qm = 0.5; 
    if (selectedQuota === "Tatkal") qm = 1.3;
    if (selectedQuota === "Ladies") qm = 1.1;
    if (selectedQuota === "Divyangjan") qm = 0.25;
    return Math.round(base * classMultipliers[className] * qm);
  };

  const finalizeBooking = () => {
    if (!passenger.name) { alert("Enter Name"); return; }
    const coachPrefix = { "SL": "S", "3A": "B", "2A": "A", "1A": "H" };
    const coachNum = Math.floor(Math.random() * 10) + 1;
    const seatNum = Math.floor(Math.random() * 72) + 1;
    const finalCalculatedFare = calculateFare(selectedTrain.baseFare, selectedClass);

    const newTicket = {
      pnr: Math.floor(1000000000 + Math.random() * 9000000000),
      train: selectedTrain.trainName,
      trainNo: selectedTrain.trainNumber,
      from: selectedTrain.from,
      to: selectedTrain.to,
      class: selectedClass,
      quota: selectedQuota,
      coach: `${coachPrefix[selectedClass]}${coachNum}`,
      seat: seatNum,
      berth: passenger.berth === "No Preference" ? "LOWER" : passenger.berth.toUpperCase(),
      baseFare: finalCalculatedFare,
      tax: 17.70,
      totalFare: finalCalculatedFare + 17.70,
      date: new Date().toLocaleDateString(),
      passengerName: passenger.name.toUpperCase(),
      passengerAge: passenger.age,
      mobile: passenger.mobile,
      paymentMode: "UPI / Internet Banking"
    };

    setPnrData(newTicket);
    setPastBookings([newTicket, ...pastBookings]);
    setBookingSuccess(true);
    setShowBooking(false);
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
            <button onClick={() => setShowHistory(true)} className="text-[10px] font-black tracking-widest text-irctcOrange uppercase hover:opacity-80 transition-opacity">History</button>
            <button onClick={() => setShowProfile(true)} className="text-[10px] font-black tracking-widest text-irctcBlue uppercase hover:opacity-80 transition-opacity">Profile</button>
            <span className="text-xs font-bold text-green-500 uppercase tracking-tighter">● {userData?.name}</span>
            <button onClick={handleLogout} className="text-[10px] opacity-40 uppercase font-bold hover:opacity-100">LOGOUT</button>
          </div>
        )}
      </div>

      {/* --- PROFILE MODAL --- */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[800] flex items-center justify-center p-6 no-print">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white text-black'} w-full max-w-md rounded-3xl p-8 shadow-2xl border-t-[10px] border-irctcBlue`}>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-black uppercase italic">Edit Profile</h2>
               <button onClick={() => setShowProfile(false)} className="text-xs font-bold opacity-50">CLOSE</button>
            </div>
            <div className="space-y-4">
               <div>
                  <label className="text-[9px] font-black opacity-40 uppercase">Full Name</label>
                  <input className="w-full bg-transparent border-b-2 p-2 outline-none font-bold" value={userData?.name} onChange={e => setUserData({...userData, name: e.target.value})} />
               </div>
               <div>
                  <label className="text-[9px] font-black opacity-40 uppercase">Email</label>
                  <input className="w-full bg-transparent border-b-2 p-2 outline-none font-bold" value={userData?.email} onChange={e => setUserData({...userData, email: e.target.value})} />
               </div>
               <div>
                  <label className="text-[9px] font-black opacity-40 uppercase">Mobile</label>
                  <input className="w-full bg-transparent border-b-2 p-2 outline-none font-bold" value={userData?.mobile} onChange={e => setUserData({...userData, mobile: e.target.value})} />
               </div>
               <div>
                  <label className="text-[9px] font-black opacity-40 uppercase">Password</label>
                  <input type="password" className="w-full bg-transparent border-b-2 p-2 outline-none font-bold" value={userData?.password} onChange={e => setUserData({...userData, password: e.target.value})} />
               </div>
               <button onClick={handleProfileUpdate} className="w-full bg-irctcBlue text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs mt-6">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOOKING HISTORY MODAL --- */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[700] flex items-center justify-center p-6 no-print">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]`}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Transaction History</h2>
              <button onClick={() => setShowHistory(false)} className="text-xs font-bold opacity-50 uppercase hover:opacity-100">Close ✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-inherit">
              {pastBookings.length === 0 ? (
                <p className="text-center py-10 font-bold opacity-30 uppercase tracking-widest text-xs">No Recent Bookings Found</p>
              ) : (
                pastBookings.map((b, idx) => (
                  <div key={idx} className={`p-5 border ${darkMode ? 'border-white/5 bg-black/10' : 'border-gray-100 bg-gray-50'} rounded-2xl flex justify-between items-center group hover:border-irctcOrange transition-colors`}>
                    <div>
                      <p className="text-[10px] font-black text-irctcBlue uppercase mb-1">{b.train} ({b.trainNo})</p>
                      <p className="text-lg font-black uppercase leading-tight">{b.from} → {b.to}</p>
                      <p className="text-[10px] font-bold opacity-40 mt-1">{b.date} • {b.class} • {b.quota}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-green-500">₹{b.totalFare.toFixed(0)}</p>
                      <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">PNR: {b.pnr}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND MAIN CONTENT */}
      {!showBooking && !bookingSuccess && (
        <main className="max-w-6xl mx-auto px-4 mt-10 no-print pb-20">
          <SearchBar onSearch={handleSearch} />
          {hasSearched && (
            <div className="mt-6 space-y-4">
                <div className={`p-4 rounded-lg flex flex-wrap gap-2 justify-center items-center ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                    {["General", "Ladies", "Student", "Tatkal", "Divyangjan"].map(q => (
                    <button key={q} onClick={() => setSelectedQuota(q)} 
                        className={`px-4 py-2 rounded text-[10px] font-black transition-all border ${selectedQuota === q ? 'bg-irctcOrange border-irctcOrange text-white' : 'border-slate-700 opacity-60'}`}>
                        {q.toUpperCase()}
                    </button>
                    ))}
                </div>
                {filteredTrains.map((train) => (
                  <div key={train.id} className={`${darkMode ? 'bg-slate-800' : 'bg-white'} border rounded-lg overflow-hidden border-inherit shadow-sm`}>
                    <div className="p-4 flex justify-between items-center bg-black/5">
                      <h3 className="font-bold uppercase tracking-tight">{train.trainName} ({train.trainNumber})</h3>
                      <p className="text-xs opacity-50 font-bold">{train.from} → {train.to}</p>
                    </div>
                    <div className="p-4 grid grid-cols-4 gap-2">
                      {["SL", "3A", "2A", "1A"].map(c => (
                        <div key={c} onClick={() => handleClassSelection(train, c)}
                          className="p-3 border rounded cursor-pointer hover:border-irctcOrange transition-colors border-inherit">
                          <p className="text-[10px] font-bold opacity-50">{c}</p>
                          <p className="text-lg font-black">₹{calculateFare(train.baseFare, c)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </main>
      )}

      {/* --- 70/30 BOOKING SCREEN --- */}
      {showBooking && (
        <div className={`fixed inset-0 ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#f8f9fa] text-slate-900'} z-[400] flex flex-col no-print`}>
          <div className="p-4 border-b border-white/10 bg-black/10 flex justify-between items-center">
            <button onClick={() => setShowBooking(false)} className="text-irctcBlue font-bold text-xs uppercase tracking-widest">← Back</button>
            <div className="text-right"><h2 className="text-sm font-black uppercase">{selectedTrain?.trainName}</h2></div>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="w-[70%] overflow-y-auto p-12">
              <div className="max-w-3xl mx-auto space-y-12">
                <section>
                  <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Passenger Details</h2>
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-8">
                      <label className="text-[10px] font-black opacity-40 uppercase mb-2 block">Full Name</label>
                      <input className="w-full bg-transparent border-b-2 border-white/10 p-3 outline-none focus:border-irctcBlue text-xl font-bold uppercase" placeholder="NAME" value={passenger.name} onChange={e => setPassenger({...passenger, name: e.target.value})} />
                    </div>
                    <div className="col-span-4">
                      <label className="text-[10px] font-black opacity-40 uppercase mb-2 block">Age</label>
                      <input type="number" className="w-full bg-transparent border-b-2 border-white/10 p-3 outline-none focus:border-irctcBlue text-xl font-bold" placeholder="YY" value={passenger.age} onChange={e => setPassenger({...passenger, age: e.target.value})} />
                    </div>
                  </div>
                </section>
                <section>
                    <label className="text-[10px] font-black opacity-40 uppercase mb-4 block">Berth Preference</label>
                    <div className="flex flex-wrap gap-3">
                        {["No Preference", "Lower", "Middle", "Upper", "Side Lower", "Side Upper"].map(b => (
                        <button key={b} onClick={() => setPassenger({...passenger, berth: b})} className={`px-5 py-3 rounded-xl text-[10px] font-black border transition-all ${passenger.berth === b ? 'bg-irctcBlue border-irctcBlue text-white' : 'border-white/10 opacity-50'}`}>{b.toUpperCase()}</button>
                        ))}
                    </div>
                </section>
                <section className="bg-white/5 p-8 rounded-3xl border border-white/5">
                  <h3 className="text-xs font-black mb-6 uppercase text-irctcBlue">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div><label className="text-[10px] font-black opacity-40 uppercase mb-2 block">Mobile</label><input className="w-full bg-transparent border-b border-white/20 p-2 outline-none font-bold" value={passenger.mobile} onChange={e => setPassenger({...passenger, mobile: e.target.value})} /></div>
                    <div><label className="text-[10px] font-black opacity-40 uppercase mb-2 block">Email</label><input className="w-full bg-transparent border-b border-white/20 p-2 outline-none font-bold" value={passenger.email} onChange={e => setPassenger({...passenger, email: e.target.value})} /></div>
                  </div>
                </section>
              </div>
            </div>
            <div className={`w-[30%] ${darkMode ? 'bg-black/40' : 'bg-white shadow-2xl'} p-10 flex flex-col justify-between border-l border-white/10`}>
              <div>
                <h3 className="text-xs font-black opacity-40 mb-10 uppercase tracking-widest">Fare Summary</h3>
                <div className="space-y-4 text-inherit">
                  <div className="flex justify-between text-sm"><span className="opacity-60">Base Fare</span><span className="font-bold">₹{calculateFare(selectedTrain?.baseFare, selectedClass)}</span></div>
                  <div className="flex justify-between text-sm"><span className="opacity-60">Tax & Fees</span><span className="font-bold">₹17.70</span></div>
                  <div className="h-[1px] bg-white/10 my-4"></div>
                  <div className="flex flex-col"><span className="text-[10px] font-black opacity-40 uppercase mb-1">Total Payable</span><span className="text-6xl font-black tracking-tighter">₹{(calculateFare(selectedTrain?.baseFare, selectedClass) + 17.70).toFixed(0)}</span></div>
                </div>
              </div>
              <button onClick={finalizeBooking} className="w-full bg-irctcOrange text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-orange-500/30 uppercase tracking-widest">Confirm & Pay</button>
            </div>
          </div>
        </div>
      )}

      {/* --- FORMATTED FINAL TICKET MODAL --- */}
{/* --- FULL IRCTC ERS TICKET --- */}
{bookingSuccess && pnrData && (
  <div className="fixed inset-0 bg-black/95 z-[900] flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-white text-black w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl my-10 border-[10px] border-white">

      {/* 1️⃣ IRCTC HEADER */}
      <div className="p-6 bg-slate-100 border-b-2 border-dashed border-gray-300 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/4/45/IRCTC_Logo.svg/1280px-IRCTC_Logo.svg.png"
            className="w-14"
            alt="logo"
          />
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-irctcBlue">
              E - ticket
            </h1>
            <p className="text-[9px] font-bold text-gray-500 uppercase">
              IRCTC
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase">
            PNR Number
          </p>
          <p className="text-3xl font-black tracking-widest">
            {pnrData.pnr}
          </p>
        </div>
      </div>

      <div className="p-8 space-y-8">

        {/* 2️⃣ TRAIN DETAILS */}
        <section>
          <h3 className="text-[10px] font-black text-irctcBlue mb-3 uppercase tracking-widest border-l-4 border-irctcBlue pl-2">
            Train Details
          </h3>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-5 rounded-xl">
            <div>
              <p className="text-lg font-black">
                {pnrData.train}
              </p>
              <p className="text-xs font-bold opacity-50">
                #{pnrData.trainNo} | {pnrData.class} | {pnrData.quota}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-black uppercase">
                {pnrData.from} → {pnrData.to}
              </p>
              <p className="text-xs font-bold opacity-50">
                Journey Date: {pnrData.date}
              </p>
            </div>
          </div>
        </section>

        {/* 3️⃣ PASSENGER DETAILS */}
        <section>
          <h3 className="text-[10px] font-black text-irctcBlue mb-3 uppercase tracking-widest border-l-4 border-irctcBlue pl-2">
            Passenger & Contact Details
          </h3>

          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <p className="text-lg font-black">
                {pnrData.passengerName}
              </p>

              <p className="text-xs font-bold opacity-50">
                Age: {pnrData.passengerAge}
              </p>

              <p className="text-xs font-bold opacity-50">
                Mobile: {pnrData.mobile}
              </p>
            </div>

            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
              Confirmed
            </div>
          </div>
        </section>

        {/* 4️⃣ SEAT / BERTH / COACH */}
        <section className="grid grid-cols-3 gap-4">

          <div className="bg-irctcBlue/5 p-4 rounded-2xl text-center border border-irctcBlue/10">
            <p className="text-[9px] font-black opacity-50 uppercase">
              Coach
            </p>
            <p className="text-2xl font-black text-irctcBlue">
              {pnrData.coach}
            </p>
          </div>

          <div className="bg-irctcBlue/5 p-4 rounded-2xl text-center border border-irctcBlue/10">
            <p className="text-[9px] font-black opacity-50 uppercase">
              Seat
            </p>
            <p className="text-2xl font-black text-irctcBlue">
              {pnrData.seat}
            </p>
          </div>

          <div className="bg-irctcBlue/5 p-4 rounded-2xl text-center border border-irctcBlue/10">
            <p className="text-[9px] font-black opacity-50 uppercase">
              Berth
            </p>
            <p className="text-sm font-black text-irctcBlue">
              {pnrData.berth}
            </p>
          </div>

        </section>

        {/* 5️⃣ FARE BREAKDOWN */}
        <section className="bg-slate-900 text-white p-6 rounded-3xl">

          <h3 className="text-[9px] font-black text-irctcOrange mb-4 uppercase tracking-widest">
            Fare Breakdown & Payment
          </h3>

          <div className="space-y-2 text-sm opacity-90">
            <div className="flex justify-between">
              <span>Ticket Fare</span>
              <span>₹{pnrData.baseFare.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Service Charges</span>
              <span>₹{pnrData.tax.toFixed(2)}</span>
            </div>

            <div className="h-[1px] bg-white/10 my-2"></div>

            <div className="flex justify-between text-lg font-black">
              <span>Total Paid</span>
              <span>₹{pnrData.totalFare.toFixed(2)}</span>
            </div>
          </div>

          <p className="mt-4 text-[9px] font-bold text-gray-400 uppercase">
            Paid via {pnrData.paymentMode}
          </p>

        </section>

      </div>

      {/* BUTTONS */}
      <div className="p-4 flex gap-2 no-print bg-gray-50">
        <button
          onClick={() => window.print()}
          className="flex-1 bg-irctcBlue text-white py-4 font-black rounded-xl uppercase text-xs"
        >
          Print e-Ticket
        </button>

        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-black text-white py-4 font-black rounded-xl uppercase text-xs"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}

      {/* --- AUTH MODAL --- */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/90 z-[500] flex items-center justify-center p-6 no-print">
          <div className="bg-white text-black p-8 rounded-2xl max-w-sm w-full border-t-[12px] border-irctcBlue shadow-2xl">
             <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter italic">{isSignUp ? "Register" : "Sign In"}</h2>
             <div className="space-y-5 mt-6">
                {isSignUp && (
                  <>
                    <input className="w-full border-b-2 p-2 outline-none" placeholder="Name" onChange={e => setAuthForm({...authForm, name: e.target.value})} />
                    <input className="w-full border-b-2 p-2 outline-none" placeholder="Mobile" onChange={e => setAuthForm({...authForm, mobile: e.target.value})} />
                  </>
                )}
                <input className="w-full border-b-2 p-2 outline-none" placeholder="Email" onChange={e => setAuthForm({...authForm, email: e.target.value})} />
                <input className="w-full border-b-2 p-2 outline-none" type="password" placeholder="Password" onChange={e => setAuthForm({...authForm, password: e.target.value})} />
             </div>
             <button onClick={handleAuth} className="w-full bg-irctcBlue text-white py-4 font-bold mt-10 rounded-xl uppercase tracking-widest">
               {isSignUp ? "Register" : "Login"}
             </button>
             <p className="text-center mt-6 text-xs font-bold text-gray-400 cursor-pointer uppercase" onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? "Login" : "Register"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;