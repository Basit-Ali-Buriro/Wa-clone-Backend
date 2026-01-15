import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Call from '../models/Call.js';

const router = express.Router();

// Get call history
router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const calls = await Call.find({
      $or: [
        { caller: userId },
        { recipient: userId }
      ]
    })
      .populate('caller', 'name email avatarUrl')
      .populate('recipient', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(calls);
  } catch (error) {
    console.error('Get call history error:', error);
    res.status(500).json({ msg: 'Failed to get call history' });
  }
});

// Get call statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const totalCalls = await Call.countDocuments({
      $or: [{ caller: userId }, { recipient: userId }]
    });
    
    const missedCalls = await Call.countDocuments({
      recipient: userId,
      status: 'missed'
    });
    
    const outgoingCalls = await Call.countDocuments({
      caller: userId,
      status: 'connected'
    });
    
    const incomingCalls = await Call.countDocuments({
      recipient: userId,
      status: 'connected'
    });

    res.json({
      total: totalCalls,
      missed: missedCalls,
      outgoing: outgoingCalls,
      incoming: incomingCalls
    });
  } catch (error) {
    console.error('Get call stats error:', error);
    res.status(500).json({ msg: 'Failed to get call statistics' });
  }
});

// Delete call from history
router.delete('/:callId', protect, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;
    
    const call = await Call.findById(callId);
    
    if (!call) {
      return res.status(404).json({ msg: 'Call not found' });
    }
    
    // Check if user is part of the call
    if (call.caller.toString() !== userId.toString() && 
        call.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    await Call.findByIdAndDelete(callId);
    res.json({ msg: 'Call deleted from history' });
  } catch (error) {
    console.error('Delete call error:', error);
    res.status(500).json({ msg: 'Failed to delete call' });
  }
});

export default router;
