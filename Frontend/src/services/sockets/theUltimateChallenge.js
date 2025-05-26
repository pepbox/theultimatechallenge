import { io } from 'socket.io-client';
import axios from 'axios';

let socket;

export const connectSocket = () => {
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
        
      } catch (error) {
        console.error('Error updating socket ID:', error.response?.data || error.message);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });
  }
  
  if (!socket.connected) {
    socket.connect();
  }
  
  return socket;
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
  }
};