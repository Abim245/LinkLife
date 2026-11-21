import twilio from 'twilio';
import { env } from '../config/env.js';
import AlertDelivery from '../models/AlertDelivery.js';
import { findMatchingDonors } from './matching.js';

const client = env.twilio.sid && env.twilio.token ? twilio(env.twilio.sid, env.twilio.token) : null;

export async function sendSMS(to, body) {
  if (!client || process.env.MOCK_SMS === 'true') {
    console.log(`[MOCK SMS] to ${to}: ${body}`);
    return { mocked: true };
  }
  return client.messages.create({ from: env.twilio.phone, to, body });
}

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