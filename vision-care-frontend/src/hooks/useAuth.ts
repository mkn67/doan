import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth.api";
import {
  LoginRequestDTO,
  ForgotPasswordRequestDTO,
  ChangePasswordRequestDTO,
} from "@/types/auth";

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequestDTO) => authApi.login(data),
    onSuccess: (data) => {
      // Lưu token hoặc thông tin user vào cache nếu cần
      queryClient.setQueryData(["user"], data?.username);
    },
    onError: (error: string) => {
      console.error("Login failed:", error);
      // Bạn có thể gọi toast.error ở đây hoặc để component xử lý
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequestDTO) =>
      authApi.forgotPassword(data),
    onError: (error: string) => console.error("Forgot password error:", error),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequestDTO) =>
      authApi.changePassword(data),
    onError: (error: string) => console.error("Change password error:", error),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.(),
    onSuccess: () => {
      // Xoá toàn bộ cache khi logout
      queryClient.clear();
    },
    onError: (error: string) => console.error("Logout error:", error),
  });
};

export const useDanhSachVaiTro = () => {
  return useQuery({
    queryKey: ["vai-tro"],
    queryFn: () => authApi.getDanhSachVaiTro(),
    staleTime: 5 * 60 * 1000, // 5 phút
    onError: (error: string) => console.error("Fetch roles error:", error),
  });
};