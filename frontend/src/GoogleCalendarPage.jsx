
// frontend/src/GoogleCalendarPage.jsx - UPDATED
import React, { useState } from "react";
import { Link } from "react-router-dom";

const GoogleCalendarPage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    const userId = localStorage.getItem('userId') || 'simulated-user-id';
    
    try {
      const res = await fetch(`/api/oauth/connect/Google Calendar?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
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
          <img src="/googlecalendar.png" alt="Google Calendar Logo" className="integration-logo" />
          <h1>Connect to Google Calendar</h1>
        </div>
        
        <p className="integration-description">
          Never miss a deadline or class. Autofy can automatically create and update events 
          in your Google Calendar based on your schedule, assignments, and exams.
        </p>
        
        <div className="automation-examples">
          <h3>Example Automations:</h3>
          <ul>
            <li>Automatically add your class schedule at the start of the semester</li>
            <li>Create calendar events with reminders for upcoming exams</li>
            <li>Block out study time for important subjects</li>
            <li>Schedule office hours and student meetings</li>
            <li>Sync assignment deadlines to your calendar</li>
          </ul>
        </div>
        
        <button 
          className="btn primary-btn connect-btn" 
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
        </button>
      </div>
    </div>
  );
};

export default GoogleCalendarPage;