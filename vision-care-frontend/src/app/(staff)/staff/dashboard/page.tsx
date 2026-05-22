"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Users, ShoppingBag, Activity,
  ArrowUpRight, ArrowDownRight, Calendar, Bell,
  CheckCircle2, AlertCircle, Package, DollarSign,
  BarChart3, Eye, Pill, AlertTriangle, Clock,
  ChevronRight, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  useDoanhThuThang,
  useThongKeTongQuan,
  useDoanhThuHomNay
} from "@/hooks/useReport";
import { useCanhBaoHetHan, useCanhBaoTonKho } from "@/hooks/useInventory";

// --- INTERFACES ---
interface RevenueItem {
  ngay: string;
  tongDoanhThu?: number;
  doanhThuNgay?: number;
  soLuongDon?: number;
}

interface ExpiredItem {
  tenSp: string;
  maLo: string;
  ngayHetHan: string;
  soNgayConLai: number;
  tonKho: number;
  mucDo: string;
  nhaCungCap: string;
}

interface LowStockItem {
  maSp: string;
  tenSp: string;
  tongTon: number;
  tonKhoToiThieu: number;
  mucDo: string;
}

// --- HELPER ---
function formatVND(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatFullVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

// --- MAIN ---
export default function DashboardPage() {
  const [userName, setUserName] = useState("Admin");
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Data hooks — dùng useDoanhThuThang (date-range format YYYY-MM-DD)
  // để tránh SP_THONG_KE_DOANH_THU_THANG bị INVALID trên Oracle
  const { data: revenueData, isLoading: loadingRevenue } = useDoanhThuThang(
    currentMonth,
    currentYear
  );
  const { data: tongQuan, isLoading: loadingTongQuan } = useThongKeTongQuan();
  const { data: todayRevRaw, isLoading: loadingToday } = useDoanhThuHomNay();
  const { data: expiredDataRaw } = useCanhBaoHetHan();
  const { data: lowStockRaw } = useCanhBaoTonKho();

  // Process expired data
  const expiredData: ExpiredItem[] = useMemo(() =>
    (expiredDataRaw || []).map((item: any) => ({
      tenSp: item.tenSp || item.tenSanPham || "",
      maLo: item.maLo || "",
      ngayHetHan: item.ngayHetHan || "",
      soNgayConLai: item.soNgayConLai || 0,
      tonKho: item.tonKho !== undefined ? item.tonKho : (item.soLuongTon || 0),
      mucDo: item.mucDo || "Canh bao",
      nhaCungCap: item.nhaCungCap || "",
    })), [expiredDataRaw]
  );

  // Process low stock data
  const lowStockData: LowStockItem[] = useMemo(() =>
    (lowStockRaw || []).map((item: any) => ({
      maSp: item.maSp || "",
      tenSp: item.tenSp || "",
      tongTon: item.tongTon || 0,
      tonKhoToiThieu: item.tonKhoToiThieu || 0,
      mucDo: item.mucDo || "",
    })), [lowStockRaw]
  );

  // Today's revenue
  const todayRevenue = useMemo(() => {
    if (!todayRevRaw || !Array.isArray(todayRevRaw) || todayRevRaw.length === 0) return 0;
    return todayRevRaw.reduce((sum: number, item: any) =>
      sum + (item.doanhThuNgay || item.tongDoanhThu || 0), 0
    );
  }, [todayRevRaw]);

  const todayOrders = useMemo(() => {
    if (!todayRevRaw || !Array.isArray(todayRevRaw) || todayRevRaw.length === 0) return 0;
    return todayRevRaw.reduce((sum: number, item: any) =>
      sum + (item.soLuongDon || 0), 0
    );
  }, [todayRevRaw]);

  // Monthly total revenue
  const tongDoanhThuThang = useMemo(() =>
    (revenueData as RevenueItem[])?.reduce(
      (sum: number, item: RevenueItem) => sum + (item.doanhThuNgay || item.tongDoanhThu || 0), 0
    ) || 0, [revenueData]
  );

  // Chart data (last 14 days)
  const chartData: RevenueItem[] = useMemo(() =>
    (revenueData as RevenueItem[])?.slice(-14) || [], [revenueData]
  );

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.hoTen || user.username);
      } catch { /* ignore */ }
    }
    setIsMounted(true);
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!isMounted) return null;

  const greeting = currentTime.getHours() < 12 ? "Chào buổi sáng" :
    currentTime.getHours() < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const totalAlerts = (expiredData?.length || 0) + (lowStockData?.length || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* ═══════════════════════════════════════════════════════════════
          HERO HEADER - Gradient background
         ═══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-8 right-32 w-3 h-3 bg-yellow-300/60 rounded-full animate-pulse" />
        <div className="absolute top-16 right-48 w-2 h-2 bg-cyan-300/50 rounded-full animate-pulse delay-300" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-blue-200 text-sm font-medium">{greeting}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Xin chào, <span className="text-cyan-200">{userName}</span>
            </h1>
            <p className="text-blue-200 mt-1 text-sm">
              Tổng quan hoạt động hệ thống — {currentDate.toLocaleDateString("vi-VN", {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5">
              <Clock className="w-4 h-4" />
              {currentTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <Button className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white shadow-lg transition-all">
              <Calendar className="mr-2 h-4 w-4" /> Tháng {currentMonth}/{currentYear}
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STATS GRID - 4 cards nổi bật
         ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 💰 Doanh thu HÔM NAY */}
        <StatsCard
          title="Doanh thu hôm nay"
          value={loadingToday ? "..." : formatFullVND(todayRevenue)}
          subtitle={loadingToday ? "" : `${todayOrders} đơn hàng`}
          icon={<DollarSign className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-600"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          loading={loadingToday}
        />
        {/* 📊 Doanh thu tháng */}
        <StatsCard
          title={`Doanh thu T${currentMonth}`}
          value={loadingRevenue ? "..." : formatFullVND(tongDoanhThuThang)}
          subtitle={tongQuan?.tyLeTangTruongDoanhThu !== undefined
            ? `${tongQuan.tyLeTangTruongDoanhThu >= 0 ? "+" : ""}${tongQuan.tyLeTangTruongDoanhThu.toFixed(1)}% so với tháng trước`
            : ""}
          trend={tongQuan?.tyLeTangTruongDoanhThu !== undefined && tongQuan.tyLeTangTruongDoanhThu >= 0 ? "up" : "down"}
          icon={<TrendingUp className="w-5 h-5" />}
          gradient="from-blue-500 to-indigo-600"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          loading={loadingRevenue}
        />
        {/* 👥 Tổng bệnh nhân */}
        <StatsCard
          title="Tổng bệnh nhân"
          value={loadingTongQuan ? "..." : (tongQuan?.tongSoBenhNhan || 0).toLocaleString("vi-VN")}
          subtitle="Toàn hệ thống"
          icon={<Users className="w-5 h-5" />}
          gradient="from-violet-500 to-purple-600"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          loading={loadingTongQuan}
        />
        {/* 💊 Đơn thuốc */}
        <StatsCard
          title="Đơn thuốc đã kê"
          value={loadingTongQuan ? "..." : (tongQuan?.tongSoDonThuoc || 0).toLocaleString("vi-VN")}
          subtitle={`${tongQuan?.tongSoHoaDon || 0} hóa đơn`}
          icon={<Pill className="w-5 h-5" />}
          gradient="from-amber-500 to-orange-600"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          loading={loadingTongQuan}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
         ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">

        {/* 📈 BIỂU ĐỒ DOANH THU */}
        <Card className="lg:col-span-4 shadow-sm border-slate-200/80 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Biểu đồ doanh thu
                </CardTitle>
                <CardDescription className="mt-1">
                  Thống kê theo ngày trong tháng {currentMonth}/{currentYear}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tổng tháng</p>
                <p className="text-lg font-bold text-slate-900">{formatVND(tongDoanhThuThang)}đ</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            {loadingRevenue ? (
              <div className="h-[280px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <span className="text-sm text-slate-400">Đang tải dữ liệu...</span>
                </div>
              </div>
            ) : chartData.length > 0 ? (
              <RevenueChart data={chartData} />
            ) : (
              <div className="h-[280px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Chưa có dữ liệu doanh thu tháng này</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🔔 CẢNH BÁO & THÔNG BÁO */}
        <Card className="lg:col-span-3 shadow-sm border-slate-200/80 overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                Cảnh báo hệ thống
                {totalAlerts > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-red-500 text-white text-[11px] font-bold rounded-full animate-pulse">
                    {totalAlerts}
                  </span>
                )}
              </CardTitle>
              <Link href="/staff/inventory/products">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                  Xem tất cả <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 max-h-[350px]" style={{ scrollbarWidth: "thin" }}>
            {totalAlerts > 0 ? (
              <div className="divide-y divide-slate-100">
                {/* Cảnh báo hết hạn */}
                {expiredData.map((item, idx) => (
                  <AlertRow
                    key={`exp-${idx}`}
                    icon={<AlertCircle className="w-4 h-4" />}
                    iconColor={item.mucDo === "Nguy cap" ? "text-red-500 bg-red-50" : "text-orange-500 bg-orange-50"}
                    title={item.tenSp}
                    badge={item.mucDo === "Nguy cap" ? "Nguy cấp" : "Cảnh báo"}
                    badgeColor={item.mucDo === "Nguy cap" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}
                    desc={`Lô ${item.maLo} — HSD: ${item.ngayHetHan ? new Date(item.ngayHetHan).toLocaleDateString("vi-VN") : "N/A"} • Còn ${item.soNgayConLai} ngày • Tồn: ${item.tonKho}`}
                  />
                ))}
                {/* Cảnh báo tồn kho */}
                {lowStockData.map((item, idx) => (
                  <AlertRow
                    key={`low-${idx}`}
                    icon={<Package className="w-4 h-4" />}
                    iconColor={item.mucDo === "Het hang" ? "text-red-500 bg-red-50" : "text-yellow-600 bg-yellow-50"}
                    title={item.tenSp}
                    badge={item.mucDo === "Het hang" ? "Hết hàng" : "Sắp hết"}
                    badgeColor={item.mucDo === "Het hang" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}
                    desc={`Tồn kho: ${item.tongTon} / Tối thiểu: ${item.tonKhoToiThieu}`}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Hệ thống hoạt động bình thường</p>
                <p className="text-xs text-slate-400 mt-1">Không có cảnh báo nào cần xử lý</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          QUICK ACTIONS
         ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickLinkCard
          title="Tiếp nhận bệnh nhân"
          desc="Đặt lịch & tiếp nhận"
          icon={<CalendarIcon />}
          href="/staff/reception/appointments"
          gradient="from-blue-500 to-cyan-500"
        />
        <QuickLinkCard
          title="Quầy thu ngân"
          desc="Thanh toán hóa đơn"
          icon={<WalletIcon />}
          href="/staff/cashier"
          gradient="from-emerald-500 to-teal-500"
        />
        <QuickLinkCard
          title="Quản lý kho"
          desc="Kiểm tra tồn kho"
          icon={<PackageIcon />}
          href="/staff/inventory/products"
          gradient="from-violet-500 to-purple-500"
        />
        <QuickLinkCard
          title="Hệ thống"
          desc="Quản trị & cài đặt"
          icon={<SettingsIcon />}
          href="/staff/admin"
          gradient="from-slate-500 to-slate-700"
        />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
}

function StatsCard({ title, value, subtitle, trend, icon, gradient, iconBg, iconColor, loading }: StatsCardProps) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300 relative">
      {/* Top gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-80`} />
      <CardContent className="p-5 pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg ${
              trend === "up" ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
            }`}>
              {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trend === "up" ? "Tăng" : "Giảm"}
            </div>
          )}
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        {loading ? (
          <div className="mt-2 h-8 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <h3 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
        )}
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// --- Revenue Chart ---
function RevenueChart({ data }: { data: RevenueItem[] }) {
  const maxRevenue = Math.max(...data.map(d => d.doanhThuNgay || d.tongDoanhThu || 0), 1);
  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative">
      {/* Y-axis labels and grid lines */}
      <div className="absolute left-0 top-0 bottom-8 w-14 flex flex-col justify-between text-right pr-2 pointer-events-none">
        {gridLines.reverse().map((ratio, i) => (
          <span key={i} className="text-[10px] text-slate-300 font-medium leading-none">
            {formatVND(maxRevenue * ratio)}
          </span>
        ))}
      </div>
      {/* Chart area */}
      <div className="ml-14">
        <div className="relative h-[250px]">
          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-dashed border-slate-100"
              style={{ bottom: `${ratio * 100}%` }}
            />
          ))}
          {/* Bars */}
          <div className="absolute inset-0 flex items-end gap-1 px-1">
            {data.map((item, i) => {
              const revenue = item.doanhThuNgay || item.tongDoanhThu || 0;
              const heightPercent = maxRevenue === 0 ? 0 : (revenue / maxRevenue) * 100;
              const day = new Date(item.ngay).getDate();
              const isToday = new Date(item.ngay).toDateString() === new Date().toDateString();
              return (
                <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer" style={{ height: "100%" }}>
                  <div className="flex-1 w-full flex items-end justify-center">
                    <div
                      className={`w-full max-w-[32px] rounded-t-md transition-all duration-500 ease-out relative ${
                        isToday
                          ? "bg-gradient-to-t from-blue-600 to-cyan-400 shadow-md shadow-blue-200"
                          : "bg-gradient-to-t from-blue-400 to-blue-200 group-hover:from-blue-600 group-hover:to-blue-400"
                      }`}
                      style={{
                        height: `${Math.max(heightPercent, 2)}%`,
                        animationDelay: `${i * 40}ms`,
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20">
                        <div className="bg-slate-800 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                          <div className="text-slate-300 text-[9px]">Ngày {day}</div>
                          <div>{new Intl.NumberFormat("vi-VN").format(revenue)}đ</div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-slate-800 rotate-45" />
                      </div>
                    </div>
                  </div>
                  {/* X label */}
                  <span className={`text-[10px] mt-2 font-medium ${
                    isToday ? "text-blue-600 font-bold" : "text-slate-400"
                  }`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


// --- Alert Row ---
function AlertRow({ icon, iconColor, title, badge, badgeColor, desc }: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  badge: string;
  badgeColor: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3 p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer group">
      <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap ${badgeColor}`}>
            {badge}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}


// --- Quick Link Card ---
function QuickLinkCard({ title, desc, icon, href, gradient }: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <Card className="border-slate-200/80 hover:border-blue-200 transition-all duration-300 cursor-pointer group bg-white shadow-sm hover:shadow-md overflow-hidden relative">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </CardContent>
      </Card>
    </Link>
  );
}


// --- Icon components (inline SVG for crisp rendering) ---
function CalendarIcon() {
  return <Calendar className="w-5 h-5" />;
}
function WalletIcon() {
  return <DollarSign className="w-5 h-5" />;
}
function PackageIcon() {
  return <Package className="w-5 h-5" />;
}
function SettingsIcon() {
  return <Activity className="w-5 h-5" />;
}