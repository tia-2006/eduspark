import React, { useEffect, useState } from 'react';
import { apiGetMentorSubmissions, apiUpdateFeedback, apiApplyForMentor } from '../../api/api';
import SubmissionReviewPage from './SubmissionReviewPage';
import './MentorHubPage.css';

function FeedbackCard({ submission, onReviewClick }) {
  const isReviewed = submission.status === 'reviewed';

  return (
    <div className={`feedback-card ${isReviewed ? 'reviewed' : ''}`}>
      <div className="feedback-card-header">
        <div className="feedback-student-info">
          <div className="feedback-avatar">
            {submission.student?.name?.charAt(0) || 'M'}
          </div>
          <div>
            <p className="feedback-student-name">{submission.student?.name || 'John Doe'}</p>
            <p className="feedback-student-meta">
              {submission.student?.school || 'Oakwood High School'} · {submission.quest?.skill || 'Public Speaking'}
            </p>
          </div>
        </div>
        <div className="feedback-status-badge" data-status={submission.status}>
          {isReviewed ? '✓ Reviewed' : '⏳ Pending Review'}
        </div>
      </div>

      <div className="feedback-quest-info">
        <p className="feedback-quest-name">{submission.quest?.title || '60-Second Impromptu Persuasion Pitch'}</p>
        <p className="feedback-max-score">Max Score: {submission.quest?.maxScore || 100} pts</p>
      </div>

      <div className="feedback-content">
        <p className="feedback-content-label">Student Submission Script & Audio</p>
        <p className="feedback-content-text">{submission.content?.slice(0, 140)}...</p>
      </div>

      <div className="feedback-actions-row" style={{ marginTop: 16 }}>
        <button
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => onReviewClick(submission)}
        >
          🔍 Review Submission & Rubric →
        </button>
      </div>
    </div>
  );
}

function ApplyMentorForm({ user }) {
  const [form, setForm] = useState({ skill: '', experience: '', bio: '', demoLessonUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.value]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.skill || !form.experience || !form.bio) {
      setError('Skill, experience, and bio are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiApplyForMentor({ ...form, user: user?.id });
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="apply-success">
      <span>🎉</span>
      <div>
        <p className="apply-success-title">Application Submitted!</p>
        <p className="apply-success-desc">Your mentor application is under review. You'll be notified once approved.</p>
      </div>
    </div>
  );

  return (
    <div className="apply-mentor-card">
      <div className="apply-mentor-header">
        <span className="apply-mentor-icon">👨‍🏫</span>
        <div>
          <h3>Apply to Become a Mentor</h3>
          <p>Share your expertise with students across the platform</p>
        </div>
      </div>
      <form className="apply-form" onSubmit={handleSubmit}>
        <div className="apply-form-group">
          <label>Skill / Expertise</label>
          <input name="skill" className="apply-input" value={form.skill} onChange={handleChange} placeholder="e.g. Public Speaking, Chess, Debate" required />
        </div>
        <div className="apply-form-group">
          <label>Experience</label>
          <input name="experience" className="apply-input" value={form.experience} onChange={handleChange} placeholder="Describe your years of experience..." required />
        </div>
        <div className="apply-form-group">
          <label>Bio</label>
          <textarea name="bio" className="apply-textarea" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself..." rows={3} required />
        </div>
        <div className="apply-form-group">
          <label>Demo Lesson URL (optional)</label>
          <input name="demoLessonUrl" className="apply-input" value={form.demoLessonUrl} onChange={handleChange} placeholder="https://youtube.com/..." />
        </div>
        {error && <p className="apply-error">{error}</p>}
        <button className="btn-primary apply-submit-btn" type="submit" disabled={submitting}>
          {submitting ? <span className="spinner" /> : '🚀 Submit Application'}
        </button>
      </form>
    </div>
  );
}

export default function MentorHubPage({ user, onNavigate }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('review'); // Default to full evaluation review page matching design screenshots!
  const isMentor = true; // Mentor Hub available for viewing/testing

  const fetchSubmissions = async () => {
    try {
      const res = await apiGetMentorSubmissions();
      setSubmissions(res.submissions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filtered = filterStatus === 'all'
    ? submissions
    : submissions.filter(s => s.status === filterStatus);

  if (viewMode === 'review') {
    return (
      <div className="mentor-hub-review-wrap fade-in">
        <div className="mentor-subnav-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px 0 32px' }}>
          <button className="btn-ghost" onClick={() => setViewMode('queue')}>
            ← Back to Submission Queue
          </button>
          <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
            MENTOR EVALUATION SUITE • John Doe (Quest #14)
          </div>
        </div>
        <SubmissionReviewPage user={user} onNavigate={onNavigate} />
      </div>
    );
  }


  return (
    <div className="mentor-hub fade-in">
      <div className="mentor-hub-header">
        <div>
          <h1 className="mentor-hub-title">Mentor Hub</h1>
          <p className="mentor-hub-sub">
            Review student submissions, grade oratorical rubrics, and provide feedback
          </p>
        </div>
        <button className="btn-primary" onClick={() => setViewMode('review')}>
          🔍 Open Active Evaluation Suite →
        </button>
      </div>

      {/* For mentors: Review queue */}
      <div className="mentor-review-section">
        {/* Filter bar */}
        <div className="mentor-filter-bar">
          <h2 className="mentor-review-title">Submission Review Queue</h2>
          <div className="mentor-filters">
            {['all', 'pending', 'reviewed'].map(f => (
              <button
                key={f}
                className={`mentor-filter-btn ${filterStatus === f ? 'active' : ''}`}
                onClick={() => setFilterStatus(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && (
                  <span className="mentor-filter-badge">
                    {submissions.filter(s => s.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mentor-loading">
            <div className="spinner spinner-green" />
            <p>Loading submissions...</p>
          </div>
        ) : error ? (
          <div className="mentor-error">⚠️ {error}</div>
        ) : (
          <div className="mentor-cards-list">
            {filtered.map(sub => (
              <FeedbackCard
                key={sub._id}
                submission={sub}
                onReviewClick={() => setViewMode('review')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
