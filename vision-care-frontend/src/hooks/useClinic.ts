import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { clinicApi } from "@/lib/api/clinic.api";
import {
  HoSoKhamRequest,
  DichVuKhamRequest,
  GoiKhamRequest,
  DatLichRequest, 
  DatLichResponse,
} from "@/types/clinic";

export const useDanhSachDichVu = () => {
  return useQuery({
    queryKey: ["dich-vu-kham"],
    queryFn: () => clinicApi.getDichVu(),
    staleTime: 10 * 60 * 1000,
  });
};

// Thêm vào file @/hooks/useClinic.ts
export const useBacSi = () => {
  return useQuery({
    queryKey: ["bacSiList"],
    queryFn: async () => {
      // Gọi đúng cái API chuc-vu/CV06 (Bác sĩ) mà m vừa code lúc nãy
      const res = await fetch("http://localhost:8080/api/v1/nhan-su/chuc-vu/CV06");
      if (!res.ok) throw new Error("Lỗi fetch bác sĩ");
      return res.json();
    },
  });
};

export const useGoiKham = () => {
  return useQuery({
    queryKey: ["goiKhamList"],
    queryFn: async () => {
      // Giả định API m tạo bên Backend
      const res = await fetch("http://localhost:8080/api/v1/goi-kham/active");
      if (!res.ok) throw new Error("Lỗi fetch gói khám");
      return res.json();
    },
  });
};
export const useCreateDichVu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DichVuKhamRequest) => clinicApi.createDichVu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dich-vu-kham"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create service error:", error.response?.data || error.message);
    },
  });
};

export const useCreateGoiKham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GoiKhamRequest) => clinicApi.createGoiKham(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goi-kham"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create package error:", error.response?.data || error.message);
    },
  });
};

export const useHoSoKham = (maHoSo: string) => {
  return useQuery({
    queryKey: ["ho-so-kham", maHoSo],
    queryFn: () => clinicApi.getHoSoKham(maHoSo),
    enabled: !!maHoSo,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateHoSoKham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HoSoKhamRequest) => clinicApi.createHoSoKham(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ho-so-kham"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create medical record error:", error.response?.data || error.message);
    },
  });
};

export const useDatLich = () => {
  return useMutation({
    mutationFn: (data: DatLichRequest) => clinicApi.datLich(data),

    onSuccess: (data: DatLichResponse) => {
      console.log("Đặt lịch OK:", data);
    },

    onError: (error: AxiosError) => {
      console.error(
        "Booking error:",
        error.response?.data || error.message
      );
    },
  });
};
export const useGoiVaoKham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (maHc: string) => clinicApi.goiVaoKham(maHc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hang-cho"] });
      queryClient.invalidateQueries({ queryKey: ["hang-cho-hom-nay"] });
    },
    onError: (error: AxiosError) => {
      console.error("Goi vao kham error:", error.response?.data || error.message);
    },
  });
};

export const useKetThucKham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ maHc, trangThai }: { maHc: string; trangThai: 'Hoàn thành' | 'Bỏ về' }) => 
      clinicApi.ketThucKham(maHc, trangThai),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hang-cho"] });
      queryClient.invalidateQueries({ queryKey: ["hang-cho-hom-nay"] });
    },
    onError: (error: AxiosError) => {
      console.error("Ket thuc kham error:", error.response?.data || error.message);
    },
  });
};
export const useHangChoHomNay = (maNs?: string) => {
  return useQuery({
    queryKey: ["hang-cho-hom-nay", maNs],
    queryFn: () => clinicApi.getHangChoHomNay(maNs),
    refetchInterval: 30000, // Tự động load lại sau 30s
  });
};