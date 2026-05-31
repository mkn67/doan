import axiosClient from "../axios";
import {
  KhachHangRequestDTO,
  KhachHangFilterDTO,
  DatLichRequestDTO,
  KhachHangResponseDTO,
  DatLichResponseDTO,
} from "@/types/customer";

export const customerApi = {
  getDanhSachKhachHang: async (filters?: KhachHangFilterDTO): Promise<KhachHangResponseDTO[]> => {
    const response = await axiosClient.get<KhachHangResponseDTO[]>("/khach-hang", { params: filters });
    return response.data;
  },

  createKhachHang: async (data: KhachHangRequestDTO): Promise<KhachHangResponseDTO> => {
    const response = await axiosClient.post<KhachHangResponseDTO>("/khach-hang", data);
    return response.data;
  },

  updateKhachHang: async (maKh: string, data: Partial<KhachHangRequestDTO>): Promise<KhachHangResponseDTO> => {
    const response = await axiosClient.put<KhachHangResponseDTO>(`/khach-hang/${maKh}`, data);
    return response.data;
  },

  getKhachHang: async (maKh: string): Promise<KhachHangResponseDTO> => {
    const response = await axiosClient.get<KhachHangResponseDTO>(`/khach-hang/${maKh}`);
    return response.data;
  },

  deleteKhachHang: async (maKh: string): Promise<void> => {
    await axiosClient.delete(`/khach-hang/${maKh}`);
  },

  datLichKham: async (data: DatLichRequestDTO): Promise<DatLichResponseDTO> => {
    const response = await axiosClient.post<DatLichResponseDTO>("/dat-lich", data);
    return response.data;
  },
};
