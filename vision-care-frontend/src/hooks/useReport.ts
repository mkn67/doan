import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing.api";

export const useThongKeTongQuan = () => {
  return useQuery({
    queryKey: ["thong-ke-tong-quan"],
    queryFn: () => billingApi.getThongKeTongQuan(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook lấy doanh thu theo khoảng ngày (date-range format YYYY-MM-DD).
 * Luôn gửi format có dấu "-" để backend route sang SP_THONG_KE_DOANH_THU_THEO_NGAY
 * (tránh SP_THONG_KE_DOANH_THU_THANG đang bị INVALID trên Oracle).
 */
export const useThongKeDoanhThuTheoNgay = (tuNgay?: string, denNgay?: string) => {
  return useQuery({
    queryKey: ["thong-ke-doanh-thu", tuNgay, denNgay],
    queryFn: () => billingApi.getThongKeDoanhThuTheoNgay(tuNgay, denNgay),
    enabled: !!tuNgay && !!denNgay,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook lấy doanh thu CẢ THÁNG (dùng date-range format).
 * Tính ngày đầu tháng → ngày cuối tháng → gửi dạng YYYY-MM-DD.
 * Backend nhận thấy có dấu "-" → gọi SP_THONG_KE_DOANH_THU_THEO_NGAY (hoạt động tốt).
 */
export const useDoanhThuThang = (thang: number, nam: number) => {
  // Ngày đầu tháng
  const tuNgay = `${nam}-${String(thang).padStart(2, "0")}-01`;
  // Ngày cuối tháng
  const lastDay = new Date(nam, thang, 0).getDate();
  const denNgay = `${nam}-${String(thang).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return useQuery({
    queryKey: ["doanh-thu-thang", thang, nam],
    queryFn: () => billingApi.getThongKeDoanhThuTheoNgay(tuNgay, denNgay),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook lấy doanh thu TRONG NGÀY HÔM NAY.
 * Truyền tuNgay="YYYY-MM-DD"&denNgay="YYYY-MM-DD" (cùng ngày)
 * → Backend gọi SP_THONG_KE_DOANH_THU_THEO_NGAY.
 */
export const useDoanhThuHomNay = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  return useQuery({
    queryKey: ["doanh-thu-hom-nay", todayStr],
    queryFn: () => billingApi.getThongKeDoanhThuTheoNgay(todayStr, todayStr),
    staleTime: 2 * 60 * 1000,
  });
};