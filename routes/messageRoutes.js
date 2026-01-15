import express from "express";
import {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
  replyToMessage,
  forwardMessage,
  reactToMessage,
} from "../controllers/messageControllers.js"

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js"; // ✅ Cloudinary + Multer upload middleware

const router = express.Router();

// 1️⃣ Send a message (text or media - image/video)
router.post("/", authMiddleware, upload.single("media"), sendMessage);

// 2️⃣ Get all messages from a conversation
router.get("/:conversationId", authMiddleware, getMessages);

// 3️⃣ Edit a message
router.put("/:id/edit", authMiddleware, editMessage);

// 4️⃣ Delete message for current user only
router.delete("/:id/deleteForMe", authMiddleware, deleteMessageForMe);

// 5️⃣ Delete message for everyone (sender only)
router.delete("/:id/deleteForEveryone", authMiddleware, deleteMessageForEveryone);

// 6️⃣ Reply to a message
router.post("/reply", authMiddleware, replyToMessage);

// 7️⃣ Forward a message to another conversation
router.post("/forward/:id", authMiddleware, forwardMessage);

// 8️⃣ React to a message with emoji
router.post("/react", authMiddleware, reactToMessage);



export default router;
