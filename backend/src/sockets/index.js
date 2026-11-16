import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { registerHandlers } from './handlers.js';

export function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  // Authenticate during handshake
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      socket.user = jwt.verify(token, env.jwtSecret); // { id, role, orgId }
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role, orgId } = socket.user;
    if (role === 'donor') socket.join(`donor:${id}`);
    if (orgId) socket.join(`hospital:${orgId}`);
    registerHandlers(io, socket);
  });

  return io;
}