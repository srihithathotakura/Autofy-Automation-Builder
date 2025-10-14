import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "./components/Navbar";

const IntegrationError = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'Unknown error occurred';

  useEffect(() => {
    // Auto-close window after 5 seconds if opened in popup
    if (window.opener) {
      setTimeout(() => {
        window.close();
      }, 5000);
    }
  }, []);

  return (
    <div>
      <Navbar />

      <div style={{
        maxWidth: "600px",
        margin: "4rem auto",
        padding: "3rem",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
        textAlign: "center"
      }}>
        <div style={{
          fontSize: "4rem",
          marginBottom: "1rem"
        }}>
          ❌
        </div>
        <h1 style={{ color: "#f44336", marginBottom: "1rem" }}>
          Connection Failed
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "2rem", lineHeight: "1.6" }}>
          {decodeURIComponent(reason)}
        </p>
        
        <div style={{
          padding: "1rem",
          background: "#fff3e0",
          borderRadius: "8px",
          marginBottom: "2rem",
          textAlign: "left"
        }}>
          <h3 style={{ marginTop: 0, color: "#ef6c00" }}>Possible Solutions:</h3>
          <ul style={{ marginBottom: 0, color: "#666" }}>
            <li>Make sure you're logged in to your Google account</li>
            <li>Check if the app has proper OAuth credentials configured</li>
            <li>Verify that your email is added to the test users list</li>
            <li>Try clearing your browser cache and cookies</li>
            <li>Contact your administrator if the problem persists</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button 
            onClick={() => window.location.reload()} 
            className="btn primary-btn"
          >
            Try Again
          </button>
          <Link to="/workspace">
            <button className="btn secondary-btn">
              Go to Workspace
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="btn secondary-btn">
              Go to Dashboard
            </button>
          </Link>
        </div>

        {window.opener && (
          <p style={{ marginTop: "2rem", color: "#999", fontSize: "0.9rem" }}>
            This window will close automatically in 5 seconds...
          </p>
        )}
      </div>
    </div>
  );
};

export default IntegrationError;