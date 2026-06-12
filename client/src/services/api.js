import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Categories
export const getCategories = () => API.get('/categories');
export const getAllCategories = () => API.get('/categories/all');
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Menu Items
export const getMenuItems = (params) => API.get('/menu', { params });
export const getAllMenuItems = (params) => API.get('/menu/all', { params });
export const getMenuItem = (id) => API.get(`/menu/${id}`);
export const createMenuItem = (data) => API.post('/menu', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateMenuItem = (id, data) => API.put(`/menu/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`);

// Tables
export const getTables = () => API.get('/tables');
export const getTableByNumber = (num) => API.get(`/tables/${num}`);
export const createTable = (data) => API.post('/tables', data);
export const updateTable = (id, data) => API.put(`/tables/${id}`, data);
export const deleteTable = (id) => API.delete(`/tables/${id}`);
export const regenerateQR = (id) => API.post(`/tables/${id}/regenerate-qr`);

// Orders
export const placeOrder = (data) => API.post('/orders', data);
export const getOrder = (id) => API.get(`/orders/${id}`);
export const getAllOrders = (params) => API.get('/orders', { params });
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);
export const getDashboardStats = () => API.get('/orders/stats');

// Payments
export const createRazorpayOrder = (data) => API.post('/payments/create-order', data);
export const verifyPayment = (data) => API.post('/payments/verify', data);

export default API;
