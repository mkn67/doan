// ===== REQUEST =====
export interface CtHoaDonDTO {
  maLo: string
  soLuong: number
  donGia: number
  chietKhau?: number
}

export interface CtHoaDonDvDTO {
  maDv: string
  soLuong: number
  donGia: number
  ghiChu?: string
}

export interface HoaDonRequestDTO {
  maKh: string
  maNs: string
  maHoSo?: string
  dsSanPhams: CtHoaDonDTO[]
  dsDichVus?: CtHoaDonDvDTO[]
  tongTienDuKien?: number
  ghiChu?: string
}

export interface ThanhToanRequestDTO {
  maHd: string
  maNs: string
  soTien: number
  hinhThucThanhToan: string
  ghiChu?: string
}

export interface TaoHoaDonJsonRequest {
  maKh: string
  maNs: string
  maHoso?: string
  maDon?: string
  maDonThuoc?: string
  maDonKinh?: string
  jsonSp?: string
  jsonDv?: string
}


export interface ChiTietSanPhamResponse {
  tenSanPham: string
  maLo: string
  soLuong: number
  donGia: number
  thanhTien: number
}

export interface ChiTietDichVuResponse {
  tenDichVu: string
  soLuong: number
  donGia: number
  thanhTien: number
  ghiChu?: string
}

export interface HoaDonResponseDTO {
  maHd: string
  ngayLap: string
  tongTien: number
  trangThai: string
  tenKhachHang: string
  sdtKhachHang: string
  tenNhanVienLap: string
  danhSachSanPham?: ChiTietSanPhamResponse[]
  danhSachDichVu?: ChiTietDichVuResponse[]
}

export interface ThanhToanResponseDTO {
  maGiaoDich: string
  maHd: string
  tenNhanVienThuNgan: string
  ngayThanhToan: string
  soTien: number
  tienConNo: number
  hinhThucThanhToan: string
  thongBao: string
}

export interface DoanhThuResponseDTO {
  ngay: string
  soLuongDon: number
  doanhThuNgay: number
}

export interface ThongKeDoanhThuTheoNgayDTO {
  ngay: string
  doanhThuKinhVaThuoc: number
  doanhThuKhamBenh: number
  tongDoanhThu: number
  tongSoHoaDon: number
}

export interface ThongKeTongQuanDTO {
  tongSoBenhNhan: number
  tongSoHoaDon: number
  tongSoDonThuoc: number
  tongDoanhThu: number
  tyLeTangTruongDoanhThu?: number
}

export interface PendingInvoiceResponseDTO {
  maKh: string
  tenKhachHang: string
  sdtKhachHang?: string
  maHoSo?: string
  ngayKham?: string
  maDon?: string
  maDonThuoc?: string
  maDonKinh?: string
  ngayKeDon?: string
  loaiKham: string // e.g. "Khám mắt", "Đơn kính/thuốc", "Khám & Đơn kính/thuốc"
}