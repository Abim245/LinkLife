import EmergencyRequest from '../models/EmergencyRequest.js';
import Organization from '../models/Organization.js';
import { alertDonors } from './notification.js';

export const RADIUS_TIERS = [10, 25, 50]; // km, round 0 -> 1 -> 2
const DELAY_SECONDS = { critical: 120, urgent: 300, standard: 600 };

export function nextEscalationDate(urgency) {
  // ESCALATION_DELAY_SECONDS lets you shorten the wait for demos
  const secs = Number(process.env.ESCALATION_DELAY_SECONDS) || DELAY_SECONDS[urgency] || 300;
  return new Date(Date.now() + secs * 1000);
}

export async function escalateRequest(io, requestId, { force = false } = {}) {
  const filter = { _id: requestId, status: 'open' };
  if (!force) filter.nextEscalationAt = { $lte: new Date() };

  // Claim the request atomically so it can never be escalated twice at once
  const request = await EmergencyRequest.findOneAndUpdate(
    filter,
    { $set: { nextEscalationAt: null } },
    { returnDocument: 'after' }
  );
  if (!request) return null;

  const nextRound = request.escalationRound + 1;
  if (nextRound >= RADIUS_TIERS.length) return null; // already at max radius

  request.escalationRound = nextRound;
  request.currentRadiusKm = RADIUS_TIERS[nextRound];
  request.nextEscalationAt =
    nextRound < RADIUS_TIERS.length - 1 ? nextEscalationDate(request.urgency) : null;
  await request.save();

  const org = await Organization.findById(request.orgId);
  const result = await alertDonors(io, request, org?.name);

  io.to(`hospital:${request.orgId}`).emit('emergency:update', {
    requestId: request._id,
    status: request.status,
    escalationRound: nextRound,
    radiusKm: request.currentRadiusKm,
    newlyAlerted: result.alerted,
  });

  return { round: nextRound, radiusKm: request.currentRadiusKm, ...result };
}

export function startEscalationScheduler(io) {
  setInterval(async () => {
    try {
      const due = await EmergencyRequest.find({
        status: 'open',
        nextEscalationAt: { $lte: new Date() },
      }).select('_id');
      for (const r of due) await escalateRequest(io, r._id);
    } catch (err) {
      console.error('Escalation scheduler error:', err.message);
    }
  }, 15 * 1000);
}