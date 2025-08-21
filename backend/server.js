const http = require("http");
const app = require("./app");
const { initializeSocket } = require("./socket");

const PORT = process.env.PORT || 4000;

// Create a single HTTP server
const server = http.createServer(app);

// Attach socket.io to same server
initializeSocket(server);

// Start server
server.listen(PORT, () => {
  console.log("\n┌──────────────────────────────────────┐");
  console.log("│        Routeify API Server           │");
  console.log("├──────────────────────────────────────┤");
  console.log(`│ 🚀 Running on: http://localhost:${PORT} │`);
  console.log("│ 🌐 WebSocket also on same port       │");
  console.log("└──────────────────────────────────────┘\n");
});
