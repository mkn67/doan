"use client";

import React, { useState, useEffect } from "react";
import { Activity, Stethoscope, FileText, Eye, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLichSuKham } from "@/hooks/useClinic";

export default function CustomerHistoryPage() {
  const { user } = useAuth();
  const maKh = user?.maKh || "";
  const { data: responseData, isLoading } = useLichSuKham(maKh);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Dữ liệu trả về có cấu trúc { message, data: [...] }
  const realHistory = responseData?.data || [];

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

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : realHistory.length > 0 ? (
        <div className="relative border-l-2 border-slate-100 ml-4 pl-6 md:ml-6 md:pl-8 space-y-10">
          {realHistory.map((item: any) => (
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
                      <span>Ngày khám: {item.ngayKham ? new Date(item.ngayKham).toLocaleDateString("vi-VN") : "---"}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                      Mã HS: {item.maHoSo}
                    </span>
                  </div>
                  
                  <div className="p-5 md:p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Stethoscope className="w-3 h-3"/> Bác sĩ phụ trách
                        </p>
                        <p className="font-medium text-slate-800">{item.nhanSu?.hoTen || "Chưa rõ"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Eye className="w-3 h-3"/> Khách hàng
                        </p>
                        <p className="font-medium text-slate-800">{item.khachHang?.hoTen || user?.hoTen || "N/A"}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Kết luận của bác sĩ</p>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{item.ketLuan || "Không có kết luận chi tiết"}</p>
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
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">Chưa có lịch sử khám</h3>
          <p className="text-slate-500 mt-1">Lịch sử khám bệnh của bạn sẽ hiển thị tại đây sau khi bác sĩ hoàn tất buổi khám.</p>
        </div>
      )}

    </div>
  );
}