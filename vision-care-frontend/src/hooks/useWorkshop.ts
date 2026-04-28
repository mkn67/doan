import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { staffApi } from "@/lib/api/staff.api";
import { XuLyKinhRequestDTO } from "@/types/staff";

export const useCreateXuLyKinh = () => {
  return useMutation({
    mutationFn: (data: XuLyKinhRequestDTO) =>
      staffApi.createPhieuXuLyKinh(data),
    onError: (error: AxiosError) => {
      console.error("Create glasses processing error:", error.response?.data || error.message);
    },
  });
};