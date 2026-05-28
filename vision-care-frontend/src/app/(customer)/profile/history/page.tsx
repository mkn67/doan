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
                  
                  <div className="p-5 md:p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Stethoscope className="w-4 h-4 text-emerald-500"/> Bác sĩ phụ trách
                        </p>
                        <p className="font-bold text-slate-800 text-sm">{item.tenBacSi || "Chưa rõ"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Eye className="w-4 h-4 text-emerald-500"/> Khách hàng
                        </p>
                        <p className="font-bold text-slate-800 text-sm">{item.tenKhachHang || user?.hoTen || "N/A"}</p>
                      </div>
                    </div>

                    {/* Ophthalmic parameters table */}
                    {item.danhSachThiLuc && item.danhSachThiLuc.length > 0 && (
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-2">Mắt (Eye)</th>
                              <th className="px-4 py-2 text-center">Độ Cầu (SPH)</th>
                              <th className="px-4 py-2 text-center">Độ Loạn (CYL)</th>
                              <th className="px-4 py-2 text-center">Trục (AXIS)</th>
                              <th className="px-4 py-2 text-center">Thị lực (VA)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                            {/* OD - Mắt Phải */}
                            {(() => {
                              const od = item.danhSachThiLuc.find((ct: any) => ct.loaiMat === "P") || {};
                              return (
                                <tr className="hover:bg-slate-50">
                                  <td className="px-4 py-2.5 font-bold text-blue-600">Phải (OD)</td>
                                  <td className="px-4 py-2.5 text-center font-mono">{od.sph !== undefined && od.sph > 0 ? `+${od.sph.toFixed(2)}` : od.sph?.toFixed(2) || "0.00"} D</td>
                                  <td className="px-4 py-2.5 text-center font-mono">{od.cyl !== undefined && od.cyl > 0 ? `+${od.cyl.toFixed(2)}` : od.cyl?.toFixed(2) || "0.00"} D</td>
                                  <td className="px-4 py-2.5 text-center font-mono">{od.axis || "0"}°</td>
                                  <td className="px-4 py-2.5 text-center font-mono">{od.va || "10/10"}</td>
                                </tr>
                              );
                            })()}
                            {/* OS - Mắt Trái */}
                            {(() => {
                              const os = item.danhSachThiLuc.find((ct: any) => ct.loaiMat === "T") || {};
                              return (
                                <tr className="hover:bg-slate-50">
                                  <td className="px-4 py-2.5 font-bold text-indigo-600">Trái (OS)</td>
                                  <td className="px-4 py-2.5 text-center font-mono">{os.sph !== undefined && os.sph > 0 ? `+${os.sph.toFixed(2)}` : os.sph?.toFixed(2) || "0.00"} D</td>
                                  <td className="px-4 py-2.5 text-center font-mono">{os.cyl !== undefined && os.cyl > 0 ? `+${os.cyl.toFixed(2)}` : os.cyl?.toFixed(2) || "0.00"} D</td>
                                  <td className="px-4 py-2.5 text-center font-mono">{os.axis || "0"}°</td>
                                  <td className="px-4 py-2.5 text-center font-mono">{os.va || "10/10"}</td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-500">
                          <span>Khoảng cách đồng tử (PD):</span>
                          <span className="font-mono text-emerald-600 text-sm font-bold">{(item.danhSachThiLuc[0]?.pd || item.danhSachThiLuc[1]?.pd || 60)} mm</span>
                        </div>
                      </div>
                    )}

                    {/* Diagnosis / Conclusion */}
                    <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/80">
                      <p className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        📋 Kết luận chẩn đoán
                      </p>
                      <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                        {item.ketLuan || "Không có kết luận chi tiết từ chuyên viên."}
                      </p>
                    </div>

                    {/* Processing order & eye drops */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          👓 Yêu cầu mài lắp kính gia công
                        </p>
                        {item.donKinh ? (
                          <p className="text-sm font-bold text-slate-800">{item.donKinh}</p>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Không có chỉ định gia công kính.</p>
                        )}
                      </div>
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          💧 Thuốc nhỏ mắt chỉ định
                        </p>
                        {item.donThuocList && item.donThuocList.length > 0 ? (
                          <ul className="space-y-1.5 list-decimal pl-4">
                            {item.donThuocList.map((med: string, i: number) => (
                              <li key={i} className="text-xs font-semibold text-slate-800 break-words leading-relaxed">
                                {med}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Không có thuốc nhỏ mắt chỉ định.</p>
                        )}
                      </div>
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