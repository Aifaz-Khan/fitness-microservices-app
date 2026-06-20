import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AIInsights({ userId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRec, setSelectedRec] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!userId) return;
      try {
        const res = await api.get(`/api/recommendations/user/${userId}`);
        const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecommendations(sorted);
        if (sorted.length > 0) {
          setSelectedRec(sorted[0]);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [userId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="insights-container fade-in">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div className="spinner" style={{ color: 'var(--primary)', width: '40px', height: '40px' }}></div>
        </div>
      ) : recommendations.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%', flexDirection: 'column', gap: '16px' }}>
          <span style={{ fontSize: '48px' }}>🤖</span>
          <h3>No AI recommendations available yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Log a workout first, and our Gemini AI coach will generate analysis dynamically!</p>
        </div>
      ) : (
        <div className="insights-grid">
          {/* Sidebar */}
          <div className="insights-sidebar">
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              History ({recommendations.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recommendations.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => setSelectedRec(rec)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: selectedRec?.id === rec.id ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                    border: '1px solid',
                    borderColor: selectedRec?.id === rec.id ? 'var(--primary)' : 'var(--border)',
                    color: selectedRec?.id === rec.id ? 'var(--primary)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                    {rec.activityType ? rec.activityType.replace('_', ' ') : 'Session'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {formatDate(rec.createdAt)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content panel */}
          <div className="insights-content">
            {selectedRec ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <div>
                    <span className="badge badge-success" style={{ marginBottom: '8px', display: 'inline-block' }}>Gemini Pro Analysis</span>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
                      {selectedRec.activityType.replace('_', ' ')} Report
                    </h2>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {formatDate(selectedRec.createdAt)}
                  </span>
                </div>

                <div className="insight-section">
                  <h3>🧠 Overall Feedback & Metrics</h3>
                  <div style={{
                    backgroundColor: '#1A222D',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '18px',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line'
                  }}>
                    {selectedRec.recommendation}
                  </div>
                </div>

                <div className="insights-subgrid">
                  <div className="insight-section">
                    <h3>📈 Suggested Improvements</h3>
                    <ul className="insight-bullet-list">
                      {selectedRec.improvements && selectedRec.improvements.length > 0 ? (
                        selectedRec.improvements.map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))
                      ) : (
                        <li>Keep working hard! No specific improvement notes.</li>
                      )}
                    </ul>
                  </div>

                  <div className="insight-section">
                    <h3>💪 Recommended Routines</h3>
                    <ul className="insight-bullet-list">
                      {selectedRec.suggestions && selectedRec.suggestions.length > 0 ? (
                        selectedRec.suggestions.map((sug, idx) => (
                          <li key={idx}>{sug}</li>
                        ))
                      ) : (
                        <li>Keep exploring different routines!</li>
                      )}
                    </ul>
                  </div>
                </div>

                {selectedRec.safety && selectedRec.safety.length > 0 && (
                  <div className="insight-section">
                    <h3>⚠️ Injury Prevention & Safety</h3>
                    <ul className="insight-bullet-list safety">
                      {selectedRec.safety.map((saf, idx) => (
                        <li key={idx} style={{ borderLeftColor: 'var(--primary)' }}>{saf}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
