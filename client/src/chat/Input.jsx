import React, { useState } from "react";
import "./Input.css";

const Input = ({ socket }) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    setIsSending(true);
    const messageData = {
      message: message.trim(),
      sender: "You",
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", messageData, (response) => {
      setMessage("");
      setIsSending(false);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="input-container">
      <form onSubmit={handleSend} className="input-form">
        <textarea
          type="text"
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          value={message}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="input-field"
          disabled={isSending}
        />
        <button
          type="submit"
          onClick={handleSend}
          className="send-btn"
          disabled={!message.trim() || isSending}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Input;
