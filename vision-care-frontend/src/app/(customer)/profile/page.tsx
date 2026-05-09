"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  User, Phone, Mail, MapPin, Calendar,
  Fingerprint, Award, Save, Camera
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateKhachHang } from "@/hooks/useCustomer";
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
  const updateMutation = useUpdateKhachHang();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      hoTen: "", sdt: "", email: "", cccd: "", gioiTinh: "", ngaySinh: "", diaChi: ""
    }
  });

  // Reset form khi user data thay đổi
  useEffect(() => {
    if (user) {
      form.reset({
        hoTen: user.hoTen || "",
        sdt: user.sdt || "",
        email: user.email || "",
        cccd: user.cccd || "",
        gioiTinh: user.gioiTinh || "Nam",
        ngaySinh: user.ngaySinh || "",
        diaChi: user.diaChi || ""
      });
    }
  }, [user, form]);

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
          // updatedUser có kiểu KhachHangResponseDTO, ép về AuthUser
          const updated = updatedUser as unknown as AuthUser;
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

  if (loading) return <div className="flex justify-center p-8">Đang tải...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-none bg-slate-50/50">
          <CardContent className="pt-6 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-blue-100 border-4 border-white shadow-xl flex items-center justify-center text-4xl font-black text-blue-600 mx-auto">
                {user?.hoTen?.charAt(0) || "U"}
              </div>
              <button
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform active:scale-90"
                aria-label="Thay đổi ảnh đại diện"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{user?.hoTen}</h2>
            <p className="text-sm text-slate-500">{user?.sdt}</p>

            <div className="mt-8 p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-amber-500 mb-1">
                <Award className="w-5 h-5 fill-current" />
                <span className="font-bold text-lg">{user?.diemTichLuy || 0} điểm</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Hạng thành viên Bạc</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-amber-400 h-full w-[40%] rounded-full" />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Cần thêm 600 điểm để lên hạng Vàng</p>
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