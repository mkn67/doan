import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth.api";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // 🕵️ KIỂM TRA TẠI ĐÂY: 
      // Phải lưu TOÀN BỘ object data (bao gồm token, username, loaiTk, maNhom, roles)
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);

      // Thông báo thành công và chuyển trang
      alert("Đăng nhập thành công!");
      router.push("/staff");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      alert(error.response?.data?.message || "Sai tên đăng nhập hoặc mật khẩu");
    }
  });
};