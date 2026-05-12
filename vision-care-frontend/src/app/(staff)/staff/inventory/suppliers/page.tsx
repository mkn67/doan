"use client";

import "@/app/globals.css";
// Hook giả định để lấy danh sách phiếu nhập
import { useDanhSachPhieuNhap } from "@/hooks/useInventory";
import { PhieuNhapResponse } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus, Calendar, FileText, User, Truck } from "lucide-react";

export default function ImportsPage() {
  const { data } = useDanhSachPhieuNhap();
  const importList = Array.isArray(data) ? data : data?.content || [];

  // Format ngày tháng chuẩn Việt Nam
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lịch sử Nhập kho</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý và tra cứu các phiếu nhập hàng từ nhà cung cấp.</p>
          </div>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2 h-10">
          <Plus className="w-4 h-4" /> Lập phiếu nhập mới
        </Button>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="py-4 px-6 font-semibold"><div className="flex items-center gap-2"><FileText className="w-4 h-4"/>Mã phiếu</div></th>
              <th className="py-4 px-6 font-semibold"><div className="flex items-center gap-2"><Calendar className="w-4 h-4"/>Ngày nhập</div></th>
              <th className="py-4 px-6 font-semibold"><div className="flex items-center gap-2"><Truck className="w-4 h-4"/>Nhà cung cấp</div></th>
              <th className="py-4 px-6 font-semibold"><div className="flex items-center gap-2"><User className="w-4 h-4"/>Người lập</div></th>
              <th className="py-4 px-6 font-semibold text-right">Tổng lô hàng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {importList.length > 0 ? importList.map((pn: PhieuNhapResponse) => (
              <tr key={pn.maPn} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                <td className="py-4 px-6 font-bold text-indigo-600">{pn.maPn}</td>
                <td className="py-4 px-6 text-slate-600 font-medium">{formatDate(pn.ngayNhap)}</td>
                <td className="py-4 px-6 text-slate-700">{pn.tenNcc}</td>
                <td className="py-4 px-6 text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                    {pn.tenNhanVien}
                  </span>
                </td>
                <td className="py-4 px-6 text-right font-semibold text-slate-800">
                  {pn.tongTien?.toLocaleString("vi-VN")} đ
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-16 text-center text-slate-500">
                  <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  Chưa có lịch sử nhập kho nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}