import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { name, email, password, role } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGoogleSignUp = () => {
    window.location.href = '/api/auth/google';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorMsg = data.errors ? data.errors[0].msg : data.msg;
        setMessage(`Registration failed: ${errorMsg}`);
      }
    } catch (err) {
      setMessage('Server error. Please try again later.');
    }
  };

  return (
    <div>
      <Navbar showAuth={false} />

      <div className="form-container" style={{ backgroundColor: '#1d7a85' }}>
        <h2>Sign Up</h2>
        {message && <div className="form-message">{message}</div>}
        
        <button
          onClick={handleGoogleSignUp}
          className="btn google-btn"
          style={{ width: '100%', marginBottom: '1.5rem' }}
        >
          <span style={{ fontSize: '1.2rem' }}>🔍</span> Sign up with Google
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
            Name:
            <input type="text" name="name" value={name} onChange={onChange} required />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={email} onChange={onChange} required />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              minLength="6"
            />
          </label>
          <button type="submit" className="btn primary-btn">
            Register
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'white', textDecoration: 'underline' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;