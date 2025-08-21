import { createContext } from "react";
import { io } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:4001";

// Create socket with proper configuration
export const socket = io(WS_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000,
  credentials: 'include',
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
