import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from "./components/Navbar";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [workflowStats, setWorkflowStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const teacherId = localStorage.getItem('userId');
  
  // Form states
  const [studentForm, setStudentForm] = useState({
    name: '', email: '', studentId: '', course: ''
  });
  const [courseForm, setCourseForm] = useState({
    name: '', courseCode: '', description: ''
  });
  const [gradeForm, setGradeForm] = useState({
    studentIdentifier: '', assignmentName: '', score: '', totalPoints: '', course: ''
  });
  
  const [message, setMessage] = useState('');

  // Check authentication and role
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Teacher') {
      navigate('/login');
    } else {
      fetchAllData();
    }
  }, [navigate]);

  // Refresh data when switching tabs
  useEffect(() => {
    if (activeTab === 'grades' || activeTab === 'analytics') {
      fetchGrades();
    }
    if (activeTab === 'workflows') {
      fetchWorkflows();
    }
  }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStudents(),
      fetchCourses(),
      fetchGrades(),
      fetchWorkflows()
    ]);
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/students?teacherId=${teacherId}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/courses?teacherId=${teacherId}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`/api/grades?teacherId=${teacherId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Grades fetched:', data.length);
        setGrades(data);
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const res = await fetch(`/api/workflows/user/${teacherId}`);
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
      }
      
      const statsRes = await fetch(`/api/workflows/stats/${teacherId}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setWorkflowStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching workflows:', err);
    }
  };

  // Student handlers
  const handleStudentChange = (e) => {
    setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...studentForm, teacherId })
      });

      if (res.ok) {
        setMessage('✅ Student added successfully!');
        setStudentForm({ name: '', email: '', studentId: '', course: '' });
        await fetchStudents();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await res.json();
        setMessage('❌ Failed to add student: ' + (error.error || ''));
      }
    } catch (err) {
      setMessage('❌ Error adding student: ' + err.message);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('✅ Student deleted successfully');
        await fetchStudents();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Error deleting student: ' + err.message);
    }
  };

  // Course handlers
  const handleCourseChange = (e) => {
    setCourseForm({ ...courseForm, [e.target.name]: e.target.value });
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseForm)
      });

      if (res.ok) {
        setMessage('✅ Course created successfully!');
        setCourseForm({ name: '', courseCode: '', description: '' });
        await fetchCourses();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await res.json();
        setMessage('❌ Failed to create course: ' + (error.error || ''));
      }
    } catch (err) {
      setMessage('❌ Error creating course: ' + err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('✅ Course deleted successfully');
        await fetchCourses();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Error deleting course: ' + err.message);
    }
  };

  // Grade handlers
  const handleGradeChange = (e) => {
    setGradeForm({ ...gradeForm, [e.target.name]: e.target.value });
  };

const handleGradeSubmit = async (e) => {
  e.preventDefault();
  
  console.log('Submitting grade:', gradeForm);
  
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      setMessage('❌ Please login again');
      return;
    }
    
    const res = await fetch('/api/grades', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        course: gradeForm.course,
        studentIdentifier: gradeForm.studentIdentifier,
        assignmentName: gradeForm.assignmentName,
        score: Number(gradeForm.score),
        totalPoints: Number(gradeForm.totalPoints)
      })
    });

    if (res.ok) {
      const newGrade = await res.json();
      console.log('✓ Grade added:', newGrade);
      
      setMessage('✅ Grade added successfully!');
      setGradeForm({ 
        studentIdentifier: '', 
        assignmentName: '', 
        score: '', 
        totalPoints: '', 
        course: '' 
      });
      
      // Immediately fetch grades to refresh the list
      await fetchGrades();
      
      setTimeout(() => setMessage(''), 3000);
    } else {
      const error = await res.json();
      console.error('Grade submission failed:', error);
      setMessage('❌ Failed to add grade: ' + (error.error || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error adding grade:', err);
    setMessage('❌ Error adding grade: ' + err.message);
  }
};


  const handleDeleteGrade = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grade?')) return;
    
    try {
      const res = await fetch(`/api/grades/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('✅ Grade deleted successfully');
        await fetchGrades();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Error deleting grade: ' + err.message);
    }
  };

  // Calculate statistics
  const gradeDistribution = React.useMemo(() => {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    grades.forEach(grade => {
      const percentage = (grade.score / grade.totalPoints) * 100;
      if (percentage >= 90) distribution.A++;
      else if (percentage >= 80) distribution.B++;
      else if (percentage >= 70) distribution.C++;
      else if (percentage >= 60) distribution.D++;
      else distribution.F++;
    });
    return Object.entries(distribution).map(([grade, count]) => ({ grade, count }));
  }, [grades]);

  const studentsByCourse = React.useMemo(() => {
    const courseCount = {};
    students.forEach(student => {
      courseCount[student.course] = (courseCount[student.course] || 0) + 1;
    });
    return Object.entries(courseCount).map(([course, count]) => ({ course, count }));
  }, [students]);

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#f44336', '#9C27B0'];

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div className="spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div style={{ maxWidth: "1400px", margin: "2rem auto", padding: "0 2rem" }}>
        <h1 style={{ color: "#123456", marginBottom: "2rem" }}>Teacher Dashboard</h1>

        {/* Stats Cards */}
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
            <h2 style={{ margin: 0, fontSize: "2rem" }}>{students.length}</h2>
            <p style={{ margin: "0.5rem 0 0 0" }}>Total Students</p>
          </div>
          <div style={{
            background: "#123456",
            color: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center"
          }}>
            <h2 style={{ margin: 0, fontSize: "2rem" }}>{courses.length}</h2>
            <p style={{ margin: "0.5rem 0 0 0" }}>Total Courses</p>
          </div>
          <div style={{
            background: "#4CAF50",
            color: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center"
          }}>
            <h2 style={{ margin: 0, fontSize: "2rem" }}>{grades.length}</h2>
            <p style={{ margin: "0.5rem 0 0 0" }}>Grades Entered</p>
          </div>
          <div style={{
            background: "#FF9800",
            color: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center"
          }}>
            <h2 style={{ margin: 0, fontSize: "2rem" }}>
              {grades.length > 0 ? (grades.reduce((sum, g) => sum + (g.score / g.totalPoints * 100), 0) / grades.length).toFixed(1) : 0}%
            </h2>
            <p style={{ margin: "0.5rem 0 0 0" }}>Average Grade</p>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
            color: message.includes('✅') ? '#2e7d32' : '#c62828',
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "600"
          }}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div style={{ marginBottom: "2rem", borderBottom: "2px solid #e0e0e0" }}>
          {['overview', 'students', 'courses', 'grades', 'analytics', 'workflows'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "1rem 2rem",
                background: activeTab === tab ? '#1d7a85' : 'transparent',
                color: activeTab === tab ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #123456' : 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ color: "#123456", marginBottom: "1.5rem" }}>Class Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
              <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ color: "#123456", marginBottom: "1rem" }}>Grade Distribution</h3>
                {grades.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={gradeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ grade, count }) => count > 0 ? `${grade}: ${count}` : null}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No grades data yet</p>
                )}
              </div>
              <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ color: "#123456", marginBottom: "1rem" }}>Students by Course</h3>
                {students.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studentsByCourse}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="course" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1d7a85" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No students data yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h2 style={{ color: "#123456", marginBottom: "1.5rem" }}>Manage Students</h2>
            
            {/* Add Student Form */}
            <div style={{ background: "white", padding: "2rem", borderRadius: "12px", marginBottom: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <h3 style={{ color: "#123456", marginTop: 0 }}>Add New Student</h3>
              <form onSubmit={handleStudentSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <label style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Name:</span>
                    <input
                      type="text"
                      name="name"
                      value={studentForm.name}
                      onChange={handleStudentChange}
                      required
                      style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Email:</span>
                    <input
                      type="email"
                      name="email"
                      value={studentForm.email}
                      onChange={handleStudentChange}
                      required
                      style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Student ID:</span>
                    <input
                      type="text"
                      name="studentId"
                      value={studentForm.studentId}
                      onChange={handleStudentChange}
                      required
                      style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Course:</span>
                    <input
                      type="text"
                      name="course"
                      value={studentForm.course}
                      onChange={handleStudentChange}
                      required
                      style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                    />
                  </label>
                </div>
                <button type="submit" className="btn primary-btn">Add Student</button>
              </form>
            </div>

            {/* Students List */}
            <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <h3 style={{ color: "#123456", marginTop: 0 }}>Current Students ({students.length})</h3>
              {students.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f5f5f5" }}>
                      <tr>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Name</th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Email</th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Student ID</th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Course</th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student._id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                          <td style={{ padding: "1rem" }}>{student.name}</td>
                          <td style={{ padding: "1rem" }}>{student.email}</td>
                          <td style={{ padding: "1rem" }}>{student.studentId}</td>
                          <td style={{ padding: "1rem" }}>{student.course}</td>
                          <td style={{ padding: "1rem" }}>
                            <button onClick={() => handleDeleteStudent(student._id)} className="btn danger-btn btn-sm">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No students added yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <h2 style={{ color: "#123456", marginBottom: "1.5rem" }}>Manage Courses</h2>
            
            {/* Add Course Form */}
            <div style={{ background: "white", padding: "2rem", borderRadius: "12px", marginBottom: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <h3 style={{ color: "#123456", marginTop: 0 }}>Create New Course</h3>
              <form onSubmit={handleCourseSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <label style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Course Name:</span>
                    <input
                      type="text"
                      name="name"
                      value={courseForm.name}
                      onChange={handleCourseChange}
                      required
                      style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Course Code:</span>
                    <input
                      type="text"
                      name="courseCode"
                      value={courseForm.courseCode}
                      onChange={handleCourseChange}
                      required
                      style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                    />
                  </label>
                </div>
                <label style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
                  <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Description:</span>
                  <textarea
                    name="description"
                    value={courseForm.description}
                    onChange={handleCourseChange}
                    rows={3}
                    style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                  />
                </label>
                <button type="submit" className="btn primary-btn">Create Course</button>
              </form>
            </div>

            {/* Courses List */}
            <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <h3 style={{ color: "#123456", marginTop: 0 }}>Your Courses ({courses.length})</h3>
              {courses.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {courses.map((course) => (
                    <div key={course._id} style={{
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start"
                    }}>
                      <div>
                        <h4 style={{ margin: "0 0 0.5rem 0", color: "#123456" }}>{course.name}</h4>
                        <p style={{ margin: "0.25rem 0", color: "#666" }}>Code: {course.courseCode}</p>
                        {course.description && <p style={{ margin: "0.5rem 0 0 0", color: "#666" }}>{course.description}</p>}
                      </div>
                      <button onClick={() => handleDeleteCourse(course._id)} className="btn danger-btn btn-sm">
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No courses created yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div>
            <h2 style={{ color: "#123456", marginBottom: "1.5rem" }}>Manage Grades</h2>
            
            {/* Add Grade Form */}
            <div style={{ background: "white", padding: "2rem", borderRadius: "12px", marginBottom: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <h3 style={{ color: "#123456", marginTop: 0 }}>Add New Grade</h3>
              <form onSubmit={handleGradeSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <label style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Student ID/Name:</span>
                    <input
                      type="text"
                      name="studentIdentifier"
                      value={gradeForm.studentIdentifier}
                      onChange={handleGradeChange}
                      required
                      placeholder="e.g., STU001 or John Doe"
                      style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Assignment Name:</span>
                    <input
                      type="text"
                      name="assignmentName"
                      value={gradeForm.assignmentName}
                      onChange={handleGradeChange}
                      required
                      placeholder="e.g., Midterm Exam"
                      style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Score:</span>
                    <input
                      type="number"
                      name="score"
                      value={gradeForm.score}
                      onChange={handleGradeChange}
                      required
                      min="0"
                      placeholder="e.g., 85"
                      style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Total Points:</span>
                    <input
                      type="number"
                      name="totalPoints"
                      value={gradeForm.totalPoints}
                      onChange={handleGradeChange}
                      required
                      min="1"
                      placeholder="e.g., 100"
                      style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gridColumn: "1 / -1" }}>
                    <span style={{ marginBottom: "0.5rem", color: "#123456", fontWeight: "600" }}>Course:</span>
                    <input
                      type="text"
                      name="course"
                      value={gradeForm.course}
                      onChange={handleGradeChange}
                      required
                      placeholder="e.g., Mathematics"
                      style={{ padding: "0.75rem", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem" }}
                    />
                  </label>
                </div>
                <button type="submit" className="btn primary-btn">Add Grade</button>
              </form>
            </div>

            {/* Grades List */}
            <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <h3 style={{ color: "#123456", marginTop: 0 }}>Grade Records ({grades.length})</h3>
              {grades.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f5f5f5" }}>
                      <tr>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Student</th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Assignment</th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Course</th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Score</th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Percentage</th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => (
                        <tr key={grade._id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                          <td style={{ padding: "1rem" }}>{grade.studentIdentifier}</td>
                          <td style={{ padding: "1rem" }}>{grade.assignmentName}</td>
                          <td style={{ padding: "1rem" }}>{grade.course}</td>
                          <td style={{ padding: "1rem" }}>{grade.score}/{grade.totalPoints}</td>
                          <td style={{ padding: "1rem" }}>
                            <span style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "4px",
                              background: ((grade.score / grade.totalPoints) * 100) >= 70 ? '#e8f5e9' : '#ffebee',
                              color: ((grade.score / grade.totalPoints) * 100) >= 70 ? '#2e7d32' : '#c62828',
                              fontWeight: "600"
                            }}>
                              {((grade.score / grade.totalPoints) * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <button onClick={() => handleDeleteGrade(grade._id)} className="btn danger-btn btn-sm">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No grades entered yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ color: "#123456", marginBottom: "1.5rem" }}>Analytics Dashboard</h2>
            {grades.length > 0 || students.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
                <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ color: "#123456", marginBottom: "1rem" }}>Grade Distribution</h3>
                  {grades.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#1d7a85" name="Number of Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No grades data available</p>
                  )}
                </div>
                <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ color: "#123456", marginBottom: "1rem" }}>Students per Course</h3>
                  {students.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={studentsByCourse}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="course" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#123456" name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No student data available</p>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ background: "white", padding: "3rem", borderRadius: "12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h3 style={{ color: "#666" }}>No Data Available</h3>
                <p style={{ color: "#999" }}>Add students and grades to see analytics</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'workflows' && (
          <div>
            <h2 style={{ color: "#123456", marginBottom: "1.5rem" }}>Workflow Analytics</h2>
            
            {workflowStats && (
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
                  <h2 style={{ margin: 0, fontSize: "2rem" }}>{workflowStats.totalWorkflows}</h2>
                  <p style={{ margin: "0.5rem 0 0 0" }}>Total Workflows</p>
                </div>
                <div style={{
                  background: "#4CAF50",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  textAlign: "center"
                }}>
                  <h2 style={{ margin: 0, fontSize: "2rem" }}>{workflowStats.totalExecutions}</h2>
                  <p style={{ margin: "0.5rem 0 0 0" }}>Total Executions</p>
                </div>
                <div style={{
                  background: "#FF9800",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  textAlign: "center"
                }}>
                  <h2 style={{ margin: 0, fontSize: "2rem" }}>{workflowStats.averageSuccessRate}%</h2>
                  <p style={{ margin: "0.5rem 0 0 0" }}>Success Rate</p>
                </div>
                <div style={{
                  background: "#2196F3",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  textAlign: "center"
                }}>
                  <h2 style={{ margin: 0, fontSize: "2rem" }}>{workflowStats.activeWorkflows}</h2>
                  <p style={{ margin: "0.5rem 0 0 0" }}>Active Workflows</p>
                </div>
              </div>
            )}

            <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#123456", margin: 0 }}>My Workflows ({workflows.length})</h3>
                <button 
                  onClick={() => navigate('/workspace')}
                  className="btn primary-btn"
                >
                  + Create Workflow
                </button>
              </div>
              
              {workflows.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {workflows.map((workflow) => (
                    <div key={workflow._id} style={{
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      transition: "all 0.3s ease"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 0.5rem 0", color: "#123456", fontSize: "1.2rem" }}>
                            {workflow.name}
                          </h4>
                          <div style={{ display: "flex", gap: "2rem", marginTop: "0.75rem" }}>
                            <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.95rem" }}>
                              <strong>Steps:</strong> {workflow.steps.length}
                            </p>
                            <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.95rem" }}>
                              <strong>Executions:</strong> {workflow.executionCount}
                            </p>
                            <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.95rem" }}>
                              <strong>Success:</strong> {workflow.successCount}
                            </p>
                            <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.95rem" }}>
                              <strong>Failed:</strong> {workflow.failureCount}
                            </p>
                          </div>
                          <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
                            Success Rate: <span style={{ 
                              color: parseFloat(workflow.successRate) >= 70 ? '#4CAF50' : '#f44336', 
                              fontWeight: "700",
                              fontSize: "1.1rem"
                            }}>
                              {workflow.successRate}%
                            </span>
                          </p>
                          {workflow.lastExecuted && (
                            <p style={{ margin: "0.5rem 0 0 0", color: "#999", fontSize: "0.85rem" }}>
                              Last executed: {new Date(workflow.lastExecuted).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <span style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          background: workflow.isActive ? '#e8f5e9' : '#ffebee',
                          color: workflow.isActive ? '#2e7d32' : '#c62828',
                          fontWeight: "600",
                          fontSize: "0.9rem"
                        }}>
                          {workflow.isActive ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
                  <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>No workflows created yet</p>
                  <p style={{ marginBottom: "1.5rem" }}>Create your first workflow to automate your teaching tasks</p>
                  <button 
                    onClick={() => navigate('/workspace')}
                    className="btn primary-btn"
                  >
                    Create Your First Workflow
                  </button>
                </div>
              )}
            </div>

            {workflowStats && workflowStats.recentExecutions && workflowStats.recentExecutions.length > 0 && (
              <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginTop: "2rem" }}>
                <h3 style={{ color: "#123456", marginTop: 0 }}>Recent Executions</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f5f5f5" }}>
                      <tr>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Workflow</th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Executed At</th>
                        <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workflowStats.recentExecutions.map((exec, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #e0e0e0" }}>
                          <td style={{ padding: "1rem" }}>{exec.workflowName}</td>
                          <td style={{ padding: "1rem" }}>{new Date(exec.executedAt).toLocaleString()}</td>
                          <td style={{ padding: "1rem" }}>
                            <span style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "4px",
                              fontSize: "0.85rem",
                              background: exec.status === 'success' ? '#e8f5e9' : '#ffebee',
                              color: exec.status === 'success' ? '#2e7d32' : '#c62828',
                              fontWeight: "600"
                            }}>
                              {exec.status === 'success' ? '✓ Success' : '✗ Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;