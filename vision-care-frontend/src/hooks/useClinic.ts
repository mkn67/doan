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