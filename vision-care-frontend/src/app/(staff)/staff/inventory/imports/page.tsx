"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/globals.css";

import { useDanhSachPhieuNhap } from "@/hooks/useInventory";
import { PhieuNhapResponse } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ClipboardList, Plus, Calendar, FileText, 
  User, Truck, PackageCheck, TrendingUp, CreditCard,
  Search, ArrowUpDown, ChevronRight, FilterX
} from "lucide-react";

interface PageResponseDTO {
  content?: PhieuNhapResponse[];
  data?: PhieuNhapResponse[];
}

export default function ImportsPage() {
  const router = useRouter();
  const { data, isLoading } = useDanhSachPhieuNhap();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  const importList: PhieuNhapResponse[] = Array.isArray(data)
    ? data
    : ((data as unknown as PageResponseDTO)?.content as PhieuNhapResponse[]) || [];

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

  // Compute stats based on full list
  const totalImports = importList.length;
  const totalValue = importList.reduce(
    (sum: number, item: PhieuNhapResponse) => sum + (item.tongTien || 0),
    0
  );
  const latestImport = importList[0]?.ngayNhap 
    ? formatDate(importList[0].ngayNhap) 
    : "N/A";

  // Filter and sort list
  const filteredList = importList
    .filter((pn) => {
      const matchSearch = 
        pn.maPn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pn.tenNcc || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pn.tenNhanVien || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "latest") return new Date(b.ngayNhap).getTime() - new Date(a.ngayNhap).getTime();
      if (sortOrder === "oldest") return new Date(a.ngayNhap).getTime() - new Date(b.ngayNhap).getTime();
      if (sortOrder === "highest") return (b.tongTien || 0) - (a.tongTien || 0);
      if (sortOrder === "lowest") return (a.tongTien || 0) - (b.tongTien || 0);
      return 0;
    });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)] animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Lịch sử Nhập kho
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Quản lý chứng từ, tra cứu thông tin các lô hàng nhập từ đối tác.
            </p>
          </div>
        </div>
        <Button 
          onClick={() => router.push("/staff/inventory/imports/create")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2 h-11 px-6 font-bold rounded-xl"
        >
          <Plus className="w-5 h-5" /> Lập phiếu nhập mới
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="p-3.5 bg-blue-100/70 text-blue-600 rounded-xl">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng số phiếu nhập</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{totalImports}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50/30 p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="p-3.5 bg-emerald-100/70 text-emerald-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng giá trị đã nhập</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">
              {totalValue.toLocaleString("vi-VN")} đ
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50/30 p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="p-3.5 bg-amber-100/70 text-amber-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Giao dịch gần nhất</p>
            <p className="text-base font-extrabold text-slate-800 mt-2.5 truncate max-w-[200px]" title={latestImport}>
              {latestImport}
            </p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH ACTION BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          <Input 
            className="pl-10 pr-4 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl h-10.5 transition-all text-sm"
            placeholder="Tìm theo mã phiếu, nhà cung cấp, thủ kho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3">
          <label htmlFor="sortOrderSelect" className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp theo:
          </label>
          <select
            id="sortOrderSelect"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="h-10.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-700"
          >
            <option value="latest">Mới nhất trước</option>
            <option value="oldest">Cũ nhất trước</option>
            <option value="highest">Giá trị lớn nhất</option>
            <option value="lowest">Giá trị nhỏ nhất</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4.5 px-6">
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400"/>Mã phiếu</div>
                </th>
                <th className="py-4.5 px-6">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400"/>Ngày nhập kho</div>
                </th>
                <th className="py-4.5 px-6">
                  <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-slate-400"/>Nhà cung cấp đối tác</div>
                </th>
                <th className="py-4.5 px-6">
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400"/>Người lập phiếu</div>
                </th>
                <th className="py-4.5 px-6 text-right">Tổng tiền hàng</th>
                <th className="py-4.5 px-6 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="text-slate-400 font-medium text-sm">Đang tải lịch sử phiếu nhập...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length > 0 ? (
                filteredList.map((pn: PhieuNhapResponse) => (
                  <tr 
                    key={pn.maPn} 
                    onClick={() => router.push(`/staff/inventory/imports/${pn.maPn}`)}
                    className="hover:bg-indigo-50/30 transition-all cursor-pointer group"
                    title="Click để xem chi tiết phiếu nhập"
                  >
                    <td className="py-4 px-6 font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      {pn.maPn}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {formatDate(pn.ngayNhap)}
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-semibold">
                      {pn.tenNcc || "Chưa cập nhật"}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
                        {pn.tenNhanVien || "Thủ kho"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-slate-800 text-base">
                      {pn.tongTien?.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-4 px-6 text-center">
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
                        <FilterX className="w-8 h-8" />
                      </div>
                      <p className="text-base font-bold text-slate-700">Không tìm thấy kết quả</p>
                      <p className="text-sm text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc lập thêm phiếu nhập mới.</p>
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