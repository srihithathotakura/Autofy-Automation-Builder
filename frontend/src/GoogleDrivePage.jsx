// frontend/src/GoogleDrivePage.jsx - UPDATED
import React, { useState } from "react";
import { Link } from "react-router-dom";

const GoogleDrivePage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    const userId = localStorage.getItem('userId') || 'simulated-user-id';
    
    try {
      const res = await fetch(`/api/oauth/connect/Google Drive?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        // Open OAuth in popup
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        window.open(
          data.authUrl, 
          'Google OAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );
      } else {
        alert('Failed to initiate connection');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsConnecting(false);
    }
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
          <li><Link to="/">Home</Link></li>
          <li><Link to="/workspace">Workspace</Link></li>
        </ul>
      </nav>
      
      <div className="integration-content">
        <div className="integration-header">
          <img src="/googledrive.png" alt="Google Drive Logo" className="integration-logo" />
          <h1>Connect to Google Drive</h1>
        </div>
        
        <p className="integration-description">
          Automate your file management with Google Drive. Create documents from templates, 
          organize files into folders, and manage sharing permissions effortlessly.
        </p>
        
        <div className="automation-examples">
          <h3>Example Automations:</h3>
          <ul>
            <li>Automatically save assignment submissions to a dedicated folder</li>
            <li>Create folders for each new course or semester</li>
            <li>Share study materials with students automatically</li>
            <li>Backup important documents to Drive</li>
            <li>Convert uploaded files to Google Docs format</li>
          </ul>
        </div>
        
        <button 
          className="btn primary-btn connect-btn" 
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Google Drive'}
        </button>
      </div>
    </div>
  );
};

export default GoogleDrivePage;