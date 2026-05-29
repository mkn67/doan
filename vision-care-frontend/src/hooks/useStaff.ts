import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { staffApi } from "@/lib/api/staff.api";
import {
  HangChoRequestDTO,
  NhanSuRequestDTO,
  NhomRequestDTO,
  LichHenFilterDTO,
  LichLamViecRequestDTO,
} from "@/types/staff";
import {
  DichVuKhamRequest,
  DichVuKhamResponse,
} from "@/types/clinic";

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
// Thêm đoạn này vào cuối file hooks/useStaff.ts
export const useDanhSachLichHen = (filters?: LichHenFilterDTO) => {
  return useQuery({
    queryKey: ["lich-hen", filters],
    queryFn: () => staffApi.getDanhSachLichHen(filters), // Đảm bảo staffApi đã có hàm này
    refetchInterval: 30 * 1000,
  });
};

export const useSlotTrong = (ngay?: string, maNs?: string) => {
  return useQuery({
    queryKey: ["slot-trong", ngay, maNs],
    queryFn: () => staffApi.getSlotTrong(ngay, maNs),
    enabled: !!ngay, 
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpdateTrangThaiLichHen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { maLh: string | number; trangThai: string }) => {
      // Nếu trạng thái truyền vào là xác nhận thì gọi confirm, ngược lại gọi hủy
      if (data.trangThai === "DA_XAC_NHAN") {
        return staffApi.confirmLichHen(data.maLh);
      } else {
        return staffApi.huyLichHen(data.maLh);
      }
    },
    onSuccess: () => {
      // Bấm xong cái là cái bảng tự fetch lại dữ liệu mới ngay
      queryClient.invalidateQueries({ queryKey: ["lich-hen"] });
    },
    onError: (error: AxiosError) => {
      console.error("Lỗi cập nhật lịch hẹn:", error.response?.data || error.message);
    }, 
  });
};

export const useCheckInLichHen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (maLh: string | number) => staffApi.checkInLichHen(maLh),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lich-hen"] });
      queryClient.invalidateQueries({ queryKey: ["hang-cho"] });
      queryClient.invalidateQueries({ queryKey: ["hang-cho-hom-nay"] });
    },
    onError: (error: AxiosError) => {
      console.error("Lỗi check-in lịch hẹn:", error.response?.data || error.message);
    },
  });
};

// --- STAFF CRUD HOOKS ---
export const useUpdateNhanSu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ maNs, data }: { maNs: string; data: NhanSuRequestDTO }) => staffApi.updateNhanSu(maNs, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danh-sach-nhan-su"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Update staff error:", error.response?.data || error.message);
    },
  });
};

export const useDeleteNhanSu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (maNs: string) => staffApi.deleteNhanSu(maNs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danh-sach-nhan-su"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Delete staff error:", error.response?.data || error.message);
    },
  });
};

// --- ROLE GROUPS HOOKS ---
export const useDanhSachNhomQuyen = () => {
  return useQuery({
    queryKey: ["nhom-quyen"],
    queryFn: () => staffApi.getDanhSachNhomQuyen(),
  });
};

export const useUpdateNhomQuyen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ maNhom, data }: { maNhom: string; data: NhomRequestDTO }) => staffApi.updateNhomQuyen(maNhom, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhom-quyen"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Update role group error:", error.response?.data || error.message);
    },
  });
};

export const useDeleteNhomQuyen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (maNhom: string) => staffApi.deleteNhomQuyen(maNhom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhom-quyen"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Delete role group error:", error.response?.data || error.message);
    },
  });
};

// --- SCHEDULES HOOKS ---
export const useDanhSachLichLamViec = (page = 0, size = 50) => {
  return useQuery({
    queryKey: ["lich-lam-viec", page, size],
    queryFn: () => staffApi.getDanhSachLichLamViec(page, size),
  });
};

export const useCreateLichLamViec = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LichLamViecRequestDTO) => staffApi.createLichLamViec(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lich-lam-viec"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Create schedule error:", error.response?.data || error.message);
    },
  });
};

export const useUpdateLichLamViec = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ maLlv, data }: { maLlv: string; data: LichLamViecRequestDTO }) => staffApi.updateLichLamViec(maLlv, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lich-lam-viec"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Update schedule error:", error.response?.data || error.message);
    },
  });
};

export const useDeleteLichLamViec = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (maLlv: string) => staffApi.deleteLichLamViec(maLlv),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lich-lam-viec"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Delete schedule error:", error.response?.data || error.message);
    },
  });
};

// --- CLINICAL SERVICES HOOKS ---
export const useDanhSachDichVuKham = (page = 0, size = 50) => {
  return useQuery({
    queryKey: ["danh-sach-dich-vu-kham", page, size],
    queryFn: () => staffApi.getDanhSachDichVuKham(page, size),
  });
};

export const useCreateDichVuKham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DichVuKhamRequest) => staffApi.createDichVuKham(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danh-sach-dich-vu-kham"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Create service error:", error.response?.data || error.message);
    },
  });
};

export const useUpdateDichVuKham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ maDv, data }: { maDv: string; data: DichVuKhamRequest }) => staffApi.updateDichVuKham(maDv, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danh-sach-dich-vu-kham"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Update service error:", error.response?.data || error.message);
    },
  });
};

export const useDeleteDichVuKham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (maDv: string) => staffApi.deleteDichVuKham(maDv),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danh-sach-dich-vu-kham"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Delete service error:", error.response?.data || error.message);
    },
  });
};