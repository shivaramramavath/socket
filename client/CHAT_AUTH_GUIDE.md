# React Socket.io Chat with Token Authentication

A modern, real-time chat application built with React and Socket.io featuring JWT token-based authentication.

## Features

✅ **Token-Based Authentication**

- Email & Password login with JWT token generation
- Direct token input option for existing tokens
- Secure token storage in localStorage
- Automatic token refresh handling

✅ **Real-Time Messaging**

- Socket.io integration for instant message delivery
- Live connection status indicator
- Auto-scroll to latest messages
- Typing indicators (ready to implement)

✅ **Modern UI/UX**

- Beautiful gradient design with animations
- Responsive layout for mobile & desktop
- Smooth transitions and loading states
- Message bubbles with sender info & timestamps

✅ **User Experience**

- Auto-logout with session management
- Connection status monitoring
- Error handling and user feedback
- Keyboard shortcuts (Shift+Enter for new line)

## Project Structure

```
client/
├── src/
│   ├── auth/
│   │   ├── LoginForm.jsx      # Token authentication component
│   │   └── LoginForm.css      # Login page styling
│   ├── chat/
│   │   ├── Chat.jsx           # Main chat container
│   │   ├── Chat.css           # Chat styling
│   │   ├── Messages.jsx       # Message display component
│   │   ├── Messages.css       # Messages styling
│   │   ├── Input.jsx          # Message input component
│   │   └── Input.css          # Input styling
│   ├── socket/
│   │   └── useSocket.js       # Socket.io hook with token auth
│   ├── App.jsx                # Main app with auth state
│   ├── App.css                # App styling
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## Installation

```bash
cd client
npm install
npm run dev
```

## Configuration

### Socket.io Connection

The socket connection automatically includes the token in the auth header:

```javascript
socket = io("http://localhost:5000", {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: token, // JWT token passed here
  },
});
```

### Server Endpoint

Login endpoint for token generation:

```
POST http://localhost:5000/api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

## Login Methods

### 1. Email & Password

- Users enter credentials
- Server validates and returns JWT token
- Token stored in localStorage
- Auto-login on page refresh

### 2. Token Input

- Paste existing JWT token
- Direct authentication without server login
- Useful for testing with pre-generated tokens

## Socket Events

### Client → Server

- `send_message` - Send a new message
- `disconnect` - User leaves chat

### Server → Client

- `message` - Receive message confirmation
- `receive_message` - Receive messages from others
- `connect` - Socket connection established
- `disconnect` - Socket disconnection

## Message Structure

```javascript
{
  message: "Hello there!",
  sender: "Username",
  timestamp: "2024-02-04T10:30:45Z",
  userId: "socket-id"
}
```

## Authentication Flow

1. **Login Page** → User enters email/password or token
2. **Token Validation** → Server validates credentials/token
3. **Storage** → Token saved in localStorage
4. **Socket Connection** → Token sent with socket.io handshake
5. **Server Verification** → Server validates token on socket connection
6. **Chat Access** → User gains access to chat room

## Features to Add

- [ ] User typing indicators
- [ ] Read receipts
- [ ] User presence/online status
- [ ] Message editing & deletion
- [ ] File sharing
- [ ] Multiple chat rooms
- [ ] User profiles
- [ ] Message search
- [ ] Notifications

## API Requirements

### Login Endpoint

```
POST /api/login
Headers: Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}

Response (401 Unauthorized):
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Socket.io Middleware

Server should verify token before accepting socket connection:

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  // Verify JWT token
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = decoded.id;
    next();
  });
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Styling

The app uses:

- **Gradient**: Linear gradient from purple (#667eea) to pink (#764ba2)
- **Typography**: Segoe UI, Tahoma, Geneva, Verdana
- **Layout**: Flexbox for responsive design
- **Animations**: CSS keyframes for smooth transitions

## Troubleshooting

### Connection Issues

- Check if server is running on localhost:5000
- Verify CORS settings on server
- Check browser console for errors

### Token Issues

- Token may be expired (regenerate)
- Malformed JWT (check server validation)
- Check localStorage in DevTools

### Message Not Sending

- Verify socket connection (green indicator)
- Check socket event names match server
- Review browser console for errors

## Environment Variables

Create `.env` file in client root (optional):

```
VITE_SERVER_URL=http://localhost:5000
```

Update socket connection:

```javascript
socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000", {
  // ...
});
```

## License

MIT

## Support

For issues or questions, check:

1. Browser console for error messages
2. Network tab for API/socket issues
3. Server logs for backend errors
