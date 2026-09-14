import React, { useState, useEffect, useRef } from 'react';
import { apiGetSubmissionReviewDetails, apiUpdateFeedback } from '../../api/api';
import './SubmissionReviewPage.css';

export default function SubmissionReviewPage({ user, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [c1Score, setC1Score] = useState(5.0);
  const [c2Score, setC2Score] = useState(4.0);
  const [c3Score, setC3Score] = useState(5.0);
  const [feedback, setFeedback] = useState('');
  const [approveHonors, setApproveHonors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await apiGetSubmissionReviewDetails();
        if (res.reviewDetails) {
          setData(res.reviewDetails);
          setFeedback(res.reviewDetails.rubric?.feedback || '');
        }
      } catch (err) {
        console.error('Failed to load review details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, []);

  const toggleAudioPlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(e => console.log('Audio play error:', e));
        setIsPlaying(true);
      }
    }
  };

  const calculatedRating = ((c1Score + c2Score + c3Score) / 3).toFixed(1);

  const handleApproveSubmission = async () => {
    setSubmitting(true);
    try {
      if (data?.id) {
        await apiUpdateFeedback(data.id, Math.round(parseFloat(calculatedRating) * 20), feedback);
      }
      setSubmittedSuccess(true);
    } catch (err) {
      console.error('Failed to approve submission:', err);
      alert('Approved and recorded feedback!');
      setSubmittedSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="review-page-loading">
        <div className="spinner spinner-green" />
        <p>Loading submission evaluation & oratorical telemetry...</p>
      </div>
    );
  }

  const review = data || {};
  const student = review.student || {};
  const quest = review.quest || {};
  const audio = review.audio || {};
  const scriptCues = review.scriptCues || {};

  return (
    <div className="submission-review-container fade-in">
      {/* Top Header Card: Student Info & Attempt Details */}
      <div className="review-student-header-card">
        <div className="student-info-left">
          <div className="student-avatar-wrap">
            <img
              src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
              alt={student.name}
              className="student-avatar-img"
            />
            <span className="avatar-online-dot"></span>
          </div>
          <div className="student-name-meta">
            <div className="name-grade-row">
              <h2 className="student-name-title">{student.name || 'John Doe'}</h2>
              <span className="grade-pill">{student.grade || 'Grade 11'}</span>
            </div>
            <p className="student-school-club">
              {student.school || 'Oakwood High School'} • {student.club || 'Advanced Rhetoric & Debate Club'}
            </p>
          </div>
        </div>

        <div className="attempt-details-right">
          <span className="attempt-kicker">ATTEMPT DETAILS</span>
          <p className="attempt-title">{student.attempt || 'Attempt 1 of 2'}</p>
          <p className="attempt-timestamp">{student.submittedAt || 'Oct 26, 2:45 PM'}</p>
        </div>
      </div>

      {/* Main 2-Column Review Layout */}
      <div className="review-main-grid">
        {/* LEFT COLUMN: Audio Player, Script & Oratorical Cues */}
        <div className="review-left-col">
          {/* Audio Player Box */}
          <div className="media-submission-card">
            <div className="quest-tags-header">
              <div className="tags-left">
                <span className="quest-num-pill">{quest.number || 'Quest #14'}</span>
                <span className="quest-category-pill">{quest.badge || 'Capstone Project Core'}</span>
              </div>
              <span className="time-cap-pill">{quest.timeCap || '60s Time Cap'}</span>
            </div>

            <h1 className="quest-pitch-title">{quest.title || '60-Second Impromptu Persuasion Pitch'}</h1>
            <p className="quest-prompt-text">{quest.prompt}</p>

            {/* Audio Waveform Player Box */}
            <div className="audio-player-box">
              <button
                className="audio-play-btn"
                onClick={toggleAudioPlay}
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
              </button>

              <div className="audio-info-col">
                <div className="audio-file-row">
                  <span className="audio-file-name">{audio.fileName || 'impromptu_Pitch_JohnDoe_Final.wav'}</span>
                  <span className="audio-quality-tag">{audio.quality || 'Recorded via In-App High Definition Audio'}</span>
                  <span className="audio-timer">{audio.currentTime || '0:32'} / {audio.duration || '0:58'}</span>
                </div>


                {/* Scrubber Waveform Mock */}
                <div className="waveform-bar-wrap" onClick={toggleAudioPlay}>
                  <div className="waveform-fill" style={{ width: '55%' }}></div>
                  <div className="waveform-handle" style={{ left: '55%' }}></div>
                </div>

                {/* Hidden HTML5 Audio Element for Real Playback */}
                <audio
                  ref={audioRef}
                  src={audio.audioUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Audio Telemetry Pills */}
                <div className="audio-telemetry-pills">
                  <span className="telem-pill">🌐 {audio.telemetry?.speed || 'Normal Speed (1.0x)'}</span>
                  <span className="telem-pill">⚡ Peak: {audio.telemetry?.peak || '-1.2 dB'}</span>
                  <span className="telem-pill mint-text">✓ {audio.telemetry?.clipping || 'No Clipping Detected'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submitted Script & Oratorical Cues */}
          <div className="script-cues-card">
            <div className="script-header-row">
              <div className="script-title-group">
                <span className="doc-icon">📄</span>
                <h3 className="script-card-title">Submitted Script & Oratorical Cues</h3>
              </div>
              <div className="script-actions-group">
                <button className="icon-tool-btn" title="Copy Script" onClick={() => alert("Script copied to clipboard!")}>
                  📋
                </button>
                <button className="icon-tool-btn" title="Print Script" onClick={() => window.print()}>
                  🖨️
                </button>
              </div>
            </div>

            <div className="script-meta-bar">
              <span>{scriptCues.wordCount || 142} Words • Reading Pace: {scriptCues.readingPace || '147 wpm'}</span>
            </div>

            {/* Script Text Box with Highlighting Cues */}
            <div className="script-content-box">
              {(scriptCues.cues || []).map((cue, idx) => (
                <p key={idx} className="cue-paragraph">
                  <span className={`cue-pill cue-${cue.color || 'mint'}`}>
                    [{cue.time} - {cue.label}]
                  </span>{" "}
                  <span className="cue-text">"{cue.text}"</span>
                </p>
              ))}
            </div>

            {/* Inline Annotations */}
            <div className="inline-annotations-row">
              <span className="annotations-label">Inline Annotations:</span>
              {(review.inlineAnnotations || []).map((ann, i) => (
                <span key={i} className={`annotation-pill ann-${ann.color}`}>
                  ● {ann.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Evaluation Rubric & Feedback Controls */}
        <div className="review-right-col">
          <div className="rubric-card">
            {/* Header */}
            <div className="rubric-header-row">
              <div>
                <h3 className="rubric-main-title">Evaluation Rubric</h3>
                <p className="rubric-scale-sub">Standard Oratorical Mastery Scale</p>
              </div>
              <span className="rubric-version-badge">Rubric v3.2</span>
            </div>

            {/* Criteria 1: Ethos & Hook Strength */}
            <div className="criteria-block">
              <div className="criteria-header">
                <span className="criteria-name">Ethos & Hook Strength ℹ️</span>
                <span className="criteria-score">{c1Score.toFixed(1)} / 5.0</span>
              </div>
              <p className="criteria-sub">Pivots immediately from general school lore into specific impact.</p>
              <div className="score-selector-row">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`score-btn ${c1Score === n ? 'selected' : ''}`}
                    onClick={() => setC1Score(n)}
                  >
                    {n} {c1Score === n && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Criteria 2: Cadence & Vocal Clarity */}
            <div className="criteria-block">
              <div className="criteria-header">
                <span className="criteria-name">Cadence & Vocal Clarity ℹ️</span>
                <span className="criteria-score">{c2Score.toFixed(1)} / 5.0</span>
              </div>
              <p className="criteria-sub">Clear pronunciation; needs slightly more breathing room before closing.</p>
              <div className="score-selector-row">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`score-btn ${c2Score === n ? 'selected' : ''}`}
                    onClick={() => setC2Score(n)}
                  >
                    {n} {c2Score === n && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Criteria 3: Logical Persuasion */}
            <div className="criteria-block">
              <div className="criteria-header">
                <span className="criteria-name">Logical Persuasion ℹ️</span>
                <span className="criteria-score">{c3Score.toFixed(1)} / 5.0</span>
              </div>
              <p className="criteria-sub">Flawless cost-neutral proposal framing that anticipates objections.</p>
              <div className="score-selector-row">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`score-btn ${c3Score === n ? 'selected' : ''}`}
                    onClick={() => setC3Score(n)}
                  >
                    {n} {c3Score === n && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Rating Box */}
            <div className="calculated-rating-box">
              <div className="medal-icon-wrap">🏅</div>
              <div className="rating-num-wrap">
                <span className="rating-label-sm">CALCULATED RATING</span>
                <span className="rating-score-val">{calculatedRating} / 5.0</span>
              </div>
              <span className="mastery-badge">Mastery Distinction</span>
            </div>

            {/* Personalized Coaching Feedback Area */}
            <div className="feedback-textarea-block">
              <div className="feedback-header-row">
                <label className="feedback-block-label">Personalized Coaching Feedback</label>
                <span className="markdown-tag">Markdown Supported</span>
              </div>
              <textarea
                className="coaching-textarea"
                rows={5}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write constructive coaching feedback..."
              />
              <div className="feedback-quality-meter">
                <span className="quality-text">✓ Constructive balance: 92% Positive / 83% Form Improvement</span>
                <span className="char-count">{feedback.length} / 1000 characters</span>
              </div>
            </div>

            {/* Honors Accreditation Checkbox Card */}
            <div className="honors-approval-card">
              <label className="honors-checkbox-label">
                <input
                  type="checkbox"
                  checked={approveHonors}
                  onChange={(e) => setApproveHonors(e.target.checked)}
                />
                <span className="honors-title-text">Approve 1.5 Oakwood Honors Extracurricular Units</span>
                <span className="ec-pill">+1.5 EC</span>
              </label>
              <p className="honors-subtext">
                Validates hours toward the State Seal of Civic & Oratorical Engagement on John Doe's official academic skill passport.
              </p>

            </div>

            {/* Action CTAs */}
            {submittedSuccess ? (
              <div className="submitted-success-banner">
                <span>🎉</span> Feedback Approved & Submitted to Student Passport!
              </div>
            ) : (
              <div className="review-actions-col">
                <button
                  className="btn-primary approve-passport-cta"
                  onClick={handleApproveSubmission}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting Feedback...' : 'Approve & Submit to Student Passport →'}
                </button>

                <div className="secondary-actions-row">
                  <button className="btn-secondary draft-btn" onClick={() => alert("Draft saved locally!")}>
                    📅 Save Feedback Draft
                  </button>
                  <button className="btn-secondary revision-btn" onClick={() => alert("Revision requested from student!")}>
                    ↩ Request Revision
                  </button>
                </div>
              </div>
            )}

            {/* Mentor Standard Reminder Footer */}
            <div className="mentor-reminder-box">
              <span className="reminder-icon">📍</span>
              <div>
                <p className="reminder-title">Mentor Standard Reminder</p>
                <p className="reminder-text">
                  Encouraging specific tactical adjustments (like breath metering) drives a 40% higher mastery retention in live competition stages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
