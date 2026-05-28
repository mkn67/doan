// ===== REQUEST =====
export interface KhachHangRequestDTO {
  hoTen: string
  sdt: string
  diaChi?: string
  email?: string
  ghiChu?: string
}

export interface KhachHangFilterDTO {
  keyword?: string
  diaChi?: string
  tuNgay?: string
  denNgay?: string
  soLanKhamToiThieu?: number
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export interface DatLichRequestDTO {
  maKh: string
  maNs: string
  maGoi: string
  ngayHen: string       // LocalDate → string (format: 'YYYY-MM-DD')
  gioHen: string        // LocalDateTime → string (format: 'YYYY-MM-DDTHH:mm:ss')
}

// ===== RESPONSE =====
export interface KhachHangResponseDTO {
  maKh: string
  hoTen: string
  sdt: string
  email?: string
  diaChi?: string
  ghiChu?: string
  cccd?: string
  ngaySinh?: string
  gioiTinh?: string
  diemTichLuy?: number
  ngayTao: string
  tongSoLanKham?: number
  tongChiTieu?: number
  lichHenGanNhat?: string
}

export interface DatLichResponseDTO {
  maLh: string
  maKhachHang: string
  tenKhachHang: string
  maBacSi: string
  tenBacSi: string
  ngayHen: string
  gioHen: string
  trangThai: string
  thongBao: string
}