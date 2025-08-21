const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./socket');

const HTTP_PORT = process.env.HTTP_PORT || 4000;
const WS_PORT = process.env.WS_PORT || 4001;

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize HTTP server
httpServer.listen(HTTP_PORT, () => {
    console.log(`🚀 HTTP Server: http://localhost:${HTTP_PORT}`);
});

// Create WebSocket server with error handling
try {
    const wsServer = http.createServer();
    initializeSocket(wsServer);
    wsServer.listen(WS_PORT, () => {
        console.log(`🔌 WS Server  : ws://localhost:${WS_PORT}`);
    });

    wsServer.on('error', (error) => {
        console.error('WebSocket Server Error:', error);
    });
} catch (error) {
    console.error('Failed to initialize WebSocket server:', error);
}