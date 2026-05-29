 import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth.api";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { ForgotPasswordRequestDTO, ProfileUpdateRequestDTO } from "@/types/auth";

export interface AuthUser {
  // ---- THÔNG TIN CHUNG ----
  username?: string;
  hoTen?: string;
  sdt?: string;
  email?: string;
  cccd?: string;
  gioiTinh?: string;
  ngaySinh?: string;
  diaChi?: string;

  // ---- DÀNH CHO KHÁCH HÀNG ----
  maKh?: string;
  diemTichLuy?: number;

  // ---- 🔥 DÀNH CHO STAFF / PHÂN QUYỀN (THÊM VÀO ĐÂY) 🔥 ----
  loaiTk?: string;   // "INTERNAL" (Nhân viên) hoặc "EXTERNAL" (Khách)
  maNhom?: string;   // VD: "NH04"
  roles?: string[];  // VD: ["ROLE_NH04"]
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequestDTO) => authApi.forgotPassword(data),
    onSuccess: () => {
      alert("✅ Khôi phục mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể khôi phục mật khẩu."));
    }
  });
};

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: () => authApi.getProfile(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileUpdateRequestDTO) => authApi.updateProfile(data),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      // Cập nhật thông tin hoTen trong localStorage user object
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.hoTen = updatedData.hoTen;
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch (e) {}
      }
      alert("✅ Cập nhật thông tin cá nhân thành công!");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật thông tin."));
    }
  });
};

export const useAuth = () => {
  // Initial state is `undefined` so server and initial client render match.
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && !parsed.maKh && parsed.loaiTk === "EXTERNAL" && parsed.username?.toLowerCase().startsWith("kh")) {
            parsed.maKh = parsed.username.toUpperCase();
          }
          setUser(parsed);
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  return { user, setUser, loading };
};

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);

      alert("Đăng nhập thành công!");
      router.push("/staff");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      alert(error.response?.data?.message || "Sai tên đăng nhập hoặc mật khẩu");
    }
  });
}; 