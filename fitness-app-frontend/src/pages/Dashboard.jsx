import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import api from '../services/api';

const calculateStreak = (activitiesList) => {
  if (!activitiesList || activitiesList.length === 0) return 0;
  
  // Get unique active dates in YYYY-MM-DD format in local time
  const activeDates = new Set(
    activitiesList.map(act => {
      const d = new Date(act.startTime);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${date}`;
    })
  );
  
  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  let streak = 0;
  let checkDate = new Date(); // Start with today
  let todayStr = getLocalDateString(checkDate);
  
  if (activeDates.has(todayStr)) {
    // Streak includes today
    while (activeDates.has(getLocalDateString(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    // Check if streak was active yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = getLocalDateString(checkDate);
    if (activeDates.has(yesterdayStr)) {
      while (activeDates.has(getLocalDateString(checkDate))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
  }
  
  return streak;
};

export default function Dashboard({ userId, athleteProfile }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    totalCalories: 0,
    weeklyFrequency: 0,
    weeklyDuration: 0,
    streak: 0,
    goalCompletion: 0,
    targetWorkouts: 3,
    targetDuration: 120
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch activities
        const actRes = await api.get('/api/activities');
        const list = actRes.data || [];
        setActivities(list);

        // Fetch active goal plan
        let goalPlan = null;
        try {
          const goalRes = await api.get('/api/recommendations/goal');
          goalPlan = goalRes.data;
          setActivePlan(goalPlan);
        } catch (err) {
          console.warn('No active goal plan or failed to fetch:', err);
        }

        // Calculate stats
        const totalWorkouts = list.length;
        const totalDuration = list.reduce((sum, item) => sum + (item.duration || 0), 0);
        const totalCalories = list.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);

        // Calculate weekly stats (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const weeklyWorkouts = list.filter(act => {
          const actDate = new Date(act.startTime);
          return actDate >= sevenDaysAgo;
        });

        const weeklyFrequency = weeklyWorkouts.length;
        const weeklyDuration = weeklyWorkouts.reduce((sum, item) => sum + (item.duration || 0), 0);

        // Calculate streak
        const streak = calculateStreak(list);

        // Get goal targets
        const getGoalTargets = (goalType) => {
          switch (goalType) {
            case 'LOSE_WEIGHT':
              return { workouts: 4, duration: 180 };
            case 'BUILD_MUSCLE':
              return { workouts: 4, duration: 160 };
            case 'IMPROVE_ENDURANCE':
              return { workouts: 5, duration: 200 };
            case 'MARATHON_TRAINING':
              return { workouts: 5, duration: 240 };
            default:
              return { workouts: 3, duration: 120 }; // Default weekly goal
          }
        };

        const targets = getGoalTargets(goalPlan?.goal);
        const workoutsPct = Math.min((weeklyFrequency / targets.workouts) * 100, 100);
        const durationPct = Math.min((weeklyDuration / targets.duration) * 100, 100);
        const goalCompletion = Math.round((workoutsPct + durationPct) / 2);

        setStats({
          totalWorkouts,
          totalDuration,
          totalCalories,
          weeklyFrequency,
          weeklyDuration,
          streak,
          goalCompletion,
          targetWorkouts: targets.workouts,
          targetDuration: targets.duration
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fade-in">
      <div className="section-header" style={{ marginTop: '24px' }}>
        <h2 className="section-title">Weekly Performance (Last 7 Days)</h2>
      </div>

      <div className="dashboard-grid">
        <StatCard 
          title="Goal Completion" 
          value={stats.goalCompletion} 
          unit="%"
          subtext={`Target: ${stats.targetWorkouts} workouts / ${stats.targetDuration} mins`}
          color="var(--primary)" 
        />
        <StatCard 
          title="Current Streak" 
          value={stats.streak} 
          unit={stats.streak === 1 ? "day" : "days"}
          subtext={stats.streak > 0 ? "Keep it burning!" : "Log a workout to start a streak"}
          color="#FF6B00" 
        />
        <StatCard 
          title="Workouts This Week" 
          value={stats.weeklyFrequency} 
          subtext={`Goal: ${stats.targetWorkouts} workouts`}
          color="var(--secondary)" 
        />
        <StatCard 
          title="Minutes This Week" 
          value={stats.weeklyDuration} 
          unit="min"
          subtext={`Goal: ${stats.targetDuration} mins`}
          color="var(--success)" 
        />
      </div>

      <div className="section-header" style={{ marginTop: '32px' }}>
        <h2 className="section-title">Lifetime Summary</h2>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '32px' }}>
        <StatCard 
          title="Total Sessions" 
          value={stats.totalWorkouts} 
          subtext="All exercises logged"
          color="var(--primary)" 
        />
        <StatCard 
          title="Total Duration" 
          value={stats.totalDuration} 
          unit="min"
          subtext="Total sweat equity"
          color="var(--secondary)" 
        />
        <StatCard 
          title="Total Calories" 
          value={stats.totalCalories} 
          unit="kcal"
          subtext="Total energy expended"
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
                  <div className="activity-icon-box" style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px' }}>
                    {act.type === 'RUNNING' && 'RUN'}
                    {act.type === 'WALKING' && 'WLK'}
                    {act.type === 'CYCLING' && 'CYC'}
                    {act.type === 'SWIMMING' && 'SWM'}
                    {act.type === 'WEIGHT_TRAINING' && 'WGT'}
                    {act.type === 'YOGA' && 'YOG'}
                    {act.type === 'HIIT' && 'HIT'}
                    {act.type === 'CARDIO' && 'CRD'}
                    {act.type === 'STRETCHING' && 'STR'}
                    {act.type === 'OTHER' && 'FIT'}
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
                  <div style={{ textAlign: 'right' }}>
                    <div className="activity-stat-value">
                      {act.additionalMetrics?.rpe ? (
                        <span style={{ color: 'var(--secondary)' }}>RPE {act.additionalMetrics.rpe}</span>
                      ) : act.additionalMetrics?.heartRate ? (
                        <span style={{ color: '#FF3366' }}>{act.additionalMetrics.heartRate} BPM</span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>—</span>
                      )}
                    </div>
                    <div className="activity-stat-label">Intensity</div>
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
