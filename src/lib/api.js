import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const base = String(rawBase).replace(/\/$/, '');

export const api = axios.create({
  baseURL: `${base}/api`,
});

api.interceptors.request.use((config) => {
  const code = localStorage.getItem('accessCode');
  if (code) {
    config.headers = config.headers || {};
    config.headers['x-access-code'] = code;
  }
  return config;
});

export async function signupMasyarakat({ name }) {
  const res = await api.post('/auth/signup', { name });
  return res.data;
}

export async function loginWithCode({ code }) {
  const res = await api.post('/auth/login', { code });
  return res.data;
}
