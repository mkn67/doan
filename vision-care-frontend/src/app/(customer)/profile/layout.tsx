"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  User, Calendar, History, Receipt, Star, LogOut 
} from "lucide-react"; // Xóa Loader2

const sidebarItems = [
  { name: "Thông tin cá nhân", href: "/profile", icon: User },
  { name: "Lịch hẹn của tôi", href: "/profile/appointments", icon: Calendar },
  { name: "Lịch sử khám", href: "/profile/history", icon: History },
  { name: "Hóa đơn & Thanh toán", href: "/profile/billing", icon: Receipt },
  { name: "Đánh giá bác sĩ", href: "/profile/reviews", icon: Star },
];

interface UserProfile {
  hoTen?: string;
  email?: string;
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trì hoãn một nhịp để tránh lỗi cascading renders
    const timer = setTimeout(() => {
      setMounted(true);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Lỗi parse user:", e);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-2">
          <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white mb-6 shadow-lg shadow-blue-200">
            <p className="text-xs opacity-80 font-medium uppercase tracking-wider">Xin chào,</p>
            <p className="text-xl font-bold truncate">
              {user?.hoTen || "Khách hàng"}
            </p>
          </div>
          
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/profile" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="pt-10">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-8 min-h-[600px]">
          {children}
        </main>
      </div>
    </div>
  );
}