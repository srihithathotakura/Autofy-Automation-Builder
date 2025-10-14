import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ menuItems, showAuth = true }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const id = localStorage.getItem('userId');
    
    setUserRole(role);
    setUserName(name);
    setUserId(id);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
    setUserRole(null);
    setUserName(null);
    setUserId(null);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!userRole) return '/dashboard';
    
    switch (userRole) {
      case 'Teacher':
        return '/teacher-dashboard';
      case 'Administrator':
        return '/admin-dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();
    const dashboardPath = getDashboardLink();
    navigate(dashboardPath);
  };

  return (
    <nav className="navbar">
      <div className="logo-placeholder">
        <Link to="/">
          <img src="/logo.png" alt="Autofy Logo" />
        </Link>
      </div>
      <ul className="navbar-menu">
        {/* Show custom menu items if provided */}
        {menuItems && menuItems.map((item, index) => (
          <li key={index}>
            <Link to={item.path}>{item.label}</Link>
          </li>
        ))}

        {/* Show default navigation based on auth status */}
        {!menuItems && (
          <>
            {!userRole ? (
              // Not logged in - show public navigation
              <>
                <li><Link to="/">Home</Link></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#integrations">Integrations</a></li>
                <li><Link to="/request-demo">Request Demo</Link></li>
              </>
            ) : (
              // Logged in - show role-based navigation
              <>
                <li><Link to="/">Home</Link></li>
                <li>
                  <a href="#" onClick={handleDashboardClick}>
                    Dashboard
                  </a>
                </li>
                <li><Link to="/workspace">Workspace</Link></li>
                
                {/* Student specific links */}
                {userRole === 'Student' && (
                  <>
                    <li><Link to="/exam-scheduler">Exam Planner</Link></li>
                    <li><Link to="/assignment-submission">Assignments</Link></li>
                  </>
                )}
                
                {/* Teacher specific links */}
                {userRole === 'Teacher' && (
                  <>
                    <li><Link to="/teacher-dashboard">Manage Classes</Link></li>
                  </>
                )}
                
                {/* Admin specific links */}
                {userRole === 'Administrator' && (
                  <>
                    <li><Link to="/request-demo">Demo Requests</Link></li>
                    <li><Link to="/request-template">Templates</Link></li>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Auth buttons */}
        {showAuth && (
          <li>
            {!userRole ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  className="btn secondary-btn"
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </button>
                <button
                  className="btn sign-in-btn"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: '#123456' }}>
                  Welcome, {userName || 'User'}
                </span>
                <button
                  className="btn secondary-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
};
export default Navbar;