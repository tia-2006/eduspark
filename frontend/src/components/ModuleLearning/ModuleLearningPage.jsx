import React, { useEffect, useState } from 'react';
import { apiGetModuleDetails, apiAnalyzeArgument } from '../../api/api';
import './ModuleLearningPage.css';

const getYouTubeEmbedUrl = (url) => {
  const defaultEmbed = "https://www.youtube.com/embed/Unzc731iCUY";
  if (!url) return defaultEmbed;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return defaultEmbed;
};

export default function ModuleLearningPage({ user, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customClaim, setCustomClaim] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzerScores, setAnalyzerScores] = useState({
    logos: 90,
    ethos: 85,
    pathos: 95
  });
  const [activeDrill, setActiveDrill] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await apiGetModuleDetails();
        setData(res.module || null);
      } catch (err) {
        console.error('Failed to load module details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

  const handleAnalyzeClaim = async (e) => {
    e.preventDefault();
    if (!customClaim.trim()) return;
    setAnalyzing(true);
    try {
      const res = await apiAnalyzeArgument(customClaim);
      if (res.scores) {
        setAnalyzerScores({
          logos: res.scores.logos.value,
          ethos: res.scores.ethos.value,
          pathos: res.scores.pathos.value
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="module-learning-loading">
        <div className="spinner spinner-green" />
        <p>Loading course module & video lecture...</p>
      </div>
    );
  }

  const moduleData = data || {};
  const mentor = moduleData.mentor || {};
  const lesson = moduleData.currentLesson || {};
  const objectives = moduleData.objectives || [];
  const roadmap = moduleData.roadmap || [];

  return (
    <div className="module-learning-container fade-in">
      {/* Top Breadcrumb Header */}
      <div className="module-breadcrumb-bar">
        <div className="breadcrumb-left">
          <span className="breadcrumb-link" onClick={() => onNavigate('explore')}>Explore Skills</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-link" onClick={() => onNavigate('classes')}>Public Speaking</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Module 3: Constructing a Powerful Argument</span>
        </div>
        <div className="breadcrumb-right">
          <span className="track-badge-pill">
            <span className="pill-dot"></span> Communication Track • Grade 11
          </span>
          <button className="icon-action-btn" title="Share Module">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Grid: Left (Hero, Video, Objectives, Analyzer) & Right (Progression, Roadmap, Specs) */}
      <div className="module-learning-grid">
        {/* LEFT COLUMN */}
        <div className="module-main-col">
          {/* Hero Card */}
          <div className="module-hero-card">
            <div className="module-hero-left">
              <div className="hero-tags-row">
                <span className="hero-lab-pill">{moduleData.trackBadge || 'CORE SKILL LABORATORY'}</span>
                <span className="hero-runtime">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {moduleData.runtime || '35 mins total runtime'}
                </span>
              </div>
              <h1 className="module-title">{moduleData.title || 'Module 3: Constructing a Powerful Argument'}</h1>
              <p className="module-subtitle">
                {moduleData.subtitle || 'Learn how elite debaters craft persuasive, logically unassailable narratives. Dissect thesis construction, psychological framing, and rapid refutation techniques under high-pressure school and competition formats.'}
              </p>
            </div>

            {/* Mentor Badge Card */}
            <div className="hero-mentor-card">
              <div className="mentor-avatar-wrap">
                <span className="mentor-avatar-img">👨‍🏫</span>
                <span className="online-indicator"></span>
              </div>
              <div className="mentor-details">
                <h4 className="mentor-name">{mentor.name || 'Dr. Alistair Vance'}</h4>
                <p className="mentor-role">{mentor.title || 'Oxford Debate Coach • TEDx Speaker'}</p>
                <div className="mentor-stats-row">
                  <span className="star-rating">⭐ {mentor.rating || '4.9'}</span>
                  <span className="dot-divider">•</span>
                  <span className="student-count">{mentor.activeStudents || 340} active students</span>
                </div>
              </div>
            </div>
          </div>

          {/* Working Video Player Card */}
          <div className="video-player-card">
            <div className="video-player-topbar">
              <div className="playing-status">
                <span className="pulse-dot"></span>
                <span className="status-label">NOW PLAYING</span>
                <span className="lesson-label">{lesson.title || 'Lesson 3.2: Hooking Your Audience in 15 Seconds'}</span>
              </div>
              <div className="video-quality-tag">
                <span>{lesson.quality || 'HD 1080P'}</span>
                <button className="settings-btn" title="Video Settings">⚙️</button>
              </div>
            </div>

            {/* YouTube Embedded Video Box */}
            <div className="video-viewport youtube-viewport">
              <iframe
                className="youtube-video-iframe"
                src={getYouTubeEmbedUrl(lesson.youtubeUrl || lesson.videoUrl)}
                title={lesson.title || "Lesson 3.2: Hooking Your Audience in 15 Seconds"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Footer bar */}
            <div className="video-player-footer">
              <div className="footer-left">
                <span className="caption-icon">📝</span>
                <span className="caption-text">English Subtitles (Auto-synced notes available below)</span>
              </div>
              <a href="#transcript" className="transcript-link" onClick={(e) => { e.preventDefault(); alert("Downloading Lesson 3.2 Audio & Text Transcript (PDF)..."); }}>
                <span>📄 Audio Transcript (PDF)</span>
              </a>
            </div>
          </div>

          {/* Lesson Blueprint Section */}
          <div className="blueprint-section">
            <div className="section-header-row">
              <div>
                <span className="section-kicker">LESSON BLUEPRINT</span>
                <h2 className="section-main-heading">Curriculum Objectives & Competencies</h2>
              </div>
              <span className="drills-count-tag">3 Practical Drills</span>
            </div>
            <p className="blueprint-lead">
              Every compelling speech pivots on deliberate architecture. In this module, Dr. Vance breaks down the cognitive patterns of judges and large audiences, teaching you how to organize premises logically and anchor emotional conviction without appearing theatrical.
            </p>

            {/* Objectives 3-Column Grid */}
            <div className="objectives-grid">
              {objectives.map((obj) => (
                <div key={obj.id} className="objective-card">
                  <div className="obj-number">{obj.number}</div>
                  <h3 className="obj-title">{obj.title}</h3>
                  <p className="obj-desc">{obj.description}</p>
                  <button
                    className="obj-drill-btn"
                    onClick={() => setActiveDrill(obj.title)}
                  >
                    <span>{obj.drillIcon}</span>
                    <span>{obj.drill}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Argument Analyzer */}
          <div className="argument-analyzer-card">
            <div className="analyzer-header">
              <div className="analyzer-title-wrap">
                <span className="analyzer-icon">🧪</span>
                <div>
                  <h3 className="analyzer-title">Interactive Argument Analyzer</h3>
                  <p className="analyzer-sub">Analyze sample claim & evaluate its ethos-pathos-logos score</p>
                </div>
              </div>
              <span className="interactive-badge">Interactive Drill</span>
            </div>

            <div className="case-study-box">
              <div className="case-study-meta">
                <span>SAMPLE CASE STUDY: RESOLUTION 4A</span>
                <span className="oxford-tag">Oxford Union Style</span>
              </div>
              <blockquote className="case-study-quote">
                "Over 75% of civic decisions fail not because of flawed policy, but because leaders speak to satisfy themselves rather than illuminate their listeners."
              </blockquote>

              {/* Dynamic Score Bars */}
              <div className="scores-bars-grid">
                <div className="score-item">
                  <div className="score-header">
                    <span className="score-label">Logos (75% Stat)</span>
                    <span className="score-val" style={{ color: '#10b981' }}>{analyzerScores.logos}%</span>
                  </div>
                  <div className="score-bar-bg">
                    <div className="score-bar-fill fill-green" style={{ width: `${analyzerScores.logos}%` }}></div>
                  </div>
                </div>

                <div className="score-item">
                  <div className="score-header">
                    <span className="score-label">Ethos (Zero)</span>
                    <span className="score-val" style={{ color: '#6366f1' }}>{analyzerScores.ethos}%</span>
                  </div>
                  <div className="score-bar-bg">
                    <div className="score-bar-fill fill-purple" style={{ width: `${analyzerScores.ethos}%` }}></div>
                  </div>
                </div>

                <div className="score-item">
                  <div className="score-header">
                    <span className="score-label">Pathos (Impact)</span>
                    <span className="score-val" style={{ color: '#14b8a6' }}>{analyzerScores.pathos}%</span>
                  </div>
                  <div className="score-bar-bg">
                    <div className="score-bar-fill fill-mint" style={{ width: `${analyzerScores.pathos}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Interactive Speech Claim Input */}
              <form onSubmit={handleAnalyzeClaim} className="analyzer-form">
                <input
                  type="text"
                  className="analyzer-input"
                  placeholder="Type your own speech opening to analyze rhetorical balance..."
                  value={customClaim}
                  onChange={(e) => setCustomClaim(e.target.value)}
                />
                <button type="submit" className="btn-primary analyzer-btn" disabled={analyzing}>
                  {analyzing ? 'Evaluating Rhetoric...' : 'Evaluate Speech Claim ⚡'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Sidebar Controls & Roadmap) */}
        <div className="module-side-col">
          {/* Track Progression & Quiz Action */}
          <div className="side-card track-progression-card">
            <div className="progression-header">
              <span className="progression-label">TRACK PROGRESSION</span>
              <span className="progression-percent">50% Completed</span>
            </div>
            <div className="progression-bar-bg">
              <div className="progression-bar-fill" style={{ width: '50%' }}></div>
            </div>
            <div className="progression-meta">
              <span>Module 3 of 6</span>
              <span>35 mins remaining</span>
            </div>

            <button className="take-quiz-cta" onClick={() => onNavigate('quizzes')}>
              <span>Take Module Quiz</span>
              <span className="arrow">→</span>
            </button>
            <p className="quiz-pass-note">5 questions • Passing grade: 80% (4/5 correct)</p>
          </div>

          {/* Module Roadmap List */}
          <div className="side-card roadmap-card">
            <h3 className="side-card-title">MODULE ROADMAP</h3>
            <div className="roadmap-list">
              {roadmap.map((item) => (
                <div
                  key={item.id}
                  className={`roadmap-item ${item.current ? 'current' : ''} ${item.locked ? 'locked' : ''}`}
                >
                  <div className="roadmap-left">
                    <div className={`status-badge-icon ${item.current ? 'active-dot' : item.locked ? 'lock' : 'check'}`}>
                      {item.current ? '●' : item.locked ? '🔒' : '✓'}
                    </div>
                    <div className="roadmap-info">
                      <p className="roadmap-title">{item.title}</p>
                      {item.score && <p className="roadmap-sub green">{item.score}</p>}
                      {item.lesson && <p className="roadmap-sub mint">{item.lesson}</p>}
                      {item.note && <p className="roadmap-sub gray">{item.note}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites & Credentials */}
          <div className="side-card credentials-card">
            <h3 className="side-card-title">Prerequisites & Credentials</h3>
            <div className="cred-item">
              <span className="cred-icon mint">🛡️</span>
              <div>
                <p className="cred-title">Oratory Tier I Certification</p>
                <p className="cred-sub">Verified by Oakwood Academic Council (Fall '24)</p>
              </div>
            </div>

            <div className="cred-item">
              <span className="cred-icon purple">🏅</span>
              <div>
                <p className="cred-title">Skill Passport Stamp</p>
                <p className="cred-sub">Grants 1.5 Extracurricular Honors credits upon quiz pass</p>
              </div>
            </div>

            <div className="school-endorse-pill">
              <span>from Oakwood High</span>
            </div>
          </div>

          {/* Mentor Office Hours */}
          <div className="side-card office-hours-card">
            <div className="office-hours-header">
              <span className="office-icon">💬</span>
              <div>
                <p className="office-title">Mentor Office Hours</p>
                <p className="office-time">Every Thursday at 4:30 PM EST</p>
              </div>
              <button className="rsvp-btn" onClick={() => onNavigate('mentor-hub')}>RSVP</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
