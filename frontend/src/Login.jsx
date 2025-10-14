import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'Student' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { email, password, role } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google';
  };

  const redirectToDashboard = (userRole) => {
    if (userRole === 'Student') {
      navigate('/dashboard');
    } else if (userRole === 'Teacher') {
      navigate('/teacher-dashboard');
    } else if (userRole === 'Administrator') {
      navigate('/admin-dashboard');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log('Login successful, token:', data.token);
        setMessage('Login successful! Redirecting...');
        
        // Save user info to localStorage
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userToken', data.token);
        
        setTimeout(() => redirectToDashboard(data.user.role), 1500);
      } else {
        setMessage(data.msg || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setMessage('Server error. Please try again later.');
    }
  };

  return (
    <div>
      <Navbar showAuth={false} />

      <div className="form-container" style={{ backgroundColor: '#1d7a85' }}>
        <h2>Sign In</h2>
        {message && <div className="form-message">{message}</div>}
        
        <button
          onClick={handleGoogleSignIn}
          className="btn google-btn"
          style={{ width: '100%', marginBottom: '1.5rem' }}
        >
          <span style={{ fontSize: '1.2rem' }}>🔍</span> Sign in with Google
        </button>

        <div style={{ textAlign: 'center', margin: '1rem 0', color: 'white' }}>
          <span>─────── OR ───────</span>
        </div>

        <form onSubmit={onSubmit}>
          <label>
            Role:
            <select name="role" value={role} onChange={onChange} style={{ color: 'black' }}>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Administrator">Administrator</option>
            </select>
          </label>
          <label>
            Email:
            <input type="email" name="email" value={email} onChange={onChange} required />
          </label>
          <label>
            Password:
            <input type="password" name="password" value={password} onChange={onChange} required />
          </label>
          <button type="submit" className="btn primary-btn">
            Login
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'white', textDecoration: 'underline' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;