import React, { useEffect, useState } from "react";
import useSocket from "../socket/useSocket.js";
import Messages from "./Messages";
import Input from "./Input";
import "./Chat.css";

const Chat = ({ token, onLogout }) => {
  const { connect, socket, disConnect } = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (token) {
      connect(token);

      socket.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected");
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected");
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        disConnect();
      };
    }
  }, [token]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>💬 Chat Room</h1>
        <div className="header-right">
          <span
            className={`status-indicator ${isConnected ? "connected" : "disconnected"}`}
          ></span>
          <span className="status-text">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="chat-content">
        <Messages socket={socket} />
        <Input socket={socket} />
      </div>
    </div>
  );
};

export default Chat;
