import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing.api";
import { 
  ThanhToanRequestDTO, 
  TaoHoaDonJsonRequest, 
  HoaDonRequestDTO 
} from "@/types/billing";

// Lấy danh sách hóa đơn chờ thanh toán
export const useDanhSachHoaDon = () => {
  return useQuery({
    queryKey: ["hoa-don"],
    queryFn: billingApi.getDanhSachHoaDon,
  });
};

// Thu ngân tạo hóa đơn
export const useCreateHoaDon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HoaDonRequestDTO) => billingApi.createHoaDon(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hoa-don"] }),
  });
};

// Tạo hóa đơn bằng chuỗi JSON
export const useCreateHoaDonJson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaoHoaDonJsonRequest) => billingApi.createHoaDonJson(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hoa-don"] }),
  });
};

// Xử lý thanh toán
export const useThanhToan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ThanhToanRequestDTO) => billingApi.thanhToan(data),
    onSuccess: () => {
      // Thanh toán xong thì load lại danh sách hóa đơn
      queryClient.invalidateQueries({ queryKey: ["hoa-don"] });
      // Đồng thời báo cho thằng Báo cáo (Report) biết để nó update cục tiền trên Dashboard
      queryClient.invalidateQueries({ queryKey: ["thong-ke-tong-quan"] }); 
    },
  });
};