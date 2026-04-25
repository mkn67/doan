import { useMutation } from "@tanstack/react-query";
import { clinicApi } from "@/lib/api/clinic.api";
import { PhieuKeDonRequest } from "@/types/clinic";

export const useCreatePhieuKeDon = () => {
  return useMutation({
    mutationFn: (data: PhieuKeDonRequest) => clinicApi.createPhieuKeDon(data),
  });
};