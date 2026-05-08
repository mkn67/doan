"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, Calendar } from "lucide-react"
import Cookies from 'js-cookie'

// Nhớ import mấy cái Dropdown của Shadcn UI vào nhé
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface UserInfo {
  username: string;
  roles?: string[];
  loaiTk?: string;
}

export default function CustomerHeader() {
  const router = useRouter()
  
  // 1. Dùng state để lưu thông tin user
  const [user, setUser] = React.useState<UserInfo | null>(null)
  const [isMounted, setIsMounted] = React.useState(false)

  // 2. Chạy useEffect để lấy user từ Local Storage sau khi render
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          setUser(JSON.parse(userStr))
        } catch (e) {
          console.error(e)
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [])

  // 3. Hàm Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    Cookies.remove("token")
    setUser(null)
    router.push("/auth/login")
  }

  // Tránh lỗi Hydration của Next.js
  if (!isMounted) return <header>...</header> // Trả về khung header trống lúc load

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      {/* ... Phần Logo VISIONCARE và Menu ở giữa giữ nguyên ... */}

      {/* 4. CHỖ NÀY LÀ QUYẾT ĐỊNH NÀY: */}
      <div className="flex items-center gap-4">
        {user ? (
          // NẾU ĐÃ ĐĂNG NHẬP: Hiện Avatar và Menu thả xuống
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-700">Chào, {user.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile/appointments')} className="cursor-pointer">
                <Calendar className="mr-2 h-4 w-4" /> Lịch hẹn của tôi
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // NẾU CHƯA ĐĂNG NHẬP: Hiện nút Đăng nhập màu trắng viền xanh như hình ông giáo
          <Link href="/auth/login">
            <Button variant="outline" className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50">
              <User className="mr-2 h-4 w-4" /> Đăng nhập
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}