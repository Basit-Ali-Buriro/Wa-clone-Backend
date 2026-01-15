// backend/socket/callHandlers.js
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";
import Call from '../models/Call.js';

export default function registerCallHandlers(io, socket, onlineUsers) {
  const getUserSockets = (userId) => {
    return onlineUsers.get(userId) || new Set();
  };

  const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  };

  const checkParticipation = async (conversationId, userId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    
    if (!isParticipant) {
      throw new Error("You are not a participant of this conversation");
    }
    
    return conversation;
  };

  const isUserOnline = (userId) => {
    const userSockets = getUserSockets(userId);
    return userSockets.size > 0;
  };

  // ==================== CALL EVENTS ====================

  // Initiate a call (voice or video)
  socket.on("call:initiate", async (data) => {
    try {
      const { recipientId, callType, conversationId } = data;
      const callerId = socket.userId;

      console.log("📞 Call initiated:", { callerId, recipientId, callType });

      // Validate IDs
      if (!isValidObjectId(recipientId)) {
        throw new Error("Invalid recipient ID");
      }

      if (!isValidObjectId(conversationId)) {
        throw new Error("Invalid conversation ID");
      }

      // Verify caller is participant
      await checkParticipation(conversationId, callerId);

      // Check if recipient is online
      if (!isUserOnline(recipientId)) {
        return socket.emit("call:error", { 
          error: "User is offline or unavailable" 
        });
      }

      // Create call record
      const call = await Call.create({
        caller: callerId,
        recipient: recipientId,
        type: callType
      });

      // Get caller info
      const callerInfo = {
        userId: callerId,
        name: socket.userInfo?.name || "Unknown",
        avatarUrl: socket.userInfo?.avatarUrl || ""
      };

      console.log("👤 Caller info:", callerInfo);

      // Send call notification to recipient
      const recipientSockets = getUserSockets(recipientId);
      console.log(`📡 Recipient ${recipientId} has ${recipientSockets.size} socket(s)`);
      
      if (recipientSockets.size === 0) {
        console.log("⚠️ Recipient has no active sockets!");
        return socket.emit("call:error", { 
          error: "User is offline or unavailable" 
        });
      }

      const callData = {
        callId: call._id,
        callerId: callerId,
        callerName: callerInfo.name,
        callerAvatar: callerInfo.avatarUrl,
        callType, // 'voice' or 'video'
        conversationId
      };

      console.log("📤 Emitting call:incoming to recipient with data:", callData);
      
      recipientSockets.forEach((socketId) => {
        console.log(`  → Emitting to socket: ${socketId}`);
        io.to(socketId).emit("call:incoming", callData);
      });

      // Notify caller that ringing started
      socket.emit("call:ringing", { 
        recipientId,
        callId: call._id,
        status: "ringing" 
      });

      console.log("✅ Call ringing sent to recipient");

    } catch (error) {
      console.error("❌ Socket call:initiate error:", error);
      socket.emit("call:error", { error: error.message });
    }
  });

  // Accept incoming call
  socket.on("call:accept", async (data) => {
    try {
      const { callerId } = data;
      const recipientId = socket.userId;

      console.log("✅ Call accepted:", { callerId, recipientId });

      if (!isValidObjectId(callerId)) {
        throw new Error("Invalid caller ID");
      }

      // Check if caller is still online
      if (!isUserOnline(callerId)) {
        return socket.emit("call:error", { 
          error: "Caller is no longer available" 
        });
      }

      // Notify caller that call was accepted
      const callerSockets = getUserSockets(callerId);
      callerSockets.forEach((socketId) => {
        io.to(socketId).emit("call:accepted", {
          recipientId,
          recipientName: socket.userInfo?.name || "Unknown",
          recipientAvatar: socket.userInfo?.avatarUrl || ""
        });
      });

      console.log("✅ Call acceptance sent to caller");

    } catch (error) {
      console.error("❌ Socket call:accept error:", error);
      socket.emit("call:error", { error: error.message });
    }
  });

  // Reject incoming call
  socket.on("call:reject", async (data) => {
    try {
      const { callerId, reason, callId, conversationId } = data;
      const recipientId = socket.userId;

      console.log("❌ Call rejected:", { callerId, recipientId, reason });

      if (!isValidObjectId(callerId)) {
        throw new Error("Invalid caller ID");
      }

      // Save call message if we have the info
      if (callId && conversationId) {
        const call = await Call.findByIdAndUpdate(callId, {
          status: 'rejected',
          endTime: new Date(),
          endReason: 'rejected'
        }, { new: true }).populate('caller recipient');

        const callMessage = await Message.create({
          sender: callerId,
          conversation: conversationId,
          text: '',
          callInfo: {
            type: call.type,
            status: 'rejected',
            duration: 0,
            callId: call._id
          }
        });

        await callMessage.populate('sender', 'name avatarUrl');

        // Broadcast the call message
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.participants.forEach((participantId) => {
            const participantSockets = getUserSockets(participantId.toString());
            participantSockets.forEach((socketId) => {
              io.to(socketId).emit('new-message-broadcast', {
                message: callMessage
              });
            });
          });
        }
      }

      // Notify caller that call was rejected
      const callerSockets = getUserSockets(callerId);
      callerSockets.forEach((socketId) => {
        io.to(socketId).emit("call:rejected", {
          recipientId,
          reason: reason || "Call declined"
        });
      });

      console.log("✅ Call rejection sent to caller");

    } catch (error) {
      console.error("❌ Socket call:reject error:", error);
      socket.emit("call:error", { error: error.message });
    }
  });

  // End active call
  socket.on("call:end", async (data) => {
    try {
      const { recipientId } = data;
      const userId = socket.userId;

      console.log("📴 Call ended:", { userId, recipientId });

      if (!isValidObjectId(recipientId)) {
        throw new Error("Invalid recipient ID");
      }

      // Notify other user that call ended
      const recipientSockets = getUserSockets(recipientId);
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit("call:ended", {
          userId,
          reason: "Call ended by other user"
        });
      });

      console.log("✅ Call end notification sent");

    } catch (error) {
      console.error("❌ Socket call:end error:", error);
      socket.emit("call:error", { error: error.message });
    }
  });

  // ==================== WebRTC SIGNALING ====================

  // Send WebRTC offer
  socket.on("webrtc:offer", async (data) => {
    try {
      const { recipientId, offer } = data;
      const senderId = socket.userId;

      console.log("🔄 WebRTC offer sent:", { senderId, recipientId });

      if (!isValidObjectId(recipientId)) {
        throw new Error("Invalid recipient ID");
      }

      if (!offer) {
        throw new Error("Offer data is required");
      }

      // Forward offer to recipient
      const recipientSockets = getUserSockets(recipientId);
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit("webrtc:offer", {
          senderId,
          offer
        });
      });

    } catch (error) {
      console.error("❌ Socket webrtc:offer error:", error);
      socket.emit("call:error", { error: error.message });
    }
  });

  // Send WebRTC answer
  socket.on("webrtc:answer", async (data) => {
    try {
      const { recipientId, answer } = data;
      const senderId = socket.userId;

      console.log("🔄 WebRTC answer sent:", { senderId, recipientId });

      if (!isValidObjectId(recipientId)) {
        throw new Error("Invalid recipient ID");
      }

      if (!answer) {
        throw new Error("Answer data is required");
      }

      // Forward answer to recipient
      const recipientSockets = getUserSockets(recipientId);
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit("webrtc:answer", {
          senderId,
          answer
        });
      });

    } catch (error) {
      console.error("❌ Socket webrtc:answer error:", error);
      socket.emit("call:error", { error: error.message });
    }
  });

  // Exchange ICE candidates
  socket.on("webrtc:ice-candidate", async (data) => {
    try {
      const { recipientId, candidate } = data;
      const senderId = socket.userId;

      console.log("🧊 ICE candidate sent:", { senderId, recipientId });

      if (!isValidObjectId(recipientId)) {
        throw new Error("Invalid recipient ID");
      }

      if (!candidate) {
        throw new Error("Candidate data is required");
      }

      // Forward ICE candidate to recipient
      const recipientSockets = getUserSockets(recipientId);
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit("webrtc:ice-candidate", {
          senderId,
          candidate
        });
      });

    } catch (error) {
      console.error("❌ Socket webrtc:ice-candidate error:", error);
      socket.emit("call:error", { error: error.message });
    }
  });

  // Handle call not answered (timeout)
  socket.on("call:no-answer", async (data) => {
    try {
      const { recipientId, callId, conversationId } = data;
      const callerId = socket.userId;

      console.log("⏰ Call not answered:", { callerId, recipientId });

      if (!isValidObjectId(recipientId)) {
        throw new Error("Invalid recipient ID");
      }

      // Save call message as missed
      if (callId && conversationId) {
        const call = await Call.findByIdAndUpdate(callId, {
          status: 'missed',
          endTime: new Date(),
          endReason: 'missed'
        }, { new: true }).populate('caller recipient');

        const callMessage = await Message.create({
          sender: callerId,
          conversation: conversationId,
          text: '',
          callInfo: {
            type: call.type,
            status: 'missed',
            duration: 0,
            callId: call._id
          }
        });

        await callMessage.populate('sender', 'name avatarUrl');

        // Broadcast the call message
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.participants.forEach((participantId) => {
            const participantSockets = getUserSockets(participantId.toString());
            participantSockets.forEach((socketId) => {
              io.to(socketId).emit('new-message-broadcast', {
                message: callMessage
              });
            });
          });
        }
      }

      // Notify recipient (if still there) that call was cancelled
      const recipientSockets = getUserSockets(recipientId);
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit("call:missed", {
          callerId,
          callerName: socket.userInfo?.name || "Unknown"
        });
      });

    } catch (error) {
      console.error("❌ Socket call:no-answer error:", error);
    }
  });

  // Handle call busy (user already in another call)
  socket.on("call:busy", async (data) => {
    try {
      const { callerId } = data;
      const recipientId = socket.userId;

      console.log("📵 User busy:", { callerId, recipientId });

      if (!isValidObjectId(callerId)) {
        throw new Error("Invalid caller ID");
      }

      // Notify caller that recipient is busy
      const callerSockets = getUserSockets(callerId);
      callerSockets.forEach((socketId) => {
        io.to(socketId).emit("call:busy", {
          recipientId,
          message: "User is busy on another call"
        });
      });

    } catch (error) {
      console.error("❌ Socket call:busy error:", error);
    }
  });

  // Call status updates
  socket.on('call:ended', async ({ callId, reason, conversationId, duration }) => {
    try {
      const call = await Call.findByIdAndUpdate(callId, {
        status: 'ended',
        endTime: new Date(),
        endReason: reason,
        duration: duration || 0
      }, { new: true }).populate('caller recipient');

      if (call && conversationId) {
        // Create a call message in the conversation
        const callMessage = await Message.create({
          sender: call.caller._id,
          conversation: conversationId,
          text: '', // No text for call messages
          callInfo: {
            type: call.type,
            status: reason === 'completed' ? 'completed' : (reason === 'missed' ? 'missed' : 'cancelled'),
            duration: duration || 0,
            callId: call._id
          }
        });

        // Populate sender for broadcasting
        await callMessage.populate('sender', 'name avatarUrl');

        // Broadcast the call message to all participants
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.participants.forEach((participantId) => {
            const participantSockets = getUserSockets(participantId.toString());
            participantSockets.forEach((socketId) => {
              io.to(socketId).emit('new-message-broadcast', {
                message: callMessage
              });
            });
          });
        }

        console.log('✅ Call message saved to conversation:', callMessage._id);
      }
    } catch (error) {
      console.error('Error updating call status:', error);
    }
  });
}