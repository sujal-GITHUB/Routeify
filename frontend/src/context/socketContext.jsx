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

    const sendMessage = (eventName, message) => {
        socket.emit(eventName, message);
    };

    const receiveMessage = (eventName, callback) => {
        socket.on(eventName, callback);
    };

    return (
        <socketContext.Provider value={{ sendMessage, receiveMessage }}>
            {children}
        </socketContext.Provider>
    );
};

export default SocketProvider;