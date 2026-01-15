import express from 'express';
import {
  chatWithAI,
  updateAutoReplySettings,
  getAutoReplySettings,
  generateSmartSuggestions
} from '../controllers/aiControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', authMiddleware, chatWithAI);

router.get('/auto-reply', authMiddleware, getAutoReplySettings);
router.put('/auto-reply', authMiddleware, updateAutoReplySettings);

router.get('/suggestions/:conversationId', authMiddleware, generateSmartSuggestions);

export default router;
