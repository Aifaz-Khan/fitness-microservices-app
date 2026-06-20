import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityForm from '../components/ActivityForm';
import api from '../services/api';

export default function LogWorkout({ userId }) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleLogWorkout = async (data) => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const payload = {
        ...data,
        userId: userId
      };
      
      await api.post('/api/activities', payload);
      setSuccessMsg('Workout successfully logged! Sending activity parameters to AI Coach...');
      
      setTimeout(() => {
        navigate('/insights');
      }, 1500);
    } catch (err) {
      console.error('Failed to log workout', err);
      alert('Could not log workout. Please check if services are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '24px 0' }}>
      <div className="section-header" style={{ justifyContent: 'center', marginBottom: '24px' }}>
        <h2 className="section-title">Track a New Session</h2>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          color: 'var(--success)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          padding: '16px',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '0 auto 20px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {successMsg}
        </div>
      )}

      <ActivityForm onSubmit={handleLogWorkout} loading={loading} />
    </div>
  );
}
