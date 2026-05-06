/* ==========================================
    TYPES - REQUEST (Dữ liệu gửi lên Backend)
   ========================================== */

export interface SanPhamRequest {
  tenSp: string;
  maLoai: string;
  giaBan: number;
  moTa?: string;
  hinhAnh?: string;
  laThuoc: number;
  tonKhoToiThieu?: number; // Bổ sung để phục vụ View cảnh báo
}

export interface LoHangRequest {
  maSp: string;
  soLuongNhap: number;
  giaNhap: number;
  ngaySanXuat?: string; // YYYY-MM-DD
  ngayHetHan?: string;  // YYYY-MM-DD
}

export interface PhieuNhapRequest {
  maNcc: string;
  maNs: string;
  loHangList: LoHangRequest[];
}

export interface NhaCungCapRequest {
  tenNcc: string;
  sdt: string;
  email?: string;
  diaChi?: string;
  nguoiLienHe?: string;
}

export interface GiaoDichNccRequest {
  maNcc: string;
  maPn?: string;
  soTien: number;
  loaiGiaoDich: string; // 'THANH_TOAN' | 'HOAN_TIEN'
  hinhThucThanhToan?: string;
  ghiChu?: string;
}

/* ==========================================
    TYPES - RESPONSE (Dữ liệu nhận từ Backend)
   ========================================== */

export interface SanPhamResponse {
  maSp: string;
  tenSp: string;
  tenLoai: string;
  tenNhaCungCap: string;
  giaBan: number;
  tongTonKho: number;
  trangThai: string;
  laThuoc: boolean;
}

export interface LoHangResponse {
  maLo: string;
  maSp: string;
  tenSanPham: string;
  soLuongNhap: number;
  soLuongTon: number;
  giaNhap: number;
  ngaySanXuat?: string;
  ngayHetHan?: string;
  trangThaiHsd: string; // 'Con han' | 'Het han' | 'Sap het han'
}

export interface PhieuNhapResponse {
  maPn: string;
  maNcc: string;
  tenNcc: string;
  maNs: string;
  tenNhanVien: string;
  ngayNhap: string;
  tongTien: number;
  loHangList: LoHangResponse[];
}

export interface NhaCungCapResponse {
  maNcc: string;
  tenNcc: string;
  sdt: string;
  email?: string;
  diaChi?: string;
  nguoiLienHe?: string;
  tongSoPhieuNhap: number;
}

export interface GiaoDichNccResponse {
  maGd: string;
  tenNhaCungCap: string;
  maPn?: string;
  soTien: number;
  loaiGiaoDich: string;
  hinhThucThanhToan?: string;
  ngayGiaoDich: string;
  nguoiThucHien: string;
  ghiChu?: string;
}

/* ==========================================
    TYPES - THỐNG KÊ & CẢNH BÁO (Từ logic Java/View)
   ========================================== */

export interface ThongKeSanPham {
  maSp: string;
  tenSanPham: string;
  loaiSanPham: string;
  tongSoLuongBan: number;
  tongDoanhThuMangLai: number;
}

export interface CanhBaoHetHan {
  maLo: string;
  maSp: string;
  tenSp: string;
  donViTinh: string;
  ngayHetHan: string;
  soNgayConLai: number;
  tonKho: number;
  mucDo: string; // 'Nguy cap' | 'Canh bao'
  nhaCungCap: string;
}

// Đây là Type cho cái View Cảnh báo tồn kho anh em mình vừa xử lý ở Backend
export interface CanhBaoTonKhoDto {
  maSp: string;
  tenSp: string;
  donViTinh: string;
  tongTon: number;
  tonKhoToiThieu: number;
  mucDo: "Het hang" | "Sap het" | "Canh bao" | "On dinh";
}

// types/common.ts
export interface PageResponseDTO<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}