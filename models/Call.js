import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['voice', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['ringing', 'connected', 'ended', 'missed', 'rejected'],
    default: 'ringing'
  },
  startTime: Date,
  endTime: Date,
  duration: Number,
  endReason: {
    type: String,
    enum: ['completed', 'cancelled', 'missed', 'error']
  }
}, { timestamps: true });

export default mongoose.model('Call', callSchema);