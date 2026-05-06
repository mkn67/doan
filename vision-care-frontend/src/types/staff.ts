// Thêm vào đầu file staff.ts
import type { TaiKhoanResponseDTO, VaiTroResponseDTO } from './auth'
// ===== REQUEST =====
export interface NhanSuRequestDTO {
  username: string
  password: string
  maNhom: string
  maNs?: string // Null khi thêm mới, dùng khi cập nhật
  hoTen: string
  sdt: string
  email?: string
  diaChi?: string
  ngaySinh?: string       // LocalDate -> 'YYYY-MM-DD'
  gioiTinh?: string
  cccd?: string
  maChucVu?: string
  chuyenKhoa?: string     // Dành riêng cho Bác sĩ
}

export interface ChucVuDTO {
  maCv: string
  tenCv: string
  moTa?: string
}

export interface NhomRequestDTO {
  tenNhom: string
  moTa?: string
  danhSachMaVaiTro?: string[]
}

export interface LichLamViecRequestDTO {
  maNs: string
  ngayLam: string         // LocalDate → 'YYYY-MM-DD'
  gioBatDau: number
  gioKetThuc: number
  isNghi?: number         // 1 = nghỉ, 0 = làm
}

export interface LichHenFilterDTO {
  keyword?: string
  maNs?: string
  tuNgay?: string         // 'YYYY-MM-DD'
  denNgay?: string        // 'YYYY-MM-DD'
  trangThai?: string      // 'CHUA_XAC_NHAN' | 'DA_XAC_NHAN' | 'DA_DEN' | 'DA_HUY'
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export interface HangChoRequestDTO {
  maKh: string
  maLh?: string
  maNs?: string
  loaiKham?: string
  ghiChu?: string
}

export interface XuLyKinhRequestDTO {
  maDon: string
  maHoso?: string
  maNsKyThuat?: string
  ngayHenTra: string      // LocalDateTime → 'YYYY-MM-DDTHH:mm:ss'
  ghiChu?: string
  thongSoKinh?: object
}

// ===== RESPONSE =====
export interface NhanSuResponseDTO {
  maNs: string
  hoTen: string
  sdt: string
  email?: string
  diaChi?: string
  ngaySinh?: string
  gioiTinh?: string
  tenChucVu: string
  cccd?: string
  taiKhoan?: TaiKhoanResponseDTO  // import từ auth.ts
}

export interface NhomResponseDTO {
  maNhom: string
  tenNhom: string
  moTa?: string
  danhSachVaiTro: VaiTroResponseDTO[]  // import từ auth.ts
}

export interface LichLamViecResponseDTO {
  maLlv: string
  tenNhanSu: string
  chucVu: string
  ngayLam: string
  gioBatDau: number
  gioKetThuc: number
  isNghi: number
}

export interface LichHenResponseDTO {
  maLh: string
  tenKhachHang: string
  sdtKhachHang: string
  tenBacSi: string
  ngayHen: string         // LocalDate → string
  gioHen: string          // LocalTime → string
  loaiLich: string
  trangThai: string
  trieuChung?: string
}

export interface HangChoResponseDTO {
  maHangCho: string
  soThuTu: number
  tenKhachHang: string
  tenBacSi: string
  trangThai: string
  thoiGianBatDauCho: string
  thoiGianChoDoiPhut: number
}

export interface XuLyKinhResponseDTO {
  maXl: string
  maDon: string
  maHoso?: string
  tenKhachHang: string
  tenKyThuatVien?: string
  tinhTrang: string
  ngayNhan: string
  ngayHenTra: string
  ghiChu?: string
  thongSoKinh?: object
}
export interface HangChoHomNayDTO {
  maHc: string;
  soThuTu: number;
  loaiKhach: string; // "Walk-in" or "Hen truoc"
  tenKhach: string;
  sdt?: string;
  tenBacSi?: string;
  goiKham?: string;
  trangThai: string;
  gioDangKy: string; // ISO datetime
  phutCho: number;
}

export interface LichHenTrieuChungDTO {
  maLh: string;
  ngayHen: string; // ISO datetime
  tenKhach: string;
  trangThai: string;
  danhSachTrieuChung: string[];
}

export interface SlotTrongDTO {
  maNs: string;
  tenBacSi: string;
  ngayLam: string; // YYYY-MM-DD
  gioBatDau: number; // 7.5 = 7:30
  gioKetThuc: number;
  trangThaiSlot: "Đã đặt" | "Còn trống";
}