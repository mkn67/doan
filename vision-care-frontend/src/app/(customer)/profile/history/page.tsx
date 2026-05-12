"use client";

import React from "react";
import { Activity, Stethoscope, FileText, Eye, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// TODO: Sau này nối với hook useDanhSachLichSuKham(user.maKh)
const mockHistory = [
  {
    maHoSo: "HS_S04",
    ngayKham: "08/05/2026",
    bacSi: "BS. Nguyễn Thị Hương",
    dichVu: "Khám mắt tổng quát, Đo khúc xạ",
    ketLuan: "Cận thị nặng hai mắt. Cần nhỏ Rohto và đổi kính mỏng.",
    toaThuoc: "Thuốc nhỏ mắt Rohto (2 lọ), Tròng Poly siêu mỏng"
  },
  {
    maHoSo: "HS_S01",
    ngayKham: "10/12/2025",
    bacSi: "BS. Đặng Thu Diễm",
    dichVu: "Kiểm tra nhãn áp, Soi đáy mắt",
    ketLuan: "Mắt phải có dấu hiệu tăng nhãn áp nhẹ. Theo dõi định kỳ.",
    toaThuoc: "Nước mắt nhân tạo"
  }
];

export default function CustomerHistoryPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lịch Sử Khám Bệnh</h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi tình trạng sức khỏe thị lực qua các lần thăm khám.</p>
        </div>
      </div>

      <div className="relative border-l-2 border-slate-100 ml-4 pl-6 md:ml-6 md:pl-8 space-y-10">
        {mockHistory.map((item) => (
          <div key={item.maHoSo} className="relative">
            {/* Cục tròn mốc thời gian */}
            <div className="absolute -left-[35px] md:-left-[43px] top-0 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>

            <Card className="border-slate-200 hover:border-emerald-300 transition-colors shadow-sm">
              <CardContent className="p-0">
                <div className="p-4 md:p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>Ngày khám: {item.ngayKham}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                    Mã HS: {item.maHoSo}
                  </span>
                </div>
                
                <div className="p-5 md:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Stethoscope className="w-3 h-3"/> Bác sĩ phụ trách</p>
                      <p className="font-medium text-slate-800">{item.bacSi}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Eye className="w-3 h-3"/> Dịch vụ thực hiện</p>
                      <p className="font-medium text-slate-800">{item.dichVu}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Kết luận của bác sĩ</p>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{item.ketLuan}</p>
                  </div>

                  {item.toaThuoc && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
                      <p><strong>Toa thuốc / Vật tư:</strong> {item.toaThuoc}</p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0 h-auto font-semibold">
                      Xem chi tiết đơn thuốc <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Mốc cuối cùng */}
        <div className="relative">
           <div className="absolute -left-[35px] md:-left-[43px] top-0 w-6 h-6 rounded-full bg-slate-200 border-4 border-white shadow-sm" />
           <p className="text-slate-400 text-sm font-medium pt-0.5">Khởi tạo hồ sơ</p>
        </div>
      </div>

    </div>
  );
}