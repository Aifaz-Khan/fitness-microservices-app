import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import keycloak from './services/keycloak';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import AIInsights from './pages/AIInsights';
import CoachChat from './pages/CoachChat';
import GoalPlan from './pages/GoalPlan';
import './App.css';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    keycloak
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then((auth) => {
        setAuthenticated(auth);
        setLoading(false);
        if (auth) {
          setUserProfile({
            username: keycloak.tokenParsed?.preferred_username,
            email: keycloak.tokenParsed?.email,
            firstName: keycloak.tokenParsed?.given_name,
            lastName: keycloak.tokenParsed?.family_name,
            id: keycloak.tokenParsed?.sub
          });
        }
      })
      .catch((err) => {
        console.error('Keycloak initialization failed', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        color: 'var(--text-primary)'
      }}>
        <div className="spinner" style={{ color: 'var(--primary)', width: '40px', height: '40px' }}></div>
        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Securing connection with Keycloak...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'var(--text-primary)'
      }}>
        <p>Authentication required. Redirecting to Keycloak...</p>
      </div>
    );
  }

  return (
    <Router>
      <Navbar userProfile={userProfile} />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard userId={userProfile?.id} />} />
          <Route path="/log" element={<LogWorkout userId={userProfile?.id} />} />
          <Route path="/insights" element={<AIInsights userId={userProfile?.id} />} />
          <Route path="/goal" element={<GoalPlan userId={userProfile?.id} />} />
          <Route path="/coach" element={<CoachChat />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
