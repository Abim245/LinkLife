import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(token) {
  if (!token || !import.meta.env.VITE_API_URL) return null;
  if (socket) socket.disconnect();
  socket = io(import.meta.env.VITE_API_URL, { auth: { token } });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}