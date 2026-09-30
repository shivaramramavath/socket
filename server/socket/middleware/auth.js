import jwt from "jsonwebtoken";

const ACCESS_SECRET =
  process.env.ACCESS_SECRET || "your-secret-key-change-this";

const authMiddleware = (socket, next) => {
  try {
    // Try to get token from socket.io auth
    let token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("NO_TOKEN"));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, ACCESS_SECRET);
    socket.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || "user",
    };

    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      next(new Error("TOKEN_EXPIRED"));
    } else if (e.name === "JsonWebTokenError") {
      next(new Error("INVALID_TOKEN"));
    } else {
      next(new Error("UNAUTHORIZED"));
    }
  }
};

export default authMiddleware;
