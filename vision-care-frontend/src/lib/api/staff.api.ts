import axiosClient from '../axios';
import {
  NhanSuRequestDTO, NhanSuResponseDTO,
  ChucVuDTO,
  NhomRequestDTO, NhomResponseDTO,
  LichLamViecRequestDTO, LichLamViecResponseDTO,
  LichHenFilterDTO, LichHenResponseDTO,
  HangChoRequestDTO, HangChoResponseDTO,
  XuLyKinhRequestDTO, XuLyKinhResponseDTO,
  HangChoHomNayDTO,
  LichHenTrieuChungDTO,
  SlotTrongDTO,
  PageResponseDTO // Giả sử đã có trong types/inventory hoặc types/staff
} from '@/types/staff';

export const staffApi = {
  // --- QUẢN LÝ NHÂN SỰ ---
  getDanhSachNhanSu: async (page: number, size: number, keyword: string): Promise<PageResponseDTO<NhanSuResponseDTO>> => {
    const response = await axiosClient.get<PageResponseDTO<NhanSuResponseDTO>>(`/nhan-su`, {
      params: {
        page,
        size,
        keyword: keyword || undefined
      }
    });
    return response.data;
  },
  createNhanSu: async (data: NhanSuRequestDTO): Promise<NhanSuResponseDTO> => {
    const response = await axiosClient.post<NhanSuResponseDTO>('/nhan-su', data);
    return response.data;
  },
  getDanhSachChucVu: async (): Promise<ChucVuDTO[]> => {
    const response = await axiosClient.get<ChucVuDTO[]>('/chuc-vu');
    return response.data;
  },

  // --- QUẢN LÝ NHÓM QUYỀN ---
  createNhomQuyen: async (data: NhomRequestDTO): Promise<NhomResponseDTO> => {
    const response = await axiosClient.post<NhomResponseDTO>('/nhom', data);
    return response.data;
  },

  // --- LỊCH LÀM VIỆC (CỦA BÁC SĨ/NHÂN VIÊN) ---
  createLichLamViec: async (data: LichLamViecRequestDTO): Promise<LichLamViecResponseDTO> => {
    const response = await axiosClient.post<LichLamViecResponseDTO>('/lich-lam-viec', data);
    return response.data;
  },

  // --- QUẢN LÝ LỊCH HẸN (TỪ KHÁCH HÀNG) ---
  getDanhSachLichHen: async (filters?: LichHenFilterDTO): Promise<LichHenResponseDTO[]> => {
    // Đổi chữ '/lich-hen' thành '/bookings' cho khớp với Backend
    const response = await axiosClient.get<LichHenResponseDTO[]>('/bookings', { params: filters });
    return response.data;
  },

  // --- HÀNG CHỜ (MÀN HÌNH LỄ TÂN) ---
  themVaoHangCho: async (data: HangChoRequestDTO): Promise<HangChoResponseDTO> => {
    const response = await axiosClient.post<HangChoResponseDTO>('/hang-cho', data);
    return response.data;
  },
  getDanhSachHangCho: async (): Promise<HangChoResponseDTO[]> => {
    const response = await axiosClient.get<HangChoResponseDTO[]>('/hang-cho');
    return response.data;
  },

  // --- PHÂN XƯỞNG MÀI KÍNH ---
  createPhieuXuLyKinh: async (data: XuLyKinhRequestDTO): Promise<XuLyKinhResponseDTO> => {
    const response = await axiosClient.post<XuLyKinhResponseDTO>('/xu-ly-kinh', data);
    return response.data;
  },

  // FIX: Đổi axiosInstance thành axiosClient
  getHangChoHomNay: async (): Promise<HangChoHomNayDTO[]> => {
    const response = await axiosClient.get<HangChoHomNayDTO[]>("/hang-cho/hom-nay");
    return response.data;
  },

  getLichHenTrieuChung: async (): Promise<LichHenTrieuChungDTO[]> => {
    const response = await axiosClient.get<LichHenTrieuChungDTO[]>("/lich-hen/trieu-chung");
    return response.data;
  },

  getSlotTrong: async (ngay?: string): Promise<SlotTrongDTO[]> => {
      const params = ngay ? { ngay } : {};
      const response = await axiosClient.get<SlotTrongDTO[]>("/lich-lam-viec/slot-trong", { params });
      return response.data;
  },
};