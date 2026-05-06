import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing.api";

export const useThongKeTongQuan = () => {
  return useQuery({
    queryKey: ["thong-ke-tong-quan"],
    queryFn: () => billingApi.getThongKeTongQuan(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useThongKeDoanhThuTheoNgay = (tuNgay?: string, denNgay?: string) => {
  return useQuery({
    queryKey: ["thong-ke-doanh-thu", tuNgay, denNgay],
    queryFn: () => billingApi.getThongKeDoanhThuTheoNgay(tuNgay, denNgay),
    enabled: !!tuNgay && !!denNgay,
    staleTime: 5 * 60 * 1000,
  });
};