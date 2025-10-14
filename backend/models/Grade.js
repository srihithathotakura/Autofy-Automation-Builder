const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema({
  course: { 
    type: String,  // STRING not ObjectId
    required: true 
  },
  studentIdentifier: { 
    type: String, 
    required: true 
  },
  assignmentName: { 
    type: String, 
    required: true 
  },
  score: { 
    type: Number, 
    required: true 
  },
  totalPoints: { 
    type: Number, 
    required: true 
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }
}, { 
  timestamps: true  // This adds createdAt and updatedAt
});

module.exports = mongoose.model("Grade", GradeSchema);


// STEP 3: Update TeacherDashboard.jsx - Fix fetchGrades function
// Find this function and replace:

const fetchGrades = async () => {
  try {
    const token = localStorage.getItem('userToken');
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('Fetching grades for teacher:', teacherId);
    
    const res = await fetch(`/api/grades?teacherId=${teacherId}`, { headers });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✓ Grades received:', data.length, 'grades');
      console.log('Grade data:', data); // Debug log
      setGrades(data);
    } else {
      const error = await res.json();
      console.error('Failed to fetch grades:', error);
      setMessage('❌ Failed to load grades: ' + (error.error || ''));
    }
  } catch (err) {
    console.error('Error fetching grades:', err);
    setMessage('❌ Error loading grades: ' + err.message);
  }
};
