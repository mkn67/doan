"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Package, 
  ClipboardList, 
  Settings,
  LogOut,
} from "lucide-react" 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/staff/dashboard" },
  { icon: Calendar, label: "Lịch hẹn", href: "/staff/reception/appointments" },
  { icon: Users, label: "Khách hàng", href: "/staff/reception/customers" },
  { icon: Package, label: "Kho hàng", href: "/staff/inventory/products" },
  { icon: ClipboardList, label: "Khám bệnh", href: "/staff/clinic/examinations" },
  { icon: Settings, label: "Quản trị", href: "/staff/admin/employees" },
]

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // 1. Khởi tạo State lấy tên
  const [userName, setUserName] = useState<string | null>(null)

  // 2. Chạy useEffect để lôi tên "HaiAnh" từ bộ nhớ ra
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const userData = localStorage.getItem("user")
        if (userData) {
          const user = JSON.parse(userData)
          if (user?.username) {
             setUserName(user.username)
          }
        }
      } catch (e) {
        console.error("Failed to parse user data", e)
      }
    }
    loadUserFromStorage()
  }, [])

  const displayName = userName || "Admin" // Trong lúc chờ thì hiện chữ Admin

  // 3. Xử lý sự kiện Đăng xuất
  const handleLogout = () => {
    Cookies.remove('token')
    localStorage.clear()
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-700">Vision Care</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          {/* Nối hàm handleLogout vào nút Đăng xuất */}
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 size-5" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <div className="font-semibold text-gray-700">
             Hệ thống quản lý nội bộ
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              {/* ĐÃ THAY CHU THỊ MINH ANH BẰNG BIẾN ĐỘNG */}
              <p className="text-sm font-bold text-blue-600">{displayName}</p>
              <p className="text-xs text-gray-500 uppercase">Quản trị viên</p>
            </div>
            {/* Hiển thị chữ cái đầu của tên làm Avatar */}
            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Nội dung trang cụ thể */}
        <section className="flex-1 overflow-y-auto p-8">
          {children}
        </section>
      </main>
    </div>
  )
}