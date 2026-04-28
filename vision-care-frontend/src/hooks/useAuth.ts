import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
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
      queryClient.setQueryData(["user"], data?.username);
    },
    onError: (error: AxiosError) => {
      console.error("Login error:", error.response?.data || error.message);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequestDTO) =>
      authApi.forgotPassword(data),
    onError: (error: AxiosError) => {
      console.error("Forgot password error:", error.response?.data || error.message);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequestDTO) =>
      authApi.changePassword(data),
    onError: (error: AxiosError) => {
      console.error("Change password error:", error.response?.data || error.message);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error: AxiosError) => {
      console.error("Logout error:", error.response?.data || error.message);
    },
  });
};

export const useDanhSachVaiTro = () => {
  return useQuery({
    queryKey: ["vai-tro"],
    queryFn: () => authApi.getDanhSachVaiTro(),
    staleTime: 5 * 60 * 1000,
  });
};