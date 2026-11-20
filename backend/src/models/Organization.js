import mongoose from 'mongoose';
const { Schema } = mongoose;

const orgSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['hospital', 'bloodbank'], required: true },
    address: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    contactPhone: String,
    verified: { type: Boolean, default: false },
    inventory: { type: Map, of: Number, default: {} }, // { 'O-': 12, ... }
    lowThreshold: { type: Number, default: 5 },
    registrationNumber: { type: String },
    jobTitle: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);

orgSchema.index({ location: '2dsphere' });

export default mongoose.model('Organization', orgSchema);