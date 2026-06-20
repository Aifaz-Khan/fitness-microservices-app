import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const QUICK_SUGGESTIONS = [
  "How can I increase my stamina?",
  "Recommend a 15-minute home core routine",
  "What is the ideal ratio for post-workout meals?",
  "Explain progressive overload simply"
];

export default function CoachChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get('/api/recommendations/chat');
        if (res.data && res.data.length > 0) {
          setMessages(res.data);
        } else {
          setMessages([
            { role: 'model', text: "Hi there! I'm your AI Fitness Coach. I can help answer questions about your routines, cardio form, diet planning, or recovery. What can I do for you today?" }
          ]);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
        setMessages([
          { role: 'model', text: "Hi there! I'm your AI Fitness Coach. I can help answer questions about your routines, cardio form, diet planning, or recovery. What can I do for you today?" }
        ]);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, []);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || loading) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/api/recommendations/chat', {
        message: textToSend
      });

      const replyText = response.data?.response || "I didn't catch that. Could you please rephrase?";
      setMessages(prev => [...prev, { role: 'model', text: replyText }]);
    } catch (err) {
      console.error('Chat error', err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I'm having trouble connecting to the coaching engine. Please make sure the AI service is active and try again!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div className="fade-in" style={{ padding: '24px 0', height: 'calc(100vh - 120px)' }}>
      <div className="chat-container">
        <div className="chat-main">
          {/* Header */}
          <div className="chat-header">
            <div className="coach-avatar">🤖</div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>AI Fitness Coach</h3>
              <p style={{ fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--success)', borderRadius: '50%' }}></span>
                Online & Ready
              </p>
            </div>
          </div>

          {/* Messages Grid */}
          <div className="chat-messages">
            {historyLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div className="spinner" style={{ color: 'var(--primary)', width: '30px', height: '30px' }}></div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`msg-bubble ${msg.role === 'user' ? 'msg-user' : 'msg-coach'}`}
                  >
                    {msg.text}
                  </div>
                ))}
              </>
            )}
            {loading && (
              <div className="msg-bubble msg-coach" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '12px 18px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Thinking</span>
                <span className="spinner" style={{ width: '12px', height: '12px', border: '1.5px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div className="chat-suggestions">
            {QUICK_SUGGESTIONS.map((sug, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSendMessage(sug)}
                disabled={loading}
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Chat Form */}
          <div className="chat-input-area">
            <form onSubmit={handleSubmit} className="chat-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your coach anything about health, workouts..."
                disabled={loading}
                autoComplete="off"
                style={{ flexGrow: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!input.trim() || loading}
                style={{ flexShrink: 0, width: '100px' }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
