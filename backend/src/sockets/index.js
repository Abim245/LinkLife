import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { registerHandlers } from './handlers.js';
import AlertDelivery from '../models/AlertDelivery.js';

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

  io.on('connection', async (socket) => {
    const { id, role, orgId } = socket.user;
    if (role === 'donor') socket.join(`donor:${id}`);
    if (orgId) socket.join(`hospital:${orgId}`);
    registerHandlers(io, socket);

    if (role === 'donor') {
      try {
        const pending = await AlertDelivery.find({ donorId: id, response: 'none' }).populate({
          path: 'requestId',
          match: { status: 'open' },
          populate: { path: 'orgId', select: 'name' },
        });
        for (const d of pending) {
          if (!d.requestId) continue; // request is no longer open
          socket.emit('emergency:new', {
            requestId: d.requestId._id,
            hospital: d.requestId.orgId?.name,
            bloodType: d.requestId.bloodType,
            urgency: d.requestId.urgency,
            unitsNeeded: d.requestId.unitsNeeded,
            distanceKm: null,
          });
        }
      } catch (err) {
        console.error('Pending alerts error:', err.message);
      }
    }
  });

  return io;
}