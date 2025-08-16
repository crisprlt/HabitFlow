// src/services/api.js
import axios from 'axios';

const API_URL = 'http://192.168.1.4:4000'; // ✅ tu servidor local

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
