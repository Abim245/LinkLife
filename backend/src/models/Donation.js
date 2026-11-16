import mongoose from 'mongoose';
const { Schema } = mongoose;

const donationSchema = new Schema(
  {
    donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    requestId: { type: Schema.Types.ObjectId, ref: 'EmergencyRequest' },
    donatedAt: { type: Date, default: Date.now },
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Donation', donationSchema);