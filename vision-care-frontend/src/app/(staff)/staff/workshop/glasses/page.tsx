"use client";

import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { 
  Hammer, ClipboardCheck, 
  Loader2, Info 
} from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useRouter } from "next/navigation"; 
import { AxiosError } from "axios";

import { useCreateXuLyKinh } from "@/hooks/useWorkshop"; 
import { XuLyKinhRequestDTO } from "@/types/staff";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

// =========================================================
// 1. SCHEMA & TYPES
// =========================================================
interface JavaErrorResponse {
  message?: string;
}

const workshopSchema = z.object({
  maDon: z.string().min(1, "Vui lòng nhập mã đơn hàng"),
  maHoSo: z.string().optional(),
  maNsKyThuat: z.string().min(1, "Vui lòng nhập mã kỹ thuật viên"),
  ghiChu: z.string().optional(),
  ngayHenTra: z.string().min(1, "Vui lòng chọn ngày hẹn trả"),
});

type WorkshopFormValues = z.infer<typeof workshopSchema>;

// =========================================================
// 2. COMPONENT NỘI DUNG CHÍNH
// =========================================================
function WorkshopContent() {
  const mutation = useCreateXuLyKinh();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const isTechnician = user.roles?.[0] === "NH05" || user.maNhom === "NH05";
  const isAdmin = user.roles?.[0] === "NH04" || user.maNhom === "NH04";

  const [isMounted, setIsMounted] = useState(false);

  // Lấy mã hồ sơ từ URL (VD: ?maHoSo=HS001)
  const maDonFromUrl = searchParams.get("maDon") || "";
  const maHoSoFromUrl = searchParams.get("maHoSo") || "";

  const form = useForm<WorkshopFormValues>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      maDon: maDonFromUrl,
      maHoSo: maHoSoFromUrl,
      maNsKyThuat: "", 
      ngayHenTra: new Date().toISOString().split('T')[0],
      ghiChu: "",
    },
  });

  // Tự động lấy mã nhân sự từ localStorage
  useEffect(() => {
    // Dùng setTimeout để tránh lỗi setState đồng bộ trong Effect (cascading renders)
    const timer = setTimeout(() => setIsMounted(true), 0);
    
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          form.setValue("maNsKyThuat", user.username || ""); 
        } catch (e) {
          console.error("Lỗi lấy thông tin nhân sự", e);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [form]);

  const onSubmit: SubmitHandler<WorkshopFormValues> = (values) => {
    const payload: XuLyKinhRequestDTO = {
      ...values,
      ngayHenTra: `${values.ngayHenTra}T17:00:00`, // Format LocalDateTime
      thongSoKinh: {}, // Có thể mở rộng thêm object thông số nếu cần
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        alert("✅ Đã cập nhật trạng thái xử lý kính!");
        router.push("/staff/dashboard"); // Xong thì về dashboard hoặc danh sách chờ
      },
      onError: (err) => {
        const axiosError = err as AxiosError<JavaErrorResponse>;
        alert("Lỗi: " + (axiosError.response?.data?.message || "Không thể cập nhật"));
      }
    });
  };

  if (!isMounted) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl shadow-sm">
          <Hammer className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Xưởng mài lắp kính</h1>
          <p className="text-slate-500 text-sm font-medium">Ghi nhận công việc gia công tròng kính & gọng</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-800">Thông tin gia công</CardTitle>
              <CardDescription>Cập nhật kết quả sau khi hoàn thiện sản phẩm</CardDescription>
            </div> 
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <FormField control={form.control} name="maDon" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Mã đơn hàng</FormLabel>
                    <FormControl>
                      <Input placeholder="DH..." {...field} className="bg-slate-50 focus:bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="maHoSo" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Mã hồ sơ (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="HS..." {...field} className="bg-slate-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField control={form.control} name="maNsKyThuat" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Kỹ thuật viên</FormLabel>
                    <FormControl>
                      <Input readOnly className="bg-slate-100 font-medium text-blue-600" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="ngayHenTra" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Ngày hẹn trả</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="ghiChu" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-slate-700">Ghi chú kỹ thuật</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="VD: Tròng kính chống ánh sáng xanh, lắp gọng khoan..." 
                      className="min-h-[120px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex flex-col gap-3 pt-4">
                { (isTechnician || isAdmin) ? (
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending} 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-md font-bold shadow-md transition-all active:scale-95"
                  >
                    {mutation.isPending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang cập nhật...</>
                    ) : (
                      <><ClipboardCheck className="mr-2 h-5 w-5" /> Xác nhận hoàn tất gia công</>
                    )}
                  </Button>
                ) : (
                  <Button disabled variant="outline" className="w-full h-12 text-md font-bold">
                    Chỉ xem (Không có quyền gia công)
                  </Button>
                )}
                <p className="text-[11px] text-center text-slate-400 flex items-center justify-center">
                  <Info className="w-3 h-3 mr-1" /> Hệ thống sẽ tự động thông báo cho khách hàng qua Zalo/SMS (nếu có)
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// =========================================================
// 3. MAIN PAGE WRAPPER (Suspense)
// =========================================================
export default function WorkshopGlassesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 font-medium">Đang tải dữ liệu xưởng...</p>
        </div>
      </div>
    }>
      <WorkshopContent />
    </Suspense>
  );
}