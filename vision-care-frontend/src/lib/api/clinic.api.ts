import axiosClient from '../axios';
import {
  HoSoKhamRequest, HoSoKhamResponse,
  PhieuKeDonRequest, PhieuKeDonResponse,
  DichVuKhamRequest, DichVuKhamResponse,
  GoiKhamRequest, GoiKhamResponse,
  DanhGiaRequest, DanhGiaResponse,
  ChiTietKyThuatRequest, ChiTietKyThuatResponse,
  DatLichRequest, DatLichResponse,
  AuditHosoThiluc
} from '@/types/clinic';

const BASE_URL = '/clinic';

export const clinicApi = {
  // --- HỒ SƠ KHÁM ---
  createHoSoKham: async (data: HoSoKhamRequest): Promise<HoSoKhamResponse> => {
    const response = await axiosClient.post('/examinations/save', data);
    return response.data;
  },

  getHoSoKham: async (maHoSo: string): Promise<HoSoKhamResponse> => {
    const response = await axiosClient.get(`/examinations/${maHoSo}`);
    return response.data;
  },

  getAuditHoSo: async (maHoSo: string): Promise<AuditHosoThiluc[]> => {
    const response = await axiosClient.get(`/audit/hoso/${maHoSo}`);
    return response.data;
  },

  getLichSuKham: async (maKh: string): Promise<{ message: string; data: any[] }> => {
    const response = await axiosClient.get(`/examinations/khach-hang/${maKh}`);
    return response.data;
  },

  // --- KÊ ĐƠN ---
  createPhieuKeDon: async (data: PhieuKeDonRequest): Promise<PhieuKeDonResponse> => {
    const response = await axiosClient.post('/phieu-ke-don', data);
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

  // --- BOOKING ---
  datLich: async (data: DatLichRequest): Promise<DatLichResponse> => {
    const response = await axiosClient.post(
      "/bookings/dat-lich",
      data
    );
    return response.data;
  },

  // --- HÀNG CHỜ (DÀNH CHO BÁC SĨ) ---
  goiVaoKham: async (maHc: string): Promise<string> => {
    const response = await axiosClient.put(`/hang-cho/${maHc}/goi-kham`);
    return response.data;
  },

  ketThucKham: async (maHc: string, trangThai: 'Hoàn thành' | 'Bỏ về'): Promise<string> => {
    const response = await axiosClient.put(`/hang-cho/${maHc}/ket-thuc`, null, { params: { trangThai } });
    return response.data;
  },
  getHangChoHomNay: async (maNs?: string) => {
    const response = await axiosClient.get(`/hang-cho/hom-nay`, {
      params: { maNs } // Truyền mã bác sĩ lên để lọc (nếu có)
    });
    return response.data;
  },
};