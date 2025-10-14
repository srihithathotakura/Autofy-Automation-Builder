import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";

const APPS = {
  Gmail: { icon: "📧", color: "#EA4335" },
  "Google Sheets": { icon: "📊", color: "#34A853" },
  "Google Drive": { icon: "📁", color: "#4285F4" },
  "Google Calendar": { icon: "📅", color: "#4285F4" },
  "Google Meet": { icon: "📹", color: "#00897B" },
  Slack: { icon: "💬", color: "#4A154B" },
  Notion: { icon: "📝", color: "#000000" },
  Outlook: { icon: "📮", color: "#0078D4" },
  Dropbox: { icon: "📦", color: "#0061FF" },
  Trello: { icon: "📋", color: "#0079BF" },
  Zoom: { icon: "🎥", color: "#2D8CFF" },
  MicrosoftTeams: { icon: "👥", color: "#6264A7" },
};

const TRIGGER_EVENTS = {
  Gmail: ["New Email", "New Labeled Email", "New Attachment"],
  "Google Sheets": ["New Row", "Updated Row", "New Spreadsheet"],
  "Google Drive": ["File Uploaded", "File Updated", "New Folder"],
  "Google Calendar": ["New Event", "Event Updated", "Event Cancelled"],
  "Google Meet": ["Meeting Scheduled", "Meeting Started"],
  Slack: ["New Message", "Channel Created", "New Reaction"],
  Notion: ["New Database Item", "Updated Database Item", "New Page"],
  Outlook: ["New Email", "New Calendar Event", "Updated Event"],
  Dropbox: ["File Uploaded", "File Modified", "Folder Created"],
  Trello: ["Card Created", "Card Updated", "List Created"],
  Zoom: ["Meeting Scheduled", "Meeting Started", "Recording Available"],
  "Microsoft Teams": ["New Message", "Meeting Created", "File Shared"],
};

const ACTION_EVENTS = {
  Gmail: ["Send Email", "Create Draft", "Add Label"],
  "Google Sheets": ["Add Row", "Update Row", "Create Spreadsheet"],
  "Google Drive": ["Upload File", "Create Folder", "Share File"],
  "Google Calendar": ["Create Event", "Update Event", "Delete Event"],
  "Google Meet": ["Schedule Meeting", "Send Meeting Link"],
  Slack: ["Send Message", "Create Channel", "Add Reaction"],
  Notion: ["Create Database Item", "Update Page", "Add Comment"],
  Outlook: ["Send Email", "Create Event", "Update Event"],
  Dropbox: ["Upload File", "Create Folder", "Share File"],
  Trello: ["Create Card", "Update Card", "Move Card"],
  Zoom: ["Schedule Meeting", "Start Instant Meeting"],
  "Microsoft Teams": ["Send Message", "Schedule Meeting", "Share File"],
};

function StepCard({ step, index, onEdit, onDelete }) {
  const appData = APPS[step.app] || { icon: "⚙️", color: "#666" };

  return (
    <div className="step-card">
      <div className="step-card-content">
        <div className="step-card-left">
          <div className="step-icon" style={{ background: appData.color }}>
            {appData.icon}
          </div>
          <div className="step-details">
            <div className="step-badge-container">
              <span className={`step-badge ${step.type}`}>
                {index + 1}. {step.type === "trigger" ? "TRIGGER" : "ACTION"}
              </span>
            </div>
            <h3 className="step-app-name">{step.app}</h3>
            <p className="step-event">{step.event}</p>
            {step.accountEmail && (
              <p className="step-account">Account: {step.accountEmail}</p>
            )}
          </div>
        </div>
        <div className="step-actions">
          <button onClick={onEdit} className="btn secondary-btn btn-sm">
            Edit
          </button>
          <button onClick={onDelete} className="btn danger-btn btn-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function StepModal({ type, initialData, onSave, onClose, userId }) {
  const [selectedApp, setSelectedApp] = useState(initialData?.app || "");
  const [selectedEvent, setSelectedEvent] = useState(initialData?.event || "");
  const [accountEmail, setAccountEmail] = useState(initialData?.accountEmail || "");
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [showAccountOptions, setShowAccountOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const events = type === "trigger" ? TRIGGER_EVENTS : ACTION_EVENTS;

  useEffect(() => {
    if (selectedApp) {
      fetchConnectedAccounts();
    }
  }, [selectedApp]);

  const fetchConnectedAccounts = async () => {
    try {
      const res = await fetch(`/api/oauth/connected-apps/${userId}`);
      if (res.ok) {
        const apps = await res.json();
        const filtered = apps.filter(app => app.appName === selectedApp);
        setConnectedAccounts(filtered);
      }
    } catch (err) {
      console.error('Error fetching connected accounts:', err);
    }
  };

  const handleRealSignIn = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/oauth/connect/${selectedApp}?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        // Open OAuth flow in new window
        window.open(data.authUrl, '_blank', 'width=600,height=700');
        
        // Poll for connection
        const pollInterval = setInterval(async () => {
          await fetchConnectedAccounts();
          const updatedRes = await fetch(`/api/oauth/connected-apps/${userId}`);
          if (updatedRes.ok) {
            const apps = await updatedRes.json();
            const newConnection = apps.find(
              app => app.appName === selectedApp && 
              !connectedAccounts.some(ca => ca.accountEmail === app.accountEmail)
            );
            if (newConnection) {
              clearInterval(pollInterval);
              setAccountEmail(newConnection.accountEmail);
              setShowAccountOptions(false);
              alert(`Successfully connected to ${selectedApp}!`);
              setLoading(false);
            }
          }
        }, 2000);

        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setLoading(false);
        }, 120000);
      }
    } catch (err) {
      console.error('Error initiating OAuth:', err);
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!selectedApp || !selectedEvent) {
      alert("Please select an app and event");
      return;
    }
    if (!accountEmail) {
      alert("Please connect an account");
      return;
    }
    onSave({
      type,
      app: selectedApp,
      event: selectedEvent,
      accountEmail,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">
          {type === "trigger" ? "Choose Trigger" : "Choose Action"}
        </h2>

        <div className="modal-section">
          <label className="modal-label">Select App</label>
          <div className="app-grid">
            {Object.entries(APPS).map(([appName, appData]) => (
              <div
                key={appName}
                onClick={() => {
                  setSelectedApp(appName);
                  setSelectedEvent("");
                  setAccountEmail("");
                }}
                className={`app-card ${selectedApp === appName ? 'selected' : ''}`}
              >
                <div className="app-icon">{appData.icon}</div>
                <div className="app-name">{appName}</div>
              </div>
            ))}
          </div>
        </div>

        {selectedApp && (
          <div className="modal-section">
            <label className="modal-label">Select Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="modal-select"
            >
              <option value="">Choose an event...</option>
              {events[selectedApp]?.map((event) => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
          </div>
        )}

        {selectedApp && selectedEvent && (
          <div className="modal-section">
            <label className="modal-label">Connect Account</label>
            {accountEmail ? (
              <div className="account-connected">
                <span>✓ Connected: {accountEmail}</span>
                <button
                  onClick={() => setAccountEmail("")}
                  className="btn secondary-btn btn-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                {!showAccountOptions ? (
                  <button
                    onClick={() => setShowAccountOptions(true)}
                    className="btn primary-btn full-width"
                  >
                    + Connect {selectedApp} Account
                  </button>
                ) : (
                  <div className="account-options">
                    <h4>Choose an account:</h4>
                    {connectedAccounts.length > 0 ? (
                      connectedAccounts.map((acc) => (
                        <div
                          key={acc.accountEmail}
                          onClick={() => {
                            setAccountEmail(acc.accountEmail);
                            setShowAccountOptions(false);
                          }}
                          className="account-item"
                        >
                          {acc.accountEmail}
                          <span style={{ fontSize: "0.85rem", color: "#666", marginLeft: "0.5rem" }}>
                            (Connected {new Date(acc.connectedAt).toLocaleDateString()})
                          </span>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#666", textAlign: "center", padding: "1rem" }}>
                        No accounts connected yet
                      </p>
                    )}
                    <hr className="divider" />
                    <button
                      onClick={handleRealSignIn}
                      className="btn primary-btn full-width"
                      disabled={loading}
                    >
                      {loading ? 'Connecting...' : `Sign in with ${selectedApp}`}
                    </button>
                    <button
                      onClick={() => setShowAccountOptions(false)}
                      className="btn secondary-btn full-width"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button
            onClick={handleSave}
            className="btn primary-btn"
            disabled={!selectedApp || !selectedEvent || !accountEmail}
          >
            {initialData ? "Update Step" : "Add Step"}
          </button>
          <button onClick={onClose} className="btn secondary-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
function WorkflowWorkspace() {
  const [steps, setSteps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("trigger");
  const [editingIndex, setEditingIndex] = useState(null);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const userId = localStorage.getItem('userId');

  const handleAddStep = (type) => {
    setModalType(type);
    setEditingIndex(null);
    setShowModal(true);
  };

  const handleEditStep = (index) => {
    setEditingIndex(index);
    setModalType(steps[index].type);
    setShowModal(true);
  };

  const handleSaveStep = (stepData) => {
    if (editingIndex !== null) {
      const newSteps = [...steps];
      newSteps[editingIndex] = stepData;
      setSteps(newSteps);
    } else {
      setSteps([...steps, stepData]);
    }
    setShowModal(false);
  };

  const handleDeleteStep = (index) => {
    if (window.confirm("Are you sure you want to delete this step?")) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleSaveWorkflow = async () => {
    if (steps.length === 0) {
      alert("Please add at least one step before saving.");
      return;
    }
    
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: workflowName,
          steps: steps
        })
      });
      
      if (response.ok) {
        alert(`Workflow "${workflowName}" saved successfully!`);
        // Reset form
        setSteps([]);
        setWorkflowName("Untitled Workflow");
      } else {
        alert('Failed to save workflow');
      }
    } catch (err) {
      console.error('Error saving workflow:', err);
      alert('Error saving workflow');
    }
  };

  return (
    <div>
      <Navbar /> 
      <div className="workflow-workspace">
        <div className="workspace-container">
          <div className="workspace-header">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="workflow-name-input"
              placeholder="Enter workflow name"
            />
            <button onClick={handleSaveWorkflow} className="btn primary-btn">
              Save Workflow
            </button>
          </div>

          <div className="workflow-steps">
            {steps.length === 0 && (
              <div className="empty-state">
                <h3>Start building your workflow</h3>
                <p>Click the "Add Trigger" button below to get started</p>
              </div>
            )}

            {steps.map((step, index) => (
              <div key={index}>
                <StepCard
                  step={step}
                  index={index}
                  onEdit={() => handleEditStep(index)}
                  onDelete={() => handleDeleteStep(index)}
                />
                {index < steps.length - 1 && (
                  <div className="step-connector">
                    <div className="connector-line"></div>
                  </div>
                )}
              </div>
            ))}

            <div className="add-step-container">
              {steps.length === 0 ? (
                <button
                  onClick={() => handleAddStep("trigger")}
                  className="btn primary-btn add-step-btn"
                >
                  + Add Trigger
                </button>
              ) : (
                <button
                  onClick={() => handleAddStep("action")}
                  className="btn primary-btn add-step-btn"
                >
                  + Add Action
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <StepModal
          type={modalType}
          initialData={editingIndex !== null ? steps[editingIndex] : null}
          onSave={handleSaveStep}
          onClose={() => setShowModal(false)}
          userId={userId}
        />
      )}
    </div>
  );
}

export default WorkflowWorkspace;