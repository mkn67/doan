"use client";

import "@/app/globals.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, AlertTriangle, User, Stethoscope, 
  Calendar, Clock, Check, Sparkles, LogIn, ArrowRight 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDatLich, useBacSi, useGoiKham } from "@/hooks/useClinic"; 

export default function BookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { mutateAsync, isPending } = useDatLich();
  
  // Lấy data từ Backend
  const { data: listBacSi, isLoading: loadingBs } = useBacSi(); 
  const { data: listGoiKham, isLoading: loadingGoi } = useGoiKham();

  const [maNs, setMaNs] = useState("");
  const [maGoi, setMaGoi] = useState("");
  const [ngayHen, setNgayHen] = useState("");
  const [gioHen, setGioHen] = useState("");

  const isKhachHang = !!user?.maKh;

  const handleSubmit = async () => {
    if (!isKhachHang) {
      alert("Vui lòng đăng nhập bằng tài khoản khách hàng để đặt lịch!");
      router.push("/auth/login");
      return;
    }

    if (!maNs || !maGoi || !ngayHen || !gioHen) {
      alert("Vui lòng chọn đầy đủ thông tin!");
      return;
    }

    try {
      const gioHenFull = `${ngayHen}T${gioHen}:00`;
      await mutateAsync({
        maKh: user?.maKh || "",
        maNs,
        maGoi,
        ngayHen,
        gioHen: gioHenFull,
      });
      alert("Đặt lịch thành công!");
    } catch {
      alert("Đặt lịch thất bại!");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "BS";
    const parts = name.trim().split(" ");
    return parts.pop()?.substring(0, 2).toUpperCase() || "BS";
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Blur Circles */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-300/15 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse duration-5000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-300/15 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse duration-7000" style={{ animationDelay: "2s" }}></div>

      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-6 md:p-10 space-y-8 border border-white/60 relative">
        
        {/* Banner Decor Header */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 rounded-t-[2.5rem]"></div>

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Đặt Lịch Khám Mắt
                <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
              </h2>
              <p className="text-sm font-medium text-slate-400">Chọn lịch, bác sĩ chuyên môn và gói dịch vụ mong muốn</p>
            </div>
          </div>
          {isKhachHang && (
            <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-2 max-w-fit">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              Khách hàng: <span className="text-slate-800 font-bold">{user?.hoTen || user?.username}</span>
            </div>
          )}
        </div>

        {/* Warning if not logged in */}
        {!isKhachHang && (
          <div className="flex items-start gap-4 text-amber-900 bg-amber-50/50 border border-amber-200/60 p-5 rounded-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm space-y-2">
              <p className="font-bold text-amber-950">Yêu cầu tài khoản khách hàng</p>
              <p className="text-amber-800 font-medium">Bạn cần đăng nhập tài khoản khách hàng để có thể hoàn tất quy trình đặt lịch và đồng bộ hồ sơ bệnh án.</p>
              <Button 
                onClick={() => router.push("/auth/login")} 
                className="mt-2 font-bold bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 px-4 rounded-xl gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4" /> Đăng nhập ngay
              </Button>
            </div>
          </div>
        )}

        <div className={`space-y-8 ${!isKhachHang ? "opacity-60 pointer-events-none select-none" : ""}`}>
          
          {/* STEP 1: CHỌN BÁC SĨ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 font-bold rounded-lg text-xs">1</span>
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4.5 h-4.5 text-slate-400" /> Bác sĩ phụ trách
              </label>
            </div>

            {loadingBs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 animate-pulse h-20"></div>
                ))}
              </div>
            ) : listBacSi && listBacSi.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {listBacSi.map((bs: { maNs: string; hoTen: string; chuyenKhoa: string }) => {
                  const isSelected = maNs === bs.maNs;
                  return (
                    <div
                      key={bs.maNs}
                      onClick={() => isKhachHang && setMaNs(bs.maNs)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 relative overflow-hidden group ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/40 text-blue-800 shadow-md shadow-blue-500/5"
                          : "border-slate-100 bg-white hover:border-slate-300/80 hover:bg-slate-50/30"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl font-bold flex items-center justify-center text-sm transition-all duration-300 ${
                        isSelected 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                          : "bg-blue-50 text-blue-600 group-hover:scale-105"
                      }`}>
                        {getInitials(bs.hoTen)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">Bs. {bs.hoTen}</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{bs.chuyenKhoa || "Khám khúc xạ chung"}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute right-3 top-3 text-blue-600 animate-in zoom-in duration-200">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-xl border border-dashed">
                Không tìm thấy bác sĩ nào khả dụng.
              </div>
            )}
          </div>

          {/* STEP 2: CHỌN GÓI KHÁM */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 bg-indigo-100 text-indigo-600 font-bold rounded-lg text-xs">2</span>
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4.5 h-4.5 text-slate-400" /> Gói khám dịch vụ
              </label>
            </div>

            {loadingGoi ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 animate-pulse h-20"></div>
                ))}
              </div>
            ) : listGoiKham && listGoiKham.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {listGoiKham.map((goi: { maGoi: string; tenGoi: string; gia: number }) => {
                  const isSelected = maGoi === goi.maGoi;
                  return (
                    <div
                      key={goi.maGoi}
                      onClick={() => isKhachHang && setMaGoi(goi.maGoi)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/40 text-indigo-800 shadow-md shadow-indigo-500/5"
                          : "border-slate-100 bg-white hover:border-slate-300/80 hover:bg-slate-50/30"
                      }`}
                    >
                      <div className="pr-6">
                        <p className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">{goi.tenGoi}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Vision Checkup</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100/60 pt-2 mt-1">
                        <span className="text-[11px] text-slate-400 font-semibold">Chi phí trọn gói</span>
                        <span className="font-extrabold text-indigo-600 text-sm">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(goi.gia)}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute right-3 top-3 text-indigo-600 animate-in zoom-in duration-200">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-xl border border-dashed">
                Không tìm thấy gói khám nào khả dụng.
              </div>
            )}
          </div>

          {/* STEP 3: CHỌN THỜI GIAN KHÁM */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 bg-violet-100 text-violet-600 font-bold rounded-lg text-xs">3</span>
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Thời gian hẹn khám</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ngày */}
              <div className="space-y-1.5">
                <label htmlFor="ngayHen" className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> Ngày khám <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    id="ngayHen"
                    type="date"
                    disabled={!isKhachHang}
                    min={new Date().toISOString().split('T')[0]} // Chặn chọn ngày trong quá khứ
                    value={ngayHen}
                    onChange={(e) => setNgayHen(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold text-slate-800 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Giờ */}
              <div className="space-y-1.5">
                <label htmlFor="gioHen" className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" /> Giờ hẹn khám <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    id="gioHen"
                    type="time"
                    disabled={!isKhachHang}
                    value={gioHen}
                    onChange={(e) => setGioHen(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold text-slate-800 text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Button Section */}
        <div className="border-t border-slate-100 pt-6">
          <Button
            onClick={handleSubmit}
            disabled={isPending || (isKhachHang && (!maNs || !maGoi || !ngayHen || !gioHen))}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none gap-2"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Đang gửi yêu cầu...
              </div>
            ) : !isKhachHang ? (
              <>
                Đăng nhập để đặt lịch <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Xác nhận đặt lịch khám <Check className="w-5 h-5 stroke-[2.5]" />
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}