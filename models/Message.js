import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    text: { type: String, default: "" },
    media: [
      {
        url: String,
        type: { type: String, enum: ["image", "video", "audio", "file"], default: "image" },
      },
    ],
    // Call information
    callInfo: {
      type: {
        type: String,
        enum: ["voice", "video"],
      },
      status: {
        type: String,
        enum: ["missed", "rejected", "completed", "cancelled"],
      },
      duration: Number, // in seconds
      callId: { type: mongoose.Schema.Types.ObjectId, ref: "Call" },
    },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    forwarded: { type: Boolean, default: false },
    forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String },
      },
    ],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeletedForEveryone: { type: Boolean, default: false },
    deletedAt: { type: Date },

    // 🔮 for future AI search / embeddings
    embedding: {
      type: [Number],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);

// Indexes for performance
messageSchema.index({ text: "text" });
messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
