import { io } from 'socket.io-client';

let socketInstance = null;

const initSocket = () => {
  if (!socketInstance) {
    socketInstance = io('http://localhost:5001', { transports: ['websocket'] });
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
