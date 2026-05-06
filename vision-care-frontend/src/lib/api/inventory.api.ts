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

  // --- LÔ HÀNG & PHIẾU NHẬP ---
  createLoHang: async (data: LoHangRequest): Promise<LoHangResponse> => {
    const response = await axiosClient.post<LoHangResponse>('/lo-hang', data);
    return response.data;
  },
  getPhieuNhap: async (): Promise<PageResponseDTO<PhieuNhapResponse>> => {
    const response = await axiosClient.get<PageResponseDTO<PhieuNhapResponse>>('/phieu-nhap');
    return response.data;
  },
  createPhieuNhap: async (data: PhieuNhapRequest): Promise<PhieuNhapResponse> => {
    const response = await axiosClient.post<PhieuNhapResponse>('/phieu-nhap/nhap-kho', data);
    return response.data;
  },

  // --- NHÀ CUNG CẤP & GIAO DỊCH ---
  getNhaCungCap: async (): Promise<NhaCungCapResponse[]> => {
    const response = await axiosClient.get<NhaCungCapResponse[]>('/nha-cung-cap');
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

  // --- THỐNG KÊ & CẢNH BÁO ---
  getThongKeSanPham: async (): Promise<ThongKeSanPham[]> => {
    const response = await axiosClient.get<ThongKeSanPham[]>('/thong-ke/san-pham');
    return response.data;
  },
  getCanhBaoHetHan: async (): Promise<CanhBaoHetHan[]> => {
    const response = await axiosClient.get<CanhBaoHetHan[]>('/canh-bao/het-han');
    return response.data;
  },
  getCanhBaoTonKho: async (): Promise<CanhBaoTonKhoDto[]> => {
    const response = await axiosClient.get<CanhBaoTonKhoDto[]>('/canh-bao/ton-kho');
    return response.data;
  },
};