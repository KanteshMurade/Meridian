import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach token automatically to protected requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =====================
// Auth APIs
// =====================

export const register = (data) => {
  return api.post('/auth/register', data);
};

export const login = (data) => {
  return api.post('/auth/login', data);
};

export const verifyLoginCode = (data) => {
  return api.post('/auth/verify-login-code', data);
};

export const getProfile = () => {
  return api.get('/auth/profile');
};

export const updateProfile = (data) => {
  return api.put('/auth/profile', data);
};

// =====================
// Review APIs
// =====================

export const analyzeCode = (data) => {
  return api.post('/review/analyze', data);
};

export const getReviews = async () => {
  try {
    return await api.get('/review/history');
  } catch (error) {
    if (error.response?.status === 404) {
      return api.get('/review');
    }

    throw error;
  }
};

export const getReview = (id) => {
  return api.get(`/review/${id}`);
};

export const getReviewById = (id) => {
  return api.get(`/review/${id}`);
};

export const deleteReview = (id) => {
  return api.delete(`/review/${id}`);
};

export const deleteReviewById = (id) => {
  return api.delete(`/review/${id}`);
};

export const shareReview = (id) => {
  return api.post(`/review/share/${id}`);
};

export const shareReviewById = (id) => {
  return api.post(`/review/share/${id}`);
};

// =====================
// GitHub APIs
// =====================

export const getRepos = () => {
  return api.get('/github/repos');
};

export const getRepoContents = (owner, repo, path = '') => {
  return api.get(`/github/repos/${owner}/${repo}/contents?path=${path}`);
};

export const getFileContent = (owner, repo, path) => {
  return api.get(`/github/repos/${owner}/${repo}/file?path=${path}`);
};

export default api;