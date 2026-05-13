"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { 
  CalendarDays, Clock, User, Stethoscope, 
  ChevronRight, AlertCircle, CalendarCheck, History 
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useDanhSachLichHen } from "@/hooks/useStaff"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Định nghĩa Interface chuẩn thay vì dùng any
interface Appointment {
  maLh: string | number;
  ngayHen: string;
  gioHen: string;
  tenBacSi: string;
  tenGoiKham: string;
  trangThai: string;
}

interface APIResponse {
  content: Appointment[];
}

export default function CustomerAppointmentsPage() {
  const router = useRouter();
  const [maKh, setMaKh] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.maKh || "";
      }
    }
    return "";
  });

  const { data, isLoading } = useDanhSachLichHen({
    keyword: maKh,
    page: 0,
    size: 100
  });

  const appointments = (data as unknown as APIResponse)?.content || [];

  const upcoming = appointments.filter((item) => 
    item.trangThai === "CHO_XAC_NHAN" || item.trangThai === "DA_XAC_NHAN"
  );
  
  const history = appointments.filter((item) => 
    item.trangThai === "DA_CHECK_IN" || item.trangThai === "DA_HUY" || item.trangThai === "HOAN_THANH"
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Lịch hẹn của tôi</h1>
          <p className="text-slate-500 mt-1">Theo dõi tiến độ khám và xem lại lịch sử tư vấn.</p>
        </div>
        <Button 
          onClick={() => router.push("/booking")}
          className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow-sm"
        >
          <CalendarDays className="mr-2 h-4 w-4" /> Đặt lịch mới
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-slate-100">
          <TabsTrigger value="upcoming" className="font-bold">
            <CalendarCheck className="w-4 h-4 mr-2" /> Sắp tới ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="font-bold">
            <History className="w-4 h-4 mr-2" /> Lịch sử ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
             <LoadingState />
          ) : upcoming.length > 0 ? (
            upcoming.map((item) => <AppointmentCard key={item.maLh} item={item} isHistory={false} />)
          ) : (
            <EmptyState message="Ông giáo chưa có lịch hẹn sắp tới nào." />
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {isLoading ? (
             <LoadingState />
          ) : history.length > 0 ? (
            history.map((item) => <AppointmentCard key={item.maLh} item={item} isHistory={true} />)
          ) : (
            <EmptyState message="Chưa có dữ liệu lịch sử khám bệnh." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AppointmentCard({ item, isHistory }: { item: Appointment, isHistory: boolean }) {
  return (
    <Card className={`group border-l-4 transition-all hover:shadow-md ${isHistory ? 'border-l-slate-300' : 'border-l-blue-500'}`}>
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
               <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Stethoscope className="w-5 h-5" />
               </span>
               <div>
                  <h3 className="font-bold text-slate-900 leading-none">{item.tenGoiKham || "Khám thị lực"}</h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Mã LH: {item.maLh}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-slate-400" /><span>Ngày: {item.ngayHen}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /><span>Giờ: {item.gioHen}</span></div>
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /><span>Bác sĩ: {item.tenBacSi || "Đang chờ"}</span></div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
            <StatusBadge status={item.trangThai} />
            {!isHistory && (
              <Button variant="ghost" size="sm" className="text-blue-600 group">
                Xem chi tiết <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, color: string }> = {
    "CHO_XAC_NHAN": { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700 border-amber-200" },
    "DA_XAC_NHAN": { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700 border-blue-200" },
    "DA_CHECK_IN": { label: "Đã check-in", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    "HOAN_THANH": { label: "Đã khám", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "DA_HUY": { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200" },
  };
  const config = configs[status] || configs["CHO_XAC_NHAN"];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
      {config.label}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 w-full bg-slate-100 animate-pulse rounded-xl" />
      ))}
    </div>
  );
}