import { createContext } from "react";
import { io } from "socket.io-client";

// Use your deployed backend URL for socket connection
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export const socketContext = createContext({ socket });
