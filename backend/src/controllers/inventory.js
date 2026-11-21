import { z } from 'zod';
import Organization from '../models/Organization.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Send either `units` (set an exact count) or `change` (add or subtract)
export const updateSchema = z
  .object({
    bloodType: z.enum(BLOOD),
    units: z.number().int().min(0).optional(),
    change: z.number().int().optional(),
    lowThreshold: z.number().int().min(0).optional(),
  })
  .refine((d) => !(d.units !== undefined && d.change !== undefined), {
    message: 'Send either units or change, not both',
  })
  .refine((d) => d.units !== undefined || d.change !== undefined || d.lowThreshold !== undefined, {
    message: 'Send units, change or lowThreshold',
  });

function buildView(org) {
  const stock = BLOOD.map((type) => {
    const units = org.inventory.get(type) ?? 0;
    return { bloodType: type, units, low: units < org.lowThreshold };
  });
  return {
    organization: org.name,
    lowThreshold: org.lowThreshold,
    stock,
    lowTypes: stock.filter((s) => s.low).map((s) => s.bloodType),
  };
}

export const getInventory = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.user.orgId);
  if (!org) return res.status(404).json({ message: 'Organization not found' });
  res.json(buildView(org));
});

export const updateInventory = asyncHandler(async (req, res) => {
  const { bloodType, units, change, lowThreshold } = req.body;
  const org = await Organization.findById(req.user.orgId);
  if (!org) return res.status(404).json({ message: 'Organization not found' });

  if (units !== undefined || change !== undefined) {
    const current = org.inventory.get(bloodType) ?? 0;
    const next = units !== undefined ? units : current + change;
    if (next < 0) {
      return res.status(400).json({ message: `Not enough ${bloodType} in stock (have ${current})` });
    }
    org.inventory.set(bloodType, next);
  }
  if (lowThreshold !== undefined) org.lowThreshold = lowThreshold;

  await org.save();

  const view = buildView(org);
  const isLow = view.lowTypes.includes(bloodType);
  res.json({
    ...view,
    suggestShortage: isLow,
    message: isLow
      ? `${bloodType} is below the threshold of ${org.lowThreshold}. Consider declaring a shortage.`
      : undefined,
  });
});

// Shortages across all verified organizations
export const regionalShortages = asyncHandler(async (req, res) => {
  const orgs = await Organization.find({ verified: true });
  const result = orgs
    .map((org) => ({
      organization: org.name,
      type: org.type,
      low: BLOOD.filter((t) => (org.inventory.get(t) ?? 0) < org.lowThreshold).map((t) => ({
        bloodType: t,
        units: org.inventory.get(t) ?? 0,
      })),
    }))
    .filter((o) => o.low.length);
  res.json(result);
});