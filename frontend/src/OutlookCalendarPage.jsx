import React from "react";
import { Link } from "react-router-dom";

const OutlookCalendarPage = () => {
  const handleConnect = () => {
    alert("Microsoft Outlook integration coming soon!");
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
          <img src="/outlook.png" alt="Outlook Logo" className="integration-logo" />
          <h1>Connect to Microsoft Outlook</h1>
        </div>
        <p className="integration-description">
          Sync your university's official calendar with your personal Outlook calendar to never miss important events.
        </p>
        <div className="automation-examples">
          <h3>Example Automations</h3>
          <ul>
            <li>Automatically add your class schedule to Outlook.</li>
            <li>Create calendar events with reminders for upcoming exams.</li>
            <li>Accept meeting invites for study sessions automatically.</li>
          </ul>
        </div>
        <button className="btn primary-btn connect-btn" onClick={handleConnect}>
          Connect Outlook Calendar
        </button>
      </div>
    </div>
  );
};

export default OutlookCalendarPage;
