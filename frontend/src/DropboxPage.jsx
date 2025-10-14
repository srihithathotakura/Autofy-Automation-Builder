import React from "react";
import { Link } from "react-router-dom";
import "./IntegrationPage.css";

const DropboxPage = () => {
  const handleConnect = () => {
    alert("Connecting to Dropbox... (OAuth flow to be implemented)");
  };

  return (
    <div className="integration-page">
      <nav className="navbar">
        <div className="logo-placeholder">
          <Link to="/">
            <img src="/logo.png" alt="Autofy Logo" />
          </Link>
        </div>
        <ul className="navbar-menu">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/workspace">Workspace</Link>
          </li>
        </ul>
      </nav>

      <div className="integration-content">
        <div className="integration-header">
          <img
            src="/dropbox.png"
            alt="Dropbox Logo"
            className="integration-logo"
          />
          <h1>Connect to Dropbox</h1>
        </div>
        <p className="integration-description">
          Store and share your academic files seamlessly. Autofy can automatically
          upload assignments, organize folders, and manage file sharing with Dropbox.
        </p>

        <div className="automation-examples">
          <h3>Example Automations:</h3>
          <ul>
            <li>
              Automatically backup submitted assignments to a Dropbox folder.
            </li>
            <li>
              Create a new folder for each course at the start of the semester.
            </li>
            <li>
              Share study materials with students via Dropbox links.
            </li>
          </ul>
        </div>

        <button className="btn primary-btn connect-btn" onClick={handleConnect}>
          Connect Dropbox
        </button>
      </div>
    </div>
  );
};

export default DropboxPage;