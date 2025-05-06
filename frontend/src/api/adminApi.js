import axios from 'axios';
import { API_BASE } from './api';

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const updateUserStatus = (userId, status, token) =>
  axios.patch(`${API_BASE}/status/user/${userId}`, { status }, authHeaders(token));


export const modifyBalance = (userId, amount, token) =>
  axios.patch(`${API_BASE}/balance/${userId}`, { amount }, authHeaders(token));

export const setBetOdds = (betId, odds, token) =>
  axios.patch(`${API_BASE}/odds/${betId}`, { odds }, authHeaders(token));

export const fetchLogs = (token) =>
  axios.get(`${API_BASE}/logs`, authHeaders(token));
