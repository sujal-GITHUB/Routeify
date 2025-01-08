const mongoose = require('mongoose');

async function connectToDb() {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log('DB Connected!');
  } catch (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
}

module.exports = connectToDb;
