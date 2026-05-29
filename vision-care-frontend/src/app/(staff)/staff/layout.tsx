"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Package, CalendarDays, 
  Stethoscope, LogOut, ShieldAlert,
  Hammer, Wallet, Users, Activity, History, FileText, ClipboardList, Truck
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; 
import Cookies from 'js-cookie';

// 1. ĐỊNH NGHĨA MENU VÀ GẮN QUYỀN TRUY CẬP CHO TỪNG MỤC
const staffMenuItems = [
  // --- ADMIN ---
  { 
    name: "Tổng quan (Dashboard)", 
    href: "/staff/dashboard", 
    icon: LayoutDashboard, 
    roles: ["ROLE_ADMIN", "NH04"] 
  },
  { 
    name: "Quản trị hệ thống", 
    href: "/staff/admin", 
    icon: Users, 
    roles: ["ROLE_ADMIN", "NH04"] 
  },

  // --- LỄ TÂN (RECEPTIONIST) ---
  { 
    name: "Duyệt Lịch Hẹn", 
    href: "/staff/reception/appointments", 
    icon: CalendarDays, 
    roles: ["ROLE_LE_TAN", "NH06"] 
  },
  { 
    name: "Hồ Sơ Khách Hàng", 
    href: "/staff/reception/customers", 
    icon: Users, 
    roles: ["ROLE_LE_TAN", "NH06"] 
  },

  // --- BÁC SĨ (DOCTOR) ---
  { 
    name: "Đo Khúc Xạ & Khám", 
    href: "/staff/clinic/examinations", 
    icon: Stethoscope, 
    roles: ["ROLE_BAC_SI", "NH01"] 
  },
  { 
    name: "Hàng Chờ Hôm Nay", 
    href: "/staff/clinic/queue", 
    icon: Activity, 
    roles: ["ROLE_BAC_SI", "NH01"] 
  },
  { 
    name: "Nhật Ký Thay Đổi", 
    href: "/staff/clinic/audit", 
    icon: History, 
    roles: ["ROLE_BAC_SI", "NH01"] 
  },

  // --- THU NGÂN (CASHIER) ---
  { 
    name: "Thanh Toán Hóa Đơn", 
    href: "/staff/cashier/payments", 
    icon: Wallet, 
    roles: ["ROLE_THU_NGAN", "NH02"] 
  },
  { 
    name: "Tạo Hóa Đơn Bán", 
    href: "/staff/cashier/billing", 
    icon: FileText, 
    roles: ["ROLE_THU_NGAN", "NH02"] 
  },

  // --- THỦ KHO (WAREHOUSE KEEPER) ---
  { 
    name: "Sản phẩm & Vật tư", 
    href: "/staff/inventory/products", 
    icon: Package, 
    roles: ["ROLE_THU_KHO", "NH03"] 
  },
  { 
    name: "Nhập kho lô hàng", 
    href: "/staff/inventory/imports", 
    icon: ClipboardList, 
    roles: ["ROLE_THU_KHO", "NH03"] 
  },

  // --- KỸ THUẬT VIÊN (TECHNICIAN) ---
  { 
    name: "Xưởng mài lắp kính", 
    href: "/staff/workshop/glasses", 
    icon: Hammer, 
    roles: ["ROLE_KY_THUAT", "NH05"] 
  },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth(); 
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    Cookies.remove("token");
    router.push("/auth/login");
  };

  // 2. HÀM KIỂM TRA QUYỀN (RBAC - Role Based Access Control)
  const hasAccess = (allowedRoles: string[]) => {
    if (!user) return false;

    // Kiểm tra theo roles (mảng) hoặc maNhom (chuỗi đơn lẻ) từ LoginResponseDTO
    const userRoles = user?.roles || [];
    const userGroup = user?.maNhom ? user.maNhom : null;

    return allowedRoles.some(role => userRoles.includes(role) || role === userGroup);
  };

  // Lọc menu: Chỉ giữ lại những mục mà User hiện tại có quyền xem
  const filteredMenu = staffMenuItems.filter(item => hasAccess(item.roles));

  // 🔥 CHỐT CHẶN HYDRATION ERROR (Phải có !isMounted ở đây) 🔥
  if (!isMounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-blue-600 font-medium">
        Đang tải hệ thống...
      </div>
    );
  }

  // Nếu không có user hoặc không có quyền gì cả
  if (!user || filteredMenu.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Truy cập bị từ chối</h2>
        <p className="text-slate-500 mb-6">Bạn không có quyền truy cập khu vực quản trị.</p>
        <button onClick={handleLogout} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Quay lại đăng nhập
        </button>
      </div>
    );
  }

  const getRoleLabel = (roles?: string[]) => {
    if (!roles || roles.length === 0) return "Nhân viên";
    if (roles.includes("ROLE_ADMIN")) return "Quản trị viên";
    if (roles.includes("ROLE_BAC_SI")) return "Bác sĩ";
    if (roles.includes("ROLE_LE_TAN")) return "Lễ tân";
    if (roles.includes("ROLE_THU_NGAN")) return "Thu ngân";
    if (roles.includes("ROLE_THU_KHO")) return "Thủ kho";
    if (roles.includes("ROLE_KY_THUAT")) return "Kỹ thuật viên";
    return "Nhân viên";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR TỐI MÀU DÀNH CHO STAFF */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 flex-shrink-0">
        
        {/* Header Sidebar */}
        <div className="p-6 bg-slate-950/55 border-b border-slate-800/60">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            VISION <span className="text-blue-500">CARE</span>
          </h1>
          
          <Link href="/staff/profile" className="mt-5 flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-slate-800/60 transition-colors border border-slate-700/40 rounded-2xl cursor-pointer block">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-md text-sm flex-shrink-0">
              {user?.hoTen ? user.hoTen.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CÁ NHÂN</p>
              <p className="text-sm font-bold text-white truncate" title={user?.hoTen}>
                {user?.hoTen || "Nhân viên"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Nhân sự: <span className="text-blue-400 font-semibold">{getRoleLabel(user?.roles)}</span>
              </p>
            </div>
          </Link>
        </div>
        
        {/* Menu Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredMenu.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* KHU VỰC HIỂN THỊ NỘI DUNG (MAIN CONTENT) */}
      <main className="flex-1 overflow-y-auto relative bg-slate-50/50 flex flex-col">
        {user?.roles?.includes("ROLE_ADMIN") && 
         !pathname.startsWith("/staff/admin") && 
         !pathname.startsWith("/staff/dashboard") && 
         pathname !== "/staff" && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-3.5 flex items-center gap-2 text-amber-700 font-bold text-xs shadow-sm">
            <ShieldAlert className="w-4.5 h-4.5 animate-pulse text-amber-500 shrink-0" />
            <span>Chế độ Xem & Đọc dành cho Quản trị viên (Admin Read-Only). Bạn đang ở màn hình nghiệp vụ - Các thao tác ghi, xóa hoặc cập nhật đã bị khóa.</span>
          </div>
        )}
        <div className="p-8 min-h-full flex-1">
          {(() => {
            let allowedRoles: string[] | null = null;
            if (pathname.startsWith("/staff/admin") || pathname.startsWith("/staff/dashboard")) {
              allowedRoles = ["ROLE_ADMIN", "NH04"];
            } else if (pathname.startsWith("/staff/reception")) {
              allowedRoles = ["ROLE_LE_TAN", "NH06"];
            } else if (pathname.startsWith("/staff/clinic")) {
              allowedRoles = ["ROLE_BAC_SI", "NH01"];
            } else if (pathname.startsWith("/staff/cashier")) {
              allowedRoles = ["ROLE_THU_NGAN", "NH02"];
            } else if (pathname.startsWith("/staff/inventory")) {
              allowedRoles = ["ROLE_THU_KHO", "NH03"];
            } else if (pathname.startsWith("/staff/workshop")) {
              allowedRoles = ["ROLE_KY_THUAT", "NH05"];
            }

            const isAdmin = user?.roles?.includes("ROLE_ADMIN") || user?.maNhom === "NH04";
            const isAuthorized = allowedRoles === null || isAdmin || hasAccess(allowedRoles);
            if (!isAuthorized) {
              return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center max-w-xl mx-auto mt-10">
                  <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
                  <h2 className="text-2xl font-bold text-slate-800">Truy Cập Bị Từ Chối</h2>
                  <p className="text-slate-505 mt-2 max-w-md mx-auto text-sm text-slate-500">
                    Tài khoản của bạn không được phân quyền truy cập chức năng này. Vui lòng quay lại khu vực được phân công!
                  </p>
                  <button 
                    onClick={() => router.push(user?.roles?.includes("ROLE_ADMIN") ? "/staff/dashboard" : "/staff")} 
                    className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] text-sm"
                  >
                    Quay lại trang chính
                  </button>
                </div>
              );
            }
            return children;
          })()}
        </div>
      </main>
      
    </div>
  );
}