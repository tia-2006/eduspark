import React, { useState } from 'react';
import './LoginPage.css';

export default function LoginPage({ onNavigateToRegister, onLoginSuccess }) {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  // Active quick-fill preset indicator
  const [activeQuickFill, setActiveQuickFill] = useState('john');

  // Submission & API state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Quick fill preset handler
  const handleQuickFill = (presetKey) => {
    setActiveQuickFill(presetKey);
    setErrorMessage('');
    setSuccessData(null);

    if (presetKey === 'john') {
      setEmail('john.doe@example.com');
      setPassword('password123');
      setRole('student');
    } else if (presetKey === 'maya') {
      setEmail('maya.lin@example.com');
      setPassword('password123');
      setRole('student');
    } else if (presetKey === 'vance') {
      setEmail('dr.vance@example.com');
      setPassword('password123');
      setRole('mentor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessData(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your school email or ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = '/api/auth/login';
      const bodyPayload = {
        email: email.trim().toLowerCase(),
        password,
      };

      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      // Fallback if proxy is not reached
      if (!response.ok && response.status === 404) {
        response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyPayload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      // Store token & user data in localStorage
      if (data.token) {
        localStorage.setItem('eduspark_token', data.token);
        localStorage.setItem('eduspark_user', JSON.stringify(data.user));
      }

      setSuccessData(data);

      // Notify parent App to transition to dashboard
      if (onLoginSuccess && data.user && data.token) {
        onLoginSuccess(data.user, data.token);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSSOClick = (provider) => {
    alert(`Fast-track ${provider} login simulated! Authorizing with EduSpark Single Sign-On...`);
  };

  return (
    <div className="login-container">
      {/* Background ambient light blur */}
      <div className="ambient-blur blur-1"></div>
      <div className="ambient-blur blur-2"></div>

      <header className="brand-header">
        <div className="brand-logo">
          <span className="logo-spark">✨</span> Edu<span className="logo-highlight">Spark</span>
        </div>
        <div className="header-nav">
          <span className="nav-label">New to EduSpark?</span>
          <button
            type="button"
            className="nav-link-btn"
            onClick={onNavigateToRegister}
          >
            Create Account →
          </button>
        </div>
      </header>

      <main className="card-wrapper">
        <div className="login-card">
          {/* Card Top Header */}
          <div className="card-header">
            <h1 className="card-title">Welcome Back</h1>
            <p className="card-subtitle">
              Track your high school clubs, state competitions, and mentor reviews.
            </p>
          </div>

          {/* Account Role Selector */}
          <div className="role-tabs-container">
            <div className="role-tabs">
              <button
                type="button"
                className={`role-tab ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'mentor' ? 'active' : ''}`}
                onClick={() => setRole('mentor')}
              >
                Mentor / Coach
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'school_admin' ? 'active' : ''}`}
                onClick={() => setRole('school_admin')}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Linked Portal & Demo Roster Bar */}
          <div className="portal-roster-section">
            <div className="portal-linked-bar">
              <span className="live-dot green"></span>
              <span>Springfield High Portal Linked <strong>(District #42)</strong></span>
            </div>

            <div className="roster-quickfill-row">
              <span className="quickfill-label">Demo Roster Quick-fill:</span>
              <div className="roster-pills">
                <button
                  type="button"
                  className={`roster-pill ${activeQuickFill === 'john' ? 'active' : ''}`}
                  onClick={() => handleQuickFill('john')}
                >
                  <span className="check-icon">✓</span> John Doe (Springfield) • Active
                </button>
                <button
                  type="button"
                  className={`roster-pill ${activeQuickFill === 'maya' ? 'active' : ''}`}
                  onClick={() => handleQuickFill('maya')}
                >
                  Maya Lin (Oakwood High)
                </button>
                <button
                  type="button"
                  className={`roster-pill ${activeQuickFill === 'vance' ? 'active' : ''}`}
                  onClick={() => handleQuickFill('vance')}
                >
                  Dr. Vance (Speech Coach)
                </button>
              </div>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="sso-grid">
            <button
              type="button"
              className="sso-btn"
              onClick={() => handleSSOClick('Google Classroom')}
            >
              <span className="sso-icon google">G</span> Google Classroom
            </button>
            <button
              type="button"
              className="sso-btn"
              onClick={() => handleSSOClick('Clever SSO')}
            >
              <span className="sso-icon clever">C</span> Clever SSO
            </button>
            <button
              type="button"
              className="sso-btn"
              onClick={() => handleSSOClick('Canvas SIS')}
            >
              <span className="sso-icon canvas">✦</span> Canvas SIS
            </button>
          </div>

          {/* Divider */}
          <div className="sso-divider">
            <span>OR SIGN IN WITH SCHOOL EMAIL / ID</span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="loginEmail">
                  {role === 'student' ? 'Student Email or School ID' : role === 'mentor' ? 'Mentor Email' : 'Admin Email'}
                </label>
                <span className="verified-pill">✓ Springfield Verified</span>
              </div>
              <div className="input-wrapper">
                <span className="input-icon">@</span>
                <input
                  id="loginEmail"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="loginPassword">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to your registered school email."); }} className="forgot-link">
                  Forgot password?
                </a>
              </div>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Remember Device & Network Safe Row */}
            <div className="options-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                />
                <span>Remember this device on campus</span>
              </label>

              <span className="network-safe-pill">
                <span className="globe-icon">🌐</span> District Network Safe
              </span>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Alert */}
            {successData && (
              <div className="alert alert-success">
                <div className="success-header">
                  <span className="success-icon">🎉</span>
                  <strong>{successData.message || 'Login Successful!'}</strong>
                </div>
                <div className="success-details">
                  <p><strong>Welcome back,</strong> {successData.user?.name} ({successData.user?.role})</p>
                  <p className="token-preview"><strong>Auth Token:</strong> {successData.token ? `${successData.token.substring(0, 32)}...` : 'Active'}</p>
                </div>
              </div>
            )}

            {/* Submit CTA Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-spinner-wrapper">
                  <span className="spinner"></span> Authenticating...
                </span>
              ) : (
                <>Sign In to EduSpark {role === 'student' ? 'Student' : role === 'mentor' ? 'Mentor' : 'Admin'} Portal →</>
              )}
            </button>

            {/* Footer */}
            <footer className="card-footer">
              <p className="help-text">
                Need assistance logging in? Contact Springfield High Registrar or <a href="#helpdesk" onClick={(e) => e.preventDefault()} className="helpdesk-link">District IT Helpdesk (ext. 402)</a>
              </p>
              <div className="compliance-row">
                <span>🛡️ FERPA & COPPA Compliant</span>
                <span className="dot">•</span>
                <span>🛡️ SafeSport Certified</span>
                <span className="dot">•</span>
                <span>🛡️ SOC2 Type II</span>
              </div>
            </footer>
          </form>
        </div>
      </main>
    </div>
  );
}
