"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Stethoscope, Activity, FileText, 
  ShieldAlert, ArrowRight, Users, ClipboardList 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 1. KHAI BÁO CÁC ROLE ĐƯỢC PHÉP TRUY CẬP PHÂN HỆ NÀY
// ROLE_BAC_SI (NH01), ROLE_ADMIN (NH04), ROLE_LE_TAN (NH06)
const ALLOWED_ROLES = ["ROLE_BAC_SI", "ROLE_ADMIN", "ROLE_LE_TAN", "NH01", "NH04", "NH06"];

export default function ClinicOverviewPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // 2. KIỂM TRA QUYỀN TRUY CẬP THỰC TẾ
  const hasAccess = () => {
    if (!user) return false;
    
    // Xử lý linh hoạt cho cả dạng mảng (roles) và chuỗi đơn lẻ (maNhom)
    const userRoles = user?.roles || [];
    const userGroup = user?.maNhom ? user.maNhom : null;

    return ALLOWED_ROLES.some(role => userRoles.includes(role) || role === userGroup);
  };

  // 🔥 3. RÀO CHẮN BẢO MẬT (CHỐNG HYDRATION ERROR + CHỐNG VƯỢT QUYỀN)
  if (!isMounted || loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-blue-600 font-medium">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 m-6">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-800">Khu Vực Hạn Chế</h2>
        <p className="text-slate-500 mt-2 max-w-md text-center">
          Tài khoản <b>{user?.username}</b> của bạn không có quyền truy cập vào Phân hệ Khám bệnh. Vui lòng quay lại!
        </p>
        <Button onClick={() => router.back()} className="mt-6 bg-slate-800 hover:bg-slate-900">
          Quay lại trang trước
        </Button>
      </div>
    );
  }

  // 4. GIAO DIỆN CHÍNH CHO BÁC SĨ / LỄ TÂN
  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      
      {/* HEADER TỔNG QUAN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Phòng Khám Chuyên Khoa</h1>
            <p className="text-slate-500 text-sm mt-1">
              Xin chào, <span className="font-semibold text-blue-600">{user?.hoTen || user?.username}</span>! Chúc bạn một ngày làm việc hiệu quả.
            </p>
          </div>
        </div>
      </div>

      {/* CÁC CHỨC NĂNG CHÍNH (SHORTCUT CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Khám Bệnh Mới */}
        <Card className="hover:shadow-md transition-all border-l-4 border-l-blue-500 group cursor-pointer" onClick={() => router.push('/staff/clinic/examinations')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800 group-hover:text-blue-600 transition-colors">Đo Khúc Xạ & Khám</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <CardDescription className="pt-2">Lập hồ sơ khám mới, nhập chỉ số SPH, CYL, PD đo từ máy cho bệnh nhân.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-semibold text-blue-600">
              Mở phiên khám <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Kê Đơn Thuốc/Kính */}
        <Card className="hover:shadow-md transition-all border-l-4 border-l-emerald-500 group cursor-pointer" onClick={() => router.push('/staff/clinic/prescriptions')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">Kê Đơn Điều Trị</CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <CardDescription className="pt-2">Dựa vào hồ sơ khám để lên toa thuốc nhỏ mắt hoặc xuất phiếu cắt kính.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-semibold text-emerald-600">
              Lập phiếu xuất <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Danh sách chờ (Tính năng mở rộng sau này) */}
        <Card className="hover:shadow-md transition-all border-l-4 border-l-amber-500 group cursor-pointer" onClick={() => router.push('/staff/clinic/queue')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800 group-hover:text-amber-600 transition-colors">Hàng Chờ Hôm Nay</CardTitle>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <CardDescription className="pt-2">Xem danh sách bệnh nhân đang chờ tới lượt khám tại phòng của bạn.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-semibold text-amber-600">
              Xem danh sách chờ <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* THÔNG KÊ NHANH (UI DEMO MANG TÍNH CHẤT TRANG TRÍ HOẶC NỐI API SAU) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Users className="w-5 h-5" /></div>
          <div><p className="text-sm text-slate-500">Đã khám hôm nay</p><p className="text-xl font-bold text-slate-800">12 <span className="text-xs font-normal text-slate-400">ca</span></p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full"><ClipboardList className="w-5 h-5" /></div>
          <div><p className="text-sm text-slate-500">Đơn thuốc đã xuất</p><p className="text-xl font-bold text-slate-800">8 <span className="text-xs font-normal text-slate-400">toa</span></p></div>
        </div>
      </div>

    </div>
  );
}