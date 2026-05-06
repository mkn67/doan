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
    const response = await axiosClient.get<KhachHangResponseDTO[]>('/khach-hang', { params: filters });
    return response.data;
  },

  // Tạo mới khách hàng
  createKhachHang: async (data: KhachHangRequestDTO): Promise<KhachHangResponseDTO> => {
    const response = await axiosClient.post<KhachHangResponseDTO>('/khach-hang', data);
    return response.data;
  },

  // Khách hàng đặt lịch khám
  datLichKham: async (data: DatLichRequestDTO): Promise<DatLichResponseDTO> => {
    const response = await axiosClient.post<DatLichResponseDTO>('/dat-lich', data);
    return response.data;
  }
};