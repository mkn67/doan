// ==========================================
// REQUEST DTOs (Dữ liệu gửi lên Backend)
// ==========================================

export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface TaiKhoanRequestDTO {
  maTk?: string; // Nên để optional (?) vì lúc tạo mới chưa có mã, backend tự sinh
  username: string;
  password: string;
  loaiTk: string;
  hoTen?: string; // Optional vì trong Java ông check null
  sdt?: string;   // Optional
  diaChi?: string;
  maNhom?: string;
}

export interface ChangePasswordRequestDTO {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface PhanQuyenRequestDTO {
  maTk: string;
  maNhom: string;
}

export interface VaiTroRequestDTO {
  MaVaiTro: string; // Chú ý: Backend viết hoa chữ M
  tenVaiTro: string;
  moTa: string;
}

export interface XacNhanEmailDTO {
  email: string;
  otpCode: string; // Đúng 6 ký tự
}

// ==========================================
// RESPONSE DTOs (Dữ liệu Backend trả về)
// ==========================================

export interface LoginResponseDTO {
  token: string;
  username: string;
  loaiTk: string;
  maNhom?: string; 
}

export interface TaiKhoanResponseDTO {
  maTk: string;
  username: string;
  loaiTk: string;
  trangThai: number; // 1 = active, 0 = inactive
}

export interface VaiTroResponseDTO {
  maVaiTro: string;
  tenVaiTro: string;
  moTa: string;
}

export interface ChangePasswordResponseDTO {
  status: string;
  message: string;
}