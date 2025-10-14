import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkflows: 0,
    activeIntegrations: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    setStats({
      totalUsers: 1247,
      totalWorkflows: 3845,
      activeIntegrations: 8,
      pendingRequests: 23,
    });
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
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/workspace">Workspace</Link>
          </li>
          <li>
            <Link to="/">Logout</Link>
          </li>
        </ul>
      </nav>

      <div className="form-container" style={{ maxWidth: "1200px", backgroundColor: "transparent" }}>
        <h1 style={{ color: "#123456" }}>Administrator Dashboard</h1>
        <p style={{ color: "#666" }}>Manage institution-wide automations and monitor system activity.</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          <div
            style={{
              background: "#1d7a85",
              color: "white",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "2.5rem" }}>{stats.totalUsers}</h2>
            <p style={{ margin: "0.5rem 0 0 0" }}>Total Users</p>
          </div>
          <div
            style={{
              background: "#123456",
              color: "white",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "2.5rem" }}>{stats.totalWorkflows}</h2>
            <p style={{ margin: "0.5rem 0 0 0" }}>Active Workflows</p>
          </div>
          <div
            style={{
              background: "#FF9800",
              color: "white",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "2.5rem" }}>{stats.activeIntegrations}</h2>
            <p style={{ margin: "0.5rem 0 0 0" }}>Integrations</p>
          </div>
          <div
            style={{
              background: "#f44336",
              color: "white",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "2.5rem" }}>{stats.pendingRequests}</h2>
            <p style={{ margin: "0.5rem 0 0 0" }}>Pending Requests</p>
          </div>
        </div>

        <div style={{ marginTop: "3rem" }}>
          <h2 style={{ color: "#123456" }}>Quick Actions</h2>
          <div
            className="roles-cards"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
          >
            <Link to="/request-demo" className="role-card-link">
              <div className="role-card">
                <h4>View Demo Requests</h4>
                <p>Review and manage incoming demo requests from potential users.</p>
                <span className="role-card-cta">View Requests →</span>
              </div>
            </Link>
            <Link to="/request-template" className="role-card-link">
              <div className="role-card">
                <h4>Manage Templates</h4>
                <p>Review template requests and create custom workflow templates.</p>
                <span className="role-card-cta">Manage Templates →</span>
              </div>
            </Link>
            <Link to="/workspace" className="role-card-link">
              <div className="role-card">
                <h4>Create Workflow</h4>
                <p>Build institution-wide automation workflows.</p>
                <span className="role-card-cta">Build Workflow →</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;