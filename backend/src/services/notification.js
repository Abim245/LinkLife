import AlertDelivery from '../models/AlertDelivery.js';
import { findMatchingDonors } from './matching.js';

export async function alertDonors(io, request, hospitalName) {
  const matches = await findMatchingDonors(request);

  const deliveries = matches.map(({ donor }) => {
    const online = io.sockets.adapter.rooms.has(`donor:${donor._id}`);
    return {
      requestId: request._id,
      donorId: donor._id,
      channel: online ? 'socket' : 'sms',
      status: online ? 'sent' : 'queued',
      sentAt: online ? new Date() : undefined,
    };
  });

  if (deliveries.length) {
    await AlertDelivery.insertMany(deliveries, { ordered: false });
  }

  for (const { donor, distanceKm } of matches) {
    io.to(`donor:${donor._id}`).emit('emergency:new', {
      requestId: request._id,
      hospital: hospitalName,
      bloodType: request.bloodType,
      urgency: request.urgency,
      unitsNeeded: request.unitsNeeded,
      distanceKm,
    });
  }

  return {
    alerted: matches.length,
    viaSocket: deliveries.filter((d) => d.channel === 'socket').length,
    smsQueued: deliveries.filter((d) => d.channel === 'sms').length,
  };
}