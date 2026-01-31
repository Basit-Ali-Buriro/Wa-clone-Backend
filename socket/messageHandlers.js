import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export default function registerMessageHandlers(io, socket, onlineUsers) {
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

  // ==========================================
  // 📨 BROADCAST MEDIA MESSAGE (for HTTP uploads)
  // ==========================================
  socket.on('new-message-broadcast', async (data) => {
    try {
      console.log('========================================');
      console.log('📨 BROADCAST MEDIA MESSAGE');
      console.log('========================================');
      console.log('From user:', socket.userId);
      console.log('Data:', data);

      const { message, conversationId } = data;

      if (!message || !conversationId) {
        console.error('❌ Invalid broadcast data');
        return;
      }

      // Verify user is participant
      await checkParticipation(conversationId, socket.userId);

      const messageData = {
        message,
        conversationId,
      };

      console.log('📢 Broadcasting media message to conversation...');

      // Broadcast to room (everyone in conversation except sender)
      socket.to(conversationId).emit('new-message', messageData);

      console.log('✅ Media message broadcast complete');
      console.log('========================================');

    } catch (error) {
      console.error('❌ BROADCAST ERROR:', error);
    }
  });

  // ==========================================
  // 📨 SEND MESSAGE (FIXED)
  // ==========================================
  socket.on('send-message', async (data) => {
    try {
      console.log('========================================');
      console.log('📨 SEND MESSAGE EVENT');
      console.log('========================================');
      console.log('From user:', socket.userId);
      console.log('Data received:', data);

      const { conversationId, text } = data;

      // Validate
      if (!conversationId || !text?.trim()) {
        console.error('❌ Invalid message data');
        return socket.emit('message-error', { error: 'Invalid message data' });
      }

      if (!isValidObjectId(conversationId)) {
        console.error('❌ Invalid conversation ID format');
        return socket.emit('message-error', { error: 'Invalid conversation ID' });
      }

      // Verify user is participant
      const conversation = await checkParticipation(conversationId, socket.userId);
      console.log('✅ User is participant of conversation');

      // Create message in database
      console.log('💾 Creating message in database...');
      const newMessage = await Message.create({
        sender: socket.userId,
        conversation: conversationId,
        text: text.trim(),
      });

      // Populate sender info
      await newMessage.populate('sender', 'name email avatarUrl');
      console.log('✅ Message created:', newMessage._id);

      // Update conversation's last message
      conversation.lastMessage = newMessage._id;
      await conversation.save();
      console.log('✅ Conversation last message updated');

      // Prepare message data
      const messageData = {
        message: newMessage,
        conversationId: conversationId,
      };

      console.log('📢 Broadcasting message...');

      // ✅ OPTION 1: Broadcast to room (everyone in the conversation)
      io.to(conversationId).emit('new-message', messageData);

      // ✅ Also send to sender's other sockets (multi-device support)
      const senderSockets = getUserSockets(socket.userId);
      senderSockets.forEach((socketId) => {
        io.to(socketId).emit('new-message', messageData);
      });

      console.log('✅ Message broadcast complete');
      console.log('========================================');

    } catch (error) {
      console.error('========================================');
      console.error('❌ SEND MESSAGE ERROR');
      console.error('========================================');
      console.error('Error:', error);
      console.error('========================================');
      socket.emit('message-error', { error: error.message });
    }
  });

  // ==========================================
  // ✏️ EDIT MESSAGE
  // ==========================================
  socket.on("message-edited", async (data) => {
    try {
      const { messageId, newText } = data;

      if (!isValidObjectId(messageId)) {
        throw new Error("Invalid message ID");
      }

      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      await checkParticipation(message.conversation, socket.userId);

      if (message.sender.toString() !== socket.userId) {
        throw new Error("Not authorized to edit this message");
      }

      message.text = newText;
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      const populatedMessage = await message.populate("sender", "name email avatarUrl");

      const conversation = await Conversation.findById(message.conversation);

      conversation.participants.forEach((participantId) => {
        const participantSockets = getUserSockets(participantId.toString());
        participantSockets.forEach((socketId) => {
          io.to(socketId).emit("message-updated", {
            message: populatedMessage,
            conversationId: message.conversation
          });
        });
      });

      console.log('✏️ Message edited:', messageId);
    } catch (error) {
      console.error("❌ Socket message-edited error:", error);
      socket.emit("message-error", { error: error.message });
    }
  });

  // ==========================================
  // 🗑️ DELETE MESSAGE
  // ==========================================
  socket.on("message-deleted", async (data) => {
    try {
      const { messageId, deleteType } = data;

      if (!isValidObjectId(messageId)) {
        throw new Error("Invalid message ID");
      }

      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      await checkParticipation(message.conversation, socket.userId);

      const conversation = await Conversation.findById(message.conversation);

      if (deleteType === "everyone" || deleteType === "forEveryone") {
        if (message.sender.toString() !== socket.userId) {
          throw new Error("Only sender can delete for everyone");
        }

        await Message.findByIdAndDelete(messageId);

        conversation.participants.forEach((participantId) => {
          const participantSockets = getUserSockets(participantId.toString());
          participantSockets.forEach((socketId) => {
            io.to(socketId).emit("message-removed", {
              messageId,
              conversationId: message.conversation
            });
          });
        });

        console.log('🗑️ Message deleted for everyone:', messageId);
      }
    } catch (error) {
      console.error("❌ Socket message-deleted error:", error);
      socket.emit("message-error", { error: error.message });
    }
  });

  // ==========================================
  // 😊 REACT TO MESSAGE
  // ==========================================
  socket.on("message-reaction", async (data) => {
    try {
      const { messageId, emoji } = data;
      const userId = socket.userId;

      if (!isValidObjectId(messageId)) {
        throw new Error("Invalid message ID format");
      }

      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      await checkParticipation(message.conversation, userId);

      const existingReaction = message.reactions.find(
        r => r.user.toString() === userId && r.emoji === emoji
      );

      if (existingReaction) {
        message.reactions = message.reactions.filter(
          r => !(r.user.toString() === userId && r.emoji === emoji)
        );
      } else {
        message.reactions.push({ user: userId, emoji });
      }

      await message.save();

      const populatedMessage = await message.populate([
        { path: "sender", select: "name email avatarUrl" },
        { path: "reactions.user", select: "name email avatarUrl" }
      ]);

      const conversation = await Conversation.findById(message.conversation);

      conversation.participants.forEach((participantId) => {
        const participantSockets = getUserSockets(participantId.toString());
        participantSockets.forEach((socketId) => {
          io.to(socketId).emit("message-updated", {
            message: populatedMessage,
            conversationId: message.conversation
          });
        });
      });

      console.log('😊 Reaction toggled:', emoji, 'on message:', messageId);
    } catch (error) {
      console.error("❌ Socket message-reaction error:", error);
      socket.emit("message-error", { error: error.message });
    }
  });

  // ==========================================
  // ✍️ TYPING INDICATORS
  // ==========================================
  socket.on("typing-started", async (conversationId) => {
    try {
      if (!isValidObjectId(conversationId)) {
        throw new Error("Invalid conversation ID");
      }

      const conversation = await checkParticipation(conversationId, socket.userId);

      conversation.participants.forEach((participantId) => {
        if (participantId.toString() !== socket.userId) {
          const participantSockets = getUserSockets(participantId.toString());
          participantSockets.forEach((socketId) => {
            io.to(socketId).emit("user-typing", {
              userId: socket.userId,
              conversationId,
              userInfo: socket.userInfo
            });
          });
        }
      });

      console.log('✍️ User typing:', socket.userId);
    } catch (error) {
      console.error("❌ Socket typing-started error:", error);
    }
  });

  socket.on("typing-stopped", async (conversationId) => {
    try {
      if (!isValidObjectId(conversationId)) {
        throw new Error("Invalid conversation ID");
      }

      const conversation = await checkParticipation(conversationId, socket.userId);

      conversation.participants.forEach((participantId) => {
        if (participantId.toString() !== socket.userId) {
          const participantSockets = getUserSockets(participantId.toString());
          participantSockets.forEach((socketId) => {
            io.to(socketId).emit("user-stopped-typing", {
              userId: socket.userId,
              conversationId
            });
          });
        }
      });

      console.log('✍️ User stopped typing:', socket.userId);
    } catch (error) {
      console.error("❌ Socket typing-stopped error:", error);
    }
  });

  // ==========================================
  // 🚪 JOIN/LEAVE CONVERSATION
  // ==========================================
  socket.on("join-conversation", async (conversationId) => {
    try {
      await checkParticipation(conversationId, socket.userId);
      socket.join(conversationId);
      console.log(`✅ User ${socket.userId} joined conversation ${conversationId}`);
    } catch (error) {
      console.error("❌ Socket join-conversation error:", error);
      socket.emit("message-error", { error: error.message });
    }
  });

  socket.on("leave-conversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`👋 User ${socket.userId} left conversation ${conversationId}`);
  });

  // ==========================================
  // 👁️ MARK MESSAGES AS SEEN
  // ==========================================
  socket.on("mark-messages-seen", async (data) => {
    try {
      const { conversationId } = data;
      const userId = socket.userId;

      console.log('========================================');
      console.log('👁️ MARK MESSAGES SEEN');
      console.log('========================================');
      console.log('User:', userId);
      console.log('Conversation:', conversationId);

      if (!isValidObjectId(conversationId)) {
        throw new Error("Invalid conversation ID");
      }

      const conversation = await checkParticipation(conversationId, userId);

      // Update all messages in this conversation that the user hasn't seen
      const result = await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: userId }, // Not sent by the user
          seenBy: { $ne: userId }, // Not already seen by the user
        },
        {
          $addToSet: { seenBy: userId }
        }
      );

      console.log(`✅ Marked ${result.modifiedCount} messages as seen`);

      // Get updated messages to broadcast
      if (result.modifiedCount > 0) {
        const updatedMessages = await Message.find({
          conversation: conversationId,
          seenBy: userId
        })
          .populate("sender", "name email avatarUrl")
          .sort({ createdAt: -1 })
          .limit(50);

        // Broadcast to all participants that messages were seen
        conversation.participants.forEach((participantId) => {
          const participantSockets = getUserSockets(participantId.toString());
          participantSockets.forEach((socketId) => {
            io.to(socketId).emit("messages-seen", {
              conversationId,
              seenBy: userId,
              messageIds: updatedMessages.map(m => m._id)
            });
          });
        });
      }

      console.log('========================================');
    } catch (error) {
      console.error("❌ Socket mark-messages-seen error:", error);
      socket.emit("message-error", { error: error.message });
    }
  });
}