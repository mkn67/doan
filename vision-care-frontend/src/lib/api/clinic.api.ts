import axiosClient from '../axios';
import {
  HoSoKhamRequest, HoSoKhamResponse,
  PhieuKeDonRequest, PhieuKeDonResponse,
  DichVuKhamRequest, DichVuKhamResponse,
  GoiKhamRequest, GoiKhamResponse,
  DanhGiaRequest, DanhGiaResponse,
  ChiTietKyThuatRequest, ChiTietKyThuatResponse,
  ThongKeBenhNhan, TopBacSi,
  DatLichRequest, DatLichResponse
} from '@/types/clinic';

const BASE_URL = '/clinic';

export const clinicApi = {
  // --- HỒ SƠ KHÁM ---
  createHoSoKham: async (data: HoSoKhamRequest): Promise<HoSoKhamResponse> => {
    const response = await axiosClient.post(`${BASE_URL}/hoso`, data);
    return response.data;
  },

  getHoSoKham: async (maHoSo: string): Promise<HoSoKhamResponse> => {
    const response = await axiosClient.get(`${BASE_URL}/hoso/${maHoSo}`);
    return response.data;
  },

  // --- KÊ ĐƠN ---
  createPhieuKeDon: async (data: PhieuKeDonRequest): Promise<PhieuKeDonResponse> => {
    const response = await axiosClient.post(`${BASE_URL}/kedon`, data);
    return response.data;
  },

  // --- DỊCH VỤ ---
  getDichVu: async (): Promise<DichVuKhamResponse[]> => {
    const response = await axiosClient.get(`/dich-vu-kham`);
    return response.data;
  },

  createDichVu: async (data: DichVuKhamRequest): Promise<DichVuKhamResponse> => {
    const response = await axiosClient.post(`/dich-vu-kham`, data);
    return response.data;
  },

  createGoiKham: async (data: GoiKhamRequest): Promise<GoiKhamResponse> => {
    const response = await axiosClient.post(`${BASE_URL}/goikham`, data);
    return response.data;
  },

  // --- ĐÁNH GIÁ ---
  createDanhGia: async (data: DanhGiaRequest): Promise<DanhGiaResponse> => {
    const response = await axiosClient.post(`${BASE_URL}/danhgia`, data);
    return response.data;
  },

  createChiTietKyThuat: async (data: ChiTietKyThuatRequest): Promise<ChiTietKyThuatResponse> => {
    const response = await axiosClient.post(`${BASE_URL}/kythuat`, data);
    return response.data;
  },

  // --- THỐNG KÊ ---
  getThongKeBenhNhan: async (tuNgay?: string, denNgay?: string): Promise<ThongKeBenhNhan[]> => {
    const response = await axiosClient.get(`${BASE_URL}/thongke/benh-nhan`, {
      params: { tuNgay, denNgay }
    });
    return response.data;
  },

  getTopBacSi: async (thang?: number, nam?: number): Promise<TopBacSi[]> => {
    const response = await axiosClient.get(`${BASE_URL}/thongke/top-bac-si`, {
      params: { thang, nam }
    });
    return response.data;
  },

  // --- BOOKING ---
  datLich: async (data: DatLichRequest): Promise<DatLichResponse> => {
    const response = await axiosClient.post(
      "/bookings/dat-lich",
      data
    );
    return response.data;
  },
};