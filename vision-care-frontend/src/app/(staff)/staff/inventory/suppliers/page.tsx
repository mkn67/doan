"use client";

import "@/app/globals.css";
import { useState } from "react";
import { useDanhSachNhaCungCap, useCreateNhaCungCap, useDeleteNhaCungCap } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Plus, Phone, MapPin, Building2, Trash2, Search } from "lucide-react";

interface NhaCungCap {
  maNcc: string;
  tenNcc: string;
  sdt?: string;
  diaChi?: string;
}

interface PageResponseDTO<T> {
  content?: T[];
  data?: T[];
}

export default function SuppliersPage() {
  const { data: rawData } = useDanhSachNhaCungCap(); // Lấy danh sách
  const createMutation = useCreateNhaCungCap();
  const deleteMutation = useDeleteNhaCungCap();

  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ tenNcc: "", sdt: "", diaChi: "" });

  // Xử lý chuẩn hóa dữ liệu từ API (mảng hoặc object phân trang)
  const nccList = Array.isArray(rawData) ? rawData : (rawData as unknown as PageResponseDTO<NhaCungCap>)?.content || [];

  const handleSubmit = () => {
    if (!form.tenNcc.trim()) return alert("Vui lòng nhập tên nhà cung cấp!");
    
    createMutation.mutate(form, {
      onSuccess: () => setForm({ tenNcc: "", sdt: "", diaChi: "" })
    });
  };

  const handleDelete = (maNcc: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) deleteMutation.mutate(maNcc);
  };

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredList = nccList.filter((ncc: NhaCungCap) => {
    return (
      ncc.tenNcc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ncc.sdt || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ncc.diaChi || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4">
        <span className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/10">
          <Truck className="w-7 h-7" />
        </span>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Đối tác & Nhà cung cấp</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý danh sách đối tác cung cấp vật tư y tế và kính mắt.</p>
        </div>
      </div>

      {/* FORM THÊM MỚI */}
      <div className="bg-white/90 backdrop-blur p-6 rounded-3xl border border-slate-200/80 shadow-md">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" /> Thêm nhà cung cấp mới
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên NCC <span className="text-red-500 font-bold">*</span></label>
            <div className="relative focus-within:text-blue-600 text-slate-400">
              <Building2 className="absolute left-3.5 top-3.5 h-4.5 w-4.5 transition-colors" />
              <Input 
                className="pl-10 bg-slate-50/50 border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl h-11 transition-all text-sm font-semibold text-slate-800" 
                placeholder="VD: Essilor Việt Nam" 
                value={form.tenNcc} 
                onChange={e => setForm({...form, tenNcc: e.target.value})} 
              />
            </div>
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
            <div className="relative focus-within:text-blue-600 text-slate-400">
              <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 transition-colors" />
              <Input 
                className="pl-10 bg-slate-50/50 border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl h-11 transition-all text-sm font-semibold text-slate-800" 
                placeholder="VD: 0987654321" 
                value={form.sdt} 
                onChange={e => setForm({...form, sdt: e.target.value})} 
              />
            </div>
          </div>
          <div className="space-y-1.5 md:col-span-2 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ trụ sở</label>
              <div className="relative focus-within:text-blue-600 text-slate-400">
                <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 transition-colors" />
                <Input 
                  className="pl-10 bg-slate-50/50 border-slate-200 hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl h-11 transition-all text-sm font-semibold text-slate-800" 
                  placeholder="Số nhà, tên đường, quận/huyện..." 
                  value={form.diaChi} 
                  onChange={e => setForm({...form, diaChi: e.target.value})} 
                />
              </div>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending} 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/10 hover:shadow-blue-600/25 transition-all hover:scale-[1.02] font-bold h-11 px-8 rounded-xl text-sm gap-2 w-full md:w-auto shrink-0 animate-none"
            >
              <Plus className="w-4.5 h-4.5" /> {createMutation.isPending ? "Đang xử lý..." : "Lưu đối tác"}
            </Button>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          <Input 
            className="pl-10 pr-4 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl h-10.5 transition-all text-sm font-semibold text-slate-800"
            placeholder="Tìm kiếm nhà cung cấp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="py-4.5 px-6">Tên Nhà cung cấp</th>
              <th className="py-4.5 px-6">Số điện thoại</th>
              <th className="py-4.5 px-6">Địa chỉ</th>
              <th className="py-4.5 px-6 text-center w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredList.length > 0 ? filteredList.map((ncc: NhaCungCap) => (
              <tr key={ncc.maNcc} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-blue-500/10 shrink-0">
                      {ncc.tenNcc.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-snug">{ncc.tenNcc}</p>
                      <span className="text-slate-400 font-medium text-xs">Mã NCC: {ncc.maNcc}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-600 font-semibold">{ncc.sdt || "Chưa cập nhật"}</td>
                <td className="py-4 px-6 text-slate-500 font-medium">{ncc.diaChi || "Chưa cập nhật"}</td>
                <td className="py-4 px-6 text-center">
                  <button 
                    onClick={() => handleDelete(ncc.maNcc)} 
                    title="Xóa nhà cung cấp"
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
                      <Truck className="w-8 h-8" />
                    </div>
                    <p className="text-base font-bold text-slate-700">Chưa có nhà cung cấp nào</p>
                    <p className="text-sm text-slate-400 mt-1">Không tìm thấy đối tác nào phù hợp với từ khóa của bạn.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}