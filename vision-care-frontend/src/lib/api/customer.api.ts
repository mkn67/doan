import axiosClient from '../axios';
import {
  KhachHangRequestDTO,
  KhachHangFilterDTO,
  DatLichRequestDTO,
  KhachHangResponseDTO,
  DatLichResponseDTO
} from '@/types/customer';

export const customerApi = {
  // Lấy danh sách khách hàng (có phân trang và lọc)
  getDanhSachKhachHang: async (filters?: KhachHangFilterDTO): Promise<KhachHangResponseDTO[]> => {
    const response = await axiosClient.get<KhachHangResponseDTO[]>('/api/khach-hang', { params: filters });
    return response.data;
  },

  // Tạo mới khách hàng
  createKhachHang: async (data: KhachHangRequestDTO): Promise<KhachHangResponseDTO> => {
    const response = await axiosClient.post<KhachHangResponseDTO>('/api/khach-hang', data);
    return response.data;
  },

  // Khách hàng đặt lịch khám
  datLichKham: async (data: DatLichRequestDTO): Promise<DatLichResponseDTO> => {
    const response = await axiosClient.post<DatLichResponseDTO>('/api/dat-lich', data);
    return response.data;
  }
};