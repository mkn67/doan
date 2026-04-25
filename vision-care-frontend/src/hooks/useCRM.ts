import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicApi } from "@/lib/api/clinic.api";
import { DanhGiaRequest } from "@/types/clinic";

export const useCreateDanhGia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Lưu ý: API Đánh giá hiện đang nằm chung nhà với clinicApi
    mutationFn: (data: DanhGiaRequest) => clinicApi.createDanhGia(data),
    onSuccess: () => {
      // Nếu có màn hình danh sách đánh giá thì invalidate nó để reload
      queryClient.invalidateQueries({ queryKey: ["danh-gia"] });
    },
  });
};