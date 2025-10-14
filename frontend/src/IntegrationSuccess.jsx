// frontend/src/IntegrationSuccess.jsx
import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

const IntegrationSuccess = () => {
  const [searchParams] = useSearchParams();
  const app = searchParams.get('app');
  const email = searchParams.get('email');

  useEffect(() => {
    // Auto-close window after 3 seconds if opened in popup
    if (window.opener) {
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, []);

  return (
    <div>
      <nav className="navbar">
        <div className="logo-placeholder">
          <Link to="/">
            <img src="/logo.png" alt="Autofy Logo" />
          </Link>
        </div>
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/workspace">Workspace</Link></li>
        </ul>
      </nav>

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
          ✅
        </div>
        <h1 style={{ color: "#4CAF50", marginBottom: "1rem" }}>
          Successfully Connected!
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "2rem" }}>
          Your <strong>{app}</strong> account ({email}) has been connected successfully.
        </p>
        
        <div style={{
          padding: "1rem",
          background: "#e8f5e9",
          borderRadius: "8px",
          marginBottom: "2rem"
        }}>
          <p style={{ margin: 0, color: "#2e7d32" }}>
            You can now use this account in your workflows!
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link to="/workspace">
            <button className="btn primary-btn">
              Build Workflow
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
            This window will close automatically in 3 seconds...
          </p>
        )}
      </div>
    </div>
  );
};

export default IntegrationSuccess;