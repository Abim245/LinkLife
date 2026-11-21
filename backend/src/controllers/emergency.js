import { z } from 'zod';
import EmergencyRequest from '../models/EmergencyRequest.js';
import AlertDelivery from '../models/AlertDelivery.js';
import Organization from '../models/Organization.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { findMatchingDonors } from '../services/matching.js';

const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const createSchema = z.object({
  bloodType: z.enum(BLOOD),
  unitsNeeded: z.number().int().min(1).max(50),
  urgency: z.enum(['critical', 'urgent', 'standard']).default('urgent'),
  neededBy: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

export const respondSchema = z.object({
  response: z.enum(['accepted', 'declined']),
  etaMinutes: z.number().int().min(1).max(600).optional(),
});

// Live summary sent to the hospital dashboard
async function buildSummary(request) {
  const deliveries = await AlertDelivery.find({ requestId: request._id }).populate('donorId', 'name phone');
  res.json(
  deliveries.map((d) => {
    const accepted = d.response === 'accepted';
    return {
      donor: accepted ? d.donorId.name : 'Donor',
      phone: accepted ? d.donorId.phone : undefined,
      bloodType: d.donorId.donor?.bloodType,
      channel: d.channel,
      status: d.status,
      response: d.response,
      etaMinutes: d.etaMinutes,
    };
  })
  );
}

export const createEmergency = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.user.orgId);
  if (!org) return res.status(400).json({ message: 'No organization linked to this account' });
  if (!org.verified) return res.status(403).json({ message: 'Organization not verified by admin' });

  const request = await EmergencyRequest.create({
    ...req.body,
    orgId: org._id,
    location: org.location,
    createdBy: req.user.id,
  });

  const matches = await findMatchingDonors(request);
  const io = req.app.get('io');

  const deliveries = matches.map(({ donor }) => {
    const online = io.sockets.adapter.rooms.has(`donor:${donor._id}`);
    return {
      requestId: request._id,
      donorId: donor._id,
      channel: online ? 'socket' : 'sms',
      status: online ? 'sent' : 'queued', // queued SMS get sent by the worker later
      sentAt: online ? new Date() : undefined,
    };
  });
  if (deliveries.length) {
    await AlertDelivery.insertMany(deliveries, { ordered: false });
  }

  for (const { donor, distanceKm } of matches) {
    io.to(`donor:${donor._id}`).emit('emergency:new', {
      requestId: request._id,
      hospital: org.name,
      bloodType: request.bloodType,
      urgency: request.urgency,
      unitsNeeded: request.unitsNeeded,
      distanceKm,
    });
  }

  res.status(201).json({
    request,
    alerted: matches.length,
    viaSocket: deliveries.filter((d) => d.channel === 'socket').length,
    smsQueued: deliveries.filter((d) => d.channel === 'sms').length,
  });
});

export const respond = asyncHandler(async (req, res) => {
  const { response, etaMinutes } = req.body;
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.status !== 'open') return res.status(409).json({ message: `Request is ${request.status}` });

  // Only donors who were alerted can respond; the filter makes it idempotent
  const delivery = await AlertDelivery.findOneAndUpdate(
    { requestId: request._id, donorId: req.user.id },
    { response, respondedAt: new Date(), etaMinutes: response === 'accepted' ? etaMinutes : undefined },
    { new: true }
  );
  if (!delivery) return res.status(403).json({ message: 'You were not alerted for this request' });

  const io = req.app.get('io');
  const summary = await buildSummary(request);
  io.to(`hospital:${request.orgId}`).emit('emergency:update', summary);

  // Enough donors confirmed -> fulfil and tell everyone else
  if (summary.acceptedCount >= request.unitsNeeded) {
    request.status = 'fulfilled';
    request.closedAt = new Date();
    await request.save();
    await notifyClosed(io, request, 'fulfilled');
    io.to(`hospital:${request.orgId}`).emit('emergency:update', { ...summary, status: 'fulfilled' });
  }

  res.json({ message: `Response recorded: ${response}`, delivery });
});

async function notifyClosed(io, request, reason) {
  const deliveries = await AlertDelivery.find({ requestId: request._id });
  for (const d of deliveries) {
    io.to(`donor:${d.donorId}`).emit('emergency:closed', { requestId: request._id, reason });
  }
}

export const closeEmergency = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (String(request.orgId) !== String(req.user.orgId)) return res.status(403).json({ message: 'Not your request' });
  if (request.status !== 'open') return res.status(409).json({ message: `Already ${request.status}` });

  request.status = req.body?.fulfilled ? 'fulfilled' : 'closed';
  request.closedAt = new Date();
  await request.save();
  await notifyClosed(req.app.get('io'), request, request.status);
  res.json(request);
});

export const getEmergency = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  const isOwner = String(request.orgId) === String(req.user.orgId);
  if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  res.json(await buildSummary(request));
});

export const listEmergencies = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  if (req.user.role === 'donor') {
    const ids = await AlertDelivery.find({ donorId: req.user.id }).distinct('requestId');
    filter._id = { $in: ids };
  } else if (req.user.role !== 'admin') {
    filter.orgId = req.user.orgId;
  }
  res.json(await EmergencyRequest.find(filter).populate('orgId', 'name').sort({ createdAt: -1 }).limit(50));

});