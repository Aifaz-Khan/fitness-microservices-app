import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import keycloak from './services/keycloak';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import AIInsights from './pages/AIInsights';
import CoachChat from './pages/CoachChat';
import GoalPlan from './pages/GoalPlan';
import api from './services/api';
import './App.css';

function ProfileSetupCard({ keycloakId, userProfile, onComplete }) {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('MALE');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!age || !height || !weight) {
      alert('Please fill in all profile fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.put(`/api/users/${keycloakId}`, {
        age: parseInt(age, 10),
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        email: userProfile?.email,
        firstName: userProfile?.firstName,
        lastName: userProfile?.lastName
      });
      onComplete(res.data);
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Could not update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card fade-in" style={{ maxWidth: '450px', width: '100%', padding: '32px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Athlete Profile Setup</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
          Welcome to FITNESSAI! Please complete your physical dimensions to activate the MET calorie calculator and personalized AI training features.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="activity-stat-label">Age</label>
          <input 
            type="number" 
            placeholder="e.g. 25" 
            value={age} 
            onChange={(e) => setAge(e.target.value)} 
            style={{ marginTop: '6px' }}
            required
            min="1"
            max="120"
          />
        </div>

        <div>
          <label className="activity-stat-label">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ marginTop: '6px' }}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label className="activity-stat-label">Height (cm)</label>
            <input 
              type="number" 
              placeholder="e.g. 175" 
              value={height} 
              onChange={(e) => setHeight(e.target.value)} 
              style={{ marginTop: '6px' }}
              required
              min="50"
              max="250"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="activity-stat-label">Weight (kg)</label>
            <input 
              type="number" 
              step="0.1"
              placeholder="e.g. 70" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)} 
              style={{ marginTop: '6px' }}
              required
              min="10"
              max="300"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', height: '45px', marginTop: '8px' }}>
          {submitting ? <span className="spinner"></span> : 'Activate Account'}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [athleteProfile, setAthleteProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const fetchAthleteProfile = async (keycloakId) => {
    try {
      const res = await api.get(`/api/users/${keycloakId}`);
      setAthleteProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch user database profile', err);
    }
  };

  useEffect(() => {
    keycloak
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then((auth) => {
        setAuthenticated(auth);
        if (auth) {
          const keycloakId = keycloak.tokenParsed?.sub;
          setUserProfile({
            username: keycloak.tokenParsed?.preferred_username,
            email: keycloak.tokenParsed?.email,
            firstName: keycloak.tokenParsed?.given_name,
            lastName: keycloak.tokenParsed?.family_name,
            id: keycloakId
          });
          setCheckingProfile(true);
          fetchAthleteProfile(keycloakId).finally(() => {
            setCheckingProfile(false);
            setLoading(false);
          });
        } else {
          setLoading(false);
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

  const isProfileIncomplete = athleteProfile === null || 
    !athleteProfile.age || 
    !athleteProfile.gender || 
    !athleteProfile.height || 
    !athleteProfile.weight;

  if (isProfileIncomplete && !checkingProfile) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px'
      }}>
        <ProfileSetupCard keycloakId={userProfile?.id} userProfile={userProfile} onComplete={(updatedProfile) => setAthleteProfile(updatedProfile)} />
      </div>
    );
  }

  return (
    <Router>
      <Navbar userProfile={userProfile} athleteProfile={athleteProfile} />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard userId={userProfile?.id} athleteProfile={athleteProfile} />} />
          <Route path="/log" element={<LogWorkout userId={userProfile?.id} athleteProfile={athleteProfile} />} />
          <Route path="/insights" element={<AIInsights userId={userProfile?.id} />} />
          <Route path="/goal" element={<GoalPlan userId={userProfile?.id} />} />
          <Route path="/coach" element={<CoachChat />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
