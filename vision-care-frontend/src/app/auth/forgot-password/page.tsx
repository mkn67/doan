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
import { Card } from "@/components/ui/card"

const forgotPasswordSchema = z.object({
  username: z.string().min(1, { message: "Tên đăng nhập không được để trống" }),
  sdt: z.string().min(10, { message: "Số điện thoại phải có ít nhất 10 số" }),
  newPassword: z.string().min(8, { message: "Mật khẩu mới phải có ít nhất 8 ký tự" }),
  confirmPassword: z.string().min(8, { message: "Nhập lại mật khẩu mới phải có ít nhất 8 ký tự" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { username: "", sdt: "", newPassword: "", confirmPassword: "" },
  })

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/forgot-password", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username,
          sdt: values.sdt,
          newPassword: values.newPassword
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Lỗi hệ thống hoặc API không trả về JSON");
      }

      if (!response.ok) {
        throw new Error(data?.message || "Khôi phục mật khẩu thất bại");
      }

      toast.success(data?.message || "Mật khẩu của bạn đã được cập nhật thành công!");
      router.push("/auth/login");
    } catch (error) {
      console.error("Lỗi:", error)
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra!");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative bg-[url('https://thumbs.dreamstime.com/b/doctor-patient-ophthalmologist-interior-office-phoropter-ophthalmic-testing-device-machine-medical-care-flat-design-72681791.jpg')]">
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="w-full max-w-md space-y-8 rounded-xl bg-white/95 backdrop-blur-sm p-8 shadow-2xl relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Quên mật khẩu</h2>
          <p className="mt-2 text-sm text-gray-600">Nhập thông tin đăng ký để khôi phục mật khẩu</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên đăng nhập</FormLabel>
                <FormControl><Input placeholder="Nhập tên đăng nhập của bạn" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sdt" render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl><Input placeholder="Nhập số điện thoại đã đăng ký" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="newPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl><Input type="password" placeholder="Mật khẩu mới ít nhất 8 ký tự" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                <FormControl><Input type="password" placeholder="Nhập lại mật khẩu mới" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Khôi phục mật khẩu"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Quay lại{" "}
          <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
