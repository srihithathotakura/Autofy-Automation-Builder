import React, { useState, useEffect } from "react";
const roles = ["Student", "Teacher", "Admin", "Other"];
const demoTypes = ["Intro Demo", "Feature Showcase", "Technical Deep Dive", "Custom Workflow Demo"];
const initialState = {
  name: "",
  email: "",
  organization: "",
  role: "",
  phone: "",
  preferredDate: "",
  demoType: "",
  questions: "",
  status: "",
  attendees: 0,
  durationMinutes: 30,
};
export default function RequestDemo() {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => { fetchRequests(); }, [searchTerm]);
  const fetchRequests = async () => {
    let url = "/api/request-demo";
    if (searchTerm.trim()) url += `?search=${encodeURIComponent(searchTerm.trim())}`;
    const res = await fetch(url);
    const data = await res.json();
    setRequests(data);
  };
  const validate = () => {
    const errs = {};
    if (!formData.name) errs.name = "Name is required";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Valid email required";
    if (!formData.organization) errs.organization = "Organization required";
    if (!formData.role) errs.role = "Role is required";
    if (!formData.phone) errs.phone = "Phone number required";
    if (!formData.preferredDate) errs.preferredDate = "Preferred Date required";
    if (!formData.demoType) errs.demoType = "Demo Type is required";
    if (!formData.status) errs.status = "Status is required";
    if (formData.attendees < 0) errs.attendees = "Attendees cannot be negative";
    if (formData.durationMinutes < 1) errs.durationMinutes = "Duration must be positive";
    return errs;
  };
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? Number(value) : value;
    setFormData((f) => ({ ...f, [name]: val }));
  };
  const handleSubmit = async (e) => {
  e.preventDefault();
  const errs = validate();
  setErrors(errs);
  setMessage("");
  
  if (Object.keys(errs).length === 0) {
    setIsSubmitting(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId 
        ? `/api/request-demo/${editId}` 
        : "/api/request-demo";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessage(editId ? "✅ Updated successfully" : "✅ Submitted successfully");
        setFormData(initialState);
        setEditId(null);
        fetchRequests();
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          setMessage("❌ Failed: " + (errData.error || "Unknown error"));
        } else {
          // Getting HTML instead of JSON - backend route not found
          setMessage("❌ Server error: Backend route not configured. Check server.js");
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      setMessage("❌ Failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }
};
  const handleEdit = (request) => {
    setFormData({ ...request, preferredDate: request.preferredDate ? request.preferredDate.substr(0, 10) : "" });
    setEditId(request._id);
    setMessage("");
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete?")) return;
    try {
      const res = await fetch(`/api/request-demo/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("Deleted successfully");
        fetchRequests();
        if (editId === id) {
          setFormData(initialState);
          setEditId(null);
        }
      } else {
        setMessage("Delete failed");
      }
    } catch (err) {
      setMessage("Delete failed: " + err.message);
    }
  };
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => { e.preventDefault(); fetchRequests(); };
  const formContainerStyle = {
    maxWidth: "700px",
    margin: "4rem auto",
    padding: "2.5rem 3rem",
    backgroundColor: "#123456",
    borderRadius: "12px",
    boxShadow: "0 12px 40px rgb(18, 52, 86, 0.6)",
    color: "white",
    fontFamily: "IBM Plex Sans, sans-serif",
  };
  return (
    <div>
      <nav className="navbar">
        <div className="logo-placeholder">
          <img src="logo.png" alt="Autofy Logo" />
        </div>
        <ul className="navbar-menu">
          <li><a href="/">Home</a></li>
        </ul>
      </nav>
      <div className="form-container" id="form-section" style={formContainerStyle}>
        <h2>{editId ? "Edit Demo Request" : "Request a Demo"}</h2>
        <div className="form-message">{message}</div>
        <form onSubmit={handleSubmit} noValidate>
          <label>Name
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
            <span className="error-text">{errors.name}</span>
          </label>
          <label>Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
            <span className="error-text">{errors.email}</span>
          </label>
          <label>Organization
            <input type="text" name="organization" value={formData.organization} onChange={handleChange} />
            <span className="error-text">{errors.organization}</span>
          </label>
          <label>Role
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <span className="error-text">{errors.role}</span>
          </label>
          <label>Phone Number
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            <span className="error-text">{errors.phone}</span>
          </label>
          <label>Preferred Demo Date
            <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} />
            <span className="error-text">{errors.preferredDate}</span>
          </label>
          <label>Demo Type
            <select name="demoType" value={formData.demoType} onChange={handleChange}>
              <option value="">Select Demo Type</option>
              {demoTypes.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <span className="error-text">{errors.demoType}</span>
          </label>
          <label>Status
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="error-text">{errors.status}</span>
          </label>
          <label>Number of Attendees
            <input type="number" min="0" name="attendees" value={formData.attendees} onChange={handleChange} />
            <span className="error-text">{errors.attendees}</span>
          </label>
          <label>Duration in Minutes
            <input type="number" min="1" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} />
            <span className="error-text">{errors.durationMinutes}</span>
          </label>
          <label>Questions or Comments
            <textarea name="questions" value={formData.questions} onChange={handleChange} rows={3} />
          </label>
          <button type="submit" disabled={isSubmitting} className="btn primary-btn">
            {isSubmitting ? "Submitting..." : (editId ? "Update" : "Submit")}
          </button>
          {editId && (
            <button
              type="button"
              className="btn secondary-btn"
              onClick={() => {
                setEditId(null);
                setFormData(initialState);
                setErrors({});
                setMessage("");
              }}
            >Cancel Edit</button>
          )}
        </form>
      </div>
      <div style={{ maxWidth: "900px", margin: "2rem auto", textAlign: "center" }}>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search by name, email, role..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              padding: "0.5rem 1rem",
              width: "60%",
              maxWidth: "400px",
              borderRadius: "8px",
              border: "1.5px solid #123456",
            }}
          />
          <button type="submit" className="btn primary-btn" style={{ marginLeft: "1rem" }}>Search</button>
          <button
            type="button"
            className="btn secondary-btn"
            style={{ marginLeft: "0.5rem" }}
            onClick={() => {
              setSearchTerm("");
              fetchRequests();
            }}
          >Clear</button>
        </form>
      </div>
      <div style={{ maxWidth: "900px", margin: "0 auto 4rem", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white", color: "black" }}>
          <thead style={{ backgroundColor: "#123456", color: "white" }}>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Organization</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Preferred Date</th>
              <th>Demo Type</th>
              <th>Status</th>
              <th>Attendees</th>
              <th>Duration (min)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0
              ? requests.map((r, idx) => (
                  <tr key={r._id || idx} style={{ backgroundColor: idx % 2 === 0 ? "#f0f8ff" : "white" }}>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.organization}</td>
                    <td>{r.role}</td>
                    <td>{r.phone}</td>
                    <td>{r.preferredDate ? new Date(r.preferredDate).toLocaleDateString() : ""}</td>
                    <td>{r.demoType}</td>
                    <td>{r.status}</td>
                    <td>{r.attendees}</td>
                    <td>{r.durationMinutes}</td>
                    <td>
                      <button className="btn primary-btn" onClick={() => handleEdit(r)}>Edit</button>
                      <button className="btn secondary-btn" style={{ marginLeft: "0.5rem" }} onClick={() => handleDelete(r._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              : (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center" }}>No entries found</td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
