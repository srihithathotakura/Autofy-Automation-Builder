import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

const AssignmentSubmission = () => {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!studentName || !studentId || !courseName || !file) {
    setMessage("❌ Please fill out all required fields and select a file.");
    return;
  }
  
  const formData = new FormData();
  formData.append("studentName", studentName);
  formData.append("studentId", studentId);
  formData.append("courseName", courseName);
  formData.append("file", file);

  setIsSubmitting(true);
  setMessage("Submitting your assignment...");
  
  try {
    const response = await fetch("/api/assignment-submission", {
      method: "POST",
      body: formData, // Don't set Content-Type for FormData
    });

    if (response.ok) {
      const data = await response.json();
      setMessage(`✅ Success! Your assignment for ${courseName} has been submitted.`);
      setStudentName("");
      setStudentId("");
      setCourseName("");
      setFile(null);
      e.target.reset();
    } else {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errData = await response.json();
        setMessage(`❌ Submission failed: ${errData.error || "Unknown error"}`);
      } else {
        setMessage("❌ Server error: Assignment submission route not configured");
      }
    }
  } catch (error) {
    console.error('Submit error:', error);
    setMessage("❌ Submission failed: " + error.message);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div>
      <nav className="navbar">
        <div className="logo-placeholder">
          <Link to="/">
            <img src="logo.png" alt="Autofy Logo" />
          </Link>
        </div>
        <ul className="navbar-menu">
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>
      <div className="form-container" style={{ backgroundColor: "#123456" }}>
        <h2>Assignment Submission Portal</h2>
        <div className="form-message">{message}</div>
        <form onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
            />
          </label>
          <label>
            Student ID
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </label>
          <label>
            Course Name
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            />
          </label>
          <label>
            Upload File
            <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
          </label>
          <button type="submit" disabled={isSubmitting} className="btn primary-btn">
            {isSubmitting ? "Submitting..." : "Submit Assignment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignmentSubmission;
