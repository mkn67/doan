import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/lib/api/inventory.api";
import { 
  SanPhamRequest, 
  PhieuNhapRequest,
  NhaCungCapRequest,
  LoHangRequest
} from "@/types/inventory";

// ==========================================
// SẢN PHẨM & LÔ HÀNG
// ==========================================
export const useDanhSachSanPham = () => {
  return useQuery({
    queryKey: ["san-pham"],
    queryFn: inventoryApi.getSanPham,
  });
};

export const useCreateSanPham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SanPhamRequest) => inventoryApi.createSanPham(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["san-pham"] }),
  });
};

export const useCreateLoHang = () => {
  // Thường tạo lô hàng xong sẽ update lại danh sách sản phẩm (tồn kho)
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoHangRequest) => inventoryApi.createLoHang(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["san-pham"] }),
  });
};

// ==========================================
// PHIẾU NHẬP
// ==========================================
export const useDanhSachPhieuNhap = () => {
  return useQuery({
    queryKey: ["phieu-nhap"],
    queryFn: inventoryApi.getPhieuNhap,
  });
};

export const useCreatePhieuNhap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PhieuNhapRequest) => inventoryApi.createPhieuNhap(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phieu-nhap"] });
      queryClient.invalidateQueries({ queryKey: ["san-pham"] }); // Tự động update kho
    },
  });
};

// ==========================================
// NHÀ CUNG CẤP
// ==========================================
export const useDanhSachNhaCungCap = () => {
  return useQuery({
    queryKey: ["nha-cung-cap"],
    queryFn: inventoryApi.getNhaCungCap,
  });
};

export const useCreateNhaCungCap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NhaCungCapRequest) => inventoryApi.createNhaCungCap(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nha-cung-cap"] }),
  });
};

// ==========================================
// CẢNH BÁO
// ==========================================
export const useCanhBaoHetHan = () => {
  return useQuery({
    queryKey: ["canh-bao-het-han"],
    queryFn: inventoryApi.getCanhBaoHetHan,
    refetchInterval: 1000 * 60 * 60, // 1 tiếng check 1 lần
  });
};