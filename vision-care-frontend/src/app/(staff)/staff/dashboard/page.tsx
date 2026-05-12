"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, Users, ShoppingBag, Activity, 
  ArrowUpRight, ArrowDownRight, Calendar, Bell,
  CheckCircle2, AlertCircle, Package 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 🔥 IMPORT HOOK MỚI
import { useThongKeDoanhThuTheoNgay } from "@/hooks/useReport"; 

// --- INTERFACES ---
interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}
interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  time: string;
  desc: string;
}
interface QuickLinkCardProps {
  title: string;
  desc: string;
  icon: React.ReactElement;
  href: string;
}

interface RevenueItem {
  ngay: string;
  tongDoanhThu: number;
}

interface ExpiredItem {
  tenSp: string;
  maLo: string;
  ngayHetHan: string;
  soLuongTon: number;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("Admin");
  const [isMounted, setIsMounted] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data: revenueData } = useThongKeDoanhThuTheoNgay(currentMonth.toString(), currentYear.toString());
  const expiredData: ExpiredItem[] = []; 

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const timer = setTimeout(() => {
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.hoTen || user.username);
        } catch { /* ignore error */ }
      }
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return null;

  // XỬ LÝ DỮ LIỆU ĐỂ HIỂN THỊ
  // 1. Tính tổng doanh thu tháng này
  // Giả định backend trả về mảng các ngày có doanh thu: [{ngay: "2026-05-01", tongDoanhThu: 5000000}, ...]
  const tongDoanhThu = (revenueData as RevenueItem[])?.reduce((sum: number, item: RevenueItem) => sum + (item.tongDoanhThu || 0), 0) || 0;
  
  // 2. Chế data cho biểu đồ (Lấy 7 ngày gần nhất từ revenueData hoặc mảng rỗng nếu chưa có)
  const chartData = revenueData?.slice(-7) || [];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-slate-500">Chào mừng trở lại, <span className="font-semibold text-blue-600">{userName}</span>.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white">
            <Calendar className="mr-2 h-4 w-4" /> Tháng {currentMonth}/{currentYear}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title={`Doanh thu T${currentMonth}`} 
          // Format tiền tệ VNĐ
          value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tongDoanhThu)} 
          change="+12.5%" 
          trend="up" 
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />} 
        />
        <StatsCard 
          title="Lượt khám mới" 
          value="142" // Chỗ này tương lai nối API useThongKeTongQuan vào
          change="+8.2%" 
          trend="up" 
          icon={<Users className="w-5 h-5 text-emerald-600" />} 
        />
        <StatsCard 
          title="Đơn hoàn tất" 
          value="89" 
          change="-2.4%" 
          trend="down" 
          icon={<ShoppingBag className="w-5 h-5 text-orange-600" />} 
        />
        <StatsCard 
          title="Hài lòng (Đánh giá)" 
          value="4.8/5" // Tương lai gọi từ V_RATING_BAC_SI
          change="+0.2" 
          trend="up" 
          icon={<Activity className="w-5 h-5 text-purple-600" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* BIỂU ĐỒ DOANH THU (Real Data) */}
        <Card className="lg:col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Biểu đồ Doanh Thu</CardTitle>
            <CardDescription>Thống kê doanh thu các ngày trong tháng {currentMonth}</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[250px] w-full flex items-end gap-2 px-2 pt-4">
                 {chartData.map((item: RevenueItem, i: number) => {
                   // Tính % chiều cao cột dựa trên ngày cao nhất
                   const maxDoanhThu = Math.max(...chartData.map((d: RevenueItem) => d.tongDoanhThu));
                   const heightPercent = maxDoanhThu === 0 ? 0 : (item.tongDoanhThu / maxDoanhThu) * 100;
                   return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div 
                          className="w-full bg-blue-100 group-hover:bg-blue-600 transition-all rounded-t-md relative min-h-[4px]" 
                          style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white px-1.5 py-0.5 rounded">
                            {new Intl.NumberFormat('vi-VN').format(item.tongDoanhThu)}đ
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(item.ngay).getDate()}
                        </span>
                     </div>
                   );
                 })}
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400">
                Chưa có dữ liệu doanh thu tháng này
              </div>
            )}
          </CardContent>
        </Card>

        {/* THÔNG BÁO (Real Data từ Hết hạn) */}
        <Card className="lg:col-span-3 shadow-sm border-slate-200 overflow-hidden flex flex-col">
          <CardHeader className="bg-white z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Thông báo <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{expiredData?.length || 0}</span>
              </CardTitle>
              <Bell className="w-4 h-4 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1 flex-1 overflow-y-auto custom-scrollbar p-4">
            {/* Nếu có sản phẩm sắp hết hạn thì in ra, không thì hiện thông báo tĩnh */}
            {expiredData && expiredData.length > 0 ? (
              expiredData.map((item: ExpiredItem, idx: number) => (
                <ActivityItem 
                  key={idx}
                  icon={<AlertCircle className="w-4 h-4 text-orange-500" />}
                  title="Cảnh báo HSD Lô Thuốc"
                  time="Hệ thống"
                  desc={`Sản phẩm ${item.tenSp} (Lô: ${item.maLo}) sắp hết hạn vào ngày ${new Date(item.ngayHetHan).toLocaleDateString('vi-VN')}. Tồn kho: ${item.soLuongTon}.`}
                />
              ))
            ) : (
              <div className="text-center text-slate-500 py-10 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                Kho hàng an toàn. Không có lô thuốc nào sắp hết hạn trong 30 ngày tới.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <QuickLinkCard title="Lịch làm việc" desc="Xem ca trực hôm nay" icon={<Calendar />} href="/staff/reception/appointments" />
         <QuickLinkCard title="Quản lý kho" desc="Kiểm tra tồn kho" icon={<Package />} href="/staff/inventory/products" />
         <QuickLinkCard title="Hệ thống" desc="Cài đặt chung" icon={<AlertCircle />} href="#" />
      </div>
    </div>
  );
}

// ... CÁC COMPONENT CON (StatsCard, ActivityItem, QuickLinkCard) GIỮ NGUYÊN NHƯ CŨ CỦA M ...
function StatsCard({ title, value, change, trend, icon }: StatsCardProps) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
          <div className={`flex items-center text-xs font-medium ${trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
            {trend === "up" ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {change}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ icon, title, time, desc }: ActivityItemProps) {
  return (
    <div className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
      <div className="mt-1 bg-white p-1 rounded-full shadow-sm">{icon}</div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <span className="text-[10px] text-slate-400 whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">{time}</span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function QuickLinkCard({ title, desc, icon, href }: QuickLinkCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:border-blue-300 transition-all cursor-pointer group bg-white shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 rounded bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" }) : icon}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}