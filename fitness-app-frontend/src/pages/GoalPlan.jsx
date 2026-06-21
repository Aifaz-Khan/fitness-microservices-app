import React, { useEffect, useState } from 'react';
import api from '../services/api';

const GOALS = [
  { value: 'LOSE_WEIGHT', label: 'Lose Weight' },
  { value: 'BUILD_MUSCLE', label: 'Build Muscle' },
  { value: 'IMPROVE_ENDURANCE', label: 'Improve Endurance' },
  { value: 'MARATHON_TRAINING', label: 'Marathon Training' }
];

const FITNESS_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' }
];

export default function GoalPlan({ userId }) {
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form states
  const [goal, setGoal] = useState('LOSE_WEIGHT');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('BEGINNER');

  useEffect(() => {
    async function fetchActivePlan() {
      if (!userId) return;
      try {
        const res = await api.get('/api/recommendations/goal');
        if (res.data) {
          setActivePlan(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch active plan', err);
      } finally {
        setLoading(false);
      }
    }
    fetchActivePlan();
  }, [userId]);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!currentWeight || !targetWeight) {
      alert('Please fill in current and target weight');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post('/api/recommendations/goal', {
        goal,
        currentWeight: parseFloat(currentWeight),
        targetWeight: parseFloat(targetWeight),
        fitnessLevel
      });
      setActivePlan(res.data);
    } catch (err) {
      console.error('Failed to generate plan', err);
      alert('Could not generate plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleResetPlan = () => {
    setActivePlan(null);
    setCurrentWeight('');
    setTargetWeight('');
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      
      const isBullet = trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed);
      let cleanLine = trimmed;
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        cleanLine = trimmed.substring(1).trim();
      } else if (/^\d+\./.test(trimmed)) {
        cleanLine = trimmed.replace(/^\d+\.\s*/, '');
      }
      
      const parts = [];
      let lastIndex = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} style={{ color: 'var(--primary)', fontWeight: '600' }}>{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }
      
      if (isBullet) {
        return (
          <div key={lIdx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '6px 0', paddingLeft: '8px' }}>
            <span style={{ color: 'var(--primary)', fontSize: '14px', lineHeight: '1.4' }}>•</span>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5', flexGrow: 1 }}>
              {parts.length > 0 ? parts : cleanLine}
            </span>
          </div>
        );
      }
      
      return (
        <p key={lIdx} style={{ margin: '6px 0', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
          {parts.length > 0 ? parts : cleanLine}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner" style={{ color: 'var(--primary)', width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '24px 0', minHeight: 'calc(100vh - 120px)' }}>
      {generating ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '20px' }}>
          <div className="spinner" style={{ color: 'var(--primary)', width: '50px', height: '50px', borderWidth: '3px' }}></div>
          <h3 style={{ fontWeight: '600', color: 'var(--primary)' }}>Goal-Based Agent at Work</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center', lineHeight: '1.6' }}>
            Analyzing your heart rates, activity patterns, calorie metrics, and target weights to create a customized training program...
          </p>
        </div>
      ) : !activePlan ? (
        <div className="card fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Configure Your AI Fitness Goal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
              Our Goal-Based Agent will analyze your history and build a custom regime.
            </p>
          </div>

          <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="activity-stat-label">Fitness Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} style={{ marginTop: '6px' }}>
                {GOALS.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label className="activity-stat-label">Current Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="e.g. 75" 
                  value={currentWeight} 
                  onChange={(e) => setCurrentWeight(e.target.value)} 
                  style={{ marginTop: '6px' }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="activity-stat-label">Target Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="e.g. 70" 
                  value={targetWeight} 
                  onChange={(e) => setTargetWeight(e.target.value)} 
                  style={{ marginTop: '6px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="activity-stat-label">Fitness Experience Level</label>
              <select value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)} style={{ marginTop: '6px' }}>
                {FITNESS_LEVELS.map(fl => (
                  <option key={fl.value} value={fl.value}>{fl.label}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: '12px' }}>
              Create AI Training Plan
            </button>
          </form>
        </div>
      ) : (
        <div className="fade-in">
          {/* Header Action */}
          <div className="section-header" style={{ marginBottom: '24px' }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: '4px', display: 'inline-block' }}>Active Program</span>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
                {GOALS.find(g => g.value === activePlan.goal)?.label || activePlan.goal} Plan
              </h2>
            </div>
            <button className="btn btn-outline" onClick={handleResetPlan}>
              Change Goal / Restart
            </button>
          </div>

          {/* Analysis Banner */}
          <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--primary)', margin: 0 }}>Agent Progress Analysis</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {renderFormattedText(activePlan.analysis)}
            </div>
          </div>

          {/* Weekly Day-by-Day Schedule */}
          <div className="insight-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Weekly Day-by-Day Schedule</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {activePlan.weeklyPlan && activePlan.weeklyPlan.map((dayPlan, idx) => (
                <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '18px', backgroundColor: dayPlan.type === 'RECOVERY' ? 'rgba(124, 58, 237, 0.03)' : 'var(--card-bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '14px' }}>{dayPlan.day}</span>
                    <span className="badge" style={{ backgroundColor: dayPlan.type === 'RECOVERY' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(0, 212, 255, 0.1)', color: dayPlan.type === 'RECOVERY' ? 'var(--secondary)' : 'var(--primary)', fontSize: '10px' }}>
                      {dayPlan.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', minHeight: '40px' }}>
                    {dayPlan.workout}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px' }}>
                    Intensity: <span style={{ color: dayPlan.intensity === 'High' ? 'var(--secondary)' : dayPlan.intensity === 'Medium' ? 'var(--primary)' : 'var(--success)', fontWeight: '600' }}>{dayPlan.intensity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Grid splits (Workouts & Recovery) */}
          <div className="insights-subgrid" style={{ marginTop: '24px' }}>
            {/* Workout Movements */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.5 6.5h11M6.5 17.5h11M3 6.5h3.5v11H3zM17.5 6.5H21v11h-3.5zM12 3v18"/>
                </svg>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  Suggested Exercises
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activePlan.workoutSuggestions && activePlan.workoutSuggestions.map((sug, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '14px', 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--border)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{sug.name}</h4>
                      <span className="badge" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--secondary)', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {sug.sets}
                      </span>
                    </div>
                    {sug.coachingTip && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginTop: '4px' }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(0, 212, 255, 0.1)', color: 'var(--primary)', fontSize: '9px', padding: '2px 6px', textTransform: 'uppercase', fontWeight: '700', borderRadius: '4px', marginTop: '2px' }}>Tip</span>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                          {sug.coachingTip}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recovery & Rest Plan */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  Active Recovery & Goals
                </h3>
              </div>
              {activePlan.recoveryPlan && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Rest Days</span>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--secondary)' }}>{activePlan.recoveryPlan.restDays}</p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Daily Sleep Target</span>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>{activePlan.recoveryPlan.sleepTargetHours} <span style={{ fontSize: '13px', fontWeight: '400' }}>hours</span></p>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hydration Target</span>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--success)' }}>{activePlan.recoveryPlan.hydrationLiters} <span style={{ fontSize: '13px', fontWeight: '400' }}>Liters</span></p>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Daily Flexibility Stretches</span>
                    <ul className="insight-bullet-list" style={{ gap: '6px' }}>
                      {activePlan.recoveryPlan.stretches && activePlan.recoveryPlan.stretches.map((stretch, idx) => (
                        <li key={idx} style={{ padding: '8px 12px', fontSize: '13px' }}>{stretch}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
