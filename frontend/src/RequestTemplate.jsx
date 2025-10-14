// Complete updated RequestTemplate.jsx with client-side validations and key constraints

import React, { useState, useEffect } from "react";

const roles = ["Student", "Teacher", "Admin", "Other"];
const priorities = ["Low", "Medium", "High"];
const templateTypes = ["Attendance", "Grading", "Notification", "Custom"];

const initialState = {
  name: "",
  email: "",
  organization: "",
  role: "",
  templateType: "",
  description: "",
  priority: "Medium",
  contactPhone: "",
  requiredBy: "",
  complexity: "",
  expectedOutcome: "",
};

export default function RequestTemplate() {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      let url = "/api/request-template";
      if (searchTerm.trim()) {
        url += `?search=${encodeURIComponent(searchTerm.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  // Validation function including key constraints
  const validate = () => {
    const errs = {};
    if (!formData.name) errs.name = "Name is required";
    if (!formData.email || !/.+@.+\..+/.test(formData.email))
      errs.email = "Valid email required";
    if (!formData.organization) errs.organization = "Organization required";
    if (!formData.role) errs.role = "Role is required";
    if (!formData.templateType) errs.templateType = "Template Type is required";
    if (!formData.description || formData.description.length < 20)
      errs.description = "Description is required and must be at least 20 characters";
    if (!formData.requiredBy) errs.requiredBy = "Required By date is required";
    if (!formData.complexity) errs.complexity = "Complexity field is required";
    if (!formData.expectedOutcome) errs.expectedOutcome = "Expected outcome is required";
    if (
      formData.contactPhone &&
      !/^(\+?\d{1,4}[\s-])?(\d{7,13})$/.test(formData.contactPhone)
    )
      errs.contactPhone = "Enter a valid contact phone";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validate();
  setErrors(newErrors);
  setMessage("");
  
  if (Object.keys(newErrors).length === 0) {
    setIsSubmitting(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `/api/request-template/${editId}`
        : "/api/request-template";
        
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
        setErrors({});
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          setMessage(`❌ Submission failed: ${errData.error || "Unknown error"}`);
        } else {
          setMessage("❌ Server error: Backend route not configured");
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      setMessage(`❌ Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }
};

  const handleEdit = (record) => {
    setFormData({
      ...record,
      requiredBy: record.requiredBy ? record.requiredBy.substr(0, 10) : "",
    });
    setEditId(record._id);
    setMessage("");
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      const res = await fetch(`/api/request-template/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("Deleted successfully");
        fetchRequests();
        if (editId === id) {
          setFormData(initialState);
          setEditId(null);
        }
      } else {
        const errData = await res.json();
        setMessage(`Delete failed: ${errData.error || "Unknown error"}`);
      }
    } catch (error) {
      setMessage(`Delete failed: ${error.message}`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div>
      <nav className="navbar">
        <div className="logo-placeholder">
          <img src="/logo.png" alt="Autofy Logo" />
        </div>
        <ul className="navbar-menu">
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="#form-section">Form</a>
          </li>
        </ul>
      </nav>

      <div
        id="form-section"
        className="form-container"
        style={{ backgroundColor: "#1d7a85", color: "white" }}
      >
        <h2>{editId ? "Edit Template Request" : "Request a Template"}</h2>
        {message && <div className="form-message">{message}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </label>

          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </label>

          <label>
            Organization:
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
            />
            {errors.organization && (
              <span className="error-text">{errors.organization}</span>
            )}
          </label>

          <label>
            Role:
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && <span className="error-text">{errors.role}</span>}
          </label>

          <label>
            Template Type:
            <select
              name="templateType"
              value={formData.templateType}
              onChange={handleChange}
            >
              <option value="">Select Template Type</option>
              {templateTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.templateType && (
              <span className="error-text">{errors.templateType}</span>
            )}
          </label>

          <label>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
            {errors.description && (
              <span className="error-text">{errors.description}</span>
            )}
          </label>

          <label>
            Priority:
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label>
            Contact Phone:
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
            />
            {errors.contactPhone && (
              <span className="error-text">{errors.contactPhone}</span>
            )}
          </label>

          <label>
            Required By:
            <input
              type="date"
              name="requiredBy"
              value={formData.requiredBy}
              onChange={handleChange}
            />
            {errors.requiredBy && (
              <span className="error-text">{errors.requiredBy}</span>
            )}
          </label>

          <label>
            Complexity:
            <input
              type="text"
              name="complexity"
              value={formData.complexity}
              onChange={handleChange}
            />
            {errors.complexity && (
              <span className="error-text">{errors.complexity}</span>
            )}
          </label>

          <label>
            Expected Outcome:
            <textarea
              name="expectedOutcome"
              value={formData.expectedOutcome}
              onChange={handleChange}
              rows="2"
            />
            {errors.expectedOutcome && (
              <span className="error-text">{errors.expectedOutcome}</span>
            )}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn primary-btn"
          >
            {isSubmitting ? "Submitting..." : editId ? "Update" : "Submit"}
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
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div style={{ maxWidth: "900px", margin: "2rem auto", textAlign: "center" }}>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search by name, email, role, template type..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              padding: "0.5rem 1rem",
              width: "60%",
              maxWidth: "400px",
              borderRadius: "8px",
              border: "1.5px solid #1d7a85",
            }}
          />
          <button
            type="submit"
            className="btn primary-btn"
            style={{ marginLeft: "1rem" }}
          >
            Search
          </button>
          <button
            type="button"
            className="btn secondary-btn"
            style={{ marginLeft: "0.5rem" }}
            onClick={() => {
              setSearchTerm("");
              fetchRequests();
            }}
          >
            Clear
          </button>
        </form>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto 4rem", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#1d7a85", color: "white" }}>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Organization</th>
              <th>Role</th>
              <th>Template Type</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Contact Phone</th>
              <th>Required By</th>
              <th>Complexity</th>
              <th>Expected Outcome</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r, idx) => (
              <tr
                key={r._id}
                style={{ backgroundColor: idx % 2 === 0 ? "#f0f8ff" : "white" }}
              >
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.organization}</td>
                <td>{r.role}</td>
                <td>{r.templateType}</td>
                <td>{r.description}</td>
                <td>{r.priority}</td>
                <td>{r.contactPhone}</td>
                <td>{r.requiredBy ? new Date(r.requiredBy).toLocaleDateString() : ""}</td>
                <td>{r.complexity}</td>
                <td>{r.expectedOutcome}</td>
                <td>
                  <button
                    className="btn primary-btn"
                    onClick={() => handleEdit(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn secondary-btn"
                    style={{ marginLeft: "0.5rem" }}
                    onClick={() => handleDelete(r._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="12" style={{ textAlign: "center" }}>
                  No entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
