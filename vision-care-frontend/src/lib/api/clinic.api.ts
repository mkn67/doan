import axiosClient from '../axios';
import {
  HoSoKhamRequest, HoSoKhamResponse,
  PhieuKeDonRequest, PhieuKeDonResponse,
  DichVuKhamRequest, DichVuKhamResponse,
  GoiKhamRequest, GoiKhamResponse,
  DanhGiaRequest, DanhGiaResponse,
  ChiTietKyThuatRequest, ChiTietKyThuatResponse,
  ThongKeBenhNhan, TopBacSi
} from '@/types/clinic';

const BASE_URL = '/api/clinic'; // Tiền tố URL cho module Clinic

export const clinicApi = {
  // --- HỒ SƠ KHÁM ---
  createHoSoKham: async (data: HoSoKhamRequest): Promise<HoSoKhamResponse> => {
    const response = await axiosClient.post<HoSoKhamResponse>(`${BASE_URL}/hoso`, data);
    return response.data;
  },
  getHoSoKham: async (maHoSo: string): Promise<HoSoKhamResponse> => {
    const response = await axiosClient.get<HoSoKhamResponse>(`${BASE_URL}/hoso/${maHoSo}`);
    return response.data;
  },

  // --- KÊ ĐƠN ---
  createPhieuKeDon: async (data: PhieuKeDonRequest): Promise<PhieuKeDonResponse> => {
    const response = await axiosClient.post<PhieuKeDonResponse>(`${BASE_URL}/kedon`, data);
    return response.data;
  },

  // --- DỊCH VỤ & GÓI KHÁM ---
  getDichVu: async (): Promise<DichVuKhamResponse[]> => {
    const response = await axiosClient.get<DichVuKhamResponse[]>(`${BASE_URL}/dichvu`);
    return response.data;
  },
  createDichVu: async (data: DichVuKhamRequest): Promise<DichVuKhamResponse> => {
    const response = await axiosClient.post<DichVuKhamResponse>(`${BASE_URL}/dichvu`, data);
    return response.data;
  },
  createGoiKham: async (data: GoiKhamRequest): Promise<GoiKhamResponse> => {
    const response = await axiosClient.post<GoiKhamResponse>(`${BASE_URL}/goikham`, data);
    return response.data;
  },

  // --- ĐÁNH GIÁ & KỸ THUẬT ---
  createDanhGia: async (data: DanhGiaRequest): Promise<DanhGiaResponse> => {
    const response = await axiosClient.post<DanhGiaResponse>(`${BASE_URL}/danhgia`, data);
    return response.data;
  },
  createChiTietKyThuat: async (data: ChiTietKyThuatRequest): Promise<ChiTietKyThuatResponse> => {
    const response = await axiosClient.post<ChiTietKyThuatResponse>(`${BASE_URL}/kythuat`, data);
    return response.data;
  },

  // ==========================================
  // BỔ SUNG: THỐNG KÊ (HẾT LỖI ESLINT)
  // ==========================================

  getThongKeBenhNhan: async (tuNgay?: string, denNgay?: string): Promise<ThongKeBenhNhan[]> => {
    const response = await axiosClient.get<ThongKeBenhNhan[]>(`${BASE_URL}/thongke/benh-nhan`, {
      params: { tuNgay, denNgay }
    });
    return response.data;
  },

  getTopBacSi: async (thang?: number, nam?: number): Promise<TopBacSi[]> => {
    const response = await axiosClient.get<TopBacSi[]>(`${BASE_URL}/thongke/top-bac-si`, {
      params: { thang, nam }
    });
    return response.data;
  }
};