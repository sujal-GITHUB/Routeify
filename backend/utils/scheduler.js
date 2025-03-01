const cron = require('node-cron');
const { resetHoursOnlineAtMidnight } = require('../controllers/captain.controller');

const initializeScheduler = () => {
    // Schedule reset at midnight (00:00) every day
    cron.schedule('0 0 * * *', () => {
        console.log('Running hoursOnline reset at midnight');
        resetHoursOnlineAtMidnight();
    });
};

module.exports = { initializeScheduler };