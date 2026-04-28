import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { staffApi } from "@/lib/api/staff.api";
import { LichHenFilterDTO, LichLamViecRequestDTO } from "@/types/staff";

export const useDanhSachLichHen = (filters?: LichHenFilterDTO) => {
  return useQuery({
    queryKey: ["lich-hen", filters],
    queryFn: () => staffApi.getDanhSachLichHen(filters),
    refetchInterval: 30 * 1000,
  });
};

export const useCreateLichLamViec = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LichLamViecRequestDTO) => staffApi.createLichLamViec(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lich-lam-viec"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create work schedule error:", error.response?.data || error.message);
    },
  });
};
export const useSlotTrong = (ngay?: string) => {
  return useQuery({
    queryKey: ["slot-trong", ngay],
    queryFn: () => staffApi.getSlotTrong(ngay),
    enabled: !!ngay, // chỉ gọi khi có ngày
    staleTime: 2 * 60 * 1000,
  });
};