import React, { useState } from 'react';

const ACTIVITY_TYPES = [
  'RUNNING', 'WALKING', 'CYCLING', 'SWIMMING', 'WEIGHT_TRAINING',
  'YOGA', 'HIIT', 'CARDIO', 'STRETCHING', 'OTHER'
];

export default function ActivityForm({ onSubmit, loading }) {
  const [type, setType] = useState('RUNNING');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [startTime, setStartTime] = useState(new Date().toISOString().substring(0, 16));
  
  // Additional metrics
  const [pace, setPace] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!duration || !caloriesBurned) {
      alert('Please fill in duration and calories');
      return;
    }

    const additionalMetrics = {};
    if (pace) additionalMetrics.pace = pace;
    if (heartRate) additionalMetrics.heartRate = parseInt(heartRate, 10);
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
  };

  const renderTypeFields = () => {
    switch (type) {
      case 'RUNNING':
      case 'WALKING':
      case 'CYCLING':
        return (
          <>
            <div style={{ flex: 1 }}>
              <label className="activity-stat-label">Pace (e.g., 5:30/km)</label>
              <input 
                type="text" 
                placeholder="5:30" 
                value={pace} 
                onChange={(e) => setPace(e.target.value)} 
                style={{ marginTop: '6px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="activity-stat-label">Avg Heart Rate (BPM)</label>
              <input 
                type="number" 
                placeholder="145" 
                value={heartRate} 
                onChange={(e) => setHeartRate(e.target.value)} 
                style={{ marginTop: '6px' }}
              />
            </div>
          </>
        );
      case 'WEIGHT_TRAINING':
        return (
          <>
            <div style={{ flex: 1 }}>
              <label className="activity-stat-label">Target Weight (lbs/kg)</label>
              <input 
                type="number" 
                placeholder="150" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                style={{ marginTop: '6px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="activity-stat-label">Avg Heart Rate (BPM)</label>
              <input 
                type="number" 
                placeholder="110" 
                value={heartRate} 
                onChange={(e) => setHeartRate(e.target.value)} 
                style={{ marginTop: '6px' }}
              />
            </div>
          </>
        );
      default:
        return (
          <div style={{ width: '100%' }}>
            <label className="activity-stat-label">Avg Heart Rate (BPM)</label>
            <input 
              type="number" 
              placeholder="120" 
              value={heartRate} 
              onChange={(e) => setHeartRate(e.target.value)} 
              style={{ marginTop: '6px' }}
            />
          </div>
        );
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
            placeholder="45" 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
            style={{ marginTop: '6px' }}
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <label className="activity-stat-label">Calories Burned</label>
          <input 
            type="number" 
            placeholder="350" 
            value={caloriesBurned} 
            onChange={(e) => setCaloriesBurned(e.target.value)} 
            style={{ marginTop: '6px' }}
            required
          />
        </div>
      </div>

      <div className="form-row">
        {renderTypeFields()}
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
