"use client"

import "@/app/globals.css"
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

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

// 1. Định nghĩa luật bằng Zod (Thêm luật regex số điện thoại và check khớp mật khẩu)
const registerSchema = z.object({
  hoTen: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự" }),
  sdt: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, { message: "Số điện thoại không hợp lệ" }),
  username: z.string().min(4, { message: "Tên đăng nhập tối thiểu 4 ký tự" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  // Tuyệt chiêu của Zod: Bắt lỗi chéo giữa 2 trường
  message: "Mật khẩu xác nhận không khớp!",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  // 2. Khởi tạo form
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      hoTen: "",
      sdt: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  })

  // 3. Xử lý Submit (Hàng Real)
  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true)
    try {
      // Gọi API sang Java Backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Chỗ này map dữ liệu từ Form gửi sang Backend (TaiKhoanRequestDTO)
          username: values.username,
          password: values.password,
          // Nếu Backend của ông cần thêm thông tin như Họ tên, SĐT thì truyền thêm vào đây:
          // hoTen: values.hoTen,
          // sdt: values.sdt,
        }),
      });

      const data = await response.json();

      // Nếu Backend quăng lỗi (ví dụ: Trùng username)
      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      // Đăng ký thành công -> Báo xanh & Chuyển sang trang Login
      toast.success("Đăng ký thành công!", {
        description: "Tài khoản của bạn đã được tạo, vui lòng đăng nhập.",
      })
      router.push('/auth/login')
    } catch (error) {
      // Hứng lỗi báo đỏ
      toast.error("Đăng ký thất bại", {
        description: error instanceof Error ? error.message : "Có lỗi xảy ra từ máy chủ.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative bg-[url('https://thumbs.dreamstime.com/b/doctor-patient-ophthalmologist-interior-office-phoropter-ophthalmic-testing-device-machine-medical-care-flat-design-72681791.jpg')]">
      {/* Lớp phủ đen mờ */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Form container với hiệu ứng kính mờ */}
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white/95 backdrop-blur-sm p-8 shadow-2xl relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Tạo tài khoản
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Điền thông tin để đăng ký thành viên
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Họ tên */}
            <FormField
              control={form.control}
              name="hoTen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập họ và tên..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Số điện thoại */}
            <FormField
              control={form.control}
              name="sdt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="0987xxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tên đăng nhập */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên đăng nhập" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mật khẩu */}
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

            {/* Xác nhận Mật khẩu */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-gray-600 mt-4">
          Đã có tài khoản?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Đăng nhập tại đây
          </Link>
        </div>
      </div>
    </div>
  )
}