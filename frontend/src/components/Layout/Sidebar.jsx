import React from 'react';
import './Sidebar.css';

const NAV_ITEMS = [
  { key: 'dashboard',        icon: '⊞', label: 'Dashboard' },
  { key: 'explore',          icon: '◎', label: 'Explore Skills' },
  { key: 'classes',          icon: '⊕', label: 'My Classes' },
  { key: 'quizzes',          icon: '≡', label: 'Quizzes & Quests' },
  { key: 'skill-passport',   icon: '⊠', label: 'Skill Passport' },
  { key: 'mentor-hub',       icon: '♦', label: 'Mentor Hub' },
  { key: 'school-analytics', icon: '⊟', label: 'School Analytics', roles: ['school_admin', 'admin'] },
  { key: 'admin-portal',     icon: '⊙', label: 'Admin Portal', roles: ['admin'] },
];

export default function Sidebar({ currentPage, onNavigate, user, collapsed, onToggleCollapse }) {
  const role = user?.role || 'student';

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.roles || item.roles.includes(role)
  );

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo + toggle */}
      <div className="sidebar-top-row">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.9"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          {!collapsed && <span className="sidebar-logo-text">EduSpark</span>}
        </div>
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
      </div>

      {/* School badge */}
      {user?.school && !collapsed && (
        <div className="sidebar-school">
          <div className="sidebar-school-dot" />
          <span className="sidebar-school-name">{user.school}</span>
        </div>
      )}

      {/* Nav label */}
      {!collapsed && <p className="sidebar-nav-label">PLATFORM NAVIGATION</p>}

      {/* Navigation items */}
      <nav className="sidebar-nav">
        {visibleItems.map(item => (
          <button
            key={item.key}
            className={`sidebar-nav-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
            title={collapsed ? item.label : ''}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-nav-label-text">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom user card */}
      <div className={`sidebar-user-card ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-user-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        {!collapsed && (
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || 'User'}</p>
            <p className="sidebar-user-role">{role.replace('_', ' ')}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
