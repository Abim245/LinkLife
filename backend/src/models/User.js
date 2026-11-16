import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    role: { type: String, enum: ['donor', 'hospital', 'bloodbank', 'admin'], required: true },
    name: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    phoneVerified: { type: Boolean, default: false },
    passwordHash: { type: String, required: true },
    donor: {
      bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      dob: Date,
      lastDonationAt: Date,
      available: { type: Boolean, default: true },
      radiusKm: { type: Number, default: 15 },
      quietHours: { start: String, end: String },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: undefined }, // [lng, lat]
      },
      locationUpdatedAt: Date,
    },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  },
  { timestamps: true }
);

userSchema.index({ 'donor.location': '2dsphere' });
userSchema.index({ 'donor.bloodType': 1, 'donor.available': 1 });

export default mongoose.model('User', userSchema);