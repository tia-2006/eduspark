import React, { useState } from 'react';
import './Navbar.css';

const ROLE_TABS = ['Student', 'Mentor', 'School', 'Admin'];

export default function Navbar({ user, onLogout, activeRoleTab, onRoleTabChange, sidebarCollapsed }) {
  const [searchValue, setSearchValue] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className={`navbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Search */}
      <div className="navbar-search">
        <svg className="navbar-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="navbar-search-input"
          type="text"
          placeholder="Search oratorical frameworks, chess openings, mentor..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
      </div>

      {/* Role tabs */}
      <div className="navbar-tabs">
        {ROLE_TABS.map(tab => (
          <button
            key={tab}
            className={`navbar-tab ${activeRoleTab === tab ? 'active' : ''}`}
            onClick={() => onRoleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div className="navbar-actions">
        {/* Notifications */}
        <button className="navbar-notif-btn" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="navbar-notif-dot" />
        </button>

        {/* User profile */}
        <div className="navbar-user" title={user?.name}>
          <div className="navbar-user-avatar">{initials}</div>
          <div className="navbar-user-info">
            <p className="navbar-user-name">{user?.name || 'User'}</p>
            <p className="navbar-user-sub">
              {user?.school ? `${user.school}` : (user?.role?.replace('_', ' ') || 'Student')}
            </p>
          </div>
          <button className="navbar-logout-btn" onClick={onLogout} title="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
