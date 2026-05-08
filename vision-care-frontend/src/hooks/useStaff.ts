import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { staffApi } from "@/lib/api/staff.api";
import {
  HangChoRequestDTO,
  NhanSuRequestDTO,
  NhomRequestDTO,
} from "@/types/staff";

export const useDanhSachHangCho = () => {
  return useQuery({
    queryKey: ["hang-cho"],
    queryFn: () => staffApi.getDanhSachHangCho(),
    refetchInterval: 15 * 1000,
  });
};

export const useThemVaoHangCho = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HangChoRequestDTO) => staffApi.themVaoHangCho(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hang-cho"] });
    },
    onError: (error: AxiosError) => {
      console.error("Add to waiting list error:", error.response?.data || error.message);
    },
  });
};

export const useDanhSachNhanSu = (page = 0, size = 10, keyword = "") => {
  return useQuery({
    queryKey: ["danh-sach-nhan-su", page, size, keyword],
    queryFn: async () => {
      return staffApi.getDanhSachNhanSu(page, size, keyword);
    },
  });
};

export const useCreateNhanSu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NhanSuRequestDTO) => staffApi.createNhanSu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danh-sach-nhan-su"] });
      alert("Thêm nhân sự và cấp tài khoản thành công!");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Create staff error:", error.response?.data || error.message);
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    },
  });
};

export const useDanhSachChucVu = () => {
  return useQuery({
    queryKey: ["chuc-vu"],
    queryFn: () => staffApi.getDanhSachChucVu(),
    staleTime: 60 * 60 * 1000,
  });
};

export const useCreateNhomQuyen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NhomRequestDTO) => staffApi.createNhomQuyen(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhom-quyen"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create role group error:", error.response?.data || error.message);
    },
  });
};
export const useHangChoHomNay = () => {
  return useQuery({
    queryKey: ["hang-cho-hom-nay"],
    queryFn: () => staffApi.getHangChoHomNay(),
    refetchInterval: 15 * 1000, // tự động cập nhật mỗi 15s
  });
};

export const useLichHenTrieuChung = () => {
  return useQuery({
    queryKey: ["lich-hen-trieu-chung"],
    queryFn: () => staffApi.getLichHenTrieuChung(),
    staleTime: 60 * 1000,
  });
};