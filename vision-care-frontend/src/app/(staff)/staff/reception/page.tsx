"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarDays, Users, ShieldAlert, 
  ArrowRight, PhoneCall, Sparkles 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 1. KHAI BÁO CÁC ROLE ĐƯỢC PHÉP TRUY CẬP (Lễ tân & Quản lý)
const ALLOWED_ROLES = ["NH06", "NH04"];

export default function ReceptionOverviewPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // 2. KIỂM TRA QUYỀN TRUY CẬP
  const hasAccess = () => {
    if (!user) return false;
    const userRoles = user?.roles || [];
    const userGroup = user?.maNhom ? user.maNhom : null;
    return ALLOWED_ROLES.some(role => userRoles.includes(role) || role === userGroup);
  };

  // 3. RÀO CHẮN BẢO MẬT (CHỐNG HYDRATION ERROR + VƯỢT QUYỀN)
  if (!isMounted || loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-blue-600 font-medium">
        Đang kiểm tra quyền truy cập Lễ tân...
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 m-6">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-800">Khu Vực Lễ Tân</h2>
        <p className="text-slate-500 mt-2 max-w-md text-center">
          Tài khoản <b>{user?.username}</b> không có nghiệp vụ Lễ tân. Vui lòng quay lại khu vực làm việc của bạn!
        </p>
        <Button onClick={() => router.back()} className="mt-6 bg-slate-800 hover:bg-slate-900">
          Quay lại trang trước
        </Button>
      </div>
    );
  }

  // 4. GIAO DIỆN TỔNG QUAN LỄ TÂN
  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
            <PhoneCall className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quầy Lễ Tân & CSKH</h1>
            <p className="text-slate-500 text-sm mt-1">
              Ca làm việc của <span className="font-semibold text-indigo-600">{user?.hoTen || user?.username}</span>. Hãy đón tiếp khách hàng với một nụ cười nhé!
            </p>
          </div>
        </div>
      </div>

      {/* SHORTCUT CARDS (Điều hướng nhanh) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Quản lý Lịch hẹn */}
        <Card 
          className="hover:shadow-md transition-all border-l-4 border-l-blue-500 group cursor-pointer" 
          onClick={() => router.push('/staff/reception/appointments')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                Duyệt Lịch Hẹn
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <CardDescription className="pt-2">
              Xác nhận lịch đặt trước online, đặt lịch mới cho khách gọi điện hoặc khách đến trực tiếp (Walk-in).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-semibold text-blue-600">
              Mở bảng lịch hẹn <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Quản lý Khách hàng */}
        <Card 
          className="hover:shadow-md transition-all border-l-4 border-l-emerald-500 group cursor-pointer" 
          onClick={() => router.push('/staff/reception/customers')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">
                Hồ Sơ Khách Hàng
              </CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <CardDescription className="pt-2">
              Tra cứu thông tin khách hàng cũ, thêm hồ sơ bệnh nhân mới và quản lý điểm tích lũy thành viên.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-semibold text-emerald-600">
              Quản lý danh bạ <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* MẸO VẶT / THÔNG BÁO CHO LỄ TÂN */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4">
        <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-amber-800">Quy trình đón khách tiêu chuẩn</h3>
          <p className="text-sm text-amber-700 mt-1">
            1. Hỏi tên và số điện thoại để tra cứu lịch hẹn/hồ sơ.<br/>
            2. Nếu khách chưa có hồ sơ &rarr; Chuyển sang thẻ <b>Hồ sơ Khách hàng</b> để tạo mới.<br/>
            3. Nếu khách chưa đặt lịch &rarr; Chuyển sang thẻ <b>Duyệt Lịch Hẹn</b> để xếp slot khám ngay.
          </p>
        </div>
      </div>

    </div>
  );
}