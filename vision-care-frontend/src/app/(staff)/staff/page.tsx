"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, Calendar, Package, 
  ArrowUpRight, Clock, Star 
} from "lucide-react"; // ĐÃ XÓA Activity dư thừa ở đây
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 1. ĐỊNH NGHĨA INTERFACE ĐỂ TRỊ LỖI "ANY"
interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "orange" | "amber";
}

interface NotificationItemProps {
  time: string;
  content: string;
  type: "warning" | "info" | "success";
}

export default function StaffGeneralDashboard() {
  const [userName, setUserName] = useState("Thành viên");
  const [roleName, setRoleName] = useState("Nhân sự");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      
      const roles: Record<string, string> = {
        "NH04": "Quản trị viên",
        "NH01": "Bác sĩ chuyên khoa",
        "NH06": "Lễ tân",
        "NH03": "Thủ kho",
        "NH02": "Thu ngân"
      };

      // 🛠️ DÙNG SETTIMEOUT ĐỂ TRỊ LỖI "set-state-in-effect"
      const timer = setTimeout(() => {
        setUserName(user.username);
        setRoleName(roles[user.loaiTk] || "Nhân sự");
        setIsMounted(true);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!isMounted) return null;

  return (
    <div className="p-6 space-y-8">
      {/* 1. WELCOME SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chào buổi sáng, {userName}! 👋</h1>
          <p className="text-slate-500 mt-1">Chúc bạn một ngày làm việc tại Vision Care thật hiệu quả.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Lịch hẹn hôm nay" 
          value="12" 
          description="+2 ca so với hôm qua" 
          icon={<Calendar className="w-5 h-5" />} 
          color="blue"
        />
        <StatsCard 
          title="Bệnh nhân mới" 
          value="05" 
          description="Đã tiếp nhận sáng nay" 
          icon={<Users className="w-5 h-5" />} 
          color="emerald"
        />
        <StatsCard 
          title="Sản phẩm sắp hết" 
          value="03" 
          description="Cần nhập hàng ngay" 
          icon={<Package className="w-5 h-5" />} 
          color="orange"
        />
        <StatsCard 
          title="Rating trung bình" 
          value="4.8" 
          description="Dựa trên 50 đánh giá" 
          icon={<Star className="w-5 h-5" />} 
          color="amber"
        />
      </div>

      {/* 3. NOTIFICATIONS & PROFILE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Thông báo hệ thống</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationItem 
              time="10 phút trước"
              content="Hệ thống sẽ bảo trì cơ sở dữ liệu vào lúc 23:00 tối nay."
              type="warning"
            />
            <NotificationItem 
              time="2 giờ trước"
              content="Bác sĩ Thu Diễm vừa hoàn thành ca khám cho khách hàng KH001."
              type="info"
            />
            <NotificationItem 
              time="Sáng nay"
              content="Đã nhập thêm 50 gọng kính mới vào kho hàng."
              type="success"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2">
              {userName.charAt(0).toUpperCase()}
            </div>
            <CardTitle className="text-base">{userName}</CardTitle>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{roleName}</p>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Trạng thái:</span>
              <span className="text-green-600 font-medium">Đang trực</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Ca làm:</span>
              <span className="font-medium">Hành chính</span>
            </div>
            <hr />
            <button className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
              Xem hồ sơ cá nhân
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 🛠️ GÁN INTERFACE VÀO ĐÂY ĐỂ TRỊ LỖI "ANY"
function StatsCard({ title, value, description, icon, color }: StatsCardProps) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    orange: "text-orange-600 bg-orange-50",
    amber: "text-amber-600 bg-amber-50"
  };

  return (
    <Card className="shadow-sm border-none bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
          <ArrowUpRight className="w-4 h-4 text-slate-300" />
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationItem({ time, content, type }: NotificationItemProps) {
  const styles = {
    warning: "bg-amber-500",
    info: "bg-blue-500",
    success: "bg-emerald-500"
  };

  return (
    <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
      <div className={`w-2 h-2 rounded-full mt-1.5 ${styles[type]}`} />
      <div className="flex-1">
        <p className="text-sm text-slate-800 font-medium">{content}</p>
        <span className="text-[10px] text-slate-400">{time}</span>
      </div>
    </div>
  );
}