import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AIInsights({ userId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRec, setSelectedRec] = useState(null);
  const [loading, setLoading] = useState(true);

  const parseRecommendation = (text) => {
    if (!text) return [];
    const paragraphs = text.split(/\n\n+/);
    const sections = [];
    paragraphs.forEach(para => {
      const trimmed = para.trim();
      if (!trimmed) return;
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0 && colonIdx < 25) {
        sections.push({
          title: trimmed.substring(0, colonIdx).trim(),
          content: trimmed.substring(colonIdx + 1).trim()
        });
      } else {
        sections.push({
          title: 'General',
          content: trimmed
        });
      }
    });
    return sections;
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
          <div key={lIdx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '4px 0', paddingLeft: '8px' }}>
            <span style={{ color: 'var(--primary)', fontSize: '14px', lineHeight: '1.4' }}>•</span>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5', flexGrow: 1 }}>
              {parts.length > 0 ? parts : cleanLine}
            </span>
          </div>
        );
      }
      
      return (
        <p key={lIdx} style={{ margin: '4px 0', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
          {parts.length > 0 ? parts : cleanLine}
        </p>
      );
    });
  };

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
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(0, 212, 255, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800' }}>AI</div>
          <h3>No Recommendations Available</h3>
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
                  <h3>Performance Analysis</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    {parseRecommendation(selectedRec.recommendation).map((section, idx) => (
                      <div key={idx} className="card" style={{ borderLeft: '3px solid var(--primary)', padding: '16px', backgroundColor: 'var(--card-bg)' }}>
                        <h4 style={{ color: 'var(--primary)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '0.5px' }}>
                          {section.title}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {renderFormattedText(section.content)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="insights-subgrid">
                  <div className="insight-section">
                    <h3>Suggested Improvements</h3>
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
                    <h3>Recommended Routines</h3>
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
                    <h3>Injury Prevention & Safety</h3>
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
