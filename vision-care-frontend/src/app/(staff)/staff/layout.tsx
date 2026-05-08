"use client";

import "@/app/globals.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Calendar, Users, Package, Activity, 
  Settings, LogOut, Glasses 
} from "lucide-react"; // ĐÃ XÓA FileText dư thừa ở đây
import Cookies from "js-cookie";

// ĐÃ XÓA Metadata (vì Metadata không được dùng trong file "use client")

const ALL_MENUS = [
  { title: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard, roles: ["NH04"] },
  { title: "Lịch hẹn", href: "/staff/reception/appointments", icon: Calendar, roles: ["NH04", "NH06", "NH01"] },
  { title: "Khách hàng", href: "/staff/reception/customers", icon: Users, roles: ["NH04", "NH06"] },
  { title: "Kho hàng", href: "/staff/inventory/products", icon: Package, roles: ["NH04", "NH03"] },
  // 🏥 KHÁM BỆNH: Chỉ Bác sĩ (NH01) mới được vào, Quản lý (NH04) không cần thấy
  { title: "Khám bệnh", href: "/staff/clinic/examinations", icon: Activity, roles: ["NH01"] },
  // 👓 ĐƠN KÍNH: Dành cho Bác sĩ (NH01) hoặc Kỹ thuật viên (NH05)
  { title: "Đơn kính", href: "/staff/workshop/glasses", icon: Glasses, roles: ["NH01", "NH05"] },
  { title: "Quản trị", href: "/staff/admin/employees", icon: Settings, roles: ["NH04"] },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [userInfo, setUserInfo] = useState({ username: "Khách", roleCode: "", roleName: "Đang tải..." });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    
    if (userStr) {
      const user = JSON.parse(userStr);
      
      // 🛠️ THAY ĐỔI Ở ĐÂY: Lấy mã nhóm thật (NH04, NH01...) từ mảng roles
      const actualRoleCode = (user.roles && user.roles.length > 0) ? user.roles[0] : user.loaiTk;

      // 🛠️ CẬP NHẬT TÊN HIỂN THỊ DỰA TRÊN MÃ NHÓM CHUẨN
      let displayRole = "NHÂN VIÊN";
      if (actualRoleCode === "NH04") displayRole = "QUẢN TRỊ VIÊN";
      if (actualRoleCode === "NH01") displayRole = "BÁC SĨ CHUYÊN KHOA";
      if (actualRoleCode === "NH06") displayRole = "LỄ TÂN";
      if (actualRoleCode === "NH03") displayRole = "THỦ KHO";
      if (actualRoleCode === "NH02") displayRole = "THU NGÂN";

      const timer = setTimeout(() => {
        setUserInfo({
          username: user.username,
          roleCode: actualRoleCode, // Gán mã NHxx vào đây để lọc Sidebar
          roleName: displayRole,
        });
        setIsMounted(true);
      }, 0);

      return () => clearTimeout(timer);
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const allowedMenus = ALL_MENUS.filter(menu => menu.roles.includes(userInfo.roleCode));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    Cookies.remove("token");
    router.push("/auth/login");
  };

  // Tránh lỗi Hydration
  if (!isMounted) return null;

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-600">Vision Care</h2>
        </div>
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          {allowedMenus.map((menu) => {
            const Icon = menu.icon;
            const isActive = pathname.includes(menu.href);
            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-blue-700" : "text-slate-400"}`} />
                {menu.title}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm z-10">
          <div className="text-sm font-medium text-slate-500">Hệ thống quản lý nội bộ</div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-bold text-blue-600">{userInfo.username}</div>
              <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{userInfo.roleName}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
              {userInfo.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}