import axios from 'axios';

const API_URL = 'http://YOUR_IP:5007/api'; // Replace with your backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
