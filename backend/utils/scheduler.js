const cron = require('node-cron');
const { resetHoursOnlineAtMidnight } = require('../controllers/captain.controller');

const initializeScheduler = () => {
    // Schedule reset at midnight (00:00) every day
    cron.schedule('0 0 * * *', () => {
        resetHoursOnlineAtMidnight();
    });
};

module.exports = { initializeScheduler };