"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  User, Phone, Mail, MapPin, Calendar,
  Fingerprint, Save, Camera
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateKhachHang, useKhachHang } from "@/hooks/useCustomer";
import { useAuth, AuthUser } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// Schema validation
const profileSchema = z.object({
  hoTen: z.string().min(2, "Họ tên quá ngắn"),
  sdt: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  cccd: z.string().optional(),
  gioiTinh: z.string().optional(),
  ngaySinh: z.string().optional(),
  diaChi: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { user, setUser, loading } = useAuth();
  const maKh = user?.maKh || "";
  const { data: customerDetails, isLoading: customerLoading } = useKhachHang(maKh);
  const updateMutation = useUpdateKhachHang();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      hoTen: "", sdt: "", email: "", cccd: "", gioiTinh: "", ngaySinh: "", diaChi: ""
    }
  });

  // Reset form khi customerDetails hoặc user thay đổi
  useEffect(() => {
    const details = customerDetails || user;
    if (details) {
      form.reset({
        hoTen: details.hoTen || "",
        sdt: details.sdt || "",
        email: details.email || "",
        cccd: details.cccd || "",
        gioiTinh: details.gioiTinh || "Nam",
        ngaySinh: details.ngaySinh || "",
        diaChi: details.diaChi || ""
      });
    }
  }, [customerDetails, user, form]);

  function onSubmit(values: ProfileFormValues) {
    if (!user?.maKh) {
      alert("Không tìm thấy mã khách hàng!");
      return;
    }

    updateMutation.mutate(
      { maKh: user.maKh, data: values },
      {
        onSuccess: (updatedUser) => {
          alert("✅ Cập nhật thông tin thành công!");
          // Trộn với user hiện tại để giữ token và loaiTk
          const updated = {
            ...user,
            ...updatedUser
          } as unknown as AuthUser;
          localStorage.setItem("user", JSON.stringify(updated));
          setUser(updated);
          setIsEditing(false);
        },
        onError: () => {
          alert("❌ Có lỗi xảy ra khi cập nhật.");
        }
      }
    );
  }

  if (loading || customerLoading) return <div className="flex justify-center p-8">Đang tải...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-none bg-slate-50/50">
          <CardContent className="pt-6 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-blue-100 border-4 border-white shadow-xl flex items-center justify-center text-4xl font-black text-blue-600 mx-auto">
                {(customerDetails?.hoTen || user?.hoTen)?.charAt(0) || "U"}
              </div>
              <button
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform active:scale-90"
                aria-label="Thay đổi ảnh đại diện"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{customerDetails?.hoTen || user?.hoTen || "Chưa cập nhật"}</h2>
            <p className="text-sm text-slate-500">{customerDetails?.sdt || user?.sdt}</p>
            <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2 text-left max-w-[240px] mx-auto">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">⭐ Điểm tích lũy:</span>
                <span className="font-bold text-amber-600">{customerDetails?.diemTichLuy ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">💰 Tổng chi tiêu:</span>
                <span className="font-bold text-emerald-600">{(customerDetails?.tongChiTieu ?? 0).toLocaleString("vi-VN")}₫</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="text-xl">Hồ sơ cá nhân</CardTitle>
              <CardDescription>Quản lý thông tin để nhận được sự hỗ trợ tốt nhất.</CardDescription>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
              className={!isEditing ? "bg-blue-600" : ""}
            >
              {isEditing ? "Hủy" : "Chỉnh sửa"}
            </Button>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="hoTen" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><User className="w-4 h-4" /> Họ và tên</FormLabel>
                      <FormControl><Input disabled={!isEditing} {...field} className="bg-slate-50/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="sdt" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Phone className="w-4 h-4" /> Số điện thoại</FormLabel>
                      <FormControl><Input disabled={true} {...field} className="bg-slate-100 opacity-70" /></FormControl>
                      <FormDescription className="text-[10px]">Dùng làm tên đăng nhập (Không thể đổi)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</FormLabel>
                      <FormControl><Input disabled={!isEditing} placeholder="example@gmail.com" {...field} className="bg-slate-50/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="cccd" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Fingerprint className="w-4 h-4" /> Số CCCD</FormLabel>
                      <FormControl><Input disabled={!isEditing} {...field} className="bg-slate-50/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="ngaySinh" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày sinh</FormLabel>
                      <FormControl><Input type="date" disabled={!isEditing} {...field} className="bg-slate-50/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="gioiTinh" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới tính</FormLabel>
                      <Select disabled={!isEditing} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-50/50"><SelectValue placeholder="Chọn giới tính" /></SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="Nam">Nam</SelectItem>
                          <SelectItem value="Nữ">Nữ</SelectItem>
                          <SelectItem value="Khác">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="diaChi" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Địa chỉ thường trú</FormLabel>
                    <FormControl><Input disabled={!isEditing} {...field} className="bg-slate-50/50" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[150px]" disabled={updateMutation.isPending}>
                      <Save className="w-4 h-4 mr-2" /> {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}