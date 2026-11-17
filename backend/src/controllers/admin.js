import Organization from '../models/Organization.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPendingOrgs = asyncHandler(async (req, res) => {
  res.json(await Organization.find({ verified: false }));
});

export const verifyOrg = asyncHandler(async (req, res) => {
  const org = await Organization.findByIdAndUpdate(
    req.params.id,
    { verified: true },
    { new: true }
  );
  if (!org) return res.status(404).json({ message: 'Organization not found' });
  res.json(org);
});