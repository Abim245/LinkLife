import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(token) {
  if (socket) socket.disconnect();
  socket = io(import.meta.env.VITE_API_URL, { auth: { token } });
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

socket.on('emergency:new', (a) => {
  setDonorAlertResponse(null);
  setEmergencies((prev) => (prev.some((e) => e.id === a.requestId) ? prev : [mapAlert(a), ...prev]));
});