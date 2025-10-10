const mongoose = require('mongoose');

async function connectToDb() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/routeify';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
    console.log('💡 Make sure MongoDB is running locally or set MONGODB_URI environment variable');
    process.exit(1);
  }
}

module.exports = connectToDb;
