import mongoose from 'mongoose';
const { Schema } = mongoose;

const alertSchema = new Schema(
  {
    requestId: { type: Schema.Types.ObjectId, ref: 'EmergencyRequest', required: true },
    donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: String, enum: ['socket', 'sms'], required: true },
    status: { type: String, enum: ['queued', 'sent', 'delivered', 'failed'], default: 'queued' },
    sentAt: Date,
    response: { type: String, enum: ['accepted', 'declined', 'none'], default: 'none' },
    respondedAt: Date,
    etaMinutes: Number,
  },
  { timestamps: true }
);

// Prevents duplicate alerts (doc section 7.4)
alertSchema.index({ requestId: 1, donorId: 1 }, { unique: true });

export default mongoose.model('AlertDelivery', alertSchema);