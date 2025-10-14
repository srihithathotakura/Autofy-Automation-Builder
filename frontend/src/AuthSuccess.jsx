import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const name = searchParams.get('name');

    if (token && role && userId) {
      // Save to localStorage
      localStorage.setItem('userToken', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name || 'User');

      // Redirect based on role
      setTimeout(() => {
        if (role === 'Teacher') {
          navigate('/teacher-dashboard');
        } else if (role === 'Administrator') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f5f5fa'
    }}>
      <div className="spinner"></div>
      <h2 style={{ marginTop: '2rem', color: '#123456' }}>
        Authentication Successful!
      </h2>
      <p style={{ color: '#666' }}>Redirecting to your dashboard...</p>
    </div>
  );
};

export default AuthSuccess;