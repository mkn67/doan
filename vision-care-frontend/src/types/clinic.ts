// src/modules/clinic/clinic.ts

import axios from "axios";

/* =======================
   TYPES - REQUEST
======================= */

export interface HoSoKhamRequest {
  makh: string;
  mans: string;
  ketluan?: string;

  matTraiSph?: number;
  matTraiCyl?: number;
  matTraiAx?: number;
  doCongTrai?: number;

  matPhaiSph?: number;
  matPhaiCyl?: number;
  matPhaiAx?: number;
  doCongPhai?: number;

  pd?: number;
}

export interface CtKeDonRequest {
  maDon?: string;
  maSp: string;
  soLuong: number;
  lieuDung: string;
  cachDung?: string;
  ghiChu?: string;
}

export interface PhieuKeDonRequest {
  maHoSo: string;
  maNs: string;
  loiKhuyen?: string;
  ghiChu?: string;
  danhSachKeDon: {
    maSp: string;
    soLuong?: number;
    lieuDung?: string;
    cachDung?: string;
  }[];
}

export interface DichVuKhamRequest {
  maDv?: string;
  tenDv: string;
  giaDv: number;
  moTa?: string;
}

export interface GoiKhamRequest {
  tenGoi: string;
  giaGoi: number;
  moTa?: string;
  danhSachMaDv: string[];
}

export interface DanhGiaRequest {
  maHoSo: string;
  maKh: string;
  maNs?: string;
  soSao: number;
  noiDung?: string;
  phanHoiChiTiet?: string;
}

export interface ChiTietKyThuatRequest {
  maNs: string;
  tenKyThuat: string;
  trinhDo: string;
  donViCap?: string;
  moTaThanhTich?: string;
}

/* =======================
   TYPES - RESPONSE
======================= */

export interface ChiTietThiLuc {
  loaiMat: string;
  sph?: number;
  cyl?: number;
  axis?: number;
  va?: string;
  add?: number;
  pd?: number;
}

export interface HoSoKhamResponse {
  maHoSo: string;
  maKh: string;
  tenKhachHang: string;
  tenBacSi: string;
  ngayKham: string;

  trieuChung?: string;
  ketLuan?: string;

  danhSachThiLuc: ChiTietThiLuc[];
  maDonThuoc?: string;
}

export interface CtKeDonResponse {
  maSp: string;
  tenSanPham: string;
  loaiSanPham: string;
  soLuong: number;
  lieuDung?: string;
  cachDung?: string;
  ghiChu?: string;
}

export interface PhieuKeDonResponse {
  maDon: string;
  tenBacSi: string;
  tenKhachHang: string;
  ngayKe: string;
  loiKhuyen?: string;
  ghiChu?: string;

  danhSachKeDon: {
    tenSanPham: string;
    loaiSanPham: string;
    soLuong: number;
    lieuDung?: string;
    cachDung?: string;
  }[];
}

export interface DichVuKhamResponse {
  maDv: string;
  tenDv: string;
  giaDv: number;
  moTa?: string;
}

export interface GoiKhamResponse {
  maGoi: string;
  tenGoi: string;
  giaGoi: number;
  moTa?: string;
  chiTietDichVu: DichVuKhamResponse[];
}

export interface DanhGiaResponse {
  maDg: string;
  tenKhachHang: string;
  sdtKhachHang: string;
  tenBacSi: string;
  soSao: number;
  noiDung?: string;
  phanHoiChiTiet?: string;
  ngayDg: string;
  isHidden: boolean;
}

export interface ChiTietKyThuatResponse {
  maCtkt: string;
  tenNhanSu: string;
  chucVu: string;
  tenKyThuat: string;
  trinhDo: string;
  donViCap?: string;
  ngayCapNhat: string;
}

export interface AuditHosoThiluc {
  maHoSo: string;
  tenKhachHang: string;
  nguoiThayDoi: string;
  thoiGianThayDoi: string;
  ketLuanCu?: string;
  ketLuanMoi?: string;
  lyDoThayDoi?: string;
}

export interface ThongKeBenhNhan {
  thoiGian: string;
  tongSoBenhNhan: number;
  benhNhanMoi: number;
  benhNhanTaiKham: number;
}

export interface TopBacSi {
  maNs: string;
  tenBacSi: string;
  tongSoCaKham: number;
  diemDanhGiaTrungBinh: number;
}

/* =======================
   API INSTANCE
======================= */

const api = axios.create({
  baseURL: "/api/clinic",
});

/* =======================
   SERVICES
======================= */

// Hồ sơ khám
export const createHoSoKham = async (data: HoSoKhamRequest) => {
  const res = await api.post<HoSoKhamResponse>("/hoso", data);
  return res.data;
};

export const getHoSoKham = async (maHoSo: string) => {
  const res = await api.get<HoSoKhamResponse>(`/hoso/${maHoSo}`);
  return res.data;
};

// Kê đơn
export const createPhieuKeDon = async (data: PhieuKeDonRequest) => {
  const res = await api.post<PhieuKeDonResponse>("/kedon", data);
  return res.data;
};

// Dịch vụ khám
export const getDichVu = async () => {
  const res = await api.get<DichVuKhamResponse[]>("/dichvu");
  return res.data;
};

export const createDichVu = async (data: DichVuKhamRequest) => {
  const res = await api.post<DichVuKhamResponse>("/dichvu", data);
  return res.data;
};

// Gói khám
export const createGoiKham = async (data: GoiKhamRequest) => {
  const res = await api.post<GoiKhamResponse>("/goikham", data);
  return res.data;
};

// Đánh giá
export const createDanhGia = async (data: DanhGiaRequest) => {
  const res = await api.post<DanhGiaResponse>("/danhgia", data);
  return res.data;
};

// Kỹ thuật
export const createChiTietKyThuat = async (data: ChiTietKyThuatRequest) => {
  const res = await api.post<ChiTietKyThuatResponse>("/kythuat", data);
  return res.data;
};