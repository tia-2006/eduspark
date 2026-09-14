import React, { useEffect, useState } from 'react';
import { apiGetMentorApplications, apiApproveMentor, apiRejectMentor } from '../../api/api';
import './AdminPortalPage.css';

function ApplicationCard({ app, onUpdate }) {
  const [loading, setLoading] = useState('');
  const [done, setDone] = useState(app.status !== 'pending');
  const [currentStatus, setCurrentStatus] = useState(app.status);

  const handle = async (action) => {
    setLoading(action);
    try {
      if (action === 'approve') {
        await apiApproveMentor(app._id);
        setCurrentStatus('approved');
      } else {
        await apiRejectMentor(app._id);
        setCurrentStatus('rejected');
      }
      setDone(true);
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading('');
    }
  };

  const user = app.user || {};

  return (
    <div className={`admin-app-card ${currentStatus}`}>
      <div className="admin-app-header">
        <div className="admin-app-user">
          <div className="admin-app-avatar">
            {user.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="admin-app-name">{user.name || 'Unknown'}</p>
            <p className="admin-app-email">{user.email}</p>
          </div>
        </div>
        <span className={`admin-app-status ${currentStatus}`}>
          {currentStatus === 'pending' ? '⏳ Pending'
            : currentStatus === 'approved' ? '✅ Approved'
            : '❌ Rejected'}
        </span>
      </div>

      <div className="admin-app-details">
        <div className="admin-app-detail">
          <span className="admin-detail-label">Skill</span>
          <span className="admin-detail-value">{app.skill}</span>
        </div>
        <div className="admin-app-detail">
          <span className="admin-detail-label">School</span>
          <span className="admin-detail-value">{user.school || 'N/A'}</span>
        </div>
        <div className="admin-app-detail admin-app-detail--full">
          <span className="admin-detail-label">Experience</span>
          <span className="admin-detail-value">{app.experience}</span>
        </div>
        <div className="admin-app-detail admin-app-detail--full">
          <span className="admin-detail-label">Bio</span>
          <span className="admin-detail-value">{app.bio}</span>
        </div>
        {app.demoLessonUrl && (
          <div className="admin-app-detail admin-app-detail--full">
            <span className="admin-detail-label">Demo Lesson</span>
            <a href={app.demoLessonUrl} target="_blank" rel="noopener noreferrer" className="admin-demo-link">
              View Demo →
            </a>
          </div>
        )}
      </div>

      {currentStatus === 'pending' && (
        <div className="admin-app-actions">
          <button
            className="btn-primary admin-approve-btn"
            onClick={() => handle('approve')}
            disabled={!!loading}
          >
            {loading === 'approve' ? <span className="spinner" /> : '✓ Approve'}
          </button>
          <button
            className="btn-danger"
            onClick={() => handle('reject')}
            disabled={!!loading}
          >
            {loading === 'reject' ? <span className="spinner spinner-green" /> : '✗ Reject'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminPortalPage({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchApplications = async () => {
    try {
      const res = await apiGetMentorApplications();
      setApplications(res.applications || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filtered = filterStatus === 'all'
    ? applications
    : applications.filter(a => a.status === filterStatus);

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="admin-portal fade-in">
      <div className="admin-portal-header">
        <div>
          <h1 className="admin-portal-title">Admin Portal</h1>
          <p className="admin-portal-sub">Manage mentor applications and platform governance</p>
        </div>
        {pendingCount > 0 && (
          <div className="admin-pending-alert">
            <span className="admin-pending-dot" />
            {pendingCount} pending application{pendingCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Section: Mentor Applications */}
      <section className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Mentor Applications</h2>
          <div className="admin-filter-tabs">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                className={`admin-filter-tab ${filterStatus === f ? 'active' : ''}`}
                onClick={() => setFilterStatus(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner spinner-green" />
            <p>Loading applications...</p>
          </div>
        ) : error ? (
          <div className="admin-error">⚠️ {error}</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <p>No {filterStatus !== 'all' ? filterStatus : ''} applications found.</p>
          </div>
        ) : (
          <div className="admin-apps-list">
            {filtered.map(app => (
              <ApplicationCard
                key={app._id}
                app={app}
                onUpdate={fetchApplications}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
