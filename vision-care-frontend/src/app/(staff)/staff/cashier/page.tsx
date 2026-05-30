"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Receipt, Banknote, ArrowRight, ShieldAlert, 
  Wallet, Activity, Clock
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useThongKeTongQuan } from "@/hooks/useReport"; // Đảm bảo đúng đường dẫn hook

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ROLE_THU_NGAN (NH02), ROLE_ADMIN (NH04)
const ALLOWED_ROLES = ["ROLE_THU_NGAN", "ROLE_ADMIN", "NH02", "NH04"]; 

export default function CashierOverviewPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Gọi hook Thống kê m đã viết
  const { data: stats } = useThongKeTongQuan();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const hasAccess = () => {
    if (!user) return false;
    const userRoles = user?.roles || [];
    const userGroup = user?.maNhom ? user.maNhom : null;
    return ALLOWED_ROLES.some(role => userRoles.includes(role) || role === userGroup);
  };

  // RÀO CHẮN BẢO MẬT
  if (!isMounted || loading) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-emerald-600 font-medium">Đang mở quầy thu ngân...</div>;
  }

  if (!hasAccess()) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 m-6">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-800">Khu Vực Quản Lý Tài Chính</h2>
        <p className="text-slate-500 mt-2 max-w-md text-center">
          Tài khoản <b>{user?.username}</b> không có nghiệp vụ Thu Ngân. Vui lòng quay lại!
        </p>
        <Button onClick={() => router.back()} className="mt-6 bg-slate-800 hover:bg-slate-900">Quay lại trang trước</Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quầy Thu Ngân (Cashier)</h1>
            <p className="text-slate-500 text-sm mt-1">
              Ca làm việc của <span className="font-semibold text-emerald-600">{user?.hoTen || user?.username}</span>. Chúc một ngày làm việc chính xác!
            </p>
          </div>
        </div>
        <Button 
          onClick={() => router.push('/staff/cashier/payments')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
        >
          <Banknote className="w-4 h-4 mr-2" /> Xem danh sách hóa đơn
        </Button>
      </div>

      {/* THỐNG KÊ NHANH (Lấy từ API Thống kê tổng quan) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 rounded-lg"><Activity className="w-6 h-6 text-white" /></div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-emerald-100">Tổng doanh thu hệ thống</p>
              <h3 className="text-3xl font-bold mt-1">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.tongDoanhThu || 0)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-100 rounded-lg"><Clock className="w-6 h-6 text-amber-600" /></div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">Tổng số hóa đơn</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats?.tongSoHoaDon || 0} <span className="text-lg text-slate-400 font-normal">Hóa đơn</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg"><Receipt className="w-6 h-6 text-blue-600" /></div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">Tổng số đơn thuốc</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats?.tongSoDonThuoc || 0} <span className="text-lg text-slate-400 font-normal">Đơn</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ĐIỀU HƯỚNG NHANH */}
      <h2 className="text-lg font-bold text-slate-800 pt-4">Nghiệp vụ Thu Ngân</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Lập Hóa Đơn */}
        <Card 
          className="hover:shadow-md transition-all border-l-4 border-l-blue-500 group cursor-pointer" 
          onClick={() => router.push('/staff/cashier/billing')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                Lập Hóa Đơn (Billing)
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <CardDescription className="pt-2">
              Khởi tạo hóa đơn thanh toán từ Mã khách hàng, Hồ sơ thị lực, hoặc Phiếu kê đơn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-semibold text-blue-600">
              Mở trang lập hóa đơn <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Thu Tiền */}
        <Card 
          className="hover:shadow-md transition-all border-l-4 border-l-emerald-500 group cursor-pointer" 
          onClick={() => router.push('/staff/cashier/payments')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">
                Thanh Toán (Payments)
              </CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                <Banknote className="w-5 h-5" />
              </div>
            </div>
            <CardDescription className="pt-2">
              Xử lý thu tiền, quẹt thẻ, chuyển khoản cho các hóa đơn đang ở trạng thái chờ thanh toán.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-semibold text-emerald-600">
              Mở quầy thu tiền <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}