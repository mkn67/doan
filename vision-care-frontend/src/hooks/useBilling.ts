import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { billingApi } from "@/lib/api/billing.api";
import {
  ThanhToanRequestDTO,
  TaoHoaDonJsonRequest,
  HoaDonRequestDTO,
} from "@/types/billing";

export const useDanhSachHoaDon = () => {
  return useQuery({
    queryKey: ["hoa-don"],
    queryFn: () => billingApi.getDanhSachHoaDon(),
    staleTime: 60 * 1000,
  });
};

export const useCreateHoaDon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HoaDonRequestDTO) => billingApi.createHoaDon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hoa-don"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create invoice error:", error.response?.data || error.message);
    },
  });
};

export const useCreateHoaDonJson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaoHoaDonJsonRequest) =>
      billingApi.createHoaDonJson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hoa-don"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create JSON invoice error:", error.response?.data || error.message);
    },
  });
};

export const useThanhToan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ThanhToanRequestDTO) => billingApi.thanhToan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hoa-don"] });
      queryClient.invalidateQueries({ queryKey: ["thong-ke-tong-quan"] });
    },
    onError: (error: AxiosError) => {
      console.error("Payment error:", error.response?.data || error.message);
    },
  });
};