// ================================================
// EDUSPARK API LAYER
// All backend communication goes through here
// ================================================

const BASE_URL = '/api';

// Helper: get token from localStorage
const getToken = () => localStorage.getItem('eduspark_token');

// Helper: auth fetch with JWT header
const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }
  return data;
};

// ── AUTH ────────────────────────────────────────
export const apiLogin = (email, password) =>
  authFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiRegister = (payload) =>
  authFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ── CLASSES ─────────────────────────────────────
export const apiGetClasses = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return authFetch(`/classes${qs ? `?${qs}` : ''}`);
};

export const apiGetClassById = (id) => authFetch(`/classes/${id}`);

// ── QUIZZES ─────────────────────────────────────
export const apiGetQuiz = (id) => authFetch(`/quizzes/${id}`);

export const apiSubmitQuiz = (id, answers) =>
  authFetch(`/quizzes/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });

// ── QUESTS ──────────────────────────────────────
export const apiGetQuests = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return authFetch(`/quests${qs ? `?${qs}` : ''}`);
};

export const apiGetQuestById = (id) => authFetch(`/quests/${id}`);

// ── SUBMISSIONS ─────────────────────────────────
export const apiCreateSubmission = (questId, content) =>
  authFetch('/submissions', {
    method: 'POST',
    body: JSON.stringify({ questId, content }),
  });

export const apiGetMentorSubmissions = (status) => {
  const qs = status ? `?status=${status}` : '';
  return authFetch(`/submissions/mentor${qs}`);
};

export const apiGetSubmissionById = (id) => authFetch(`/submissions/${id}`);

export const apiUpdateFeedback = (id, score, mentorFeedback) =>
  authFetch(`/submissions/${id}/feedback`, {
    method: 'PUT',
    body: JSON.stringify({ score, mentorFeedback }),
  });

// ── MENTORS ─────────────────────────────────────
export const apiApplyForMentor = (payload) =>
  authFetch('/mentors/apply', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const apiGetMentorApplications = (status) => {
  const qs = status ? `?status=${status}` : '';
  return authFetch(`/mentors/applications${qs}`);
};

export const apiApproveMentor = (id) =>
  authFetch(`/mentors/${id}/approve`, { method: 'PUT' });

export const apiRejectMentor = (id) =>
  authFetch(`/mentors/${id}/reject`, { method: 'PUT' });

// ── SCHOOL ──────────────────────────────────────
export const apiGetSchoolDashboard = () => authFetch('/school/dashboard');

export const apiGetSchoolStudents = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return authFetch(`/school/students${qs ? `?${qs}` : ''}`);
};

export const apiBatchEndorse = () =>
  authFetch('/school/batch-endorse', { method: 'POST' });

export const apiPromptStudent = (id) =>
  authFetch(`/school/students/${id}/prompt`, { method: 'POST' });

export const apiScheduleScrimmage = (data) =>
  authFetch('/school/scrimmage', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiExportSchoolTelemetry = async () => {
  const token = getToken();
  const response = await fetch('/api/school/export', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Failed to export CSV');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'oakwood_extracurricular_telemetry.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// ── LOCAL STORAGE HELPERS ───────────────────────
export const saveSession = (user, token) => {
  localStorage.setItem('eduspark_token', token);
  localStorage.setItem('eduspark_user', JSON.stringify(user));
};

export const loadSession = () => {
  const token = localStorage.getItem('eduspark_token');
  const userStr = localStorage.getItem('eduspark_user');
  if (!token || !userStr) return null;
  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem('eduspark_token');
  localStorage.removeItem('eduspark_user');
};
