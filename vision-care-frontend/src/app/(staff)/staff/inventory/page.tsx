"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, AlertTriangle, Truck, ClipboardList, 
  ArrowRight, ShieldAlert, Layers, Box, FileText,
  Clock, AlertCircle, Calendar
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
// Sử dụng các hook đã có sẵn của m
import { 
  useDanhSachSanPham, 
  useCanhBaoTonKho, 
  useDanhSachNhaCungCap, 
  useDanhSachPhieuNhap,
  useCanhBaoHetHan
} from "@/hooks/useInventory";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Thêm cục này vào dưới phần import
interface PageResponseDTO {
  content?: unknown[];
  data?: unknown[];
}

interface CanhBaoHetHan {
  maLo: string;
  maSp: string;
  tenSp: string;
  donViTinh: string;
  ngayHetHan: string;
  soNgayConLai: number;
  tonKho: number;
  mucDo: string;
  nhaCungCap: string;
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
  const { data: dataHetHan } = useCanhBaoHetHan();

  // Xử lý chống phân trang (Chuẩn TypeScript không xài any)
  const spList = Array.isArray(dataSp) ? dataSp : (dataSp as unknown as PageResponseDTO)?.content || [];
  const canhBaoList = Array.isArray(dataCanhBao) ? dataCanhBao : (dataCanhBao as unknown as PageResponseDTO)?.content || [];
  const nccList = Array.isArray(dataNcc) ? dataNcc : (dataNcc as unknown as PageResponseDTO)?.content || [];
  const pnList = Array.isArray(dataPn) ? dataPn : (dataPn as unknown as PageResponseDTO)?.content || [];
  const hetHanList: CanhBaoHetHan[] = Array.isArray(dataHetHan) ? dataHetHan : [];

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          title="Phiếu Nhập (Tổng)" 
          value={pnList.length.toString()} 
          icon={<FileText className="w-6 h-6 text-violet-600" />} 
          bg="bg-violet-50 text-violet-600"
          description="Giao dịch nhập hàng đã tạo"
        />
      </div>

      {/* ĐIỀU HƯỚNG NHANH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      {/* BẢNG CẢNH BÁO VẬN HÀNH KHO (FEFO & TỒN KHO) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FEFO Hết Hạn Lô Hàng */}
        <Card className="shadow-md border-slate-200/80 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-slate-800">
                  <Clock className="w-5 h-5 text-rose-500 animate-pulse" />
                  Cảnh Báo Hạn Dùng Lô Hàng (FEFO)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">
                  Ưu tiên xuất kho các lô hàng cận hạn dùng theo nguyên tắc First Expired, First Out.
                </CardDescription>
              </div>
              {hetHanList.length > 0 && (
                <span className="px-2.5 py-1 bg-rose-500 text-white text-[11px] font-black rounded-full animate-bounce">
                  {hetHanList.length} lô cận hạn
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {hetHanList.length > 0 ? (
              hetHanList.map((item, idx) => {
                let badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
                let iconClass = "text-blue-500 bg-blue-50";
                if (item.soNgayConLai <= 15) {
                  badgeClass = "bg-rose-50 text-rose-700 border-rose-200 animate-pulse";
                  iconClass = "text-rose-500 bg-rose-50";
                } else if (item.soNgayConLai <= 30) {
                  badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                  iconClass = "text-amber-500 bg-amber-50";
                }

                return (
                  <div key={item.maLo || idx} className="flex gap-4 p-5 hover:bg-slate-50 transition-colors">
                    <div className={`p-3 rounded-xl flex-shrink-0 self-start ${iconClass}`}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800 truncate">{item.tenSp}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Mã lô: <span className="font-mono font-bold text-slate-600">{item.maLo}</span> • SP: {item.maSp}
                          </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border flex-shrink-0 ${badgeClass}`}>
                          {item.soNgayConLai <= 0 ? "Đã hết hạn" : `Còn ${item.soNgayConLai} ngày`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          HSD: <span className="font-bold text-slate-700">{item.ngayHetHan}</span>
                        </span>
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          Tồn: <span className="text-rose-600 font-extrabold">{item.tonKho}</span> {item.donViTinh || "cái"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                  <Layers className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-slate-800">Không có lô hàng cận hạn dùng</p>
                <p className="text-xs text-slate-400 mt-1">Toàn bộ lô hàng trong kho đều có thời hạn sử dụng an toàn.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cảnh Báo Tồn Kho Thấp */}
        <Card className="shadow-md border-slate-200/80 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-slate-800">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Cảnh Báo Tồn Kho Thấp (Định Mức)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">
                  Danh sách sản phẩm có số lượng tồn kho giảm dưới ngưỡng tối thiểu an toàn.
                </CardDescription>
              </div>
              {canhBaoList.length > 0 && (
                <span className="px-2.5 py-1 bg-amber-500 text-white text-[11px] font-black rounded-full">
                  {canhBaoList.length} mặt hàng
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {canhBaoList.length > 0 ? (
              canhBaoList.map((item: any, idx: number) => {
                const isOutOfStock = item.tongTon <= 0;
                return (
                  <div key={item.maSp || idx} className="flex gap-4 p-5 hover:bg-slate-50 transition-colors">
                    <div className={`p-3 rounded-xl flex-shrink-0 self-start ${isOutOfStock ? "text-red-500 bg-red-50" : "text-amber-500 bg-amber-50"}`}>
                      <Box className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800 truncate">{item.tenSp}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Mã SP: <span className="font-mono font-bold text-slate-600">{item.maSp}</span>
                          </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${isOutOfStock ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                          {isOutOfStock ? "Hết hàng" : "Tồn kho thấp"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <span className="text-slate-500">
                          Ngưỡng tối thiểu: <span className="font-bold">{item.tonKhoToiThieu}</span>
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded ${isOutOfStock ? "text-red-700 bg-red-50" : "text-slate-800 bg-slate-100"}`}>
                          Tồn hiện tại: <span className={`font-extrabold ${isOutOfStock ? "text-red-600" : "text-amber-600"}`}>{item.tongTon}</span> {item.donViTinh || "cái"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                  <Package className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-slate-800">Tồn kho ở mức an toàn</p>
                <p className="text-xs text-slate-400 mt-1">Không có sản phẩm nào có số lượng dưới ngưỡng tối thiểu.</p>
              </div>
            )}
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