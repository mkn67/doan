"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Users, ShoppingBag, Activity,
  ArrowUpRight, ArrowDownRight, Calendar, Bell,
  CheckCircle2, AlertCircle, Package, DollarSign,
  BarChart3, Eye, Pill, AlertTriangle, Clock,
  ChevronRight, Sparkles, Database, FileText, ArrowRight, Activity as ActivityIcon, Flame
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
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatFullVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("Admin");
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chartMode, setChartMode] = useState<"revenue" | "orders">("revenue");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Data hooks
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO BANNER - Premium Glassmorphism Gradient
         ═══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">{greeting}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Xin chào, <span className="text-cyan-200">{userName}</span>
            </h1>
            <p className="text-indigo-100 text-sm max-w-xl font-medium">
              Hệ thống báo cáo BI thông minh của Vision Care đã được đồng bộ tự động.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-inner self-start md:self-auto">
            <div className="p-3 bg-white/15 rounded-xl">
              <Clock className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-indigo-200">Giờ Hệ Thống</p>
              <p className="text-sm font-bold mt-0.5">{currentTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • {currentDate.toLocaleDateString("vi-VN")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STATS GRID - HSL styled cards
         ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Doanh thu hôm nay"
          value={loadingToday ? "..." : formatFullVND(todayRevenue)}
          subtitle={loadingToday ? "" : `${todayOrders} hóa đơn đã xuất`}
          icon={<DollarSign className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-600"
          glow="shadow-emerald-500/10"
          loading={loadingToday}
        />
        <StatsCard
          title={`Doanh thu T${currentMonth}`}
          value={loadingRevenue ? "..." : formatFullVND(tongDoanhThuThang)}
          subtitle={tongQuan?.tyLeTangTruongDoanhThu !== undefined
            ? `${tongQuan.tyLeTangTruongDoanhThu >= 0 ? "+" : ""}${tongQuan.tyLeTangTruongDoanhThu.toFixed(1)}% so với tháng trước`
            : ""}
          trend={tongQuan?.tyLeTangTruongDoanhThu !== undefined && tongQuan.tyLeTangTruongDoanhThu >= 0 ? "up" : "down"}
          icon={<TrendingUp className="w-5 h-5" />}
          gradient="from-blue-500 to-indigo-600"
          glow="shadow-blue-500/10"
          loading={loadingRevenue}
        />
        <StatsCard
          title="Tổng bệnh nhân"
          value={loadingTongQuan ? "..." : (tongQuan?.tongSoBenhNhan || 0).toLocaleString("vi-VN")}
          subtitle="Ghi nhận trên hệ thống"
          icon={<Users className="w-5 h-5" />}
          gradient="from-violet-500 to-purple-600"
          glow="shadow-purple-500/10"
          loading={loadingTongQuan}
        />
        <StatsCard
          title="Đơn kính & Thuốc"
          value={loadingTongQuan ? "..." : (tongQuan?.tongSoDonThuoc || 0).toLocaleString("vi-VN")}
          subtitle={`${tongQuan?.tongSoHoaDon || 0} lượt thanh toán`}
          icon={<Pill className="w-5 h-5" />}
          gradient="from-amber-500 to-orange-600"
          glow="shadow-orange-500/10"
          loading={loadingTongQuan}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BI CHARTS & ALERTS AREA
         ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">

        {/* Premium interactive chart */}
        <Card className="lg:col-span-4 shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" /> Doanh Thu Hàng Ngày
              </CardTitle>
              <CardDescription className="text-xs">Số liệu chi tiết của 14 ngày làm việc gần nhất.</CardDescription>
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
                onClick={() => setChartMode("orders")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMode === "orders"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Lượng đơn
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 relative">
            {loadingRevenue ? (
              <div className="h-[280px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <ActivityIcon className="w-8 h-8 animate-pulse text-blue-500" />
                  <span className="text-xs text-slate-400 font-semibold">Đang tổng hợp dữ liệu...</span>
                </div>
              </div>
            ) : chartData.length > 0 ? (
              <div className="relative">
                {/* Y-axis */}
                <div className="absolute left-0 top-0 bottom-8 w-14 flex flex-col justify-between text-right pr-2 pointer-events-none">
                  {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => {
                    const maxVal = Math.max(...chartData.map(d => chartMode === "revenue" ? (d.doanhThuNgay || d.tongDoanhThu || 0) : (d.soLuongDon || 0)), 1);
                    return (
                      <span key={i} className="text-[10px] text-slate-400 font-bold">
                        {chartMode === "revenue" ? formatVND(maxVal * ratio) : `${Math.round(maxVal * ratio)}`}
                      </span>
                    );
                  })}
                </div>

                {/* Bars Area */}
                <div className="ml-14 relative h-[250px]">
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                      style={{ bottom: `${ratio * 100}%` }}
                    />
                  ))}

                  <div className="absolute inset-0 flex items-end gap-1.5 px-2">
                    {chartData.map((item, i) => {
                      const maxVal = Math.max(...chartData.map(d => chartMode === "revenue" ? (d.doanhThuNgay || d.tongDoanhThu || 0) : (d.soLuongDon || 0)), 1);
                      const revenue = item.doanhThuNgay || item.tongDoanhThu || 0;
                      const count = item.soLuongDon || 0;
                      const val = chartMode === "revenue" ? revenue : count;
                      const heightPercent = maxVal === 0 ? 0 : (val / maxVal) * 100;
                      const day = new Date(item.ngay).getDate();
                      const isToday = new Date(item.ngay).toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center group cursor-pointer"
                          style={{ height: "100%" }}
                          onMouseEnter={() => setHoveredBar(i)}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          <div className="flex-1 w-full flex items-end justify-center">
                            <div
                              className={`w-full rounded-t-lg transition-all duration-300 relative ${
                                isToday
                                  ? "bg-gradient-to-t from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20"
                                  : "bg-gradient-to-t from-slate-300 to-slate-200 group-hover:from-blue-500 group-hover:to-blue-400"
                              }`}
                              style={{ height: `${Math.max(heightPercent, 3)}%` }}
                            />
                          </div>
                          <span className={`text-[9px] mt-2 font-bold ${
                            isToday ? "text-blue-600 font-extrabold" : "text-slate-400"
                          }`}>
                            {day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bar Chart Tooltip */}
                {hoveredBar !== null && (
                  <div
                    className="absolute bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-800 text-xs font-semibold pointer-events-none z-30"
                    style={{
                      left: `${80 + hoveredBar * 23}px`,
                      top: `${130 - ((chartMode === "revenue" ? (chartData[hoveredBar].doanhThuNgay || chartData[hoveredBar].tongDoanhThu || 0) : (chartData[hoveredBar].soLuongDon || 0)) / Math.max(...chartData.map(d => chartMode === "revenue" ? (d.doanhThuNgay || d.tongDoanhThu || 0) : (d.soLuongDon || 0)), 1)) * 100}px`
                    }}
                  >
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Ngày {new Date(chartData[hoveredBar].ngay).getDate()}</p>
                    <p className="text-sm font-black mt-0.5">
                      {chartMode === "revenue"
                        ? formatFullVND(chartData[hoveredBar].doanhThuNgay || chartData[hoveredBar].tongDoanhThu || 0)
                        : `${chartData[hoveredBar].soLuongDon || 0} hóa đơn`}
                    </p>
                  </div>
                )}
              </div>
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

        {/* Live system alerts / warehouse alerts */}
        <Card className="lg:col-span-3 shadow-sm border-slate-200 rounded-3xl bg-white overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500 animate-bounce" /> Cảnh Báo Kho & Hạn Dùng
                {totalAlerts > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">
                    {totalAlerts}
                  </span>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 max-h-[350px]">
            {totalAlerts > 0 ? (
              <div className="divide-y divide-slate-100">
                {/* Expired alert */}
                {expiredData.map((item, idx) => (
                  <AlertRow
                    key={`exp-${idx}`}
                    icon={<AlertCircle className="w-4 h-4" />}
                    iconColor={item.mucDo === "Nguy cap" ? "text-red-500 bg-red-50" : "text-orange-500 bg-orange-50"}
                    title={item.tenSp}
                    badge={item.mucDo === "Nguy cap" ? "Hạn chót" : "Sắp hết hạn"}
                    badgeColor={item.mucDo === "Nguy cap" ? "bg-red-50 text-red-700 border-red-200" : "bg-orange-50 text-orange-700 border-orange-200"}
                    desc={`Lô ${item.maLo} — HSD: ${item.ngayHetHan ? new Date(item.ngayHetHan).toLocaleDateString("vi-VN") : "N/A"} (${item.soNgayConLai} ngày) • Tồn: ${item.tonKho}`}
                  />
                ))}
                {/* Low stock alert */}
                {lowStockData.map((item, idx) => (
                  <AlertRow
                    key={`low-${idx}`}
                    icon={<Package className="w-4 h-4" />}
                    iconColor={item.mucDo === "Het hang" ? "text-red-500 bg-red-50" : "text-amber-500 bg-amber-50"}
                    title={item.tenSp}
                    badge={item.mucDo === "Het hang" ? "Hết hàng" : "Sắp hết"}
                    badgeColor={item.mucDo === "Het hang" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}
                    desc={`Tồn hiện tại: ${item.tongTon} / Ngưỡng an toàn: ${item.tonKhoToiThieu}`}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-slate-800">Mọi thứ đều ở mức an toàn</p>
                <p className="text-xs text-slate-400 mt-1">Không ghi nhận tồn kho thấp hay hàng cận hạn.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          QUICK ACTIONS GRID
         ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6">
        <div className="mb-4">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" /> Truy Cập Phân Hệ Quản Trị
          </h3>
          <p className="text-xs text-slate-500">Chuyển hướng nhanh tới các khu vực điều phối và báo cáo.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickLinkCard
            title="Lễ tân & Điều phối"
            desc="Tiếp đón & số thứ tự khám"
            icon={<CalendarIcon />}
            href="/staff/reception"
            gradient="from-blue-500 to-cyan-500"
          />
          <QuickLinkCard
            title="Hóa đơn & Doanh số"
            desc="Quầy thanh toán & công nợ"
            icon={<WalletIcon />}
            href="/staff/cashier"
            gradient="from-emerald-500 to-teal-500"
          />
          <QuickLinkCard
            title="Quản lý Kho & Lô hàng"
            desc="Nhập vật tư & tròng kính"
            icon={<PackageIcon />}
            href="/staff/inventory"
            gradient="from-violet-500 to-purple-500"
          />
          <QuickLinkCard
            title="Cấu hình hệ thống"
            desc="Sao lưu database & phân quyền"
            icon={<SettingsIcon />}
            href="/staff/admin"
            gradient="from-slate-500 to-slate-700"
          />
        </div>
      </div>

    </div>
  );
}

// Stats Card Subcomponent
interface StatsCardPropsInner {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  loading?: boolean;
}

function StatsCard({ title, value, subtitle, trend, icon, gradient, glow, loading }: StatsCardPropsInner) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-lg transition-all duration-300 relative">
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md ${glow} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-0.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
              trend === "up" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" : "bg-rose-50 text-rose-700 border border-rose-200/50"
            }`}>
              {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend === "up" ? "Tăng" : "Giảm"}
            </div>
          )}
        </div>
        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">{title}</p>
        {loading ? (
          <div className="mt-2 h-8 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{value}</h3>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Alert Row Subcomponent
function AlertRow({ icon, iconColor, title, badge, badgeColor, desc }: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  badge: string;
  badgeColor: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3.5 p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50">
      <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// Quick Link Card Subcomponent
function QuickLinkCard({ title, desc, icon, href, gradient }: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <Card className="border-slate-200 hover:border-blue-400 transition-all duration-300 cursor-pointer group bg-white shadow-sm hover:shadow-lg overflow-hidden relative">
        <CardContent className="p-5 flex items-center gap-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1">
              {title}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </CardContent>
      </Card>
    </Link>
  );
}

// Icon helper components
function CalendarIcon() { return <Calendar className="w-5 h-5" />; }
function WalletIcon() { return <DollarSign className="w-5 h-5" />; }
function PackageIcon() { return <Package className="w-5 h-5" />; }
function SettingsIcon() { return <Database className="w-5 h-5" />; }