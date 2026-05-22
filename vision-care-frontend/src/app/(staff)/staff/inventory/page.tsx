"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, AlertTriangle, Truck, ClipboardList, 
  ArrowRight, ShieldAlert, Layers, Box, FileText 
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
// Sử dụng các hook đã có sẵn của m
import { 
  useDanhSachSanPham, 
  useCanhBaoTonKho, 
  useDanhSachNhaCungCap, 
  useDanhSachPhieuNhap 
} from "@/hooks/useInventory";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Thêm cục này vào dưới phần import
interface PageResponseDTO {
  content?: unknown[];
  data?: unknown[];
}

// 1. ROLE ĐƯỢC PHÉP TRUY CẬP (Thủ kho & Quản lý) - ROLE_THU_KHO, ROLE_ADMIN
const ALLOWED_ROLES = ["ROLE_THU_KHO", "ROLE_ADMIN", "NH03", "NH04"];

export default function InventoryOverviewPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Lấy data thực tế từ Backend
  const { data: dataSp } = useDanhSachSanPham();
  const { data: dataCanhBao } = useCanhBaoTonKho();
  const { data: dataNcc } = useDanhSachNhaCungCap();
  const { data: dataPn } = useDanhSachPhieuNhap();

  // Xử lý chống phân trang (Chuẩn TypeScript không xài any)
  const spList = Array.isArray(dataSp) ? dataSp : (dataSp as unknown as PageResponseDTO)?.content || [];
  const canhBaoList = Array.isArray(dataCanhBao) ? dataCanhBao : (dataCanhBao as unknown as PageResponseDTO)?.content || [];
  const nccList = Array.isArray(dataNcc) ? dataNcc : (dataNcc as unknown as PageResponseDTO)?.content || [];
  const pnList = Array.isArray(dataPn) ? dataPn : (dataPn as unknown as PageResponseDTO)?.content || [];

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

  // 🔥 RÀO CHẮN BẢO MẬT & HYDRATION
  if (!isMounted || loading) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-blue-600 font-medium">Đang kiểm tra quyền truy cập Kho...</div>;
  }

  if (!hasAccess()) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 m-6">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-800">Khu Vực Hạn Chế</h2>
        <p className="text-slate-500 mt-2 max-w-md text-center">
          Tài khoản <b>{user?.username}</b> không có quyền quản lý Kho Hàng.
        </p>
        <Button onClick={() => router.back()} className="mt-6 bg-slate-800 hover:bg-slate-900">Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/10 border border-blue-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md text-white rounded-2xl border border-white/20 shadow-inner">
              <Package className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Tổng Quan Kho Hàng</h1>
              <p className="text-blue-100/90 text-sm mt-1 flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                Thủ kho trực ca: <span className="font-bold text-white">{user?.hoTen || user?.username}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold">
             <span>Vision Care Clinic</span>
          </div>
        </div>
      </div>

      {/* STATS GRID (Dữ liệu thật) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Tổng Sản Phẩm" 
          value={spList.length.toString()} 
          icon={<Box className="w-6 h-6 text-blue-600" />} 
          bg="bg-blue-50 text-blue-600"
          description="Sản phẩm hiện hữu trong kho"
        />
        <StatsCard 
          title="Cảnh báo Tồn kho" 
          value={canhBaoList.length.toString()} 
          icon={<AlertTriangle className="w-6 h-6 text-amber-600" />} 
          bg="bg-amber-50 text-amber-600"
          alert={canhBaoList.length > 0}
          description={canhBaoList.length > 0 ? "Yêu cầu bổ sung hàng gấp" : "Kho hàng ở mức an toàn"}
        />
        <StatsCard 
          title="Nhà Cung Cấp" 
          value={nccList.length.toString()} 
          icon={<Truck className="w-6 h-6 text-emerald-600" />} 
          bg="bg-emerald-50 text-emerald-600"
          description="Đại lý & Đối tác liên kết"
        />
        <StatsCard 
          title="Phiếu Nhập (Tổng)" 
          value={pnList.length.toString()} 
          icon={<FileText className="w-6 h-6 text-violet-600" />} 
          bg="bg-violet-50 text-violet-600"
          description="Giao dịch nhập hàng đã tạo"
        />
      </div>

      {/* ĐIỀU HƯỚNG NHANH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Danh Mục Vật Tư */}
        <Card 
          className="hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/30 transition-all duration-300 border-t-4 border-t-blue-600 group cursor-pointer bg-white rounded-2xl relative overflow-hidden" 
          onClick={() => router.push('/staff/inventory/products')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Layers className="w-6 h-6" />
              </span>
            </div>
            <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors mt-4">
              Danh Mục Vật Tư
            </CardTitle>
            <CardDescription className="pt-2 text-slate-500 leading-relaxed text-sm">
              Quản lý danh sách kính, thuốc, vật tư tiêu hao. Định mức tồn kho và cảnh báo sản phẩm.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="flex items-center text-sm font-bold text-blue-600">
              Quản lý sản phẩm 
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Lịch Sử Nhập Kho */}
        <Card 
          className="hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all duration-300 border-t-4 border-t-emerald-600 group cursor-pointer bg-white rounded-2xl relative overflow-hidden" 
          onClick={() => router.push('/staff/inventory/imports')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <ClipboardList className="w-6 h-6" />
              </span>
            </div>
            <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors mt-4">
              Lịch Sử Nhập Kho
            </CardTitle>
            <CardDescription className="pt-2 text-slate-500 leading-relaxed text-sm">
              Lập phiếu nhập kho mới, kiểm tra chứng từ và các lô hàng đã nhập từ đối tác.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="flex items-center text-sm font-bold text-emerald-600">
              Xem phiếu nhập 
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Nhà Cung Cấp */}
        <Card 
          className="hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-500/30 transition-all duration-300 border-t-4 border-t-purple-600 group cursor-pointer bg-white rounded-2xl relative overflow-hidden" 
          onClick={() => router.push('/staff/inventory/suppliers')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <span className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-6 h-6" />
              </span>
            </div>
            <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors mt-4">
              Nhà Cung Cấp
            </CardTitle>
            <CardDescription className="pt-2 text-slate-500 leading-relaxed text-sm">
              Thông tin liên hệ các đại lý, hãng kính, hãng thuốc đối tác cung ứng vật tư.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="flex items-center text-sm font-bold text-purple-600">
              Tra cứu đối tác 
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

// --- SUB COMPONENT ---
function StatsCard({ title, value, icon, bg, alert, description }: { title: string, value: string, icon: React.ReactNode, bg: string, alert?: boolean, description?: string }) {
  return (
    <Card className="border border-slate-200/80 shadow-sm bg-white hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl ${bg} transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
          {alert && (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className={`text-3xl font-black mt-1 tracking-tight ${alert ? "text-red-600" : "text-slate-900"}`}>
            {value}
          </h3>
          {description && (
            <p className="text-xs text-slate-400 mt-1 font-medium">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}