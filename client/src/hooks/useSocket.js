import { io } from 'socket.io-client';

// In dev: connect directly to local backend
// In prod: connect to deployed Render backend
const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : 'http://localhost:5001';

let socketInstance = null;

const initSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, { transports: ['websocket'] });
  }
  return socketInstance;
};

// Hook version — returns socket immediately (no null on first render)
export const useSocket = () => {
  return initSocket();
};

// Utility version — same singleton, for use outside React components
export const getSocket = () => {
  return initSocket();
};
