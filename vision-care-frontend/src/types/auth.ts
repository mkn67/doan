// ===== REQUEST =====
export interface LoginRequestDTO {
  username: string
  password: string
}

export interface TaiKhoanRequestDTO {
  maTk: string
  username: string
  password: string
  loaiTk: string
  hoTen: string
  sdt: string
  diaChi: string
  maNhom: string
}

export interface ChangePasswordRequestDTO {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordRequestDTO {
  email: string
}

export interface PhanQuyenRequestDTO {
  maTk: string
  maNhom: string
}

export interface VaiTroRequestDTO {
  MaVaiTro: string      // chú ý: backend viết hoa chữ M
  tenVaiTro: string
  moTa: string
}

export interface XacNhanEmailDTO {
  email: string
  otpCode: string       // đúng 6 ký tự
}

// ===== RESPONSE =====
export interface LoginResponseDTO {
  token: string
  username: string
  maNhom: string
  loaiTk: string
}

export interface TaiKhoanResponseDTO {
  maTk: string
  username: string
  loaiTk: string
  trangThai: number     // 1 = active, 0 = inactive
}

export interface VaiTroResponseDTO {
  maVaiTro: string
  tenVaiTro: string
  moTa: string
}

export interface ChangePasswordResponseDTO {
  status: string
  message: string
}