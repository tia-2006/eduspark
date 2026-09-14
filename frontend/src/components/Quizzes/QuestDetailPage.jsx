import React, { useEffect, useState } from 'react';
import { apiGetQuestById, apiCreateSubmission } from '../../api/api';
import './QuestDetailPage.css';

export default function QuestDetailPage({ questId, user, onBack }) {
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiGetQuestById(questId);
        setQuest(res.quest);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [questId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setSubmitError('Please write your submission before submitting.');
      return;
    }
    if (content.trim().length < 20) {
      setSubmitError('Your submission must be at least 20 characters.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await apiCreateSubmission(questId, content.trim());
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="quest-detail-loading">
      <div className="spinner spinner-green" />
      <p>Loading quest...</p>
    </div>
  );

  if (error) return (
    <div className="quest-detail-error">
      <p>⚠️ {error}</p>
      <button className="btn-secondary" onClick={onBack}>← Back</button>
    </div>
  );

  if (!quest) return null;

  if (submitted) {
    return (
      <div className="quest-submitted fade-in">
        <div className="quest-submitted-card">
          <div className="quest-submitted-icon">🎉</div>
          <h2>Quest Submitted!</h2>
          <p>Your submission is now in the mentor review queue. You'll be notified when feedback is ready.</p>
          <div className="quest-submitted-meta">
            <span>Quest: <strong>{quest.title}</strong></span>
            <span>Max Score: <strong>{quest.maxScore} pts</strong></span>
          </div>
          <button className="btn-primary" onClick={onBack} style={{ marginTop: 20 }}>
            ← Back to Quests
          </button>
        </div>
      </div>
    );
  }

  const instructions = quest.instructions?.split('\n').filter(Boolean) || [];

  return (
    <div className="quest-detail fade-in">
      <button className="quiz-back-btn" onClick={onBack}>← Back to Quests</button>

      <div className="quest-detail-header">
        <div className="quest-detail-badges">
          <span className="tag tag-gray">{quest.skill}</span>
          {quest.classId?.category && (
            <span className={`tag tag-${quest.classId.category?.toLowerCase() || 'gray'}`}>
              {quest.classId.category}
            </span>
          )}
          <span className="tag" style={{ background: '#fef3c7', color: '#92400e' }}>
            🏆 {quest.maxScore} pts
          </span>
        </div>
        <h1 className="quest-detail-title">{quest.title}</h1>
        <p className="quest-detail-desc">{quest.description}</p>
      </div>

      {/* Instructions */}
      {instructions.length > 0 && (
        <div className="quest-instructions-card">
          <h3 className="quest-instructions-title">📋 Instructions</h3>
          <ol className="quest-instructions-list">
            {instructions.map((step, i) => (
              <li key={i} className="quest-instruction-item">
                {step.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Submission form */}
      <form className="quest-submission-form" onSubmit={handleSubmit}>
        <div className="quest-form-header">
          <h3>Your Submission</h3>
          <span className="quest-form-hint">
            {user?.name ? `Submitting as ${user.name}` : 'You must be logged in to submit'}
          </span>
        </div>
        <textarea
          className="quest-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your answer, paste a video link, or describe your submission here..."
          rows={8}
          required
        />
        <div className="quest-form-footer">
          <span className="quest-char-count">{content.length} characters</span>
          {submitError && <p className="quest-submit-error">{submitError}</p>}
          <button
            type="submit"
            className="btn-primary quest-submit-btn"
            disabled={submitting || !content.trim()}
          >
            {submitting ? <><span className="spinner" /> Submitting...</> : '🚀 Submit Quest'}
          </button>
        </div>
      </form>
    </div>
  );
}
