import React, { useState, useEffect, useRef } from "react";
import "./Messages.css";

const Messages = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("message");
      socket.off("receive_message");
    };
  }, [socket]);

  return (
    <div className="messages-container">
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="empty-message">No messages yet. Start chatting!</div>
        ) : (
          messages.map((msg, i) => {
            const isOwnMessage = msg.userId === socket?.id;
            return (
              <div
                key={i}
                className={`message-item ${isOwnMessage ? "own-message" : "other-message"}`}
              >
                <div className="message-sender">
                  {msg.sender || "Anonymous"}
                </div>
                <div className="message-content">{msg.message || msg.text}</div>
                <div className="message-time">
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Messages;
