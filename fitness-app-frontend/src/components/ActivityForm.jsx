import React, { useState } from 'react';

const ACTIVITY_TYPES = [
  'RUNNING', 'WALKING', 'CYCLING', 'SWIMMING', 'WEIGHT_TRAINING',
  'YOGA', 'HIIT', 'CARDIO', 'STRETCHING', 'OTHER'
];

const MET_VALUES = {
  RUNNING: 10.0,
  WALKING: 3.8,
  CYCLING: 7.5,
  SWIMMING: 8.0,
  WEIGHT_TRAINING: 5.0,
  YOGA: 2.5,
  HIIT: 9.0,
  CARDIO: 6.5,
  STRETCHING: 2.3,
  OTHER: 5.0
};

const getRpeDescription = (val) => {
  if (val <= 2) return 'Very Light (Easy breathing, can converse easily)';
  if (val <= 4) return 'Light/Moderate (Comfortable, slightly deeper breathing)';
  if (val <= 6) return 'Moderate/Hard (Sweating, talking becomes challenging)';
  if (val <= 8) return 'Hard/Vigorous (Heavy breathing, can say only short phrases)';
  return 'Max Effort (Gasping for air, cannot sustain)';
};

export default function ActivityForm({ onSubmit, loading, athleteProfile }) {
  const [type, setType] = useState('RUNNING');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [startTime, setStartTime] = useState(new Date().toISOString().substring(0, 16));
  
  // Additional metrics
  const [pace, setPace] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  // New intensity control
  const [intensityMethod, setIntensityMethod] = useState('HEART_RATE'); // HEART_RATE or RPE
  const [rpe, setRpe] = useState(5);
  const [isCalorieManual, setIsCalorieManual] = useState(false);

  // Auto calculate calories based on MET
  React.useEffect(() => {
    if (!isCalorieManual && duration && athleteProfile?.weight) {
      const met = MET_VALUES[type] || 5.0;
      const calcCalories = Math.round(met * athleteProfile.weight * (parseInt(duration, 10) / 60));
      setCaloriesBurned(calcCalories.toString());
    } else if (!duration) {
      setCaloriesBurned('');
    }
  }, [type, duration, athleteProfile?.weight, isCalorieManual]);

  const handleCalorieChange = (e) => {
    setCaloriesBurned(e.target.value);
    setIsCalorieManual(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!duration || !caloriesBurned) {
      alert('Please fill in duration and calories');
      return;
    }

    const additionalMetrics = {};
    if (pace) additionalMetrics.pace = pace;
    
    if (intensityMethod === 'HEART_RATE') {
      if (heartRate) additionalMetrics.heartRate = parseInt(heartRate, 10);
    } else {
      additionalMetrics.rpe = parseInt(rpe, 10);
      // Estimate heart rate based on RPE: 70 + (rpe * 11)
      additionalMetrics.heartRate = 70 + (parseInt(rpe, 10) * 11);
    }

    if (weight) additionalMetrics.weightLbs = parseInt(weight, 10);
    if (notes) additionalMetrics.notes = notes;

    onSubmit({
      type,
      duration: parseInt(duration, 10),
      caloriesBurned: parseInt(caloriesBurned, 10),
      startTime: new Date(startTime).toISOString(),
      additionalMetrics
    });

    // Reset values
    setDuration('');
    setCaloriesBurned('');
    setPace('');
    setHeartRate('');
    setWeight('');
    setNotes('');
    setIntensityMethod('HEART_RATE');
    setRpe(5);
    setIsCalorieManual(false);
  };

  const renderSpecificTypeFields = () => {
    switch (type) {
      case 'RUNNING':
      case 'WALKING':
      case 'CYCLING':
        return (
          <div style={{ width: '100%' }}>
            <label className="activity-stat-label">Pace (e.g., 5:30/km)</label>
            <input 
              type="text" 
              placeholder="e.g. 5:30" 
              value={pace} 
              onChange={(e) => setPace(e.target.value)} 
              style={{ marginTop: '6px' }}
            />
          </div>
        );
      case 'WEIGHT_TRAINING':
        return (
          <div style={{ width: '100%' }}>
            <label className="activity-stat-label">Target Weight (lbs/kg)</label>
            <input 
              type="number" 
              placeholder="e.g. 150" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)} 
              style={{ marginTop: '6px' }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card workout-form fade-in">
      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Log Your Workout</h3>
      
      <div>
        <label className="activity-stat-label">Workout Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ marginTop: '6px' }}>
          {ACTIVITY_TYPES.map(t => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div style={{ flex: 1 }}>
          <label className="activity-stat-label">Duration (Minutes)</label>
          <input 
            type="number" 
            placeholder="e.g. 45" 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
            style={{ marginTop: '6px' }}
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="activity-stat-label">Calories Burned</label>
            {!isCalorieManual && duration && athleteProfile?.weight && (
              <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '600' }}>MET Auto-Estimate</span>
            )}
          </div>
          <input 
            type="number" 
            placeholder="e.g. 350" 
            value={caloriesBurned} 
            onChange={handleCalorieChange} 
            style={{ marginTop: '6px' }}
            required
          />
          {isCalorieManual && duration && athleteProfile?.weight && (
            <button 
              type="button" 
              onClick={() => setIsCalorieManual(false)} 
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '11px',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                marginTop: '4px',
                textAlign: 'left',
                display: 'block'
              }}
            >
              Reset to MET Estimate
            </button>
          )}
        </div>
      </div>

      {renderSpecificTypeFields() && (
        <div className="form-row">
          {renderSpecificTypeFields()}
        </div>
      )}

      {/* Intensity Section */}
      <div className="intensity-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
        <label className="activity-stat-label" style={{ display: 'block', marginBottom: '8px' }}>Workout Intensity Tracker</label>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setIntensityMethod('HEART_RATE')}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '13px',
              backgroundColor: intensityMethod === 'HEART_RATE' ? 'rgba(0, 212, 255, 0.15)' : 'var(--input-bg)',
              border: '1px solid',
              borderColor: intensityMethod === 'HEART_RATE' ? 'var(--primary)' : 'var(--border)',
              color: intensityMethod === 'HEART_RATE' ? 'var(--primary)' : 'var(--text-secondary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Avg Heart Rate
          </button>
          <button
            type="button"
            onClick={() => setIntensityMethod('RPE')}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '13px',
              backgroundColor: intensityMethod === 'RPE' ? 'rgba(124, 58, 237, 0.15)' : 'var(--input-bg)',
              border: '1px solid',
              borderColor: intensityMethod === 'RPE' ? 'var(--secondary)' : 'var(--border)',
              color: intensityMethod === 'RPE' ? 'var(--secondary)' : 'var(--text-secondary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            RPE Scale (1-10)
          </button>
        </div>

        {intensityMethod === 'HEART_RATE' ? (
          <div>
            <label className="activity-stat-label">Avg Heart Rate (BPM)</label>
            <input 
              type="number" 
              placeholder="e.g. 145" 
              value={heartRate} 
              onChange={(e) => setHeartRate(e.target.value)} 
              style={{ marginTop: '6px' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="activity-stat-label">Perceived Exertion (RPE)</label>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--secondary)' }}>{rpe} / 10</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={rpe} 
              onChange={(e) => setRpe(parseInt(e.target.value, 10))} 
              style={{ 
                marginTop: '6px', 
                accentColor: 'var(--secondary)',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
              {getRpeDescription(rpe)}
            </span>
          </div>
        )}
      </div>

      <div>
        <label className="activity-stat-label">Start Time</label>
        <input 
          type="datetime-local" 
          value={startTime} 
          onChange={(e) => setStartTime(e.target.value)} 
          style={{ marginTop: '6px' }}
          required
        />
      </div>

      <div>
        <label className="activity-stat-label">Notes & Details</label>
        <textarea 
          placeholder="e.g. felt strong today, sets: 4x8 squats..." 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          rows="3"
          style={{ marginTop: '6px', resize: 'vertical' }}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: '45px' }}>
        {loading ? <span className="spinner"></span> : 'Save & Analyze Workout'}
      </button>
    </form>
  );
}
