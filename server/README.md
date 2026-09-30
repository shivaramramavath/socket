# Server Implementation Guide

Complete Node.js Socket.io server with JWT authentication for the React chat application.

## Features

✅ **JWT Authentication**

- Token-based authentication
- Login endpoint with email/password
- Token refresh mechanism
- 24-hour token expiration

✅ **Real-Time Chat**

- Socket.io for instant messaging
- Message history (last 100 messages)
- Online user tracking
- User join/leave notifications

✅ **REST API**

- Login endpoint (`POST /api/login`)
- Token refresh (`POST /api/refresh-token`)
- User list (`GET /api/users`)
- Health check (`GET /api/health`)

✅ **Error Handling**

- Token validation
- Connection errors
- Message validation
- Graceful shutdown

## Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create `.env` file (already created):

```env
PORT=5000
ACCESS_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
```

### 3. Start Server

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Login - POST /api/login

Authenticate user and receive JWT token.

**Request:**

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Response (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Test Credentials:**

- Email: `test@example.com` | Password: `password123`
- Email: `user@example.com` | Password: `password123`
- Email: `alice@example.com` | Password: `password123`

### Refresh Token - POST /api/refresh-token

Get a new token using an existing token.

**Request:**

```bash
curl -X POST http://localhost:5000/api/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Users - GET /api/users

Get list of available test users.

**Request:**

```bash
curl http://localhost:5000/api/users
```

**Response (200 OK):**

```json
{
  "success": true,
  "count": 3,
  "users": [
    {
      "id": "1",
      "email": "test@example.com",
      "name": "Test User"
    },
    {
      "id": "2",
      "email": "user@example.com",
      "name": "John Doe"
    },
    {
      "id": "3",
      "email": "alice@example.com",
      "name": "Alice"
    }
  ]
}
```

### Health Check - GET /api/health

Check server status.

**Request:**

```bash
curl http://localhost:5000/api/health
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-02-04T10:30:45.000Z"
}
```

## Socket.io Events

### Client → Server Events

#### send_message

Send a chat message.

```javascript
socket.emit(
  "send_message",
  {
    message: "Hello everyone!",
    sender: "John",
    timestamp: new Date().toISOString(),
  },
  (response) => {
    console.log("Message sent:", response);
    // { success: true, messageId: 1234567890 }
  },
);
```

**Message Object:**

```javascript
{
  message: "Text of the message",
  sender: "User Name" // Optional, server will use auth name
}
```

#### user_typing

Send typing indicator.

```javascript
socket.emit("user_typing", {
  isTyping: true,
});
```

#### request_history

Request message history.

```javascript
socket.emit("request_history", {
  limit: 50, // Optional, default 50
});
```

#### request_users

Request list of online users.

```javascript
socket.emit("request_users");
```

#### message_read

Mark message as read.

```javascript
socket.emit("message_read", {
  messageId: 1234567890,
});
```

### Server → Client Events

#### receive_message

Receive a message from any user.

```javascript
socket.on("receive_message", (messageData) => {
  console.log("New message:", messageData);
  // {
  //   id: 1234567890,
  //   message: "Hello everyone!",
  //   sender: "John Doe",
  //   userId: "2",
  //   userEmail: "john@example.com",
  //   socketId: "abc123def456",
  //   timestamp: "2024-02-04T10:30:45.000Z",
  //   type: "message"
  // }
});
```

#### user_joined

User joined the chat.

```javascript
socket.on("user_joined", (data) => {
  console.log(data.userName + " joined");
  // {
  //   socketId: "abc123def456",
  //   userId: "2",
  //   userName: "John Doe",
  //   message: "John Doe joined the chat",
  //   timestamp: "2024-02-04T10:30:45.000Z"
  // }
});
```

#### user_left

User left the chat.

```javascript
socket.on("user_left", (data) => {
  console.log(data.userName + " left");
  // {
  //   socketId: "abc123def456",
  //   userId: "2",
  //   userName: "John Doe",
  //   message: "John Doe left the chat",
  //   timestamp: "2024-02-04T10:30:45.000Z"
  // }
});
```

#### online_users

List of currently online users.

```javascript
socket.on("online_users", (users) => {
  console.log("Online users:", users);
  // [
  //   {
  //     socketId: "abc123",
  //     userId: "1",
  //     userName: "Test User",
  //     userEmail: "test@example.com",
  //     connectedAt: "2024-02-04T10:30:00.000Z",
  //     lastActivity: "2024-02-04T10:30:45.000Z"
  //   },
  //   ...
  // ]
});
```

#### message_history

Message history loaded.

```javascript
socket.on("message_history", (messages) => {
  console.log("Message history:", messages);
  // Array of message objects
});
```

#### user_typing

User is typing.

```javascript
socket.on("user_typing", (data) => {
  if (data.isTyping) {
    console.log(data.userName + " is typing...");
  }
  // {
  //   userId: "2",
  //   userName: "John Doe",
  //   isTyping: true,
  //   timestamp: "2024-02-04T10:30:45.000Z"
  // }
});
```

#### message_read

Message was read by a user.

```javascript
socket.on("message_read", (data) => {
  console.log("Message read:", data.messageId);
  // {
  //   messageId: 1234567890,
  //   userId: "2",
  //   timestamp: "2024-02-04T10:30:45.000Z"
  // }
});
```

## File Structure

```
server/
├── server.js                 # Main server file
├── socket/
│   ├── chat.socket.js       # Chat event handlers
│   └── middleware/
│       └── auth.js          # JWT authentication middleware
├── package.json             # Dependencies
├── .env                      # Environment variables
├── .gitignore               # Git ignore
└── README.md                # This file
```

## Socket Authentication Flow

1. **Client sends token with socket connection**

   ```javascript
   socket = io("http://localhost:5000", {
     auth: {
       token: "JWT_TOKEN_HERE",
     },
   });
   ```

2. **Server verifies token in middleware**

   ```javascript
   io.use(authMiddleware);
   ```

3. **Middleware validates JWT and stores user info**

   ```javascript
   socket.user = {
     id: decoded.id,
     email: decoded.email,
     name: decoded.name,
   };
   ```

4. **Connection established with authenticated user**
   ```javascript
   io.on("connection", (socket) => {
     // socket.user is now available
   });
   ```

## Error Codes

| Error         | Meaning                           |
| ------------- | --------------------------------- |
| NO_TOKEN      | Token not provided in socket auth |
| TOKEN_EXPIRED | JWT token has expired             |
| INVALID_TOKEN | JWT token is malformed or invalid |
| UNAUTHORIZED  | Authentication failed             |

## Testing

### Test with cURL

```bash
# Get test users
curl http://localhost:5000/api/users

# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

echo $TOKEN

# Refresh token
curl -X POST http://localhost:5000/api/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\"}"

# Health check
curl http://localhost:5000/api/health
```

### Test Socket Connection

Open browser console and run:

```javascript
// Use the token from login
const token = "your-jwt-token-here";

const socket = io("http://localhost:5000", {
  auth: {
    token: token,
  },
});

socket.on("connect", () => {
  console.log("Connected!");

  // Send a message
  socket.emit(
    "send_message",
    {
      message: "Hello from browser!",
    },
    (response) => {
      console.log("Response:", response);
    },
  );
});

socket.on("receive_message", (data) => {
  console.log("Received:", data);
});

socket.on("user_joined", (data) => {
  console.log("User joined:", data);
});
```

## Deployment

### Vercel (Recommended)

1. Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

2. Deploy:

```bash
vercel
```

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t chat-server .
docker run -p 5000:5000 \
  -e ACCESS_SECRET=your-secret \
  chat-server
```

### Traditional VPS/Cloud

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <repo-url>
cd socket/server

# Install dependencies
npm install

# Create .env file
nano .env
# Set appropriate values

# Install PM2 for process management
npm install -g pm2

# Start server
pm2 start server.js --name "chat-server"
pm2 save
pm2 startup
```

## Monitoring

### Check server status

```bash
curl http://localhost:5000/api/health
```

### View logs

```bash
npm run dev  # Development logs
tail -f ~/.pm2/logs/chat-server-error.log  # PM2 logs
```

### Monitor connections

```javascript
// Add this to server.js for monitoring
setInterval(() => {
  console.log("Connected users:", connectedUsers.size);
  console.log("Messages in history:", messageHistory.length);
}, 60000); // Every minute
```

## Security Considerations

⚠️ **For Production:**

1. **Database Integration**
   - Replace mock user array with real database (MongoDB, PostgreSQL)
   - Store hashed passwords using bcrypt

2. **Environment Variables**
   - Change `ACCESS_SECRET` to a strong random string
   - Never commit `.env` to git

3. **HTTPS/SSL**
   - Enable SSL certificate for production
   - Update CORS origin to use https://

4. **Rate Limiting**

   ```javascript
   const rateLimit = require("express-rate-limit");
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
   });
   app.use("/api/", limiter);
   ```

5. **Input Validation**

   ```javascript
   const validator = require("validator");
   if (!validator.isEmail(email)) {
     return res.status(400).json({ error: "Invalid email" });
   }
   ```

6. **CORS Security**
   - Whitelist specific origins
   - Avoid using `*` in production

7. **Token Security**
   - Implement refresh tokens
   - Set shorter expiration times
   - Revoke tokens when needed

## Troubleshooting

### "Cannot connect"

- Ensure server is running (`npm run dev`)
- Check if port 5000 is available
- Verify firewall settings

### "Authentication error"

- Token may be expired or invalid
- Check token format is correct
- Verify ACCESS_SECRET matches client

### "Message not received"

- Check socket connection status
- Verify message event names match
- Check browser console for errors

### "CORS error"

- Verify origin in corsOptions matches client URL
- Check credentials: true is set
- Test with curl first

## Database Integration Example

Replace mock users with MongoDB:

```javascript
import mongoose from "mongoose";

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // bcrypt hashed
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Update login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Compare password with bcrypt
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Generate token
  const token = jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    ACCESS_SECRET,
  );
  res.json({ success: true, token, user });
});
```

---

**Status**: ✅ Ready to use
**Last Updated**: February 4, 2026
