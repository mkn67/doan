"use client"

import "@/app/globals.css"
import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const forgotPasswordSchema = z.object({
  username: z.string().min(1, { message: "Tên đăng nhập không được để trống" }),
  sdt: z.string().min(10, { message: "Số điện thoại phải có ít nhất 10 số" }),
  newPassword: z.string().min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" }),
  confirmPassword: z.string().min(6, { message: "Vui lòng nhập lại mật khẩu" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [step, setStep] = React.useState<"form" | "success">("form")

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { username: "", sdt: "", newPassword: "", confirmPassword: "" },
  })

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const response = await fetch(`${apiUrl}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username,
          sdt: values.sdt,
          newPassword: values.newPassword,
        }),
      })

      const text = await response.text()
      let data: any
      try { data = JSON.parse(text) } catch { throw new Error("Lỗi kết nối máy chủ") }

      if (!response.ok) throw new Error(data?.message || "Khôi phục mật khẩu thất bại")

      setStep("success")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra!")
    } finally {
      setIsLoading(false)
    }
  }

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f4c81 0%, #1a6bb5 40%, #2196f3 100%)" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

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

        <div className="relative z-10 space-y-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Khôi phục<br />
            <span style={{ color: "rgba(255,255,255,0.7)" }}>quyền truy cập của bạn</span>
          </h2>
          <p className="text-blue-100 text-base leading-relaxed max-w-sm">
            Nhập tên đăng nhập và số điện thoại đã đăng ký để xác minh danh tính và đặt lại mật khẩu mới.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { icon: "🔐", text: "Xác minh qua số điện thoại đăng ký" },
              { icon: "🔑", text: "Đặt mật khẩu mới ngay lập tức" },
              { icon: "✅", text: "Bảo mật thông tin tài khoản" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-100">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-blue-200 text-xs">
          © 2025 Vision Care. Bảo lưu mọi quyền.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3">
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

          {step === "success" ? (
            /* Success State */
            <div className="text-center space-y-5">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "linear-gradient(135deg, #dcfce7, #bbf7d0)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Đổi mật khẩu thành công!</h2>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Mật khẩu của bạn đã được cập nhật.<br />Vui lòng đăng nhập bằng mật khẩu mới.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full h-11 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #0f4c81 0%, #2196f3 100%)", boxShadow: "0 4px 15px rgba(33,150,243,0.4)" }}
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h2>
                <p className="mt-1 text-sm text-gray-500">Nhập thông tin để khôi phục tài khoản</p>
              </div>

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
                          <Input placeholder="Nhập tên đăng nhập của bạn" className="pl-9 h-11 bg-white border-gray-200 rounded-xl" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="sdt" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Số điện thoại đăng ký</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.02-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          </div>
                          <Input placeholder="Số điện thoại đã đăng ký" className="pl-9 h-11 bg-white border-gray-200 rounded-xl" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="newPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Mật khẩu mới</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </div>
                          <Input type={showNew ? "text" : "password"} placeholder="Mật khẩu mới (ít nhất 6 ký tự)" className="pl-9 pr-11 h-11 bg-white border-gray-200 rounded-xl" {...field} />
                          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <EyeIcon open={showNew} />
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <Input type={showConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu mới" className="pl-9 pr-11 h-11 bg-white border-gray-200 rounded-xl" {...field} />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <EyeIcon open={showConfirm} />
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                    style={{
                      background: isLoading ? "#93c5fd" : "linear-gradient(135deg, #0f4c81 0%, #2196f3 100%)",
                      boxShadow: isLoading ? "none" : "0 4px 15px rgba(33,150,243,0.4)"
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang xử lý...
                      </>
                    ) : "Khôi phục mật khẩu"}
                  </button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: "#2196f3" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
