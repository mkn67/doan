"use client"

import "@/app/globals.css"
import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link" // THÊM IMPORT LINK
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Cookies from 'js-cookie'

// Import UI Components của shadcn
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form" 
import { Input } from "@/components/ui/input"

// 1. Định nghĩa "Luật" kiểm tra dữ liệu bằng Zod
const loginSchema = z.object({
  username: z.string().min(1, { message: "Tên đăng nhập không được để trống" }),
  password: z.string().min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" }),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  // 2. Khởi tạo form với luật Zod ở trên
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  // 3. Xử lý khi bấm Submit
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    try {
      console.log("URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Response text:", text);
        throw new Error("API không trả JSON (có thể sai URL hoặc lỗi server)");
      }

      if (!response.ok) throw new Error(data?.message || "Đăng nhập thất bại");

      Cookies.set('token', data.token, { expires: 7, path: '/' });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      const userRole = data.loaiTk?.toUpperCase().trim();

      // 3. Điều hướng dựa trên cây thư mục (Lưu ý: Next.js App Router không bao gồm (group) trong URL)
      switch (userRole) {
        case 'ADMIN':
          router.push('/staff/admin');
          break;
        case 'KHACH_HANG':
          router.push('/');
          break;
        case 'RECEPTIONIST':
          router.push('/staff/reception');
          break;
        default:
          router.push('/staff/dashboard');
          break;
      }
    } catch (error) {
      console.error("Lỗi:", error)
      alert(error instanceof Error ? error.message : "Có lỗi xảy ra!");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative bg-[url('https://thumbs.dreamstime.com/b/doctor-patient-ophthalmologist-interior-office-phoropter-ophthalmic-testing-device-machine-medical-care-flat-design-72681791.jpg')]"
    >
      {/* Lớp phủ đen mờ để làm nổi bật form */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* THAY ĐỔI 2: Thêm background trắng hơi trong suốt và hiệu ứng blur (kính mờ) cho Form */}
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white/95 backdrop-blur-sm p-8 shadow-2xl relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Vision Care
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Đăng nhập hệ thống quản lý phòng khám
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tài khoản (VD: NV001)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>

        {/* THAY ĐỔI 3: Thêm dòng điều hướng sang trang Đăng ký */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link href="/auth/register" className="font-semibold text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  )
}