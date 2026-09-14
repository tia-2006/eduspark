import React, { useEffect, useState } from 'react';
import { apiGetMentorSubmissions, apiUpdateFeedback, apiApplyForMentor } from '../../api/api';
import './MentorHubPage.css';

function FeedbackCard({ submission, onFeedbackGiven }) {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(submission.status === 'reviewed');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!score || isNaN(Number(score))) {
      setError('Please enter a valid score.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiUpdateFeedback(submission._id, Number(score), feedback);
      setDone(true);
      onFeedbackGiven();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`feedback-card ${done ? 'reviewed' : ''}`}>
      <div className="feedback-card-header">
        <div className="feedback-student-info">
          <div className="feedback-avatar">
            {submission.student?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="feedback-student-name">{submission.student?.name || 'Unknown Student'}</p>
            <p className="feedback-student-meta">
              {submission.student?.school || 'No school'} · {submission.quest?.skill || 'Quest'}
            </p>
          </div>
        </div>
        <div className="feedback-status-badge" data-status={submission.status}>
          {submission.status === 'reviewed' ? '✓ Reviewed' : '⏳ Pending'}
        </div>
      </div>

      <div className="feedback-quest-info">
        <p className="feedback-quest-name">{submission.quest?.title || 'Quest'}</p>
        <p className="feedback-max-score">Max Score: {submission.quest?.maxScore || 100} pts</p>
      </div>

      <div className="feedback-content">
        <p className="feedback-content-label">Student Submission</p>
        <p className="feedback-content-text">{submission.content}</p>
      </div>

      {done ? (
        <div className="feedback-done">
          <p>✓ Score: <strong>{submission.score} / {submission.quest?.maxScore || 100}</strong></p>
          {submission.mentorFeedback && <p>Feedback: {submission.mentorFeedback}</p>}
        </div>
      ) : (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-form-row">
            <div className="feedback-form-group">
              <label className="feedback-label">Score (out of {submission.quest?.maxScore || 100})</label>
              <input
                type="number"
                className="feedback-input"
                placeholder={`0 – ${submission.quest?.maxScore || 100}`}
                min={0}
                max={submission.quest?.maxScore || 100}
                value={score}
                onChange={e => setScore(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="feedback-form-group">
            <label className="feedback-label">Mentor Feedback</label>
            <textarea
              className="feedback-textarea"
              placeholder="Write constructive feedback for this student..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
            />
          </div>
          {error && <p className="feedback-error">{error}</p>}
          <button className="btn-primary feedback-submit-btn" type="submit" disabled={submitting}>
            {submitting ? <span className="spinner" /> : '✓ Submit Feedback'}
          </button>
        </form>
      )}
    </div>
  );
}

function ApplyMentorForm({ user }) {
  const [form, setForm] = useState({ skill: '', experience: '', bio: '', demoLessonUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

export default function MentorHubPage({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const isMentor = user?.role === 'mentor' || user?.role === 'admin' || user?.role === 'school_admin';

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
    if (isMentor) fetchSubmissions();
    else setLoading(false);
  }, [isMentor]);

  const filtered = filterStatus === 'all'
    ? submissions
    : submissions.filter(s => s.status === filterStatus);

  return (
    <div className="mentor-hub fade-in">
      <div className="mentor-hub-header">
        <div>
          <h1 className="mentor-hub-title">Mentor Hub</h1>
          <p className="mentor-hub-sub">
            {isMentor ? 'Review student submissions and provide feedback' : 'Connect with mentors and apply to share your expertise'}
          </p>
        </div>
      </div>

      {/* For non-mentors: Apply form */}
      {!isMentor && (
        <>
          <ApplyMentorForm user={user} />
          <div className="mentor-hub-note">
            <p>
              🔒 The mentor review queue is only available to verified mentors.
              After your application is approved, you'll gain access to student submissions.
            </p>
          </div>
        </>
      )}

      {/* For mentors: Review queue */}
      {isMentor && (
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
          ) : filtered.length === 0 ? (
            <div className="mentor-empty">
              <p>🎉 No {filterStatus !== 'all' ? filterStatus : ''} submissions to review!</p>
            </div>
          ) : (
            <div className="mentor-cards-list">
              {filtered.map(sub => (
                <FeedbackCard
                  key={sub._id}
                  submission={sub}
                  onFeedbackGiven={fetchSubmissions}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
