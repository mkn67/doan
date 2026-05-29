"use client";

import "@/app/globals.css";
import React, { useState } from "react";
// Giả định m đã viết hook useDeleteSanPham, tớ import luôn vào đây nhé!
import { useDanhSachSanPham, useCreateSanPham, useDeleteSanPham, useDanhSachLoaiSanPham } from "@/hooks/useInventory";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Package, Plus, Box, DollarSign, Layers, Tag, AlertTriangle, Pill, CheckCircle2, Trash2, Search, ShieldAlert, ChevronDown } from "lucide-react";

interface LoHang {
  maLo: string;
  soLuongNhap: number;
  soLuongTon: number;
  giaNhap: number;
  ngaySanXuat?: string;
  ngayHetHan?: string;
  trangThaiHsd?: string;
}

interface SanPham {
  maSp: string;
  tenSp: string;
  laThuoc: number | boolean;
  tenLoai?: string;
  tenNhaCungCap?: string;
  giaBan: number;
  tongTonKho: number;
  trangThai?: string;
  loHangList?: LoHang[];
}

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN") || user?.maNhom === "NH04";

  const ALLOWED_ROLES = ["ROLE_THU_KHO", "NH03"];
  const hasAccess = () => {
    if (!user) return false;
    const userRoles = user?.roles || [];
    const userGroup = user?.maNhom ? user.maNhom : null;
    return ALLOWED_ROLES.some(role => userRoles.includes(role) || role === userGroup);
  };

  const { data } = useDanhSachSanPham();
  const { data: categories } = useDanhSachLoaiSanPham();
  const createMutation = useCreateSanPham();
  const deleteMutation = useDeleteSanPham(); // Thêm hook Xóa

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all", "thuoc", "vattu"
  const [sortBy, setSortBy] = useState<string>("default"); // "default", "fefo-asc", "fefo-desc", "stock-asc", "stock-desc"
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  const toggleProductExpand = (maSp: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [maSp]: !prev[maSp]
    }));
  };

  const getNearestExpiryDate = (sp: SanPham): Date | null => {
    if (!sp.loHangList || sp.loHangList.length === 0) return null;
    const dates = sp.loHangList
      .map(lo => lo.ngayHetHan ? new Date(lo.ngayHetHan) : null)
      .filter((d): d is Date => d !== null && !isNaN(d.getTime()));
    if (dates.length === 0) return null;
    return new Date(Math.min(...dates.map(d => d.getTime())));
  };

  const [form, setForm] = useState({
    tenSp: "",
    maLoai: "",
    giaBan: 0,
    tonKhoToiThieu: 10,
    laThuoc: false,
  });

  if (!hasAccess()) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 m-6 p-8 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Truy Cập Bị Từ Chối</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Tài khoản của bạn không có nghiệp vụ Thủ kho. Vui lòng quay lại!
        </p>
        <Button onClick={() => router.back()} className="mt-6 bg-slate-800 hover:bg-slate-900 rounded-xl px-5 h-11 font-bold">
          Quay lại trang trước
        </Button>
      </div>
    );
  }

  const handleSubmit = () => {
    // 🔥 1. CHẶN ĐỨNG HÀNH VI GỬI DỮ LIỆU RỖNG BẰNG VALIDATION
    if (!form.tenSp.trim()) {
      alert("Vui lòng nhập tên sản phẩm!");
      return;
    }
    if (!form.maLoai.trim()) {
      alert("Vui lòng nhập Mã loại sản phẩm!");
      return;
    }
    if (form.giaBan <= 0) {
      alert("Giá bán phải lớn hơn 0 đồng!");
      return;
    }

    // 2. Ép kiểu dữ liệu
    const dataToSubmit = {
      ...form,
      laThuoc: form.laThuoc ? 1 : 0
    };

    // 3. Gửi dữ liệu đi
    createMutation.mutate(dataToSubmit, {
      onSuccess: () => {
        // Chỉ khi nào BE báo thành công thì mới reset form
        setForm({ tenSp: "", maLoai: "", giaBan: 0, tonKhoToiThieu: 10, laThuoc: false });
      }
    });
  };

  // 🔥 HÀM XỬ LÝ XÓA SẢN PHẨM
  const handleDelete = (maSp: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không? Xóa xong không lấy lại được đâu nhé!")) {
      deleteMutation.mutate(maSp);
    }
  };

  const rawList = data || [];
  const sanPhamList = rawList.filter((sp: SanPham) => {
    const matchesSearch = 
      sp.tenSp.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sp.maSp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sp.tenLoai || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const isThuocVal = !!sp.laThuoc;
    const matchesType = 
      filterType === "all" || 
      (filterType === "thuoc" && isThuocVal) || 
      (filterType === "vattu" && !isThuocVal);
                        
    return matchesSearch && matchesType;
  });

  const sortedAndFilteredList = [...sanPhamList].sort((a, b) => {
    if (sortBy === "fefo-asc") {
      const dateA = getNearestExpiryDate(a);
      const dateB = getNearestExpiryDate(b);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    }
    if (sortBy === "fefo-desc") {
      const dateA = getNearestExpiryDate(a);
      const dateB = getNearestExpiryDate(b);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime();
    }
    if (sortBy === "stock-asc") {
      return a.tongTonKho - b.tongTonKho;
    }
    if (sortBy === "stock-desc") {
      return b.tongTonKho - a.tongTonKho;
    }
    return 0;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <span className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/10">
              <Package className="w-7 h-7" />
            </span>
            Quản lý kho hàng & Vật tư
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            Thêm mới, theo dõi số lượng tồn kho và thiết lập cảnh báo sản phẩm.
          </p>
        </div>
      </div>

      {/* FORM THÊM MỚI */}
      <div className="bg-white/90 backdrop-blur p-6 rounded-3xl border border-slate-200/80 shadow-md">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" /> Thêm sản phẩm mới vào kho
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          {/* Tên Sản Phẩm */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên sản phẩm <span className="text-red-500 font-bold">*</span></label>
            <div className="relative focus-within:text-blue-600 text-slate-400">
              <Box className="absolute left-3.5 top-3.5 h-4.5 w-4.5 transition-colors" />
              <Input 
                className="pl-10 bg-slate-50/50 border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl h-11 transition-all text-sm font-semibold text-slate-800"
                placeholder="VD: Kính cận chống phản quang Essilor..." 
                value={form.tenSp}
                onChange={(e) => setForm({ ...form, tenSp: e.target.value })} 
                disabled={isAdmin}
              />
            </div>
          </div>

          {/* Phân loại sản phẩm (Dropdown) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loại sản phẩm <span className="text-red-500 font-bold">*</span></label>
            <div className="relative focus-within:text-blue-600 text-slate-400">
              <Tag className="absolute left-3.5 top-3.5 h-4.5 w-4.5 transition-colors pointer-events-none" />
              <select 
                className="w-full pl-10 pr-10 bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl h-11 transition-all text-sm font-semibold text-slate-800 appearance-none focus:outline-none"
                value={form.maLoai}
                onChange={(e) => setForm({ ...form, maLoai: e.target.value })} 
                disabled={isAdmin}
              >
                <option value="">Chọn loại...</option>
                {categories?.map((cat: { maLoai: string; tenLoai: string }) => (
                  <option key={cat.maLoai} value={cat.maLoai}>
                    {cat.tenLoai}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Giá Bán */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá bán (VNĐ) <span className="text-red-500 font-bold">*</span></label>
            <div className="relative focus-within:text-blue-600 text-slate-400">
              <DollarSign className="absolute left-3.5 top-3.5 h-4.5 w-4.5 transition-colors" />
              <Input 
                className="pl-10 bg-slate-50/50 border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl h-11 transition-all text-sm font-semibold text-slate-800"
                type="number" 
                placeholder="0" 
                value={form.giaBan || ""}
                onChange={(e) => setForm({ ...form, giaBan: Number(e.target.value) })} 
                disabled={isAdmin}
              />
            </div>
          </div>

          {/* Tồn Tối Thiểu */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mức cảnh báo tồn</label>
            <div className="relative focus-within:text-blue-600 text-slate-400">
              <AlertTriangle className="absolute left-3.5 top-3.5 h-4.5 w-4.5 transition-colors" />
              <Input 
                className="pl-10 bg-slate-50/50 border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl h-11 transition-all text-sm font-semibold text-slate-800"
                type="number" 
                value={form.tonKhoToiThieu || ""}
                onChange={(e) => setForm({ ...form, tonKhoToiThieu: Number(e.target.value) })} 
                disabled={isAdmin}
              />
            </div>
          </div>

          {/* Checkbox Là Thuốc */}
          <div className="md:col-span-3 flex items-center">
            <label 
              htmlFor="laThuoc" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 select-none w-full ${
                form.laThuoc 
                  ? "bg-amber-50/60 border-amber-300 text-amber-900 shadow-sm" 
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/50"
              }`}
            >
              <input
                type="checkbox"
                id="laThuoc"
                className="w-4.5 h-4.5 text-amber-600 border-slate-300 rounded focus:ring-amber-500 accent-amber-600"
                checked={form.laThuoc}
                onChange={(e) => setForm({ ...form, laThuoc: e.target.checked })}
                disabled={isAdmin}
              />
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Pill className={`w-4 h-4 ${form.laThuoc ? "text-amber-600" : "text-slate-400"}`} />
                <span>Đây là Thuốc y tế (Yêu cầu lô hạn dùng/kê đơn)</span>
              </div>
            </label>
          </div>

          {/* Nút Thêm */}
          <div className="md:col-span-2">
            <Button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending || isAdmin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/10 hover:shadow-blue-600/25 transition-all hover:scale-[1.02] font-bold h-11 rounded-xl text-sm gap-2"
            >
              <Plus className="w-5 h-5" /> {createMutation.isPending ? "Đang xử lý..." : "Thêm vào kho"}
            </Button>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          <Input 
            className="pl-10 pr-4 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl h-10.5 transition-all text-sm font-semibold text-slate-800"
            placeholder="Tìm kiếm theo tên sản phẩm, mã, loại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sort and Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative text-slate-400 w-full md:w-56">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-3 pr-8 bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl h-10.5 transition-all text-xs font-bold text-slate-700 appearance-none focus:outline-none"
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="fefo-asc">Hạn dùng: Sắp hết hạn trước (FEFO)</option>
              <option value="fefo-desc">Hạn dùng: Xa nhất trước</option>
              <option value="stock-asc">Tồn kho: Thấp đến Cao</option>
              <option value="stock-desc">Tồn kho: Cao đến Thấp</option>
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === "all" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tất cả ({ rawList.length })
            </button>
            <button
              onClick={() => setFilterType("thuoc")}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === "thuoc" 
                  ? "bg-white text-amber-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Chỉ Thuốc ({ rawList.filter((s: SanPham) => s.laThuoc).length })
            </button>
            <button
              onClick={() => setFilterType("vattu")}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === "vattu" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Vật tư ({ rawList.filter((s: SanPham) => !s.laThuoc).length })
            </button>
          </div>
        </div>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4.5 px-6">Tên sản phẩm</th>
                <th className="py-4.5 px-6 text-center w-36">Phân loại</th>
                <th className="py-4.5 px-6">Tên Loại</th>
                <th className="py-4.5 px-6">Nhà cung cấp</th>
                <th className="py-4.5 px-6 text-right w-44">Giá bán lẻ</th>
                <th className="py-4.5 px-6 text-center w-36">Tồn kho</th>
                <th className="py-4.5 px-6 text-center w-32">Trạng thái</th>
                <th className="py-4.5 px-6 text-center w-20">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedAndFilteredList.length > 0 ? (
                sortedAndFilteredList.map((sp: SanPham) => (
                  <React.Fragment key={sp.maSp}>
                    <tr className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleProductExpand(sp.maSp)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <ChevronDown className={`w-4.5 h-4.5 transition-transform duration-200 ${expandedProducts[sp.maSp] ? "transform rotate-180" : ""}`} />
                          </button>
                          <div>
                            <div 
                              className="font-bold text-slate-800 leading-snug cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => toggleProductExpand(sp.maSp)}
                            >
                              {sp.tenSp || "Chưa có tên"}
                            </div>
                            <span className="text-slate-400 font-medium text-xs">Mã: {sp.maSp}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {sp.laThuoc ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                            <Pill className="w-3.5 h-3.5 text-amber-500" /> Thuốc
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                            <Box className="w-3.5 h-3.5 text-blue-500" /> Vật tư
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {sp.tenLoai || "Chưa phân loại"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {sp.tenNhaCungCap || "Chưa gán đối tác"}
                      </td>
                      <td className="py-4 px-6 text-slate-800 text-right font-extrabold text-base">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sp.giaBan || 0)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                          sp.tongTonKho > (form.tonKhoToiThieu || 10)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : sp.tongTonKho > 0 
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {sp.tongTonKho || 0}
                          <Layers className="w-3.5 h-3.5 opacity-60"/>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center text-xs font-bold text-slate-600 bg-slate-100/60 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                          {sp.trangThai || "Hoạt động"}
                        </span>
                      </td>
                      
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => handleDelete(sp.maSp)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
                          title="Xóa sản phẩm"
                          disabled={isAdmin}
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                    
                    {expandedProducts[sp.maSp] && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={8} className="px-6 py-4 border-t border-b border-slate-100">
                          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-inner space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-blue-500" />
                              Chi tiết các lô hàng đang lưu kho
                            </h4>
                            
                            {!sp.loHangList || sp.loHangList.length === 0 ? (
                              <div className="text-xs text-slate-400 italic py-2">
                                Sản phẩm này chưa được nhập lô hàng nào vào kho.
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                                      <th className="py-2 px-3">Mã Lô</th>
                                      <th className="py-2 px-3">Số lượng nhập</th>
                                      <th className="py-2 px-3">Tồn kho lô</th>
                                      <th className="py-2 px-3 text-right">Giá nhập</th>
                                      <th className="py-2 px-3 text-center">Ngày sản xuất</th>
                                      <th className="py-2 px-3 text-center">Ngày hết hạn</th>
                                      <th className="py-2 px-3 text-center">Trạng thái HSD</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                                    {[...(sp.loHangList || [])].sort((a, b) => {
                                      if (!a.ngayHetHan && !b.ngayHetHan) return 0;
                                      if (!a.ngayHetHan) return 1;
                                      if (!b.ngayHetHan) return -1;
                                      return new Date(a.ngayHetHan).getTime() - new Date(b.ngayHetHan).getTime();
                                    }).map((lo: LoHang) => {
                                      let statusColor = "bg-slate-100 text-slate-600";
                                      if (lo.trangThaiHsd === "Đã hết hạn") {
                                        statusColor = "bg-rose-50 text-rose-700 border border-rose-100";
                                      } else if (lo.trangThaiHsd === "Sắp hết hạn" || (lo.ngayHetHan && new Date(lo.ngayHetHan).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000)) {
                                        statusColor = "bg-amber-50 text-amber-700 border border-amber-100";
                                      } else if (lo.trangThaiHsd === "Còn hạn" || lo.trangThaiHsd === "CON_HAN") {
                                        statusColor = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                                      }
                                      
                                      return (
                                        <tr key={lo.maLo} className="hover:bg-slate-50/50">
                                          <td className="py-2 px-3 font-mono text-blue-600">{lo.maLo}</td>
                                          <td className="py-2 px-3 text-slate-500">{lo.soLuongNhap}</td>
                                          <td className="py-2 px-3">
                                            <span className={`px-2 py-0.5 rounded-full ${lo.soLuongTon === 0 ? "text-slate-400 bg-slate-100" : "text-slate-800 bg-slate-100"}`}>
                                              {lo.soLuongTon}
                                            </span>
                                          </td>
                                          <td className="py-2 px-3 text-right text-slate-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lo.giaNhap || 0)}
                                          </td>
                                          <td className="py-2 px-3 text-center text-slate-500">
                                            {lo.ngaySanXuat ? new Date(lo.ngaySanXuat).toLocaleDateString('vi-VN') : "---"}
                                          </td>
                                          <td className="py-2 px-3 text-center">
                                            <span className={lo.trangThaiHsd === "Đã hết hạn" ? "text-rose-600 font-bold" : "text-slate-500"}>
                                              {lo.ngayHetHan ? new Date(lo.ngayHetHan).toLocaleDateString('vi-VN') : "---"}
                                            </span>
                                          </td>
                                          <td className="py-2 px-3 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
                                              {lo.trangThaiHsd || "Chưa xác định"}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
                        <Package className="w-8 h-8" />
                      </div>
                      <p className="text-base font-bold text-slate-700">Chưa có sản phẩm nào</p>
                      <p className="text-sm text-slate-400 mt-1">Không tìm thấy sản phẩm trùng khớp với từ khóa tìm kiếm của bạn.</p>
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