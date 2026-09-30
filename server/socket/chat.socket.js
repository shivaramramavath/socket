// Track connected users and their messages
const connectedUsers = new Map();
const messageHistory = [];
const MAX_HISTORY = 100; // Keep last 100 messages

const initChat = (io, socket) => {
  // ==================== User Connection ====================

  const user = socket.user;

  // Store user info
  connectedUsers.set(socket.id, {
    socketId: socket.id,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    connectedAt: new Date(),
    lastActivity: new Date(),
  });

  // Notify all clients about user joining
  io.emit("user_joined", {
    socketId: socket.id,
    userId: user.id,
    userName: user.name,
    message: `${user.name} joined the chat`,
    timestamp: new Date().toISOString(),
  });

  // Send message history to new user
  socket.emit("message_history", messageHistory);

  // Send list of online users
  socket.emit("online_users", Array.from(connectedUsers.values()));

  // ==================== Message Events ====================

  socket.on("send_message", (data, callback) => {
    try {
      const messageData = {
        id: Date.now(),
        message: data.message || "",
        sender: user.name || "Anonymous",
        userId: user.id,
        userEmail: user.email,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
        type: "message",
      };

      // Validate message
      if (!messageData.message.trim()) {
        return callback?.({
          success: false,
          message: "Message cannot be empty",
        });
      }

      // Store in history
      messageHistory.push(messageData);

      // Keep only last MAX_HISTORY messages
      if (messageHistory.length > MAX_HISTORY) {
        messageHistory.shift();
      }

      // Broadcast to all clients
      io.emit("receive_message", messageData);

      // Update last activity
      connectedUsers.set(socket.id, {
        ...connectedUsers.get(socket.id),
        lastActivity: new Date(),
      });

      // Callback to confirm message was sent
      callback?.({
        success: true,
        messageId: messageData.id,
      });

      console.log("📨 Message received:", {
        from: user.name,
        message: messageData.message.substring(0, 50),
        timestamp: messageData.timestamp,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      callback?.({
        success: false,
        message: "Failed to send message",
      });
    }
  });

  // Handle typing indicator
  socket.on("user_typing", (data) => {
    socket.broadcast.emit("user_typing", {
      userId: user.id,
      userName: user.name,
      isTyping: data.isTyping,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle read receipts
  socket.on("message_read", (data) => {
    io.emit("message_read", {
      messageId: data.messageId,
      userId: user.id,
      timestamp: new Date().toISOString(),
    });
  });

  // Request message history
  socket.on("request_history", (data) => {
    const limit = data.limit || 50;
    const history = messageHistory.slice(-limit);
    socket.emit("message_history", history);
  });

  // Get online users
  socket.on("request_users", () => {
    socket.emit("online_users", Array.from(connectedUsers.values()));
  });

  // ==================== User Disconnect ====================

  socket.on("disconnect", () => {
    const disconnectedUser = connectedUsers.get(socket.id);

    if (disconnectedUser) {
      connectedUsers.delete(socket.id);

      console.log("❌ User disconnected:", {
        socketId: socket.id,
        userName: disconnectedUser.userName,
        onlineDuration: new Date() - disconnectedUser.connectedAt,
      });

      // Notify all clients
      io.emit("user_left", {
        socketId: socket.id,
        userId: disconnectedUser.userId,
        userName: disconnectedUser.userName,
        message: `${disconnectedUser.userName} left the chat`,
        timestamp: new Date().toISOString(),
      });

      // Broadcast updated online users
      io.emit("online_users", Array.from(connectedUsers.values()));
    }
  });

  // ==================== Error Handling ====================

  socket.on("error", (error) => {
    console.error("Socket error from", user.name, ":", error);
  });

  // Handle connection errors
  socket.on("connect_error", (error) => {
    console.error("Connection error for", user.name, ":", error);
  });
};

export default initChat;
