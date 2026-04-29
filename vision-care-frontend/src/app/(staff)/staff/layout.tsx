"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Package, 
  ClipboardList, 
  Settings,
  LogOut,
  UserCircle
} from "lucide-react" // Thư viện icon cực đẹp đi kèm shadcn
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Vision Care</h1>
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
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
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
             {/* Có thể hiện tiêu đề trang ở đây */}
             Hệ thống quản lý nội bộ
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Chu Thi Minh Anh</p>
              <p className="text-xs text-gray-500">Quản trị viên</p>
            </div>
            <UserCircle className="size-10 text-gray-400" />
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