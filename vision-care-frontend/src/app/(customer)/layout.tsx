'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('username')
    }
    return null
  })

  const logout = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-lg">VisionCare</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link href="/">Trang chủ</Link>
            <Link href="/products">Sản phẩm</Link>
            <Link href="/booking">Đặt lịch</Link>
          </nav>

          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span>Xin chào, {user}</span>
                <button
                  onClick={logout}
                  className="text-red-500 hover:underline"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login">Đăng nhập</Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-white font-bold mb-2">VisionCare</h3>
            <p className="text-sm">Chăm sóc thị lực tận tâm</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Dịch vụ</h4>
            <ul className="space-y-1 text-sm">
              <li>Khám mắt</li>
              <li>Cắt kính</li>
              <li>Tư vấn</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Liên hệ</h4>
            <p className="text-sm">📞 1900 1000 </p>
            <p className="text-sm">📍 TP.HCM</p>
          </div>
        </div>
      </footer>
    </div>
  )
}