"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Users, Clock, PlayCircle, UserCheck, Loader2 } from "lucide-react";

// Nhớ import đúng chỗ m đang để mấy cái hook này nhé (Khuyên thật là nên vứt hết về useClinic)
import { useHangChoHomNay, useGoiVaoKham } from "@/hooks/useClinic"; 
import { Button } from "@/components/ui/button";

interface HangChoItem {
  mahc: string;
  maKh: string;
  tenKhach: string;
  loaiKhach?: string;
  gioDangKy?: string;
  trangThai?: string;
}

export default function QueuePage() {
  const router = useRouter();
  
  // Lấy danh sách hàng chờ
  const { data, isLoading } = useHangChoHomNay();
  // Khai báo hook Gọi Khám
  const goiKhamMutation = useGoiVaoKham();

  // Bắt lỗi phân trang của Backend (nếu có)
  const queueList: HangChoItem[] = data?.content || data || [];

  // 🔥 HÀM XỬ LÝ KHI BÁC SĨ BẤM NÚT "GỌI KHÁM"
  const handleGoiKham = (maKh: string, maHc: string) => {
    // 1. Gọi API để đổi trạng thái dưới DB thành "Đang khám"
    goiKhamMutation.mutate(maHc, {
      onSuccess: () => {
        // 2. Nếu BE update thành công, chuyển hướng sang trang Khám bệnh
        // Mang theo cả makh và mahc lên URL để form bên kia biết mà làm việc
        router.push(`/staff/clinic/examinations?makh=${maKh}&mahc=${maHc}`);
      }
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl shadow-sm">
          <Users className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh Sách Hàng Chờ</h1>
          <p className="text-slate-500 mt-1">
            Bệnh nhân đang chờ tới lượt khám tại phòng khám.
          </p>
        </div>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="py-4 px-6 font-semibold w-16 text-center">STT</th>
                <th className="py-4 px-6 font-semibold">Tên bệnh nhân</th>
                <th className="py-4 px-6 font-semibold text-center">Nguồn</th>
                <th className="py-4 px-6 font-semibold"><div className="flex items-center gap-2"><Clock className="w-4 h-4"/> Giờ đăng ký</div></th>
                <th className="py-4 px-6 font-semibold text-center">Trạng thái</th>
                <th className="py-4 px-6 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                    Đang tải danh sách hàng chờ...
                  </td>
                </tr>
              ) : queueList.length > 0 ? (
                queueList.map((item: HangChoItem, index: number) => (
                  <tr key={item.mahc || index} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 text-center font-semibold text-slate-400">{index + 1}</td>
                    
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {item.tenKhach}
                      <div className="text-xs font-normal text-slate-500 mt-0.5">Mã KH: {item.maKh}</div>
                    </td>
                    
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        item.loaiKhach === 'ONLINE' 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {item.loaiKhach || "TẠI CHỖ"}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {item.gioDangKy ? new Date(item.gioDangKy).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : "---"}
                    </td>
                    
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        item.trangThai === 'Đang khám' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {item.trangThai === 'Đang chờ' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                        {item.trangThai || "Đang chờ"}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6 text-center">
                      <Button 
                        onClick={() => handleGoiKham(item.maKh, item.mahc)}
                        disabled={goiKhamMutation.isPending || item.trangThai === 'Đang khám'}
                        className={`h-9 px-4 text-xs font-semibold shadow-sm w-32 ${
                          item.trangThai === 'Đang khám' 
                            ? "bg-slate-100 text-slate-400 hover:bg-slate-100" 
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {goiKhamMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Đang gọi...</>
                        ) : item.trangThai === 'Đang khám' ? (
                          "Đang khám"
                        ) : (
                          <><PlayCircle className="w-4 h-4 mr-1.5" /> Gọi Khám</>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <UserCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-base font-medium text-slate-600">Hiện không có bệnh nhân nào chờ</p>
                    <p className="text-sm text-slate-400 mt-1">Bác sĩ có thể nghỉ ngơi hoặc xem lại hồ sơ cũ.</p>
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