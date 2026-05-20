"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "@/app/globals.css";

// Hook kết nối Backend thực tế của hệ thống
import { useDanhSachPhieuNhap } from "@/hooks/useInventory";
import { PhieuNhapResponse } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, Plus, Calendar, FileText, 
  User, Truck, PackageCheck, TrendingUp, CreditCard 
} from "lucide-react";

// Cấu trúc DTO phòng ngừa phân trang của Spring Boot
interface PageResponseDTO {
  content?: PhieuNhapResponse[];
  data?: PhieuNhapResponse[];
}

export default function ImportsPage() {
  const router = useRouter();
  const { data, isLoading } = useDanhSachPhieuNhap();

  // Xử lý chuẩn hóa mảng dữ liệu chống crash lỗi phân trang từ Server
  const importList: PhieuNhapResponse[] = Array.isArray(data)
    ? data
    : ((data as unknown as PageResponseDTO)?.content as PhieuNhapResponse[]) || [];

  // Hàm tiện ích chuyển đổi định dạng ngày tháng chuẩn Việt Nam
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Tính toán các chỉ số thống kê từ nguồn dữ liệu thực tế
  const totalImports = importList.length;
  const totalValue = importList.reduce(
    (sum: number, item: PhieuNhapResponse) => sum + (item.tongTien || 0),
    0
  );
  const latestImport = importList[0]?.ngayNhap 
    ? formatDate(importList[0].ngayNhap) 
    : "N/A";

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      
      {/* HEADER SECTION - ĐẦU TRANG */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Lịch sử Nhập kho
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Quản lý, tra cứu chứng từ và kiểm tra thời hạn sử dụng các lô hàng.
            </p>
          </div>
        </div>
        <Button 
          onClick={() => router.push("/staff/inventory/imports/create")}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2 h-10 px-5 font-semibold transition-all text-white rounded-xl"
        >
          <Plus className="w-4 h-4" /> Lập phiếu nhập mới
        </Button>
      </div>

      {/* STATS BOXES - THẺ THỐNG KÊ TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng số phiếu</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalImports}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng giá trị nhập</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">
              {totalValue.toLocaleString("vi-VN")} đ
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Lần nhập gần nhất</p>
            <p className="text-base font-bold text-slate-800 mt-1">{latestImport}</p>
          </div>
        </div>
      </div>

      {/* DATA TABLE SECTION - BẢNG HIỂN THỊ DỮ LIỆU VẬT LÝ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-sm">
                <th className="py-4 px-6 font-semibold">
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400"/>Mã phiếu</div>
                </th>
                <th className="py-4 px-6 font-semibold">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400"/>Ngày nhập</div>
                </th>
                <th className="py-4 px-6 font-semibold">
                  <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-slate-400"/>Nhà cung cấp</div>
                </th>
                <th className="py-4 px-6 font-semibold">
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400"/>Người lập</div>
                </th>
                <th className="py-4 px-6 font-semibold text-right">Tổng tiền hàng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-medium">
                    Đang truy vấn lịch sử dữ liệu nhập kho...
                  </td>
                </tr>
              ) : importList.length > 0 ? (
                importList.map((pn: PhieuNhapResponse) => (
                  <tr 
                    key={pn.maPn} 
                    onClick={() => router.push(`/staff/inventory/imports/${pn.maPn}`)}
                    className="hover:bg-indigo-50/20 transition-colors cursor-pointer group"
                    title="Click để xem chi tiết các lô hàng"
                  >
                    <td className="py-4 px-6 font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      {pn.maPn}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {formatDate(pn.ngayNhap)}
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {pn.tenNcc || "Chưa cập nhật"}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
                        {pn.tenNhanVien || "Thủ kho"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-800 text-base">
                      {pn.tongTien?.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList className="w-12 h-12 text-slate-200 mb-3" />
                      <p className="text-base font-semibold text-slate-600">Chưa có lịch sử nhập kho nào</p>
                      <p className="text-sm text-slate-400 mt-0.5">Dữ liệu hóa đơn mua hàng sẽ xuất hiện tại đây.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}