// src/modules/inventory/inventory.ts

import axios from "axios";

/* =======================
   TYPES - REQUEST
======================= */

export interface SanPhamRequest {
  tenSp: string;
  maLoai: string;
  giaBan: number;
  moTa?: string;
  hinhAnh?: string;
  laThuoc: boolean;
}

export interface LoHangRequest {
  maSp: string;
  soLuongNhap: number;
  giaNhap: number;
  ngaySanXuat?: string;
  ngayHetHan?: string;
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
  loaiGiaoDich: string;
  hinhThucThanhToan?: string;
  ghiChu?: string;
}

/* =======================
   TYPES - RESPONSE
======================= */

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
  tenSanPham: string;
  soLuongNhap: number;
  maSp: string;
  soLuongTon: number;

  giaNhap: number;
  ngaySanXuat?: string;
  ngayHetHan?: string;

  trangThaiHsd: string;
  loaiTk?: string; // enum backend → string
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
  mucDo: string;
  nhaCungCap: string;
}

/* =======================
   API INSTANCE
======================= */

const api = axios.create({
  baseURL: "/api/inventory",
});

/* =======================
   SERVICES
======================= */

// ===== SẢN PHẨM =====
export const getSanPham = async () => {
  const res = await api.get<SanPhamResponse[]>("/sanpham");
  return res.data;
};

export const createSanPham = async (data: SanPhamRequest) => {
  const res = await api.post<SanPhamResponse>("/sanpham", data);
  return res.data;
};

// ===== LÔ HÀNG =====
export const createLoHang = async (data: LoHangRequest) => {
  const res = await api.post<LoHangResponse>("/lohang", data);
  return res.data;
};

// ===== PHIẾU NHẬP =====
export const createPhieuNhap = async (data: PhieuNhapRequest) => {
  const res = await api.post<PhieuNhapResponse>("/phieunhap", data);
  return res.data;
};

export const getPhieuNhap = async () => {
  const res = await api.get<PhieuNhapResponse[]>("/phieunhap");
  return res.data;
};

// ===== NHÀ CUNG CẤP =====
export const createNhaCungCap = async (data: NhaCungCapRequest) => {
  const res = await api.post<NhaCungCapResponse>("/nhacungcap", data);
  return res.data;
};

export const getNhaCungCap = async () => {
  const res = await api.get<NhaCungCapResponse[]>("/nhacungcap");
  return res.data;
};

// ===== GIAO DỊCH NCC =====
export const createGiaoDichNcc = async (data: GiaoDichNccRequest) => {
  const res = await api.post<GiaoDichNccResponse>("/giaodich", data);
  return res.data;
};

// ===== THỐNG KÊ =====
export const getThongKeSanPham = async () => {
  const res = await api.get<ThongKeSanPham[]>("/thongke/sanpham");
  return res.data;
};

// ===== CẢNH BÁO HSD =====
export const getCanhBaoHetHan = async () => {
  const res = await api.get<CanhBaoHetHan[]>("/canhbao-hethan");
  return res.data;
};