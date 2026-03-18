// src/trainData.js

export const stations = [
  "New Delhi", "Mumbai Central", "Howrah", "Chennai Central", "Bengaluru City",
  "Secunderabad", "Ahmedabad", "Pune Junction", "Lucknow NR", "Jaipur",
  "Guwahati", "Patna Junction", "Bhopal Junction", "Bhubaneswar", "Thiruvananthapuram Central",
  "Chandigarh", "Ranchi", "Raipur", "Dehradun", "Shimla",
  "Amritsar", "Varanasi", "Agra Cantt", "Kanpur Central", "Nagpur",
  "Indore Junction", "Vadodara", "Coimbatore Junction", "Madurai Junction", "Kochi",
  "Vijayawada", "Visakhapatnam", "Surat", "Rajkot", "Jodhpur",
  "Udaipur City", "Gwalior", "Jabalpur", "Kota", "Prayagraj",
  "Gorakhpur", "Dhanbad", "Jamshedpur", "Asansol", "Siliguri",
  "Shillong", "Imphal", "Itanagar", "Kohima", "Agartala",
  // ... Adding more to reach 100
  "Mysuru", "Hubballi", "Belagavi", "Mangaluru", "Udupi",
  "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Kottayam",
  "Salem", "Tiruchirappalli", "Erode", "Tiruppur", "Vellore",
  "Warangal", "Guntur", "Nellore", "Kurnool", "Rajahmundry",
  "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia",
  "Bikaner", "Ajmer", "Alwar", "Bhilwara", "Sikar",
  "Meerut", "Bareilly", "Aligarh", "Moradabad", "Saharanpur",
  "Ghansoli", "Thane", "Panvel", "Kalyan", "Borivali",
  "Haridwar", "Rishikesh", "Haldwani", "Roorkee", "Rudrapur",
  "Jammu Tawi", "Srinagar", "Leh", "Udhampur", "Kathua"
];

export const trains = [
  { id: 1, trainName: "Rajdhani Express", trainNumber: "12430", from: "New Delhi", to: "Mumbai Central", baseFare: 1200 },
  { id: 2, trainName: "Shatabdi Express", trainNumber: "12002", from: "New Delhi", to: "Bhopal Junction", baseFare: 850 },
  { id: 3, trainName: "Vande Bharat", trainNumber: "22436", from: "New Delhi", to: "Varanasi", baseFare: 1450 },
  { id: 4, trainName: "Duronto Express", trainNumber: "12260", from: "Howrah", to: "New Delhi", baseFare: 1150 },
  { id: 5, trainName: "Gatimaan Express", trainNumber: "12050", from: "New Delhi", to: "Agra Cantt", baseFare: 750 },
  { id: 6, trainName: "Chennai Mail", trainNumber: "12624", from: "Chennai Central", to: "Mumbai Central", baseFare: 980 },
  { id: 7, trainName: "Gitanjali Express", trainNumber: "12860", from: "Howrah", to: "Mumbai Central", baseFare: 1050 },
  { id: 8, trainName: "Karnataka Express", trainNumber: "12627", from: "Bengaluru City", to: "New Delhi", baseFare: 1100 },
  { id: 9, trainName: "Paschim Express", trainNumber: "12925", from: "Mumbai Central", to: "Amritsar", baseFare: 950 },
  { id: 10, trainName: "Sanghamitra Express", trainNumber: "12295", from: "Bengaluru City", to: "Patna Junction", baseFare: 1250 },
  // ... You can replicate these patterns to reach 100
];

// Logic to auto-generate more trains for variety if needed
const additionalTrainNames = ["Garib Rath", "Jan Shatabdi", "Humsafar Express", "Sampark Kranti", "Antyodaya Express"];
for (let i = 11; i <= 100; i++) {
  const randomFrom = stations[Math.floor(Math.random() * stations.length)];
  let randomTo = stations[Math.floor(Math.random() * stations.length)];
  while (randomTo === randomFrom) randomTo = stations[Math.floor(Math.random() * stations.length)];

  trains.push({
    id: i,
    trainName: `${additionalTrainNames[i % 5]} ${i}`,
    trainNumber: `${10000 + i}`,
    from: randomFrom,
    to: randomTo,
    baseFare: Math.floor(Math.random() * (1500 - 400) + 400)
  });
}