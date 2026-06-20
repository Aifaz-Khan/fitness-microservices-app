import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import api from '../services/api';

export default function Dashboard({ userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    totalCalories: 0
  });

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await api.get('/api/activities');
        setActivities(res.data || []);
        
        // Calculate stats
        const list = res.data || [];
        const totalWorkouts = list.length;
        const totalDuration = list.reduce((sum, item) => sum + (item.duration || 0), 0);
        const totalCalories = list.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);
        
        setStats({ totalWorkouts, totalDuration, totalCalories });
      } catch (err) {
        console.error('Failed to fetch activities', err);
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fade-in">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <h2 className="section-title">Your Training Dashboard</h2>
      </div>

      <div className="dashboard-grid">
        <StatCard 
          title="Total Workouts" 
          value={stats.totalWorkouts} 
          subtext="Lifetime exercises logged"
          color="var(--primary)" 
        />
        <StatCard 
          title="Active Minutes" 
          value={stats.totalDuration} 
          unit="min"
          subtext="Total sweat equity"
          color="var(--secondary)" 
        />
        <StatCard 
          title="Calories Burned" 
          value={stats.totalCalories} 
          unit="kcal"
          subtext="Energy expended"
          color="var(--success)" 
        />
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Logged Activities</h3>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner" style={{ color: 'var(--primary)', width: '30px', height: '30px' }}></div>
          </div>
        ) : activities.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px' }}>
            No workouts logged yet. Start tracking your fitness today!
          </p>
        ) : (
          <div className="activity-list">
            {activities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className="activity-info">
                  <div className="activity-icon-box">
                    {act.type === 'RUNNING' && '🏃'}
                    {act.type === 'WALKING' && '🚶'}
                    {act.type === 'CYCLING' && '🚴'}
                    {act.type === 'SWIMMING' && '🏊'}
                    {act.type === 'WEIGHT_TRAINING' && '🏋️'}
                    {act.type === 'YOGA' && '🧘'}
                    {act.type === 'HIIT' && '🔥'}
                    {act.type === 'CARDIO' && '💓'}
                    {act.type === 'STRETCHING' && '🙆'}
                    {act.type === 'OTHER' && '💪'}
                  </div>
                  <div className="activity-details">
                    <h4>{act.type.replace('_', ' ')}</h4>
                    <p>{formatDate(act.startTime)}</p>
                  </div>
                </div>

                <div className="activity-stats">
                  <div style={{ textAlign: 'right' }}>
                    <div className="activity-stat-value">{act.duration} mins</div>
                    <div className="activity-stat-label">Duration</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="activity-stat-value">{act.caloriesBurned} kcal</div>
                    <div className="activity-stat-label">Energy</div>
                  </div>
                  <div>
                    <span className="badge badge-success">AI Recommendation Ready</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
