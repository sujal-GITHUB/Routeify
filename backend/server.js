const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./socket');
const { initializeScheduler } = require('./utils/scheduler');
const port = process.env.SERVER_PORT || 3000;

const server = http.createServer(app);
initializeSocket(server);

server.listen(port, () => {
    console.log(`🚀 Server is running on port: ${port}`);
});