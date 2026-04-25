import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '@/lib/api/staff.api';
import {
  LichHenFilterDTO,
  LichLamViecRequestDTO
} from "@/types/staff";

// ==========================================================
// 1. QUẢN LÝ LỊCH HẸN (Dành cho Lễ tân xem khách đặt lịch)
// ==========================================================

export const useDanhSachLichHen = (filters?: LichHenFilterDTO) => {
  return useQuery({
    // Đưa filters vào queryKey để khi đổi ngày/trạng thái, API tự động gọi lại
    queryKey: ['lich-hen', filters],
    queryFn: () => staffApi.getDanhSachLichHen(filters),
    // Tự động load lại sau mỗi 30s để Lễ tân cập nhật lịch mới nhất từ web khách hàng
    refetchInterval: 1000 * 30, 
  });
};

// ==========================================================
// 2. QUẢN LÝ LỊCH LÀM VIỆC (Dành cho Admin xếp ca cho Bác sĩ)
// ==========================================================

export const useCreateLichLamViec = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LichLamViecRequestDTO) => staffApi.createLichLamViec(data),
    onSuccess: () => {
      // Invalidate để tự động làm mới bảng danh sách ca làm việc (nếu ông có làm)
      queryClient.invalidateQueries({ queryKey: ['lich-lam-viec'] });
    },
  });
};