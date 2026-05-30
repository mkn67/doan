import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { staffApi } from "@/lib/api/staff.api";
import { XuLyKinhRequestDTO } from "@/types/staff";

export const useCreateXuLyKinh = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: XuLyKinhRequestDTO) =>
      staffApi.createPhieuXuLyKinh(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xu-ly-kinh-can-xu-ly"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create glasses processing error:", error.response?.data || error.message);
    },
  });
};

export const useXuLyKinhCanXuLy = () => {
  return useQuery({
    queryKey: ["xu-ly-kinh-can-xu-ly"],
    queryFn: () => staffApi.getXuLyKinhCanXuLy(),
    refetchInterval: 15000, // Tự động làm mới sau 15 giây
  });
};

export const useBatDauXuLyKinh = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ maXl, maKyThuat }: { maXl: string; maKyThuat: string }) =>
      staffApi.batDauXuLyKinh(maXl, maKyThuat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xu-ly-kinh-can-xu-ly"] });
    },
    onError: (error: AxiosError) => {
      console.error("Start glasses processing error:", error.response?.data || error.message);
    },
  });
};

export const useHoanThanhXuLyKinh = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (maXl: string) => staffApi.hoanThanhXuLyKinh(maXl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xu-ly-kinh-can-xu-ly"] });
    },
    onError: (error: AxiosError) => {
      console.error("Complete glasses processing error:", error.response?.data || error.message);
    },
  });
};

export const useHuyXuLyKinh = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ maXl, lyDo }: { maXl: string; lyDo?: string }) =>
      staffApi.huyXuLyKinh(maXl, lyDo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xu-ly-kinh-can-xu-ly"] });
    },
    onError: (error: AxiosError) => {
      console.error("Cancel glasses processing error:", error.response?.data || error.message);
    },
  });
};

export const useUpdateTrangThaiXuLyKinh = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ maXl, trangThai }: { maXl: string; trangThai: string }) =>
      staffApi.updateTrangThaiXuLyKinh(maXl, trangThai),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xu-ly-kinh-can-xu-ly"] });
    },
    onError: (error: AxiosError) => {
      console.error("Update glasses status error:", error.response?.data || error.message);
    },
  });
};