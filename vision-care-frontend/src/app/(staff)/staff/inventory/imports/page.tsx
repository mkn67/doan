"use client";

import "@/app/globals.css";
import { useState } from "react";
// Giả định m có các hook này trong useInventory
import { useDanhSachNhaCungCap, useCreateNhaCungCap, useDeleteNhaCungCap } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Plus, Phone, MapPin, Building2, Trash2 } from "lucide-react";

interface NhaCungCap {
  maNcc: string;
  tenNcc: string;
  sdt?: string;
  diaChi?: string;
}

export default function SuppliersPage() {
  const { data: nccList = [] } = useDanhSachNhaCungCap(); // Lấy danh sách
  const createMutation = useCreateNhaCungCap();
  const deleteMutation = useDeleteNhaCungCap();

  const [form, setForm] = useState({ tenNcc: "", sdt: "", diaChi: "" });

  const handleSubmit = () => {
    if (!form.tenNcc.trim()) return alert("Vui lòng nhập tên nhà cung cấp!");
    
    createMutation.mutate(form, {
      onSuccess: () => setForm({ tenNcc: "", sdt: "", diaChi: "" })
    });
  };

  const handleDelete = (maNcc: string) => {
    if (window.confirm("Xóa nhà cung cấp này?")) deleteMutation.mutate(maNcc);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-4">
        <Truck className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Nhà cung cấp</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý danh sách đối tác cung cấp vật tư y tế.</p>
        </div>
      </div>

      {/* FORM THÊM MỚI */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Plus className="w-4 h-4 text-blue-600" /> Thêm nhà cung cấp
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-medium text-slate-600">Tên NCC <span className="text-red-500">*</span></label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-9 bg-slate-50" placeholder="VD: Essilor VN" value={form.tenNcc} onChange={e => setForm({...form, tenNcc: e.target.value})} />
            </div>
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-medium text-slate-600">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-9 bg-slate-50" placeholder="09xxxx..." value={form.sdt} onChange={e => setForm({...form, sdt: e.target.value})} />
            </div>
          </div>
          <div className="space-y-1.5 md:col-span-2 flex gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Địa chỉ</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input className="pl-9 bg-slate-50" placeholder="Số nhà, đường..." value={form.diaChi} onChange={e => setForm({...form, diaChi: e.target.value})} />
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 h-10 px-8 mt-6">
              {createMutation.isPending ? "Đang xử lý..." : "Lưu NCC"}
            </Button>
          </div>
        </div>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="py-4 px-6 font-semibold">Tên Nhà cung cấp</th>
              <th className="py-4 px-6 font-semibold">Số điện thoại</th>
              <th className="py-4 px-6 font-semibold">Địa chỉ</th>
              <th className="py-4 px-6 font-semibold text-center w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {nccList.length > 0 ? nccList.map((ncc: NhaCungCap) => (
              <tr key={ncc.maNcc} className="hover:bg-slate-50/80 group">
                <td className="py-4 px-6 font-medium text-slate-800">{ncc.tenNcc}</td>
                <td className="py-4 px-6 text-slate-600">{ncc.sdt || "Trống"}</td>
                <td className="py-4 px-6 text-slate-600">{ncc.diaChi || "Trống"}</td>
                <td className="py-4 px-6 text-center">
                  <button 
                    onClick={() => handleDelete(ncc.maNcc)} 
                    title="Xóa nhà cung cấp"
                    className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="py-12 text-center text-slate-500">Chưa có dữ liệu nhà cung cấp</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}