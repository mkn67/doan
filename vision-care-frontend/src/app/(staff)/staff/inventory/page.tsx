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

// 1. ROLE ĐƯỢC PHÉP TRUY CẬP (Thủ kho & Quản lý)
const ALLOWED_ROLES = ["NH03", "NH04"];

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
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng Quan Kho Hàng</h1>
            <p className="text-slate-500 text-sm mt-1">
              Thủ kho: <span className="font-semibold text-blue-600">{user?.hoTen || user?.username}</span>
            </p>
          </div>
        </div>
      </div>

      {/* STATS GRID (Dữ liệu thật) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Tổng Sản Phẩm" 
          value={spList.length.toString()} 
          icon={<Box className="w-6 h-6 text-blue-600" />} 
          bg="bg-blue-50"
        />
        <StatsCard 
          title="Cảnh báo Tồn kho" 
          value={canhBaoList.length.toString()} 
          icon={<AlertTriangle className="w-6 h-6 text-orange-600" />} 
          bg="bg-orange-50"
          alert={canhBaoList.length > 0}
        />
        <StatsCard 
          title="Nhà Cung Cấp" 
          value={nccList.length.toString()} 
          icon={<Truck className="w-6 h-6 text-emerald-600" />} 
          bg="bg-emerald-50"
        />
        <StatsCard 
          title="Phiếu Nhập (Tổng)" 
          value={pnList.length.toString()} 
          icon={<FileText className="w-6 h-6 text-purple-600" />} 
          bg="bg-purple-50"
        />
      </div>

      {/* ĐIỀU HƯỚNG NHANH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-all border-l-4 border-l-blue-500 group cursor-pointer" onClick={() => router.push('/staff/inventory/products')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800 group-hover:text-blue-600 transition-colors">Danh Mục Vật Tư</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Layers className="w-5 h-5" /></div>
            </div>
            <CardDescription className="pt-2">Quản lý danh sách kính, thuốc, vật tư tiêu hao. Định mức tồn kho.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-semibold text-blue-600">
              Quản lý sản phẩm <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-l-4 border-l-emerald-500 group cursor-pointer" onClick={() => router.push('/staff/inventory/imports')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">Lịch Sử Nhập Kho</CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500"><ClipboardList className="w-5 h-5" /></div>
            </div>
            <CardDescription className="pt-2">Lập phiếu nhập kho mới, kiểm tra các lô hàng đã nhập từ đối tác.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-semibold text-emerald-600">
              Xem phiếu nhập <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-l-4 border-l-purple-500 group cursor-pointer" onClick={() => router.push('/staff/inventory/suppliers')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800 group-hover:text-purple-600 transition-colors">Nhà Cung Cấp</CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-500"><Truck className="w-5 h-5" /></div>
            </div>
            <CardDescription className="pt-2">Thông tin liên hệ các đại lý, hãng kính, hãng thuốc đối tác.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-semibold text-purple-600">
              Tra cứu đối tác <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

// --- SUB COMPONENT ---
function StatsCard({ title, value, icon, bg, alert }: { title: string, value: string, icon: React.ReactNode, bg: string, alert?: boolean }) {
  return (
    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden relative">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl ${bg}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className={`text-2xl font-bold mt-1 ${alert ? "text-orange-600 animate-pulse" : "text-slate-900"}`}>
              {value}
            </h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}