# Quick Start Guide - React Socket.io Chat App

## 🎯 Get Started in 5 Minutes

### Step 1: Start the App

```bash
# Terminal 1: Client (React)
cd client
npm install
npm run dev
```

### Step 2: Open in Browser

```
http://localhost:5173
```

### Step 3: Login

Choose one of two methods:

#### Method A: Email & Password Login

1. Click "Email & Password" tab
2. Enter test credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Login"

#### Method B: Token Login

1. Click "Use Token" tab
2. Paste a valid JWT token
3. Click "Login with Token"

### Step 4: Start Chatting

- Type your message in the input field
- Press Enter or click "Send"
- Messages appear in real-time
- Connection status shows in header

---

## 🔌 Server Setup Required

Your Node.js server must provide:

### 1. Authentication Endpoint

```javascript
// server.js or routes/auth.js
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Validate credentials
  // Generate JWT token
  // Return token and user info

  res.json({
    token: "JWT_TOKEN_HERE",
    user: { id: "123", email, name: "User" },
  });
});
```

### 2. Socket.io Token Verification

```javascript
// server.js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Missing token"));
  }

  // Verify JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Invalid token"));
    socket.userId = decoded.id;
    next();
  });
});

// Handle messages
io.on("connection", (socket) => {
  socket.on("send_message", (data, callback) => {
    // Emit to all clients
    io.emit("receive_message", {
      ...data,
      userId: socket.userId,
      socketId: socket.id,
    });

    callback({ success: true });
  });
});
```

---

## 📱 UI Overview

### Login Page

- **Tab 1**: Email & Password authentication
- **Tab 2**: Direct token input
- **Features**:
  - Error messages
  - Loading states
  - Animated background

### Chat Page

**Header:**

- Chat title
- Connection status (green = connected, red = disconnected)
- Logout button

**Message Area:**

- Displays all messages
- Your messages: Right-aligned, purple
- Other messages: Left-aligned, gray
- Shows sender name and timestamp

**Input Area:**

- Text input field
- Send button
- Supports multi-line (Shift+Enter)
- Disabled when empty

---

## 🔑 API Contract

### POST /api/login

```
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Success Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}

Error Response (401):
{
  "message": "Invalid credentials"
}
```

### Socket Events

**Client → Server:**

- `send_message` - Send a message
  ```javascript
  socket.emit("send_message", {
    message: "Hello!",
    sender: "Username",
    timestamp: "ISO-8601-date",
  });
  ```

**Server → Client:**

- `receive_message` - Receive messages

  ```javascript
  socket.on("receive_message", (data) => {
    // data = { message, sender, timestamp, userId }
  });
  ```

- `message` - Message confirmation
- `connect` - Connection established
- `disconnect` - Connection lost

---

## 🎨 Customization

### Change Colors

Edit `src/App.css`:

```css
/* Current gradient: purple to pink */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your colors */
background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
```

### Change Server URL

Edit `src/socket/useSocket.js`:

```javascript
socket = io("http://localhost:5000", {
  // Change this URL
  // ...
});
```

Or use environment variable:

```javascript
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
```

### Modify Message Display

Edit `src/chat/Messages.jsx`:

```javascript
// Customize message bubble appearance
<div
  className={`message-item ${isOwnMessage ? "own-message" : "other-message"}`}
>
  {/* Modify structure here */}
</div>
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"

- ✅ Ensure Node.js server is running
- ✅ Check server URL in `useSocket.js`
- ✅ Verify CORS is enabled on server
- ✅ Check firewall settings

### "Connection status shows Disconnected"

- ✅ Verify authentication token is valid
- ✅ Check server is accepting socket connections
- ✅ Review server logs for token validation errors
- ✅ Ensure server has socket.io running

### "Messages not sending"

- ✅ Check connection status (should be green)
- ✅ Verify message is not empty
- ✅ Check server is listening for `send_message` event
- ✅ Review browser console for errors

### "Token keeps getting cleared"

- ✅ Check browser's localStorage is not disabled
- ✅ Verify token is valid JWT format
- ✅ Check for CORS issues blocking token storage
- ✅ Try in incognito/private mode

### "Page refreshes and logs out"

- ✅ This is expected if token is invalid
- ✅ Extend token expiration time on server
- ✅ Implement refresh token mechanism
- ✅ Check token validity before page load

---

## 📊 Component Hierarchy

```
App (State: token, isAuthenticated)
├── LoginForm (When not authenticated)
│   ├── Email & Password Tab
│   └── Token Input Tab
│
└── Chat (When authenticated)
    ├── Chat Header (Status, Logout)
    ├── Messages (Display messages)
    └── Input (Send message)
```

---

## 💾 Data Flow

```
1. User enters credentials/token
   ↓
2. LoginForm calls onLogin(token)
   ↓
3. App stores token in localStorage
   ↓
4. App passes token to Chat component
   ↓
5. Chat calls connect(token)
   ↓
6. Socket connects with token in auth
   ↓
7. Server verifies token
   ↓
8. Socket connection established
   ↓
9. Messages can be sent/received
```

---

## 🔒 Security Notes

- **Tokens in localStorage**: Vulnerable to XSS attacks
  - Use httpOnly cookies for production
  - Implement CSRF protection

- **Plaintext passwords**: Never transmitted
  - Always use HTTPS in production
  - Hash passwords on server

- **Socket authentication**: Token verified on every connection
  - Implement token expiration
  - Add refresh token mechanism

---

## 📚 Useful Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [JWT.io - JWT Debugger](https://jwt.io)
- [Vite Documentation](https://vitejs.dev)

---

## ✅ Checklist Before Going Live

- [ ] Server `/api/login` endpoint works
- [ ] Socket.io server verifies tokens
- [ ] CORS enabled on server
- [ ] Environment variables configured
- [ ] Error messages display properly
- [ ] Messages persist correctly
- [ ] Connection status indicator works
- [ ] Logout clears session
- [ ] Mobile layout responsive
- [ ] Page refresh maintains auth state
- [ ] SSL/HTTPS enabled in production
- [ ] Rate limiting implemented
- [ ] Database logging enabled

---

## 🚀 Deployment

### Vercel (Recommended for React)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Deploy dist folder to Netlify
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

**Ready to chat! 🎉**

Still need help? Check the detailed guide: [CHAT_AUTH_GUIDE.md](./CHAT_AUTH_GUIDE.md)
