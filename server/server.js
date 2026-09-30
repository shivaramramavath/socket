import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import initChat from "./socket/chat.socket.js";
import authMiddleware from "./socket/middleware/auth.js";

const app = express();
const server = http.createServer(app);

// Environment setup
const PORT = process.env.PORT || 5000;
const ACCESS_SECRET = process.env.ACCESS_SECRET || "your-secret-key-change-this";

// Mock database of users (replace with real DB)
const users = [
  {
    id: "1",
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  },
  {
    id: "2",
    email: "user@example.com",
    password: "password123",
    name: "John Doe",
  },
  {
    id: "3",
    email: "alice@example.com",
    password: "password123",
    name: "Alice",
  },
];

// Middleware
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions,
});

io.use(authMiddleware);

// ==================== Socket Events ====================
io.on("connection", (socket) => {
  console.log("✅ User connected:", {
    socketId: socket.id,
    userId: socket.user?.id,
    userName: socket.user?.name,
  });

  initChat(io, socket);
});

// ==================== REST API Routes ====================

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Login endpoint - generates JWT token
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  // Find user
  const user = users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: "user" },
    ACCESS_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    success: true,
    token: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

// Refresh token endpoint
app.post("/api/refresh-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  try {
    // Verify token (even if expired)
    const decoded = jwt.verify(token, ACCESS_SECRET, {
      ignoreExpiration: true,
    });

    // Generate new token
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role },
      ACCESS_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});

// Get all users (public - for testing)
app.get("/api/users", (req, res) => {
  const userList = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
  }));

  res.json({
    success: true,
    count: userList.length,
    users: userList,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ==================== Server Start ====================
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║     Chat Server Ready                  ║
  ╠════════════════════════════════════════╣
  ║ Server: http://localhost:${PORT}        ║
  ║ Client: http://localhost:5173          ║
  ║ Status: Listening for connections ✅   ║
  ╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📍 SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("📍 SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
});
