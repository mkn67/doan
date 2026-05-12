"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Package, CalendarDays, 
  Stethoscope, LogOut, Settings, ShieldAlert,
  Hammer, Wallet
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; 

// 1. ĐỊNH NGHĨA MENU VÀ GẮN QUYỀN TRUY CẬP CHO TỪNG MỤC
const staffMenuItems = [
  { 
    name: "Tổng quan (Dashboard)", 
    href: "/staff/dashboard", 
    icon: LayoutDashboard, 
    roles: ["NH04"] // Chỉ Quản lý
  },
  { 
    name: "Lễ tân & Khách hàng", 
    href: "/staff/reception", 
    icon: CalendarDays, 
    roles: ["NH06", "NH04"] // Lễ tân, Quản lý
  },
  { 
    name: "Khám bệnh & Kê đơn", 
    href: "/staff/clinic", 
    icon: Stethoscope, 
    roles: ["NH01", "NH04"] // Bác sĩ, Quản lý
  },
  { 
    name: "Quầy Thu Ngân", 
    href: "/staff/cashier", 
    icon: Wallet, 
    roles: ["NH02", "NH04"] // Thu ngân, Quản lý
  },
  { 
    name: "Kho hàng & Vật tư", 
    href: "/staff/inventory", 
    icon: Package, 
    roles: ["NH03", "NH04"] // Thủ kho, Quản lý
  },
  { 
    name: "Xưởng mài lắp kính", 
    href: "/staff/workshop/glasses", 
    icon: Hammer, 
    roles: ["NH05", "NH03", "NH04"] // Kỹ thuật viên, Thủ kho, Quản lý
  },
  { 
    name: "Quản trị hệ thống", 
    href: "/staff/admin", 
    icon: Settings, 
    roles: ["NH04"] // Chỉ Quản lý
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR TỐI MÀU DÀNH CHO STAFF */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 flex-shrink-0">
        
        {/* Header Sidebar */}
        <div className="p-6 bg-slate-950/50">
          <h1 className="text-2xl font-black text-white tracking-tight">VISION <span className="text-blue-500">CARE</span></h1>
          <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-xs uppercase text-slate-400 font-semibold">Tài khoản</p>
            <p className="text-sm font-bold text-white truncate mt-0.5">{user?.hoTen || "Nhân viên"}</p>
          </div>
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
      <main className="flex-1 overflow-y-auto relative bg-slate-50/50">
        <div className="p-8 min-h-full">
          {children}
        </div>
      </main>
      
    </div>
  );
}