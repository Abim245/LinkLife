import User from '../models/User.js';
import AlertDelivery from '../models/AlertDelivery.js';
import { compatibleDonorTypes } from './compatibility.js';

const COOLDOWN_DAYS = Number(process.env.DONATION_COOLDOWN_DAYS || 56);
const FIRST_WAVE_CAP = 50;

// Distance in km between two [lng, lat] points
export function distanceKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// quietHours like { start: '22:00', end: '06:00' } (handles overnight ranges)
function inQuietHours(quietHours, now = new Date()) {
  if (!quietHours?.start || !quietHours?.end) return false;
  const toMin = (s) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  };
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = toMin(quietHours.start);
  const end = toMin(quietHours.end);
  return start <= end ? cur >= start && cur < end : cur >= start || cur < end;
}

export async function findMatchingDonors(request, { cap = FIRST_WAVE_CAP } = {}) {
  const eligibleBefore = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

  // Skip donors already alerted for this request (important for escalation rounds)
  const alreadyAlerted = await AlertDelivery.find({ requestId: request._id }).distinct('donorId');

  const candidates = await User.find({
    role: 'donor',
    _id: { $nin: alreadyAlerted },
    'donor.available': true,
    'donor.bloodType': { $in: compatibleDonorTypes(request.bloodType) },
    $or: [
      { 'donor.lastDonationAt': { $lte: eligibleBefore } },
      { 'donor.lastDonationAt': null }, // also matches missing field
    ],
    'donor.location': {
      $near: {
        $geometry: request.location,
        $maxDistance: request.currentRadiusKm * 1000,
      },
    },
  }).limit(200); // $near returns nearest first

  const matches = [];
  for (const donor of candidates) {
    const km = distanceKm(request.location.coordinates, donor.donor.location.coordinates);

    // Respect the donor's own radius preference
    if (km > (donor.donor.radiusKm ?? 15)) continue;

    // Quiet hours (critical urgency overrides, pending product decision)
    if (request.urgency !== 'critical' && inQuietHours(donor.donor.quietHours)) continue;

    matches.push({ donor, distanceKm: Math.round(km * 10) / 10 });
    if (matches.length >= cap) break;
  }
  return matches;
}