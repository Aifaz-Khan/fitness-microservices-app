import React from 'react';
import { NavLink } from 'react-router-dom';
import keycloak from '../services/keycloak';

export default function Navbar({ userProfile, athleteProfile }) {
  const handleLogout = () => {
    keycloak.logout();
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-dot"></span>FITNESS<span>AI</span>
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
        <NavLink to="/goal" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Goal Plan
        </NavLink>
        <NavLink to="/coach" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Coach Chat
        </NavLink>
      </div>
      <div className="user-profile-menu">
        {userProfile && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', marginRight: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>
              Hi, {userProfile.firstName || userProfile.username || 'Athlete'}
            </span>
            {athleteProfile && (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {athleteProfile.weight} kg | {athleteProfile.height} cm | Age {athleteProfile.age}
              </span>
            )}
          </div>
        )}
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
