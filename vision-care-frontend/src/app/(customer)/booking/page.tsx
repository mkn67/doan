"use client";

import "@/app/globals.css";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { useDatLich } from "@/hooks/useClinic";

export default function BookingPage() {
  const { mutateAsync, isPending } = useDatLich();

  const [maNs, setMaNs] = useState("");
  const [maGoi, setMaGoi] = useState("");
  const [ngayHen, setNgayHen] = useState("");
  const [gioHen, setGioHen] = useState("");

  const handleSubmit = async () => {
    if (!maNs || !maGoi || !ngayHen || !gioHen) {
      alert("Thiếu thông tin!");
      return;
    }

    try {
      const gioHenFull = `${ngayHen}T${gioHen}:00`;

      await mutateAsync({
        maKh: "KH001",
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
          <CalendarDays />
          <h2 className="text-2xl font-bold">Đặt lịch khám</h2>
        </div>

        {/* Bác sĩ */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Bác sĩ</label>
          <input
            placeholder="Nhập mã bác sĩ"
            onChange={(e) => setMaNs(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Gói khám */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Gói khám</label>
          <input
            placeholder="Nhập mã gói"
            onChange={(e) => setMaGoi(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Ngày */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Ngày khám</label>
          <input
            type="date"
            onChange={(e) => setNgayHen(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Giờ */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Giờ khám</label>
          <input
            type="time"
            onChange={(e) => setGioHen(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Button */}
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all hover:scale-[1.02]"
        >
          {isPending ? "Đang đặt..." : "Đặt lịch"}
        </Button>
      </div>
    </div>
  );
}