"use client";

import "@/app/globals.css";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
// Import thêm hooks gọi API (Giả định m có sẵn hoặc dùng SWR/React Query)
import { useDatLich, useBacSi, useGoiKham } from "@/hooks/useClinic"; 

export default function BookingPage() {
  const { mutateAsync, isPending } = useDatLich();
  
  // Lấy data từ Backend
  const { data: listBacSi, isLoading: loadingBs } = useBacSi(); 
  const { data: listGoiKham, isLoading: loadingGoi } = useGoiKham();

  const [maNs, setMaNs] = useState("");
  const [maGoi, setMaGoi] = useState("");
  const [ngayHen, setNgayHen] = useState("");
  const [gioHen, setGioHen] = useState("");

  const handleSubmit = async () => {
    if (!maNs || !maGoi || !ngayHen || !gioHen) {
      alert("Vui lòng chọn đầy đủ thông tin!");
      return;
    }

    try {
      const gioHenFull = `${ngayHen}T${gioHen}:00`;
      await mutateAsync({
        maKh: "KH001", // Chỗ này sau này m lấy từ Token/Session người dùng nhé
        maNs,
        maGoi,
        ngayHen,
        gioHen: gioHenFull,
      });
      alert("Đặt lịch thành công!");
    } catch {
      alert("Đặt lịch thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-blue-100">
        
        {/* Title */}
        <div className="flex items-center gap-2 text-blue-700">
          <CalendarDays className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Đặt lịch khám</h2>
        </div>

        {/* Bác sĩ (Dropdown) */}
        <div className="space-y-1">
          <label htmlFor="selectBacSi" className="text-sm font-medium text-gray-600">Bác sĩ phụ trách</label>
          <select
            id="selectBacSi"
            title="Chọn bác sĩ"
            value={maNs}
            onChange={(e) => setMaNs(e.target.value)}
            disabled={loadingBs}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">-- Chọn bác sĩ --</option>
            {listBacSi?.map((bs: { maNs: string; hoTen: string; chuyenKhoa: string }) => (
              <option key={bs.maNs} value={bs.maNs}>
                Bs. {bs.hoTen} - {bs.chuyenKhoa || "Khám chung"}
              </option>
            ))}
          </select>
        </div>

        {/* Gói khám (Dropdown) */}
        <div className="space-y-1">
          <label htmlFor="selectGoiKham" className="text-sm font-medium text-gray-600">Gói khám dịch vụ</label>
          <select
            id="selectGoiKham"
            title="Chọn gói khám"
            value={maGoi}
            onChange={(e) => setMaGoi(e.target.value)}
            disabled={loadingGoi}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">-- Chọn gói khám --</option>
            {listGoiKham?.map((goi: { maGoi: string; tenGoi: string; gia: number }) => (
              <option key={goi.maGoi} value={goi.maGoi}>
                {goi.tenGoi} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(goi.gia)}
              </option>
            ))}
          </select>
        </div>

        {/* Kẹp Ngày & Giờ lên cùng 1 hàng cho form ngắn lại */}
        <div className="grid grid-cols-2 gap-4">
            {/* Ngày */}
            <div className="space-y-1 flex flex-col">
            <label htmlFor="ngayHen" className="text-sm font-medium text-gray-600">Ngày khám</label>
            <input
                id="ngayHen"
                type="date"
                min={new Date().toISOString().split('T')[0]} // Chặn chọn ngày trong quá khứ
                onChange={(e) => setNgayHen(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            </div>

            {/* Giờ */}
            <div className="space-y-1 flex flex-col">
            <label htmlFor="gioHen" className="text-sm font-medium text-gray-600">Giờ khám</label>
            <input
                id="gioHen"
                type="time"
                onChange={(e) => setGioHen(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isPending || !maNs || !maGoi || !ngayHen || !gioHen}
          className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {isPending ? "Đang xử lý..." : "Xác nhận đặt lịch"}
        </Button>
      </div>
    </div>
  );
}