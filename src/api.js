import axios from 'axios';

const api = axios.create({
  baseURL: 'https://board-w36w.onrender.com/api',
});

export default api;