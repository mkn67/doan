import axiosClient from '../axios';
import {
  HoaDonRequestDTO,
  ThanhToanRequestDTO,
  TaoHoaDonJsonRequest,
  HoaDonResponseDTO,
  ThanhToanResponseDTO,
  DoanhThuResponseDTO,
  ThongKeDoanhThuTheoNgayDTO,
  ThongKeTongQuanDTO
} from '@/types/billing'; // DTO lấy từ file types/billing.ts

export const billingApi = {
  // ==========================================
  // PHÂN HỆ THU NGÂN (CASHIER)
  // ==========================================

  // 1. Tạo hóa đơn (Cách 1: Gửi Object mảng chuẩn)
  createHoaDon: async (data: HoaDonRequestDTO): Promise<HoaDonResponseDTO> => {
    const response = await axiosClient.post<HoaDonResponseDTO>('/hoa-don', data);
    return response.data;
  },

  // 2. Tạo hóa đơn (Cách 2: Đẩy JSON String - Dùng khi Controller Java yêu cầu String)
  createHoaDonJson: async (data: TaoHoaDonJsonRequest): Promise<HoaDonResponseDTO> => {
    const response = await axiosClient.post<HoaDonResponseDTO>('/hoa-don/json', data);
    return response.data;
  },

  // 3. Lấy danh sách hóa đơn (Để thu ngân chọn và thanh toán)
  getDanhSachHoaDon: async (): Promise<HoaDonResponseDTO[]> => {
    // Ông giáo có thể thêm params phân trang nếu Backend có hỗ trợ nhé
    const response = await axiosClient.get<HoaDonResponseDTO[]>('/hoa-don');
    return response.data;
  },

  // 4. Thanh toán
  thanhToan: async (data: ThanhToanRequestDTO): Promise<ThanhToanResponseDTO> => {
    const response = await axiosClient.post<ThanhToanResponseDTO>('/thanh-toan', data);
    return response.data;
  },

  // ==========================================
  // PHÂN HỆ BÁO CÁO & THỐNG KÊ (DASHBOARD)
  // ==========================================

  // 5. Thống kê tổng quan (Các con số to đùng trên cùng Dashboard)
  getThongKeTongQuan: async (): Promise<ThongKeTongQuanDTO> => {
    const response = await axiosClient.get<ThongKeTongQuanDTO>('/report/tong-quan');
    return response.data;
  },

  // 6. Thống kê doanh thu theo ngày (Dùng để vẽ Biểu đồ đường/cột)
  // Tớ thiết kế sẵn params tuNgay/denNgay để đệ tử ông truyền date picker vào
  getThongKeDoanhThuTheoNgay: async (tuNgay?: string, denNgay?: string): Promise<ThongKeDoanhThuTheoNgayDTO[]> => {
    const response = await axiosClient.get<ThongKeDoanhThuTheoNgayDTO[]>('/report/doanh-thu-theo-ngay', {
      params: {
        tuNgay,
        denNgay
      }
    });
    return response.data;
  },

  // 7. Chi tiết danh sách doanh thu (Dạng bảng)
  getChiTietDoanhThu: async (tuNgay?: string, denNgay?: string): Promise<DoanhThuResponseDTO[]> => {
    const response = await axiosClient.get<DoanhThuResponseDTO[]>('/report/chi-tiet-doanh-thu', {
      params: {
        tuNgay,
        denNgay
      }
    });
    return response.data;
  }
};