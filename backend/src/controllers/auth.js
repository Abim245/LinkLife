import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
import Organization from '../models/.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';
import { createOtp, checkOtp } from '../services/otp.js';

const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const point = z.object({ coordinates: z.tuple([z.number(), z.number()]) }); // [lng, lat]

export const registerSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('donor'),
    name: z.string().min(2),
    phone: z.string().regex(/^\+\d{10,15}$/, 'Use international format, e.g. +2348012345678'),
    password: z.string().min(6),
    bloodType: z.enum(BLOOD),
    dob: z.coerce.date().optional(),
    lastDonationAt: z.coerce.date().optional(),
    location: point.optional(),
    radiusKm: z.number().min(1).max(100).optional(),
    registrationNumber: z.string().optional(), 
    jobTitle: z.string().optional(), 
    email: z.string().email().optional(),
  }),
  z.object({
    role: z.enum(['hospital', 'bloodbank']),
    name: z.string().min(2),
    phone: z.string().regex(/^\+\d{10,15}$/),
    password: z.string().min(6),
    orgName: z.string().min(2),
    address: z.string().optional(),
    location: point,
  }),
]);

export const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

export const otpSchema = z.object({
  phone: z.string(),
  code: z.string().length(6),
});

export const register = asyncHandler(async (req, res) => {
  const b = req.body;

  if (await User.findOne({ phone: b.phone })) {
    return res.status(409).json({ message: 'Phone already registered' });
  }

  const passwordHash = await bcrypt.hash(b.password, 10);
  let user;

  if (b.role === 'donor') {
    user = await User.create({
      role: 'donor',
      name: b.name,
      phone: b.phone,
      passwordHash,
      donor: {
        bloodType: b.bloodType,
        dob: b.dob,
        lastDonationAt: b.lastDonationAt,
        radiusKm: b.radiusKm,
        ...(b.location && {
          location: { type: 'Point', coordinates: b.location.coordinates },
          locationUpdatedAt: new Date(),
        }),
      },
    });
  } else {
    const org = await Organization.create({
      name: b.orgName,
      type: b.role,
      address: b.address,
      contactPhone: b.phone,
      location: { type: 'Point', coordinates: b.location.coordinates },
      verified: false, // admin must verify before declaring emergencies
      registrationNumber: b.registrationNumber, 
      jobTitle: b.jobTitle, 
      email: b.email
    });
    user = await User.create({
      role: b.role,
      name: b.name,
      phone: b.phone,
      passwordHash,
      orgId: org._id,
    });
  }

  createOtp(user.phone); // logs the code to the console

  res.status(201).json({
    message: 'Registered. Verify your phone with the OTP.',
    user: { id: user._id, role: user.role, name: user.name, phone: user.phone },
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;
  if (!checkOtp(phone, code)) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }
  const user = await User.findOneAndUpdate({ phone }, { phoneVerified: true }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ message: 'Phone verified', token: generateToken(user) });
});
export const resendOtp = asyncHandler(async (req, res) => {
  const user = await User.findOne({ phone: req.body.phone });
  if (!user) return res.status(404).json({ message: 'User not found' });
  createOtp(user.phone);
  res.json({ message: 'OTP sent' });
});
export const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
 let orgName;
if (user.orgId) orgName = (await Organization.findById(user.orgId).select('name'))?.name;

res.json({
  token: generateToken(user),
  user: { id: user._id, role: user.role, name: user.name, orgId: user.orgId, orgName, phoneVerified: user.phoneVerified },
});
});