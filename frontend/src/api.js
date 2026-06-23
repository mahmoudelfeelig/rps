import axios from 'axios';

const RAW = import.meta.env.VITE_API_URL || '';
export const API_BASE = RAW.replace(/\/+$/, '');

const baseURL = API_BASE ? `${API_BASE}/api` : '/api';

const api = axios.create({ baseURL });

export default api;
