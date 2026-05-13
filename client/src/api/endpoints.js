import api from './axios';

// ── Auth ──────────────────────────────────────────────────────────────
export const login = (data) => api.post('/api/v1/auth/login', data);
export const register = (data) => api.post('/api/v1/auth/register', data);
export const getMe = () => api.get('/api/v1/auth/me');

// ── Cases ─────────────────────────────────────────────────────────────
export const getPendingCases = () => api.get('/api/v1/cases/pending');
export const getCaseById = (id) => api.get(`/api/v1/cases/${id}`);
export const getMyCases = () => api.get('/api/v1/cases/my/cases');
export const fileComplaint = (data) => api.post('/api/v1/cases', data);
export const reviewDraft = (data) => api.post('/api/v1/cases/draft-review', data);
export const approveCase = (id, data) => api.patch(`/api/v1/cases/${id}/approve`, data);
export const rejectCase = (id, data) => api.patch(`/api/v1/cases/${id}/reject`, data);
export const closeCase = (id, data) => api.patch(`/api/v1/cases/${id}/close`, data);
export const getAllCases = (status) =>
  api.get('/api/v1/cases/all', { params: status ? { status } : {} });

// ── Lawyers ───────────────────────────────────────────────────────────
export const getLawyers = (courtType) =>
  api.get('/api/v1/lawyers', { params: courtType ? { courtType } : {} });
export const getRankedLawyers = (caseId) =>
  api.get('/api/v1/lawyers/ranked', { params: { caseId } });
export const sendLawyerRequest = (data) => api.post('/api/v1/lawyers/request', data);
export const acceptRequest = (id) => api.patch(`/api/v1/lawyers/requests/${id}/accept`);
export const declineRequest = (id) => api.patch(`/api/v1/lawyers/requests/${id}/decline`);
export const getIncomingRequests = () => api.get('/api/v1/lawyers/requests/incoming');

// ── Hearings ──────────────────────────────────────────────────────────
export const createHearing = (data) => api.post('/api/v1/hearings', data);
export const updateHearing = (id, data) => api.patch(`/api/v1/hearings/${id}`, data);
export const getHearingsByCase = (caseId) => api.get(`/api/v1/hearings/case/${caseId}`);
