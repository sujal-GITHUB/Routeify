import React, { createContext, useEffect } from "react";
import { io } from "socket.io-client";

export const socketContext = createContext();

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

const SocketProvider = ({ children }) => {
    useEffect(() => {
        socket.on('connect', () => {
            console.log(`Connected to server`);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        // Cleanup on unmount
        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    return (
        <socketContext.Provider value={{ socket }}>
            {children}
        </socketContext.Provider>
    );
};

export default SocketProvider;