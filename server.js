import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from './routes/messageRoutes.js';
import setupSocket from "./socket/index.js";
import aiRoutes from "./routes/aiRoutes.js";
import userRoutes from './routes/userRoutes.js';
import callRoutes from './routes/callRoutes.js';

dotenv.config();
connectDB();

// ✅ Get client URLs - support multiple domains
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://www.bytetalk.live",
  "https://bytetalk.live",
  "https://wa-frontend-zeta.vercel.app"
];

console.log('📋 Allowed CORS origins:', ALLOWED_ORIGINS);

const app = express();
app.use(express.json());
app.use(cookieParser());

// ✅ FIXED CORS CONFIGURATION - Support multiple origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Routes
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/calls", callRoutes);

app.get('/', (req, res) => {
  res.send('API working');
});

const server = http.createServer(app);

// ✅ FIXED Socket.IO CORS - Support multiple origins
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`✅ CORS enabled for origins:`, ALLOWED_ORIGINS);
});