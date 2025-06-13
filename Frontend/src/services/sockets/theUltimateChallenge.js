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
  if (!socket || !socket.connected) {
    throw new Error('Socket not initialized or not connected');
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