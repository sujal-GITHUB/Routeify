import { createContext } from "react";
import { io } from "socket.io-client";

// Use same URL for both HTTP and WebSocket
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

// Create socket with proper configuration
export const socket = io(BASE_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000,
  autoConnect: true
});

// Add connection event handlers
socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("connect", () => {
  console.log("Socket connected successfully!");
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

// Create context only once
export const socketContext = createContext({ socket });
