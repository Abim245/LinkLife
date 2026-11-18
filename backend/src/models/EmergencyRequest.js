import mongoose from 'mongoose';
const { Schema } = mongoose;

const emergencySchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
    unitsNeeded: { type: Number, required: true, min: 1 },
    urgency: { type: String, enum: ['critical', 'urgent', 'standard'], default: 'urgent' },
    neededBy: Date,
    status: { type: String, enum: ['open', 'fulfilled', 'closed', 'expired'], default: 'open' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
    },
    currentRadiusKm: { type: Number, default: 10 },
    escalationRound: { type: Number, default: 0 },
    nextEscalationAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

emergencySchema.index({ status: 1, orgId: 1 });

export default mongoose.model('EmergencyRequest', emergencySchema);