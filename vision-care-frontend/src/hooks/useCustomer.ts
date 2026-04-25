import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/lib/api/customer.api";
import {
  KhachHangRequestDTO,
  KhachHangFilterDTO,
  DatLichRequestDTO,
} from "@/types/customer";

export const useDanhSachKhachHang = (filters?: KhachHangFilterDTO) => {
  return useQuery({
    // queryKey: Là cái tên định danh trong bộ nhớ tạm (Cache).
    // Nhét thêm filters vào đây để khi filters đổi, nó tự gọi lại API!
    queryKey: ["danh-sach-khach-hang", filters],
    queryFn: () => customerApi.getDanhSachKhachHang(filters),
    // Optional: Nếu muốn data tự làm mới sau 5 phút
    // staleTime: 5 * 60 * 1000,
  });
};

export const useCreateKhachHang = () => {
  const queryClient = useQueryClient(); // Dùng cái này để "búng tay" reset cache

  return useMutation({
    mutationFn: (data: KhachHangRequestDTO) =>
      customerApi.createKhachHang(data),
    onSuccess: () => {
      // TUYỆT CHIÊU: Sau khi thêm khách hàng thành công, báo React Query xóa cache cũ đi
      // để bảng danh sách tự động gọi lại API và hiện khách hàng mới lên!
      queryClient.invalidateQueries({ queryKey: ["danh-sach-khach-hang"] });
    },
  });
};

export const useDatLichKham = () => {
  // Đặt lịch thì không cần invalidate list khách hàng, chỉ cần trả về kết quả
  return useMutation({
    mutationFn: (data: DatLichRequestDTO) => customerApi.datLichKham(data),
  });
};
