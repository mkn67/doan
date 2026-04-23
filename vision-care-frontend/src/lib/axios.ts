import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Nó sẽ tự dùng rewrite ở step 2
});

// Thêm interceptor để tự động nhét token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Hoặc lấy từ cookie
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;