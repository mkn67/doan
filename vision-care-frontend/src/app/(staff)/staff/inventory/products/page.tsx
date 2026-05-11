"use client";

import "@/app/globals.css";
import { useState } from "react";
// Giả định m đã viết hook useDeleteSanPham, tớ import luôn vào đây nhé!
import { useDanhSachSanPham, useCreateSanPham, useDeleteSanPham } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Plus, Box, DollarSign, Layers, Tag, AlertTriangle, Pill, CheckCircle2, Trash2 } from "lucide-react";

interface SanPham {
  maSp: string;
  tenSp: string;
  laThuoc: number | boolean;
  tenLoai?: string;
  tenNhaCungCap?: string;
  giaBan: number;
  tongTonKho: number;
  trangThai?: string;
}

export default function ProductsPage() {
  const { data } = useDanhSachSanPham();
  const createMutation = useCreateSanPham();
  const deleteMutation = useDeleteSanPham(); // Thêm hook Xóa

  const [form, setForm] = useState({
    tenSp: "",
    maLoai: "",
    giaBan: 0,
    tonKhoToiThieu: 10,
    laThuoc: false,
  });

  const handleSubmit = () => {
    // 🔥 1. CHẶN ĐỨNG HÀNH VI GỬI DỮ LIỆU RỖNG BẰNG VALIDATION
    if (!form.tenSp.trim()) {
      alert("Ê này! Phải nhập tên sản phẩm chứ!");
      return;
    }
    if (!form.maLoai.trim()) {
      alert("Chưa nhập Mã loại kìa ông giáo!");
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

  const sanPhamList = data || [];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            Quản lý kho hàng & Vật tư
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Thêm mới, theo dõi số lượng tồn kho và thiết lập cảnh báo sản phẩm.
          </p>
        </div>
      </div>

      {/* FORM THÊM MỚI */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Plus className="w-4 h-4 text-blue-600" /> Thêm sản phẩm mới
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* Tên Sản Phẩm */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Tên sản phẩm <span className="text-red-500">*</span></label>
            <div className="relative">
              <Box className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-9 bg-slate-50"
                placeholder="VD: Kính cận chống loá..." 
                value={form.tenSp}
                onChange={(e) => setForm({ ...form, tenSp: e.target.value })} 
              />
            </div>
          </div>

          {/* Mã Loại */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Mã loại (ID) <span className="text-red-500">*</span></label>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-9 bg-slate-50"
                placeholder="VD: L01..." 
                value={form.maLoai}
                onChange={(e) => setForm({ ...form, maLoai: e.target.value })} 
              />
            </div>
          </div>

          {/* Giá Bán */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-9 bg-slate-50"
                type="number" 
                placeholder="0" 
                value={form.giaBan || ""}
                onChange={(e) => setForm({ ...form, giaBan: Number(e.target.value) })} 
              />
            </div>
          </div>

          {/* Tồn Tối Thiểu */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Tồn tối thiểu</label>
            <div className="relative">
              <AlertTriangle className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-9 bg-slate-50"
                type="number" 
                value={form.tonKhoToiThieu || ""}
                onChange={(e) => setForm({ ...form, tonKhoToiThieu: Number(e.target.value) })} 
              />
            </div>
          </div>

          {/* Checkbox Là Thuốc */}
          <div className="flex items-center space-x-2 h-10 px-2 md:col-span-3">
            <input
              type="checkbox"
              id="laThuoc"
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              checked={form.laThuoc}
              onChange={(e) => setForm({ ...form, laThuoc: e.target.checked })}
            />
            <label htmlFor="laThuoc" className="text-sm font-medium text-slate-700 cursor-pointer">
              Đánh dấu đây là Thuốc (Yêu cầu kê đơn/HSD)
            </label>
          </div>

          {/* Nút Thêm */}
          <div className="md:col-span-2">
            <Button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md font-semibold h-10"
            >
              {createMutation.isPending ? "Đang xử lý..." : "Thêm vào kho"}
            </Button>
          </div>
        </div>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="py-4 px-6 font-semibold">Tên sản phẩm</th>
                <th className="py-4 px-6 font-semibold text-center">Phân loại</th>
                <th className="py-4 px-6 font-semibold">Tên Loại</th>
                <th className="py-4 px-6 font-semibold">Nhà cung cấp</th>
                <th className="py-4 px-6 font-semibold text-right">Giá bán</th>
                <th className="py-4 px-6 font-semibold text-center">Tồn kho</th>
                <th className="py-4 px-6 font-semibold text-center">Trạng thái</th>
                {/* THÊM CỘT HÀNH ĐỘNG Ở ĐÂY */}
                <th className="py-4 px-6 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sanPhamList.length > 0 ? (
                sanPhamList.map((sp: SanPham) => (
                  <tr key={sp.maSp} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {sp.tenSp || "Chưa có tên"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {sp.laThuoc ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          <Pill className="w-3.5 h-3.5" /> Thuốc
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                          <Box className="w-3.5 h-3.5" /> Vật tư
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {sp.tenLoai || "Trống"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-sm">
                      {sp.tenNhaCungCap || "Chưa cập nhật"}
                    </td>
                    <td className="py-4 px-6 text-slate-700 text-right font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sp.giaBan || 0)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        sp.tongTonKho > 10 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : sp.tongTonKho > 0 
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {sp.tongTonKho || 0} <Layers className="w-3 h-3 ml-1"/>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center text-xs font-medium text-slate-500">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                        {sp.trangThai || "Active"}
                      </span>
                    </td>
                    
                    {/* THÊM NÚT XÓA Ở ĐÂY */}
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => handleDelete(sp.maSp)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-600">Chưa có sản phẩm nào trong kho</p>
                      <p className="text-sm text-slate-400">Dữ liệu sẽ hiển thị tại đây sau khi bạn thêm mới.</p>
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