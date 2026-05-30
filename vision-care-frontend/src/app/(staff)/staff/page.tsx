"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, Calendar, Package, ArrowUpRight, Clock, Star,
  TrendingUp, AlertTriangle, Activity, ArrowRight, Shield,
  Search, Briefcase, Key, RefreshCw, FileText, CheckCircle, Flame, Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";

// TypeScript Interfaces
interface StatsCardProps {
  title: string;
  value: string;
  subtext: string;
  percentage: string;
  isPositive: boolean;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
}

interface ActivityItem {
  id: string;
  time: string;
  user: string;
  action: string;
  detail: string;
  type: "success" | "info" | "warning";
}

export default function StaffGeneralDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Thành viên");
  const [fullName, setFullName] = useState("");
  const [roleName, setRoleName] = useState("Nhân sự");
  const [roleCode, setRoleCode] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [chartMode, setChartMode] = useState<"revenue" | "appointments">("revenue");
  const [activePoint, setActivePoint] = useState<number | null>(null);

  // Time-based greetings
  const [greeting, setGreeting] = useState("Chào buổi sáng");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Chào buổi sáng");
    else if (hours < 18) setGreeting("Chào buổi chiều");
    else setGreeting("Chào buổi tối");

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.username || "Thành viên");
        setFullName(user.hoTen || user.username || "");
        
        const userRoles = user.roles || [];
        const userGroup = user.maNhom || user.loaiTk;
        
        let rName = "Nhân viên";
        if (userRoles.includes("ROLE_ADMIN") || userGroup === "NH04") {
          rName = "Quản trị viên";
          setRoleCode("ADMIN");
          router.replace("/staff/dashboard");
          return;
        } else if (userRoles.includes("ROLE_BAC_SI") || userGroup === "NH01") {
          rName = "Bác sĩ Chuyên khoa";
          setRoleCode("BAC_SI");
          router.replace("/staff/clinic/examinations");
          return;
        } else if (userRoles.includes("ROLE_LE_TAN") || userGroup === "NH06") {
          rName = "Lễ tân Điều phối";
          setRoleCode("LE_TAN");
          router.replace("/staff/reception/appointments");
          return;
        } else if (userRoles.includes("ROLE_THU_KHO") || userGroup === "NH03") {
          rName = "Thủ kho kiểm hàng";
          setRoleCode("THU_KHO");
          router.replace("/staff/inventory/products");
          return;
        } else if (userRoles.includes("ROLE_THU_NGAN") || userGroup === "NH02") {
          rName = "Thu ngân";
          setRoleCode("THU_NGAN");
          router.replace("/staff/cashier/payments");
          return;
        } else if (userRoles.includes("ROLE_KY_THUAT") || userGroup === "NH05") {
          rName = "Kỹ thuật viên mài lắp";
          setRoleCode("KY_THUAT");
          router.replace("/staff/workshop/glasses");
          return;
        }
        setRoleName(rName);
        setIsMounted(true);
      } catch (e) {
        console.error("Lỗi parse user: ", e);
        setIsMounted(true);
      }
    } else {
      setIsMounted(true);
    }
  }, [router]);

  if (!isMounted) return null;

  // Premium mock data for charts
  const weeklyRevenue = [
    { day: "Thứ 2", value: 12500000, count: 18 },
    { day: "Thứ 3", value: 16800000, count: 24 },
    { day: "Thứ 4", value: 14200000, count: 19 },
    { day: "Thứ 5", value: 21500000, count: 32 },
    { day: "Thứ 6", value: 19800000, count: 28 },
    { day: "Thứ 7", value: 28500000, count: 42 },
    { day: "Chủ Nhật", value: 32000000, count: 48 }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // Quick actions based on Role
  const getQuickActions = () => {
    switch (roleCode) {
      case "ADMIN":
        return [
          { title: "Sao lưu CSDL", desc: "Xuất file SQL sao lưu hệ thống", link: "/staff/admin", icon: <DatabaseIcon /> },
          { title: "Xuất doanh thu", desc: "Tải báo cáo tài chính Excel", link: "/staff/admin", icon: <FileSpreadsheetIcon /> },
          { title: "Quản lý nhân sự", desc: "Quản lý nhân viên & tài khoản", link: "/staff/admin/employees", icon: <UsersIcon /> },
          { title: "Phân quyền", desc: "Quản lý nhóm quyền hệ thống", link: "/staff/admin/roles", icon: <ShieldIcon /> }
        ];
      case "BAC_SI":
        return [
          { title: "Hồ sơ khám bệnh", desc: "Khám bệnh & Đo khúc xạ", link: "/staff/clinic/examinations", icon: <ActivityIcon /> },
          { title: "Kê đơn thuốc kính", desc: "Lập đơn kính cho bệnh nhân", link: "/staff/clinic/prescriptions", icon: <FileTextIcon /> },
          { title: "Hàng chờ khám", desc: "Bệnh nhân đang chờ đo mắt", link: "/staff/clinic/queue", icon: <ClockIcon /> }
        ];
      case "LE_TAN":
        return [
          { title: "Tiếp đón & Xếp lớp", desc: "Đăng ký STT khám cho khách", link: "/staff/clinic/queue", icon: <UsersIcon /> },
          { title: "Đặt lịch hẹn", desc: "Đặt ca khám mới cho bác sĩ", link: "/staff/clinic/queue", icon: <CalendarIcon /> }
        ];
      case "THU_NGAN":
        return [
          { title: "Thanh toán hóa đơn", desc: "Xuất hóa đơn & thu tiền", link: "/staff/cashier/payments", icon: <TrendingUpIcon /> },
          { title: "Báo cáo ngày", desc: "Doanh thu ca làm việc", link: "/staff/cashier", icon: <FileSpreadsheetIcon /> }
        ];
      case "KY_THUAT":
        return [
          { title: "Xưởng mài kính", desc: "Danh sách đơn tròng cần gia công", link: "/staff/workshop/glasses", icon: <ActivityIcon /> }
        ];
      default:
        return [
          { title: "Phòng khám mắt", desc: "Hàng chờ Vision Care hôm nay", link: "/staff/clinic/queue", icon: <ClockIcon /> },
          { title: "Báo cáo doanh số", desc: "Thống kê tổng quan hoạt động", link: "/staff/cashier", icon: <TrendingUpIcon /> }
        ];
    }
  };

  // Mock list of active duties
  const activeStaff = [
    { name: "BS. Thu Diễm", role: "Khúc xạ nhãn khoa", status: "Trong phòng khám", online: true },
    { name: "KTV. Anh Tuấn", role: "Mài lắp tròng kính", status: "Đang gia công", online: true },
    { name: "LT. Thanh Nhàn", role: "Lễ tân điều phối", status: "Bàn tiếp đón", online: true },
    { name: "TN. Minh Thư", role: "Thu ngân chính", status: "Quầy thanh toán", online: false }
  ];

  // Activities Feed
  const recentActivities: ActivityItem[] = [
    { id: "1", time: "5 phút trước", user: "Hệ thống", action: "Khấu hao tự động", detail: "KTV báo hỏng tròng kính đơn XL023 - Đã trừ 1 SP kho theo FIFO", type: "warning" },
    { id: "2", time: "12 phút trước", user: "TN. Minh Thư", action: "Hủy hóa đơn", detail: "Hủy hóa đơn HD004 - Đã tự động hoàn trả kho và hoàn VIP tích lũy", type: "info" },
    { id: "3", time: "25 phút trước", user: "BS. Thu Diễm", action: "Hoàn tất khám", detail: "Bệnh nhân KH003 đã đo xong khúc xạ (Mã HS: HS_NEW)", type: "success" },
    { id: "4", time: "1 giờ trước", user: "LT. Thanh Nhàn", action: "Tiếp đón mới", detail: "Khách hàng Nguyễn Văn B đã in STT #12 có QR Code định danh", type: "success" }
  ];

  // Custom SVG path calculation for charts
  const getSvgPath = () => {
    const data = weeklyRevenue;
    const maxVal = chartMode === "revenue" ? 35000000 : 50;
    const points = data.map((item, idx) => {
      const x = 50 + idx * 80;
      const val = chartMode === "revenue" ? item.value : item.count;
      const y = 220 - (val / maxVal) * 180;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cpX1 = points[i].x + 40;
      const cpY1 = points[i].y;
      const cpX2 = points[i+1].x - 40;
      const cpY2 = points[i+1].y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i+1].x} ${points[i+1].y}`;
    }
    return path;
  };

  const getSvgFillPath = () => {
    const data = weeklyRevenue;
    const maxVal = chartMode === "revenue" ? 35000000 : 50;
    const points = data.map((item, idx) => {
      const x = 50 + idx * 80;
      const val = chartMode === "revenue" ? item.value : item.count;
      const y = 220 - (val / maxVal) * 180;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cpX1 = points[i].x + 40;
      const cpY1 = points[i].y;
      const cpX2 = points[i+1].x - 40;
      const cpY2 = points[i+1].y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i+1].x} ${points[i+1].y}`;
    }
    path += ` L ${points[points.length-1].x} 230 L ${points[0].x} 230 Z`;
    return path;
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-slate-800">
      
      {/* 1. WELCOME GRADIENT GLASS BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white rounded-3xl p-8 shadow-xl shadow-blue-500/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/10 uppercase tracking-widest text-indigo-200">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Clinic Live Activity
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {greeting}, {fullName || userName}!
            </h1>
            <p className="text-indigo-100 text-sm max-w-xl font-medium">
              Chào mừng bạn trở lại ca làm việc tại Vision Care. Hệ thống phòng khám đang ghi nhận lượng khách ổn định.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-inner self-start md:self-auto">
            <div className="p-3 bg-white/15 rounded-xl">
              <Clock className="w-6 h-6 text-emerald-300 animate-spin-slow" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-indigo-200">Thời gian làm việc</p>
              <p className="text-sm font-bold mt-0.5">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PREMIUM STATS OVERVIEW GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Lịch hẹn hôm nay" 
          value="18" 
          subtext="12 ca đã hoàn tất khám" 
          percentage="+12.5%" 
          isPositive={true}
          icon={<Calendar className="w-5 h-5" />} 
          gradient="from-blue-500 to-indigo-600"
          glow="shadow-blue-500/10"
        />
        <StatsCard 
          title="Bệnh nhân chờ" 
          value="05" 
          subtext="Thời gian chờ TB: 12ph" 
          percentage="Live" 
          isPositive={true}
          icon={<Users className="w-5 h-5" />} 
          gradient="from-amber-500 to-orange-600"
          glow="shadow-orange-500/10"
        />
        <StatsCard 
          title="Doanh thu hôm nay" 
          value="24.8M" 
          subtext="Sau khi khấu trừ VIP" 
          percentage="+18.2%" 
          isPositive={true}
          icon={<TrendingUp className="w-5 h-5" />} 
          gradient="from-emerald-500 to-teal-600"
          glow="shadow-emerald-500/10"
        />
        <StatsCard 
          title="Sản phẩm sắp hết" 
          value="03" 
          subtext="Cần nhập hàng lô mới" 
          percentage="-5%" 
          isPositive={false}
          icon={<Package className="w-5 h-5" />} 
          gradient="from-rose-500 to-red-600"
          glow="shadow-red-500/10"
        />
      </div>

      {/* 3. DYNAMIC ACTIONS HUB */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" /> Công cụ chuyên môn ({roleName})
          </h2>
          <p className="text-xs text-slate-500">Các chức năng nhanh được cấu hình trực quan cho nhiệm vụ của bạn.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {getQuickActions().map((action, idx) => (
            <button
              key={idx}
              onClick={() => router.push(action.link)}
              className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left p-5 rounded-2xl group flex flex-col justify-between h-36"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                  {action.title} <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" />
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. CLINIC PERFORMANCE GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SVG Curve Chart */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-base font-extrabold">Xu Hướng Hoạt Động Tuần</CardTitle>
              <CardDescription className="text-xs">Theo dõi thống kê lượt khám và doanh thu thực tế.</CardDescription>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              <button
                onClick={() => setChartMode("revenue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMode === "revenue"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Doanh thu
              </button>
              <button
                onClick={() => setChartMode("appointments")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMode === "appointments"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Lượt khám
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <svg className="w-full h-64 overflow-visible" viewBox="0 0 580 250">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="50" y1="40" x2="530" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
              <line x1="50" y1="100" x2="530" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
              <line x1="50" y1="160" x2="530" y2="160" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
              <line x1="50" y1="220" x2="530" y2="220" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Area path */}
              <path d={getSvgFillPath()} fill="url(#chartGrad)" />

              {/* Line path */}
              <path
                d={getSvgPath()}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {weeklyRevenue.map((item, idx) => {
                const x = 50 + idx * 80;
                const maxVal = chartMode === "revenue" ? 35000000 : 50;
                const val = chartMode === "revenue" ? item.value : item.count;
                const y = 220 - (val / maxVal) * 180;
                const isHovered = activePoint === idx;

                return (
                  <g key={idx} className="cursor-pointer" onMouseEnter={() => setActivePoint(idx)} onMouseLeave={() => setActivePoint(null)}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 7 : 5}
                      fill="#ffffff"
                      stroke="#3b82f6"
                      strokeWidth={isHovered ? 4.5 : 3.5}
                      className="transition-all duration-150"
                    />
                    <text
                      x={x}
                      y={240}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-400"
                    >
                      {item.day}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Chart Tooltip popup */}
            {activePoint !== null && (
              <div
                className="absolute bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-800 text-xs font-semibold pointer-events-none"
                style={{
                  left: `${80 + activePoint * 73}px`,
                  top: `${110 - (chartMode === "revenue" ? (weeklyRevenue[activePoint].value / 35000000) * 120 : (weeklyRevenue[activePoint].count / 50) * 120)}px`
                }}
              >
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{weeklyRevenue[activePoint].day}</p>
                <p className="text-sm font-black mt-0.5">
                  {chartMode === "revenue"
                    ? formatCurrency(weeklyRevenue[activePoint].value)
                    : `${weeklyRevenue[activePoint].count} lượt khám`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Active Staff list */}
        <Card className="shadow-sm border-slate-200 rounded-3xl bg-white">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500 animate-pulse" /> Thành Viên Ca Trực
            </CardTitle>
            <CardDescription className="text-xs">Theo dõi danh sách KTV/Bác sĩ đang hoạt động.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 divide-y divide-slate-100">
            {activeStaff.map((staff, idx) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-black text-sm uppercase">
                      {staff.name.replace("BS. ", "").replace("KTV. ", "").replace("LT. ", "").replace("TN. ", "").slice(0,2)}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      staff.online ? "bg-emerald-500" : "bg-slate-300"
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{staff.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{staff.role}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  staff.online 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" 
                    : "bg-slate-50 text-slate-400 border-slate-200/50"
                }`}>
                  {staff.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* 5. LOG ACTIVITY FEED */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Nhật Ký Hoạt Động Hệ Thống</h3>
            <p className="text-xs text-slate-500">Giám sát các thao tác mài lắp, hoàn kho, và in phiếu theo thời gian thực.</p>
          </div>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </button>
        </div>
        <div className="space-y-3.5">
          {recentActivities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-4 p-3 hover:bg-slate-50/80 rounded-2xl transition-colors border border-slate-100"
            >
              <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                act.type === "success" 
                  ? "bg-emerald-500" 
                  : act.type === "info" 
                  ? "bg-blue-500" 
                  : "bg-amber-500"
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-700">{act.user} - <span className="text-blue-600">{act.action}</span></span>
                  <span className="text-[10px] text-slate-400 font-semibold">{act.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{act.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, subtext, percentage, isPositive, icon, gradient, glow }: StatsCardProps) {
  return (
    <Card className={`shadow-sm border-slate-200 bg-white overflow-hidden relative group hover:shadow-lg transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg ${glow} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
            isPositive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
              : "bg-rose-50 text-rose-700 border-rose-200/50"
          }`}>
            {percentage}
          </span>
        </div>
        <div className="mt-6">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
          <p className="text-sm font-bold text-slate-700 mt-1.5">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Icon fallbacks to avoid complex imports in page
function UsersIcon() { return <Users className="w-5 h-5" />; }
function CalendarIcon() { return <Calendar className="w-5 h-5" />; }
function ClockIcon() { return <Clock className="w-5 h-5" />; }
function TrendingUpIcon() { return <TrendingUp className="w-5 h-5" />; }
function DatabaseIcon() { return <Database className="w-5 h-5" />; }
function FileSpreadsheetIcon() { return <FileSpreadsheetIconActual className="w-5 h-5" />; }
function FileSpreadsheetIconActual(props: any) { return <FileText {...props} />; }
function UsersIconAlt() { return <Users className="w-5 h-5" />; }
function ShieldIcon() { return <Shield className="w-5 h-5" />; }
function FileTextIcon() { return <FileText className="w-5 h-5" />; }
function ActivityIcon() { return <Activity className="w-5 h-5" />; }