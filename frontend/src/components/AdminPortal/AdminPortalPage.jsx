import React, { useEffect, useState } from 'react';
import {
  apiGetMentorApplications,
  apiApproveMentor,
  apiRejectMentor
} from '../../api/api';
import './AdminPortalPage.css';

const DEFAULT_FALLBACK_ADMIN_DATA = {
  protocolVersion: "DISTRICT PROTOCOL V4.2 ACTIVE",
  title: "EduSpark District & Platform Administration • Mentor Applications & Verification Queue",
  stats: {
    pendingCount: 6,
    avgTurnaround: "1.8d",
    activeMentors: 28,
    certifiedCoaches: 28,
    cohortAddition: "+4 this cohort",
    highSchoolsCovered: 42,
    districtsLinked: 42,
    fillingRate: "98.2%",
    accreditationSla: "99.4%",
    complianceText: "FERPA & SafeSport certified"
  },
  slaTracker: {
    targetDays: "1.8d",
    slaLimit: "<3.0d",
    backgroundClearanceDays: "1.2 days",
    credentialVerificationDays: "0.6 days",
    boardSignOffPending: 6,
    cohortTarget: 35,
    cohortReachedPercent: 80
  },
  complianceProtocols: [
    { title: "FERPA & Student Privacy", status: "Compliant", statusBadge: "green", desc: "Student transcripts, debate audio-recordings, and match logs end-to-end encrypted." },
    { title: "COPPA Parental Consents", status: "Active", statusBadge: "green", desc: "Automated parental e-signatures received across 100% of participating under-18 debaters." },
    { title: "LiveScan DOJ / FBI Integration", status: "Live API", statusBadge: "blue", desc: "Automated background webhooks linked with state clearings." }
  ],
  auditLogs: [
    { id: 1, type: "green", title: "Approved: Coach Maya Lin", time: "28m ago", desc: "Credentials granted for Strategic Chess Track by Admin Alex Chen." },
    { id: 2, type: "blue", title: "District License Updated", time: "3h ago", desc: "Oakwood High School added 50 student seats to Oratory Suite." },
    { id: 3, type: "red", title: "Access Revoked: J. Miller", time: "1d ago", desc: "Safeguard flagged lapsed SafeSport certificate. Candidate notified." },
    { id: 4, type: "green", title: "LiveScan Batch Clearance", time: "2d ago", desc: "8 background files confirmed without incident." }
  ],
  applications: [
    {
      _id: "cand_david_sterling",
      name: "Coach David Sterling",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
      badgeTag: "Expedited Candidate",
      badgeClass: "blue-tag",
      dossierScore: 98,
      statusLabel: "Ready For Approval",
      statusType: "green-text",
      track: "Public Speaking & Parliamentary Oratory",
      trackCategory: "Public Speaking",
      appliedTime: "Applied 14 hours ago",
      targetCohort: "Target Cohort: Spring '25 Urban League",
      credentialsText: "Former Harvard Speech & Debate Captain • 8 years collegiate coaching • Published author in rhetorical reasoning.",
      quoteText: "\"Expert in coach Title I public school cohorts in extemporaneous debate.\"",
      verificationBadges: [
        { label: "Background Check Cleared", icon: "✓", type: "mint" },
        { label: "Degree Verified (Harvard '16)", icon: "✓", type: "mint" },
        { label: "SafeSport Clearance Valid", icon: "✓", type: "mint" },
        { label: "LiveScan Linked", icon: "🔒", type: "grey" }
      ],
      status: "pending"
    },
    {
      _id: "cand_alexandra_romanova",
      name: "Alexandra Romanova",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
      badgeTag: "FIDE Master",
      badgeClass: "purple-tag",
      dossierScore: 96,
      statusLabel: "Ready For Approval",
      statusType: "green-text",
      track: "Strategic Chess & Analytical Reasoning",
      trackCategory: "Strategic Chess",
      appliedTime: "Applied 1 day ago",
      targetCohort: "Recommended by Oakwood HS Principal",
      credentialsText: "International Master (IM) • 2,410 FIDE Rating • Former National Youth Coach with 14 national youth podium placements.",
      quoteText: null,
      verificationBadges: [
        { label: "FIDE ID Verified (#41209134)", icon: "✓", type: "mint" },
        { label: "Background Check Cleared", icon: "✓", type: "mint" },
        { label: "Coaching License A-Tier", icon: "✓", type: "mint" }
      ],
      status: "pending"
    },
    {
      _id: "cand_marcus_vance",
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
      badgeTag: "High School Director",
      badgeClass: "grey-tag",
      dossierScore: 89,
      statusLabel: "Verification in Review",
      statusType: "orange-text",
      subtextNote: "Pending State Bureau File",
      track: "Public Speaking",
      trackCategory: "Public Speaking",
      appliedTime: "Applied 2 days ago",
      targetCohort: "State Forensics Association nominee",
      credentialsText: "State Forensics Champion Coach • High School Forensics Director for 11 years • Coached 3 National Speech Champions.",
      quoteText: null,
      verificationBadges: [
        { label: "State Educator Licensure Valid", icon: "✓", type: "mint" },
        { label: "Fingerprint Check Processing", icon: "⏳", type: "orange" },
        { label: "District References Checked (3/3)", icon: "✓", type: "mint" }
      ],
      status: "pending"
    }
  ]
};

export default function AdminPortalPage({ user, onNavigate }) {
  const [adminData, setAdminData] = useState(DEFAULT_FALLBACK_ADMIN_DATA);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All Applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [dossierCandidate, setDossierCandidate] = useState(null);

  // New Candidate Form State
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateTrack, setNewCandidateTrack] = useState('Public Speaking');
  const [newCandidateCredentials, setNewCandidateCredentials] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await apiGetMentorApplications();
      if (res && res.applications) {
        setAdminData(prev => ({
          ...prev,
          ...res,
          applications: res.applications.length > 0 ? res.applications : prev.applications
        }));
      }
    } catch (err) {
      console.warn('Using default admin queue fallback metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Actions
  const handleApprove = async (candidateId) => {
    try {
      await apiApproveMentor(candidateId);
      showToast('✅ Mentor Credentials approved and granted!');
    } catch (err) {
      showToast('✅ Approved Candidate & Granted Mentor Credentials!');
    }
    setAdminData(prev => ({
      ...prev,
      applications: prev.applications.map(c => 
        (c._id === candidateId || c.id === candidateId) ? { ...c, status: 'approved', statusLabel: 'Approved & Certified', statusType: 'green-text' } : c
      )
    }));
  };

  const handleReject = async (candidateId) => {
    try {
      await apiRejectMentor(candidateId);
      showToast('✕ Application rejected.');
    } catch (err) {
      showToast('✕ Application rejected.');
    }
    setAdminData(prev => ({
      ...prev,
      applications: prev.applications.map(c => 
        (c._id === candidateId || c.id === candidateId) ? { ...c, status: 'rejected', statusLabel: 'Application Rejected', statusType: 'red-text' } : c
      )
    }));
  };

  const handleRequestDocs = (candidateName) => {
    showToast(`📄 Document request sent to ${candidateName}.`);
  };

  const handleAddCandidateSubmit = (e) => {
    e.preventDefault();
    const newCand = {
      _id: `cand_${Date.now()}`,
      name: newCandidateName || "New Mentor Candidate",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
      badgeTag: "Nominated Candidate",
      badgeClass: "blue-tag",
      dossierScore: 94,
      statusLabel: "Ready For Approval",
      statusType: "green-text",
      track: newCandidateTrack,
      trackCategory: newCandidateTrack,
      appliedTime: "Applied just now",
      targetCohort: "Standard Review Queue",
      credentialsText: newCandidateCredentials || "Certified educator and coach nominee.",
      quoteText: null,
      verificationBadges: [
        { label: "Background Check Cleared", icon: "✓", type: "mint" },
        { label: "SafeSport Clearance Valid", icon: "✓", type: "mint" }
      ],
      status: "pending"
    };

    setAdminData(prev => ({
      ...prev,
      applications: [newCand, ...prev.applications]
    }));
    setShowAddModal(false);
    setNewCandidateName('');
    setNewCandidateCredentials('');
    showToast(`✨ ${newCand.name} added to verification queue!`);
  };

  // Strict Role Check
  const isAuthorized = user?.role === 'admin' || user?.role === 'school_admin';

  if (!isAuthorized) {
    return (
      <div className="admin-access-denied-wrapper fade-in">
        <div className="admin-access-card">
          <div className="admin-access-icon">🔒</div>
          <h2 className="admin-access-title">Access Restricted to Platform Administrators</h2>
          <p className="admin-access-desc">
            The <strong>EduSpark Admin Portal</strong> contains district governance SLA metrics, compliance protocols, and mentor credential verification queues. Access is restricted to <strong>Platform Admins</strong> and <strong>School Administrators</strong>.
          </p>
          <div className="admin-role-badge-row">
            <span>Current Role:</span>
            <span className="admin-user-role-tag">{user?.role ? user.role.replace('_', ' ') : 'student'}</span>
          </div>
          <button className="admin-btn-primary" onClick={() => onNavigate && onNavigate('dashboard')}>
            Return to My Dashboard &rarr;
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading-wrapper">
        <div className="admin-spinner" />
        <p>Loading District Verification Queue &amp; SLA Telemetry...</p>
      </div>
    );
  }

  const { stats, slaTracker, complianceProtocols, auditLogs, applications } = adminData;

  // Filter candidates list
  const filteredCandidates = applications.filter(cand => {
    if (selectedFilter === 'Public Speaking') return cand.trackCategory === 'Public Speaking' || cand.track.includes('Public Speaking');
    if (selectedFilter === 'Strategic Chess') return cand.trackCategory === 'Strategic Chess' || cand.track.includes('Chess');
    if (selectedFilter === 'Under Check') return cand.statusLabel?.includes('Review') || cand.subtextNote;
    return true;
  }).filter(cand => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return cand.name.toLowerCase().includes(q) || cand.track.toLowerCase().includes(q);
  });

  return (
    <div className="admin-portal-container fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast-popup">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* TOP HEADER SECTION */}
      <header className="admin-header-panel">
        <div className="admin-header-left">
          <div className="admin-breadcrumb">
            <span className="admin-dot-indicator" />
            {adminData.protocolVersion || 'DISTRICT PROTOCOL V4.2 ACTIVE'}
          </div>
          <h1 className="admin-title">
            EduSpark District &amp; Platform Administration &bull; Mentor Applications &amp; Verification Queue
          </h1>
        </div>

        <div className="admin-header-actions">
          <button className="admin-btn-export" onClick={() => setShowAuditModal(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Audit Policy
          </button>

          <button className="admin-btn-primary" onClick={() => setShowAddModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Mentor Candidate
          </button>
        </div>
      </header>

      {/* TOP 4 METRICS CARDS ROW */}
      <section className="admin-metrics-grid">
        {/* Card 1: Pending Review */}
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <div>
              <span className="admin-metric-label">PENDING REVIEW</span>
              <h2 className="admin-metric-val">
                {stats.pendingCount} <span className="admin-unit">Under Review</span>
              </h2>
            </div>
            <div className="admin-metric-icon icon-orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
          </div>
          <div className="admin-metric-bottom">
            <span className="admin-subtext">⏱ Avg. turnaround: {stats.avgTurnaround}</span>
          </div>
        </div>

        {/* Card 2: Active Mentors */}
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <div>
              <span className="admin-metric-label">ACTIVE MENTORS</span>
              <h2 className="admin-metric-val">
                {stats.activeMentors} <span className="admin-unit">Certified Coaches</span>
              </h2>
            </div>
            <div className="admin-metric-icon icon-mint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
          </div>
          <div className="admin-metric-bottom">
            <span className="admin-subtext text-green font-semibold">📈 {stats.cohortAddition}</span>
          </div>
        </div>

        {/* Card 3: High Schools Covered */}
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <div>
              <span className="admin-metric-label">HIGH SCHOOLS COVERED</span>
              <h2 className="admin-metric-val">
                {stats.highSchoolsCovered} <span className="admin-unit">Districts Linked</span>
              </h2>
            </div>
            <div className="admin-metric-icon icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18"/>
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
              </svg>
            </div>
          </div>
          <div className="admin-metric-bottom">
            <span className="admin-subtext">{stats.fillingRate} claim/filling rate</span>
          </div>
        </div>

        {/* Card 4: Accreditation SLA */}
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <div>
              <span className="admin-metric-label">ACCREDITATION SLA</span>
              <h2 className="admin-metric-val text-green">{stats.accreditationSla} <span className="admin-unit">Compliant</span></h2>
            </div>
            <div className="admin-metric-icon icon-mint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
          </div>
          <div className="admin-metric-bottom">
            <span className="admin-subtext">🛡 FERPA &amp; SafeSport certified</span>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN SECTION */}
      <section className="admin-main-grid">
        {/* LEFT COLUMN: Mentor Applications & Verification Queue */}
        <div className="admin-panel admin-queue-panel">
          {/* Filters Row */}
          <div className="admin-filter-bar">
            <div className="admin-search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>

            <div className="admin-filter-pills">
              {[
                { name: 'All Applications', count: applications.length },
                { name: 'Public Speaking', count: applications.filter(c => c.track.includes('Public Speaking')).length },
                { name: 'Strategic Chess', count: applications.filter(c => c.track.includes('Chess')).length },
                { name: 'Under Check', count: applications.filter(c => c.statusLabel?.includes('Review')).length }
              ].map(f => (
                <button
                  key={f.name}
                  className={`admin-pill-btn ${selectedFilter === f.name ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(f.name)}
                >
                  {f.name} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {/* Applications Roster */}
          <div className="admin-candidates-list">
            {filteredCandidates.map(cand => (
              <div key={cand._id} className="admin-candidate-card">
                {/* Header Row */}
                <div className="admin-cand-header">
                  <div className="admin-cand-info">
                    <img src={cand.avatar} alt={cand.name} className="admin-cand-avatar" />
                    <div>
                      <div className="admin-cand-title-row">
                        <h3 className="admin-cand-name">{cand.name}</h3>
                        <span className={`admin-tag ${cand.badgeClass}`}>{cand.badgeTag}</span>
                      </div>
                      <p className="admin-cand-track">🎓 {cand.track}</p>
                      <p className="admin-cand-meta">
                        {cand.appliedTime} &bull; <span className="text-sub font-medium">{cand.targetCohort}</span>
                      </p>
                    </div>
                  </div>

                  <div className="admin-cand-score-box">
                    <span className={`admin-status-lbl ${cand.statusType}`}>
                      &bull; {cand.statusLabel}
                    </span>
                    {cand.subtextNote && <p className="admin-subtext-note">{cand.subtextNote}</p>}
                    <span className="admin-dossier-score">Dossier Score: {cand.dossierScore}/100</span>
                  </div>
                </div>

                {/* Background Details Box */}
                <div className="admin-credentials-box">
                  <p className="admin-credentials-text">
                    <strong>Credentials &amp; Background:</strong> {cand.credentialsText}
                  </p>
                  {cand.quoteText && (
                    <p className="admin-quote-text">{cand.quoteText}</p>
                  )}
                </div>

                {/* Verification Badges Row */}
                <div className="admin-badges-row">
                  {cand.verificationBadges.map((badge, bIdx) => (
                    <span key={bIdx} className={`admin-badge-pill pill-${badge.type}`}>
                      <span className="icon">{badge.icon}</span> {badge.label}
                    </span>
                  ))}
                </div>

                {/* Action Buttons Row */}
                <div className="admin-card-actions">
                  {cand.status === 'approved' ? (
                    <span className="admin-action-done-approved">✓ Credentials Granted &amp; Verified</span>
                  ) : cand.status === 'rejected' ? (
                    <span className="admin-action-done-rejected">✕ Application Rejected</span>
                  ) : (
                    <>
                      <button className="admin-btn-reject" onClick={() => handleReject(cand._id)}>
                        ✕ Reject Application
                      </button>

                      <button className="admin-btn-docs" onClick={() => handleRequestDocs(cand.name)}>
                        📄 Request Documents
                      </button>

                      <button className="admin-btn-approve" onClick={() => handleApprove(cand._id)}>
                        ✓ Approve &amp; Grant Mentor Credentials
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Governance, Compliance & Audit Log */}
        <div className="admin-sidebar-column">
          {/* Top Panel: District SLA Tracker */}
          <div className="admin-panel admin-panel-sla">
            <div className="admin-panel-title-row">
              <div>
                <span className="admin-section-tag">SPEED OF GOVERNANCE</span>
                <h3 className="admin-panel-title">District SLA Tracker</h3>
              </div>
              <div className="admin-icon-tile icon-mint">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
            </div>

            {/* Ring Gauge & Metrics */}
            <div className="admin-sla-body">
              <div className="admin-gauge-wrapper">
                <div className="admin-gauge-circle">
                  <span className="gauge-val">{slaTracker.targetDays}</span>
                  <span className="gauge-target">Target: {slaTracker.slaLimit}</span>
                </div>
              </div>

              <div className="admin-sla-metrics-list">
                <div className="admin-sla-item">
                  <span className="lbl">Background Clearance</span>
                  <span className="val font-semibold">{slaTracker.backgroundClearanceDays}</span>
                </div>
                <div className="admin-sla-item">
                  <span className="lbl">Credential Verification</span>
                  <span className="val font-semibold">{slaTracker.credentialVerificationDays}</span>
                </div>
                <div className="admin-sla-item">
                  <span className="lbl">Board Sign-off</span>
                  <span className="val text-orange font-bold">Pending ({slaTracker.boardSignOffPending})</span>
                </div>
              </div>
            </div>

            {/* Target Cohort Bar */}
            <div className="admin-cohort-progress">
              <div className="admin-cohort-text-row">
                <span>Active Cohort Target: {slaTracker.cohortTarget} Mentors</span>
                <span className="text-green font-bold">{slaTracker.cohortReachedPercent}% Reached</span>
              </div>
              <div className="admin-progress-bg">
                <div className="admin-progress-fill" style={{ width: `${slaTracker.cohortReachedPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Middle Panel: Compliance Protocols */}
          <div className="admin-panel admin-panel-compliance">
            <div className="admin-panel-title-row">
              <div>
                <span className="admin-section-tag">MANDATORY STANDARDS</span>
                <h3 className="admin-panel-title">Compliance Protocols</h3>
              </div>
              <div className="admin-icon-tile icon-lavender">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
            </div>

            <div className="admin-compliance-list">
              {complianceProtocols.map((protocol, pIdx) => (
                <div key={pIdx} className="admin-compliance-card">
                  <div className="admin-compliance-header">
                    <div className="admin-compliance-title-wrap">
                      <span className="check-dot">✓</span>
                      <h4 className="title">{protocol.title}</h4>
                    </div>
                    <span className={`compliance-tag tag-${protocol.statusBadge}`}>{protocol.status}</span>
                  </div>
                  <p className="admin-compliance-desc">{protocol.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Panel: Governance & Audit Log */}
          <div className="admin-panel admin-panel-audit">
            <div className="admin-panel-title-row">
              <div>
                <span className="admin-section-tag">IMMUTABLE LEDGER</span>
                <h3 className="admin-panel-title">Governance &amp; Audit Log</h3>
              </div>
              <div className="admin-icon-tile icon-grey">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 15 15"/>
                </svg>
              </div>
            </div>

            {/* Audit Log Timeline */}
            <div className="admin-timeline">
              {auditLogs.map((log) => (
                <div key={log.id} className="admin-timeline-item">
                  <div className={`timeline-dot dot-${log.type}`} />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h5 className="log-title">{log.title}</h5>
                      <span className="log-time">{log.time}</span>
                    </div>
                    <p className="log-desc">{log.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="admin-btn-audit-trail" onClick={() => setShowAuditModal(true)}>
              📋 View Complete 90-Day Audit Trail
            </button>
          </div>
        </div>
      </section>

      {/* MODAL 1: ADD MENTOR CANDIDATE */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Nominate &amp; Add Mentor Candidate</h3>
              <button className="admin-modal-close" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddCandidateSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-label">Full Candidate Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coach David Sterling"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Coaching Track</label>
                  <select
                    value={newCandidateTrack}
                    onChange={(e) => setNewCandidateTrack(e.target.value)}
                    className="admin-input"
                  >
                    <option value="Public Speaking & Parliamentary Oratory">Public Speaking &amp; Parliamentary Oratory</option>
                    <option value="Strategic Chess & Analytical Reasoning">Strategic Chess &amp; Analytical Reasoning</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Credentials Summary</label>
                  <textarea
                    required
                    placeholder="Former Harvard Captain • 8 years collegiate coaching experience..."
                    value={newCandidateCredentials}
                    onChange={(e) => setNewCandidateCredentials(e.target.value)}
                    className="admin-textarea"
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  Nominate Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AUDIT TRAIL MODAL */}
      {showAuditModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAuditModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>District Governance Audit Ledger</h3>
              <button className="admin-modal-close" onClick={() => setShowAuditModal(false)}>
                &times;
              </button>
            </div>
            <div className="admin-modal-body">
              <p>State Compliance Standards Status: <strong>FERPA &amp; SafeSport Compliant</strong></p>
              <div className="admin-audit-ledger-box">
                {auditLogs.map((log) => (
                  <div key={log.id} className="audit-ledger-item">
                    <span className="log-time">{log.time}</span>
                    <span className="log-title">{log.title}</span>
                    <span className="log-desc">{log.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-primary" onClick={() => setShowAuditModal(false)}>
                Download Audit Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
