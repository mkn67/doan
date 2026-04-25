import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing.api";

// Các con số tổng quan (Tổng bệnh nhân, Tổng doanh thu...)
export const useThongKeTongQuan = () => {
  return useQuery({
    queryKey: ["thong-ke-tong-quan"],
    queryFn: billingApi.getThongKeTongQuan,
  });
};

// Biểu đồ doanh thu theo khoảng thời gian
export const useThongKeDoanhThuTheoNgay = (tuNgay?: string, denNgay?: string) => {
  return useQuery({
    // Nhét tuNgay và denNgay vào key để khi đổi ngày, nó tự gọi lại API
    queryKey: ["thong-ke-doanh-thu", tuNgay, denNgay],
    queryFn: () => billingApi.getThongKeDoanhThuTheoNgay(tuNgay, denNgay),
    enabled: !!tuNgay && !!denNgay, // Bắt buộc phải có ngày mới chạy API
  });
};