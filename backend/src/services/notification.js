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

// Texts every offline donor, then marks each delivery sent or failed
async function sendSmsAlerts(smsDeliveries, byDonorId, request, hospitalName) {
  const link = `${env.appUrl}/alert/${request._id}`;

  await Promise.allSettled(
    smsDeliveries.map(async (d) => {
      const m = byDonorId.get(String(d.donorId));
      const body =
        `LifeLink ${String(request.urgency).toUpperCase()}: ${hospitalName} needs ` +
        `${request.unitsNeeded} unit(s) of ${request.bloodType} blood, ` +
        `${m.distanceKm} km from you. Respond: ${link}`;
      try {
        await sendSMS(m.donor.phone, body);
        await AlertDelivery.updateOne({ _id: d._id }, { status: 'sent', sentAt: new Date() });
      } catch (err) {
        await AlertDelivery.updateOne({ _id: d._id }, { status: 'failed' });
        console.error(`SMS to ${m.donor.phone} failed (${err.code || 'no code'}): ${err.message}`);
      }
    })
  );
}

export async function alertDonors(io, request, hospitalName) {
  const matches = await findMatchingDonors(request);
  const byDonorId = new Map(matches.map((m) => [String(m.donor._id), m]));

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

  const inserted = deliveries.length
    ? await AlertDelivery.insertMany(deliveries, { ordered: false })
    : [];

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

  // Send the texts in the background so declaring an emergency stays fast
  const smsDeliveries = inserted.filter((d) => d.channel === 'sms');
  if (smsDeliveries.length) {
    sendSmsAlerts(smsDeliveries, byDonorId, request, hospitalName).catch((err) =>
      console.error('SMS batch error:', err.message)
    );
  }

  return {
    alerted: matches.length,
    viaSocket: deliveries.filter((d) => d.channel === 'socket').length,
    smsQueued: smsDeliveries.length,
  };
}