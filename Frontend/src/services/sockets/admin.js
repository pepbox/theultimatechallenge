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
        transports: ['websocket', 'polling'],
        withCredentials: true,
        autoConnect: false
      });

      socket.on('connect', async () => {
        console.log('Connected to socket server with ID:', socket.id);
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/updatesocketid`,
            { socketId: socket.id },
            { withCredentials: true }
          );
          console.log('Socket ID updated:', response.data);
          resolve(socket);
        } catch (error) {
          console.error('Error updating socket ID:', error.response?.data || error.message);
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
    return connectSocket(); // Fallback to connect if not initialized
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