const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // This helps us read student email data

// This is our first 'Route' - just to check if it works
app.get('/', (req, res) => {
    res.send('IRCTC Student Backend is Running! 🚀');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`The Brain is alive on port ${PORT}`);
});

app.get('/api/trains', (req, res) => {
    const data = fs.readFileSync('./trains.json');
    const trains = JSON.parse(data);
    
    // We send the whole list of trains to the frontend
    res.json(trains);
});