import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <Navbar />

      <header className="hero-section">
        <div className="hero-left">
          <img
            src="/hero-img.png"
            alt="Automation Workflow Illustration"
            className="hero-image"
          />
        </div>
        <div className="hero-right">
          <h2 className="hero-headline">
            No-Code Automation Platform for Education
          </h2>
          <p className="hero-subheadline">
            Streamline repetitive academic tasks with smart AI-powered workflows,
            secure integrations, and a drag-and-drop builder — no coding required.
          </p>
          <div className="hero-cta-buttons">
            <button
              className="btn primary-btn"
              onClick={() => navigate("/workspace")}
            >
              Create Workspace
            </button>
            <button
              className="btn secondary-btn"
              onClick={() => navigate("/request-demo")}
            >
              Request Demo
            </button>
          </div>
        </div>
      </header>

      <section id="features" className="features-section">
        <h3>Core Features</h3>
        <ul className="features-list">
          <li>AI-Powered SmartSteps Workflow Suggestions</li>
          <li>Drag-and-Drop Workflow Builder UI</li>
          <li>Role-Based Templates for Students, Teachers, & Admins</li>
          <li>Multi-language & Accessibility Support</li>
          <li>Secure App Integrations without Sharing Credentials</li>
          <li>Embedded Chatbot & Video Tutorials for Onboarding</li>
        </ul>
      </section>

      <section id="integrations" className="integrations-section">
        <h3>Connect Your Favorite Apps</h3>
        <p>Autofy seamlessly integrates with the tools you and your institution already use.</p>
        <div className="integration-logos">
          <Link to="/integrations/google-drive">
            <img src="/googledrive.png" alt="Google Drive Logo" title="Google Drive" />
          </Link>
          <Link to="/integrations/google-calendar">
            <img src="/googlecalendar.png" alt="Google Calendar Logo" title="Google Calendar" />
          </Link>
          <Link to="/integrations/slack">
            <img src="/slack.png" alt="Slack Logo" title="Slack" />
          </Link>
          <Link to="/integrations/notion">
            <img src="/notion.png" alt="Notion Logo" title="Notion" />
          </Link>
          <Link to="/integrations/dropbox">
            <img src="/dropbox.png" alt="Dropbox Logo" title="Dropbox" />
          </Link>
          <Link to="/integrations/microsoft-outlook">
            <img src="/outlook.png" alt="Outlook Logo" title="Outlook" />
          </Link>
        </div>
      </section>

      <section id="roles" className="roles-section">
        <h3>User Roles & Benefits</h3>
        <div className="roles-cards">
          <div className="role-card">
            <h4>Students</h4>
            <p>
              Never miss an exam. Get automated reminders and a personalized
              study schedule based on your topics.
            </p>
            <button 
              className="btn primary-btn" 
              style={{ marginTop: '1rem' }}
              onClick={() => {
                const userRole = localStorage.getItem('userRole');
                if (userRole === 'Student') {
                  navigate('/exam-scheduler');
                } else if (userRole) {
                  alert('Please sign in as a Student to access this feature.');
                } else {
                  navigate('/login');
                }
              }}
            >
              Plan Your Study →
            </button>
          </div>
          <div className="role-card">
            <h4>Teachers</h4>
            <p>
              Set up a portal for students to submit assignments and automate
              the entire collection process.
            </p>
            <button 
              className="btn primary-btn" 
              style={{ marginTop: '1rem' }}
              onClick={() => {
                const userRole = localStorage.getItem('userRole');
                if (userRole === 'Teacher') {
                  navigate('/teacher-dashboard');
                } else if (userRole) {
                  alert('Please sign in as a Teacher to access this feature.');
                } else {
                  navigate('/login');
                }
              }}
            >
              Manage Classes →
            </button>
          </div>
          <div className="role-card">
            <h4>Administrators</h4>
            <p>
              Manage institution-wide automations, assign roles, and monitor
              workflows effectively.
            </p>
            <button 
              className="btn primary-btn" 
              style={{ marginTop: '1rem' }}
              onClick={() => {
                const userRole = localStorage.getItem('userRole');
                if (userRole === 'Administrator') {
                  navigate('/admin-dashboard');
                } else if (userRole) {
                  alert('Please sign in as an Administrator to access this feature.');
                } else {
                  navigate('/login');
                }
              }}
            >
              Admin Panel →
            </button>
          </div>
        </div>
      </section>

      <section id="request-templates" className="request-templates-section">
        <h3>Request Templates</h3>
        <p>
          Looking for customized automation templates? Submit your requests and
          our team will create tailored workflow templates for your needs.
        </p>
        <button
          className="btn primary-btn request-templates-btn"
          onClick={() => navigate("/request-template")}
        >
          Request a Template
        </button>
      </section>

      <footer className="footer">
        <p>© 2025 Autofy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;