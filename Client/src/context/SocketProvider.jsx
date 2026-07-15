import React, { useState } from "react";
import { useMemo } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};

export const SocketProvider = (props) => {

    const socket = useMemo(() => {
        // Resolve target socket connection URL:
        // In local development (e.g. Vite on a port like 5173), we connect to http://localhost:8000
        // In production/deployment (served on port 80/443), we connect to "/" (nginx proxy)
        const isLocalDev = typeof window !== 'undefined' && 
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
            window.location.port !== '' && 
            window.location.port !== '80';

        const socketUrl = isLocalDev ? "http://localhost:8000" : "/";
        return io(socketUrl);
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}