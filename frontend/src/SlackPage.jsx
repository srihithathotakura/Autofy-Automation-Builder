import React from "react";
import { Link } from "react-router-dom";

const SlackPage = () => {
  const handleConnect = () => {
    alert("Slack integration coming soon!");
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
          <img src="/slack.png" alt="Slack Logo" className="integration-logo" />
          <h1>Connect to Slack</h1>
        </div>
        <p className="integration-description">
          Connect Slack to get notifications about your educational workflows like assignments and grades.
        </p>
        <div className="automation-examples">
          <h3>Example Automations</h3>
          <ul>
            <li>Send a daily summary of upcoming deadlines to your Slack channel.</li>
            <li>Notify a study group when new resources are uploaded.</li>
            <li>Post alerts when grades are published.</li>
          </ul>
        </div>
        <button className="btn primary-btn connect-btn" onClick={handleConnect}>
          Connect Slack
        </button>
      </div>
    </div>
  );
};

export default SlackPage;
