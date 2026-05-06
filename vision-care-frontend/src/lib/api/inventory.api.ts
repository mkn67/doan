import axiosClient from '../axios';
// XÓA cái import { axiosInstance } bị lỗi đi nhé
import {
  SanPhamRequest, SanPhamResponse,
  LoHangRequest, LoHangResponse,
  PhieuNhapRequest, PhieuNhapResponse,
  NhaCungCapRequest, NhaCungCapResponse,
  GiaoDichNccRequest, GiaoDichNccResponse,
  ThongKeSanPham, CanhBaoHetHan,
  CanhBaoTonKhoDto
} from '@/types/inventory';

const BASE_URL = '/api/inventory';

export const inventoryApi = {
  // --- SẢN PHẨM ---
  getSanPham: async (): Promise<SanPhamResponse[]> => {
    const response = await axiosClient.get<SanPhamResponse[]>(`${BASE_URL}/sanpham`);
    return response.data;
  },
  createSanPham: async (data: SanPhamRequest): Promise<SanPhamResponse> => {
    const response = await axiosClient.post<SanPhamResponse>(`${BASE_URL}/sanpham`, data);
    return response.data;
  },

  // --- LÔ HÀNG & PHIẾU NHẬP ---
  createLoHang: async (data: LoHangRequest): Promise<LoHangResponse> => {
    const response = await axiosClient.post<LoHangResponse>(`${BASE_URL}/lohang`, data);
    return response.data;
  },
  getPhieuNhap: async (): Promise<PhieuNhapResponse[]> => {
    const response = await axiosClient.get<PhieuNhapResponse[]>(`${BASE_URL}/phieunhap`);
    return response.data;
  },
  createPhieuNhap: async (data: PhieuNhapRequest): Promise<PhieuNhapResponse> => {
    const response = await axiosClient.post<PhieuNhapResponse>(`${BASE_URL}/phieunhap`, data);
    return response.data;
  },

  // --- NHÀ CUNG CẤP & GIAO DỊCH ---
  getNhaCungCap: async (): Promise<NhaCungCapResponse[]> => {
    const response = await axiosClient.get<NhaCungCapResponse[]>(`${BASE_URL}/nhacungcap`);
    return response.data;
  },
  createNhaCungCap: async (data: NhaCungCapRequest): Promise<NhaCungCapResponse> => {
    const response = await axiosClient.post<NhaCungCapResponse>(`${BASE_URL}/nhacungcap`, data);
    return response.data;
  },
  createGiaoDichNcc: async (data: GiaoDichNccRequest): Promise<GiaoDichNccResponse> => {
    const response = await axiosClient.post<GiaoDichNccResponse>(`${BASE_URL}/giaodich`, data);
    return response.data;
  },

  // --- THỐNG KÊ & CẢNH BÁO ---
  getThongKeSanPham: async (): Promise<ThongKeSanPham[]> => {
    const response = await axiosClient.get<ThongKeSanPham[]>(`${BASE_URL}/thongke/sanpham`);
    return response.data;
  },
  getCanhBaoHetHan: async (): Promise<CanhBaoHetHan[]> => {
    const response = await axiosClient.get<CanhBaoHetHan[]>(`${BASE_URL}/canhbao-hethan`);
    return response.data;
  },
  getCanhBaoTonKho: async (): Promise<CanhBaoTonKhoDto[]> => {
    // Đã đổi axiosInstance thành axiosClient và dùng BASE_URL
    const response = await axiosClient.get<CanhBaoTonKhoDto[]>(`${BASE_URL}/canh-bao-ton-kho`);
    return response.data;
  },
};