import { z } from 'zod';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const profileSchema = z.object({
  available: z.boolean().optional(),
  radiusKm: z.number().min(1).max(100).optional(),
  quietHours: z
    .object({ start: z.string().regex(/^\d{2}:\d{2}$/), end: z.string().regex(/^\d{2}:\d{2}$/) })
    .optional(),
  lastDonationAt: z.coerce.date().optional(),
});

export const locationSchema = z.object({
  coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]), // [lng, lat]
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const update = {};
  for (const [key, value] of Object.entries(req.body)) {
    update[`donor.${key}`] = value;
  }
  const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { returnDocument: 'after' }).select('-passwordHash');
  res.json(user);
});

export const updateLocation = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        'donor.location': { type: 'Point', coordinates: req.body.coordinates },
        'donor.locationUpdatedAt': new Date(),
      },
    },
    { returnDocument: 'after' }
  ).select('-passwordHash');
  res.json(user);
});