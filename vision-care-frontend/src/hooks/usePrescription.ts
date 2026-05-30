import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { clinicApi } from "@/lib/api/clinic.api";
import { PhieuKeDonRequest } from "@/types/clinic";

export const useCreatePhieuKeDon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PhieuKeDonRequest) => clinicApi.createPhieuKeDon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xu-ly-kinh-can-xu-ly"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create prescription error:", error.response?.data || error.message);
    },
  });
};
