import React, { useState } from "react";
import "./LoginForm.css";

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("credentials");

  const handleLoginWithCredentials = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      if (data.token) {
        onLogin(data.token);
      } else {
        setError("No token received from server");
      }
    } catch (err) {
      setError(err.message || "Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithToken = (e) => {
    e.preventDefault();
    setError("");

    if (!token.trim()) {
      setError("Please enter a valid token");
      return;
    }

    onLogin(token);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>💬 Chat Application</h1>
          <p>Connect with others in real-time</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab-button ${activeTab === "credentials" ? "active" : ""}`}
            onClick={() => setActiveTab("credentials")}
          >
            Email & Password
          </button>
          <button
            className={`tab-button ${activeTab === "token" ? "active" : ""}`}
            onClick={() => setActiveTab("token")}
          >
            Use Token
          </button>
        </div>

        {activeTab === "credentials" ? (
          <form onSubmit={handleLoginWithCredentials} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="your.email@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="login-button"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span> Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginWithToken} className="login-form">
            <div className="form-group">
              <label htmlFor="token">Authentication Token</label>
              <textarea
                id="token"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError("");
                }}
                placeholder="Paste your JWT token here..."
                rows="6"
                className="token-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="login-button"
              disabled={!token.trim()}
            >
              Login with Token
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>
            Don't have an account? <a href="#signup">Sign up here</a>
          </p>
        </div>
      </div>

      <div className="login-background">
        <div className="chat-bubble bubble-1">Hello</div>
        <div className="chat-bubble bubble-2">Hi there!</div>
        <div className="chat-bubble bubble-3">How are you?</div>
      </div>
    </div>
  );
};

export default LoginForm;
