import axiosClient from '../axios';
import {
  LoginRequestDTO,
  LoginResponseDTO,
  TaiKhoanRequestDTO,
  TaiKhoanResponseDTO,
  ChangePasswordRequestDTO,
  ChangePasswordResponseDTO,
  ForgotPasswordRequestDTO,
  PhanQuyenRequestDTO,
  VaiTroRequestDTO,
  VaiTroResponseDTO,
  XacNhanEmailDTO
} from '@/types/auth'; // Giả sử ông lưu DTO ở src/types/auth.ts

export const authApi = {
  // 1. Đăng nhập
  login: async (data: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const response = await axiosClient.post<LoginResponseDTO>('/api/auth/login', data);
    return response.data;
  },

  // 2. Quên mật khẩu (Gửi yêu cầu)
  forgotPassword: async (data: ForgotPasswordRequestDTO): Promise<void> => {
    const response = await axiosClient.post('/api/auth/forgot-password', data);
    return response.data;
  },

  // 3. Xác nhận OTP Email
  verifyEmail: async (data: XacNhanEmailDTO): Promise<void> => {
    const response = await axiosClient.post('/api/auth/verify-email', data);
    return response.data;
  },

  // 4. Đổi mật khẩu (Cần có Token đã đăng nhập)
  changePassword: async (data: ChangePasswordRequestDTO): Promise<ChangePasswordResponseDTO> => {
    const response = await axiosClient.post<ChangePasswordResponseDTO>('/api/auth/change-password', data);
    return response.data;
  },

  // ==========================================
  // PHẦN DÀNH CHO ADMIN QUẢN LÝ TÀI KHOẢN
  // ==========================================

  // 5. Tạo mới hoặc Cập nhật Tài khoản (Dựa vào API thiết kế của ông)
  saveTaiKhoan: async (data: TaiKhoanRequestDTO): Promise<TaiKhoanResponseDTO> => {
    // Nếu API của ông tách ra POST (Create) và PUT (Update) thì chia ra 2 hàm nhé
    const response = await axiosClient.post<TaiKhoanResponseDTO>('/api/tai-khoan', data);
    return response.data;
  },

  // 6. Phân quyền cho tài khoản vào Nhóm
  phanQuyen: async (data: PhanQuyenRequestDTO): Promise<void> => {
    const response = await axiosClient.post('/api/tai-khoan/phan-quyen', data);
    return response.data;
  },

  // 7. Lấy danh sách Vai trò
  getDanhSachVaiTro: async (): Promise<VaiTroResponseDTO[]> => {
    const response = await axiosClient.get<VaiTroResponseDTO[]>('/api/vai-tro');
    return response.data;
  },

  // 8. Tạo mới Vai trò
  createVaiTro: async (data: VaiTroRequestDTO): Promise<VaiTroResponseDTO> => {
    // Lưu ý: data có field `MaVaiTro` viết hoa chữ M như ông dặn
    const response = await axiosClient.post<VaiTroResponseDTO>('/api/vai-tro', data);
    return response.data;
  }
};