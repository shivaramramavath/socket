import React, { useState, useEffect } from "react";
import Chat from "./chat/Chat";
import LoginForm from "./auth/LoginForm";
import "./App.css";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
      setIsAuthenticated(true);
    }
  }, [token]);

  const handleLogout = () => {
    setToken("");
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
  };

  return (
    <div className="app-container">
      {isAuthenticated ? (
        <Chat token={token} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={setToken} />
      )}
    </div>
  );
};

export default App;
