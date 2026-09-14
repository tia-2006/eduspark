import React, { useEffect, useState } from 'react';
import { apiGetClasses } from '../../api/api';
import './ExplorePage.css';

const CATEGORIES = ['All', 'Communication', 'Strategy', 'Science', 'Arts', 'Technology'];

const LEVEL_COLORS = {
  Beginner: { bg: '#dcfce7', text: '#166534' },
  Intermediate: { bg: '#dbeafe', text: '#1e40af' },
  Advanced: { bg: '#fef3c7', text: '#92400e' },
};

function ClassCard({ cls, onTakeQuiz }) {
  const levelStyle = LEVEL_COLORS[cls.level] || LEVEL_COLORS.Beginner;
  const icon = cls.category?.toLowerCase() === 'communication' ? '🎤'
    : cls.category?.toLowerCase() === 'strategy' ? '♟️'
    : cls.category?.toLowerCase() === 'science' ? '🔬'
    : '📚';

  return (
    <div className="class-card fade-in">
      <div className="class-card-top">
        <div className="class-card-icon">{icon}</div>
        <div className="class-card-badges">
          <span className={`tag tag-${cls.category?.toLowerCase() || 'gray'}`}>{cls.category}</span>
          <span className="tag" style={{ background: levelStyle.bg, color: levelStyle.text }}>{cls.level}</span>
        </div>
      </div>
      <h3 className="class-card-title">{cls.title}</h3>
      <p className="class-card-desc">{cls.description}</p>

      <div className="class-card-meta">
        <div className="class-meta-item">
          <span>👤</span> {cls.mentor}
        </div>
        <div className="class-meta-item">
          <span>⏱️</span> {cls.duration}
        </div>
      </div>

      <div className="class-card-actions">
        <button className="btn-primary class-cta" onClick={() => onTakeQuiz(cls._id)}>
          Start Learning →
        </button>
        {cls.sampleLessonUrl && (
          <a href={cls.sampleLessonUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary class-preview">
            Preview
          </a>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage({ onNavigate }) {
  const [classes, setClasses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiGetClasses();
        setClasses(res.classes || []);
        setFiltered(res.classes || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCategoryFilter = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      setFiltered(classes);
    } else {
      setFiltered(classes.filter(c => c.category?.toLowerCase() === cat.toLowerCase()));
    }
  };

  return (
    <div className="explore-page fade-in">
      <div className="explore-header">
        <div>
          <h1 className="explore-title">Explore Skills</h1>
          <p className="explore-sub">
            Discover expert-led classes in extracurricular excellence across every skill domain
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="explore-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`explore-filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="explore-loading">
          <div className="spinner spinner-green" />
          <p>Loading skill tracks...</p>
        </div>
      ) : error ? (
        <div className="explore-error">
          <p>⚠️ {error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="explore-empty">
          <p>No classes found in this category yet.</p>
        </div>
      ) : (
        <div className="explore-grid">
          {filtered.map(cls => (
            <ClassCard
              key={cls._id}
              cls={cls}
              onTakeQuiz={(classId) => onNavigate('quizzes', { classId })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
