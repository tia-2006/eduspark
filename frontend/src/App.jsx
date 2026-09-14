import React, { useState, useEffect } from 'react';
import { loadSession, saveSession, clearSession } from './api/api';

// Layout
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';

// Pages
import DashboardPage from './components/Dashboard/DashboardPage';
import ExplorePage from './components/Explore/ExplorePage';
import QuizzesPage from './components/Quizzes/QuizzesPage';
import MentorHubPage from './components/MentorHub/MentorHubPage';
import SchoolAnalyticsPage from './components/SchoolAnalytics/SchoolAnalyticsPage';
import AdminPortalPage from './components/AdminPortal/AdminPortalPage';
import SkillPassportPage from './components/SkillPassport/SkillPassportPage';

// Auth pages (existing)
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

import './App.css';

export default function App() {
  const [session, setSession] = useState(null); // { user, token }
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [navState, setNavState] = useState({}); // extra state for navigation (e.g. classId)
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeRoleTab, setActiveRoleTab] = useState('Student');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load session on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setSession(saved);
    }
  }, []);

  // Handle login success (called from LoginPage)
  const handleLoginSuccess = (user, token) => {
    saveSession(user, token);
    setSession({ user, token });
    setCurrentPage('dashboard');
  };

  // Handle register success (called from RegisterPage)
  const handleRegisterSuccess = (user, token) => {
    saveSession(user, token);
    setSession({ user, token });
    setCurrentPage('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    clearSession();
    setSession(null);
    setAuthView('login');
    setCurrentPage('dashboard');
  };

  // Navigate to a page with optional extra state
  const navigate = (page, state = {}) => {
    setCurrentPage(page);
    setNavState(state);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // If not logged in, show auth pages
  if (!session) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onNavigateToLogin={() => setAuthView('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }
    return (
      <LoginPage
        onNavigateToRegister={() => setAuthView('register')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Render the current page content
  const renderPage = () => {
    const props = { user: session.user, onNavigate: navigate, ...navState };
    switch (currentPage) {
      case 'dashboard':       return <DashboardPage {...props} />;
      case 'explore':         return <ExplorePage {...props} />;
      case 'classes':         return <ExplorePage {...props} />;
      case 'quizzes':         return <QuizzesPage {...props} />;
      case 'skill-passport':  return <SkillPassportPage {...props} />;
      case 'mentor-hub':      return <MentorHubPage {...props} />;
      case 'school-analytics':return <SchoolAnalyticsPage {...props} />;
      case 'admin-portal':    return <AdminPortalPage {...props} />;
      default:                return <DashboardPage {...props} />;
    }
  };

  const handleRoleTabChange = (roleTab) => {
    setActiveRoleTab(roleTab);
    if (roleTab === 'School') {
      setCurrentPage('school-analytics');
    } else if (roleTab === 'Mentor') {
      setCurrentPage('mentor-hub');
    } else if (roleTab === 'Admin') {
      setCurrentPage('admin-portal');
    } else {
      setCurrentPage('dashboard');
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        user={session.user}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar
          user={session.user}
          onLogout={handleLogout}
          activeRoleTab={activeRoleTab}
          onRoleTabChange={handleRoleTabChange}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="app-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
