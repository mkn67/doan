"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link"; // FIX: Thiếu import Link
import { 
  TrendingUp, Users, ShoppingBag, Activity, 
  ArrowUpRight, ArrowDownRight, Calendar, Bell,
  CheckCircle2, Clock, AlertCircle, Package // FIX: Thiếu import Package
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 1. ĐỊNH NGHĨA INTERFACES (Trị lỗi any và TypeScript)
interface StatsCardProps {
  title: string;
  value: string;
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

export default function DashboardPage() {
  const [userName, setUserName] = useState("Admin");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    
    // FIX: Trị lỗi react-hooks/set-state-in-effect bằng setTimeout
    const timer = setTimeout(() => {
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.username);
      }
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return null;

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
            <Calendar className="mr-2 h-4 w-4" /> 01/05/2026 - 08/05/2026
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Doanh thu tháng" 
          value="128.450.000đ" 
          change="+12.5%" 
          trend="up" 
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />} 
        />
        <StatsCard 
          title="Lượt khám mới" 
          value="142" 
          change="+8.2%" 
          trend="up" 
          icon={<Users className="w-5 h-5 text-emerald-600" />} 
        />
        <StatsCard 
          title="Đơn kính hoàn tất" 
          value="89" 
          change="-2.4%" 
          trend="down" 
          icon={<ShoppingBag className="w-5 h-5 text-orange-600" />} 
        />
        <StatsCard 
          title="Chỉ số hài lòng" 
          value="98%" 
          change="+1.0%" 
          trend="up" 
          icon={<Activity className="w-5 h-5 text-purple-600" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Hoạt động khám bệnh</CardTitle>
            <CardDescription>Thống kê số ca khám trong 7 ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-end gap-4 px-2 pt-4">
               {[40, 65, 45, 90, 55, 80, 70].map((height, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-blue-100 group-hover:bg-blue-600 transition-all rounded-t-md relative" 
                      style={{ height: `${height}%` } as React.CSSProperties}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">{height} ca</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">T{i+2}</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Thông báo</CardTitle>
              <Bell className="w-4 h-4 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActivityItem 
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              title="Khám xong: KH001"
              time="2 phút trước"
              desc="BS. Thu Diễm đã hoàn tất ca khám khúc xạ."
            />
            <ActivityItem 
              icon={<Clock className="w-4 h-4 text-blue-500" />}
              title="Lịch hẹn mới"
              time="15 phút trước"
              desc="Bệnh nhân Nguyễn Văn A vừa đặt lịch khám lúc 15:00."
            />
            <ActivityItem 
              icon={<AlertCircle className="w-4 h-4 text-orange-500" />}
              title="Sắp hết hàng"
              time="1 giờ trước"
              desc="Gọng kính Ray-Ban RB3016 chỉ còn 2 sản phẩm trong kho."
            />
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

// --- SUB COMPONENTS ---

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
    <div className="flex gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
      <div className="mt-1">{icon}</div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <span className="text-[10px] text-slate-400 whitespace-nowrap">{time}</span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-1">{desc}</p>
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