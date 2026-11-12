import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    api.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const movieAPI = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  getBySlug: (slug) => api.get(`/movies/slug/${slug}`),
  search: (query) => api.get('/movies/search', { params: { q: query } }),
  getFeatured: () => api.get('/movies/featured'),
  getTopRated: (limit) => api.get('/movies/top-rated', { params: { limit } }),
  getMostViewed: (limit) => api.get('/movies/most-viewed', { params: { limit } }),
  getByGenre: (genreId, params) => api.get(`/movies/genre/${genreId}`, { params }),
  getRelated: (id) => api.get(`/movies/${id}/related`),
  getCountries: () => api.get('/movies/countries'),
  getYears: () => api.get('/movies/years'),
  rate: (id, rating) => api.post(`/movies/${id}/rate`, { rating }),
  incrementViews: (id) => api.post(`/movies/${id}/view`),
};

export const genreAPI = {
  getAll: () => api.get('/genres'),
  getById: (id) => api.get(`/genres/${id}`),
  getBySlug: (slug) => api.get(`/genres/slug/${slug}`),
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  getFavorites: () => api.get('/users/favorites'),
  addFavorite: (movieId) => api.post(`/users/favorites/${movieId}`),
  removeFavorite: (movieId) => api.delete(`/users/favorites/${movieId}`),
  getWatchHistory: () => api.get('/users/watch-history'),
  updateWatchProgress: (movieId, data) =>
    api.put(`/users/watch-history/${movieId}`, data),
  clearWatchHistory: () => api.delete('/users/watch-history'),
};

export const commentAPI = {
  getMovieComments: (movieId, params) => api.get(`/comments/movie/${movieId}`, { params }),
  create: (data) => api.post('/comments', data),
  update: (id, content) => api.put(`/comments/${id}`, { content }),
  delete: (id) => api.delete(`/comments/${id}`),
  like: (id) => api.post(`/comments/${id}/like`),
  dislike: (id) => api.post(`/comments/${id}/dislike`),
};

export const reportAPI = {
  create: (data) => api.post('/reports', data),
  getMyReports: (params) => api.get('/reports/my-reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
};

export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUserStats: (params) => api.get('/admin/stats/users', { params }),
  getViewStats: (params) => api.get('/admin/stats/views', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createMovie: (data) => api.post('/admin/movies', data),
  updateMovie: (id, data) => api.put(`/admin/movies/${id}`, data),
  deleteMovie: (id) => api.delete(`/admin/movies/${id}`),
  getEpisodes: (movieId) => api.get(`/admin/movies/${movieId}/episodes`),
  addEpisode: (movieId, data) => api.post(`/admin/movies/${movieId}/episodes`, data),
  updateEpisode: (movieId, episodeNumber, data) =>
    api.put(`/admin/movies/${movieId}/episodes/${episodeNumber}`, data),
  deleteEpisode: (movieId, episodeNumber) =>
    api.delete(`/admin/movies/${movieId}/episodes/${episodeNumber}`),
  createGenre: (data) => api.post('/admin/genres', data),
  updateGenre: (id, data) => api.put(`/admin/genres/${id}`, data),
  deleteGenre: (id) => api.delete(`/admin/genres/${id}`),
  getComments: (params) => api.get('/admin/comments', { params }),
  toggleHideComment: (id) => api.put(`/admin/comments/${id}/toggle-hide`),
  deleteComment: (id) => api.delete(`/admin/comments/${id}`),
  getReports: (params) => api.get('/admin/reports', { params }),
  updateReportStatus: (id, data) => api.put(`/admin/reports/${id}/status`, data),
};

export default api;
