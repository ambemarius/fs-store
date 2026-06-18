import axios from 'axios';

// In development, Vite proxies "/api" to the Express backend (see vite.config.js).
// In production you can set VITE_API_URL to your deployed backend URL.
const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL });

// Fetch the catalog, optionally filtered by category or size.
export const getProducts = (params = {}) =>
  api.get('/api/products', { params }).then((res) => res.data);

// Fetch a single shoe by its id.
export const getProductById = (id) =>
  api.get(`/api/products/${id}`).then((res) => res.data);

// Create a new shoe. `formData` must be a FormData object holding the
// text fields plus one or more "images" files.
export const createProduct = (formData) =>
  api.post('/api/products', formData).then((res) => res.data);

// Flip a shoe between "Available" and "Sold Out".
export const toggleAvailability = (id) =>
  api.patch(`/api/products/${id}/toggle`).then((res) => res.data);

export default api;
