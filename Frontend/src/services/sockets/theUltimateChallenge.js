import { io } from 'socket.io-client';
import axios from 'axios';

let socket;
let connectionPromise = null;

export const connectSocket = () => {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise((resolve, reject) => {
    if (!socket) {
      socket = io(import.meta.env.VITE_BACKEND_BASE_URL, {
        transports: ['websocket'],
        withCredentials: true,
        autoConnect: false
      });

      socket.on('connect', async () => {
        console.log('Connected to socket server with ID:', socket.id);
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/theultimatechallenge/updatesocketid`,
            { socketId: socket.id },
            { withCredentials: true }
          );
          console.log('Socket ID updated:', response.data);
          resolve(socket);
        } catch (error) {
          console.error('Error updating socket ID:', error.response?.data || error.message);
          // If player was deleted/removed (404) or token is invalid/missing (401), clear session (only if not on the login page)
          if (
            !window.location.pathname.includes('/login/') &&
            (error.response?.status === 404 ||
              error.response?.status === 401 ||
              error.response?.data?.message === 'Player not found')
          ) {
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            const pathParts = window.location.pathname.split('/');
            const sessionId = pathParts[pathParts.length - 1];
            window.location.href = `/theultimatechallenge/login/${sessionId}`;
            reject(error);
            return;
          }
          // Still resolve even if socket ID update fails
          resolve(socket);
        }
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        reject(err);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        connectionPromise = null;
      });
    }
    
    if (socket.connected) {
      resolve(socket);
    } else {
      socket.connect();
    }
  });

  return connectionPromise;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectionPromise = null;
  }
};