"use client"

import "@/app/globals.css"
import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Cookies from 'js-cookie'

import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const loginSchema = z.object({
  username: z.string().min(1, { message: "Tên đăng nhập không được để trống" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState("")

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    setErrorMsg("")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const text = await response.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error("Lỗi kết nối máy chủ. Vui lòng thử lại sau.")
      }

      if (!response.ok) throw new Error(data?.message || "Sai tên đăng nhập hoặc mật khẩu")

      // Lưu token và thông tin người dùng
      Cookies.set('token', data.token, { expires: 7, path: '/' })
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data))

      // Điều hướng theo loại tài khoản
      const loaiTk = data.loaiTk?.toUpperCase().trim()
      const roles: string[] = data.roles || []

      if (loaiTk === 'EXTERNAL') {
        router.push('/booking')
      } else {
        const mainRole = roles.length > 0 ? roles[0] : ''
        switch (mainRole) {
          case 'ROLE_ADMIN':
            router.push('/staff/dashboard'); break
          case 'ROLE_LE_TAN':
            router.push('/staff/reception/appointments'); break
          case 'ROLE_BAC_SI':
            router.push('/staff/clinic/queue'); break
          case 'ROLE_THU_KHO':
            router.push('/staff/inventory/products'); break
          case 'ROLE_KY_THUAT':
            router.push('/staff/workshop/glasses'); break
          case 'ROLE_THU_NGAN':
            router.push('/staff/cashier/payments'); break
          default:
            router.push('/staff/dashboard'); break
        }
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f4c81 0%, #1a6bb5 40%, #2196f3 100%)"
        }}
      >
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(-50%, -50%)" }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Vision Care</h1>
              <p className="text-blue-200 text-xs">Hệ thống quản lý phòng khám</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Hệ thống hoạt động ổn định
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Chào mừng trở lại<br />
            <span style={{ color: "rgba(255,255,255,0.7)" }}>với hệ thống của bạn</span>
          </h2>
          <p className="text-blue-100 text-base leading-relaxed max-w-sm">
            Quản lý lịch hẹn, bệnh nhân và dịch vụ phòng khám mắt một cách thông minh và hiệu quả.
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              {  text: "Đặt lịch khám trực tuyến 24/7" },
              {  text: "Quản lý hồ sơ bệnh nhân chuyên sâu" },
              {  text: "Kê đơn và theo dõi điều trị" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-100">
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-blue-200 text-xs">
          © 2025 Vision Care. Bảo lưu mọi quyền.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #0f4c81, #2196f3)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Vision Care</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
            <p className="mt-1 text-sm text-gray-500">Nhập thông tin tài khoản để tiếp tục</p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errorMsg}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Tên đăng nhập</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <Input
                        placeholder="Nhập tên đăng nhập (VD: KH001)"
                        className="pl-9 h-11 bg-white border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-1.5">
                    <FormLabel className="text-sm font-medium text-gray-700">Mật khẩu</FormLabel>
                    <Link href="/auth/forgot-password"
                      className="text-xs font-medium hover:underline"
                      style={{ color: "#2196f3" }}>
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-11 h-11 bg-white border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                style={{
                  background: isLoading
                    ? "#93c5fd"
                    : "linear-gradient(135deg, #0f4c81 0%, #2196f3 100%)",
                  boxShadow: isLoading ? "none" : "0 4px 15px rgba(33,150,243,0.4)"
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : "Đăng nhập"}
              </button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-50 px-3 text-gray-400">Chưa có tài khoản?</span>
            </div>
          </div>

          <Link
            href="/auth/register"
            className="flex items-center justify-center w-full h-11 rounded-xl border font-medium text-sm transition-all duration-200 hover:bg-gray-100 text-gray-700 border-gray-200 bg-white"
          >
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  )
}
