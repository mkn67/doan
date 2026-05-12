"use client";

import React, { useState, useEffect } from "react";
import { Receipt, CreditCard, CheckCircle2, Clock, Loader2, Download } from "lucide-react";
import { useDanhSachHoaDon } from "@/hooks/useBilling"; 
import { HoaDonResponseDTO } from "@/types/billing";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PageResponseDTO {
  content?: unknown[];
  data?: unknown[];
}

interface UserInfo {
  hoTen?: string;
  maKh?: string;
  username?: string;
}

export default function CustomerBillingPage() {
  const { data: listHoaDon, isLoading } = useDanhSachHoaDon();
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {
          console.error("Lỗi parse user", e);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const invoices: HoaDonResponseDTO[] = Array.isArray(listHoaDon) 
    ? listHoaDon 
    : ((listHoaDon as unknown as PageResponseDTO)?.content as HoaDonResponseDTO[]) || [];

  // Lọc chỉ lấy hóa đơn của chính user này (Dựa vào Tên hoặc Mã KH liên kết với tài khoản)
  // Nếu Backend của m đã filter theo token người dùng rồi thì bỏ đoạn .filter() này đi nhé.
  const myInvoices = invoices.filter(hd => {
    if (!currentUser) return false;
    return hd.tenKhachHang === currentUser.hoTen;
  });

  if (!isMounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Receipt className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hóa Đơn & Thanh Toán</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý chi phí khám chữa bệnh và mua sắm của bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : myInvoices.length > 0 ? (
          myInvoices.map((hd) => (
            <Card key={hd.maHd} className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-lg">{hd.maHd}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      hd.trangThai === "Đã thanh toán" || hd.trangThai === "Thành công" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {hd.trangThai === "Đã thanh toán" || hd.trangThai === "Thành công" 
                        ? <CheckCircle2 className="w-3 h-3 mr-1" /> 
                        : <Clock className="w-3 h-3 mr-1" />}
                      {hd.trangThai || "Chưa thanh toán"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Ngày lập: <span className="font-medium text-slate-700">{hd.ngayLap ? new Date(hd.ngayLap).toLocaleDateString("vi-VN") : "---"}</span>
                  </p>
                </div>
                
                <div className="flex flex-col sm:items-end gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-500 font-medium mb-1">Tổng thanh toán</p>
                    <p className="text-2xl font-black text-blue-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hd.tongTien || 0)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-slate-600 border-slate-300">
                    <Download className="w-4 h-4 mr-2" /> Tải PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">Chưa có hóa đơn nào</h3>
            <p className="text-slate-500 mt-1">Bạn chưa thực hiện giao dịch nào tại Vision Care.</p>
          </div>
        )}
      </div>
    </div>
  );
}