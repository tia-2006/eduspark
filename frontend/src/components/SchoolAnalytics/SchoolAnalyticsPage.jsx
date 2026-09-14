import React, { useEffect, useState } from 'react';
import { apiGetSchoolDashboard } from '../../api/api';
import './SchoolAnalyticsPage.css';

const STAT_ICONS = {
  totalStudents: '👤',
  totalClasses: '📚',
  publishedClasses: '✅',
  totalQuizzes: '📝',
  totalSubmissions: '📤',
  reviewedSubmissions: '✓',
  pendingSubmissions: '⏳',
};

const STAT_LABELS = {
  totalStudents: 'Total Students',
  totalClasses: 'Total Classes',
  publishedClasses: 'Published Classes',
  totalQuizzes: 'Total Quizzes',
  totalSubmissions: 'Total Submissions',
  reviewedSubmissions: 'Reviewed',
  pendingSubmissions: 'Pending Review',
};

const STAT_COLORS = {
  totalStudents: '#3b82f6',
  totalClasses: '#1a9e5c',
  publishedClasses: '#14b8a6',
  totalQuizzes: '#8b5cf6',
  totalSubmissions: '#f59e0b',
  reviewedSubmissions: '#1a9e5c',
  pendingSubmissions: '#ef4444',
};

export default function SchoolAnalyticsPage({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiGetSchoolDashboard();
        setData(res);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="school-analytics fade-in">
      <div className="school-analytics-header">
        <div>
          <h1 className="school-analytics-title">School Analytics</h1>
          <p className="school-analytics-sub">
            {data?.school ? `Viewing stats for: ${data.school}` : 'Platform-wide statistics and insights'}
          </p>
        </div>
        <div className="school-analytics-badge">
          <span>📊</span>
          Live Dashboard
        </div>
      </div>

      {loading ? (
        <div className="school-loading">
          <div className="spinner spinner-green" />
          <p>Loading analytics...</p>
        </div>
      ) : error ? (
        <div className="school-error">
          <p>⚠️ {error}</p>
          <p className="school-error-hint">
            Note: School Analytics requires admin or school_admin privileges.
          </p>
        </div>
      ) : data?.stats ? (
        <>
          {/* Stats grid */}
          <div className="school-stats-grid">
            {Object.entries(data.stats).map(([key, value]) => (
              <div key={key} className="school-stat-card" style={{ '--stat-color': STAT_COLORS[key] }}>
                <div className="school-stat-icon" style={{ background: STAT_COLORS[key] + '15', color: STAT_COLORS[key] }}>
                  {STAT_ICONS[key] || '📊'}
                </div>
                <div className="school-stat-info">
                  <p className="school-stat-label">{STAT_LABELS[key] || key}</p>
                  <p className="school-stat-value">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Submission rate chart */}
          {data.stats.totalSubmissions > 0 && (
            <div className="school-submission-chart">
              <h2 className="school-chart-title">Submission Review Progress</h2>
              <div className="school-chart-bars">
                <div className="school-chart-item">
                  <span className="school-chart-label">Reviewed</span>
                  <div className="school-chart-bar-wrap">
                    <div
                      className="school-chart-bar reviewed"
                      style={{ width: `${(data.stats.reviewedSubmissions / data.stats.totalSubmissions) * 100}%` }}
                    />
                  </div>
                  <span className="school-chart-num">{data.stats.reviewedSubmissions}</span>
                </div>
                <div className="school-chart-item">
                  <span className="school-chart-label">Pending</span>
                  <div className="school-chart-bar-wrap">
                    <div
                      className="school-chart-bar pending"
                      style={{ width: `${(data.stats.pendingSubmissions / data.stats.totalSubmissions) * 100}%` }}
                    />
                  </div>
                  <span className="school-chart-num">{data.stats.pendingSubmissions}</span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
