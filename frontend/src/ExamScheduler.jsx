import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ExamScheduler = () => {
  const navigate = useNavigate();
  const initialState = {
    studentName: "",
    email: "",
    examName: "",
    examDate: "",
    topics: "",
    studyHoursPerDay: 2,
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.studentName) errs.studentName = "Your name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      errs.email = "A valid email is required";
    if (!formData.examName) errs.examName = "Exam name is required";
    if (!formData.examDate) errs.examDate = "Exam date is required";
    if (!formData.topics) errs.topics = "Please list topics and their difficulty";
    if (formData.studyHoursPerDay < 1 || formData.studyHoursPerDay > 12)
      errs.studyHoursPerDay = "Study hours should be between 1 and 12";
    return errs;
  };

  const generateStudySchedule = (topicsInput, examDateStr, studyHours) => {
    // Parse topics from input
    const topicLines = topicsInput.split('\n').filter(line => line.trim());
    const topics = topicLines.map(line => {
      const parts = line.split('-').map(p => p.trim());
      return {
        name: parts[0] || line.trim(),
        difficulty: parts[1] || 'Medium'
      };
    });

    // Calculate days until exam
    const examDate = new Date(examDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExam < 1) {
      return {
        error: "Exam date must be in the future!",
        schedule: []
      };
    }

    // Assign hours based on difficulty
    const difficultyHours = {
      'Easy': 1,
      'Medium': 2,
      'Hard': 3,
      'Very Hard': 4
    };

    const topicsWithHours = topics.map(topic => ({
      ...topic,
      hours: difficultyHours[topic.difficulty] || 2
    }));

    const totalHoursNeeded = topicsWithHours.reduce((sum, t) => sum + t.hours, 0);
    const totalHoursAvailable = daysUntilExam * studyHours;

    // Generate day-wise schedule
    const dailySchedule = [];
    let currentDay = 1;
    let hoursRemainingToday = studyHours;
    let currentDayTopics = [];
    
    for (let topic of topicsWithHours) {
      let hoursLeft = topic.hours;
      
      while (hoursLeft > 0) {
        if (hoursRemainingToday >= hoursLeft) {
          // Topic fits in current day
          currentDayTopics.push({
            name: topic.name,
            hours: hoursLeft,
            difficulty: topic.difficulty
          });
          hoursRemainingToday -= hoursLeft;
          hoursLeft = 0;
        } else if (hoursRemainingToday > 0) {
          // Split topic across days
          currentDayTopics.push({
            name: topic.name,
            hours: hoursRemainingToday,
            difficulty: topic.difficulty
          });
          hoursLeft -= hoursRemainingToday;
          hoursRemainingToday = 0;
        }
        
        // Move to next day if current day is full
        if (hoursRemainingToday === 0) {
          const dayDate = new Date(today);
          dayDate.setDate(today.getDate() + currentDay - 1);
          
          dailySchedule.push({
            day: currentDay,
            date: dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
            topics: [...currentDayTopics],
            totalHours: studyHours
          });
          
          currentDay++;
          currentDayTopics = [];
          hoursRemainingToday = studyHours;
        }
      }
    }
    
    // Add last day if there are remaining topics
    if (currentDayTopics.length > 0) {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() + currentDay - 1);
      
      dailySchedule.push({
        day: currentDay,
        date: dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        topics: [...currentDayTopics],
        totalHours: studyHours - hoursRemainingToday
      });
    }

    // Add revision days if time permits
    const daysUsed = dailySchedule.length;
    if (daysUsed < daysUntilExam - 1) {
      const revisionDays = Math.min(2, daysUntilExam - daysUsed - 1);
      for (let i = 0; i < revisionDays; i++) {
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() + daysUsed + i);
        
        dailySchedule.push({
          day: daysUsed + i + 1,
          date: dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
          topics: [{ name: 'Revision & Practice Tests', hours: studyHours, difficulty: 'Review' }],
          totalHours: studyHours
        });
      }
    }

    return {
      error: null,
      schedule: dailySchedule,
      stats: {
        totalTopics: topics.length,
        totalHoursNeeded,
        totalHoursAvailable,
        daysUntilExam,
        daysNeeded: dailySchedule.length,
        efficiency: totalHoursAvailable > 0 ? ((totalHoursNeeded / totalHoursAvailable) * 100).toFixed(1) : 0
      }
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setSchedule(null);
    
    if (Object.keys(errs).length === 0) {
      setIsSubmitting(true);
      setTimeout(() => {
        const result = generateStudySchedule(formData.topics, formData.examDate, formData.studyHoursPerDay);
        
        if (result.error) {
          setMessage(result.error);
          setSchedule(null);
        } else {
          setSchedule(result);
          setMessage("Study schedule generated successfully!");
        }
        
        setIsSubmitting(false);
      }, 800);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownload = () => {
    if (!schedule || !schedule.schedule) return;
    
    let content = `STUDY SCHEDULE FOR ${formData.examName.toUpperCase()}\n`;
    content += `Student: ${formData.studentName}\n`;
    content += `Exam Date: ${formData.examDate}\n`;
    content += `Study Hours per Day: ${formData.studyHoursPerDay} hours\n`;
    content += `\n${'='.repeat(60)}\n\n`;
    
    if (schedule.stats) {
      content += `OVERVIEW:\n`;
      content += `- Total Topics: ${schedule.stats.totalTopics}\n`;
      content += `- Days Until Exam: ${schedule.stats.daysUntilExam}\n`;
      content += `- Days Needed: ${schedule.stats.daysNeeded}\n`;
      content += `- Total Study Hours Required: ${schedule.stats.totalHoursNeeded} hours\n`;
      content += `- Schedule Efficiency: ${schedule.stats.efficiency}%\n`;
      content += `\n${'='.repeat(60)}\n\n`;
    }
    
    content += `DAY-WISE SCHEDULE:\n\n`;
    
    schedule.schedule.forEach((day) => {
      content += `DAY ${day.day}: ${day.date}\n`;
      content += `${'-'.repeat(60)}\n`;
      day.topics.forEach((topic, idx) => {
        content += `  ${idx + 1}. ${topic.name} (${topic.hours}h) - ${topic.difficulty}\n`;
      });
      content += `  Total Hours: ${day.totalHours} hours\n\n`;
    });
    
    content += `\n${'='.repeat(60)}\n`;
    content += `\nTIPS FOR SUCCESS:\n`;
    content += `- Take short breaks every 45-50 minutes\n`;
    content += `- Stay hydrated and maintain a healthy sleep schedule\n`;
    content += `- Review previous topics regularly\n`;
    content += `- Practice with mock tests\n`;
    content += `- Stay focused and avoid distractions\n`;
    content += `\nGood luck with your exam preparation! 📚\n`;
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `study-plan-${formData.examName.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
          <li><button onClick={() => navigate('/dashboard')} className="btn secondary-btn btn-sm">Back to Dashboard</button></li>
        </ul>
      </nav>
      
      <div className="form-container" style={{ backgroundColor: "#1d7a85", maxWidth: "800px" }}>
        <h2>📚 Exam Study Planner</h2>
        <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Get a personalized day-wise study schedule based on your topics and exam date
        </p>
        
        {message && <div className="form-message">{message}</div>}
        
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Your Name
            <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} />
            <span className="error-text">{errors.studentName}</span>
          </label>
          
          <label>
            Your Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
            <span className="error-text">{errors.email}</span>
          </label>
          
          <label>
            Exam Name
            <input type="text" name="examName" value={formData.examName} onChange={handleChange} placeholder="e.g., Biology Mid-term" />
            <span className="error-text">{errors.examName}</span>
          </label>
          
          <label>
            Exam Date
            <input type="date" name="examDate" value={formData.examDate} onChange={handleChange} />
            <span className="error-text">{errors.examDate}</span>
          </label>
          
          <label>
            Study Hours Available Per Day
            <input 
              type="number" 
              name="studyHoursPerDay" 
              value={formData.studyHoursPerDay} 
              onChange={handleChange}
              min="1"
              max="12"
            />
            <span className="error-text">{errors.studyHoursPerDay}</span>
          </label>
          
          <label>
            Topics with Difficulty Level
            <textarea
              name="topics"
              value={formData.topics}
              onChange={handleChange}
              rows={6}
              placeholder="Enter each topic on a new line with difficulty:&#10;Photosynthesis - Hard&#10;Cell Division - Medium&#10;Genetics - Easy&#10;Ecosystem - Medium"
            />
            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", marginTop: "0.5rem", display: "block" }}>
              Format: Topic Name - Difficulty (Easy/Medium/Hard/Very Hard)
            </span>
            <span className="error-text">{errors.topics}</span>
          </label>
          
          <button type="submit" disabled={isSubmitting} className="btn primary-btn">
            {isSubmitting ? "Generating..." : "🎯 Generate My Study Schedule"}
          </button>
        </form>
        
        {schedule && schedule.schedule && (
          <div style={{ 
            marginTop: "2rem", 
            padding: "2rem", 
            background: "rgba(255,255,255,0.95)",
            borderRadius: "12px",
            color: "#123456"
          }}>
            <h3 style={{ marginTop: 0, color: "#123456" }}>📅 Your Personalized Study Plan</h3>
            
            {schedule.stats && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
                padding: "1rem",
                background: "#f0f8ff",
                borderRadius: "8px"
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1d7a85" }}>
                    {schedule.stats.totalTopics}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>Topics</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1d7a85" }}>
                    {schedule.stats.daysUntilExam}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>Days to Exam</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1d7a85" }}>
                    {schedule.stats.totalHoursNeeded}h
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>Study Hours</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1d7a85" }}>
                    {schedule.stats.efficiency}%
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>Efficiency</div>
                </div>
              </div>
            )}
            
            <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "1.5rem" }}>
              {schedule.schedule.map((day, index) => (
                <div key={index} style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#ffffff",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "2px solid #1d7a85"
                  }}>
                    <h4 style={{ margin: 0, color: "#1d7a85" }}>Day {day.day}</h4>
                    <span style={{ color: "#666", fontSize: "0.9rem" }}>{day.date}</span>
                  </div>
                  
                  {day.topics.map((topic, idx) => (
                    <div key={idx} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.5rem",
                      background: "#f9fafb",
                      borderRadius: "4px",
                      marginBottom: "0.5rem"
                    }}>
                      <span style={{ fontWeight: "500" }}>{topic.name}</span>
                      <span style={{ display: "flex", gap: "1rem", fontSize: "0.9rem" }}>
                        <span style={{
                          padding: "0.25rem 0.5rem",
                          background: topic.difficulty === 'Hard' || topic.difficulty === 'Very Hard' ? '#ffebee' : 
                                     topic.difficulty === 'Medium' ? '#fff3e0' : '#e8f5e9',
                          color: topic.difficulty === 'Hard' || topic.difficulty === 'Very Hard' ? '#c62828' : 
                                 topic.difficulty === 'Medium' ? '#ef6c00' : '#2e7d32',
                          borderRadius: "4px",
                          fontSize: "0.8rem"
                        }}>
                          {topic.difficulty}
                        </span>
                        <span style={{ color: "#1d7a85", fontWeight: "600" }}>{topic.hours}h</span>
                      </span>
                    </div>
                  ))}
                  
                  <div style={{ 
                    marginTop: "0.75rem", 
                    textAlign: "right", 
                    color: "#666",
                    fontSize: "0.9rem",
                    fontWeight: "600"
                  }}>
                    Total: {day.totalHours} hours
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={handleDownload} className="btn primary-btn" style={{ width: "100%", background: "#123456" }}>
              📥 Download Study Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamScheduler;