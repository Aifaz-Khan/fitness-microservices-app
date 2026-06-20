import React from 'react';

export default function StatCard({ title, value, unit, subtext, color = 'var(--primary)' }) {
  return (
    <div className="card fade-in">
      <div className="card-title">{title}</div>
      <div className="card-value" style={{ color }}>
        {value} {unit && <span>{unit}</span>}
      </div>
      {subtext && <div className="card-subtext">{subtext}</div>}
    </div>
  );
}
