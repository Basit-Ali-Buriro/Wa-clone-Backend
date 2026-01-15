import { model } from '../config/gemini.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const TONE_PROMPTS = {
  friendly: "You are a friendly and casual chat assistant. Be warm, conversational, and use emojis occasionally. Keep responses brief (1-3 sentences).",
  professional: "You are a professional assistant. Be formal, clear, and concise. Avoid emojis and slang. Keep responses brief (1-3 sentences).",
  funny: "You are a witty and humorous assistant. Make clever jokes and puns when appropriate. Be lighthearted and fun. Keep responses brief (1-3 sentences)."
};

export const chatWithAI = async (req, res) => {
  try {
    const { prompt, conversationHistory } = req.body;
    const userId = req.user._id; 

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const user = await User.findById(userId);
    const tone = user.autoReply?.mode || 'friendly';
    const systemPrompt = TONE_PROMPTS[tone];

    let fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`;

    if (conversationHistory && conversationHistory.length > 0) {
      const historyText = conversationHistory
        .slice(-5)
        .map(msg => `${msg.sender}: ${msg.text}`)
        .join('\n');
      fullPrompt = `${systemPrompt}\n\nConversation history:\n${historyText}\n\nUser: ${prompt}`;
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text, tone });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate AI response', 
      error: error.message 
    });
  }
};

export const generateAutoReply = async (senderId, messageText, conversationId) => {
  try {
    const sender = await User.findById(senderId);
    
    if (!sender.autoReply?.enabled) {
      return null;
    }

    const tone = sender.autoReply.mode || 'friendly';
    const systemPrompt = TONE_PROMPTS[tone];

    const recentMessages = await Message.find({ 
      conversation: conversationId 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sender', 'name');

    const historyText = recentMessages
      .reverse()
      .map(msg => `${msg.sender?.name || 'User'}: ${msg.text}`)
      .join('\n');

    const fullPrompt = `${systemPrompt}\n\nYou are replying on behalf of ${sender.name}. They are currently away but have auto-reply enabled.\n\nConversation history:\n${historyText}\n\nGenerate a brief, contextual auto-reply message:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Auto-reply generation error:', error);
    return null;
  }
};

export const updateAutoReplySettings = async (req, res) => {
  try {
    const { enabled, mode } = req.body;
    const userId = req.user._id;

    if (mode && !['friendly', 'professional', 'funny'].includes(mode)) {
      return res.status(400).json({ 
        message: 'Invalid mode. Choose: friendly, professional, or funny' 
      });
    }

    const updateData = {};
    if (typeof enabled === 'boolean') updateData['autoReply.enabled'] = enabled;
    if (mode) updateData['autoReply.mode'] = mode;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('name email autoReply');

    res.json({ 
      message: 'Auto-reply settings updated', 
      autoReply: user.autoReply 
    });
  } catch (error) {
    console.error('Update auto-reply error:', error);
    res.status(500).json({ 
      message: 'Failed to update settings', 
      error: error.message 
    });
  }
};

export const getAutoReplySettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('autoReply');
    
    res.json({ autoReply: user.autoReply });
  } catch (error) {
    console.error('Get auto-reply error:', error);
    res.status(500).json({ 
      message: 'Failed to get settings', 
      error: error.message 
    });
  }
};

export const generateSmartSuggestions = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const recentMessages = await Message.find({ 
      conversation: conversationId 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sender', 'name');

    if (recentMessages.length === 0) {
      return res.json({ suggestions: [] });
    }

    const historyText = recentMessages
      .reverse()
      .map(msg => `${msg.sender?.name || 'User'}: ${msg.text}`)
      .join('\n');

    const prompt = `Based on this conversation, suggest 3 brief, contextually relevant response options (each 5-10 words):\n\n${historyText}\n\nProvide 3 numbered suggestions, one per line:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const suggestions = text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
      .slice(0, 3);

    res.json({ suggestions });
  } catch (error) {
    console.error('Smart suggestions error:', error);
    res.status(500).json({ 
      message: 'Failed to generate suggestions', 
      error: error.message 
    });
  }
};
