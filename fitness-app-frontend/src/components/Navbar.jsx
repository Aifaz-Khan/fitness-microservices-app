import React from 'react';
import { NavLink } from 'react-router-dom';
import keycloak from '../services/keycloak';

export default function Navbar({ userProfile }) {
  const handleLogout = () => {
    keycloak.logout();
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        ⚡ <span>FITNESS</span>.AI
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          Dashboard
        </NavLink>
        <NavLink to="/log" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Log Workout
        </NavLink>
        <NavLink to="/insights" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          AI Insights
        </NavLink>
        <NavLink to="/coach" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Coach Chat
        </NavLink>
      </div>
      <div className="user-profile-menu">
        {userProfile && (
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Hi, {userProfile.firstName || userProfile.username || 'Athlete'}
          </span>
        )}
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
