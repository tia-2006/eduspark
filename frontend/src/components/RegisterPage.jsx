import React, { useState } from 'react';
import './RegisterPage.css';

export default function RegisterPage({ onNavigateToLogin, onRegisterSuccess }) {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [school, setSchool] = useState('Springfield High');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Skill tracks state
  const [skillTracks, setSkillTracks] = useState({
    publicSpeaking: true,
    strategicChess: true,
  });

  // Code of conduct consent
  const [agreedCode, setAgreedCode] = useState(true);

  // Submission & API state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Calculate password strength (1 to 4)
  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass) && /[a-zA-Z]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(password);

  const getStrengthLabel = (score) => {
    switch (score) {
      case 0: return 'Too short';
      case 1: return 'Weak';
      case 2: return 'Good strength';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return '';
    }
  };

  const handleTrackToggle = (trackKey) => {
    setSkillTracks((prev) => ({
      ...prev,
      [trackKey]: !prev[trackKey],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessData(null);

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Student email is required.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (!agreedCode) {
      setErrorMessage('You must acknowledge the Student Code of Conduct.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = '/api/auth/register';
      const bodyPayload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: role === 'mentor' ? 'mentor' : role === 'school_admin' ? 'school_admin' : 'student',
        school: school.trim(),
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
        response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyPayload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store auth info in localStorage
      if (data.token) {
        localStorage.setItem('eduspark_token', data.token);
        localStorage.setItem('eduspark_user', JSON.stringify(data.user));
      }

      setSuccessData(data);

      // Notify parent App to transition to dashboard
      if (onRegisterSuccess && data.user && data.token) {
        onRegisterSuccess(data.user, data.token);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to registration server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSSOClick = (provider) => {
    alert(`Fast-track ${provider} authentication simulated! Connecting to EduSpark single sign-on...`);
  };

  return (
    <div className="register-container">
      {/* Background ambient lighting blur effects */}
      <div className="ambient-blur blur-1"></div>
      <div className="ambient-blur blur-2"></div>

      <header className="brand-header">
        <div className="brand-logo">
          <span className="logo-spark">✨</span> Edu<span className="logo-highlight">Spark</span>
        </div>
        <div className="header-status">
          {onNavigateToLogin && (
            <button
              type="button"
              className="nav-link-btn"
              onClick={onNavigateToLogin}
            >
              Sign In →
            </button>
          )}
          <span className="live-dot"></span> System Status: <strong>Online</strong>
        </div>
      </header>

      <main className="card-wrapper">
        <div className="register-card">
          {/* Card Top Banner / Meta Header */}
          <div className="card-header">
            <div className="header-top-row">
              <span className="prefilled-badge">
                <svg className="badge-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Pre-filled
              </span>
              <div className="step-tracker">
                <span className="step-number">STEP 1 OF 2</span>
                <span className="step-title">Profile & Credentials</span>
              </div>
            </div>

            <h1 className="card-title">
              Create your {role === 'student' ? 'Student' : role === 'mentor' ? 'Mentor' : 'School Admin'} Account
            </h1>
            <p className="card-subtitle">
              Get instant access to Public Speaking and Chess mastery tracks.
            </p>
          </div>

          {/* Account Role Selector */}
          <div className="role-selector-section">
            <label className="section-label">ACCOUNT ROLE</label>
            <div className="role-tabs">
              <button
                type="button"
                className={`role-tab ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                <span className="tab-icon">🎓</span> Student
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'mentor' ? 'active' : ''}`}
                onClick={() => setRole('mentor')}
              >
                <span className="tab-icon">💡</span> Mentor / Coach
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'school_admin' ? 'active' : ''}`}
                onClick={() => setRole('school_admin')}
              >
                <span className="tab-icon">🏫</span> School Admin
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Full Name & Student Email Dual Grid */}
            <div className="form-row dual-col">
              {/* Full Name Field */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="fullName">Full Name</label>
                  {name.trim() && (
                    <span className="status-badge matched">
                      Matched <span className="check-mark">✓</span>
                    </span>
                  )}
                </div>
                <div className="input-input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {name.trim() && <span className="input-verified-icon">✓</span>}
                </div>
              </div>

              {/* Email Field */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="studentEmail">
                    {role === 'student' ? 'Student Email' : role === 'mentor' ? 'Mentor Email' : 'Admin Email'}
                  </label>
                  <span className="status-badge muted">Subscribed Personal</span>
                </div>
                <div className="input-input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    id="studentEmail"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {email.includes('@') && email.includes('.') && (
                    <span className="input-verified-icon">✓</span>
                  )}
                </div>
              </div>
            </div>

            {/* Enrolled High School Field */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="enrolledSchool">Enrolled High School</label>
                <div className="school-pill-group">
                  <span className="district-tag">• Partner District</span>
                  <span className="district-linked-pill">DISTRICT #42 LINKED</span>
                </div>
              </div>
              <div className="input-input-wrapper">
                <span className="input-icon">🏢</span>
                <input
                  id="enrolledSchool"
                  type="text"
                  placeholder="Enter your school name"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                />
              </div>
              <p className="field-hint">
                Allows auto-credit synchronization with your school's extracurricular coordinator.
              </p>
            </div>

            {/* Password Field with Strength Bar */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="input-input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <div className="strength-meter-container">
                <div className="strength-bars">
                  <div className={`bar ${passwordStrength >= 1 ? 'filled level-1' : ''}`}></div>
                  <div className={`bar ${passwordStrength >= 2 ? 'filled level-2' : ''}`}></div>
                  <div className={`bar ${passwordStrength >= 3 ? 'filled level-3' : ''}`}></div>
                  <div className={`bar ${passwordStrength >= 4 ? 'filled level-4' : ''}`}></div>
                </div>
                <span className="strength-label">{getStrengthLabel(passwordStrength)}</span>
              </div>
            </div>

            {/* Initial Skill Tracks Selection */}
            <div className="tracks-section">
              <label className="section-label">SELECT YOUR INITIAL SKILL TRACK</label>
              <div className="tracks-grid">
                {/* Public Speaking Card */}
                <div
                  className={`track-card ${skillTracks.publicSpeaking ? 'selected' : ''}`}
                  onClick={() => handleTrackToggle('publicSpeaking')}
                >
                  <input
                    type="checkbox"
                    checked={skillTracks.publicSpeaking}
                    onChange={() => {}}
                    className="track-checkbox"
                  />
                  <div className="track-icon-wrapper speaking">🗣️</div>
                  <div className="track-info">
                    <span className="track-title">Public Speaking</span>
                    <span className="track-subtitle">Oratory & Debate</span>
                  </div>
                </div>

                {/* Strategic Chess Card */}
                <div
                  className={`track-card ${skillTracks.strategicChess ? 'selected' : ''}`}
                  onClick={() => handleTrackToggle('strategicChess')}
                >
                  <input
                    type="checkbox"
                    checked={skillTracks.strategicChess}
                    onChange={() => {}}
                    className="track-checkbox"
                  />
                  <div className="track-icon-wrapper chess">♟️</div>
                  <div className="track-info">
                    <span className="track-title">Strategic Chess</span>
                    <span className="track-subtitle">Analytical Foresight</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Code of Conduct Consent */}
            <div className="consent-row">
              <label className="consent-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedCode}
                  onChange={(e) => setAgreedCode(e.target.checked)}
                />
                <span className="consent-text">
                  I acknowledge the <a href="#conduct" onClick={(e) => e.preventDefault()} className="consent-link">Student Code of Conduct</a> and consent to district-verified transcript ledger sync.
                </span>
              </label>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Response Alert Card */}
            {successData && (
              <div className="alert alert-success">
                <div className="success-header">
                  <span className="success-icon">🎉</span>
                  <strong>{successData.message || 'Registration Successful!'}</strong>
                </div>
                <div className="success-details">
                  <p><strong>User ID:</strong> {successData.user?.id}</p>
                  <p><strong>Name:</strong> {successData.user?.name}</p>
                  <p><strong>Role:</strong> {successData.user?.role}</p>
                  <p className="token-preview"><strong>JWT Token:</strong> {successData.token ? `${successData.token.substring(0, 32)}...` : 'Generated'}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-spinner-wrapper">
                  <span className="spinner"></span> Connecting to EduSpark...
                </span>
              ) : (
                <>Complete Registration & Enter Student Portal →</>
              )}
            </button>

            {/* SSO Fast-Track Section */}
            <div className="sso-divider">
              <span>OR FAST-TRACK WITH SCHOOL SSO</span>
            </div>

            <div className="sso-buttons-grid">
              <button
                type="button"
                className="sso-btn"
                onClick={() => handleSSOClick('Google Classroom')}
              >
                <span className="sso-logo google">G</span> Google Classroom
              </button>
              <button
                type="button"
                className="sso-btn"
                onClick={() => handleSSOClick('Clever SSO')}
              >
                <span className="sso-logo clever">C</span> Clever SSO
              </button>
              <button
                type="button"
                className="sso-btn"
                onClick={() => handleSSOClick('Canvas SSO')}
              >
                <span className="sso-logo canvas">✦</span> Canvas SSO
              </button>
            </div>

            {/* Trust Footer */}
            <footer className="card-footer">
              <div className="compliance-row">
                <span className="shield-icon">🛡️</span> FERPA & COPPA Compliant • SOC2 Type II Certified
              </div>
              <div className="support-row">
                Need assistance? <a href="#support" onClick={(e) => e.preventDefault()} className="support-link">Contact Springfield Registrar</a>
              </div>
            </footer>
          </form>
        </div>
      </main>
    </div>
  );
}
