import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000
});

export const getProducts = (params = {}) =>
  api.get('/api/products', { params }).then((res) => res.data);

export const getProductById = (id) =>
  api.get(`/api/products/${id}`).then((res) => res.data);

export const createProduct = (formData) =>
  api.post('/api/products', formData).then((res) => res.data);

export const toggleAvailability = (id) =>
  api.patch(`/api/products/${id}/toggle`).then((res) => res.data);

export const deleteProduct = (id) =>
  api.delete(`/api/products/${id}`).then((res) => res.data);

export const registerUser = (payload) =>
  api.post('/api/auth/register', payload).then((res) => res.data);

export const loginUser = (payload) =>
  api.post('/api/auth/login', payload).then((res) => res.data);

export const getCurrentUser = () =>
  api.get('/api/auth/me').then((res) => res.data);

export const logoutUser = () =>
  api.post('/api/auth/logout').then((res) => res.data);

export const createOrder = (payload) =>
  api.post('/api/orders', payload).then((res) => res.data);

export const getMyOrders = () =>
  api.get('/api/orders/mine').then((res) => res.data);

export const getAllOrders = () =>
  api.get('/api/orders').then((res) => res.data);

export const updateOrderStatus = (id, status) =>
  api.patch(`/api/orders/${id}/status`, { status }).then((res) => res.data);

export default api;
