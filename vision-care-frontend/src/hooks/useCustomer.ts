import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { customerApi } from "@/lib/api/customer.api";
import {
  KhachHangRequestDTO,
  KhachHangFilterDTO,
  DatLichRequestDTO,
  KhachHangResponseDTO,
} from "@/types/customer";

export const useDanhSachKhachHang = (filters?: KhachHangFilterDTO) => {
  return useQuery({
    queryKey: ["danh-sach-khach-hang", filters],
    queryFn: () => customerApi.getDanhSachKhachHang(filters),
    staleTime: 2 * 60 * 1000,
  });
};

// ========== THÊM HOOK CẬP NHẬT KHÁCH HÀNG ==========
export const useUpdateKhachHang = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ maKh, data }: { maKh: string; data: Partial<KhachHangRequestDTO> }) =>
      customerApi.updateKhachHang(maKh, data),
    onSuccess: (updatedData, variables) => {
      // Invalidate các query liên quan
      queryClient.invalidateQueries({ queryKey: ["danh-sach-khach-hang"] });
      queryClient.invalidateQueries({ queryKey: ["khach-hang", variables.maKh] });
    },
    onError: (error: AxiosError) => {
      console.error("Update customer error:", error.response?.data || error.message);
    },
  });
};
export const useCreateKhachHang = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KhachHangRequestDTO) => customerApi.createKhachHang(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danh-sach-khach-hang"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create customer error:", error.response?.data || error.message);
    },
  });
};

export const useDatLichKham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DatLichRequestDTO) => {
      const payload = {
        ...data,
        // Ép Object Date thành chuỗi "yyyy-MM-dd" và "yyyy-MM-dd'T'HH:mm:ss"
        ngayHen: format(new Date(data.ngayHen), "yyyy-MM-dd"),
        gioHen: format(new Date(data.gioHen), "yyyy-MM-dd'T'HH:mm:ss"),
      };
      return customerApi.datLichKham(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lich-hen"] });
    },
    onError: (error: AxiosError) => {
      console.error("Booking error:", error.response?.data || error.message);
    },
  });
};