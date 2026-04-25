import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/lib/api/staff.api";
import {
  HangChoRequestDTO,
  NhanSuRequestDTO,
  NhomRequestDTO
} from "@/types/staff";

// ==========================================================
// QUẢN LÝ HÀNG CHỜ (Màn hình Lễ tân)
// ==========================================================

export const useDanhSachHangCho = () => {
  return useQuery({
    queryKey: ["hang-cho"],
    queryFn: staffApi.getDanhSachHangCho,
    refetchInterval: 1000 * 15, // Cứ 15 giây tự động reload bảng hàng chờ
  });
};

export const useThemVaoHangCho = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HangChoRequestDTO) => staffApi.themVaoHangCho(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hang-cho"] }),
  });
};

// ==========================================================
// QUẢN LÝ NHÂN SỰ & CHỨC VỤ (Màn hình Admin)
// ==========================================================

export const useCreateNhanSu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NhanSuRequestDTO) => staffApi.createNhanSu(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nhan-su"] }),
  });
};

export const useDanhSachChucVu = () => {
  return useQuery({
    queryKey: ["chuc-vu"],
    queryFn: staffApi.getDanhSachChucVu,
  });
};

export const useCreateNhomQuyen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NhomRequestDTO) => staffApi.createNhomQuyen(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nhom-quyen"] }),
  });
};