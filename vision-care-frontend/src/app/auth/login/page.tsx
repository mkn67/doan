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
  password: z.string().min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" }),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("API không trả JSON (có thể sai URL hoặc lỗi server)");
      }

      if (!response.ok) throw new Error(data?.message || "Đăng nhập thất bại");

      // Lưu Token và Dữ liệu người dùng
      Cookies.set('token', data.token, { expires: 7, path: '/' });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      // =========================================================
      // 🛠️ LOGIC ĐIỀU HƯỚNG CHUẨN XÁC: PHÂN TÁCH EXTERNAL & INTERNAL
      // =========================================================
      const loaiTk = data.loaiTk?.toUpperCase().trim();
      const roles = data.roles || []; // Mảng chứa mã nhóm, VD: ["NH06"]

      if (loaiTk === 'EXTERNAL') {
        // 1. NHÁNH KHÁCH HÀNG: Về trang chủ
        router.push('/booking');
      } else {
        // 2. NHÁNH NHÂN VIÊN: Phải dựa vào mã nhóm (Role) để về đúng phòng ban
        const mainRole = roles.length > 0 ? roles[0] : '';

        switch (mainRole) {
          case 'NH04': // Quản trị viên
            router.push('/staff/dashboard');
            break;
          case 'NH06': // Lễ tân -> Vào thẳng trang lịch hẹn
            router.push('/staff/reception/appointments');
            break;
          case 'NH01': // Bác sĩ -> Vào thẳng phòng khám
            router.push('/staff/clinic/examinations');
            break;
          case 'NH03': // Thủ kho -> Vào thẳng kho
            router.push('/staff/inventory/products');
            break;
          case 'NH05': // Kỹ thuật viên kính -> Vào xưởng
            router.push('/staff/workshop/glasses');
            break;
          case 'NH02':
            router.push('/staff/cashier');
            break;
          default: // Nếu nhân viên chưa gán quyền cụ thể
            router.push('/staff/dashboard');
            break;
        }
      }
      // =========================================================

    } catch (error) {
      console.error("Lỗi:", error)
      alert(error instanceof Error ? error.message : "Có lỗi xảy ra!");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative bg-[url('https://thumbs.dreamstime.com/b/doctor-patient-ophthalmologist-interior-office-phoropter-ophthalmic-testing-device-machine-medical-care-flat-design-72681791.jpg')]">
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="w-full max-w-md space-y-8 rounded-xl bg-white/95 backdrop-blur-sm p-8 shadow-2xl relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Vision Care</h2>
          <p className="mt-2 text-sm text-gray-600">Đăng nhập hệ thống quản lý phòng khám</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên đăng nhập</FormLabel>
                <FormControl><Input placeholder="Nhập tài khoản (VD: NV001)" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Hoặc</span>
            </div>
          </div>
        </Form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link href="/auth/register" className="font-semibold text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  )
}