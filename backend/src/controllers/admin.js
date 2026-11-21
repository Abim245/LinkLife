import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPendingOrgs = asyncHandler(async (req, res) => {
  res.json(await Organization.find({ verified: false }));
});

export const verifyOrg = asyncHandler(async (req, res) => {
  const org = await Organization.findByIdAndUpdate(
    req.params.id,
    { verified: true },
    { returnDocument: 'after' }
  );
  if (!org) return res.status(404).json({ message: 'Organization not found' });
  res.json(org);
});

export const overview = asyncHandler(async (req, res) => {
  const orgs = await Organization.find().sort({ createdAt: 1 });
  const staff = await User.find({ orgId: { $in: orgs.map((o) => o._id) } })
    .select('name phone orgId phoneVerified');
  const byOrg = new Map(staff.map((u) => [String(u.orgId), u]));

  const applications = orgs.map((o) => {
    const s = byOrg.get(String(o._id));
    const [lng, lat] = o.location?.coordinates || [];
    return {
      id: String(o._id),
      name: o.name,
      type: o.type === 'hospital' ? 'Hospital' : 'Blood bank',
      submittedAt: o.createdAt,
      status: o.verified ? 'APPROVED' : 'PENDING',
      registrationNumber: o.registrationNumber || '—',
      contactPerson: s?.name || '—',
      jobTitle: o.jobTitle || '—',
      email: o.email || '—',
      phone: s?.phone || o.contactPhone || '—',
      phoneVerified: !!s?.phoneVerified,
      address: o.address || '—',
      licenseDoc: '—',
      locationCoordinates: lat != null ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : '—',
    };
  });

  res.json({
    applications,
    stats: {
      verifiedOrgs: orgs.filter((o) => o.verified).length,
      donors: await User.countDocuments({ role: 'donor' }),
    },
  });
});