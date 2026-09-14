import React, { useEffect, useState } from 'react';
import { apiGetClasses, apiGetQuests } from '../../api/api';
import './DashboardPage.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri (Today)', 'Sat', 'Sun'];
const COMMITMENT_DATA = [65, 78, 55, 85, 92, 0, 0];

const ACHIEVEMENTS = [
  {
    type: 'BADGE UNLOCKED',
    time: '+ 2h ago',
    title: 'Master of Rhetoric',
    desc: 'Awarded for 3 consecutive high-scoring persuasive deliveries.',
    icon: '🏅',
    color: '#8b5cf6',
  },
  {
    type: 'CERTIFICATE',
    time: 'Yesterday',
    title: 'Pawn Structure Specialist',
    desc: 'Passed advanced endgame evaluation with 94% accuracy.',
    icon: '📜',
    color: '#1a9e5c',
  },
];

const EVENTS = [
  {
    category: 'Live Debate Scrimmage',
    day: 'Mon • 4:30 PM',
    title: 'Resolved: Global Carbon Dividend',
    location: 'Auditorium East • In-Person',
    room: 'Conf. Room B',
    icon: '🎙️',
  },
  {
    category: 'Oakwood Invitational',
    day: 'Thu • 3:45 PM',
    title: 'Regional Interscholastic Chess Meet',
    location: 'Round 1: Board #3 (Black)',
    badge: 'Confirmed',
    icon: '♟️',
  },
];

function StatCard({ label, icon, value, unit, sub, subIcon, color, progress }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-icon" style={{ color }}>{icon}</span>
      </div>
      <div className="stat-card-value">
        <span className="stat-num">{value}</span>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      <p className="stat-sub">
        {subIcon && <span className="stat-sub-icon">{subIcon}</span>}
        {sub}
      </p>
      {progress !== undefined && (
        <div className="progress-bar-wrap" style={{ marginTop: 10 }}>
          <div
            className="progress-bar-fill progress-green"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function TrackCard({ cls, quest, onStartQuiz, onStartQuest }) {
  const progress = cls.skill?.toLowerCase().includes('chess') ? 42 : 68;
  const colorClass = cls.skill?.toLowerCase().includes('chess') ? 'progress-blue' : 'progress-green';
  const icon = cls.category?.toLowerCase() === 'communication' ? '🎤' : '♟️';

  return (
    <div className="track-card fade-in">
      <div className="track-card-header">
        <div className="track-icon">{icon}</div>
        <div className="track-meta">
          <div className="track-tags">
            <span className={`tag ${cls.category?.toLowerCase() === 'communication' ? 'tag-communication' : 'tag-strategy'}`}>
              {cls.category}
            </span>
            <span className="tag tag-gray">{cls.mentor ? `${cls.skill}` : 'General'}</span>
          </div>
          <h3 className="track-title">{cls.title}</h3>
        </div>
        <div className="track-progress-label">{progress}%<br /><span>Completed</span></div>
      </div>

      <div className="progress-bar-wrap" style={{ margin: '12px 0' }}>
        <div className={`progress-bar-fill ${colorClass}`} style={{ width: `${progress}%` }} />
      </div>

      {quest && (
        <div className="track-next">
          <p className="track-next-label">UP NEXT</p>
          <div className="track-next-card">
            <div className="track-next-icon">📋</div>
            <div className="track-next-info">
              <h4 className="track-next-title">{quest.title}</h4>
              <p className="track-next-desc">{quest.description?.slice(0, 80)}...</p>
            </div>
            <div className="track-next-mentor">
              <div className="mentor-avatar-sm">{cls.mentor?.charAt(0) || 'M'}</div>
              <div className="mentor-info-sm">
                <p>{cls.mentor || 'Mentor'}</p>
                <span>Lead Mentor</span>
              </div>
            </div>
            <button
              className="btn-primary track-cta"
              onClick={() => onStartQuest(quest._id)}
            >
              Continue Learning →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage({ user, onNavigate }) {
  const [classes, setClasses] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, questRes] = await Promise.all([
          apiGetClasses(),
          apiGetQuests(),
        ]);
        setClasses(classRes.classes || []);
        setQuests(questRes.quests || []);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getQuestForClass = (cls) =>
    quests.find(q =>
      q.classId?._id === cls._id ||
      q.skill?.toLowerCase() === cls.skill?.toLowerCase()
    );

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="dashboard fade-in">
      {/* Welcome banner */}
      <div className="dashboard-banner">
        <div className="banner-content">
          <div className="banner-track-badge">
            <span className="banner-dot" />
            OAKWOOD HIGH HONORS TRACK &nbsp;·&nbsp; Term 2 • 2025
          </div>
          <h1 className="banner-title">Welcome back, {firstName}! 👋</h1>
          <p className="banner-sub">
            Keep fueling your extracurricular spark today. You have{' '}
            <strong style={{ color: 'var(--color-primary)' }}>{quests.length} active quests</strong>{' '}
            awaiting review from your mentors.
          </p>
        </div>
        <div className="banner-actions">
          <button className="banner-action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Sync Calendar
          </button>
          <button className="banner-spark-btn" onClick={() => onNavigate('quizzes')}>
            ⚡ Spark
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <StatCard
          label="MOMENTUM"
          icon="🔥"
          value="12"
          unit=" Days Streak"
          sub="Personal record: 18 days"
          subIcon="↗"
          color="#ef4444"
          progress={67}
        />
        <StatCard
          label="PROGRESS"
          icon="📡"
          value="7"
          unit=" Quests Done"
          sub="+2 finished this week"
          subIcon="●"
          color="#3b82f6"
          progress={54}
        />
        <StatCard
          label="TRUST & RIGOR"
          icon="✅"
          value="3"
          unit=" Verified Badges"
          sub="Evaluated by GM Rostov & Vance"
          subIcon="✦"
          color="#1a9e5c"
          progress={75}
        />
        <StatCard
          label="RANK TIER"
          icon="🏆"
          value="Lvl 4"
          unit=""
          sub="420 XP to Level 5 Pioneer"
          subIcon="⭐"
          color="#8b5cf6"
          progress={42}
        />
      </div>

      {/* Main content */}
      <div className="dashboard-main">
        <div className="dashboard-left">
          {/* Learning tracks */}
          <section className="section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Active Learning Tracks</h2>
                <p className="section-sub">Continue assignments verified by accredited faculty & master mentors</p>
              </div>
              <button className="btn-ghost" onClick={() => onNavigate('explore')}>
                Explore syllabus →
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner spinner-green" />
                <p>Loading your tracks...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="empty-state">
                <p>No classes available yet. <button className="btn-ghost" onClick={() => onNavigate('explore')}>Explore skills</button></p>
              </div>
            ) : (
              <div className="tracks-list">
                {classes.map(cls => (
                  <TrackCard
                    key={cls._id}
                    cls={cls}
                    quest={getQuestForClass(cls)}
                    onStartQuiz={() => onNavigate('classes')}
                    onStartQuest={() => onNavigate('classes')}
                  />
                ))}

              </div>
            )}
          </section>

          {/* Weekly commitment radar */}
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Weekly Commitment Radar</h2>
              <span className="section-badge">14.5 hrs total logged</span>
            </div>
            <div className="commitment-chart">
              {DAYS.map((day, i) => (
                <div key={day} className="commitment-day">
                  <div className="commitment-bars">
                    <div
                      className={`commitment-bar ${COMMITMENT_DATA[i] > 0 ? 'active' : 'empty'} ${day.includes('Today') ? 'today' : ''}`}
                      style={{ height: `${COMMITMENT_DATA[i]}%` }}
                    />
                  </div>
                  <span className="commitment-label">{day}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="dashboard-right">
          {/* Recent achievements */}
          <section className="section">
            <div className="section-header">
              <h2 className="section-title-sm">Recent Achievements</h2>
              <span className="section-icon">🏆</span>
            </div>
            <div className="achievements-list">
              {ACHIEVEMENTS.map((ach, i) => (
                <div key={i} className="achievement-card">
                  <div className="achievement-icon" style={{ background: ach.color + '20', color: ach.color }}>
                    {ach.icon}
                  </div>
                  <div className="achievement-info">
                    <div className="achievement-meta">
                      <span className="achievement-type" style={{ color: ach.color }}>{ach.type}</span>
                      <span className="achievement-time">{ach.time}</span>
                    </div>
                    <p className="achievement-title">{ach.title}</p>
                    <p className="achievement-desc">{ach.desc}</p>
                  </div>
                </div>
              ))}
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                onClick={() => onNavigate('skill-passport')}>
                🎒 View Full Skill Passport
              </button>
            </div>
          </section>

          {/* Upcoming events */}
          <section className="section" style={{ marginTop: 20 }}>
            <div className="section-header">
              <h2 className="section-title-sm">Upcoming Scrimmages</h2>
              <span className="section-badge-sm">Next 7 Days</span>
            </div>
            <p className="section-sub" style={{ marginBottom: 12, fontSize: 11 }}>Live School Calendar</p>
            <div className="events-list">
              {EVENTS.map((ev, i) => (
                <div key={i} className="event-card">
                  <span className="event-icon">{ev.icon}</span>
                  <div className="event-info">
                    <div className="event-meta">
                      <span className="event-cat">{ev.category}</span>
                      <span className="event-day">{ev.day}</span>
                    </div>
                    <p className="event-title">{ev.title}</p>
                    <p className="event-location">{ev.location}</p>
                    {ev.badge && <span className="event-badge">{ev.badge}</span>}
                    {ev.room && <span className="event-room">{ev.room}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* SMS reminder notice */}
            <div className="sms-card">
              <span>🔔</span>
              <div>
                <p className="sms-title">SMS Reminders Active</p>
                <p className="sms-desc">Notifying 30 min prior to start.</p>
              </div>
            </div>
          </section>

          {/* Mentor office hours */}
          <section className="section mentor-hours-card" style={{ marginTop: 20 }}>
            <div className="mentor-hours-header">
              <div className="mentor-hours-icon">📍</div>
              <div>
                <p className="mentor-hours-title">Mentor Office Hours</p>
                <p className="mentor-hours-sub">Connect 1-on-1 via video</p>
              </div>
            </div>
            <p className="mentor-hours-desc">
              Dr. Vance has 2 open 15-minute critique slots tomorrow afternoon before the debate practice.
            </p>
            <button className="btn-primary" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
              onClick={() => onNavigate('mentor-hub')}>
              Book 15-min Slot
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
