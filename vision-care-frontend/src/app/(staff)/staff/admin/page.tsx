"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, ShieldAlert, CalendarDays, ClipboardList, Database, Download, Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import axiosClient from "@/lib/axios";
import { toast } from "sonner";

const ALLOWED_ROLES = ["ROLE_ADMIN", "NH04"];

const adminModules = [
  {
    title: "Quản lý nhân sự",
    description: "Thêm, sửa, xóa thông tin nhân viên và cấp tài khoản.",
    href: "/staff/admin/employees",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Phân quyền hệ thống",
    description: "Thiết lập quyền truy cập cho Lễ tân, Bác sĩ...",
    href: "/staff/admin/roles",
    icon: ShieldAlert,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Quản lý lịch làm việc",
    description: "Sắp xếp lịch trực, ca làm việc cho nhân viên.",
    href: "/staff/admin/schedules",
    icon: CalendarDays,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Danh mục dịch vụ",
    description: "Cập nhật các gói khám mắt, đo khúc xạ, giá tiền.",
    href: "/staff/admin/services",
    icon: ClipboardList,
    color: "bg-emerald-50 text-emerald-600",
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Excel export states
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);

  // Backup & Restore states
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && user) {
      const userRoles = user?.roles || [];
      const userGroup = user?.maNhom || user?.loaiTk;
      const hasAccess = ALLOWED_ROLES.some(role => userRoles.includes(role) || role === userGroup);
      
      if (!hasAccess) {
        router.push("/staff");
      }
    }
  }, [user, loading, router]);

  const handleBackup = async () => {
    setIsBackingUp(true);
    const toastId = toast.loading("Đang chuẩn bị bản sao lưu database...");
    try {
      const response = await axiosClient.get("/admin/database/backup", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
      link.setAttribute("download", `visioncare_backup_${timestamp}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Sao lưu cơ sở dữ liệu thành công!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải xuống bản sao lưu database!", { id: toastId });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    const toastId = toast.loading("Đang khôi phục dữ liệu từ file SQL...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosClient.post("/admin/database/restore", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Khôi phục thành công! Đã chạy ${response.data.executedStatements || 0} câu lệnh.`, { id: toastId });
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.error || error.message || "Lỗi không xác định";
      toast.error(`Khôi phục dữ liệu thất bại: ${errMsg}`, { id: toastId });
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Đang tạo báo cáo doanh thu...");
    try {
      const response = await axiosClient.get(`/reports/export-excel?thang=${selectedMonth}&nam=${selectedYear}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `baocao_doanhthu_${selectedMonth}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Xuất báo cáo doanh thu thành công!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xuất báo cáo doanh thu!", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-blue-600 font-medium">
        Đang kiểm tra quyền quản trị...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tổng quan Quản trị</h1>
        <p className="text-slate-500 mt-1">Chọn một phân hệ hoặc công cụ bên dưới để vận hành hệ thống Vision Care.</p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} href={module.href}>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group h-full">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${module.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{module.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{module.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Admin Utilities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        
        {/* DATABASE OPERATIONS CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Quản trị Cơ sở dữ liệu</h2>
              <p className="text-xs text-slate-500">Sao lưu logical SQL dump & phục hồi nóng</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-700">Sao lưu dữ liệu (SQL Dump)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Xuất tất cả dữ liệu bảng thành tệp SQL để lưu trữ.</p>
              </div>
              <button
                onClick={handleBackup}
                disabled={isBackingUp || isRestoring}
                className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {isBackingUp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Sao lưu CSDL</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-700">Khôi phục dữ liệu (SQL Restore)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Tải lên tệp SQL để ghi đè khôi phục dữ liệu hiện tại.</p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".sql"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={handleRestoreClick}
                  disabled={isBackingUp || isRestoring}
                  className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isRestoring ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Phục hồi CSDL</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FINANCIAL REPORT EXPORTS CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4 mb-6">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Báo cáo Tài chính</h2>
              <p className="text-xs text-slate-500">Xuất báo cáo doanh thu định dạng Excel (.csv)</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-slate-700">Chọn kỳ báo cáo cần xuất:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Tháng</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-white text-sm font-medium text-slate-700 focus:outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>Tháng {m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Năm</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-white text-sm font-medium text-slate-700 focus:outline-none"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <option key={y} value={y}>Năm {y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>Xuất báo cáo doanh thu Excel</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}