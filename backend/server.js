const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Check if the server is alive
app.get('/', (req, res) => {
    res.send("API is running...");
});

// 2. Load train data route
app.get('/api/trains', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'trains.json');
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error("File Read Error:", err);
        res.status(500).json({ error: "Could not read trains.json" });
    }
});

// 3. Student Verification Route
app.post('/api/verify', (req, res) => {
    const { email } = req.body;
    if (email && (email.endsWith('.ac.in') || email.endsWith('.edu'))) {
        res.json({ success: true, discount: 0.5 });
    } else {
        res.status(400).json({ success: false, message: "Use a valid college email" });
    }
});

// START SERVER
const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVER STARTED!`);
    console.log(`📡 Listening on http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop`);
});