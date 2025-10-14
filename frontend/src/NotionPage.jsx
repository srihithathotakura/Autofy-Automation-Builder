import React from "react";
import { Link } from "react-router-dom";

const NotionPage = () => {
  const handleConnect = () => {
    alert("Notion integration coming soon!");
  };

  return (
    <div className="integration-page">
      <nav className="navbar">
        <div className="logo-placeholder">
          <Link to="/">
            <img src="logo.png" alt="Autofy Logo" />
          </Link>
        </div>
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
        </ul>
      </nav>
      <div className="integration-content">
        <div className="integration-header">
          <img src="/notion.png" alt="Notion Logo" className="integration-logo" />
          <h1>Connect to Notion</h1>
        </div>
        <p className="integration-description">
          Automate and manage your educational tasks seamlessly within Notion.
        </p>
        <button className="btn primary-btn connect-btn" onClick={handleConnect}>
          Connect Notion
        </button>
      </div>
    </div>
  );
};

export default NotionPage;
