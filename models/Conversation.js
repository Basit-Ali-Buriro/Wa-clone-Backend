import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  ],
  isGroup: { type: Boolean, default: false },
  groupName: { type: String },
  groupAvatar: { type: String },
  groupAdmins: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ], // ✅ Changed from single admin → multiple admins
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ New field
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
