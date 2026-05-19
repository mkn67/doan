import axiosClient from '../axios';
import { DoanhThuResponseDTO } from '@/types/billing';
import { CanhBaoHetHan } from '@/types/inventory';

export const reportApi = {
  getThongKeBenhNhan: async (tuNgay?: string, denNgay?: string) => {
    const response = await axiosClient.get(`/clinic/thongke/benh-nhan`, {
      params: { tuNgay, denNgay }
    });
    return response.data;
  },

  getTopBacSi: async (thang?: number, nam?: number) => {
    const response = await axiosClient.get(`/clinic/thongke/top-bac-si`, {
      params: { thang, nam }
    });
    return response.data;
  },

  // 3. Doanh thu (ĐÃ SỬA: Xóa /api/v1/ để tránh lỗi lắp bắp)
  getRevenue: async (thang: number, nam: number): Promise<DoanhThuResponseDTO[]> => {
    const response = await axiosClient.get<DoanhThuResponseDTO[]>(`/reports/revenue`, {
      params: { thang, nam }
    });
    return response.data;
  },

  // 4. Cảnh báo hết hạn (ĐÃ SỬA: Xóa /api/v1/ để tránh lỗi lắp bắp)
  getCanhBaoHetHan: async (soNgay: number = 30): Promise<CanhBaoHetHan[]> => {
    const response = await axiosClient.get<CanhBaoHetHan[]>(`/reports/canh-bao-het-han`, {
      params: { soNgay }
    });
    return response.data;
  }
};