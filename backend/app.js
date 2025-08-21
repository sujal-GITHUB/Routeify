const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectToDb = require('./db/db');
const cookieParser = require('cookie-parser');

// Load environment variables first
dotenv.config();
const app = express();

// Connect to MongoDB
connectToDb()
  .then(() => {
    console.log('✅ Database connection initialized');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://routeify.onrender.com", "https://routeify.live"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/users', require('./routes/user.routes'));
app.use('/captains', require('./routes/captain.routes'));
app.use('/maps', require('./routes/map.routes'));
app.use('/rides', require('./routes/ride.routes'));
app.use('/payments', require('./routes/payment.routes'));

// Basic route
app.get("/", (req, res) => {
    res.send('Routeify API is running 🚀');
});

module.exports = app;
