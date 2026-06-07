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
import { DichVuKhamRequest, DichVuKhamResponse } from '@/types/clinic';


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

  confirmLichHen: async (maLh: string | number): Promise<void> => {
    const response = await axiosClient.put(`/bookings/${maLh}/confirm`);
    return response.data;
  },

  huyLichHen: async (maLh: string | number): Promise<void> => {
    const response = await axiosClient.post(`/bookings/huy-lich/${maLh}`);
    return response.data;
  },

  checkInLichHen: async (maLh: string | number): Promise<HangChoResponseDTO> => {
    const response = await axiosClient.post<HangChoResponseDTO>(`/bookings/${maLh}/check-in`);
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
  getXuLyKinhCanXuLy: async (): Promise<XuLyKinhResponseDTO[]> => {
    const response = await axiosClient.get<XuLyKinhResponseDTO[]>('/xu-ly-kinh/can-xu-ly');
    return response.data;
  },
  updateTrangThaiXuLyKinh: async (maXl: string, trangThai: string): Promise<XuLyKinhResponseDTO> => {
    const response = await axiosClient.patch<XuLyKinhResponseDTO>(`/xu-ly-kinh/${maXl}/trang-thai`, null, {
      params: { trangThai }
    });
    return response.data;
  },
  batDauXuLyKinh: async (maXl: string, maKyThuat: string): Promise<XuLyKinhResponseDTO> => {
    const response = await axiosClient.post<XuLyKinhResponseDTO>(`/xu-ly-kinh/${maXl}/bat-dau`, null, {
      params: { maKyThuat }
    });
    return response.data;
  },
  hoanThanhXuLyKinh: async (maXl: string): Promise<XuLyKinhResponseDTO> => {
    const response = await axiosClient.post<XuLyKinhResponseDTO>(`/xu-ly-kinh/${maXl}/hoan-thanh`);
    return response.data;
  },
  huyXuLyKinh: async (maXl: string, lyDo?: string): Promise<XuLyKinhResponseDTO> => {
    const response = await axiosClient.post<XuLyKinhResponseDTO>(`/xu-ly-kinh/${maXl}/huy`, null, {
      params: { lyDo }
    });
    return response.data;
  },
  updateThongSoKinh: async (maXl: string, thongSoKinh: any): Promise<XuLyKinhResponseDTO> => {
    const response = await axiosClient.put<XuLyKinhResponseDTO>(`/xu-ly-kinh/${maXl}/thong-so`, thongSoKinh);
    return response.data;
  },

  // FIX: Đổi axiosInstance thành axiosClient
  getHangChoHomNay: async (): Promise<HangChoHomNayDTO[]> => {
    const response = await axiosClient.get<HangChoHomNayDTO[]>("/hang-cho/hom-nay");
    return response.data;
  },

  getLichHenTrieuChung: async (): Promise<LichHenTrieuChungDTO[]> => {
    const response = await axiosClient.get<LichHenTrieuChungDTO[]>("/bookings/trieu-chung");
    return response.data;
  },

  getSlotTrong: async (ngay?: string, maNs?: string): Promise<SlotTrongDTO[]> => {
      const params: any = {};
      if (ngay) params.ngay = ngay;
      if (maNs) params.maNs = maNs;
      const response = await axiosClient.get<SlotTrongDTO[]>("/lich-lam-viec/slot-trong", { params });
      return response.data;
  },

  // --- HÀNH ĐỘNG QUẢN TRỊ ---
  updateNhanSu: async (maNs: string, data: NhanSuRequestDTO): Promise<NhanSuResponseDTO> => {
    const response = await axiosClient.put<NhanSuResponseDTO>(`/nhan-su/${maNs}`, data);
    return response.data;
  },
  deleteNhanSu: async (maNs: string): Promise<void> => {
    await axiosClient.delete(`/nhan-su/${maNs}`);
  },
  getDanhSachNhomQuyen: async (): Promise<NhomResponseDTO[]> => {
    const response = await axiosClient.get<NhomResponseDTO[]>('/nhom');
    return response.data;
  },
  updateNhomQuyen: async (maNhom: string, data: NhomRequestDTO): Promise<NhomResponseDTO> => {
    const response = await axiosClient.put<NhomResponseDTO>(`/nhom/${maNhom}`, data);
    return response.data;
  },
  deleteNhomQuyen: async (maNhom: string): Promise<void> => {
    await axiosClient.delete(`/nhom/${maNhom}`);
  },
  getDanhSachLichLamViec: async (page = 0, size = 50): Promise<PageResponseDTO<LichLamViecResponseDTO>> => {
    const response = await axiosClient.get<PageResponseDTO<LichLamViecResponseDTO>>('/lich-lam-viec', {
      params: { page, size }
    });
    return response.data;
  },
  updateLichLamViec: async (maLlv: string, data: LichLamViecRequestDTO): Promise<LichLamViecResponseDTO> => {
    const response = await axiosClient.put<LichLamViecResponseDTO>(`/lich-lam-viec/${maLlv}`, data);
    return response.data;
  },
  deleteLichLamViec: async (maLlv: string): Promise<void> => {
    await axiosClient.delete(`/lich-lam-viec/${maLlv}`);
  },
  getDanhSachDichVuKham: async (page = 0, size = 50): Promise<PageResponseDTO<DichVuKhamResponse>> => {
    const response = await axiosClient.get<PageResponseDTO<DichVuKhamResponse>>('/dich-vu-kham', {
      params: { page, size }
    });
    return response.data;
  },
  updateDichVuKham: async (maDv: string, data: DichVuKhamRequest): Promise<DichVuKhamResponse> => {
    const response = await axiosClient.put<DichVuKhamResponse>(`/dich-vu-kham/${maDv}`, data);
    return response.data;
  },
  deleteDichVuKham: async (maDv: string): Promise<void> => {
    await axiosClient.delete(`/dich-vu-kham/${maDv}`);
  },
  createDichVuKham: async (data: DichVuKhamRequest): Promise<DichVuKhamResponse> => {
    const response = await axiosClient.post<DichVuKhamResponse>('/dich-vu-kham', data);
    return response.data;
  },
};