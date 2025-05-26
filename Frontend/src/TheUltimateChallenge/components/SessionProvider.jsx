import React, { createContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { connectSocket } from '../../services/sockets/theUltimateChallenge';

// Create context
export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const { sessionId } = useParams();

    let socket = connectSocket();

    return (
        <SessionContext.Provider value={{ sessionId, socket }}>
            {children}
        </SessionContext.Provider>
    );
};
