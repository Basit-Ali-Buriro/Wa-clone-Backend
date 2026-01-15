# 💬 WhatsApp Clone Backend

A production-ready, full-featured WhatsApp clone backend built with **Node.js**, **Express**, **MongoDB**, **Socket.IO**, **Cloudinary**, and **Google Gemini AI**. This backend powers a real-time messaging application with support for 1-to-1 chats, group conversations, media uploads, AI chat assistant, and intelligent auto-reply features.

## 🚀 Features

### 🔐 Authentication & Security
- User registration and login with JWT authentication
- Secure HTTP-only cookies with proper CSRF protection (`secure: true`, `sameSite: "None"`)
- Token-based authorization for all protected routes
- Password hashing using bcryptjs (10 salt rounds)
- 7-day token expiration
- **Participant-level authorization** for all message operations (NEW ✅)
- All operations verify user is a conversation participant before allowing access

### 💬 Messaging Features
- **Text Messages**: Send and receive text messages in real-time
- **Media Messages**: Upload and share photos/videos via Cloudinary (50MB limit)
- **Message Editing**: Edit sent messages with timestamp tracking
- **Delete Options**: 
  - Delete for self (soft delete - message remains for others)
  - Delete for everyone (hard delete - sender only)
- **Reply Feature**: Reply to specific messages with context preservation
- **Forward Messages**: Forward messages to other conversations
- **Emoji Reactions**: React to messages with emojis (add/remove/toggle)
- **Seen Status**: Track which users have seen messages
- **Message Search**: Search messages within conversations or globally
- **Authorization**: All message operations verify user is a conversation participant (NEW ✅)

### 👥 Conversation Management
- **1-to-1 Chat**: Create private conversations between two users
- **Group Chats**: Create group conversations with multiple participants
- **Participant Management**: Add or remove participants from groups (admin-only)
- **Multi-Admin Support**: Groups can have multiple administrators
- **Admin Controls**: Change group admins, rename groups, update avatars
- **Last Message Tracking**: Automatic updates of the last message in conversations
- **Conversation Listing**: Fetch all user conversations sorted by last activity
- **Prevent Duplicates**: Checks for existing 1-to-1 conversations before creating new ones

### 📤 File Upload & Media
- Seamless integration with Cloudinary
- Automatic upload of images (JPEG, PNG, WebP, etc.)
- Video upload support (MP4, MOV, AVI, etc.)
- Auto-detection of file types
- Secure URL generation
- 50MB file size limit
- Organized folder structure in Cloudinary (`chat_uploads/`)
- Custom filename generation with timestamps
- **Media stored as array structure** for flexibility and multiple attachments (NEW ✅)

### ⚡ Real-Time Features (Socket.IO)
- **Instant Message Delivery**: Real-time message broadcasting with authorization
- **Online Status Tracking**: Track online/offline users across multiple devices
- **Typing Indicators**: Show when users are typing (start/stop)
- **Multi-Device Support**: Users can connect from multiple devices simultaneously
- **Real-Time Updates**: Edit, delete, and reaction updates in real-time
- **Room-Based Broadcasting**: Messages sent only to authorized conversation participants
- **JWT Socket Authentication**: Secure WebSocket connections with token verification
- **Automatic Reconnection**: Built-in reconnection logic
- **Error Handling**: Comprehensive error events for client-side handling
- **Participant Authorization**: All socket events verify user participation (NEW ✅)

### 🤖 AI Features (Google Gemini) - NEW ✅
- **AI Chat Assistant**: Chat with AI using Google Gemini 2.5 Flash
- **Smart Auto-Reply**: Automatically reply to messages when offline using AI
- **Conversation Context**: AI maintains conversation history for contextual responses
- **Tone Customization**: Choose from 3 reply modes:
  - **Friendly**: Warm, conversational with emojis 😊
  - **Professional**: Formal, clear, and concise
  - **Funny**: Witty and humorous with jokes 😄
- **Smart Suggestions**: Get AI-powered quick reply suggestions based on conversation
- **Auto-Reply Settings**: Enable/disable and configure per-user preferences
- **Offline Detection**: Auto-replies only trigger when user is offline
- **2-Second Delay**: Natural response timing for realistic auto-replies

### 📞 Call Features (NEW)
- **Voice Calls**: Real-time voice calling using WebRTC
- **Video Calls**: HD video calling with camera switching
- **Call States**: 
  - Ringing
  - Accepted
  - Connected
  - Ended
  - Missed
  - Rejected
  - Busy
- **WebRTC Signaling**: Full peer-to-peer connection setup
  - SDP offer/answer exchange
  - ICE candidate exchange
  - Multi-device support
- **Call Management**:
  - Initiate calls (voice/video)
  - Accept/reject incoming calls
  - End active calls
  - Handle missed calls
  - Busy state detection
- **Call History**: Track all calls with duration and type (via Call model)
- **Call Security**:
  - JWT authentication required
  - Participant verification
  - Online status validation
- **Error Handling**:
  - Connection loss recovery
  - Device permission handling
  - User offline detection
  - Call timeout management

## 🛠️ Technologies Used

### Backend Framework & Runtime
- **Node.js** - JavaScript runtime environment
- **Express.js v5.1.0** - Fast, minimalist web framework
- **ES Modules** - Modern JavaScript module system

### Database
- **MongoDB** - NoSQL document database
- **Mongoose v8.19.1** - Elegant MongoDB object modeling

### Real-Time Communication
- **Socket.IO v4.8.1** - Real-time bidirectional event-based communication

### AI & Machine Learning
- **Google Generative AI v0.24.1** - Gemini 2.5 Flash for chat and auto-reply

### File Storage & Upload
- **Cloudinary v1.37.2** - Cloud-based media management
- **Multer v2.0.2** - File upload middleware
- **Multer-Storage-Cloudinary v4.0.0** - Cloudinary storage for Multer

### Authentication & Security
- **JSON Web Token v9.0.2** - Secure token-based authentication
- **bcryptjs v3.0.2** - Password hashing
- **Cookie Parser v1.4.7** - Parse cookies

## 📁 Project Structure

```
whatsapp-clone-backend/
├── config/
│   ├── cloudinary.js       # Cloudinary configuration
│   ├── db.js                # MongoDB connection
│   └── gemini.js            # Google Gemini AI setup
├── controllers/
│   ├── authControllers.js  # Authentication logic
│   ├── conversationControllers.js  # Conversation management
│   ├── messageControllers.js       # Message operations
│   └── aiControllers.js            # AI features (NEW)
├── middleware/
│   ├── authMiddleware.js   # JWT verification
│   └── upload.js            # Multer/Cloudinary upload
├── models/
│   ├── User.js              # User schema (with autoReply settings)
│   ├── Conversation.js      # Conversation schema
│   ├── Message.js           # Message schema (with media array)
│   └── Call.js              # Call schema (NEW)
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── conversationRoutes.js # Conversation endpoints
│   ├── messageRoutes.js     # Message endpoints
│   ├── userRoutes.js        # User search & profile endpoints (NEW)
│   └── aiRoutes.js          # AI endpoints (NEW)
├── socket/
│   ├── index.js             # Socket.IO setup & auth
│   ├── messageHandlers.js   # Real-time message handlers (with auto-reply)
│   └── callHandlers.js      # Real-time call/WebRTC handlers (NEW)
├── server.js                # Application entry point
└── package.json
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB database (Local or MongoDB Atlas)
- Cloudinary account (for media storage)
- Google Gemini API key (for AI features)
- TURN server (optional, for WebRTC NAT traversal)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd whatsapp-clone-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Optional: Frontend URL for CORS
CLIENT_URL=http://localhost:5173

# Optional: TURN Server (for WebRTC calls behind NAT/firewalls)
# TURN_SERVER_URL=turn:your-server:3478
# TURN_USERNAME=username
# TURN_PASSWORD=password
```

### 4. Run the server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://0.0.0.0:5000`

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |

**Example Request (Register):**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Example Response:**
```json
{
  "msg": "Registration successful",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "",
    "bio": "Hey there! I'm using ChatApp."
  }
}
```

### Conversation Routes (`/api/conversations`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all user conversations | Yes |
| POST | `/` | Create 1-to-1 conversation | Yes |
| POST | `/group` | Create group conversation | Yes |
| PUT | `/:id/participants/add` | Add participants to group | Yes (Admin) |
| PUT | `/:id/participants/remove` | Remove participants | Yes (Admin) |
| PUT | `/:id/admin` | Change group admin | Yes (Admin) |
| PUT | `/:id/rename` | Rename group | Yes (Admin) |
| PUT | `/:id/avatar` | Change group avatar | Yes (Admin) |

### Message Routes (`/api/messages`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Send message (text/media) | Yes (Participant) |
| GET | `/:conversationId` | Get conversation messages | Yes (Participant) |
| PUT | `/:id/edit` | Edit message | Yes (Sender & Participant) |
| DELETE | `/:id/deleteForMe` | Delete message for self | Yes (Participant) |
| DELETE | `/:id/deleteForEveryone` | Delete for everyone | Yes (Sender & Participant) |
| POST | `/reply` | Reply to message | Yes (Participant) |
| POST | `/forward/:id` | Forward message | Yes (Participant of both) |
| POST | `/react` | Add/remove emoji reaction | Yes (Participant) |

**Example Request (Send Message):**
```json
POST /api/messages
{
  "conversationId": "conv123",
  "text": "Hello, how are you?"
}
```

**Example Request (Send Media):**
```
POST /api/messages
Content-Type: multipart/form-data

conversationId: conv123
text: Check out this photo!
media: [file upload]
```

### User Routes (`/api/users`) - NEW ✅

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/search?query=name` | Search users by name/email | Yes |
| GET | `/search` | Get all users (empty query) | Yes |
| GET | `/:userId` | Get user profile by ID | Yes |
| PUT | `/profile` | Update own profile | Yes |

**Example Request (Search Users):**
```json
GET /api/users/search?query=john
```

**Example Request (Get All Users):**
```json
GET /api/users/search
```

**Example Request (Update Profile):**
```json
PUT /api/users/profile
{
  "name": "John Doe",
  "bio": "Hey there! I'm using ChatApp.",
  "avatarUrl": "https://cloudinary.com/..."
}
```

### AI Routes (`/api/ai`) - NEW ✅

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chat` | Chat with AI assistant | Yes |
| GET | `/auto-reply` | Get auto-reply settings | Yes |
| PUT | `/auto-reply` | Update auto-reply settings | Yes |
| GET | `/suggestions/:conversationId` | Get smart reply suggestions | Yes |

**Example Request (Chat with AI):**
```json
POST /api/ai/chat
{
  "prompt": "Help me write a professional email",
  "conversationHistory": [
    { "sender": "User", "text": "I need help" },
    { "sender": "AI", "text": "How can I help you?" }
  ]
}
```

**Example Request (Update Auto-Reply):**
```json
PUT /api/ai/auto-reply
{
  "enabled": true,
  "mode": "friendly"
}
```

**Example Response (Smart Suggestions):**
```json
GET /api/ai/suggestions/conv123
{
  "suggestions": [
    "Sounds great! When should we meet?",
    "Thanks for letting me know",
    "I'll get back to you soon"
  ]
}
```

### Call Routes (`/api/calls`) - NEW

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Initiate a voice/video call | Yes |
| POST | `/accept` | Accept an incoming call | Yes |
| POST | `/reject` | Reject an incoming call | Yes |
| POST | `/end` | End an ongoing call | Yes |
| POST | `/webrtc/offer` | Send WebRTC offer | Yes |
| POST | `/webrtc/answer` | Send WebRTC answer | Yes |
| POST | `/webrtc/ice-candidate` | Send ICE candidate | Yes |

**Note**: Call routes are handled via Socket.IO events. See [Socket.IO Events](#-socketio-events) section for WebRTC implementation details.

**Example Request (Initiate Call):**
```json
POST /api/calls
{
  "recipientId": "user456",
  "callType": "video"
}
```

**Example Request (Accept Call):**
```json
POST /api/calls/accept
{
  "callId": "call789"
}
```

**Example Request (Send WebRTC Offer):**
```json
POST /api/calls/webrtc/offer
{
  "recipientId": "user456",
  "offer": "v=0..."
}
```

**Note**: These examples show REST API format, but calls are primarily handled via Socket.IO for real-time communication. See the Socket.IO events section below.

## 🔌 Socket.IO Events

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `send-message` | `{ conversationId, text, media }` | Send a new message |
| `message-edited` | `{ messageId, newText }` | Edit existing message |
| `message-deleted` | `{ messageId, deleteType }` | Delete message |
| `message-reaction` | `{ messageId, emoji }` | Add/remove emoji reaction |
| `typing-started` | `conversationId` | User starts typing |
| `typing-stopped` | `conversationId` | User stops typing |
| `join-conversation` | `conversationId` | Join conversation room |
| `leave-conversation` | `conversationId` | Leave conversation room |
| `call:initiate` | `{ recipientId, callType, conversationId }` | Start a new call |
| `call:accept` | `{ callerId }` | Accept incoming call |
| `call:reject` | `{ callerId, reason }` | Reject incoming call |
| `call:end` | `{ recipientId }` | End ongoing call |
| `call:no-answer` | `{ recipientId }` | Handle call timeout |
| `call:busy` | `{ callerId }` | Notify caller user is busy |
| `webrtc:offer` | `{ recipientId, offer }` | Send WebRTC offer |
| `webrtc:answer` | `{ recipientId, answer }` | Send WebRTC answer |
| `webrtc:ice-candidate` | `{ recipientId, candidate }` | Send ICE candidate |

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `new-message` | `{ message, conversationId, isAutoReply? }` | New message received |
| `message-updated` | `{ message, conversationId }` | Message edited or reacted |
| `message-removed` | `{ messageId, conversationId }` | Message deleted |
| `user-typing` | `{ userId, conversationId, userInfo }` | User is typing |
| `user-stopped-typing` | `{ userId, conversationId }` | User stopped typing |
| `update-online-users` | `[userIds]` | Online users list updated |
| `message-error` | `{ error }` | Error occurred |
| `call:incoming` | `{ callId, callerId, callerName, callerAvatar, callType, conversationId }` | Receive incoming call |
| `call:ringing` | `{ recipientId, status }` | Call is ringing |
| `call:accepted` | `{ recipientId, recipientName, recipientAvatar }` | Call was accepted |
| `call:rejected` | `{ recipientId, reason }` | Call was rejected |
| `call:ended` | `{ userId, reason }` | Call has ended |
| `call:missed` | `{ callerId, callerName }` | Call was missed |
| `call:busy` | `{ recipientId, message }` | User is busy |
| `call:error` | `{ error }` | Call error occurred |
| `webrtc:offer` | `{ senderId, offer }` | Receive WebRTC offer |
| `webrtc:answer` | `{ senderId, answer }` | Receive WebRTC answer |
| `webrtc:ice-candidate` | `{ senderId, candidate }` | Receive ICE candidate |

### Socket Authentication
Socket connections require JWT authentication via:
1. Cookie header: `cookie: "token=your_jwt_token"`
2. Or auth handshake: `socket.handshake.auth.token = "your_jwt_token"`

## 📊 Database Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  avatarUrl: String,
  bio: String (default: "Hey there! I'm using ChatApp."),
  lastSeen: Date,
  status: String (enum: online/offline/away),
  autoReply: {
    enabled: Boolean (default: false),
    mode: String (enum: friendly/professional/funny, default: "friendly")
  },
  timestamps: true
}
```

### Conversation Model
```javascript
{
  participants: [ObjectId] (required),
  isGroup: Boolean (default: false),
  groupName: String,
  groupAvatar: String,
  groupAdmins: [ObjectId],
  createdBy: ObjectId,
  lastMessage: ObjectId (ref: Message),
  timestamps: true
}
```

### Message Model
```javascript
{
  sender: ObjectId (required, ref: User),
  conversation: ObjectId (required, ref: Conversation),
  text: String,
  media: [
    {
      url: String,
      type: String (enum: image/video/audio/file)
    }
  ],
  replyTo: ObjectId (ref: Message),
  forwarded: Boolean (default: false),
  forwardedFrom: ObjectId (ref: User),
  seenBy: [ObjectId] (ref: User),
  reactions: [
    {
      user: ObjectId (ref: User),
      emoji: String
    }
  ],
  isEdited: Boolean (default: false),
  editedAt: Date,
  deletedBy: [ObjectId] (ref: User),
  isDeletedForEveryone: Boolean (default: false),
  deletedAt: Date,
  timestamps: true
}
```

### Call Model
```javascript
{
  caller: ObjectId (required, ref: User),
  recipient: ObjectId (required, ref: User),
  type: String (enum: voice/video),
  status: String (enum: ringing/connected/ended/missed/rejected),
  startTime: Date (default: Date.now),
  endTime: Date,
  duration: Number (in seconds),
  endReason: String (enum: completed/cancelled/missed/error),
  timestamps: true
}
```
### 📞 WebRTC Call Features

**Implementation Details**:
- All call signaling is handled via Socket.IO events (see above)
- WebRTC peer connections are established on the client side
- Backend serves as signaling server for SDP and ICE exchange
- Call records are stored in MongoDB via the Call model

**Client-Side Implementation Flow**:
1. User A initiates call → `call:initiate` event
2. User B receives → `call:incoming` event  
3. User B accepts → `call:accept` event
4. WebRTC negotiation:
   - User A sends offer → `webrtc:offer`
   - User B sends answer → `webrtc:answer`
   - Both exchange ICE candidates → `webrtc:ice-candidate`
5. Peer-to-peer connection established
6. Either user ends call → `call:end` event

**Features Available**:
- ✅ Voice calls
- ✅ Video calls
- ✅ Call state management (ringing, accepted, ended, etc.)
- ✅ Multi-device support
- ✅ Online status validation
- ✅ Missed call tracking
- ✅ Busy state handling
- ✅ Call history via Call model

**Not Included** (Client-Side Responsibility):
- Media stream management (getUserMedia)
- RTCPeerConnection setup
- Mute/unmute controls
- Video on/off toggle
- Screen sharing
- Call duration timer
- UI for call interface

### Socket Events for Calls

**Initiating a Call**:
```javascript
// Call Management
socket.emit('call:initiate', { recipientId, callType: 'video', conversationId });
socket.emit('call:accept', { callerId });
socket.emit('call:reject', { callerId, reason: 'busy' });
socket.emit('call:end', { recipientId });
socket.emit('call:no-answer', { recipientId });
socket.emit('call:busy', { callerId });

// WebRTC Signaling
socket.emit('webrtc:offer', { recipientId, offer });
socket.emit('webrtc:answer', { recipientId, answer });
socket.emit('webrtc:ice-candidate', { recipientId, candidate });

// Listening for Call Events
socket.on('call:incoming', ({ callId, callerId, callerName, callType }) => {
  // Show incoming call UI
});

socket.on('call:accepted', ({ recipientId, recipientName }) => {
  // Start WebRTC negotiation
});

socket.on('webrtc:offer', ({ senderId, offer }) => {
  // Create answer and send back
});
```

### Helper Functions
```javascript
// User Socket Management (Multi-device support)
const getUserSockets = (userId) => {
  return onlineUsers.get(userId) || new Set();
};

// Broadcast to all user's devices
getUserSockets(userId).forEach((socketId) => {
  io.to(socketId).emit('event-name', data);
});

// Validation
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Authorization
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

// Online Status
const isUserOnline = (userId) => {
  const userSockets = getUserSockets(userId);
  return userSockets.size > 0;
};
```

## 🤖 AI Auto-Reply Usage

### How Auto-Reply Works

1. **User enables auto-reply** in their settings:
   ```json
   PUT /api/ai/auto-reply
   {
     "enabled": true,
     "mode": "friendly"
   }
   ```

2. **Someone sends them a message** while they're offline

3. **AI generates a contextual response** based on:
   - Recent conversation history (last 5 messages)
   - User's preferred tone (friendly/professional/funny)
   - User's name and profile
   - Current conversation context

4. **Auto-reply is sent after 2 seconds** (simulates natural response time)

5. **Message is marked as auto-reply** (`isAutoReply: true`) for clarity

### Auto-Reply Modes

- **Friendly** 😊: "Hey! I'm away right now, but I'll get back to you soon! 😊"
- **Professional** 💼: "I am currently unavailable. I will respond to your message as soon as possible."
- **Funny** 😄: "I'm probably busy doing something awesome! I'll hit you back when I'm done! 😄"

### Smart Suggestions

Get AI-powered quick reply suggestions:
```javascript
GET /api/ai/suggestions/:conversationId

// Response:
{
  "suggestions": [
    "That sounds great!",
    "Let me think about it",
    "I'll get back to you"
  ]
}
```

## 🔒 Security Features

### Authorization & Authentication
- ✅ All message operations verify conversation participation
- ✅ Socket events check user authorization before processing
- ✅ JWT tokens with secure cookies (`httpOnly: true`, `secure: true`, `sameSite: "None"`)
- ✅ Password hashing with bcryptjs
- ✅ Protected routes with authMiddleware
- ✅ Sender verification for edit/delete operations
- ✅ Admin verification for group management

### Data Protection
- ✅ Participant-level access control on all operations
- ✅ Admin-only group management operations
- ✅ Sender-only message editing and deletion
- ✅ Soft delete support (messages remain for others)
- ✅ Media files stored securely on Cloudinary
- ✅ No user can access conversations they're not part of

## 🐛 Critical Bug Fixes (Latest Update)

### Security & Authorization Fixes ✅
1. **Authorization Bypass Fixed**: Added participant verification to ALL message controllers and socket handlers
   - `sendMessage` - now verifies user is conversation participant
   - `getMessages` - now verifies user is conversation participant
   - `reactToMessage` - now verifies user is conversation participant
   - `editMessage` - now verifies user is conversation participant
   - `deleteMessageForMe` - now verifies user is conversation participant
   - `deleteMessageForEveryone` - now verifies user is conversation participant
   - `forwardMessage` - now verifies user is participant of both conversations
   - All socket events (`send-message`, `message-edited`, `message-deleted`, `message-reaction`, `typing-started`, `typing-stopped`) now verify participation

2. **Media Schema Fixed**: Aligned all controllers and socket handlers with Message model's `media` array structure
   - Changed from single `mediaUrl` field to `media: [{ url, type }]` array
   - Updated all populate operations to use `media` instead of `mediaUrl`
   - Fixed conversation lastMessage population

3. **Cookie Security Fixed**: Set `secure: true` for all environments
   - Fixed CSRF vulnerability with proper cookie settings
   - Cookies now work correctly with `sameSite: "None"`

### Performance & Functionality Improvements ✅
4. **Auto-Reply Integration**: Fully integrated AI-powered auto-replies with Socket.IO
5. **Smart Authorization Helper**: Created `checkParticipation()` helper function to DRY up code
6. **Enhanced Error Messages**: Better error handling with specific authorization messages

## 🧪 Testing

### Test Socket.IO Integration
```bash
node testSocket.js
```

Make sure to:
1. Replace placeholder values with real user IDs and conversation IDs
2. Update the JWT token with a valid token from login
3. Ensure MongoDB is connected

### Manual Testing Checklist
- [ ] Register and login with valid credentials
- [ ] Verify JWT token is stored in cookies
- [ ] Create 1-to-1 conversation
- [ ] Create group conversation
- [ ] Send text message
- [ ] Send media message (image/video)
- [ ] React to message with emoji
- [ ] Edit your own message
- [ ] Delete message for self
- [ ] Delete message for everyone (sender only)
- [ ] Reply to a message
- [ ] Forward message to another conversation
- [ ] Add/remove participants from group
- [ ] Test typing indicators
- [ ] Test online status tracking
- [ ] Enable AI auto-reply
- [ ] Send message to user with auto-reply enabled (while offline)
- [ ] Test AI chat assistant
- [ ] Get smart reply suggestions
- [ ] Initiate voice call
- [ ] Initiate video call
- [ ] Accept/reject incoming call
- [ ] Test WebRTC signaling (offer/answer/ICE)
- [ ] Search for users
- [ ] Update user profile

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `5000` |
| `NODE_ENV` | No | Environment | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Yes | Secret key for JWT signing | `your_secret_key_123` |
| `JWT_EXPIRE` | No | Token expiration | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret | `abc123def456` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key | `AIza...` |
| `CLIENT_URL` | No | Frontend URL for CORS | `http://localhost:5173` (default) |
| `TURN_SERVER_URL` | Optional | TURN server URL for WebRTC | `turn:your-server:3478` |
| `TURN_USERNAME` | Optional | TURN server username | `username` |
| `TURN_PASSWORD` | Optional | TURN server password | `password` |

## 🚀 Deployment

This backend is deployment-ready for multiple platforms:
- ✅ **Heroku** - Easy deployment with Procfile
- ✅ **Railway** - Git-based deployment
- ✅ **Render** - Auto-deploy from GitHub
- ✅ **AWS EC2** - Full control deployment
- ✅ **DigitalOcean** - Droplet or App Platform
- ✅ **Replit** - Instant hosting (development)
- ⚠️ **Vercel** - Limited support (serverless functions, Socket.IO requires persistent connections)

### Deployment Checklist
- [ ] Set all environment variables on your hosting platform
- [ ] Use production MongoDB instance (MongoDB Atlas recommended)
- [ ] Update `CLIENT_URL` to your frontend domain for CORS
- [ ] Ensure HTTPS is enabled (required for `secure` cookies)
- [ ] Set `NODE_ENV=production`
- [ ] Update Socket.IO CORS origin to your frontend URL
- [ ] Test all HTTP endpoints with Postman/Thunder Client
- [ ] Test Socket.IO connections with production frontend
- [ ] (Optional) Configure TURN server for WebRTC NAT traversal
- [ ] Set up monitoring and logging (PM2, Winston, etc.)

### Important Notes
- **Cookies**: Require HTTPS in production (`secure: true`)
- **CORS**: Must whitelist your frontend URL (no wildcards in production)
- **Socket.IO**: Requires WebSocket support (persistent connections)
- **WebRTC**: May need TURN server for users behind NAT/firewalls

## 📚 Frontend Integration Guide

See **[FRONTEND.md](./FRONTEND.md)** for a comprehensive guide on integrating this backend with:
- React + Tailwind CSS
- Socket.IO client setup
- Authentication flow with JWT cookies
- Real-time messaging implementation
- Media uploads with Cloudinary
- AI features (chat assistant & auto-reply)
- WebRTC call implementation
- Complete code examples and best practices

## 📖 Additional Documentation

- **[SOCKET_INTEGRATION_SUMMARY.md](./SOCKET_INTEGRATION_SUMMARY.md)** - Socket.IO setup and architecture
- **[FRONTEND.md](./FRONTEND.md)** - Frontend integration guide (if available)

## 🛠️ Tech Stack Summary

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js v18+ |
| **Framework** | Express.js v5.1.0 |
| **Database** | MongoDB + Mongoose v8.19.1 |
| **Real-Time** | Socket.IO v4.8.1 |
| **AI/ML** | Google Generative AI v0.24.1 (Gemini 2.5 Flash) |
| **File Storage** | Cloudinary v1.37.2 |
| **File Upload** | Multer v2.0.2 + Multer-Storage-Cloudinary |
| **Authentication** | JWT v9.0.2 + bcryptjs v3.0.2 |
| **Utilities** | Cookie Parser, CORS, Axios, date-fns |
| **Development** | Nodemon v3.1.10, dotenv |

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add comments for complex logic
- Test all features before submitting PR
- Update README if adding new features
- Use meaningful commit messages

## 📧 Support

For issues, questions, or feature requests:
- 📝 Open an issue on GitHub
- 🔍 Check existing issues for solutions
- 📚 Review documentation files
- 💬 Provide detailed error messages and logs when reporting bugs

## ⚖️ License

MIT License - Feel free to use this project for learning or commercial purposes!

---

**Built with ❤️ using Node.js, Express, MongoDB, Socket.IO, Cloudinary, and Google Gemini AI**

**🌟 Key Features**: Real-time messaging • AI-powered auto-reply • Group chats • Voice/Video calls • Media sharing • End-to-end message management

**Last Updated**: October 30, 2025
