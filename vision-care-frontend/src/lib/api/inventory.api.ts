import axiosClient from '../axios'; 

import {
  SanPhamRequest, SanPhamResponse,
  LoHangRequest, LoHangResponse,
  PhieuNhapRequest, PhieuNhapResponse,
  NhaCungCapRequest, NhaCungCapResponse,
  GiaoDichNccRequest, GiaoDichNccResponse,
  ThongKeSanPham, CanhBaoHetHan,
  CanhBaoTonKhoDto,
  PageResponseDTO
} from '@/types/inventory';

export const inventoryApi = {
  // --- SẢN PHẨM ---
  getSanPham: async (): Promise<SanPhamResponse[]> => {
    const response = await axiosClient.get<SanPhamResponse[]>('/san-pham');
    return response.data;
  },
  createSanPham: async (data: SanPhamRequest): Promise<SanPhamResponse> => {
    const response = await axiosClient.post<SanPhamResponse>('/san-pham', data);
    return response.data;
  },
  deleteSanPham: async (maSp: string) => {
    const response = await axiosClient.delete(`/san-pham/${maSp}`);
    return response.data;
  },
  getCategories: async (): Promise<{ maLoai: string; tenLoai: string }[]> => {
    const response = await axiosClient.get<{ maLoai: string; tenLoai: string }[]>('/san-pham/categories');
    return response.data;
  },

  // --- LÔ HÀNG & PHIẾU NHẬP ---
  createLoHang: async (data: LoHangRequest): Promise<LoHangResponse> => {
    const response = await axiosClient.post<LoHangResponse>('/lo-hang', data);
    return response.data;
  },
  getPhieuNhap: async (page = 0, size = 10): Promise<PageResponseDTO<PhieuNhapResponse>> => {
    const response = await axiosClient.get<PageResponseDTO<PhieuNhapResponse>>(`/phieu-nhap?page=${page}&size=${size}`);
    return response.data;
  },
  getPhieuNhapById: async (maPn: string): Promise<PhieuNhapResponse> => {
    const response = await axiosClient.get<PhieuNhapResponse>(`/phieu-nhap/${maPn}`);
    return response.data;
  },
  createPhieuNhap: async (data: PhieuNhapRequest): Promise<PhieuNhapResponse> => {
    const response = await axiosClient.post<PhieuNhapResponse>('/phieu-nhap/nhap-kho', data);
    return response.data;
  },

  // --- NHÀ CUNG CẤP & GIAO DỊCH ---
  // 🛠 FIX 1: Đổi kiểu trả về thành PageResponseDTO và truyền thêm tham số phân trang
  getNhaCungCap: async (page = 0, size = 10, keyword = ''): Promise<PageResponseDTO<NhaCungCapResponse>> => {
    const response = await axiosClient.get<PageResponseDTO<NhaCungCapResponse>>(
      `/nha-cung-cap?page=${page}&size=${size}${keyword ? `&keyword=${keyword}` : ''}`
    );
    return response.data;
  },
  createNhaCungCap: async (data: NhaCungCapRequest): Promise<NhaCungCapResponse> => {
    const response = await axiosClient.post<NhaCungCapResponse>('/nha-cung-cap', data);
    return response.data;
  },
  createGiaoDichNcc: async (data: GiaoDichNccRequest): Promise<GiaoDichNccResponse> => {
    const response = await axiosClient.post<GiaoDichNccResponse>('/giao-dich', data);
    return response.data;
  },
  deleteNhaCungCap: async (maNcc: string) => {
    const response = await axiosClient.delete(`/nha-cung-cap/${maNcc}`);
    return response.data;
  },

  // --- THỐNG KÊ & CẢNH BÁO ---
  getThongKeSanPham: async (): Promise<ThongKeSanPham[]> => {
    const response = await axiosClient.get<ThongKeSanPham[]>('/thong-ke/san-pham');
    return response.data;
  },
  // 🛠 FIX 2: Đổi lại URL cho khớp chính xác 100% với Backend InventoryController
  getCanhBaoHetHan: async (): Promise<CanhBaoHetHan[]> => {
    const response = await axiosClient.get<CanhBaoHetHan[]>('/inventory/warnings/expiring-soon');
    return response.data;
  },
  getCanhBaoTonKho: async (nguong = 10): Promise<CanhBaoTonKhoDto[]> => {
    // Truyền thêm param "nguong" giống như Backend yêu cầu
    const response = await axiosClient.get<CanhBaoTonKhoDto[]>(`/inventory/warnings/low-stock?nguong=${nguong}`);
    return response.data;
  },
};