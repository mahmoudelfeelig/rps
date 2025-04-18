import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/admin';

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const updateUserStatus = (userId, status, token) =>
  axios.patch(`${BASE_URL}/status/user/${userId}`, { status }, authHeaders(token));

export const updateGroupStatus = (groupId, status, token) =>
  axios.patch(`${BASE_URL}/status/group/${groupId}`, { status }, authHeaders(token));

export const modifyBalance = (userId, amount, token) =>
  axios.patch(`${BASE_URL}/balance/${userId}`, { amount }, authHeaders(token));

export const setBetOdds = (betId, odds, token) =>
  axios.patch(`${BASE_URL}/odds/${betId}`, { odds }, authHeaders(token));

export const fetchLogs = (token) =>
  axios.get(`${BASE_URL}/logs`, authHeaders(token));
