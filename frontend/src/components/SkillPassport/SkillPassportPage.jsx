import React from 'react';
import './SkillPassportPage.css';

const BADGES = [
  { icon: '🎤', title: 'Master of Rhetoric', desc: 'Awarded for 3 consecutive high-scoring persuasive deliveries.', color: '#8b5cf6', earned: true },
  { icon: '♟️', title: 'Pawn Structure Specialist', desc: 'Passed advanced endgame evaluation with 94% accuracy.', color: '#1a9e5c', earned: true },
  { icon: '🏆', title: 'Level 5 Pioneer', desc: 'Reach 420 XP more to unlock this tier badge.', color: '#f59e0b', earned: false },
  { icon: '🎯', title: 'Quest Master', desc: 'Complete 10 quests with a score above 80%.', color: '#3b82f6', earned: false },
];

const SKILLS = [
  { name: 'Public Speaking', level: 'Intermediate', xp: 680, maxXp: 1000, icon: '🎤', color: '#8b5cf6' },
  { name: 'Strategic Chess', level: 'Intermediate', xp: 420, maxXp: 1000, icon: '♟️', color: '#1a9e5c' },
];

export default function SkillPassportPage({ user }) {
  return (
    <div className="skill-passport fade-in">
      <div className="skill-passport-header">
        <div>
          <h1 className="skill-passport-title">Skill Passport</h1>
          <p className="skill-passport-sub">Your verified achievements, badges, and skill progress</p>
        </div>
        <div className="passport-rank-badge">
          <span>⭐</span>
          <div>
            <p className="passport-rank-level">Level 4 Explorer</p>
            <p className="passport-rank-sub">420 XP to Level 5 Pioneer</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="passport-user-card">
        <div className="passport-user-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="passport-user-info">
          <h2 className="passport-user-name">{user?.name || 'Student'}</h2>
          <p className="passport-user-school">{user?.school || 'EduSpark Platform'}</p>
          <div className="passport-user-stats">
            <div className="passport-user-stat">
              <span className="passport-stat-num">12</span>
              <span className="passport-stat-label">Day Streak</span>
            </div>
            <div className="passport-user-stat">
              <span className="passport-stat-num">7</span>
              <span className="passport-stat-label">Quests Done</span>
            </div>
            <div className="passport-user-stat">
              <span className="passport-stat-num">3</span>
              <span className="passport-stat-label">Badges Earned</span>
            </div>
          </div>
        </div>
      </div>

      <div className="passport-grid">
        {/* Skills section */}
        <section className="passport-section">
          <h2 className="passport-section-title">Active Skills</h2>
          <div className="passport-skills-list">
            {SKILLS.map((skill, i) => (
              <div key={i} className="passport-skill-card">
                <div className="passport-skill-icon" style={{ background: skill.color + '15', color: skill.color }}>
                  {skill.icon}
                </div>
                <div className="passport-skill-info">
                  <div className="passport-skill-header">
                    <p className="passport-skill-name">{skill.name}</p>
                    <span className="passport-skill-level">{skill.level}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(skill.xp / skill.maxXp) * 100}%`, background: skill.color }}
                    />
                  </div>
                  <p className="passport-skill-xp">{skill.xp} / {skill.maxXp} XP</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Badges section */}
        <section className="passport-section">
          <h2 className="passport-section-title">Badges & Certificates</h2>
          <div className="passport-badges-grid">
            {BADGES.map((badge, i) => (
              <div key={i} className={`passport-badge-card ${badge.earned ? 'earned' : 'locked'}`}>
                <div className="passport-badge-icon" style={{ background: badge.color + '15', color: badge.color }}>
                  {badge.earned ? badge.icon : '🔒'}
                </div>
                <p className="passport-badge-title">{badge.title}</p>
                <p className="passport-badge-desc">{badge.desc}</p>
                {badge.earned && <span className="passport-badge-earned">✓ Earned</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
