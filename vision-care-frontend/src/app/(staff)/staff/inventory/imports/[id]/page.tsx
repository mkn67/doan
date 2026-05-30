"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "@/app/globals.css";

import { usePhieuNhapChiTiet } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, FileText, Calendar, Truck, User, 
  CreditCard, Package, Layers, Clock, Printer,
  AlertTriangle, CheckCircle, HelpCircle
} from "lucide-react";

export default function ImportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: maPn } = React.use(params);
  const { data: pn, isLoading, error } = usePhieuNhapChiTiet(maPn);

  const formatDate = (dateStr?: string) => {
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

  const formatSimpleDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-semibold mt-4 animate-pulse">Đang tải chi tiết phiếu nhập...</p>
      </div>
    );
  }

  if (error || !pn) {
    return (
      <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy phiếu nhập!</h1>
        <p className="text-slate-500 mt-2 max-w-md">Phiếu nhập kho này có thể không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
        <Button 
          onClick={() => router.push("/staff/inventory/imports")} 
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const loHangList = pn.loHangList || [];
  const totalValue = pn.tongTien || 0;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gradient-to-tr from-slate-50 to-indigo-50/20 min-h-[calc(100vh-4rem)] animate-fade-in print:bg-white print:p-0">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/staff/inventory/imports")}
            className="h-10 w-10 border-slate-200 hover:border-slate-300 hover:bg-white bg-white/80 backdrop-blur shadow-sm rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Chi tiết phiếu nhập kho
              </h1>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">
                {pn.maPn}
              </span>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                Hoàn thành
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Tra cứu thông tin lô hàng nhập và thời hạn sử dụng sản phẩm.
            </p>
          </div>
        </div>

        <Button 
          onClick={handlePrint}
          variant="outline"
          className="border-slate-200 hover:border-slate-300 bg-white shadow-sm gap-2 h-10 px-4 font-bold text-slate-700 rounded-xl"
        >
          <Printer className="w-4.5 h-4.5" /> In phiếu nhập
        </Button>
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block space-y-4 border-b pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">PHÒNG KHÁM PHỤ SẢN VISION CARE</h1>
            <p className="text-sm text-slate-500 mt-1">Địa chỉ: 123 Đường Ba Tháng Hai, Quận 10, TP. Hồ Chí Minh</p>
            <p className="text-sm text-slate-500">Điện thoại: (028) 3838 3838</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-slate-800">PHIẾU NHẬP KHO HOÀN CHỈNH</h2>
            <p className="text-base font-extrabold text-indigo-600 mt-1">{pn.maPn}</p>
          </div>
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: METADATA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl border border-slate-200 shadow-md space-y-6 print:border-none print:shadow-none print:p-0">
            <h2 className="text-base font-bold text-slate-800 border-b pb-3 flex items-center gap-2 print:border-slate-100">
              <FileText className="w-5 h-5 text-indigo-600" /> Thông tin chứng từ
            </h2>

            <div className="grid grid-cols-1 gap-5">
              {/* Creation Time */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời gian nhập kho</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{formatDate(pn.ngayNhap)}</p>
                </div>
              </div>

              {/* Supplier */}
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nhà cung cấp đối tác</p>
                  <p className="text-sm font-bold text-indigo-600 mt-1">{pn.tenNcc || "Chưa cập nhật"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Mã số: {pn.maNcc}</p>
                </div>
              </div>

              {/* Creator */}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Người thực hiện</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{pn.tenNhanVien || "Thủ kho"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Mã nhân sự: {pn.maNs}</p>
                </div>
              </div>

              {/* Total value */}
              <div className="pt-5 border-t border-slate-100 flex items-start gap-3 print:border-slate-200">
                <CreditCard className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div className="w-full">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng giá trị đơn nhập</p>
                  <p className="text-2xl font-extrabold text-indigo-600 mt-1.5">
                    {totalValue.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 print:hidden">
              <Button
                variant="outline"
                onClick={() => router.push("/staff/inventory/imports")}
                className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-11"
              >
                Quay lại danh sách
              </Button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: BATCHES LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl border border-slate-200 shadow-md print:border-none print:shadow-none print:p-0">
            <h2 className="text-base font-bold text-slate-800 border-b pb-4 mb-6 flex items-center gap-2 print:border-slate-100">
              <Package className="w-5 h-5 text-indigo-600" /> Danh sách lô hàng đã nhập
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider print:bg-white print:border-slate-300">
                    <th className="py-4 px-4">Lô / Tên sản phẩm</th>
                    <th className="py-4 px-4 text-right">Đơn giá nhập</th>
                    <th className="py-4 px-4 text-center">Số lượng</th>
                    <th className="py-4 px-4 text-center">Tồn hiện tại</th>
                    <th className="py-4 px-4 text-center">Hạn sử dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm print:divide-slate-200">
                  {loHangList.length > 0 ? (
                    loHangList.map((lo) => (
                      <tr key={lo.maLo} className="hover:bg-slate-50/50 transition-colors print:hover:bg-white">
                        <td className="py-4.5 px-4">
                          <div>
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                              LÔ: {lo.maLo}
                            </span>
                            <p className="font-bold text-slate-800 mt-1.5 leading-snug">{lo.tenSanPham || "Sản phẩm"}</p>
                            <span className="text-xs text-slate-400">Mã SP: {lo.maSp}</span>
                          </div>
                        </td>
                        <td className="py-4.5 px-4 text-right font-semibold text-slate-700">
                          {lo.giaNhap?.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="py-4.5 px-4 text-center font-bold text-slate-800">
                          {lo.soLuongNhap}
                        </td>
                        <td className="py-4.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            lo.soLuongTon > 0 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {lo.soLuongTon} <Layers className="w-3 h-3"/>
                          </span>
                        </td>
                        <td className="py-4.5 px-4 text-center">
                          <div className="space-y-1.5">
                            <p className="text-slate-700 font-bold text-xs">
                              {lo.ngayHetHan ? formatSimpleDate(lo.ngayHetHan) : "Không có"}
                            </p>
                            {lo.ngayHetHan ? (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                lo.trangThaiHsd === "Con han"
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : lo.trangThaiHsd === "Sap het han"
                                    ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                                    : 'bg-red-50 text-red-700 border-red-100'
                              }`}>
                                {lo.trangThaiHsd === "Con han" && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                                {lo.trangThaiHsd === "Sap het han" && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                                {lo.trangThaiHsd === "Het han" && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                                {lo.trangThaiHsd === "Con han" ? "Còn hạn" : lo.trangThaiHsd === "Sap het han" ? "Sắp hết hạn" : "Hết hạn"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-500 border-slate-200">
                                <HelpCircle className="w-3 h-3" /> Vô thời hạn
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Không có chi tiết lô hàng nào được lưu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
