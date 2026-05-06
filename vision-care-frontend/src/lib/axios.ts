import axios from 'axios';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
  // Đảm bảo KHÔNG có dấu gạch chéo ở cuối v1
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động đính kèm Token vào mọi request
axiosClient.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;