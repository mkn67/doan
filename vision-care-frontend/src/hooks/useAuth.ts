 import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth.api";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";

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

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    }
    return null;
  });
  const [loading] = useState(false);

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