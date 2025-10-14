import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    major: "",
    university: "",
    year: "",
    bio: "",
  });
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState('workflows');

  const userId = localStorage.getItem('userId') || 'simulated-user-id';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workflowsRes, statsRes, profileRes] = await Promise.all([
        fetch(`/api/workflows/user/${userId}`),
        fetch(`/api/workflows/stats/${userId}`),
        fetch('/api/profile/me')
      ]);

      if (workflowsRes.ok) {
        const workflowsData = await workflowsRes.json();
        setWorkflows(workflowsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile({
          major: profileData.major || "",
          university: profileData.university || "",
          year: profileData.year || "",
          bio: profileData.bio || "",
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setMessage('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (err) {
      setMessage("Server error while updating profile.");
    }
  };

  const handleExecuteWorkflow = async (workflowId) => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Workflow executed! Status: ${data.result.status}`);
        fetchData();
      } else {
        alert('Failed to execute workflow');
      }
    } catch (err) {
      console.error('Error executing workflow:', err);
      alert('Error executing workflow');
    }
  };

  const handleToggleWorkflow = async (workflowId) => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}/toggle`, {
        method: 'PUT'
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling workflow:', err);
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting workflow:', err);
    }
  };

  if (loading) {
    return (
      <div>
        <nav className="navbar">
          <div className="logo-placeholder">
            <Link to="/">
              <img src="/logo.png" alt="Autofy Logo" />
            </Link>
          </div>
        </nav>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div className="spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#1d7a85', '#123456', '#FF9800', '#4CAF50', '#f44336'];

  const successData = stats ? [
    { name: 'Successful', value: stats.successfulExecutions, color: '#4CAF50' },
    { name: 'Failed', value: stats.failedExecutions, color: '#f44336' }
  ] : [];

  // Prepare execution timeline data
  const executionTimelineData = stats && stats.recentExecutions ? 
    stats.recentExecutions.slice(0, 10).reverse().map((exec, index) => ({
      name: `Exec ${index + 1}`,
      date: new Date(exec.executedAt).toLocaleDateString(),
      Success: exec.status === 'success' ? 1 : 0,
      Failed: exec.status === 'failed' ? 1 : 0
    })) : [];

  // Prepare workflow performance data
  const workflowPerformanceData = workflows.slice(0, 5).map(w => ({
    name: w.name.substring(0, 15) + (w.name.length > 15 ? '...' : ''),
    executions: w.executionCount,
    successRate: parseFloat(w.successRate) || 0
  }));

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
          <li><Link to="/">Logout</Link></li>
        </ul>
      </nav>

      <div style={{ maxWidth: "1400px", margin: "2rem auto", padding: "0 2rem" }}>
        <h1 style={{ color: "#123456", marginBottom: "2rem" }}>Student Dashboard</h1>

        {stats && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem"
          }}>
            <div style={{
              background: "#1d7a85",
              color: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <h2 style={{ margin: 0, fontSize: "2rem" }}>{stats.totalWorkflows}</h2>
              <p style={{ margin: "0.5rem 0 0 0" }}>Total Workflows</p>
            </div>
            <div style={{
              background: "#123456",
              color: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <h2 style={{ margin: 0, fontSize: "2rem" }}>{stats.activeWorkflows}</h2>
              <p style={{ margin: "0.5rem 0 0 0" }}>Active Workflows</p>
            </div>
            <div style={{
              background: "#4CAF50",
              color: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <h2 style={{ margin: 0, fontSize: "2rem" }}>{stats.totalExecutions}</h2>
              <p style={{ margin: "0.5rem 0 0 0" }}>Total Executions</p>
            </div>
            <div style={{
              background: "#FF9800",
              color: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <h2 style={{ margin: 0, fontSize: "2rem" }}>{stats.averageSuccessRate}%</h2>
              <p style={{ margin: "0.5rem 0 0 0" }}>Success Rate</p>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "2rem", borderBottom: "2px solid #e0e0e0" }}>
          <button
            onClick={() => setActiveTab('workflows')}
            style={{
              padding: "1rem 2rem",
              background: activeTab === 'workflows' ? '#1d7a85' : 'transparent',
              color: activeTab === 'workflows' ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === 'workflows' ? '3px solid #123456' : 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            My Workflows
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: "1rem 2rem",
              background: activeTab === 'analytics' ? '#1d7a85' : 'transparent',
              color: activeTab === 'analytics' ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === 'analytics' ? '3px solid #123456' : 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: "1rem 2rem",
              background: activeTab === 'profile' ? '#1d7a85' : 'transparent',
              color: activeTab === 'profile' ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '3px solid #123456' : 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            style={{
              padding: "1rem 2rem",
              background: activeTab === 'tools' ? '#1d7a85' : 'transparent',
              color: activeTab === 'tools' ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === 'tools' ? '3px solid #123456' : 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Tools
          </button>
        </div>

        {activeTab === 'workflows' && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#123456" }}>My Saved Workflows</h2>
              <Link to="/workspace">
                <button className="btn primary-btn">+ Create New Workflow</button>
              </Link>
            </div>

            {workflows.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "4rem 2rem",
                background: "white",
                borderRadius: "12px",
                border: "2px dashed #ddd"
              }}>
                <h3 style={{ color: "#666" }}>No workflows yet</h3>
                <p style={{ color: "#999" }}>Create your first workflow to get started!</p>
                <Link to="/workspace">
                  <button className="btn primary-btn" style={{ marginTop: "1rem" }}>
                    Create Workflow
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {workflows.map((workflow) => (
                  <div key={workflow._id} style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "2px solid #e0e0e0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 0.5rem 0", color: "#123456" }}>{workflow.name}</h3>
                        <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.9rem" }}>
                          {workflow.steps.length} steps • Last executed: {workflow.lastExecuted ? new Date(workflow.lastExecuted).toLocaleString() : 'Never'}
                        </p>
                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                          <div>
                            <span style={{ fontWeight: "bold", color: "#123456" }}>Success Rate:</span>
                            <span style={{ marginLeft: "0.5rem", color: "#4CAF50" }}>{workflow.successRate}%</span>
                          </div>
                          <div>
                            <span style={{ fontWeight: "bold", color: "#123456" }}>Executions:</span>
                            <span style={{ marginLeft: "0.5rem" }}>{workflow.executionCount}</span>
                          </div>
                          <div>
                            <span style={{ 
                              padding: "0.25rem 0.75rem", 
                              borderRadius: "4px", 
                              fontSize: "0.85rem",
                              background: workflow.isActive ? '#e8f5e9' : '#ffebee',
                              color: workflow.isActive ? '#2e7d32' : '#c62828'
                            }}>
                              {workflow.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button 
                          onClick={() => handleExecuteWorkflow(workflow._id)}
                          className="btn primary-btn btn-sm"
                        >
                          Execute
                        </button>
                        <button 
                          onClick={() => handleToggleWorkflow(workflow._id)}
                          className="btn secondary-btn btn-sm"
                        >
                          {workflow.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDeleteWorkflow(workflow._id)}
                          className="btn danger-btn btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && stats && (
          <div>
            <h2 style={{ color: "#123456", marginBottom: "2rem" }}>Workflow Analytics</h2>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
              gap: "2rem",
              marginBottom: "2rem"
            }}>
              <div style={{ 
                background: "white", 
                padding: "2rem", 
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}>
                <h3 style={{ color: "#123456", marginBottom: "1rem" }}>Execution Results</h3>
                {successData.length > 0 && successData[0].value + successData[1].value > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={successData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {successData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>
                    No execution data yet
                  </p>
                )}
              </div>

              <div style={{ 
                background: "white", 
                padding: "2rem", 
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}>
                <h3 style={{ color: "#123456", marginBottom: "1rem" }}>Workflow Performance</h3>
                {workflows.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workflows.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="successCount" fill="#4CAF50" name="Success" />
                      <Bar dataKey="failureCount" fill="#f44336" name="Failed" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>
                    No workflows to display
                  </p>
                )}
              </div>
            </div>

            {executionTimelineData.length > 0 && (
              <div style={{ 
                background: "white", 
                padding: "2rem", 
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                marginBottom: "2rem"
              }}>
                <h3 style={{ color: "#123456", marginBottom: "1rem" }}>Execution Timeline</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={executionTimelineData}>
                    <defs>
                      <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f44336" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="Success" stroke="#4CAF50" fillOpacity={1} fill="url(#colorSuccess)" />
                    <Area type="monotone" dataKey="Failed" stroke="#f44336" fillOpacity={1} fill="url(#colorFailed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {workflowPerformanceData.length > 0 && (
              <div style={{ 
                background: "white", 
                padding: "2rem", 
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                marginBottom: "2rem"
              }}>
                <h3 style={{ color: "#123456", marginBottom: "1rem" }}>Success Rate by Workflow</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={workflowPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="successRate" stroke="#1d7a85" strokeWidth={3} name="Success Rate (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{ 
              background: "white", 
              padding: "2rem", 
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}>
              <h3 style={{ color: "#123456", marginBottom: "1rem" }}>Recent Executions</h3>
              {stats.recentExecutions && stats.recentExecutions.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f5f5f5" }}>
                      <tr>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>
                          Workflow
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>
                          Executed At
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentExecutions.map((exec, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #e0e0e0" }}>
                          <td style={{ padding: "1rem" }}>{exec.workflowName}</td>
                          <td style={{ padding: "1rem" }}>{new Date(exec.executedAt).toLocaleString()}</td>
                          <td style={{ padding: "1rem" }}>
                            <span style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "4px",
                              fontSize: "0.85rem",
                              background: exec.status === 'success' ? '#e8f5e9' : '#ffebee',
                              color: exec.status === 'success' ? '#2e7d32' : '#c62828'
                            }}>
                              {exec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>
                  No recent executions
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{
            background: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ color: "#123456", marginBottom: "1.5rem" }}>My Profile</h2>
            {message && <div className="form-message">{message}</div>}
            <form onSubmit={handleProfileSubmit}>
              <label style={{ display: "block", marginBottom: "1rem" }}>
                <span style={{ display: "block", marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>
                  University:
                </span>
                <input
                  type="text"
                  name="university"
                  value={profile.university}
                  onChange={handleProfileChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
              </label>
              <label style={{ display: "block", marginBottom: "1rem" }}>
                <span style={{ display: "block", marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>
                  Major:
                </span>
                <input 
                  type="text" 
                  name="major" 
                  value={profile.major} 
                  onChange={handleProfileChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
              </label>
              <label style={{ display: "block", marginBottom: "1rem" }}>
                <span style={{ display: "block", marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>
                  Year of Study:
                </span>
                <input 
                  type="number" 
                  name="year" 
                  value={profile.year} 
                  onChange={handleProfileChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
              </label>
              <label style={{ display: "block", marginBottom: "1rem" }}>
                <span style={{ display: "block", marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>
                  Bio:
                </span>
                <textarea 
                  name="bio" 
                  value={profile.bio} 
                  onChange={handleProfileChange} 
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
              </label>
              <button type="submit" className="btn primary-btn">
                Save Profile
              </button>
            </form>
          </div>
        )}

        {activeTab === 'tools' && (
          <div>
            <h2 style={{ color: "#123456", marginBottom: "1.5rem" }}>Student Tools</h2>
            <div className="roles-cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
              <Link to="/exam-scheduler" className="role-card-link">
                <div className="role-card">
                  <h4>Exam Planner</h4>
                  <p>Generate a custom study schedule for your upcoming exams.</p>
                  <span className="role-card-cta">Go to Planner →</span>
                </div>
              </Link>
              <Link to="/assignment-submission" className="role-card-link">
                <div className="role-card">
                  <h4>Submit Assignment</h4>
                  <p>Use the portal to submit your course assignments.</p>
                  <span className="role-card-cta">Go to Portal →</span>
                </div>
              </Link>
              <Link to="/workspace" className="role-card-link">
                <div className="role-card">
                  <h4>Workflow Builder</h4>
                  <p>Create automated workflows for your academic tasks.</p>
                  <span className="role-card-cta">Build Workflow →</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;