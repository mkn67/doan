import axios from 'axios';

// 1. Tạo một instance riêng biệt
const axiosClient = axios.create({
  // Nhớ cấu hình file .env.local có biến NEXT_PUBLIC_API_URL nhé
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. INTERCEPTOR REQUEST: TRƯỚC KHI GỬI ĐI
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // Nếu có token trong máy -> Tự động gắn vào Header Authorization
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. INTERCEPTOR RESPONSE: SAU KHI NHẬN KẾT QUẢ VỀ
axiosClient.interceptors.response.use(
  (response) => {
    // Nếu API thành công (Code 200) thì trả data về bình thường
    return response;
  },
  (error) => {
    // Nếu Backend chửi về lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn("Token không hợp lệ, hết hạn hoặc đã bị Blacklist! Đang đăng xuất...");
      
      // Dọn rác và đá về trang login ngay lập tức
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Dùng window.location.href thay vì router.push để reload lại toàn bộ state của App cho sạch
        window.location.href = '/auth/login'; 
      }
    }
    
    // Ném lỗi ra để màn hình UI (hoặc React Query) tự hiện Toast thông báo
    return Promise.reject(error);
  }
);

export default axiosClient;