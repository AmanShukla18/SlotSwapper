import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requesterSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Requester slot is required']
  },
  requestedSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Requested slot is required']
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  requestee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requestee is required']
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
swapRequestSchema.index({ requester: 1, status: 1 });
swapRequestSchema.index({ requestee: 1, status: 1 });
swapRequestSchema.index({ requesterSlot: 1, requestedSlot: 1 }, { unique: true });

const SwapRequest = mongoose.models.SwapRequest || mongoose.model('SwapRequest', swapRequestSchema);

export default SwapRequest;