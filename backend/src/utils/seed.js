import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

const JOS = [8.8921, 9.9167]; // [lng, lat]
const TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const PASSWORD = 'secret123';
const DAY = 24 * 60 * 60 * 1000;

// Random point up to `km` away from center
function jitter([lng, lat], km) {
  const dist = Math.random() * km;
  const angle = Math.random() * 2 * Math.PI;
  const dLat = (dist * Math.cos(angle)) / 111;
  const dLng = (dist * Math.sin(angle)) / (111 * Math.cos((lat * Math.PI) / 180));
  return [lng + dLng, lat + dLat];
}

async function seed() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected');

  // Clear previous seed data
  await User.deleteMany({ phone: /^\+23480000/ });
  await Organization.deleteMany({ name: 'Demo Jos Hospital' });

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // Verified hospital + staff user
  const org = await Organization.create({
    name: 'Demo Jos Hospital',
    type: 'hospital',
    address: 'Jos, Plateau State',
    contactPhone: '+2348000000000',
    location: { type: 'Point', coordinates: JOS },
    verified: true,
    inventory: { 'O-': 3, 'O+': 8, 'A+': 6 },
  });

  await User.create({
    role: 'hospital',
    name: 'Hospital Coordinator',
    phone: '+2348000000000',
    phoneVerified: true,
    passwordHash,
    orgId: org._id,
  });

  await User.create({
    role: 'admin',
    name: 'Admin',
    phone: '+2348000000099',
    phoneVerified: true,
    passwordHash,
  });

  // Donors
  const donors = [];
  for (let i = 1; i <= 20; i++) {
    const far = i % 11 === 0; // outside typical radius
    const onCooldown = i % 7 === 0; // donated 20 days ago, so ineligible
    const unavailable = i % 9 === 0;

    donors.push({
      role: 'donor',
      name: `Donor ${i}`,
      phone: `+23480000${String(100 + i)}`,
      phoneVerified: true,
      passwordHash,
      donor: {
        bloodType: TYPES[i % TYPES.length],
        available: !unavailable,
        lastDonationAt: onCooldown
          ? new Date(Date.now() - 20 * DAY)
          : i % 2 === 0
          ? new Date(Date.now() - 120 * DAY)
          : undefined, // never donated
       radiusKm: 60,
        location: {
          type: 'Point',
          coordinates: jitter(JOS, 5 + (i % 5) * 10), // spreads donors from ~5 to ~45 km
        },
        locationUpdatedAt: new Date(),
      },
    });
  }
  await User.insertMany(donors);

  console.log('Seeded: 1 hospital, 1 admin, 20 donors');
  console.log(`Hospital login: +2348000000000 / ${PASSWORD}`);
  console.log(`Admin login:    +2348000000099 / ${PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});