import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('bencadi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bencadi_token');
      localStorage.removeItem('bencadi_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ===== AUTH =====
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  toggleWishlist: (id) => API.put(`/auth/wishlist/${id}`),
};

// ===== PRODUCTS =====
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getOne: (slug) => API.get(`/products/${slug}`),
  getSuggestions: (q) => API.get('/products/suggestions', { params: { q } }),
  getStats: () => API.get('/products/stats'),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
  addReview: (id, data) => API.post(`/products/${id}/reviews`, data),
};

// ===== CATEGORIES =====
export const categoryAPI = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// ===== ORDERS =====
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders/my'),
  getOne: (id) => API.get(`/orders/${id}`),
  getAll: (params) => API.get('/orders', { params }),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  getStats: () => API.get('/orders/stats'),
};

// ===== SETTINGS =====
export const settingsAPI = {
  get: () => API.get('/settings'),
  update: (data) => API.put('/settings', data),
  updateSocial: (data) => API.put('/settings/social', data),
  updateAbout: (data) => API.put('/settings/about', data),
};

// ===== USERS =====
export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  getOne: (id) => API.get(`/users/${id}`),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
  resetPassword: (id, data) => API.put(`/users/${id}/reset-password`, data),
};

// ===== PROMOS =====
export const promoAPI = {
  getActive: () => API.get('/promos'),
  getAll: () => API.get('/promos/all'),
  validateCoupon: (data) => API.post('/promos/validate-coupon', data),
  create: (data) => API.post('/promos', data),
  update: (id, data) => API.put(`/promos/${id}`, data),
  delete: (id) => API.delete(`/promos/${id}`),
};

// ===== CONTACT =====
export const contactAPI = {
  send: (data) => API.post('/contact', data),
  getAll: () => API.get('/contact'),
};

// ===== UPLOAD =====
export const uploadAPI = {
  uploadImage: (formData) => API.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadImages: (formData) => API.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (filename) => API.delete(`/upload/${filename}`),
};

export default API;
