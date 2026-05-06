import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { clinicApi } from "@/lib/api/clinic.api";
import { DanhGiaRequest } from "@/types/clinic";

export const useCreateDanhGia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DanhGiaRequest) => clinicApi.createDanhGia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danh-gia"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create review error:", error.response?.data || error.message);
    },
  });
};