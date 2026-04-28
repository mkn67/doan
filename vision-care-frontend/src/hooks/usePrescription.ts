import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { clinicApi } from "@/lib/api/clinic.api";
import { PhieuKeDonRequest } from "@/types/clinic";

export const useCreatePhieuKeDon = () => {
  return useMutation({
    mutationFn: (data: PhieuKeDonRequest) => clinicApi.createPhieuKeDon(data),
    onError: (error: AxiosError) => {
      console.error("Create prescription error:", error.response?.data || error.message);
    },
  });
};