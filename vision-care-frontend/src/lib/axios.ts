import axios from 'axios';

// 1. Xác định BASE_URL duy nhất tại đây
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// 2. Tạo một instance (thực thể) dùng chung cho toàn bộ app
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Có thể thêm timeout để tránh app treo quá lâu
  timeout: 10000,
});

// 3. (Optional) Cấu hình Interceptors - "Người gác cổng"
// Tự động đính kèm Token vào Header mỗi khi gọi API
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Hoặc lấy từ Cookies
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;