
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { inventoryApi } from "@/lib/api/inventory.api";
import {
  SanPhamRequest,
  PhieuNhapRequest,
  NhaCungCapRequest,
  LoHangRequest,
} from "@/types/inventory";

export const useDanhSachSanPham = () => {
  return useQuery({
    queryKey: ["san-pham"],
    queryFn: () => inventoryApi.getSanPham(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSanPham = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SanPhamRequest) => inventoryApi.createSanPham(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["san-pham"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create product error:", error.response?.data || error.message);
    },
  });
};

export const useDeleteSanPham = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.deleteSanPham,
    onSuccess: () => {
      alert("Đã tiễn sản phẩm đi bụi thành công! 🚀");
      queryClient.invalidateQueries({ queryKey: ["san-pham"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      alert(error.response?.data?.message || "Xóa thất bại! Có thể sản phẩm đang nằm trong hóa đơn.");
    }
  });
};

export const useCreateLoHang = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoHangRequest) => inventoryApi.createLoHang(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["san-pham"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create batch error:", error.response?.data || error.message);
    },
  });
};

export const useDanhSachPhieuNhap = () => {
  return useQuery({
    queryKey: ['phieu-nhap'],
    queryFn: () => inventoryApi.getPhieuNhap(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePhieuNhap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PhieuNhapRequest) => inventoryApi.createPhieuNhap(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phieu-nhap"] });
      queryClient.invalidateQueries({ queryKey: ["san-pham"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create import voucher error:", error.response?.data || error.message);
    },
  });
};

export const useDanhSachNhaCungCap = () => {
  return useQuery({
    queryKey: ["nha-cung-cap"],
    queryFn: () => inventoryApi.getNhaCungCap(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useCreateNhaCungCap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NhaCungCapRequest) => inventoryApi.createNhaCungCap(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nha-cung-cap"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create supplier error:", error.response?.data || error.message);
    },
  });
};
export const useDeleteNhaCungCap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.deleteNhaCungCap,
    onSuccess: () => {
      alert("Đã xóa nhà cung cấp thành công! 🗑️")
        queryClient.invalidateQueries({ queryKey: ["nha-cung-cap"] })
        },
    onError: (error: AxiosError<{ message?: string }>) => {
      alert(error.response?.data?.message || "Xóa thất bại! Có thể nhà cung cấp đang nằm trong phiếu nhập.");
    }
  });
};

export const useCanhBaoHetHan = () => {
  return useQuery({
    queryKey: ["canh-bao-het-han"],
    queryFn: () => inventoryApi.getCanhBaoHetHan(),
    refetchInterval: 60 * 60 * 1000,
  });
};
export const useCanhBaoTonKho = () => {
  return useQuery({
    queryKey: ["canh-bao-ton-kho"],
    queryFn: () => inventoryApi.getCanhBaoTonKho(),
    staleTime: 5 * 60 * 1000,
  });
};