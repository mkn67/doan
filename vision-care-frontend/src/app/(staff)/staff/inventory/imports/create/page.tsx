"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/globals.css";

import { useAuth } from "@/hooks/useAuth";
import { 
  useDanhSachNhaCungCap, 
  useDanhSachSanPham, 
  useCreatePhieuNhap 
} from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Plus, Trash2, Save, FileText, 
  User, Truck, Calendar, DollarSign, PackageOpen, 
  AlertCircle, AlertOctagon, Info
} from "lucide-react";

interface NhaCungCap {
  maNcc: string;
  tenNcc: string;
}

interface SanPham {
  maSp: string;
  tenSp: string;
  laThuoc: number | boolean;
  giaBan: number;
}

interface PageResponseDTO<T> {
  content?: T[];
  data?: T[];
}

interface LoHangItem {
  maSp: string;
  soLuongNhap: number;
  giaNhap: number;
  ngaySanXuat: string;
  ngayHetHan: string;
  laThuoc: boolean;
}

export default function CreateImportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: rawNccList, isLoading: loadingNcc } = useDanhSachNhaCungCap();
  const { data: rawSpList, isLoading: loadingSp } = useDanhSachSanPham();
  const createMutation = useCreatePhieuNhap();

  const [maNcc, setMaNcc] = useState("");
  const [items, setItems] = useState<LoHangItem[]>([
    { maSp: "", soLuongNhap: 1, giaNhap: 0, ngaySanXuat: "", ngayHetHan: "", laThuoc: false }
  ]);

  const nccList: NhaCungCap[] = Array.isArray(rawNccList)
    ? rawNccList
    : (rawNccList as unknown as PageResponseDTO<NhaCungCap>)?.content || [];

  const spList: SanPham[] = rawSpList || [];

  // Determine current staff member
  const maNs = user?.username || "NS001";
  const tenNhanVien = user?.hoTen || "Thủ kho";

  const handleAddItem = () => {
    setItems([
      ...items,
      { maSp: "", soLuongNhap: 1, giaNhap: 0, ngaySanXuat: "", ngayHetHan: "", laThuoc: false }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      alert("Phải có ít nhất 1 sản phẩm nhập kho!");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LoHangItem, value: any) => {
    const updated = [...items];
    if (field === "maSp") {
      const selectedSp = spList.find(sp => sp.maSp === value);
      updated[index] = {
        ...updated[index],
        maSp: value,
        laThuoc: selectedSp ? !!selectedSp.laThuoc : false,
        // Optional default to giaBan/2 if not defined, or reset
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value
      };
    }
    setItems(updated);
  };

  // Calculate totals
  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.soLuongNhap) || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + ((Number(item.soLuongNhap) || 0) * (Number(item.giaNhap) || 0)), 0);

  const handleSave = () => {
    if (!maNcc) {
      alert("Vui lòng chọn nhà cung cấp!");
      return;
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.maSp) {
        alert(`Dòng ${i + 1}: Vui lòng chọn sản phẩm!`);
        return;
      }
      if (item.soLuongNhap <= 0) {
        alert(`Dòng ${i + 1}: Số lượng nhập phải lớn hơn 0!`);
        return;
      }
      if (item.giaNhap < 0) {
        alert(`Dòng ${i + 1}: Giá nhập không được âm!`);
        return;
      }
      if (item.laThuoc) {
        if (!item.ngaySanXuat) {
          alert(`Dòng ${i + 1}: Sản phẩm là thuốc, bắt buộc phải nhập Ngày sản xuất!`);
          return;
        }
        if (!item.ngayHetHan) {
          alert(`Dòng ${i + 1}: Sản phẩm là thuốc, bắt buộc phải nhập Hạn sử dụng!`);
          return;
        }
        // Expiry date must be after prod date
        if (new Date(item.ngaySanXuat) >= new Date(item.ngayHetHan)) {
          alert(`Dòng ${i + 1}: Hạn sử dụng phải sau Ngày sản xuất!`);
          return;
        }
      }
    }

    // Format request payload
    const payload = {
      maNcc,
      maNs,
      loHangList: items.map(item => ({
        maSp: item.maSp,
        soLuongNhap: Number(item.soLuongNhap),
        giaNhap: Number(item.giaNhap),
        ngaySanXuat: item.ngaySanXuat || undefined,
        ngayHetHan: item.ngayHetHan || undefined,
      }))
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        alert("Lập phiếu nhập kho và nhập kho thành công! 📦");
        router.push("/staff/inventory/imports");
      },
      onError: (err: any) => {
        const errorMsg = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi lưu phiếu nhập";
        alert(`Lỗi: ${errorMsg}`);
      }
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gradient-to-tr from-slate-50 to-indigo-50/20 min-h-[calc(100vh-4rem)] animate-fade-in">
      {/* HEADER SECTION */}
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Lập phiếu nhập kho
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Khởi tạo lô sản phẩm nhập kho, cập nhật giá nhập và ngày hết hạn.
          </p>
        </div>
      </div>

      {/* BODY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: VOUCHER METADATA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl border border-slate-200 shadow-md space-y-6">
            <h2 className="text-base font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Thông tin phiếu nhập
            </h2>

            {/* NCC Selection */}
            <div className="space-y-2">
              <label htmlFor="nccSelect" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-400" /> Nhà cung cấp <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                id="nccSelect"
                value={maNcc}
                onChange={(e) => setMaNcc(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                disabled={loadingNcc}
              >
                <option value="">-- Chọn Nhà cung cấp --</option>
                {nccList.map((ncc) => (
                  <option key={ncc.maNcc} value={ncc.maNcc}>
                    {ncc.tenNcc} ({ncc.maNcc})
                  </option>
                ))}
              </select>
            </div>

            {/* Staff information */}
            <div className="space-y-2">
              <label htmlFor="staffInput" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" /> Thủ kho thực hiện
              </label>
              <Input
                id="staffInput"
                value={`${tenNhanVien} (${maNs})`}
                disabled
                className="bg-slate-100/80 font-semibold text-slate-500 rounded-xl h-11 border-slate-200"
              />
            </div>

            {/* Summary statistics */}
            <div className="pt-4 border-t border-slate-100 space-y-3.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-400">Số lượng lô hàng:</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">{items.length} lô</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-400">Tổng số lượng nhập:</span>
                <span className="font-bold text-slate-800">{totalQuantity} chiếc</span>
              </div>
              <div className="flex justify-between items-center text-base border-t pt-4">
                <span className="font-bold text-slate-600">Tổng giá trị:</span>
                <span className="font-extrabold text-indigo-600 text-xl">
                  {totalValue.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>



          </div>
        </div>

        {/* RIGHT COLUMN: ITEMS DYNAMIC BATCH LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl border border-slate-200 shadow-md">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <PackageOpen className="w-5 h-5 text-indigo-600" /> Chi tiết các lô hàng nhập
              </h2>
              <Button
                onClick={handleAddItem}
                variant="outline"
                className="border-indigo-200 hover:border-indigo-300 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 bg-indigo-50/20 rounded-xl gap-2 font-bold text-xs h-9 transition-all"
              >
                <Plus className="w-4 h-4" /> Thêm dòng
              </Button>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => (
                <div 
                  key={index}
                  className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50/80 hover:border-slate-200 hover:shadow-sm transition-all relative space-y-4"
                >
                  <div className="absolute top-4 right-4 flex items-center gap-3">
                    <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                      Lô #{index + 1}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Xóa dòng này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* San Pham */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label htmlFor={`spSelect-${index}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sản phẩm <span className="text-red-500">*</span></label>
                      <select
                        id={`spSelect-${index}`}
                        value={item.maSp}
                        onChange={(e) => handleItemChange(index, "maSp", e.target.value)}
                        className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800"
                        disabled={loadingSp}
                      >
                        <option value="">-- Chọn sản phẩm --</option>
                        {spList.map((sp) => (
                          <option key={sp.maSp} value={sp.maSp}>
                            {sp.tenSp} ({sp.maSp})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                      <label htmlFor={`qty-${index}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số lượng nhập <span className="text-red-500">*</span></label>
                      <Input
                        id={`qty-${index}`}
                        type="number"
                        min="1"
                        placeholder="Số lượng"
                        value={item.soLuongNhap || ""}
                        onChange={(e) => handleItemChange(index, "soLuongNhap", Number(e.target.value))}
                        className="bg-white rounded-xl h-11 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Import Price */}
                    <div className="space-y-1.5">
                      <label htmlFor={`price-${index}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Giá nhập (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        min="0"
                        placeholder="Đơn giá"
                        value={item.giaNhap || ""}
                        onChange={(e) => handleItemChange(index, "giaNhap", Number(e.target.value))}
                        className="bg-white rounded-xl h-11 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                      />
                    </div>

                    {/* Production Date */}
                    <div className="space-y-1.5">
                      <label htmlFor={`prodDate-${index}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày sản xuất {item.laThuoc && <span className="text-red-500 font-bold">*</span>}
                      </label>
                      <Input
                        id={`prodDate-${index}`}
                        type="date"
                        value={item.ngaySanXuat}
                        onChange={(e) => handleItemChange(index, "ngaySanXuat", e.target.value)}
                        className="bg-white rounded-xl h-11 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-semibold"
                      />
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-1.5">
                      <label htmlFor={`expDate-${index}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày hết hạn {item.laThuoc && <span className="text-red-500 font-bold">*</span>}
                      </label>
                      <Input
                        id={`expDate-${index}`}
                        type="date"
                        value={item.ngayHetHan}
                        onChange={(e) => handleItemChange(index, "ngayHetHan", e.target.value)}
                        className="bg-white rounded-xl h-11 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Warning if medicine */}
                  {item.laThuoc && (
                    <div className="flex items-start gap-2.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                      <AlertOctagon className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-amber-900">Sản phẩm là Thuốc y tế</p>
                        <p className="text-amber-700 font-medium">Bắt buộc phải khai báo đầy đủ Ngày sản xuất và Hạn sử dụng.</p>
                      </div>
                    </div>
                  )}

                  {/* Helper info showing product type when selected */}
                  {item.maSp && !item.laThuoc && (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100/50 p-2.5 rounded-xl border border-slate-200/50">
                      <Info className="w-4 h-4 text-indigo-500" />
                      <span>Sản phẩm là vật tư thường, hạn sử dụng không bắt buộc.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/staff/inventory/imports")}
                className="border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl h-11 px-6 font-semibold"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all gap-2"
              >
                <Save className="w-4.5 h-4.5" /> {createMutation.isPending ? "Đang xử lý..." : "Lưu phiếu nhập"}
              </Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
