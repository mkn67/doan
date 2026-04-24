import axiosClient from '../axios';
import {
  NhanSuRequestDTO, NhanSuResponseDTO,
  ChucVuDTO,
  NhomRequestDTO, NhomResponseDTO,
  LichLamViecRequestDTO, LichLamViecResponseDTO,
  LichHenFilterDTO, LichHenResponseDTO,
  HangChoRequestDTO, HangChoResponseDTO,
  XuLyKinhRequestDTO, XuLyKinhResponseDTO
} from '@/types/staff';

export const staffApi = {
  // --- QUẢN LÝ NHÂN SỰ ---
  createNhanSu: async (data: NhanSuRequestDTO): Promise<NhanSuResponseDTO> => {
    const response = await axiosClient.post<NhanSuResponseDTO>('/api/nhan-su', data);
    return response.data;
  },
  getDanhSachChucVu: async (): Promise<ChucVuDTO[]> => {
    const response = await axiosClient.get<ChucVuDTO[]>('/api/chuc-vu');
    return response.data;
  },

  // --- QUẢN LÝ NHÓM QUYỀN ---
  createNhomQuyen: async (data: NhomRequestDTO): Promise<NhomResponseDTO> => {
    const response = await axiosClient.post<NhomResponseDTO>('/api/nhom', data);
    return response.data;
  },

  // --- LỊCH LÀM VIỆC (CỦA BÁC SĨ/NHÂN VIÊN) ---
  createLichLamViec: async (data: LichLamViecRequestDTO): Promise<LichLamViecResponseDTO> => {
    const response = await axiosClient.post<LichLamViecResponseDTO>('/api/lich-lam-viec', data);
    return response.data;
  },

  // --- QUẢN LÝ LỊCH HẸN (TỪ KHÁCH HÀNG) ---
  getDanhSachLichHen: async (filters?: LichHenFilterDTO): Promise<LichHenResponseDTO[]> => {
    const response = await axiosClient.get<LichHenResponseDTO[]>('/api/lich-hen', { params: filters });
    return response.data;
  },

  // --- HÀNG CHỜ (MÀN HÌNH LỄ TÂN) ---
  themVaoHangCho: async (data: HangChoRequestDTO): Promise<HangChoResponseDTO> => {
    const response = await axiosClient.post<HangChoResponseDTO>('/api/hang-cho', data);
    return response.data;
  },
  getDanhSachHangCho: async (): Promise<HangChoResponseDTO[]> => {
    const response = await axiosClient.get<HangChoResponseDTO[]>('/api/hang-cho');
    return response.data;
  },

  // --- PHÂN XƯỞNG MÀI KÍNH ---
  createPhieuXuLyKinh: async (data: XuLyKinhRequestDTO): Promise<XuLyKinhResponseDTO> => {
    const response = await axiosClient.post<XuLyKinhResponseDTO>('/api/xu-ly-kinh', data);
    return response.data;
  }
};