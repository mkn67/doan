"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, User, Phone, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useForgotPassword } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const mutation = useForgotPassword();

  const [username, setUsername] = useState("");
  const [sdt, setSdt] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !sdt.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      alert("Vui lòng điền đầy đủ các trường thông tin!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Xác nhận mật khẩu mới không khớp!");
      return;
    }

    mutation.mutate(
      { username, sdt, newPassword },
      {
        onSuccess: () => {
          router.push("/auth/login");
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-12 text-white sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">Khôi phục mật khẩu</h2>
          <p className="mt-2 text-sm text-slate-400">
            Nhập thông tin tài khoản đã đăng ký để cài đặt lại mật khẩu mới.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tên đăng nhập</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <Input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11 bg-slate-950/45 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-0 rounded-xl"
                  placeholder="Nhập tên đăng nhập của bạn..."
                />
              </div>
            </div>

            {/* SDT */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Số điện thoại đăng ký</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-slate-500" />
                </div>
                <Input
                  type="tel"
                  required
                  value={sdt}
                  onChange={(e) => setSdt(e.target.value)}
                  className="pl-10 h-11 bg-slate-950/45 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-0 rounded-xl"
                  placeholder="Nhập số điện thoại của bạn..."
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mật khẩu mới</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10 h-11 bg-slate-950/45 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-0 rounded-xl"
                  placeholder="Nhập mật khẩu mới..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Xác nhận mật khẩu</label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 h-11 bg-slate-950/45 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-0 rounded-xl"
                  placeholder="Xác nhận mật khẩu mới..."
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              {mutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Xác nhận thay đổi
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-center pt-4 border-t border-slate-700/50">
          <button
            onClick={() => router.push("/auth/login")}
            className="flex items-center text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
