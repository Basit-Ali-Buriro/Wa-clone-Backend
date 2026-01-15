import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

// ✅ Create 1-to-1 Conversation (FIXED)
export const createConversation = async (req, res) => {
  try {
    // ✅ Accept BOTH participantId and userId for compatibility
    const { participantId, userId } = req.body;
    const otherUserId = participantId || userId;
    const authUser = req.user._id;

    console.log('========================================');
    console.log('📥 CREATE CONVERSATION');
    console.log('========================================');
    console.log('Auth user:', authUser);
    console.log('Other user (participantId):', otherUserId);
    console.log('Request body:', req.body);

    // Validate input
    if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      console.error('❌ Invalid user ID');
      return res.status(400).json({ msg: "Invalid user ID provided" });
    }

    // Check if users are different
    if (otherUserId === authUser.toString()) {
      console.error('❌ Cannot create conversation with self');
      return res.status(400).json({ msg: "Cannot create conversation with yourself" });
    }

    // Check if conversation exists
    const existingConversation = await Conversation.findOne({
      isGroup: false,
      participants: {
        $all: [authUser, otherUserId],
        $size: 2,
      },
    }).populate("participants", "name email avatarUrl bio");

    if (existingConversation) {
      console.log("✅ Found existing conversation:", existingConversation._id);
      return res.json(existingConversation);
    }

    // Create new conversation
    const newConversation = await Conversation.create({
      participants: [authUser, otherUserId],
      isGroup: false,
    });

    // Populate and return
    const populatedConversation = await Conversation.findById(newConversation._id)
      .populate("participants", "name email avatarUrl bio");

    console.log("✅ Created new conversation:", populatedConversation._id);
    console.log('========================================');
    return res.status(201).json(populatedConversation);
  } catch (error) {
    console.error("❌ Create conversation error:", error);
    return res.status(500).json({
      msg: "Failed to create conversation",
      error: error.message,
    });
  }
};

// ✅ Fetch All Conversations (FIXED - Returns array directly)
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('========================================');
    console.log('📋 GET CONVERSATIONS');
    console.log('========================================');
    console.log('User ID:', userId);
    console.log('User email:', req.user.email);

    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "name avatarUrl email bio")
      .populate({
        path: "lastMessage",
        select: "text media createdAt sender",
        populate: {
          path: "sender",
          select: "name avatarUrl",
        },
      })
      .sort({ updatedAt: -1 });

    console.log('✅ Found conversations:', conversations.length);
    
    conversations.forEach((conv, index) => {
      console.log(`  ${index + 1}.`, {
        id: conv._id,
        isGroup: conv.isGroup,
        groupName: conv.groupName,
        participants: conv.participants.map(p => p.name),
        lastMessage: conv.lastMessage?.text || 'No message',
      });
    });

    console.log('========================================');

    // ✅ Return array directly (NOT wrapped in object)
    return res.status(200).json(conversations);

  } catch (error) {
    console.error("❌ getConversations Error:", error);
    return res.status(500).json({
      msg: "Server error while fetching conversations",
      error: error.message,
    });
  }
};

// ✅ Create Group Conversation
export const createGroupConversation = async (req, res) => {
  try {
    const { name, participants, groupAvatar } = req.body;
    const userId = req.user._id;

    console.log('========================================');
    console.log('👥 CREATE GROUP');
    console.log('========================================');
    console.log('Group name:', name);
    console.log('Participants:', participants);
    console.log('Creator:', userId);

    // Validate input
    if (!name || !participants || participants.length < 2) {
      return res.status(400).json({ 
        msg: "Group name and at least 2 participants are required" 
      });
    }

    // Ensure all participant IDs are valid
    const allUsersExist = await User.find({ _id: { $in: participants } });
    if (allUsersExist.length !== participants.length) {
      return res.status(400).json({ msg: "Some participants not found" });
    }

    // Create group conversation
    const group = await Conversation.create({
      isGroup: true,
      groupName: name,
      groupAvatar: groupAvatar || "",
      participants: [...participants, userId],
      groupAdmins: [userId],
      createdBy: userId,
    });

    // Populate group data
    const populatedGroup = await Conversation.findById(group._id)
      .populate("participants", "name email avatarUrl bio")
      .populate("groupAdmins", "name avatarUrl");

    console.log('✅ Group created:', populatedGroup._id);
    console.log('========================================');

    return res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("❌ CreateGroup Error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ Add Participants
export const addParticipants = async (req, res) => {
  const groupConversationId = req.params.id;
  const userId = req.user._id.toString();
  const { participants } = req.body;

  try {
    const conversation = await Conversation.findById(groupConversationId);
    if (!conversation) {
      return res.status(404).json({ msg: "Group does not exist" });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ msg: "Cannot add participants to a 1-to-1 chat" });
    }

    const isAdmin = conversation.groupAdmins.some(
      (adminId) => adminId.toString() === userId
    );
    if (!isAdmin) {
      return res.status(403).json({ msg: "Only admin can add participants" });
    }

    const allUsersExist = await User.find({ _id: { $in: participants } });
    if (allUsersExist.length !== participants.length) {
      return res.status(400).json({ msg: "Some participants not found" });
    }

    const existingParticipantIds = conversation.participants.map((p) =>
      p.toString()
    );
    const newParticipants = participants.filter(
      (id) => !existingParticipantIds.includes(id)
    );

    conversation.participants.push(...newParticipants);
    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name email avatarUrl bio");

    return res.status(200).json(populatedConversation);
  } catch (error) {
    console.error("❌ AddParticipants Error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ Remove Participants
export const removeParticipants = async (req, res) => {
  const groupConversationId = req.params.id;
  const userId = req.user._id.toString();
  const { participants } = req.body;

  try {
    const conversation = await Conversation.findById(groupConversationId);
    if (!conversation) {
      return res.status(404).json({ msg: "Group does not exist" });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ msg: "Cannot remove participants from a 1-to-1 chat" });
    }

    const isAdmin = conversation.groupAdmins.some(
      (adminId) => adminId.toString() === userId
    );
    if (!isAdmin) {
      return res.status(403).json({ msg: "Only admin can remove participants" });
    }

    const allUsersExist = await User.find({ _id: { $in: participants } });
    if (allUsersExist.length !== participants.length) {
      return res.status(400).json({ msg: "Some participants not found" });
    }

    conversation.participants = conversation.participants.filter(
      (p) => !participants.includes(p.toString())
    );

    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name email avatarUrl bio");

    return res.status(200).json(populatedConversation);
  } catch (error) {
    console.error("❌ RemoveParticipants Error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ Change Group Admin
export const changeGroupAdmin = async (req, res) => {
  const groupConversationId = req.params.id;
  const { newAdminId } = req.body;
  const userId = req.user._id.toString();

  try {
    const conversation = await Conversation.findById(groupConversationId);
    if (!conversation) {
      return res.status(404).json({ msg: "Group not found" });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ msg: "Cannot change admin for a 1-to-1 chat" });
    }

    const isAdmin = conversation.groupAdmins.some(
      (adminId) => adminId.toString() === userId
    );
    if (!isAdmin) {
      return res.status(403).json({ msg: "Only an admin can change the admin" });
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === newAdminId
    );
    if (!isParticipant) {
      return res.status(400).json({ msg: "New admin must be a participant of the group" });
    }

    if (!conversation.groupAdmins.some((adminId) => adminId.toString() === newAdminId)) {
      conversation.groupAdmins.push(newAdminId);
      await conversation.save();
    }

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name email avatarUrl bio");

    return res.status(200).json(populatedConversation);
  } catch (error) {
    console.error("❌ ChangeGroupAdmin Error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ Rename Group
export const renameGroup = async (req, res) => {
  const groupConversationId = req.params.id;
  const { newName, groupName } = req.body; // Accept both for compatibility
  const name = newName || groupName;
  const userId = req.user._id.toString();

  try {
    const conversation = await Conversation.findById(groupConversationId);
    if (!conversation) {
      return res.status(404).json({ msg: "Group not found" });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ msg: "Cannot rename a 1-to-1 conversation" });
    }

    const isAdmin = conversation.groupAdmins.some(
      (adminId) => adminId.toString() === userId
    );
    if (!isAdmin) {
      return res.status(403).json({ msg: "Only admin can rename the group" });
    }

    conversation.groupName = name;
    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name email avatarUrl bio");

    return res.status(200).json(populatedConversation);
  } catch (error) {
    console.error("❌ RenameGroup Error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ Change Group Avatar
export const changeGroupAvatar = async (req, res) => {
  const groupConversationId = req.params.id;
  const userId = req.user._id.toString();
  const { groupAvatar } = req.body;

  try {
    const conversation = await Conversation.findById(groupConversationId);
    if (!conversation) {
      return res.status(404).json({ msg: "Group does not exist" });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ msg: "Cannot change avatar for 1-to-1 conversation" });
    }

    const isAdmin = conversation.groupAdmins.some(
      (adminId) => adminId.toString() === userId
    );
    if (!isAdmin) {
      return res.status(403).json({ msg: "Only admin can change the group avatar" });
    }

    // If file was uploaded via multer, use that URL
    if (req.file && req.file.path) {
      conversation.groupAvatar = req.file.path;
      console.log('✅ Group avatar uploaded to:', req.file.path);
    } else if (groupAvatar) {
      // Otherwise use the provided URL
      conversation.groupAvatar = groupAvatar;
    }

    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name email avatarUrl bio");

    return res.status(200).json(populatedConversation);
  } catch (error) {
    console.error("❌ ChangeGroupAvatar Error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ✅ Delete Conversation
export const deleteConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user._id.toString();

    console.log('========================================');
    console.log('🗑️ DELETE CONVERSATION');
    console.log('========================================');
    console.log('Conversation ID:', conversationId);
    console.log('User ID:', userId);

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ msg: "Invalid conversation ID" });
    }

    // Find conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant) {
      return res.status(403).json({ msg: "Not authorized to delete this conversation" });
    }

    // For groups, only admins can delete
    if (conversation.isGroup) {
      const isAdmin = conversation.groupAdmins.some(
        (adminId) => adminId.toString() === userId
      );
      if (!isAdmin) {
        return res.status(403).json({ msg: "Only group admins can delete the group" });
      }
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversation: conversationId });

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    console.log('✅ Conversation deleted successfully');
    console.log('========================================');

    return res.status(200).json({ msg: "Conversation deleted successfully" });
  } catch (error) {
    console.error("❌ DeleteConversation Error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};