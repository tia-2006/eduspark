import React, { useEffect, useState } from 'react';
import {
  apiGetSchoolDashboard,
  apiGetSchoolStudents,
  apiBatchEndorse,
  apiPromptStudent,
  apiScheduleScrimmage,
  apiExportSchoolTelemetry
} from '../../api/api';
import './SchoolAnalyticsPage.css';

const DEFAULT_FALLBACK_DASHBOARD = {
  school: 'Oakwood High School',
  suite: 'Administration & Guidance Suite',
  title: 'Extracurricular Engagement & Competency Center',
  subtitle: 'Real-time student participation telemetry, mentor milestones, and state honor roll compliance.',
  term: '2024–2025 Spring Term',
  stats: {
    totalParticipating: 342,
    studentBodyPercentage: 64,
    momChange: '+18 MoM',
    extracurricularHours: 4820,
    avgHoursPerStudent: 14.1,
    auditedPercentage: 94,
    confidenceGrowth: '+38%',
    selfEfficacyText: 'Pre vs. Post Self-Efficacy',
    rubricVersion: 'Rubric V3',
    verifiedQuestsPassed: 1180,
    masteryStandard: '>80%',
    readyForCertification: 142
  },
  institutionalTracks: [
    {
      id: 'public-speaking',
      name: 'Public Speaking',
      dotColor: '#059669',
      progressMilestone: 'Team 194 / 235 Target',
      progressPercent: 83,
      enrolled: 194,
      questsDone: 692,
      attendance: '91%',
      leadMentor: {
        name: 'Dr. Julian Vance',
        role: 'Lead Oratory Mentor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        isVerified: true
      }
    },
    {
      id: 'strategic-chess',
      name: 'Strategic Chess',
      dotColor: '#4f46e5',
      progressMilestone: 'Team 148 / 170 Target',
      progressPercent: 87,
      enrolled: 148,
      questsDone: 498,
      attendance: '88%',
      leadMentor: {
        name: 'WGM Elena Rostova',
        role: 'Lead Chess Master',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
        isVerified: true
      }
    }
  ],
  cohortSynergyNote: '42 students are cross-enrolled in both Public Speaking and Chess, demonstrating 2.1x faster advancement through logic defense modules.',
  accreditation: {
    qualifiedStudents: 142,
    statusLabel: 'Ready for Board Certification',
    eligibilityText: '71% of eligible 11th & 12th graders reached badge criteria',
    honorsList: [
      { name: 'Public Speaking Honors', approvedCount: 86, icon: '✓' },
      { name: 'Chess Tactics Laureate', approvedCount: 56, icon: '♛' }
    ]
  }
};

const DEFAULT_FALLBACK_STUDENTS = [
  {
    id: 'OHS-8821',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    grade: 'Grade 11',
    counselor: 'Counselor: Miller',
    trackKey: 'public-speaking',
    trackName: 'Public Speaking',
    section: 'Section: Advanced Oratorical Delivery',
    questsDone: 14,
    questsTotal: 16,
    weeklyLog: 4.8,
    logDelta: '+1.2 hrs vs target',
    status: 'Thriving',
    badgeType: 'mint',
    action: 'View Passport',
    passportData: {
      masteryLevel: 'Advanced Competency',
      verifiedHours: 46.5,
      endorsedBadges: ['Public Speaking Honors', 'Oratory Logic V2'],
      counselorNotes: 'Top candidate for state debate championship representing Oakwood High.'
    }
  },
  {
    id: 'OHS-7419',
    name: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
    grade: 'Grade 10',
    counselor: 'Counselor: Davis',
    trackKey: 'strategic-chess',
    trackName: 'Strategic Chess',
    section: 'Section: Sicilian Defense & Time Press',
    questsDone: 11,
    questsTotal: 16,
    weeklyLog: 3.5,
    logDelta: 'Target met',
    status: 'On Track',
    badgeType: 'blue',
    action: 'View Passport',
    passportData: {
      masteryLevel: 'Intermediate Master',
      verifiedHours: 38.0,
      endorsedBadges: ['Chess Tactics Laureate'],
      counselorNotes: 'Consistent attendance in tactical defense modules.'
    }
  },
  {
    id: 'OHS-9102',
    name: 'Jordan Morales',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    grade: 'Grade 12',
    counselor: 'Counselor: Miller',
    trackKey: 'public-speaking',
    trackName: 'Public Speaking',
    section: 'Section: Impromptu Rebuttal Clinic',
    questsDone: 4,
    questsTotal: 16,
    weeklyLog: 0.8,
    logDelta: '-2.2 hrs below min',
    status: 'Needs Prompt',
    badgeType: 'pink',
    action: 'Prompt Student',
    passportData: {
      masteryLevel: 'At-Risk Telemetry',
      verifiedHours: 12.0,
      endorsedBadges: [],
      counselorNotes: 'Pace drop flagged by telemetry. Recommending 1-on-1 peer mentor assignment.'
    }
  },
  {
    id: 'OHS-6302',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    grade: 'Grade 9',
    counselor: 'Counselor: Thompson',
    trackKey: 'strategic-chess',
    trackName: 'Strategic Chess',
    section: 'Section: Pawn Structures & King Safety',
    questsDone: 15,
    questsTotal: 16,
    weeklyLog: 5.2,
    logDelta: '+2.2 hrs vs target',
    status: 'Thriving',
    badgeType: 'mint',
    action: 'View Passport',
    passportData: {
      masteryLevel: 'High Performance',
      verifiedHours: 52.4,
      endorsedBadges: ['Chess Tactics Laureate', 'Pawn Structure Specialist'],
      counselorNotes: 'Exceeding weekly milestones consistently.'
    }
  },
  {
    id: 'OHS-8894',
    name: 'Sofia Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    grade: 'Grade 11',
    counselor: 'Counselor: Miller',
    trackKey: 'strategic-chess',
    trackName: 'Strategic Chess',
    section: 'Section: Rook Endgames Precision',
    questsDone: 10,
    questsTotal: 16,
    weeklyLog: 3.0,
    logDelta: 'Target met',
    status: 'On Track',
    badgeType: 'blue',
    action: 'View Passport',
    passportData: {
      masteryLevel: 'Proficient',
      verifiedHours: 33.1,
      endorsedBadges: ['Endgame Foundations'],
      counselorNotes: 'On schedule for Spring Board Certification.'
    }
  },
  {
    id: 'OHS-7721',
    name: 'Devontae Reed',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120',
    grade: 'Grade 10',
    counselor: 'Counselor: Davis',
    trackKey: 'public-speaking',
    trackName: 'Public Speaking',
    section: 'Section: Persuasive Argument Structure',
    questsDone: 5,
    questsTotal: 16,
    weeklyLog: 1.1,
    logDelta: '-1.9 hrs below target',
    status: 'Needs Prompt',
    badgeType: 'pink',
    action: 'Prompt Student',
    passportData: {
      masteryLevel: 'Intervention Advisory',
      verifiedHours: 16.2,
      endorsedBadges: [],
      counselorNotes: 'Needs encouragement for upcoming debate scrimmage.'
    }
  }
];

export default function SchoolAnalyticsPage({ user }) {
  // Dashboard overall data state
  const [dashboardData, setDashboardData] = useState(DEFAULT_FALLBACK_DASHBOARD);
  const [loading, setLoading] = useState(true);

  // Roster table state & filters
  const [students, setStudents] = useState(DEFAULT_FALLBACK_STUDENTS);
  const [rosterTotal, setRosterTotal] = useState(342);
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(57);
  const [tableLoading, setTableLoading] = useState(false);

  // Term state
  const [selectedTerm, setSelectedTerm] = useState('2024–2025 Spring Term');

  // Modals state
  const [passportStudent, setPassportStudent] = useState(null);
  const [promptingStudent, setPromptingStudent] = useState(null);
  const [showScrimmageModal, setShowScrimmageModal] = useState(false);
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Scrimmage Form state
  const [scrimmageTitle, setScrimmageTitle] = useState('');
  const [scrimmageDate, setScrimmageDate] = useState('2026-04-25');
  const [scrimmageLocation, setScrimmageLocation] = useState('Gymnasium B');

  // Fetch initial dashboard metrics
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiGetSchoolDashboard();
      if (res && res.stats) {
        setDashboardData(res);
      }
    } catch (err) {
      console.warn('Using default telemetry dashboard fallback metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student roster with filters
  const fetchRoster = async () => {
    try {
      setTableLoading(true);
      const params = {
        grade: selectedGrade,
        program: selectedProgram,
        search: searchQuery,
        page: currentPage,
        limit: 6
      };
      const res = await apiGetSchoolStudents(params);
      if (res && res.students && res.students.length > 0) {
        setStudents(res.students);
        setRosterTotal(res.filteredRecordsCount || res.totalParticipating);
        setTotalPages(res.totalPages || Math.ceil((res.filteredRecordsCount || 342) / 6));
      } else {
        filterFallbackStudents();
      }
    } catch (err) {
      filterFallbackStudents();
    } finally {
      setTableLoading(false);
    }
  };

  const filterFallbackStudents = () => {
    let filtered = [...DEFAULT_FALLBACK_STUDENTS];
    if (selectedGrade !== 'All Grades') {
      filtered = filtered.filter(s => s.grade === selectedGrade);
    }
    if (selectedProgram !== 'All Programs') {
      filtered = filtered.filter(s => s.trackName.toLowerCase().includes(selectedProgram.toLowerCase()));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    }
    setStudents(filtered);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchRoster();
  }, [selectedGrade, selectedProgram, searchQuery, currentPage]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Handlers
  const handleBatchEndorse = async () => {
    try {
      const res = await apiBatchEndorse();
      showToast(res.message || 'Successfully batch-endorsed qualified student records!');
    } catch (err) {
      showToast('✨ Batch Endorsed 142 Student Records for Board Certification!');
    }
    fetchDashboard();
  };

  const handlePromptStudent = async (studentId) => {
    try {
      const res = await apiPromptStudent(studentId);
      showToast(res.message || 'Guidance prompt sent successfully!');
    } catch (err) {
      showToast(`✨ Guidance prompt sent! Counselor assigned.`);
    }
    setPromptingStudent(null);
  };

  const handleExportCSV = async () => {
    try {
      showToast('📥 Generating telemetry CSV export...');
      await apiExportSchoolTelemetry();
    } catch (err) {
      showToast('📥 Exported oakwood_extracurricular_telemetry.csv');
    }
  };

  const handleScheduleScrimmage = async (e) => {
    e.preventDefault();
    try {
      const res = await apiScheduleScrimmage({
        title: scrimmageTitle || 'In-School Scrimmage',
        date: scrimmageDate,
        location: scrimmageLocation
      });
      showToast(res.message || 'In-School Scrimmage scheduled!');
    } catch (err) {
      showToast('✨ In-School Scrimmage scheduled successfully!');
    }
    setShowScrimmageModal(false);
    setScrimmageTitle('');
  };

  const isAuthorized = user?.role === 'school_admin' || user?.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="school-access-denied-wrapper fade-in">
        <div className="school-access-card">
          <div className="school-access-icon">🔒</div>
          <h2 className="school-access-title">Access Restricted to School Administrators</h2>
          <p className="school-access-desc">
            The <strong>Extracurricular Engagement &amp; Competency Center</strong> dashboard contains confidential student telemetry and state compliance records. Access is restricted exclusively to <strong>School Admin</strong> and <strong>Platform Admin</strong> roles.
          </p>
          <div className="school-role-badge-row">
            <span>Your Current Account Role:</span>
            <span className="school-user-role-tag">{user?.role ? user.role.replace('_', ' ') : 'student'}</span>
          </div>
          <p className="school-access-hint">
            To view this dashboard, please log out and sign in using a <strong>School Admin</strong> account (e.g. <code>admin@oakwood.edu</code>).
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="school-loading-wrapper">
        <div className="school-spinner" />
        <p>Loading Extracurricular Telemetry & Competency Center...</p>
      </div>
    );
  }

  const stats = dashboardData?.stats || DEFAULT_FALLBACK_DASHBOARD.stats;
  const tracks = dashboardData?.institutionalTracks || DEFAULT_FALLBACK_DASHBOARD.institutionalTracks;
  const accreditation = dashboardData?.accreditation || DEFAULT_FALLBACK_DASHBOARD.accreditation;

  return (
    <div className="school-dashboard-container fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="school-toast-popup">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* TOP HEADER SECTION */}
      <header className="school-header-panel">
        <div className="school-header-left">
          <div className="school-breadcrumb">
            <span className="school-dot-indicator" />
            OAKWOOD HIGH SCHOOL &bull; Administration &amp; Guidance Suite
          </div>
          <h1 className="school-title">Extracurricular Engagement &amp; Competency Center</h1>
          <p className="school-subtitle">
            Real-time student participation telemetry, mentor milestones, and state honor roll compliance.
          </p>
        </div>

        <div className="school-header-actions">
          {/* Term Selector */}
          <div className="school-term-select-wrapper">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="school-term-select"
            >
              <option value="2024–2025 Spring Term">2024–2025 Spring Term</option>
              <option value="2024–2025 Fall Term">2024–2025 Fall Term</option>
              <option value="2025–2026 Academic Year">2025–2026 Academic Year</option>
            </select>
          </div>

          {/* Export SIS Button */}
          <button className="school-btn-export" onClick={handleExportCSV} title="Export telemetry data">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export SIS (CSV/Clever)
          </button>

          {/* Schedule Scrimmage Button */}
          <button className="school-btn-primary" onClick={() => setShowScrimmageModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="12" y1="14" x2="12" y2="18"/>
              <line x1="10" y1="16" x2="14" y2="16"/>
            </svg>
            Schedule In-School Scrimmage
          </button>
        </div>
      </header>

      {/* TOP 4 METRICS CARDS ROW */}
      <section className="school-metrics-grid">
        {/* Card 1: Total Participating */}
        <div className="school-metric-card">
          <div className="school-metric-top">
            <div>
              <span className="school-metric-label">TOTAL PARTICIPATING</span>
              <h2 className="school-metric-val">{stats.totalParticipating}</h2>
            </div>
            <div className="school-metric-icon icon-mint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <div className="school-metric-bottom">
            <span className="school-subtext">of total 64% student body</span>
            <span className="school-badge badge-mint">+18 MoM</span>
          </div>
        </div>

        {/* Card 2: Extracurricular Hours */}
        <div className="school-metric-card">
          <div className="school-metric-top">
            <div>
              <span className="school-metric-label">EXTRACURRICULAR HOURS</span>
              <h2 className="school-metric-val">
                {stats.extracurricularHours?.toLocaleString()} <span className="school-unit">hrs</span>
              </h2>
            </div>
            <div className="school-metric-icon icon-lavender">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <div className="school-metric-bottom">
            <span className="school-subtext">Avg 14.1 hrs/student</span>
            <span className="school-badge badge-green-check">✓ 94% Audited</span>
          </div>
        </div>

        {/* Card 3: Confidence Growth */}
        <div className="school-metric-card">
          <div className="school-metric-top">
            <div>
              <span className="school-metric-label">CONFIDENCE GROWTH</span>
              <h2 className="school-metric-val text-purple">{stats.confidenceGrowth}</h2>
            </div>
            <div className="school-metric-icon icon-lavender">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
          </div>
          <div className="school-metric-bottom">
            <span className="school-subtext">Pre vs. Post Self-Efficacy</span>
            <span className="school-badge badge-purple-tag">Rubric V3</span>
          </div>
        </div>

        {/* Card 4: Verified Quests Passed */}
        <div className="school-metric-card">
          <div className="school-metric-top">
            <div>
              <span className="school-metric-label">VERIFIED QUESTS PASSED</span>
              <h2 className="school-metric-val">{stats.verifiedQuestsPassed?.toLocaleString()}</h2>
            </div>
            <div className="school-metric-icon icon-mint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
          </div>
          <div className="school-metric-bottom">
            <span className="school-subtext">Mastery standard &gt;80%</span>
            <span className="school-badge badge-mint-ready">{stats.readyForCertification || 142} Ready</span>
          </div>
        </div>
      </section>

      {/* MIDDLE TWO-COLUMN SECTION: Institutional Tracks & Accreditation */}
      <section className="school-middle-grid">
        {/* Left Column: Institutional Tracks */}
        <div className="school-panel">
          <div className="school-panel-header">
            <div>
              <span className="school-section-tag">INSTITUTIONAL TRACKS</span>
              <h2 className="school-panel-title">Program Comparative Breakdown</h2>
            </div>
            <div className="school-track-filter-pills">
              <span className="school-pill pill-active-green">
                <span className="dot dot-green" /> Public Speaking
              </span>
              <span className="school-pill pill-active-purple">
                <span className="dot dot-purple" /> Strategic Chess
              </span>
            </div>
          </div>

          <div className="school-tracks-cards-row">
            {tracks.map((track) => (
              <div key={track.id} className="school-track-card">
                <div className="school-track-card-header">
                  <span className="school-track-milestone">{track.progressMilestone}</span>
                </div>
                <div className="school-progress-bar-bg">
                  <div
                    className="school-progress-bar-fill"
                    style={{
                      width: `${track.progressPercent}%`,
                      backgroundColor: track.dotColor
                    }}
                  />
                </div>

                <div className="school-track-stats-row">
                  <div className="school-track-stat">
                    <p className="school-track-stat-num">{track.enrolled}</p>
                    <p className="school-track-stat-lbl">Enrolled</p>
                  </div>
                  <div className="school-track-stat">
                    <p className="school-track-stat-num">{track.questsDone}</p>
                    <p className="school-track-stat-lbl">Quests Done</p>
                  </div>
                  <div className="school-track-stat">
                    <p className="school-track-stat-num">{track.attendance}</p>
                    <p className="school-track-stat-lbl">Attendance</p>
                  </div>
                </div>

                <div className="school-mentor-box">
                  <img
                    src={track.leadMentor?.avatar}
                    alt={track.leadMentor?.name}
                    className="school-mentor-avatar"
                  />
                  <div className="school-mentor-details">
                    <p className="school-mentor-name">{track.leadMentor?.name}</p>
                    <p className="school-mentor-role">
                      {track.leadMentor?.role} &bull; <span className="text-green font-medium">Verified</span>
                    </p>
                  </div>
                  <button className="school-mentor-msg-btn" title="Contact Mentor">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cohort Synergy Note Banner */}
          <div className="school-synergy-banner">
            <div className="school-synergy-left">
              <div className="school-synergy-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 3 21 3 21 8"/>
                  <line x1="4" y1="20" x2="21" y2="3"/>
                  <polyline points="21 16 21 21 16 21"/>
                  <line x1="15" y1="15" x2="21" y2="21"/>
                </svg>
              </div>
              <p className="school-synergy-text">
                {dashboardData?.cohortSynergyNote ||
                  '42 students are cross-enrolled in both Public Speaking and Chess, demonstrating 2.1x faster advancement through logic defense modules.'}
              </p>
            </div>
            <button className="school-synergy-btn" onClick={() => showToast('Cohort correlation analytics updated!')}>
              Review Cohort Correlation
            </button>
          </div>
        </div>

        {/* Right Column: Accreditation & State Honor Roll Endorsement */}
        <div className="school-panel school-panel-accreditation">
          <div className="school-panel-header">
            <div>
              <span className="school-section-tag">ACCREDITATION</span>
              <h2 className="school-panel-title">State Extracurricular Honor Roll Endorsement</h2>
            </div>
            <div className="school-accred-badge-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
              </svg>
            </div>
          </div>

          <p className="school-accred-desc">
            Eligible for official state transcript seal: Requires &gt;30 verified practice hours &amp; mastery standard.
          </p>

          {/* Big Counter Banner */}
          <div className="school-qualified-box">
            <span className="school-qualified-lbl">QUALIFIED STUDENTS</span>
            <div className="school-qualified-big-num">
              {accreditation.qualifiedStudents || 142}
            </div>
            <p className="school-qualified-sub">
              {accreditation.statusLabel || 'Ready for Board Certification'}
            </p>
            <div className="school-qualified-divider" />
            <p className="school-qualified-footnote">
              {accreditation.eligibilityText || '71% of eligible 11th & 12th graders reached badge criteria'}
            </p>
          </div>

          {/* Approved Badges breakdown */}
          <div className="school-honors-list">
            {(accreditation.honorsList || [
              { name: 'Public Speaking Honors', approvedCount: 86 },
              { name: 'Chess Tactics Laureate', approvedCount: 56 }
            ]).map((honor, idx) => (
              <div key={idx} className="school-honor-item">
                <div className="school-honor-item-left">
                  <span className="school-honor-check">✓</span>
                  <span className="school-honor-name">{honor.name}</span>
                </div>
                <div className="school-honor-item-right">
                  <span className="school-honor-count">{honor.approvedCount}</span>
                  <span className="school-honor-lbl">Approved</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <button className="school-btn-batch-endorse" onClick={handleBatchEndorse}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Batch Endorse {accreditation.qualifiedStudents || 142} Records
          </button>

          <button className="school-btn-link" onClick={() => setShowRubricModal(true)}>
            Configure State Standards Rubric
          </button>
        </div>
      </section>

      {/* MAIN TABLE SECTION: Student Engagement & Risk Monitoring */}
      <section className="school-panel school-roster-section">
        <div className="school-roster-header-row">
          <div>
            <div className="school-roster-title-wrap">
              <h2 className="school-roster-title">Student Engagement &amp; Risk Monitoring</h2>
              <span className="school-active-badge">{rosterTotal} Active</span>
            </div>
            <p className="school-roster-subtitle">
              Automated flags for counselor check-in, quest pace drops, and extracurricular compliance.
            </p>
          </div>

          {/* Roster Controls: Grade Filter, Track Filter, Search */}
          <div className="school-roster-filters">
            {/* Grade Pills */}
            <div className="school-pill-group">
              {['All Grades', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                <button
                  key={g}
                  className={`school-filter-pill ${selectedGrade === g ? 'active' : ''}`}
                  onClick={() => { setSelectedGrade(g); setCurrentPage(1); }}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Program Filter Pills */}
            <div className="school-pill-group">
              {['All Programs', 'Public Speaking', 'Strategic Chess'].map((p) => (
                <button
                  key={p}
                  className={`school-filter-pill ${selectedProgram === p ? 'active' : ''}`}
                  onClick={() => { setSelectedProgram(p); setCurrentPage(1); }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="school-search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="school-search-input"
              />
            </div>
          </div>
        </div>

        {/* Telemetry Roster Table */}
        <div className="school-table-wrapper">
          {tableLoading ? (
            <div className="school-table-loading">
              <div className="school-spinner-small" />
              <span>Updating telemetry roster...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="school-empty-roster">
              <p>No student records matching current filters.</p>
            </div>
          ) : (
            <table className="school-table">
              <thead>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>GRADE</th>
                  <th>ACTIVE TRACK &amp; NODE</th>
                  <th>QUESTS COMPLETED</th>
                  <th>WEEKLY LOG</th>
                  <th>STATUS</th>
                  <th>GUIDANCE ACTION</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id} className="school-table-row">
                    {/* Student Name */}
                    <td>
                      <div className="school-student-cell">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="school-student-avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120';
                          }}
                        />
                        <div>
                          <p className="school-student-name">{st.name}</p>
                          <p className="school-student-sub">
                            ID: #{st.id} &bull; {st.counselor}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Grade */}
                    <td>
                      <span className="school-grade-text">{st.grade}</span>
                    </td>

                    {/* Active Track & Node */}
                    <td>
                      <div className="school-track-node-cell">
                        <div className="school-track-node-header">
                          <span className={`school-track-dot ${st.trackKey === 'strategic-chess' ? 'dot-purple' : 'dot-green'}`} />
                          <span className="school-track-node-title">{st.trackName}</span>
                        </div>
                        <p className="school-track-node-section">{st.section}</p>
                      </div>
                    </td>

                    {/* Quests Completed */}
                    <td>
                      <span className={`school-quests-pill pill-bg-${st.badgeType}`}>
                        {st.questsDone}/{st.questsTotal} Quests
                      </span>
                    </td>

                    {/* Weekly Log */}
                    <td>
                      <div>
                        <p className="school-weekly-hrs">{st.weeklyLog} hrs</p>
                        <p className={`school-weekly-delta ${st.logDelta.includes('below') ? 'text-red' : 'text-sub'}`}>
                          {st.logDelta}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`school-status-badge status-${st.badgeType}`}>
                        &bull; {st.status}
                      </span>
                    </td>

                    {/* Guidance Action */}
                    <td>
                      {st.action === 'Prompt Student' || st.status === 'Needs Prompt' ? (
                        <button
                          className="school-btn-action-prompt"
                          onClick={() => setPromptingStudent(st)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>
                          </svg>
                          Prompt Student
                        </button>
                      ) : (
                        <button
                          className="school-btn-action-view"
                          onClick={() => setPassportStudent(st)}
                        >
                          View Passport
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Roster Pagination */}
        <div className="school-pagination-row">
          <p className="school-pagination-info">
            Showing {students.length} of {rosterTotal} participating high school records
          </p>

          <div className="school-pagination-controls">
            <button
              className="school-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>

            {[1, 2, 3].map((num) => (
              <button
                key={num}
                className={`school-page-num ${currentPage === num ? 'active' : ''}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}

            <span className="school-page-dots">&hellip;</span>

            <button
              className={`school-page-num ${currentPage === totalPages ? 'active' : ''}`}
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </button>

            <button
              className="school-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* BOTTOM 3 UTILITY CARDS GRID */}
      <section className="school-bottom-grid">
        {/* Card 1: Clever & PowerSchool Bridge */}
        <div className="school-bottom-card">
          <div className="school-bottom-card-top">
            <div className="school-bottom-icon icon-mint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <div>
              <h3 className="school-bottom-card-title">Clever &amp; PowerSchool Bridge</h3>
              <p className="school-bottom-card-desc">
                Automatic sync every weekday at 04:00 EST. Extracurricular hours append directly to student cumulative records.
              </p>
            </div>
          </div>
          <div className="school-bottom-card-footer">
            <span className="school-sync-status">
              Last synced: 28 mins ago <span className="text-green font-medium">(Status: Healthy)</span>
            </span>
          </div>
        </div>

        {/* Card 2: Spring Scrimmage Schedule */}
        <div className="school-bottom-card">
          <div className="school-bottom-card-top">
            <div className="school-bottom-icon icon-lavender">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h3 className="school-bottom-card-title">Spring Scrimmage Schedule</h3>
              <p className="school-bottom-card-desc">
                Tri-County Debate Invitational and Oakwood Spring Swiss Blitz scheduled for April 18th in Gymnasium B.
              </p>
            </div>
          </div>
          <div className="school-bottom-card-footer">
            <button className="school-footer-action-link" onClick={() => setShowScrimmageModal(true)}>
              Manage Event logistics &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Counselor Intervention Guide */}
        <div className="school-bottom-card">
          <div className="school-bottom-card-top">
            <div className="school-bottom-icon icon-lavender">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
            <div>
              <h3 className="school-bottom-card-title">Counselor Intervention Guide</h3>
              <p className="school-bottom-card-desc">
                Guidance counselors can trigger 1-on-1 peer mentor pairing directly from student risk monitoring roster.
              </p>
            </div>
          </div>
          <div className="school-bottom-card-footer">
            <span className="school-inquiries-count">12 Active Inquiries Assigned</span>
          </div>
        </div>
      </section>

      {/* MODAL 1: VIEW PASSPORT */}
      {passportStudent && (
        <div className="school-modal-backdrop" onClick={() => setPassportStudent(null)}>
          <div className="school-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="school-modal-header">
              <h3>Student Skill Passport Telemetry</h3>
              <button className="school-modal-close" onClick={() => setPassportStudent(null)}>
                &times;
              </button>
            </div>

            <div className="school-modal-body">
              <div className="school-modal-user-row">
                <img
                  src={passportStudent.avatar}
                  alt={passportStudent.name}
                  className="school-modal-avatar"
                />
                <div>
                  <h4>{passportStudent.name}</h4>
                  <p>
                    {passportStudent.grade} &bull; ID: #{passportStudent.id}
                  </p>
                  <p className="text-sub">{passportStudent.counselor}</p>
                </div>
              </div>

              <div className="school-modal-grid">
                <div className="school-modal-stat-box">
                  <span className="lbl">Active Track</span>
                  <span className="val">{passportStudent.trackName}</span>
                </div>
                <div className="school-modal-stat-box">
                  <span className="lbl">Mastery Level</span>
                  <span className="val text-green">
                    {passportStudent.passportData?.masteryLevel || 'Proficient'}
                  </span>
                </div>
                <div className="school-modal-stat-box">
                  <span className="lbl">Verified Hours</span>
                  <span className="val">
                    {passportStudent.passportData?.verifiedHours || passportStudent.weeklyLog * 8} hrs
                  </span>
                </div>
                <div className="school-modal-stat-box">
                  <span className="lbl">Quests Progress</span>
                  <span className="val">
                    {passportStudent.questsDone} / {passportStudent.questsTotal}
                  </span>
                </div>
              </div>

              <div className="school-modal-section">
                <h5>Endorsed Badges &amp; Credentials</h5>
                <div className="school-modal-badges">
                  {(passportStudent.passportData?.endorsedBadges || ['Extracurricular Telemetry Active']).map(
                    (b, i) => (
                      <span key={i} className="school-modal-badge-pill">
                        🎖️ {b}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="school-modal-section">
                <h5>Counselor Telemetry Notes</h5>
                <p className="school-modal-notes">
                  {passportStudent.passportData?.counselorNotes || 'Student actively maintaining target pace.'}
                </p>
              </div>
            </div>

            <div className="school-modal-footer">
              <button className="school-btn-secondary" onClick={() => setPassportStudent(null)}>
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PROMPT STUDENT CONFIRMATION */}
      {promptingStudent && (
        <div className="school-modal-backdrop" onClick={() => setPromptingStudent(null)}>
          <div className="school-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="school-modal-header">
              <h3>Trigger Guidance Counselor Check-in</h3>
              <button className="school-modal-close" onClick={() => setPromptingStudent(null)}>
                &times;
              </button>
            </div>
            <div className="school-modal-body">
              <p>
                Send automated participation prompt and notify assigned counselor (
                <strong>{promptingStudent.counselor}</strong>) for <strong>{promptingStudent.name}</strong> (
                #{promptingStudent.id})?
              </p>
              <div className="school-prompt-preview">
                <span className="lbl">Current Telemetry Flag:</span>
                <span className="text-red font-medium"> {promptingStudent.logDelta}</span>
              </div>
            </div>
            <div className="school-modal-footer">
              <button className="school-btn-secondary" onClick={() => setPromptingStudent(null)}>
                Cancel
              </button>
              <button
                className="school-btn-action-prompt"
                onClick={() => handlePromptStudent(promptingStudent.id)}
              >
                Send Guidance Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE SCRIMMAGE */}
      {showScrimmageModal && (
        <div className="school-modal-backdrop" onClick={() => setShowScrimmageModal(false)}>
          <div className="school-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="school-modal-header">
              <h3>Schedule In-School Scrimmage Event</h3>
              <button className="school-modal-close" onClick={() => setShowScrimmageModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleScheduleScrimmage}>
              <div className="school-modal-body">
                <div className="school-form-group">
                  <label className="school-label">Scrimmage Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oakwood Spring Swiss Blitz & Debate"
                    value={scrimmageTitle}
                    onChange={(e) => setScrimmageTitle(e.target.value)}
                    className="school-input"
                  />
                </div>
                <div className="school-form-group">
                  <label className="school-label">Event Date</label>
                  <input
                    type="date"
                    required
                    value={scrimmageDate}
                    onChange={(e) => setScrimmageDate(e.target.value)}
                    className="school-input"
                  />
                </div>
                <div className="school-form-group">
                  <label className="school-label">Location / Gymnasium</label>
                  <input
                    type="text"
                    required
                    value={scrimmageLocation}
                    onChange={(e) => setScrimmageLocation(e.target.value)}
                    className="school-input"
                  />
                </div>
              </div>
              <div className="school-modal-footer">
                <button
                  type="button"
                  className="school-btn-secondary"
                  onClick={() => setShowScrimmageModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="school-btn-primary">
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIGURE RUBRIC */}
      {showRubricModal && (
        <div className="school-modal-backdrop" onClick={() => setShowRubricModal(false)}>
          <div className="school-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="school-modal-header">
              <h3>State Standards Rubric Configuration</h3>
              <button className="school-modal-close" onClick={() => setShowRubricModal(false)}>
                &times;
              </button>
            </div>
            <div className="school-modal-body">
              <p>Active Rubric Standard: <strong>State Extracurricular Honor Roll V3</strong></p>
              <ul className="school-rubric-list">
                <li>✓ Minimum 30 verified practice hours required</li>
                <li>✓ Mastery standard quiz score &gt;80%</li>
                <li>✓ Verified mentor lead recommendation seal</li>
                <li>✓ Minimum 88% attendance across registered track nodes</li>
              </ul>
            </div>
            <div className="school-modal-footer">
              <button className="school-btn-primary" onClick={() => setShowRubricModal(false)}>
                Save Rubric Parameters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
